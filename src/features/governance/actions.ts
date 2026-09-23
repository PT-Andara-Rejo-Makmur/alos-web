import { apiRequest } from "@/lib/api";
import type { AgentDraftPayload, AgentDraftResult } from "@/features/agents/registry";
import type { ReleaseRequest, ReviewDecision, ReviewGate } from "./release-governance";

export type NormalizedRuntimeStatus = "SUCCESS" | "FAILED" | "BLOCKED";

/**
 * Reusable runtime status mapper ensuring consistency between FastAPI backend
 * ("SUCCEEDED" | "FAILED" | "BLOCKED") and UI semantic display tokens.
 */
export function mapRuntimeStatus(status?: string | null): NormalizedRuntimeStatus {
  if (!status) return "BLOCKED";
  const normalized = status.trim().toUpperCase();
  if (normalized === "SUCCEEDED" || normalized === "SUCCESS" || normalized === "PASSED") {
    return "SUCCESS";
  }
  if (normalized === "FAILED" || normalized === "ERROR") {
    return "FAILED";
  }
  return "BLOCKED";
}

export async function killAgent(changeRequestId: string, reason: string): Promise<ReleaseRequest> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error("Alasan aktivasi Kill Switch wajib diisi.");
  }
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/kill-switch`, {
    method: "POST",
    body: JSON.stringify({ reason: trimmed }),
  });
}

export async function clearKillSwitch(changeRequestId: string, reason: string): Promise<ReleaseRequest> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error("Alasan pemulihan Kill Switch wajib diisi.");
  }
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/clear-kill-switch`, {
    method: "POST",
    body: JSON.stringify({ reason: trimmed }),
  });
}

export async function suspendAgent(changeRequestId: string, reason: string): Promise<ReleaseRequest> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error("Alasan penangguhan agen wajib diisi.");
  }
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/suspend`, {
    method: "POST",
    body: JSON.stringify({ reason: trimmed }),
  });
}

export async function rollbackAgent(
  changeRequestId: string,
  targetSemanticVersion: string,
  reason: string,
): Promise<ReleaseRequest> {
  const trimmedReason = reason.trim();
  const trimmedVersion = targetSemanticVersion.trim();
  if (!trimmedVersion) {
    throw new Error("Versi target rollback wajib ditentukan.");
  }
  if (!trimmedReason) {
    throw new Error("Alasan rollback wajib diisi.");
  }
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/rollback`, {
    method: "POST",
    body: JSON.stringify({
      target_semantic_version: trimmedVersion,
      reason: trimmedReason,
    }),
  });
}

export async function createAgentDraft(payload: AgentDraftPayload): Promise<AgentDraftResult> {
  return await apiRequest<AgentDraftResult>("/api/v1/agents/drafts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAgentDraft(agentKey: string, payload: AgentDraftPayload): Promise<AgentDraftResult> {
  return await apiRequest<AgentDraftResult>(`/api/v1/agents/${agentKey}/draft`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAgentDraft(agentKey: string): Promise<void> {
  return await apiRequest<void>(`/api/v1/agents/${agentKey}/draft`, {
    method: "DELETE",
  });
}

export async function retireAgent(agentKey: string): Promise<AgentDraftResult> {
  return await apiRequest<AgentDraftResult>(`/api/v1/agents/${agentKey}/retire`, {
    method: "POST",
  });
}

export async function approvePermission(permissionPolicyId: string): Promise<unknown> {
  return await apiRequest<unknown>(`/api/v1/permission-policies/${permissionPolicyId}/approve`, {
    method: "POST",
  });
}

export async function submitReleaseForReview(changeRequestId: string): Promise<ReleaseRequest> {
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/submit-review`, {
    method: "POST",
  });
}

export async function submitReleaseReview(
  changeRequestId: string,
  gate: ReviewGate,
  decision: ReviewDecision,
  notes: string,
): Promise<ReleaseRequest> {
  const trimmedNotes = notes.trim();
  if (!trimmedNotes) {
    throw new Error("Catatan evaluasi review wajib diisi.");
  }
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      gate,
      decision,
      notes: trimmedNotes,
    }),
  });
}

export async function approveReleaseRequest(changeRequestId: string): Promise<ReleaseRequest> {
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/approve`, {
    method: "POST",
  });
}

export async function publishApprovedRelease(changeRequestId: string): Promise<ReleaseRequest> {
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/release`, {
    method: "POST",
  });
}

export async function activateApprovedRelease(changeRequestId: string): Promise<ReleaseRequest> {
  return await apiRequest<ReleaseRequest>(`/api/v1/release-requests/${changeRequestId}/activate`, {
    method: "POST",
  });
}
