import { authenticatedApiRequest } from "@/lib/api";
import type {
  AccountAccessProjection,
  AccountStateProjection,
  AuthorizationRole,
  IdentityAccountProjection,
  MembershipMutationRequest,
  ProvisionAccountRequest,
  WorkspaceProjection,
} from "@/lib/contracts";

export function listIdentityAccounts(): Promise<IdentityAccountProjection[]> {
  return authenticatedApiRequest<IdentityAccountProjection[]>("/api/v1/identity/accounts");
}

export function listIdentityWorkspaces(): Promise<WorkspaceProjection[]> {
  return authenticatedApiRequest<WorkspaceProjection[]>("/api/v1/identity/workspaces");
}

export function listAssignableRoles(): Promise<AuthorizationRole[]> {
  return authenticatedApiRequest<AuthorizationRole[]>("/api/v1/identity/assignable-roles");
}

export function provisionIdentityAccount(
  payload: ProvisionAccountRequest,
): Promise<IdentityAccountProjection> {
  return authenticatedApiRequest<IdentityAccountProjection>("/api/v1/identity/accounts", {
    method: "POST",
    body: payload,
  });
}

export function readAccountAccess(actorId: string): Promise<AccountAccessProjection> {
  return authenticatedApiRequest<AccountAccessProjection>(
    `/api/v1/identity/actors/${encodeURIComponent(actorId)}/access`,
  );
}

export function addAccountMembership(
  actorId: string,
  payload: MembershipMutationRequest,
): Promise<IdentityAccountProjection["workspace_access"][number]> {
  return authenticatedApiRequest<IdentityAccountProjection["workspace_access"][number]>(
    `/api/v1/identity/actors/${encodeURIComponent(actorId)}/memberships`,
    { method: "POST", body: payload },
  );
}

export function updateAccountMembership(
  actorId: string,
  payload: MembershipMutationRequest,
): Promise<IdentityAccountProjection["workspace_access"][number]> {
  return authenticatedApiRequest<IdentityAccountProjection["workspace_access"][number]>(
    `/api/v1/identity/actors/${encodeURIComponent(actorId)}/memberships`,
    { method: "PUT", body: payload },
  );
}

export function revokeAccountMembership(actorId: string, workspaceId: string): Promise<void> {
  return authenticatedApiRequest<void>(
    `/api/v1/identity/actors/${encodeURIComponent(actorId)}/memberships/${encodeURIComponent(workspaceId)}`,
    { method: "DELETE" },
  );
}

export function setAccountActive(actorId: string, active: boolean): Promise<AccountStateProjection> {
  return authenticatedApiRequest<AccountStateProjection>(
    `/api/v1/identity/actors/${encodeURIComponent(actorId)}/${active ? "activate" : "suspend"}`,
    { method: "POST" },
  );
}
