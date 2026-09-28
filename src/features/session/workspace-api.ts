import { authenticatedApiRequest } from "@/lib/api";
import type { ActiveWorkspaceProjection } from "@/lib/contracts";

/** Selects an already-authorized workspace for the current Backend session. */
export function selectActiveWorkspace(workspaceId: string): Promise<ActiveWorkspaceProjection> {
  return authenticatedApiRequest<ActiveWorkspaceProjection>("/api/v1/auth/active-workspace", {
    method: "PUT",
    body: { workspace_id: workspaceId },
  });
}
