export type ExecutiveDashboardMetricKey =
  | "active_projects"
  | "average_progress"
  | "overdue_tasks"
  | "pending_approvals";

export interface ExecutiveDashboardMetric {
  readonly key: ExecutiveDashboardMetricKey | string;
  readonly label: string;
  readonly value: number | null;
  readonly unit: "COUNT" | "PERCENT";
  readonly tone: "SUCCESS" | "WARNING" | "DANGER" | "INFO";
  readonly state: "LIVE" | "NOT_CONNECTED";
  readonly context: string;
}

export interface ExecutiveDashboardSnapshot {
  readonly generated_at: string;
  readonly profile: {
    readonly display_name: string;
    readonly organization_name: string;
    readonly role_label: string;
  };
  readonly metrics: readonly ExecutiveDashboardMetric[];
  readonly performance: {
    readonly title: string;
    readonly context: string;
    readonly points: ReadonlyArray<{
      readonly period: string;
      readonly label: string;
      readonly value: number | null;
      readonly decision_count: number;
    }>;
  };
  readonly project_distribution: {
    readonly available: boolean;
    readonly total: number;
    readonly context: string;
    readonly items: ReadonlyArray<{
      readonly key: "COMPLETED" | "ON_TRACK" | "AT_RISK" | "CRITICAL" | string;
      readonly label: string;
      readonly count: number;
      readonly tone: "BLUE" | "GREEN" | "AMBER" | "RED" | string;
    }>;
  };
  readonly divisions: ReadonlyArray<{
    readonly division_code: string;
    readonly division_name: string;
    readonly health: "HEALTHY" | "ATTENTION" | "CRITICAL" | "NOT_CONNECTED";
    readonly document_count: number;
    readonly pending_approvals: number;
    readonly active_genesis_workflows: number;
  }>;
  readonly attention_projects: ReadonlyArray<{
    readonly project_id: string;
    readonly name: string;
    readonly progress_percent: number;
    readonly status: "ON_TRACK" | "AT_RISK" | "CRITICAL";
  }>;
  readonly pending_approvals: ReadonlyArray<{
    readonly approval_id: string;
    readonly kind: "DOCUMENT" | "AGENT_RELEASE";
    readonly title: string;
    readonly requested_by: string;
    readonly workspace_name: string;
    readonly submitted_at: string;
    readonly age_days: number;
    readonly urgency: "NORMAL" | "DUE_SOON" | "OVERDUE";
  }>;
}

export type ExecutiveBriefState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export type ExecutiveBriefBlockKey =
  | "health"
  | "decisions"
  | "early_warning"
  | "cash"
  | "agent_overnight";

export interface ExecutiveBriefBlock {
  readonly key: ExecutiveBriefBlockKey | string;
  readonly label: string;
  readonly title: string;
  readonly state: ExecutiveBriefState;
  readonly summary: string;
  readonly hint?: string;
  readonly href?: string;
}

export interface DecisionQueueItem {
  readonly approval_id: string;
  readonly kind: "DOCUMENT" | "AGENT_RELEASE";
  readonly kindLabel: string;
  readonly title: string;
  readonly requested_by: string;
  readonly workspace_name: string;
  readonly submitted_at: string;
  readonly age_days: number;
  readonly ageLabel: string;
  readonly urgency: "NORMAL" | "DUE_SOON" | "OVERDUE";
  readonly urgencyLabel: string;
  readonly href: string;
}

export interface DivisionHealthItem {
  readonly division_code: string;
  readonly division_name: string;
  readonly health: "HEALTHY" | "ATTENTION" | "CRITICAL" | "NOT_CONNECTED";
  readonly healthLabel: string;
  readonly document_count: number;
  readonly pending_approvals: number;
  readonly active_genesis_workflows: number;
}

export interface ExecutiveAIContext {
  readonly activeWorkflows: number;
  readonly evidenceLineageStatus: string;
  readonly available: boolean;
  readonly hint: string;
}

/**
 * Persetujuan Rilis GENESIS yang memerlukan keputusan Direktur (READY_FOR_DIRECTOR)
 */
export interface GenesisDirectorApprovalItem {
  readonly release_id: string;
  readonly subject_id: string;
  readonly subject_name: string;
  readonly subject_version: string;
  readonly objective: string;
  readonly problem_statement: string;
  readonly current_state: string;
  readonly qa_summary?: string | null;
  readonly genesis_review_summary?: string | null;
  readonly it_decision_summary?: string | null;
  readonly director_requirement_reason: string;
  readonly materiality?: "MATERIAL" | "NON_MATERIAL" | null;
  readonly evidence_ref?: string | null;
  readonly requester_name?: string | null;
  readonly submitted_at?: string | null;
}
