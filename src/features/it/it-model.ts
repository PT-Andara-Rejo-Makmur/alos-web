import type { SessionProjection } from "@/features/session";
import { resolveWorkspaceDomain } from "@/features/session";

/** IT authority is derived only from the Backend-selected workspace projection. */
export function hasItContext(
  session: SessionProjection | null | undefined,
  requestedWorkspaceKey?: string | null,
): boolean {
  const resolution = resolveWorkspaceDomain(session, requestedWorkspaceKey);
  return resolution.valid && resolution.domain === "IT";
}

export function activeItWorkspaceKey(session: SessionProjection | null | undefined): string | null {
  const principal = session?.principal;
  if (!principal || !("actor" in principal) || !principal.active_workspace?.active) return null;
  return principal.active_workspace.workspace.workspace_key;
}

export function identityRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    EXECUTIVE: "Eksekutif",
    WORKSPACE_LEAD: "Pimpinan Ruang Kerja",
    WORKSPACE_MEMBER: "Anggota Ruang Kerja",
    BUSINESS_REVIEWER: "Peninjau Bisnis",
    IT_ADMIN: "Administrator IT",
    AI_ADMIN: "Administrator ARA",
    TECHNICAL_REVIEWER: "Peninjau Teknis",
    QA_ASSURANCE: "Penjamin Mutu",
  };
  return labels[role] ?? "Belum Dinilai";
}
