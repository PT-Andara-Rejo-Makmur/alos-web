/**
 * Centralized Workspace Routing & Readiness Types.
 */

export type WorkspaceRouteKey =
  | "resolver"
  | "executive"
  | "finance"
  | "hr"
  | "legal"
  | "property"
  | "sales"
  | "it"
  | "projects"
  | "tasks"
  | "approvals"
  | "documents"
  | "reports"
  | "findings"
  | "ara"
  | "agents"
  | "settings";

export type SharedModuleKey =
  | "projects"
  | "tasks"
  | "approvals"
  | "documents"
  | "reports"
  | "findings";

/**
 * Context of the verified active workspace passed down to shared modules.
 * Eliminates implicit actor.workspace_ids[0] and actor.division_codes[0] assumptions.
 */
export interface ActiveWorkspaceContext {
  readonly workspaceId: string;
  readonly workspaceKey: string;
  readonly workspaceLabel: string;
  readonly divisionCode: string | null;
  readonly accessLevel?: string | null;
}

/**
 * 2-Dimensional Navigation Model:
 * Dimensi A: Visibility / Permission
 * Dimensi B: Readiness / Availability
 */
export type WorkspaceNavAvailability = "READY" | "BLOCKED";

export type WorkspaceNavVisibility = "VISIBLE" | "HIDDEN";

export type WorkspaceNavBlockReason =
  | "MODULE_NOT_IMPLEMENTED"
  | "BACKEND_NOT_CONNECTED"
  | "CONTRACT_PENDING"
  | "CAPABILITY_UNAVAILABLE"
  | "ROUTE_PENDING"
  | "DEPENDENCY_PENDING";
