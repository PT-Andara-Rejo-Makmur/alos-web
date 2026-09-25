import type { SessionActor, Workspace } from "@/features/session";
import {
  getGenesisRoute,
  getGovernanceRoute,
  getWorkspaceAgentsRoute,
  getWorkspaceAraRoute,
  getWorkspaceModuleRoute,
  getWorkspaceRoot,
  normalizeWorkspaceKey,
} from "./routes";

/**
 * Centralized Compatibility Routes Map.
 * Preserves legacy entrypoints without breaking deep links.
 */
export const COMPATIBILITY_ROUTES = {
  business: "/business",
  businessProjects: "/business/projects",
  businessTasks: "/business/tasks",
  businessApprovals: "/business/approvals",
  businessDocuments: "/business/documents",
  businessReports: "/business/reports",
  businessFindings: "/business/findings",
  businessDivisions: "/business/divisions",
  businessSettings: "/business/settings",

  ara: "/ara",
  agents: "/agents",
  director: "/director",
  genesis: "/genesis",
  governance: "/governance",
  research: "/research",
  giivepro: "/giivepro",

  legacyProjects: "/workspace/projects",
  legacyTasks: "/workspace/tasks",
  legacyApprovals: "/workspace/approvals",
  legacyDocuments: "/workspace/documents",
  legacyReports: "/workspace/reports",
  legacyFindings: "/workspace/findings",
  legacyAra: "/workspace/ara",
  legacyAgents: "/workspace/agents",
  legacyFinanceClose: "/workspace/finance/close",
} as const;

/**
 * Resolves a legacy/compatibility route to its canonical destination.
 * If the route requires a verified active workspace and none is provided,
 * returns "/workspace" (fail-closed to Workspace Resolver).
 */
export function resolveLegacyRoute(
  pathname: string,
  activeWorkspace?: Workspace | null,
  actor?: SessionActor | null,
): string {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // Static redirects independent of active workspace
  if (cleanPath === "/director") {
    return "/workspace/executive";
  }
  if (cleanPath === "/genesis") {
    return getGenesisRoute();
  }
  if (cleanPath === "/governance") {
    return getGovernanceRoute();
  }
  if (cleanPath === "/research") {
    return getGenesisRoute("research");
  }
  if (cleanPath === "/workspace/finance/close") {
    return "/workspace/finance/month-close";
  }
  if (cleanPath === "/business/settings" || cleanPath === "/giivepro") {
    return cleanPath;
  }

  // Active workspace-dependent resolution
  const workspaceKey = activeWorkspace
    ? normalizeWorkspaceKey(activeWorkspace.workspace_key)
    : null;

  // ARA compatibility
  if (cleanPath === "/ara" || cleanPath === "/workspace/ara") {
    return workspaceKey ? getWorkspaceAraRoute(workspaceKey) : "/workspace";
  }

  // Agents compatibility
  if (cleanPath === "/agents" || cleanPath === "/workspace/agents") {
    if (!workspaceKey) return "/workspace";
    return getWorkspaceAgentsRoute(workspaceKey);
  }

  // Executive Divisions compatibility: only with executive authority
  if (cleanPath === "/business/divisions") {
    const isExecutive =
      workspaceKey === "executive" || (actor?.roles ?? []).includes("EXECUTIVE");
    return isExecutive ? "/workspace/executive/divisions" : "/workspace";
  }

  // Shared work modules compatibility
  const sharedModuleMap: Record<string, string> = {
    "/business/projects": "projects",
    "/workspace/projects": "projects",
    "/business/tasks": "tasks",
    "/workspace/tasks": "tasks",
    "/business/approvals": "approvals",
    "/workspace/approvals": "approvals",
    "/business/documents": "documents",
    "/workspace/documents": "documents",
    "/business/reports": "reports",
    "/workspace/reports": "reports",
    "/business/findings": "findings",
    "/workspace/findings": "findings",
  };

  if (cleanPath in sharedModuleMap) {
    const moduleName = sharedModuleMap[cleanPath];
    return workspaceKey ? getWorkspaceModuleRoute(workspaceKey, moduleName) : "/workspace";
  }

  if (cleanPath === "/business") {
    return workspaceKey ? getWorkspaceRoot(workspaceKey) : "/workspace";
  }

  return "/workspace";
}
