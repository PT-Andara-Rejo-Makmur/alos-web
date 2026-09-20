import { authenticatedApiRequest, ApiRequestError } from "@/lib/api";
import type {
  ContextItem,
  ContextProjection,
  DataClassification,
  EvidenceRef,
} from "@/lib/contracts";

const CONTEXT_OPTIONS_PATH = "/api/v1/genesis/context-options";

export type AraContextLifecycleState =
  | "LOADING"
  | "ACTIVE"
  | "DENIED"
  | "NEEDS_INFO"
  | "UNAVAILABLE";

export interface AraActiveContextProjection {
  readonly state: AraContextLifecycleState;
  readonly contextId?: string;
  readonly tenantId?: string;
  readonly workspaceId?: string;
  readonly actorId?: string;
  readonly goal?: string;
  readonly capabilityId?: string;
  readonly dataClassification?: DataClassification;
  readonly scopeRefs?: readonly string[];
  readonly evidenceRefs?: readonly EvidenceRef[];
  readonly items?: readonly ContextItem[];
  readonly needsInfoReason?: string;
  readonly denialReason?: string;
  readonly correlationId?: string | null;
}

export interface AraContextAdapter {
  loadContext(signal?: AbortSignal): Promise<AraActiveContextProjection>;
}

export const backendAraContextAdapter: AraContextAdapter = {
  async loadContext(signal?: AbortSignal): Promise<AraActiveContextProjection> {
    try {
      const contextData = await authenticatedApiRequest<ContextProjection>(
        CONTEXT_OPTIONS_PATH,
        { signal, cache: "no-store" },
      );

      const rawStatus = contextData.status?.toUpperCase();

      if (rawStatus === "DENIED" || rawStatus === "FORBIDDEN") {
        return {
          state: "DENIED",
          contextId: contextData.context_id,
          tenantId: contextData.tenant_id,
          workspaceId: contextData.workspace_id,
          denialReason:
            contextData.denial_reason ??
            "Akses konteks ini ditolak oleh kebijakan otorisasi ALOS Backend.",
          correlationId: contextData.correlation_id,
        };
      }

      if (rawStatus === "NEEDS_INFO" || rawStatus === "NEEDS_INFORMATION") {
        return {
          state: "NEEDS_INFO",
          contextId: contextData.context_id,
          tenantId: contextData.tenant_id,
          workspaceId: contextData.workspace_id,
          goal: contextData.goal,
          needsInfoReason:
            contextData.needs_info_reason ??
            "ALOS Backend membutuhkan informasi scope atau parameter tambahan sebelum konteks dapat diaktifkan.",
          correlationId: contextData.correlation_id,
        };
      }

      if (rawStatus !== "ACTIVE") {
        return {
          state: "UNAVAILABLE",
          contextId: contextData.context_id,
          tenantId: contextData.tenant_id,
          workspaceId: contextData.workspace_id,
          correlationId: contextData.correlation_id,
        };
      }

      return {
        state: "ACTIVE",
        contextId: contextData.context_id,
        tenantId: contextData.tenant_id,
        workspaceId: contextData.workspace_id,
        actorId: contextData.actor_id,
        goal: contextData.goal,
        capabilityId: contextData.capability_id,
        dataClassification: contextData.data_classification,
        scopeRefs: contextData.scope_refs ?? [],
        evidenceRefs: contextData.evidence_refs ?? [],
        items: contextData.items ?? [],
        correlationId: contextData.correlation_id,
      };
    } catch (caught: unknown) {
      if (caught instanceof ApiRequestError && caught.status === 403) {
        return {
          state: "DENIED",
          denialReason:
            caught.detail ||
            "Principal tidak memiliki izin yang cukup untuk mengakses konteks aktif.",
          correlationId: caught.correlationId,
        };
      }
      return {
        state: "UNAVAILABLE",
        correlationId:
          caught instanceof ApiRequestError ? caught.correlationId : null,
      };
    }
  },
};
