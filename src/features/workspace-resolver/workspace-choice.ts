import type { Workspace } from "@/features/session";
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

const DIVISION_ROLE_LABELS: Record<string, string> = {
  FINANCE: "Finance Manager",
  HR: "HR Manager",
  LEGAL: "Legal Specialist",
  PROPERTY: "Property Manager",
  SALES_MARKETING: "Sales Lead",
  SALES: "Sales Lead",
  IT: "Technology Lead",
};

export function projectWorkspaceChoices(
  workspaces: readonly Workspace[],
  roles: readonly string[] = [],
): readonly WorkspaceChoice[] {
  return workspaces.map((ws) => {
    const div = (ws.division_code || "").toUpperCase();
    const destination = resolveWorkspaceDestination(ws, roles);
    const isAvailable = destination !== null;

    let divisionLabel = ws.division_code ? (DIVISION_DISPLAY_NAMES[div] || div) : "ENTERPRISE";
    let roleLabel = ws.division_code ? (DIVISION_ROLE_LABELS[div] || "Manager") : "Pengguna ALOS";

    if (roles.includes("DIRECTOR") || ws.workspace_key?.toLowerCase().includes("director")) {
      divisionLabel = "EXECUTIVE";
      roleLabel = "Direktur Utama";
    } else if (roles.includes("IT_LEAD") || ws.workspace_key?.toLowerCase().includes("it")) {
      divisionLabel = "IT OPERATIONS";
      roleLabel = "IT Lead";
    } else if (roles.includes("QA_SECURITY") || roles.includes("TECHNICAL_REVIEWER")) {
      divisionLabel = "GOVERNANCE";
      roleLabel = "Wakil IT";
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
