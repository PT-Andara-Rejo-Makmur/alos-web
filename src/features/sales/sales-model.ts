import type { SessionProjection } from "@/features/session";

/** Sales access is granted only by the Backend-selected active workspace. */
export function hasSalesContext(session: SessionProjection): boolean {
  const principal = session.principal;
  if (!session.authenticated || !principal || !("actor" in principal)) return false;

  const activeWs = principal.active_workspace;
  if (!principal.actor.active || !activeWs?.active) return false;

  const workspace = activeWs.workspace;
  return Boolean(
    workspace?.active &&
      workspace.workspace_type === "BUSINESS" &&
      workspace.division_code === "SALES",
  );
}

export function activeSalesWorkspaceKey(session: SessionProjection): string | null {
  return hasSalesContext(session) && session.principal && "actor" in session.principal
    ? session.principal.active_workspace?.workspace.workspace_key ?? null
    : null;
}
