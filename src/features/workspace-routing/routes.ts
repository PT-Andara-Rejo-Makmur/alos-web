import type { CanonicalWorkspaceKey, SharedModuleKey } from "./types";
import { isCanonicalWorkspaceKey } from "./types";

/**
 * Centralized Canonical ALOS Workspace Roots & Static Routes Map.
 * Eliminates un-scoped global shared routes.
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
  settings: "/business/settings",
} as const;

/**
 * Validates and normalizes workspace key.
 * Returns null if invalid, preventing arbitrary pathname generation.
 */
export function normalizeWorkspaceKey(key: string): CanonicalWorkspaceKey | null {
  const lower = key.toLowerCase();
  if (lower === "director") return "executive";
  if (lower === "technology") return "it";
  if (isCanonicalWorkspaceKey(lower)) return lower;
  return null;
}

/**
 * Returns canonical workspace root route: /workspace/{workspaceKey}
 */
export function getWorkspaceRoot(workspaceKey: string): string {
  const normalized = normalizeWorkspaceKey(workspaceKey);
  if (!normalized) return WORKSPACE_ROUTES.resolver;
  return `/workspace/${normalized}`;
}

/**
 * Returns canonical contextual workspace module route: /workspace/{workspaceKey}/{module}
 */
export function getWorkspaceModuleRoute(workspaceKey: string, module: string): string {
  const root = getWorkspaceRoot(workspaceKey);
  if (root === WORKSPACE_ROUTES.resolver) return root;
  const cleanModule = module.replace(/^\/+/, "");
  return `${root}/${cleanModule}`;
}

/**
 * Returns canonical contextual ARA route: /workspace/{workspaceKey}/ara
 */
export function getWorkspaceAraRoute(workspaceKey: string): string {
  return getWorkspaceModuleRoute(workspaceKey, "ara");
}

/**
 * Returns canonical contextual Agent Workforce route.
 * IT operations uses technical GENESIS agents (/workspace/it/genesis/agents).
 * Executive does not invent business Agent Workforce (returns /workspace/executive).
 * Business workspaces (finance, hr, legal, sales, property) use /workspace/{workspaceKey}/agents.
 */
export function getWorkspaceAgentsRoute(workspaceKey: string): string {
  const normalized = normalizeWorkspaceKey(workspaceKey);
  if (!normalized) return WORKSPACE_ROUTES.resolver;
  if (normalized === "it") return "/workspace/it/genesis/agents";
  if (normalized === "executive") return "/workspace/executive";
  return `/workspace/${normalized}/agents`;
}

/**
 * Returns canonical technical GENESIS route for IT operations:
 * /workspace/it/genesis or /workspace/it/genesis/{subpath}
 */
export function getGenesisRoute(subpath?: string): string {
  if (!subpath) return "/workspace/it/genesis";
  const cleanSubpath = subpath.replace(/^\/+/, "");
  return `/workspace/it/genesis/${cleanSubpath}`;
}

/**
 * Returns canonical IT Governance route:
 * /workspace/it/governance or /workspace/it/governance/{subpath}
 */
export function getGovernanceRoute(subpath?: string): string {
  if (!subpath) return "/workspace/it/governance";
  const cleanSubpath = subpath.replace(/^\/+/, "");
  return `/workspace/it/governance/${cleanSubpath}`;
}

/**
 * Helper to get canonical shared module route URL.
 * When workspaceKey is provided, returns contextual route /workspace/{workspaceKey}/{module}.
 * Defaults to contextual route or fallback resolver if not provided.
 */
export function getSharedModuleRoute(module: SharedModuleKey, workspaceKey?: string): string {
  if (workspaceKey) {
    return getWorkspaceModuleRoute(workspaceKey, module);
  }
  return `/workspace/${module}`;
}
