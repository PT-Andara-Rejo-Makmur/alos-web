import type { Workspace } from "@/features/session";
import { formatRoleLabel } from "@/features/access-control/dashboard-access";
import { resolveWorkspaceDestination } from "./workspace-destination";

export type WorkspaceChoice = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly divisionCode: string | null;
  readonly divisionLabel: string;
  readonly roleLabel: string;
  readonly contextMetadata: string;
  readonly initial: string;
  readonly destination: string | null;
  readonly isAvailable: boolean;
};

const DIVISION_DISPLAY_NAMES: Record<string, string> = {
  FINANCE: "FINANCE",
  HR: "HUMAN RESOURCES",
  LEGAL: "LEGAL & COMPLIANCE",
  PROPERTY: "PROPERTY & ASSET",
  SALES_MARKETING: "SALES & MARKETING",
  SALES: "SALES & MARKETING",
  IT: "IT & TECHNOLOGY",
};

export function projectWorkspaceChoices(
  workspaces: readonly Workspace[],
): readonly WorkspaceChoice[] {
  return workspaces.map((ws) => {
    const div = (ws.division_code || "").toUpperCase();
    const destination = resolveWorkspaceDestination(ws);
    const isAvailable = destination !== null;

    let divisionLabel = ws.division_code ? (DIVISION_DISPLAY_NAMES[div] || div) : "ENTERPRISE";
    const roleLabel = formatRoleLabel(ws.role_refs ?? []);

    if (ws.workspace_type === "EXECUTIVE") {
      divisionLabel = "EXECUTIVE";
    } else if (ws.workspace_type === "IT_OPERATIONS") {
      divisionLabel = "IT OPERATIONS";
    } else if (ws.workspace_type === "GOVERNANCE") {
      divisionLabel = "GOVERNANCE";
    }

    const initial = ws.division_code
      ? ws.division_code.charAt(0).toUpperCase()
      : ws.name.charAt(0).toUpperCase();

    const contextMetadata = ws.division_code
      ? `Divisi ${ws.division_code} · Akses sesuai Backend`
      : "Akses sesuai Backend";

    return {
      id: ws.workspace_id,
      key: ws.workspace_key,
      name: ws.name,
      divisionCode: ws.division_code,
      divisionLabel,
      roleLabel,
      contextMetadata,
      initial,
      destination,
      isAvailable,
    };
  });
}
