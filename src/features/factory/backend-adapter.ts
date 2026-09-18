import { apiRequest } from "@/lib/api";
import type { FactoryAnalyzeResponse } from "@/lib/contracts";

import type {
  CapabilityDraftProjection,
  ExistingCapabilityProjection,
  FactoryAnalysisProjection,
  FactoryBackendAdapter,
  FactoryDecision,
  FactoryRequirementCommand,
} from "./models";

const FACTORY_BACKEND_PATH = "/api/v1/genesis/factory/analyze";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Backend Factory response harus berupa object.");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`Backend Factory response tidak memiliki ${field}.`);
  }
  return value;
}

function strings(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

function capabilityReference(value: unknown): ExistingCapabilityProjection {
  const item = record(value);
  return {
    capabilityId: text(item.capability_id, "capability_id"),
    version: text(item.version, "version"),
    name: text(item.name, "name"),
    capabilityType: text(item.capability_type, "capability_type"),
    purpose: text(item.purpose, "purpose"),
  };
}

function capabilityDraft(
  payload: Record<string, unknown>,
  correlationId: string,
): CapabilityDraftProjection | null {
  if (payload.capability_draft === null || payload.capability_draft === undefined) return null;
  const canonical = record(payload.capability_draft);
  const lifecycleState = text(canonical.lifecycle_state, "lifecycle_state");
  if (lifecycleState !== "DRAFT") {
    throw new TypeError("Frontend hanya menerima Factory proposal dengan lifecycle DRAFT.");
  }
  if (text(canonical.correlation_id, "capability_draft.correlation_id") !== correlationId) {
    throw new TypeError("CapabilityDraft harus mempertahankan correlation_id Backend.");
  }
  const registryResult = record(payload.registry_result);
  if (text(registryResult.state, "registry_result.state") !== "DRAFT") {
    throw new TypeError("Backend Registry result untuk CREATE harus tetap DRAFT.");
  }
  const identifier = text(canonical.capability_id, "capability_id");
  const version = text(canonical.version, "version");
  const registeredReferences = Array.isArray(registryResult.registered_refs)
    ? registryResult.registered_refs.map(record)
    : [];
  const capabilityRegistered = registeredReferences.some(
    (reference) =>
      reference.subject_type === "CAPABILITY" &&
      reference.identifier === identifier &&
      reference.version === version &&
      reference.state === "DRAFT",
  );
  if (!capabilityRegistered) {
    throw new TypeError("Backend Registry result tidak mereferensikan CapabilityDraft yang diterima.");
  }
  return {
    identifier,
    version,
    purpose: text(canonical.purpose, "purpose"),
    capabilityType: text(canonical.capability_type, "capability_type"),
    scope: strings(canonical.scope_refs),
    risk: text(canonical.risk_level, "risk_level"),
    tools: strings(canonical.tool_ids),
    permissions: strings(canonical.permission_refs),
    lifecycleState,
    readiness: "REGISTERED_AS_DRAFT",
  };
}

export function projectFactoryResponse(value: unknown): FactoryAnalysisProjection {
  const payload = record(value);
  const correlationId = text(payload.correlation_id, "correlation_id");
  const decision = text(payload.decision, "decision") as FactoryDecision;
  if (decision !== "REUSE" && decision !== "CREATE") {
    throw new TypeError("Backend Factory decision harus REUSE atau CREATE.");
  }
  const references = Array.isArray(payload.existing_capability_refs)
    ? payload.existing_capability_refs.map(capabilityReference)
    : [];
  const draft = capabilityDraft(payload, correlationId);
  if (decision === "REUSE" && (references.length === 0 || draft !== null)) {
    throw new TypeError("REUSE harus memiliki existing capability reference tanpa draft baru.");
  }
  if (decision === "REUSE" && payload.registry_result !== null) {
    throw new TypeError("REUSE tidak boleh memiliki Backend Registry result baru.");
  }
  if (decision === "REUSE" && payload.agent_draft !== null) {
    throw new TypeError("REUSE tidak boleh memiliki AgentDraft baru.");
  }
  if (decision === "CREATE" && references.length !== 0) {
    throw new TypeError("CREATE tidak boleh diklaim sebagai existing capability REUSE.");
  }
  if (decision === "CREATE" && draft === null) {
    throw new TypeError("CREATE harus memiliki CapabilityDraft.");
  }
  return {
    decision,
    reason: text(payload.reason, "reason"),
    correlationId,
    existingCapabilities: references,
    draft,
    registryState: decision === "CREATE" ? "DRAFT" : null,
  };
}

export const backendFactoryAdapter: FactoryBackendAdapter = {
  async analyze(command: FactoryRequirementCommand): Promise<FactoryAnalysisProjection> {
    const response = await apiRequest<FactoryAnalyzeResponse>(FACTORY_BACKEND_PATH, {
      method: "POST",
      body: command,
    });
    return projectFactoryResponse(response);
  },
};
