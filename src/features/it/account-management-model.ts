import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";

function principalOf(session: SessionProjection | null): AuthenticatedPrincipalProjection | null {
  const principal = session?.principal;
  return principal && "actor" in principal ? principal : null;
}

/** UI gate derived from the Backend-selected membership; it grants no authority. */
export function hasItAccountManagementAccess(session: SessionProjection | null, requestedWorkspaceKey?: string): boolean {
  const principal = principalOf(session);
  const membership = principal?.active_workspace;
  const resolution = resolveWorkspaceDomain(session, requestedWorkspaceKey);
  return Boolean(
    resolution.valid &&
      resolution.domain === "IT" &&
    principal?.actor.active &&
      membership?.active &&
      (!requestedWorkspaceKey || resolution.activeWorkspaceKey === requestedWorkspaceKey) &&
      membership.permission_refs.includes("identity.accounts.manage"),
  );
}

export function activeWorkspaceKey(session: SessionProjection | null): string | null {
  return principalOf(session)?.active_workspace?.workspace.workspace_key ?? null;
}
