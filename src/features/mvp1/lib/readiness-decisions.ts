import { apiRequest } from "@/lib/api";

export type ReadinessDecisionType = "PENDING" | "GO" | "HOLD" | "NO_GO";
export type TechnicalReadinessLevel = "PASS" | "HOLD" | "BLOCKED" | "FAIL";

export type ReleaseDecisionRequest = {
  workspace_id?: string | null;
  decision: ReadinessDecisionType;
  commit_sha: string;
  release_version: string;
  technical_readiness: TechnicalReadinessLevel;
  uat_report_reference?: string | null;
  restore_evidence_reference?: string | null;
  known_limitations?: string[];
  hardening_backlog?: string[];
  notes?: string;
};

export type ReleaseDecisionRecord = {
  decision_id: string;
  organization_id?: string;
  workspace_id: string | null;
  decision: ReadinessDecisionType;
  decided_by_user_id: string | null;
  decided_at: string | null;
  commit_sha: string;
  release_version: string;
  technical_readiness: TechnicalReadinessLevel;
  uat_report_reference: string | null;
  restore_evidence_reference: string | null;
  known_limitations: string[];
  hardening_backlog: string[];
  notes: string;
  created_at: string;
};

export async function listReleaseDecisions(): Promise<ReleaseDecisionRecord[]> {
  return await apiRequest<ReleaseDecisionRecord[]>("/api/v1/readiness/decisions");
}

export async function recordReleaseDecision(payload: ReleaseDecisionRequest): Promise<ReleaseDecisionRecord> {
  const commitSha = payload.commit_sha.trim();
  if (commitSha.length < 7) {
    throw new Error("Commit SHA minimal 7 karakter.");
  }
  if (!payload.release_version.trim()) {
    throw new Error("Release version wajib ditentukan.");
  }
  return await apiRequest<ReleaseDecisionRecord>("/api/v1/readiness/decisions", {
    method: "POST",
    body: JSON.stringify({
      workspace_id: payload.workspace_id ?? null,
      decision: payload.decision,
      commit_sha: commitSha,
      release_version: payload.release_version.trim(),
      technical_readiness: payload.technical_readiness,
      uat_report_reference: payload.uat_report_reference ?? null,
      restore_evidence_reference: payload.restore_evidence_reference ?? null,
      known_limitations: payload.known_limitations ?? [],
      hardening_backlog: payload.hardening_backlog ?? [],
      notes: payload.notes ?? "",
    }),
  });
}

export function canRecordReadinessDecision(roles: string[]): boolean {
  return roles.includes("DIRECTOR");
}



