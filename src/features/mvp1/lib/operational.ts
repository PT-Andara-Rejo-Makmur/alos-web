export type TaskStatus = "DRAFT" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";

export type OperationalTask = {
  task_id: string;
  workspace_id: string;
  division_code: string;
  project_id: string | null;
  project_name: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  due_date: string | null;
  assignee_user_id: string | null;
  owner_user_id: string;
  evidence_required: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type Finding = {
  finding_id: string;
  workspace_id: string;
  division_code: string | null;
  project_id: string | null;
  source_kind: string;
  source_id: string | null;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
  recommendation: string;
  resolution: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Approval = {
  approval_request_id: string;
  workspace_id: string;
  division_code: string | null;
  approval_kind: string;
  subject_type: string;
  subject_id: string;
  payload_digest: string;
  title: string;
  description: string;
  urgency: "NORMAL" | "URGENT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  requested_by_user_id: string | null;
  approver_user_id: string | null;
  decision_notes: string | null;
  requested_at: string;
  decided_at: string | null;
};

export type ProposedAction = {
  proposed_action_id: string;
  workspace_id: string;
  division_code: string | null;
  project_id: string | null;
  action_type: "TASK_CREATE" | "FINDING_CREATE";
  payload: Record<string, unknown>;
  payload_digest: string;
  risk_level: string;
  status: "DRAFT" | "APPROVAL_REQUIRED" | "APPROVED" | "REJECTED" | "EXECUTED" | "FAILED";
  created_at: string;
  executed_at: string | null;
  approval_request_id: string | null;
  approval_status: string | null;
  executed_entity_type: string | null;
  executed_entity_id: string | null;
};

export type ReportDefinition = {
  report_definition_id: string;
  workspace_id: string;
  division_code: string | null;
  project_id: string | null;
  name: string;
  template_key: string;
  scope: string;
  period: string;
  sections: unknown[];
  data_sources: unknown[];
  status: string;
  review_required: boolean;
  recipient_user_ids: string[];
  owner_user_id: string;
  created_at: string;
  updated_at: string;
  schedule_expression: string | null;
  timezone: string | null;
  next_run_at: string | null;
};

export type Report = {
  report_id: string;
  report_definition_id: string;
  workspace_id: string;
  status: string;
  content: Record<string, unknown>;
  provenance: Array<Record<string, unknown>>;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
};

export type OperationalDashboard = {
  generated_at: string;
  scope: string;
  metrics: Record<string, number>;
  tasks: OperationalTask[];
  findings: Finding[];
  approvals: Approval[];
  reports: Report[];
};

export type TaskList = {
  items: OperationalTask[];
  pagination: { page: number; page_size: number; total_items: number; total_pages: number };
};

export type SearchResult = {
  entity_type: "DIVISION" | "PROJECT" | "TASK" | "DOCUMENT" | "REPORT" | "FINDING" | "AGENT";
  entity_id: string;
  title: string;
  subtitle: string;
  href: string;
  division_code: string | null;
  updated_at: string;
};

export type Notification = {
  notification_id: string;
  workspace_id: string | null;
  notification_type: string;
  title: string;
  body: string;
  entity_type: string;
  entity_id: string;
  read_at: string | null;
  created_at: string;
};

export function formatOperationalDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function humanStatus(value: string | null | undefined): string {
  if (!value) return "—";
  return value.toLowerCase().replaceAll("_", " ");
}


