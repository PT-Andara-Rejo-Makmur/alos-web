export type ExecutiveDashboardMetric = {
  key: "active_projects" | "average_progress" | "overdue_tasks" | "pending_approvals";
  label: string;
  value: number | null;
  unit: "COUNT" | "PERCENT";
  tone: "SUCCESS" | "WARNING" | "DANGER" | "INFO";
  state: "LIVE" | "NOT_CONNECTED";
  context: string;
};

export type ExecutiveDashboardSnapshot = {
  generated_at: string;
  profile: {
    display_name: string;
    organization_name: string;
    role_label: "Direktur Utama";
  };
  metrics: ExecutiveDashboardMetric[];
  performance: {
    title: string;
    context: string;
    points: Array<{
      period: string;
      label: string;
      value: number | null;
      decision_count: number;
    }>;
  };
  project_distribution: {
    available: boolean;
    total: number;
    context: string;
    items: Array<{
      key: "COMPLETED" | "ON_TRACK" | "AT_RISK" | "CRITICAL";
      label: string;
      count: number;
      tone: "BLUE" | "GREEN" | "AMBER" | "RED";
    }>;
  };
  divisions: Array<{
    division_code: string;
    division_name: string;
    health: "HEALTHY" | "ATTENTION" | "NOT_CONNECTED";
    document_count: number;
    pending_approvals: number;
    active_genesis_workflows: number;
  }>;
  attention_projects: Array<{
    project_id: string;
    name: string;
    progress_percent: number;
    status: "ON_TRACK" | "AT_RISK" | "CRITICAL";
  }>;
  pending_approvals: Array<{
    approval_id: string;
    kind: "DOCUMENT" | "AGENT_RELEASE";
    title: string;
    requested_by: string;
    workspace_name: string;
    submitted_at: string;
    age_days: number;
    urgency: "NORMAL" | "DUE_SOON" | "OVERDUE";
  }>;
};

export function formatExecutiveMetric(metric: ExecutiveDashboardMetric): string {
  if (metric.value === null) return "—";
  if (metric.unit === "PERCENT") {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(metric.value)}%`;
  }
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(metric.value);
}

export function executiveGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function executiveFirstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] || "Direktur";
}

export function approvalKindLabel(kind: "DOCUMENT" | "AGENT_RELEASE"): string {
  return kind === "DOCUMENT" ? "Dokumen" : "Release Agent";
}

export function approvalAgeLabel(ageDays: number): string {
  if (ageDays === 0) return "Hari ini";
  return `${ageDays} hari`;
}
