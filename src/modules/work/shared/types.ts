/**
 * Shared Work Presentation Layer Types & Models
 * 
 * Re-exports and strengthens operational models without inventing fake contracts.
 */

import type { ActiveWorkspaceContext } from "@/features/workspace-routing";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell";

export type WorkWorkspaceContext = ActiveWorkspaceContext | WorkspaceShellIdentity;

export type StrategyLinkState = "CONNECTED" | "NO_LINK" | "SOURCE_UNAVAILABLE";

export interface StrategyLinkageInfo {
  readonly state: StrategyLinkState;
  readonly objective_id?: string | null;
  readonly objective_title?: string | null;
  readonly kpi_id?: string | null;
  readonly kpi_name?: string | null;
  readonly initiative_id?: string | null;
  readonly initiative_title?: string | null;
  readonly corrective_action_id?: string | null;
}

export type WorkModuleKind = "projects" | "tasks" | "approvals" | "documents" | "reports" | "findings";
