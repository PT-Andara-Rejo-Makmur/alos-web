import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";

export type LegalSourceState = "loading" | "unavailable" | "error" | "connected-empty" | "connected-data";

export function hasLegalContext(session: SessionProjection | null | undefined): boolean {
  const resolution = resolveWorkspaceDomain(session);
  return resolution.valid && resolution.domain === "LEGAL";
}

export function activeLegalWorkspaceKey(session: SessionProjection | null | undefined): string | null {
  if (!hasLegalContext(session) || !session?.principal || !("actor" in session.principal)) return null;
  return session.principal.active_workspace?.workspace.workspace_key ?? null;
}

export function legalStateLabel(value: string | null | undefined): string {
  if (!value) return "Belum Dinilai";
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    APPROVED: "Disetujui",
    DRAFT: "Draf",
    EXPIRED: "Berakhir",
    IN_REVIEW: "Dalam Review",
    REJECTED: "Ditolak",
    RETIRED: "Diarsipkan",
  };
  return labels[value] ?? "Belum Dinilai";
}

export function legalValue(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}
