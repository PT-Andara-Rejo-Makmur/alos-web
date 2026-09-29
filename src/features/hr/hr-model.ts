import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";

export type HrSourceState = "loading" | "unavailable" | "error" | "connected-empty" | "connected-data";

export function hasHrContext(session: SessionProjection | null | undefined): boolean {
  const resolution = resolveWorkspaceDomain(session);
  return resolution.valid && resolution.domain === "HR_GA";
}

export function activeHrWorkspaceKey(session: SessionProjection | null | undefined): string | null {
  if (!hasHrContext(session) || !session?.principal || !("actor" in session.principal)) return null;
  return session.principal.active_workspace?.workspace.workspace_key ?? null;
}

/**
 * Stage 3 canonical UI treats HR & GA as one Backend-recognized business domain.
 * NEEDS CONTRACT / NEEDS DECISION: canonical HR-GA workspace metadata can replace
 * the current HR/HR_GA/HRGA compatibility vocabulary in a later contract stage.
 */
export function hasGaScope(session: SessionProjection | null | undefined): boolean {
  return hasHrContext(session);
}

export function hrValue(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}
