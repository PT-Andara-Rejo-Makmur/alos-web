import type { SessionProjection } from "./types";
import type { WorkspaceProjection } from "@/lib/contracts";

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
 * Derives a workspace domain from Backend-authoritative workspace metadata.
 * The workspace key is deliberately not part of this decision.
 */
export function workspaceDomainFromMetadata(
  workspace: Pick<WorkspaceProjection, "workspace_type" | "division_code">,
): WorkspaceDomain {
  if (workspace.workspace_type === "EXECUTIVE") {
    return "EXECUTIVE";
  }
  if (workspace.workspace_type === "IT_OPERATIONS" || workspace.division_code?.toUpperCase() === "IT") {
    return "IT";
  }
  if (workspace.workspace_type !== "BUSINESS") {
    return "UNKNOWN";
  }

  const divisionCode = workspace.division_code?.toUpperCase();
  if (divisionCode === "SALES") return "SALES";
  if (divisionCode === "PROPERTY") return "PROPERTY";
  if (divisionCode === "FINANCE") return "FINANCE";
  if (divisionCode === "LEGAL") return "LEGAL";
  if (divisionCode === "HR" || divisionCode === "HR_GA" || divisionCode === "HRGA") return "HR_GA";
  return "UNKNOWN";
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

  const domain = workspaceDomainFromMetadata(workspace);

  return {
    authenticated: true,
    valid: domain !== "UNKNOWN",
    domain,
    activeWorkspaceKey: activeKey,
    workspaceName: workspace.workspace_name,
    ...(domain === "UNKNOWN" ? { failureReason: "unknown_domain" as const } : {}),
  };
}
