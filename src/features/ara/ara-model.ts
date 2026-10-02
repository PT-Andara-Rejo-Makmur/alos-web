import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import type { DataClassification } from "@/lib/contracts";

/** Context representation supplied to ARA derived strictly from authoritative session. */
export interface AraContext {
  readonly tenantId: string;
  readonly organizationId: string;
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
  maximumDataClassification: DataClassification = "INTERNAL",
): AraContext | null {
  if (!session?.authenticated || !session.principal || !("actor" in session.principal)) {
    return null;
  }

  if (!resolveWorkspaceDomain(session, requestedWorkspaceKey).valid) {
    return null;
  }

  const principal = session.principal;
  const activeWs = principal.active_workspace;
  if (!principal.actor.active || !activeWs?.active || !activeWs.workspace?.active) {
    return null;
  }

  const workspace = activeWs.workspace;

  if (principal.actor.organization_id !== workspace.organization_id) {
    return null;
  }

  // Fail closed: requested workspace in URL must match authoritative active workspace
  if (requestedWorkspaceKey && workspace.workspace_key !== requestedWorkspaceKey) {
    return null;
  }

  // Display the Backend projection; session permissions never infer classification here.
  const maxClassification = maximumDataClassification;

  const classificationLabel = maxClassification === "RESTRICTED"
    ? "Sangat Rahasia (Restricted)"
    : "Internal Perusahaan";

  return {
    tenantId: principal.actor.tenant_id,
    organizationId: principal.actor.organization_id,
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
  readonly tenantId: string;
  readonly organizationId: string;
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
  const encodePart = (value: string) => encodeURIComponent(value);
  const scopeKey = [...identity.scopeRefs].sort().map(encodePart).join(",");
  return `ara:${encodePart(identity.tenantId)}:${encodePart(identity.organizationId)}:${encodePart(identity.workspaceKey)}:${encodePart(identity.actorId)}:${identity.classification}:${scopeKey}:${encodePart(identity.threadId)}`;
}

/**
 * Validates whether a thread belongs to the current authoritative ARA context.
 */
export function isThreadWithinBoundary(
  thread: AraThreadIdentity,
  context: AraContext,
): boolean {
  if (thread.tenantId !== context.tenantId) return false;
  if (thread.organizationId !== context.organizationId) return false;
  if (thread.actorId !== context.actor.actorId) return false;
  if (thread.workspaceId !== context.activeWorkspace.workspaceId) return false;
  if (thread.workspaceKey !== context.activeWorkspace.workspaceKey) return false;
  if (thread.scopeRefs.length === 0 || context.scopeRefs.length === 0) return false;
  if (!thread.scopeRefs.every((scopeRef) => context.scopeRefs.includes(scopeRef))) return false;

  const classificationRank: Record<DataClassification, number> = {
    PUBLIC: 0,
    INTERNAL: 1,
    CONFIDENTIAL: 2,
    RESTRICTED: 3,
  };
  return classificationRank[thread.classification] <= classificationRank[context.maxClassification];
}
