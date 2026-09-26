import { authenticatedApiRequest } from "@/lib/api";
import type { ApiRequestOptions } from "@/lib/api/client";
import type { Account, IdentityAccessData, WorkspaceOption } from "./types";

export type IdentityAccessRequest = <T>(
  path: string,
  options?: ApiRequestOptions,
) => Promise<T>;

export function loadAccounts(
  request: IdentityAccessRequest = authenticatedApiRequest,
): Promise<Account[]> {
  return request<Account[]>("/api/v1/identity/accounts");
}

export async function loadIdentityAccessData(
  request: IdentityAccessRequest = authenticatedApiRequest,
): Promise<IdentityAccessData> {
  const [accounts, assignableRoles, workspaces] = await Promise.all([
    loadAccounts(request),
    request<string[]>("/api/v1/identity/assignable-roles"),
    request<WorkspaceOption[]>("/api/v1/identity/workspaces"),
  ]);

  return { accounts, assignableRoles, workspaces };
}
