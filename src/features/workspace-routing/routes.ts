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
 * Requires workspaceKey to guarantee contextual routing: /workspace/{workspaceKey}/{module}.
 * Fails closed to Workspace Resolver (/workspace) if workspaceKey is invalid or unprovided.
 */
export function getSharedModuleRoute(workspaceKey: string, module: SharedModuleKey): string {
  const root = getWorkspaceRoot(workspaceKey);
  if (root === WORKSPACE_ROUTES.resolver) return root;
  return `${root}/${module}`;
}

/**
 * Strict allowlists of known modules per canonical workspace.
 * Prevents arbitrary dynamic segments from rendering or claiming validity.
 * Unknown modules must 404.
 */
export const WORKSPACE_MODULE_ALLOWLIST: Record<CanonicalWorkspaceKey, readonly string[]> = {
  executive: [
    "overview",
    "brief",
    "divisions",
    "projects",
    "tasks",
    "approvals",
    "findings",
    "documents",
    "reports",
    "ara",
    "governance",
  ],
  finance: [
    "overview",
    "cash",
    "receivables",
    "payables",
    "budget",
    "reconciliation",
    "tax",
    "close",
    "month-close",
    "projects",
    "tasks",
    "approvals",
    "documents",
    "reports",
    "findings",
    "ara",
    "agents",
    "governance",
  ],
  hr: [
    "overview",
    "employees",
    "attendance",
    "leave",
    "recruitment",
    "onboarding",
    "performance",
    "training",
    "succession",
    "grievances",
    "contracts",
    "personnel-files",
    "tasks",
    "approvals",
    "documents",
    "reports",
    "ara",
    "agents",
  ],
  legal: [
    "overview",
    "permits",
    "contracts",
    "land-documents",
    "due-diligence",
    "cases",
    "expiry",
    "claims",
    "privacy",
    "risk",
    "tasks",
    "approvals",
    "documents",
    "reports",
    "ara",
    "agents",
  ],
  sales: [
    "overview",
    "leads",
    "pipeline",
    "visits",
    "bookings",
    "closings",
    "campaigns",
    "channels",
    "attribution",
    "content",
    "follow-up",
    "complaints",
    "tasks",
    "approvals",
    "documents",
    "reports",
    "ara",
    "agents",
  ],
  property: [
    "overview",
    "projects",
    "milestones",
    "construction",
    "quality",
    "k3",
    "change-orders",
    "payment-certs",
    "payment-certificates",
    "handover",
    "tasks",
    "approvals",
    "documents",
    "reports",
    "ara",
    "agents",
  ],
  it: [
    "overview",
    "systems",
    "integrations",
    "database",
    "environments",
    "repositories",
    "cicd",
    "releases",
    "tech-debt",
    "monitoring",
    "incidents",
    "security",
    "backup",
    "users",
    "register-user",
    "ara",
    "agents",
  ],
};

export const GENESIS_SUBMODULE_ALLOWLIST: readonly string[] = [
  "agents",
  "skills",
  "research",
  "models-tools",
  "models",
];

export const GOVERNANCE_SUBMODULE_ALLOWLIST: readonly string[] = [
  "evidence",
  "uat",
  "decisions",
];

/**
 * Checks whether a module is an officially known module for the specified workspace.
 */
export function isKnownWorkspaceModule(workspaceKey: string, module: string): boolean {
  const normalized = normalizeWorkspaceKey(workspaceKey);
  if (!normalized) return false;
  const allowlist = WORKSPACE_MODULE_ALLOWLIST[normalized];
  if (!allowlist) return false;
  return allowlist.includes(module.toLowerCase());
}

/**
 * Checks whether a submodule is an officially known IT GENESIS submodule.
 */
export function isKnownGenesisSubmodule(submodule: string): boolean {
  return GENESIS_SUBMODULE_ALLOWLIST.includes(submodule.toLowerCase());
}

/**
 * Checks whether a submodule is an officially known IT Governance submodule.
 */
export function isKnownGovernanceSubmodule(submodule: string): boolean {
  return GOVERNANCE_SUBMODULE_ALLOWLIST.includes(submodule.toLowerCase());
}
