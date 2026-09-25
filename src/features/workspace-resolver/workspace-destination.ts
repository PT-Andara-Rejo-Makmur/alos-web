import {
  WORKSPACE_ROUTES,
  getGenesisRoute,
  getGovernanceRoute,
} from "@/features/workspace-routing";

/**
 * Resolves destination from Backend-projected workspace metadata only.
 * Canonical ALOS workspace routing ensures all authenticated targets map to /workspace/...
 */
export function resolveWorkspaceDestination(
  workspace: {
    readonly workspace_key?: string;
    readonly workspace_type?: "EXECUTIVE" | "BUSINESS" | "IT_OPERATIONS" | "GOVERNANCE" | "SHARED";
    readonly division_code?: string | null;
    readonly name?: string;
  },
): string | null {
  const key = (workspace.workspace_key || "").toUpperCase();
  const div = (workspace.division_code || "").toUpperCase();

  // 1. Executive workspace
  if (workspace.workspace_type === "EXECUTIVE" || key === "EXECUTIVE" || div === "EXECUTIVE" || div === "EXEC") {
    return WORKSPACE_ROUTES.executive;
  }

  // 2. Finance workspace
  if (
    key === "FINANCE" ||
    key.includes("FINANCE") ||
    div === "FINANCE"
  ) {
    return WORKSPACE_ROUTES.finance;
  }

  // 3. Property workspace
  if (
    key === "PROPERTY" ||
    key.includes("PROPERTY") ||
    div === "PROPERTY"
  ) {
    return WORKSPACE_ROUTES.property;
  }

  // 4. Sales & Marketing workspace
  if (
    key === "SALES" ||
    key.includes("SALES") ||
    div === "SALES" ||
    div === "SALES_MARKETING"
  ) {
    return WORKSPACE_ROUTES.sales;
  }

  // 5. HR / People workspace
  if (
    key === "HR" ||
    key.includes("HR") ||
    key.includes("PEOPLE") ||
    div === "HR" ||
    div === "PEOPLE"
  ) {
    return WORKSPACE_ROUTES.hr;
  }

  // 6. Legal & Compliance workspace
  if (
    key === "LEGAL" ||
    key.includes("LEGAL") ||
    key.includes("COMPLIANCE") ||
    div === "LEGAL" ||
    div === "COMPLIANCE" ||
    div === "LEGAL_COMPLIANCE"
  ) {
    return WORKSPACE_ROUTES.legal;
  }

  // 7. IT & Technology workspace
  if (
    key === "IT" ||
    key.includes("IT") ||
    key.includes("TECHNOLOGY") ||
    div === "IT" ||
    div === "TECHNOLOGY"
  ) {
    return WORKSPACE_ROUTES.it;
  }

  // Technical control plane & governance
  if (workspace.workspace_type === "IT_OPERATIONS") return getGenesisRoute();
  if (workspace.workspace_type === "GOVERNANCE") return getGovernanceRoute();

  // Business & Division workspaces fallback to mapped division or resolver
  if (
    key.startsWith("WS_") ||
    key.includes("BUSINESS") ||
    workspace.workspace_type === "BUSINESS" ||
    workspace.workspace_type === "SHARED" ||
    workspace.division_code !== null
  ) {
    if (workspace.division_code) {
      const divLower = workspace.division_code.toLowerCase();
      if (divLower in WORKSPACE_ROUTES) {
        return WORKSPACE_ROUTES[divLower as keyof typeof WORKSPACE_ROUTES];
      }
    }
    return WORKSPACE_ROUTES.resolver;
  }

  // Unsupported workspace destination fails closed
  return null;
}
