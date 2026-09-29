import { resolveWorkspaceDomain } from "@/features/session";
import type { SessionProjection } from "@/features/session";

/** Sales access is granted only by the Backend-selected active workspace. */
export function hasSalesContext(session: SessionProjection): boolean {
  const resolution = resolveWorkspaceDomain(session);
  return resolution.valid && resolution.domain === "SALES";
}

export function activeSalesWorkspaceKey(session: SessionProjection): string | null {
  return hasSalesContext(session) && session.principal && "actor" in session.principal
    ? session.principal.active_workspace?.workspace.workspace_key ?? null
    : null;
}
