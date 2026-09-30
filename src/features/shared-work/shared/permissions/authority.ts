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
    return Boolean(session.actor.permissions?.includes(requiredPermission));
  }

  // If passed SessionProjection
  const principal = session.principal;
  if (!principal) return false;

  if ("actor" in principal) {
    const membership = principal.active_workspace;
    const permissions = membership?.permission_refs ?? [];
    return permissions.includes(requiredPermission);
  }

  // Legacy fallback: fail closed
  return false;
}

export function canCreateProject(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "project.create") || hasWorkPermission(session, "work.write");
}

export function canArchiveProject(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "project.archive");
}

export function canUpdateProject(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "project.update");
}

export function canCreateTask(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "task.create") || hasWorkPermission(session, "work.write");
}

export function canUpdateTask(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "task.update");
}

export function canAssignTask(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "task.assign");
}

export function canCompleteTask(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "task.complete");
}

export function canApproveWork(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "approval.approve");
}

export function canCreateReport(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "report.create") || hasWorkPermission(session, "work.write");
}

export function canCreateFinding(session: SessionProjection | SessionContext | null | undefined): boolean {
  return hasWorkPermission(session, "finding.create") || hasWorkPermission(session, "work.write");
}

