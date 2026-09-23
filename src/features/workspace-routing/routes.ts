import type { SharedModuleKey, WorkspaceRouteKey } from "./types";

/**
 * Centralized Canonical ALOS Workspace Routes Map.
 * Used across sidebars, breadcrumbs, ARA context links, and agent cards.
 */
export const WORKSPACE_ROUTES = {
  resolver: "/workspace",
  executive: "/workspace/executive",
  finance: "/workspace/finance",
  hr: "/workspace/hr",
  legal: "/workspace/legal",
  property: "/workspace/property",
  sales: "/workspace/sales",
  it: "/workspace/it",

  projects: "/workspace/projects",
  tasks: "/workspace/tasks",
  approvals: "/workspace/approvals",
  documents: "/workspace/documents",
  reports: "/workspace/reports",
  findings: "/workspace/findings",
  ara: "/workspace/ara",
  agents: "/workspace/agents",
  settings: "/business/settings",
} as const satisfies Record<WorkspaceRouteKey, string>;

/**
 * Helper to get canonical shared module route URL.
 */
export function getSharedModuleRoute(module: SharedModuleKey): string {
  return WORKSPACE_ROUTES[module];
}
