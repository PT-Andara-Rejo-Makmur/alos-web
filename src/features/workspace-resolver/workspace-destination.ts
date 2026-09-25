/**
 * Resolves destination from Backend-projected workspace metadata only.
 * UX mapping layer before future dedicated /workspace/{division} shells.
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

  if (workspace.workspace_type === "EXECUTIVE") return "/director";

  // 4. Finance workspace
  if (
    key === "FINANCE" ||
    key.includes("FINANCE") ||
    div === "FINANCE"
  ) {
    return "/workspace/finance";
  }

  // 5. Property workspace
  if (
    key === "PROPERTY" ||
    key.includes("PROPERTY") ||
    div === "PROPERTY"
  ) {
    return "/workspace/property";
  }

  // 6. Sales & Marketing workspace
  if (
    key === "SALES" ||
    key.includes("SALES") ||
    div === "SALES" ||
    div === "SALES_MARKETING"
  ) {
    return "/workspace/sales";
  }

  // 7. HR / People workspace
  if (
    key === "HR" ||
    key.includes("HR") ||
    key.includes("PEOPLE") ||
    div === "HR" ||
    div === "PEOPLE"
  ) {
    return "/workspace/hr";
  }

  // 8. Legal & Compliance workspace
  if (
    key === "LEGAL" ||
    key.includes("LEGAL") ||
    key.includes("COMPLIANCE") ||
    div === "LEGAL" ||
    div === "COMPLIANCE" ||
    div === "LEGAL_COMPLIANCE"
  ) {
    return "/workspace/legal";
  }

  // 9. IT & Technology workspace
  if (
    key === "IT" ||
    key.includes("IT") ||
    key.includes("TECHNOLOGY") ||
    div === "IT" ||
    div === "TECHNOLOGY"
  ) {
    return "/workspace/it";
  }

  // Generic control-plane workspaces without an IT membership retain the
  // legacy Genesis destination. An IT membership itself always opens /workspace/it.
  if (workspace.workspace_type === "IT_OPERATIONS") return "/genesis";
  if (workspace.workspace_type === "GOVERNANCE") return "/governance";

  // 10. Business & Division workspaces
  if (
    key.startsWith("WS_") ||
    key.includes("BUSINESS") ||
    workspace.workspace_type === "BUSINESS" ||
    workspace.workspace_type === "SHARED" ||
    workspace.division_code !== null
  ) {
    return "/business";
  }

  // Unsupported workspace destination fails closed
  return null;
}
