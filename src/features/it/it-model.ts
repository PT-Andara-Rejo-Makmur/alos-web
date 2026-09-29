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

export const assignableRoleOptions = [
  { value: "EXECUTIVE", label: "Direktur" },
  { value: "DIVISION_LEAD", label: "Manajer / Kepala Divisi" },
  { value: "DIVISION_MEMBER", label: "Anggota Divisi" },
  { value: "IT_ADMIN", label: "Administrator IT" },
] as const;

export function identityRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    EXECUTIVE: "Direktur",
    DIVISION_LEAD: "Manajer / Kepala Divisi",
    DIVISION_MEMBER: "Anggota Divisi",
    IT_ADMIN: "Administrator IT",
  };
  return labels[role] ?? "Belum Dinilai";
}
