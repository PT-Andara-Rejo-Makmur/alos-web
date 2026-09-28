import type { SessionProjection } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";

function principalOf(session: SessionProjection | null): AuthenticatedPrincipalProjection | null {
  const principal = session?.principal;
  return principal && "actor" in principal ? principal : null;
}

/** UI gate derived from the Backend-selected membership; it grants no authority. */
export function hasItAccountManagementAccess(session: SessionProjection | null, workspaceKey?: string): boolean {
  const principal = principalOf(session);
  const membership = workspaceKey
    ? principal?.workspace_access.find((access) => access.workspace.workspace_key === workspaceKey)
    : principal?.active_workspace;
  return Boolean(
    principal?.actor.active &&
      membership?.active &&
      membership.workspace.workspace_type === "IT_OPERATIONS" &&
      membership.permission_refs.includes("identity.accounts.manage"),
  );
}

export function activeWorkspaceKey(session: SessionProjection | null): string | null {
  return principalOf(session)?.active_workspace?.workspace.workspace_key ?? null;
}
