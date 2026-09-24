import type { Run } from "@/features/governance/core";
import type { SessionActor, Workspace } from "@/features/session";
import type { GenesisActiveAgent } from "@/features/genesis-workspace/types";
import { isGovernanceNavigationVisible } from "@/features/access-control/dashboard-access";
import { authenticatedApiRequest, withQuery } from "@/lib/api";

import type {
  ActiveWorkspaceResolution,
  AgentWorkforceRunSummary,
  BusinessAgentWorkforceItem,
} from "./types";

/**
 * Authoritative workspace verification for business Agent Workforce.
 *
 * Rules:
 * 1. An explicit requested workspace ID must be authorized in actor.workspace_ids and present in backend workspaces list.
 * 2. If no requested ID is provided:
 *    - If actor has exactly 1 authorized workspace in workspaces list, resolve to it.
 *    - If actor has >1 authorized workspaces, fail-closed (NEEDS_INFO) to prevent accidental bleed across divisions.
 *    - If actor has 0 authorized workspaces, fail-closed (NEEDS_INFO).
 * 3. Never infer active authority from array order for multi-workspace users.
 */
export function verifyActiveWorkspace(
  actor: SessionActor,
  workspaces: readonly Workspace[],
  requestedId?: string | null,
): ActiveWorkspaceResolution {
  const authorizedIds = new Set(actor.workspace_ids || []);

  if (requestedId) {
    if (!authorizedIds.has(requestedId)) {
      return {
        workspace: null,
        needsInfoReason: `Workspace ${requestedId} tidak diizinkan untuk sesi Anda. Silakan pilih workspace yang sesuai.`,
      };
    }
    const matched = workspaces.find((w) => w.workspace_id === requestedId);
    if (!matched) {
      return {
        workspace: null,
        needsInfoReason: `Workspace ${requestedId} tidak ditemukan pada backend.`,
      };
    }
    return { workspace: matched, needsInfoReason: null };
  }

  const validWorkspaces = workspaces.filter((w) => authorizedIds.has(w.workspace_id));

  if (validWorkspaces.length === 1) {
    return { workspace: validWorkspaces[0], needsInfoReason: null };
  }

  if (validWorkspaces.length > 1) {
    return {
      workspace: null,
      needsInfoReason: "Pengguna memiliki beberapa workspace. Silakan pilih workspace aktif terlebih dahulu.",
    };
  }

  return {
    workspace: null,
    needsInfoReason: "Tidak ada workspace aktif yang ditemukan untuk akun Anda.",
  };
}

/**
 * Fetches authoritative active agents for the verified workspace.
 * Projects them into business-safe workforce items.
 *
 * Zero-fabrication:
 * - If backend returns empty array, returns empty array.
 * - Never populates blueprint catalog or static mocks.
 * - Strips prompts, models, provider secrets, tools, and raw schemas.
 */
export async function loadBusinessAgentWorkforce(
  workspaceId: string,
): Promise<BusinessAgentWorkforceItem[]> {
  if (!workspaceId) return [];

  const rawActiveAgents = await authenticatedApiRequest<GenesisActiveAgent[]>(
    withQuery("/api/v1/genesis/active-agents", { workspace_id: workspaceId }),
  );

  if (!Array.isArray(rawActiveAgents)) {
    return [];
  }

  return rawActiveAgents.map((agent): BusinessAgentWorkforceItem => ({
    agentKey: agent.agent_key,
    name: agent.name || agent.agent_key,
    version: agent.semantic_version || "1.0.0",
    purpose: agent.purpose || "Capability automasi dan analisis terpandu.",
    riskLevel: agent.risk_level || "LOW",
    capabilityKeys: Array.isArray(agent.capability_keys) ? agent.capability_keys : [],
    divisionScope: Array.isArray(agent.division_scope) ? agent.division_scope : [],
    availability: "AVAILABLE",
    humanReviewRequired: true,
  }));
}

/**
 * Loads recent scoped runs for the active workspace.
 * Computes safe aggregate counts without exposing raw technical internals (model, provider, tokens, latency, cost).
 */
export async function loadScopedRunSummary(
  workspaceId: string,
): Promise<AgentWorkforceRunSummary> {
  if (!workspaceId) {
    return {
      latestRunAt: null,
      succeededCount: 0,
      blockedCount: 0,
      failedCount: 0,
      totalCount: 0,
    };
  }

  try {
    const runs = await authenticatedApiRequest<Run[]>(
      `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/runs?limit=50`,
    );

    if (!Array.isArray(runs) || runs.length === 0) {
      return {
        latestRunAt: null,
        succeededCount: 0,
        blockedCount: 0,
        failedCount: 0,
        totalCount: 0,
      };
    }

    const succeededCount = runs.filter((r) => r.status === "SUCCEEDED").length;
    const blockedCount = runs.filter((r) => r.status === "BLOCKED").length;
    const failedCount = runs.filter((r) => r.status === "FAILED").length;

    // Pick latest timestamp from created_at or completed_at
    const latestRun = [...runs].sort((a, b) => {
      const timeA = new Date(a.completed_at || a.created_at).getTime();
      const timeB = new Date(b.completed_at || b.created_at).getTime();
      return timeB - timeA;
    })[0];

    const latestRunAt = latestRun?.completed_at || latestRun?.created_at || null;

    return {
      latestRunAt,
      succeededCount,
      blockedCount,
      failedCount,
      totalCount: runs.length,
    };
  } catch {
    return {
      latestRunAt: null,
      succeededCount: 0,
      blockedCount: 0,
      failedCount: 0,
      totalCount: 0,
    };
  }
}

/**
 * Checks whether the current actor's roles authorize access to GENESIS technical control plane.
 */
export function canActorAccessGenesis(roles: readonly string[]): boolean {
  return isGovernanceNavigationVisible(roles) || roles.includes("IT_ADMIN");
}

/**
 * Formats a run timestamp safely for business users.
 */
export function formatRunTimestamp(timestamp: string | null): string {
  if (!timestamp) return "—";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
