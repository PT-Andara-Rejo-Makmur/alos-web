import { authenticatedApiRequest } from "@/lib/api";
import type {
  AuthorizationRole,
  AdminSessionProjection,
  IdentityAccountProjection,
  IdentityAuditProjection,
  ProvisioningCandidateProjection,
  ProvisionAccountRequest,
  MembershipMutationRequest,
  WorkspaceProjection,
  WorkspaceAccessProjection,
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

export function listProvisioningCandidates(): Promise<ProvisioningCandidateProjection[]> {
  return authenticatedApiRequest<ProvisioningCandidateProjection[]>("/api/v1/identity/provisioning-candidates");
}

export function provisionAccount(request: ProvisionAccountRequest): Promise<IdentityAccountProjection> {
  return authenticatedApiRequest<IdentityAccountProjection>("/api/v1/identity/accounts", { method: "POST", body: request });
}

export function addMembership(actorId: string, request: MembershipMutationRequest): Promise<WorkspaceAccessProjection> {
  return authenticatedApiRequest<WorkspaceAccessProjection>(`/api/v1/identity/actors/${encodeURIComponent(actorId)}/memberships`, { method: "POST", body: request });
}

export function updateMembership(actorId: string, request: MembershipMutationRequest): Promise<WorkspaceAccessProjection> {
  return authenticatedApiRequest<WorkspaceAccessProjection>(`/api/v1/identity/actors/${encodeURIComponent(actorId)}/memberships`, { method: "PUT", body: request });
}

export function revokeMembership(actorId: string, workspaceId: string, reason: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/identity/actors/${encodeURIComponent(actorId)}/memberships/${encodeURIComponent(workspaceId)}`, { method: "DELETE", body: { reason } });
}

export function changeAccountState(actorId: string, active: boolean, reason: string): Promise<{ actor_id: string; active: boolean }> {
  return authenticatedApiRequest(`/api/v1/identity/actors/${encodeURIComponent(actorId)}/${active ? "activate" : "suspend"}`, { method: "POST", body: { reason } });
}

export function listActorSessions(actorId: string): Promise<AdminSessionProjection[]> {
  return authenticatedApiRequest<AdminSessionProjection[]>(`/api/v1/identity/actors/${encodeURIComponent(actorId)}/sessions`);
}

export function revokeActorSession(actorId: string, sessionId: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/identity/actors/${encodeURIComponent(actorId)}/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
}

export function listActorIdentityHistory(actorId: string): Promise<IdentityAuditProjection[]> {
  return authenticatedApiRequest<IdentityAuditProjection[]>(`/api/v1/identity/actors/${encodeURIComponent(actorId)}/history`);
}
