import { ApiError, authenticatedApiRequest, sessionApiRequest } from "@/lib/api";
import type { WorkspaceAccessProjection } from "@/lib/contracts";

import type {
  SessionActor,
  SessionPrincipal,
  SessionProjection,
  Workspace,
} from "./types";

interface LegacySessionPrincipal {
  readonly actor_id?: string;
  readonly user_id?: string;
  readonly organization_id?: string | null;
  readonly roles?: readonly string[];
  readonly division_codes?: readonly string[];
  readonly workspace_ids?: readonly string[];
  readonly issued_at?: string | null;
  readonly expires_at?: string | null;
}

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
  if (!membership) throw new Error("Session principal belum memiliki active workspace.");
  const divisionCode = membership.workspace.division_code;
  return {
    user_id: principal.actor.actor_id,
    organization_id: principal.actor.organization_id,
    roles: [...membership.role_refs],
    permissions: [...membership.permission_refs],
    scopes: [...membership.scope_refs],
    division_codes: divisionCode ? [divisionCode] : [],
    workspace_ids: principal.workspace_access.map((access) => access.workspace.workspace_id),
    issued_at: principal.issued_at,
    expires_at: principal.expires_at,
  };
}

/** Read the authenticated principal only through the same-origin HttpOnly session boundary. */
export async function loadSessionActor(signal?: AbortSignal): Promise<SessionActor> {
  const session = await sessionApiRequest<SessionProjection>("", { signal });
  if (!session.authenticated || !session.principal) {
    throw new ApiError(401, "Authenticated session tidak tersedia.", null);
  }
  return projectActor(session.principal);
}

/** Read Backend-authorized workspaces through the authenticated same-origin proxy. */
export async function loadAccessibleWorkspaces(signal?: AbortSignal): Promise<Workspace[]> {
  const access = await authenticatedApiRequest<Array<WorkspaceAccessProjection | Workspace>>(
    "/api/v1/workspaces",
    { signal },
  );
  return access.map((item) => {
    if (!("workspace" in item)) return item;
    return {
      workspace_id: item.workspace.workspace_id,
      workspace_key: item.workspace.workspace_key,
      name: item.workspace.workspace_name,
      workspace_type: item.workspace.workspace_type,
      division_code: item.workspace.division_code ?? null,
      access_level: item.access_level ?? item.role_refs[0] ?? "WORKSPACE_MEMBER",
      role_refs: item.role_refs,
      permission_refs: item.permission_refs,
      scope_refs: item.scope_refs,
    };
  });
}
