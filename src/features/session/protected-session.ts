import { ApiError, authenticatedApiRequest, sessionApiRequest } from "@/lib/api";
import type { WorkspaceAccessProjection } from "@/lib/contracts";

import type {
  LegacySessionPrincipal,
  SessionActor,
  SessionContext,
  SessionPrincipal,
  SessionProjection,
  Workspace,
} from "./types";

function projectActor(principal: SessionPrincipal | LegacySessionPrincipal): SessionActor {
  // Temporary rolling-deployment adapter. Remove after every environment serves Contracts 1.7.
  if (!("actor" in principal)) {
    const actorId = principal.actor_id ?? principal.user_id;
    if (!actorId) throw new Error("Session principal tidak memiliki actor_id.");
    return {
      user_id: actorId,
      organization_id: principal.organization_id ?? "",
      roles: [...(principal.roles ?? [])],
      division_codes: [...(principal.division_codes ?? [])],
      workspace_ids: [...(principal.workspace_ids ?? [])],
      issued_at: principal.issued_at ?? "",
      expires_at: principal.expires_at ?? "",
    };
  }
  const membership = principal.active_workspace;
  const divisionCode = membership?.workspace.division_code;
  return {
    user_id: principal.actor.actor_id,
    organization_id: principal.actor.organization_id,
    roles: [...(membership?.role_refs ?? [])],
    permissions: [...(membership?.permission_refs ?? [])],
    scopes: [...(membership?.scope_refs ?? [])],
    division_codes: divisionCode ? [divisionCode] : [],
    workspace_ids: principal.workspace_access.map((access) => access.workspace.workspace_id),
    issued_at: principal.issued_at,
    expires_at: principal.expires_at,
  };
}

function projectWorkspace(access: WorkspaceAccessProjection): Workspace {
  return {
    workspace_id: access.workspace.workspace_id,
    workspace_key: access.workspace.workspace_key,
    name: access.workspace.workspace_name,
    workspace_type: access.workspace.workspace_type,
    division_code: access.workspace.division_code ?? null,
    access_level: access.access_level ?? access.role_refs[0] ?? "WORKSPACE_MEMBER",
    role_refs: access.role_refs,
    permission_refs: access.permission_refs,
    scope_refs: access.scope_refs,
  };
}

/** Project the canonical principal without searching or guessing an active workspace. */
export function projectSessionContext(
  principal: SessionPrincipal | LegacySessionPrincipal,
): SessionContext {
  return {
    principal,
    actor: projectActor(principal),
    activeWorkspace:
      "actor" in principal && principal.active_workspace
        ? projectWorkspace(principal.active_workspace)
        : null,
  };
}

/** Read the canonical principal and its Backend-selected active workspace. */
export async function loadSessionContext(signal?: AbortSignal): Promise<SessionContext> {
  const session = await sessionApiRequest<SessionProjection>("", { signal });
  if (!session.authenticated || !session.principal) {
    throw new ApiError(401, "Authenticated session tidak tersedia.", null);
  }
  return projectSessionContext(session.principal);
}

/** Read the authenticated principal only through the same-origin HttpOnly session boundary. */
export async function loadSessionActor(signal?: AbortSignal): Promise<SessionActor> {
  return (await loadSessionContext(signal)).actor;
}

/** Read Backend-authorized workspaces through the authenticated same-origin proxy. */
export async function loadAccessibleWorkspaces(signal?: AbortSignal): Promise<Workspace[]> {
  const access = await authenticatedApiRequest<Array<WorkspaceAccessProjection | Workspace>>(
    "/api/v1/workspaces",
    { signal },
  );
  return access.map((item) => {
    if (!("workspace" in item)) return item;
    return projectWorkspace(item);
  });
}
