/**
 * Resolves destination path for a given workspace and principal roles.
 * UX mapping layer before future dedicated /workspace/{division} shells.
 */
export function resolveWorkspaceDestination(
  workspace: {
    readonly workspace_key?: string;
    readonly division_code?: string | null;
    readonly name?: string;
  },
  roles: readonly string[] = [],
): string | null {
  const key = (workspace.workspace_key || "").toUpperCase();
  const name = (workspace.name || "").toUpperCase();
  const div = (workspace.division_code || "").toUpperCase();

  // 1. Director / Executive roles and keys
  if (
    roles.includes("DIRECTOR") ||
    key.includes("DIRECTOR") ||
    name.includes("DIRECTOR") ||
    name.includes("EXECUTIVE")
  ) {
    return "/director";
  }

  // 2. IT Lead / GENESIS operations
  if (
    roles.includes("IT_LEAD") ||
    key.includes("GENESIS") ||
    key.includes("IT_LEAD") ||
    name.includes("GENESIS")
  ) {
    return "/genesis";
  }

  // 3. QA Security / Technical Reviewer / Governance
  if (
    roles.includes("QA_SECURITY") ||
    roles.includes("TECHNICAL_REVIEWER") ||
    key.includes("GOVERNANCE") ||
    name.includes("GOVERNANCE")
  ) {
    return "/governance";
  }

  // 4. Finance workspace
  if (
    key === "FINANCE" ||
    key.includes("FINANCE") ||
    div === "FINANCE" ||
    name.includes("FINANCE")
  ) {
    return "/workspace/finance";
  }

  // 5. Property workspace
  if (
    key === "PROPERTY" ||
    key.includes("PROPERTY") ||
    div === "PROPERTY" ||
    name.includes("PROPERTY")
  ) {
    return "/workspace/property";
  }

  // 6. Sales & Marketing workspace
  if (
    key === "SALES" ||
    key.includes("SALES") ||
    div === "SALES" ||
    div === "SALES_MARKETING" ||
    name.includes("SALES") ||
    name.includes("MARKETING")
  ) {
    return "/workspace/sales";
  }

  // 7. HR / People workspace
  if (
    key === "HR" ||
    key.includes("HR") ||
    key.includes("PEOPLE") ||
    div === "HR" ||
    div === "PEOPLE" ||
    name.includes("HR") ||
    name.includes("HUMAN RESOURCES") ||
    name.includes("PEOPLE")
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
    div === "LEGAL_COMPLIANCE" ||
    name.includes("LEGAL") ||
    name.includes("COMPLIANCE")
  ) {
    return "/workspace/legal";
  }

  // 9. IT & Technology workspace
  if (
    key === "IT" ||
    key.includes("IT") ||
    key.includes("TECHNOLOGY") ||
    div === "IT" ||
    div === "TECHNOLOGY" ||
    name.includes("IT") ||
    name.includes("TECHNOLOGY")
  ) {
    return "/workspace/it";
  }

  // 10. Business & Division workspaces
  if (
    key.startsWith("WS_") ||
    key.includes("BUSINESS") ||
    workspace.division_code !== null
  ) {
    return "/business";
  }

  // Unsupported workspace destination fails closed
  return null;
}
