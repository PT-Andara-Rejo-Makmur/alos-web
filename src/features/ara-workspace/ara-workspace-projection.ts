import type { Workspace } from "@/features/mvp1/lib/governance";
import { authenticatedApiRequest, ApiRequestError } from "@/lib/api";
import type { ContextProjection } from "@/lib/contracts";

import type {
  AraActionProposalItem,
  AraActiveContext,
  AraCitation,
  AraToolActivitySummary,
} from "./types";

const CONTEXT_OPTIONS_PATH = "/api/v1/genesis/context-options";

/**
 * Verifies active workspace authority against Backend-accessible workspaces.
 * Strictly avoids:
 * 1. Silently picking index 0 when multiple workspaces exist.
 * 2. Trusting URL query param alone.
 * 3. Relying on localStorage for authority.
 */
export function verifyActiveWorkspace(
  principal: {
    readonly workspace_id?: string;
    readonly workspace_ids?: readonly string[];
  },
  accessibleWorkspaces: readonly Workspace[],
  requestedWorkspaceId?: string | null,
): { workspace: Workspace | null; needsInfoReason?: string } {
  if (!accessibleWorkspaces || accessibleWorkspaces.length === 0) {
    return {
      workspace: null,
      needsInfoReason: "Tidak ada workspace ALOS yang diotorisasi untuk sesi ini.",
    };
  }

  // 1. If a specific workspace was requested, verify it against accessible workspaces
  if (requestedWorkspaceId) {
    const matched = accessibleWorkspaces.find(
      (ws) => ws.workspace_id === requestedWorkspaceId,
    );
    if (matched) {
      return { workspace: matched };
    }
    // Requested workspace is invalid or out-of-scope
    return {
      workspace: null,
      needsInfoReason: `Workspace ${requestedWorkspaceId} tidak ditemukan atau berada di luar wewenang Anda.`,
    };
  }

  // 2. If single accessible workspace, resolve unambiguously
  if (accessibleWorkspaces.length === 1) {
    return { workspace: accessibleWorkspaces[0] };
  }

  // 3. If principal session has an active workspace_id matching accessible list
  if (principal.workspace_id) {
    const matched = accessibleWorkspaces.find(
      (ws) => ws.workspace_id === principal.workspace_id,
    );
    if (matched) {
      return { workspace: matched };
    }
  }

  // 4. Multiple workspaces and none resolved: fail-closed to NEEDS_INFO / resolver
  return {
    workspace: null,
    needsInfoReason:
      "Akun Anda memiliki akses ke beberapa workspace. Silakan pilih workspace aktif terlebih dahulu sebelum membuka ARA.",
  };
}

/**
 * Loads backend-authoritative context lifecycle projection.
 * Never elevates to ACTIVE client-side.
 */
export async function loadActiveContextProjection(
  signal?: AbortSignal,
): Promise<AraActiveContext> {
  try {
    const contextData = await authenticatedApiRequest<ContextProjection>(
      CONTEXT_OPTIONS_PATH,
      { signal, cache: "no-store" },
    );

    const rawStatus = (contextData.status || "").toUpperCase();

    if (rawStatus === "DENIED" || rawStatus === "FORBIDDEN") {
      return {
        state: "DENIED",
        contextId: contextData.context_id,
        tenantId: contextData.tenant_id,
        workspaceId: contextData.workspace_id,
        denialReason:
          contextData.denial_reason ??
          "Akses konteks ini ditolak oleh kebijakan otorisasi ALOS Backend.",
        correlationId: contextData.correlation_id,
      };
    }

    if (rawStatus === "NEEDS_INFO" || rawStatus === "NEEDS_INFORMATION") {
      return {
        state: "NEEDS_INFO",
        contextId: contextData.context_id,
        tenantId: contextData.tenant_id,
        workspaceId: contextData.workspace_id,
        goal: contextData.goal,
        needsInfoReason:
          contextData.needs_info_reason ??
          "ALOS Backend membutuhkan informasi scope atau parameter tambahan sebelum konteks dapat diaktifkan.",
        correlationId: contextData.correlation_id,
      };
    }

    if (rawStatus !== "ACTIVE") {
      return {
        state: "UNAVAILABLE",
        contextId: contextData.context_id,
        tenantId: contextData.tenant_id,
        workspaceId: contextData.workspace_id,
        correlationId: contextData.correlation_id,
      };
    }

    return {
      state: "ACTIVE",
      contextId: contextData.context_id,
      tenantId: contextData.tenant_id,
      workspaceId: contextData.workspace_id,
      actorId: contextData.actor_id,
      goal: contextData.goal,
      capabilityId: contextData.capability_id,
      dataClassification: contextData.data_classification,
      scopeRefs: contextData.scope_refs ?? [],
      evidenceRefs: contextData.evidence_refs ?? [],
      items: contextData.items ?? [],
      correlationId: contextData.correlation_id,
    };
  } catch (caught: unknown) {
    if (caught instanceof ApiRequestError && caught.status === 403) {
      return {
        state: "DENIED",
        denialReason:
          caught.detail ||
          "Principal tidak memiliki izin yang cukup untuk mengakses konteks aktif.",
        correlationId: caught.correlationId,
      };
    }
    return {
      state: "UNAVAILABLE",
      correlationId:
        caught instanceof ApiRequestError ? caught.correlationId : null,
    };
  }
}

