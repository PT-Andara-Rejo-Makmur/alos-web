import type { SessionProjection } from "./types";

export type WorkspaceDomain =
  | "EXECUTIVE"
  | "SALES"
  | "IT"
  | "PROPERTY"
  | "FINANCE"
  | "LEGAL"
  | "HR_GA"
  | "UNKNOWN";

export interface WorkspaceDomainResolution {
  readonly authenticated: boolean;
  readonly valid: boolean;
  readonly domain: WorkspaceDomain;
  readonly activeWorkspaceKey: string | null;
  readonly workspaceName: string | null;
  readonly failureReason?: "unauthenticated" | "inactive" | "key_mismatch" | "unknown_domain";
}

/**
 * Resolves the authoritative workspace domain and validates workspace key boundary.
 * Authority is derived SOLELY from the Backend session projection, NEVER from the URL.
 */
export function resolveWorkspaceDomain(
  session: SessionProjection | null | undefined,
  requestedWorkspaceKey?: string | null,
): WorkspaceDomainResolution {
  if (!session || !session.authenticated || !session.principal || !("actor" in session.principal)) {
    return {
      authenticated: false,
      valid: false,
      domain: "UNKNOWN",
      activeWorkspaceKey: null,
      workspaceName: null,
      failureReason: "unauthenticated",
    };
  }

  const { actor, active_workspace: activeWs } = session.principal;
  if (!actor.active || !activeWs?.active || !activeWs.workspace?.active) {
    return {
      authenticated: true,
      valid: false,
      domain: "UNKNOWN",
      activeWorkspaceKey: activeWs?.workspace?.workspace_key ?? null,
      workspaceName: activeWs?.workspace?.workspace_name ?? null,
      failureReason: "inactive",
    };
  }

  const workspace = activeWs.workspace;
  const activeKey = workspace.workspace_key;

  if (requestedWorkspaceKey !== undefined && requestedWorkspaceKey !== null && requestedWorkspaceKey !== activeKey) {
    return {
      authenticated: true,
      valid: false,
      domain: "UNKNOWN",
      activeWorkspaceKey: activeKey,
      workspaceName: workspace.workspace_name,
      failureReason: "key_mismatch",
    };
  }

  let domain: WorkspaceDomain = "UNKNOWN";

  if (workspace.workspace_type === "EXECUTIVE") {
    domain = "EXECUTIVE";
  } else if (workspace.workspace_type === "IT_OPERATIONS" || workspace.division_code?.toUpperCase() === "IT") {
    domain = "IT";
  } else if (workspace.workspace_type === "BUSINESS") {
    const div = workspace.division_code?.toUpperCase();
    if (div === "SALES") domain = "SALES";
    else if (div === "PROPERTY") domain = "PROPERTY";
    else if (div === "FINANCE") domain = "FINANCE";
    else if (div === "LEGAL") domain = "LEGAL";
    else if (div === "HR" || div === "HR_GA" || div === "HRGA") domain = "HR_GA";
    else domain = "UNKNOWN";
  }

  return {
    authenticated: true,
    valid: true,
    domain,
    activeWorkspaceKey: activeKey,
    workspaceName: workspace.workspace_name,
  };
}
