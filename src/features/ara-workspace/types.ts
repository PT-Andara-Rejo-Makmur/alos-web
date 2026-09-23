import type { SessionActor } from "@/features/session";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import type { ContextItem, EvidenceRef } from "@/lib/contracts";

export interface ConversationRouteAdapter {
  readonly basePath: string;
  conversationUrl(id: string): string;
}

export type AraSourceMode = "AUTO" | "INTERNAL" | "EXTERNAL" | "GABUNGAN";

export type AraContextLifecycleState =
  | "LOADING"
  | "ACTIVE"
  | "DENIED"
  | "NEEDS_INFO"
  | "UNAVAILABLE";

export type ContextEntityType =
  | "DOCUMENT"
  | "PROJECT"
  | "TASK"
  | "EVIDENCE"
  | "FINDING"
  | "REPORT";

export interface AraCitation {
  readonly source?: string;
  readonly title?: string;
  readonly excerpt?: string;
  readonly validation_status?: "PENDING" | "VALID" | "INVALID" | "WAIVED";
  readonly freshness?: "CURRENT" | "STALE" | "UNKNOWN";
  readonly reliability?: "UNVERIFIED" | "LOW" | "MEDIUM" | "HIGH";
  readonly uri?: string;
  readonly evidence_id?: string;
  readonly is_untrusted?: boolean;
}

export interface AraActionProposalItem {
  readonly action_id: string;
  readonly label: string;
  readonly description?: string;
  readonly href: string;
  readonly requires_human_approval: boolean;
  readonly decision_id?: string;
}

export interface AraToolActivitySummary {
  readonly action: string;
  readonly status: "REQUESTED" | "SUCCESS" | "BLOCKED" | "FAILED";
  readonly evidence?: string;
  readonly blocked_reason?: string;
}

export interface AraMessage {
  readonly message_id: string;
  readonly actor_kind: "HUMAN" | "SYSTEM";
  readonly content: string;
  readonly status: string;
  readonly summary?: string;
  readonly citations?: readonly AraCitation[];
  readonly limitations?: readonly string[];
  readonly action_proposals?: readonly AraActionProposalItem[];
  readonly tool_activity?: readonly AraToolActivitySummary[];
  readonly created_at: string;
}

export interface AraConversation {
  readonly conversation_id: string;
  readonly workspace_id: string | null;
  readonly title: string | null;
  readonly context_mode: "AUTO" | "INTERNAL" | "EXTERNAL" | "INTERNAL_AND_EXTERNAL";
  readonly status: "OPEN" | "CLOSED";
  readonly created_at: string;
  readonly updated_at: string | null;
}

export interface AraContextOption {
  readonly entity_type: ContextEntityType;
  readonly entity_id: string;
  readonly title: string;
  readonly source_version?: string;
  readonly status?: string;
  readonly scope?: string;
}

export interface AraActiveContext {
  readonly state: AraContextLifecycleState;
  readonly contextId?: string;
  readonly tenantId?: string;
  readonly organizationId?: string;
  readonly workspaceId?: string | null;
  readonly actorId?: string;
  readonly workspaceLabel?: string;
  readonly divisionCode?: string | null;
  readonly goal?: string;
  readonly capabilityId?: string;
  readonly dataClassification?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  readonly scopeRefs?: readonly string[];
  readonly evidenceRefs?: readonly EvidenceRef[];
  readonly items?: readonly ContextItem[];
  readonly needsInfoReason?: string;
  readonly denialReason?: string;
  readonly correlationId?: string | null;
}

export interface AraWorkspaceProps {
  readonly actor: SessionActor;
  readonly activeWorkspace: WorkspaceShellIdentity;
  readonly routeAdapter?: ConversationRouteAdapter;
  readonly initialConversationId?: string;
  readonly initialQuery?: string;
}
