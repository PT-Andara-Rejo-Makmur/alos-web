import { ApiError, authenticatedApiRequest, sessionApiRequest } from "@/lib/api";

import type {
  SessionActor,
  SessionPrincipal,
  SessionProjection,
  Workspace,
} from "./types";

function projectActor(principal: SessionPrincipal): SessionActor {
  const userId = principal.user_id ?? principal.actor_id;
  if (!userId) throw new Error("Session principal tidak memiliki user identifier.");
  return {
    user_id: userId,
    organization_id: principal.organization_id ?? null,
    roles: [...(principal.roles ?? [])],
    division_codes: [...(principal.division_codes ?? [])],
    workspace_ids: [...(principal.workspace_ids ?? [])],
    issued_at: principal.issued_at ?? null,
    expires_at: principal.expires_at ?? null,
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
export function loadAccessibleWorkspaces(signal?: AbortSignal): Promise<Workspace[]> {
  return authenticatedApiRequest<Workspace[]>("/api/v1/workspaces", { signal });
}
