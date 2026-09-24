import type {
  AuthenticatedPrincipalProjection,
  AuthorizationRole,
} from "@/lib/contracts";

interface CanonicalPrincipalOptions {
  readonly actorId: string;
  readonly divisionCode: string;
  readonly workspaceId: string;
  readonly workspaceKey: string;
  readonly workspaceName: string;
  readonly roles?: readonly AuthorizationRole[];
  readonly allWorkspaceIds?: readonly string[];
}

export function canonicalPrincipal({
  actorId,
  divisionCode,
  workspaceId,
  workspaceKey,
  workspaceName,
  roles = ["WORKSPACE_MEMBER"],
  allWorkspaceIds = [workspaceId],
}: CanonicalPrincipalOptions): AuthenticatedPrincipalProjection {
  const activeWorkspace = {
    workspace: {
      workspace_id: workspaceId,
      workspace_key: workspaceKey,
      organization_id: "org_andara_holding",
      workspace_name: workspaceName,
      workspace_type: "BUSINESS" as const,
      division_code: divisionCode,
      active: true,
    },
    role_refs: roles,
    permission_refs: [] as readonly string[],
    scope_refs: [] as readonly string[],
    data_scope: "WORKSPACE" as const,
    active: true,
  };

  return {
    actor: {
      actor_id: actorId,
      tenant_id: "tenant_andara",
      organization_id: "org_andara_holding",
      display_name: actorId,
      active: true,
    },
    email: `${actorId}@andara.local`,
    workspace_access: allWorkspaceIds.map((candidateId) =>
      candidateId === workspaceId
        ? activeWorkspace
        : {
            ...activeWorkspace,
            workspace: {
              ...activeWorkspace.workspace,
              workspace_id: candidateId,
              workspace_key: candidateId,
              workspace_name: candidateId,
            },
          },
    ),
    active_workspace: activeWorkspace,
    issued_at: "2026-09-24T00:00:00Z",
    expires_at: "2026-09-25T00:00:00Z",
  };
}
