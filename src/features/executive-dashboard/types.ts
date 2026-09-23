import type {
  ExecutiveDashboardMetric,
  ExecutiveDashboardSnapshot,
} from "@/features/executive-dashboard/legacy-projection";

export type {
  ExecutiveDashboardMetric,
  ExecutiveDashboardSnapshot,
};

export type ExecutiveBriefState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export type ExecutiveBriefBlockKey =
  | "health"
  | "decisions"
  | "early_warning"
  | "cash"
  | "agent_overnight";

export type ExecutiveBriefBlock = {
  readonly key: ExecutiveBriefBlockKey;
  readonly label: string;
  readonly title: string;
  readonly state: ExecutiveBriefState;
  readonly summary: string;
  readonly hint?: string;
  readonly href?: string;
};

export type DecisionQueueItem = {
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
};

export type DivisionHealthItem = {
  readonly division_code: string;
  readonly division_name: string;
  readonly health: "HEALTHY" | "ATTENTION" | "NOT_CONNECTED";
  readonly healthLabel: string;
  readonly document_count: number;
  readonly pending_approvals: number;
  readonly active_genesis_workflows: number;
};

export type ExecutiveAIContext = {
  readonly activeWorkflows: number;
  readonly evidenceLineageStatus: string;
  readonly available: boolean;
  readonly hint: string;
};
