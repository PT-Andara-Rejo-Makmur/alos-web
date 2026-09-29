import type { SessionProjection } from "@/features/session";
import { resolveWorkspaceDomain } from "@/features/session";

/**
 * Shared Work is universal, but its data boundary is still the Backend-selected
 * active workspace. A route key is accepted only when it matches that projection.
 */
export function authoritativeSharedWorkKey(
  session: SessionProjection | null,
  requestedWorkspaceKey?: string | null,
): string | null {
  const resolution = resolveWorkspaceDomain(session, requestedWorkspaceKey);
  return resolution.valid ? resolution.activeWorkspaceKey : null;
}
