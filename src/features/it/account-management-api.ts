import { authenticatedApiRequest } from "@/lib/api";
import type {
  AuthorizationRole,
  IdentityAccountProjection,
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
