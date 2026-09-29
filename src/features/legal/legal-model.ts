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

export function legalValue(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}
