import type { SessionContext, SessionProjection } from "@/features/session";

/**
 * Evaluates whether an action is permitted based on Backend session authority.
 * Checks permission_refs, role_refs, and scope_refs from the authenticated session.
 */
export function hasWorkPermission(
  session: SessionProjection | SessionContext | null | undefined,
  requiredPermission: string,
): boolean {
  if (!session) return false;

  // If passed SessionContext
  if ("actor" in session) {
    if (session.actor.permissions?.includes(requiredPermission)) return true;
    // Special authority grants if granted by role
    const roles = session.actor.roles ?? [];
    if (roles.includes("WORKSPACE_LEAD") && requiredPermission.startsWith("project.create")) return true;
    return false;
  }

  // If passed SessionProjection
  const principal = session.principal;
  if (!principal) return false;

  if ("actor" in principal) {
    const membership = principal.active_workspace;
    const permissions = membership?.permission_refs ?? [];
    if (permissions.includes(requiredPermission)) return true;
    const roles = membership?.role_refs ?? [];
    if (roles.includes("WORKSPACE_LEAD") && requiredPermission.startsWith("project.create")) return true;
    return false;
  }

  // Legacy fallback: fail closed
  return false;
}

export function canCreateProject(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "project.create");
}

export function canArchiveProject(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "project.archive");
}

export function canCreateTask(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "task.create");
}

export function canApproveWork(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "approval.approve");
}