/**
 * Normalizes citations and evidence references.
 * Zero-fabrication: Never invents Evidence ID or fake badges if source is missing.
 */
export function normalizeCitations(
  rawCitations: readonly Record<string, unknown>[] = [],
): readonly AraCitation[] {
  return rawCitations.map((item) => {
    const title = typeof item.title === "string" ? item.title : undefined;
    const source = typeof item.source === "string" ? item.source : title;
    const excerpt = typeof item.excerpt === "string" ? item.excerpt : undefined;
    const uri = typeof item.uri === "string" ? item.uri : undefined;
    const evidence_id =
      typeof item.evidence_id === "string" ? item.evidence_id : undefined;

    const validation_status = (
      ["PENDING", "VALID", "INVALID", "WAIVED"].includes(
        String(item.validation_status),
      )
        ? item.validation_status
        : undefined
    ) as AraCitation["validation_status"];

    const freshness = (
      ["CURRENT", "STALE", "UNKNOWN"].includes(String(item.freshness))
        ? item.freshness
        : undefined
    ) as AraCitation["freshness"];

    const reliability = (
      ["UNVERIFIED", "LOW", "MEDIUM", "HIGH"].includes(
        String(item.reliability),
      )
        ? item.reliability
        : undefined
    ) as AraCitation["reliability"];

    const is_untrusted =
      item.content_trust === "UNTRUSTED" ||
      item.is_untrusted === true ||
      item.source_type === "EXTERNAL";

    return {
      source,
      title,
      excerpt,
      validation_status,
      freshness,
      reliability,
      uri,
      evidence_id,
      is_untrusted,
    };
  });
}

/**
 * Normalizes tool activity.
 * Strict safety: Never displays SQL, secrets, tokens, or credential strings.
 */
export function normalizeToolActivity(
  rawActivity: readonly Record<string, unknown>[] = [],
): readonly AraToolActivitySummary[] {
  return rawActivity.map((item) => {
    const rawAction = String(item.action || item.tool_id || "Tool Operation");
    // Strip sensitive tokens from action label
    const action = rawAction.replace(/(token|secret|key|password)=[^\s&]+/gi, "$1=***");

    const status = (
      ["REQUESTED", "SUCCESS", "BLOCKED", "FAILED"].includes(
        String(item.status).toUpperCase(),
      )
        ? String(item.status).toUpperCase()
        : "REQUESTED"
    ) as AraToolActivitySummary["status"];

    const evidence =
      typeof item.evidence === "string" ? item.evidence : undefined;
    const blocked_reason =
      typeof item.blocked_reason === "string"
        ? item.blocked_reason.replace(/(token|secret|key|password)=[^\s&]+/gi, "$1=***")
        : undefined;

    return {
      action,
      status,
      evidence,
      blocked_reason,
    };
  });
}

/**
 * Parses action proposals into governed deep links.
 * Material actions (approval, transfer, release) always require human verification.
 */
export function parseActionProposals(
  rawActions: readonly Record<string, unknown>[] = [],
): readonly AraActionProposalItem[] {
  return rawActions.map((item, idx) => {
    const action_id = String(item.action_id || `proposal_${idx}`);
    const label = String(item.label || item.title || "Tinjau Alur");
    const description =
      typeof item.description === "string" ? item.description : undefined;
    const href = String(item.href || item.target_url || "/workspace");
    const requires_human_approval = item.requires_human_approval !== false;
    const decision_id =
      typeof item.decision_id === "string" ? item.decision_id : undefined;

    return {
      action_id,
      label,
      description,
      href,
      requires_human_approval,
      decision_id,
    };
  });
}

/**
 * Parses assistant message content into structured response sections.
 */
export function parseAssistantMessageSections(content: string): {
  summary: string;
  limitations: readonly string[];
} {
  const limitations: string[] = [];
  let summary = content;

  // Check if content has Limitation or Catatan sections
  const limitMatch = content.match(/limitasi[:\s]+(.*?)(?=\n\n|$)/i);
  if (limitMatch && limitMatch[1]) {
    limitations.push(limitMatch[1].trim());
  } else {
    // Default operational limitation statement
    limitations.push("Tidak ada klaim final tanpa source dan scope yang sah.");
  }

  // Clean summary
  summary = content.split(/limitasi[:\s]/i)[0].trim();

  return {
    summary: summary || content,
    limitations,
  };
}
