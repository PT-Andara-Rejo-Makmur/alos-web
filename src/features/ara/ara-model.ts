import type { SessionProjection } from "@/features/session";
import type { DataClassification } from "@/lib/contracts";

/** Context representation supplied to ARA derived strictly from authoritative session. */
export interface AraContext {
  readonly actor: {
    readonly actorId: string;
    readonly displayName: string;
    readonly active: boolean;
  };
  readonly activeWorkspace: {
    readonly workspaceId: string;
    readonly workspaceKey: string;
    readonly workspaceName: string;
    readonly workspaceType: string;
    readonly divisionCode: string | null;
  };
  readonly permissionRefs: readonly string[];
  readonly scopeRefs: readonly string[];
  readonly maxClassification: DataClassification;
  readonly classificationLabel: string;
}

/**
 * Extracts and validates authoritative ARA context from session projection.
 * Fails closed (returns null) if unauthenticated, inactive, or workspaceKey mismatches.
 */
export function extractAraContext(
  session: SessionProjection | null,
  requestedWorkspaceKey?: string | null,
): AraContext | null {
  if (!session?.authenticated || !session.principal || !("actor" in session.principal)) {
    return null;
  }

  const principal = session.principal;
  const activeWs = principal.active_workspace;
  if (!principal.actor.active || !activeWs?.active || !activeWs.workspace?.active) {
    return null;
  }

  const workspace = activeWs.workspace;

  // Fail closed: requested workspace in URL must match authoritative active workspace
  if (requestedWorkspaceKey && workspace.workspace_key !== requestedWorkspaceKey) {
    return null;
  }

  // Derive allowed data classification from session context
  const isExecutive = workspace.workspace_type === "EXECUTIVE" || activeWs.role_refs.includes("EXECUTIVE");
  const hasRestricted = isExecutive || activeWs.permission_refs.some((p) => p.includes("restricted") || p === "*");
  const hasConfidential = hasRestricted || activeWs.permission_refs.some((p) => p.includes("confidential"));

  const maxClassification: DataClassification = hasRestricted
    ? "RESTRICTED"
    : hasConfidential
      ? "CONFIDENTIAL"
      : "INTERNAL";

  const classificationLabel = maxClassification === "RESTRICTED"
    ? "Sangat Rahasia (Restricted)"
    : maxClassification === "CONFIDENTIAL"
      ? "Rahasia (Confidential)"
      : "Internal Perusahaan";

  return {
    actor: {
      actorId: principal.actor.actor_id,
      displayName: principal.actor.display_name,
      active: principal.actor.active,
    },
    activeWorkspace: {
      workspaceId: workspace.workspace_id,
      workspaceKey: workspace.workspace_key,
      workspaceName: workspace.workspace_name,
      workspaceType: workspace.workspace_type,
      divisionCode: workspace.division_code ?? null,
    },
    permissionRefs: activeWs.permission_refs,
    scopeRefs: activeWs.scope_refs,
    maxClassification,
    classificationLabel,
  };
}

/**
 * Concept model for isolating chat threads per boundary.
 * Prevents cross-workspace or cross-scope contamination.
 */
export interface AraThreadIdentity {
  readonly threadId: string;
  readonly actorId: string;
  readonly workspaceId: string;
  readonly workspaceKey: string;
  readonly scopeRefs: readonly string[];
  readonly classification: DataClassification;
}

/**
 * Builds an isolated deterministic key for an ARA thread ensuring multi-tenant/workspace boundary.
 */
export function buildAraThreadKey(identity: AraThreadIdentity): string {
  const scopeKey = [...identity.scopeRefs].sort().join(",");
  return `ara:${identity.workspaceKey}:${identity.actorId}:${identity.classification}:${scopeKey}:${identity.threadId}`;
}

/**
 * Validates whether a thread belongs to the current authoritative ARA context.
 */
export function isThreadWithinBoundary(
  thread: AraThreadIdentity,
  context: AraContext,
): boolean {
  if (thread.actorId !== context.actor.actorId) return false;
  if (thread.workspaceId !== context.activeWorkspace.workspaceId) return false;
  if (thread.workspaceKey !== context.activeWorkspace.workspaceKey) return false;
  return true;
}
