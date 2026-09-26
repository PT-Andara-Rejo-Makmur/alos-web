import { authenticatedApiRequest } from "@/lib/api";
import type { DraftMembership, Membership } from "./types";
import type { IdentityAccessRequest } from "./identity-access-api";

export interface SaveActorMembershipsInput {
  readonly actorId: string;
  readonly originalMemberships: readonly Membership[];
  readonly draftMemberships: readonly DraftMembership[];
  readonly request?: IdentityAccessRequest;
}

function membershipBody(membership: DraftMembership) {
  return {
    workspace_id: membership.workspace.workspace_id,
    role_refs: membership.role_refs,
    permission_refs: membership.permission_refs,
    scope_refs: membership.scope_refs,
    data_scope: membership.data_scope,
  };
}

export function assertUniqueWorkspaceMemberships(
  memberships: readonly DraftMembership[],
): void {
  const workspaceIds = memberships.map((membership) => membership.workspace.workspace_id);
  if (new Set(workspaceIds).size !== workspaceIds.length) {
    throw new Error("Satu workspace hanya boleh memiliki satu membership per akun.");
  }
}

export async function saveActorMemberships({
  actorId,
  originalMemberships,
  draftMemberships,
  request = authenticatedApiRequest,
}: SaveActorMembershipsInput): Promise<void> {
  assertUniqueWorkspaceMemberships(draftMemberships);
  const actorPath = `/api/v1/identity/actors/${encodeURIComponent(actorId)}`;

  for (const membership of draftMemberships) {
    const body = membershipBody(membership);
    if (
      membership.original_workspace_id &&
      membership.original_workspace_id !== membership.workspace.workspace_id
    ) {
      await request(`${actorPath}/memberships`, { method: "POST", body });
      await request(
        `${actorPath}/memberships/${encodeURIComponent(membership.original_workspace_id)}`,
        { method: "DELETE" },
      );
    } else if (membership.original_workspace_id) {
      await request(`${actorPath}/memberships`, { method: "PUT", body });
    } else {
      await request(`${actorPath}/memberships`, { method: "POST", body });
    }
  }

  const retainedOriginalIds = new Set(
    draftMemberships
      .map((membership) => membership.original_workspace_id)
      .filter((workspaceId): workspaceId is string => Boolean(workspaceId)),
  );
  for (const membership of originalMemberships) {
    if (!retainedOriginalIds.has(membership.workspace.workspace_id)) {
      await request(
        `${actorPath}/memberships/${encodeURIComponent(membership.workspace.workspace_id)}`,
        { method: "DELETE" },
      );
    }
  }
}
