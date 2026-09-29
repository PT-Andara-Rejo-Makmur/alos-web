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

/** GA is a governed scope of the HR/GA workspace, not a URL or role decision. */
export function hasGaScope(session: SessionProjection | null | undefined): boolean {
  if (!hasHrContext(session) || !session?.principal || !("actor" in session.principal)) return false;
  const divisionCode = session.principal.active_workspace?.workspace.division_code?.toUpperCase();
  return divisionCode === "HR_GA" || divisionCode === "HRGA";
}

export function hrValue(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}
