import type { SessionActor, Workspace } from "@/features/mvp1/lib/governance";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";

/**
 * Business-safe projection of an Agent / Capability.
 * Strips raw prompts, tool credentials, provider keys, tokens, costs, and schema definitions.
 */
export interface BusinessAgentWorkforceItem {
  readonly agentKey: string;
  readonly name: string;
  readonly version: string;
  readonly purpose: string;
  readonly riskLevel: string;
  readonly capabilityKeys: readonly string[];
  readonly divisionScope: readonly string[];
  readonly availability: "AVAILABLE" | "UNAVAILABLE";
  readonly humanReviewRequired: boolean;
}

/**
 * Safe summary of recent scoped runs for the active workspace.
 * Never exposes raw provider, model, tokens, or execution debug traces.
 */
export interface AgentWorkforceRunSummary {
  readonly latestRunAt: string | null;
  readonly succeededCount: number;
  readonly blockedCount: number;
  readonly failedCount: number;
  readonly totalCount: number;
}

/**
 * Lifecycle and verification status of the workforce projection.
 */
export type AgentWorkforceStatus = "IDLE" | "LOADING" | "AVAILABLE" | "EMPTY" | "ERROR";

/**
 * Props for the composite AgentWorkforce component.
 */
export interface AgentWorkforceProps {
  readonly actor: SessionActor;
  readonly activeWorkspace: WorkspaceShellIdentity;
  readonly onUseViaAra?: (agent: BusinessAgentWorkforceItem) => void;
}

/**
 * Active workspace verification outcome.
 */
export interface ActiveWorkspaceResolution {
  readonly workspace: Workspace | null;
  readonly needsInfoReason: string | null;
}
