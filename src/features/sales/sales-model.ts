import type { SessionProjection } from "@/features/session";

/** Sales access is granted only by the Backend-selected active workspace. */
export function hasSalesContext(session: SessionProjection): boolean {
  const principal = session.principal;
  if (!session.authenticated || !principal || !("actor" in principal)) return false;

  const workspace = principal.active_workspace?.workspace;
  return workspace?.workspace_type === "BUSINESS" && workspace.division_code === "SALES";
}

export function activeSalesWorkspaceKey(session: SessionProjection): string | null {
  return hasSalesContext(session) && session.principal && "actor" in session.principal
    ? session.principal.active_workspace?.workspace.workspace_key ?? null
    : null;
}
