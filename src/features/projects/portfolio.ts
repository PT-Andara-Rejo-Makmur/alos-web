export type ProjectStatus = "ON_TRACK" | "AT_RISK" | "CRITICAL" | "COMPLETED";
export type DivisionHealth = "HEALTHY" | "ATTENTION" | "CRITICAL" | "NOT_CONNECTED";

export type PortfolioTrendPoint = {
  period: string;
  label: string;
  value: number | null;
};

export type DivisionOverviewCard = {
  division_id: string;
  division_code: string;
  division_name: string;
  health: DivisionHealth;
  active_projects: number;
  average_progress: number | null;
  overdue_tasks: number;
  pending_approvals: number;
  open_issues: number;
  critical_projects: number;
  at_risk_projects: number;
  trend: PortfolioTrendPoint[];
};

export type DivisionsOverviewSnapshot = {
  generated_at: string;
  divisions: DivisionOverviewCard[];
  comparison: DivisionOverviewCard[];
  issues: Array<{
    issue_id: string;
    division_code: string;
    division_name: string;
    title: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    owner_name: string | null;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
    due_date: string | null;
  }>;
  attention: Array<{
    division_id: string;
    division_code: string;
    division_name: string;
    health: "ATTENTION" | "CRITICAL";
    summary: string;
    trend: PortfolioTrendPoint[];
  }>;
};

export type ProjectPortfolioSnapshot = {
  generated_at: string;
  metrics: {
    total: number;
    on_track: number;
    at_risk: number;
    critical: number;
    completed: number;
  };
  progress: PortfolioTrendPoint[];
  distribution: Array<{ status: ProjectStatus; label: string; count: number }>;
  projects: Array<{
    project_id: string;
    workspace_id: string;
    code: string;
    name: string;
    division_code: string;
    division_name: string;
    workspace_name: string;
    category: string;
    owner_name: string | null;
    progress_percent: number;
    deadline: string | null;
    status: ProjectStatus;
    budget_planned: number | null;
    budget_spent: number | null;
    currency: string;
    overdue_tasks: number;
  }>;
  milestones: Array<{
    milestone_id: string;
    project_id: string;
    project_name: string;
    title: string;
    due_date: string;
    status: ProjectStatus;
  }>;
  risk_summary: Array<{
    status: "ON_TRACK" | "AT_RISK" | "CRITICAL";
    count: number;
    description: string;
  }>;
  filter_options: {
    divisions: string[];
    categories: string[];
    statuses: ProjectStatus[];
  };
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

export type ProjectPortfolioFilters = {
  division_code: string;
  status: string;
  category: string;
  date_from: string;
  date_to: string;
  search: string;
  page: number;
};

export function buildProjectPortfolioUrl(filters: ProjectPortfolioFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "page" || value) params.set(key, String(value));
  }
  params.set("page_size", "20");
  return `/api/v1/projects/portfolio?${params.toString()}`;
}

export function projectStatusLabel(status: ProjectStatus): string {
  if (status === "ON_TRACK") return "On Track";
  if (status === "AT_RISK") return "At Risk";
  if (status === "COMPLETED") return "Selesai";
  return "Critical";
}

export function divisionHealthLabel(health: DivisionHealth): string {
  if (health === "HEALTHY") return "Healthy";
  if (health === "ATTENTION") return "Perlu perhatian";
  if (health === "CRITICAL") return "Critical";
  return "Belum terhubung";
}

export function shortDivisionName(name: string): string {
  return name
    .replace("Sales & Marketing", "Marketing")
    .replace("Human Resources", "HR")
    .replace("Information Technology", "IT")
    .replace("Property & Project", "Project");
}

export function formatPortfolioPercent(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatPortfolioDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function formatPortfolioMoney(value: number | null, currency: string): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("id-ID", {
    currency,
    maximumFractionDigits: 0,
    notation: "compact",
    style: "currency",
  }).format(value);
}
