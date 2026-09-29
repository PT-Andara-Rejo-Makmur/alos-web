import { resolveWorkspaceDomain } from "@/features/session";
import type { SessionProjection } from "@/features/session";

/** Property access is derived from the Backend-selected workspace metadata. */
export function hasPropertyContext(session: SessionProjection): boolean {
  const resolution = resolveWorkspaceDomain(session);
  return resolution.valid && resolution.domain === "PROPERTY";
}

export function activePropertyWorkspaceKey(session: SessionProjection): string | null {
  return hasPropertyContext(session) && session.principal && "actor" in session.principal
    ? session.principal.active_workspace?.workspace.workspace_key ?? null
    : null;
}
