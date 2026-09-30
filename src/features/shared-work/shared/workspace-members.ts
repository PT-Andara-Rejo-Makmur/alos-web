import { authenticatedApiRequest } from "@/lib/api";
import type { SharedWorkWorkspaceMemberProjection } from "@/lib/contracts";

export type WorkspaceMember = SharedWorkWorkspaceMemberProjection;

export async function fetchWorkspaceMembers(): Promise<readonly WorkspaceMember[]> {
  return authenticatedApiRequest<readonly WorkspaceMember[]>("/api/v1/workspace-members");
}
