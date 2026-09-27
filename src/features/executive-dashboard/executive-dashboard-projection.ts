import type {
  DecisionQueueItem,
  DivisionHealthItem,
  ExecutiveAIContext,
  ExecutiveBriefBlock,
  ExecutiveDashboardMetric,
  ExecutiveDashboardSnapshot,
} from "./types";

export function createEmptyExecutiveSnapshot(): ExecutiveDashboardSnapshot {
  return {
    generated_at: "",
    profile: {
      display_name: "Tidak tersedia",
      organization_name: "PT Andara Rejo Makmur",
      role_label: "Direktur Utama",
    },
    metrics: [
      { key: "active_projects", label: "Proyek Aktif", value: null, unit: "COUNT", tone: "INFO", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "pending_approvals", label: "Keputusan Menunggu", value: null, unit: "COUNT", tone: "WARNING", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "average_progress", label: "Kemajuan Pekerjaan", value: null, unit: "PERCENT", tone: "INFO", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "overdue_tasks", label: "Tugas Terlambat", value: null, unit: "COUNT", tone: "WARNING", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
    ],
    performance: { title: "Kinerja perusahaan", context: "Sumber belum terhubung", points: [] },
    project_distribution: { available: false, total: 0, context: "Sumber belum terhubung", items: [] },
    divisions: [],
    attention_projects: [],
    pending_approvals: [],
  };
}

export function formatMetricDisplayValue(metric: ExecutiveDashboardMetric): string {
  if (metric.value === null || metric.value === undefined) return "—";
  if (metric.unit === "PERCENT") {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(metric.value)}%`;
  }
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(metric.value);
}

export function formatDateIndonesian(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "—";
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(d);
    return `${dateFormatted} WIB`;
  } catch {
    return "—";
  }
}

export function approvalKindLabel(kind: "DOCUMENT" | "AGENT_RELEASE" | string): string {
  if (kind === "AGENT_RELEASE") return "Release Agent";
  return "Dokumen";
}

export function approvalAgeLabel(ageDays: number): string {
  if (ageDays === 0) return "Hari ini";
  return `${ageDays} hari`;
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

export function formatJakartaDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatJakartaTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour}.${minute} WIB`;
}

export const formatExecutiveMetric = formatMetricDisplayValue;

/**
 * Maps snapshot into the 5-block Executive Brief projection.
 * Strategic targets (cash, agent overnight) are honestly marked as NOT_CONNECTED.
 */
export function projectExecutiveBrief(
  snapshot: ExecutiveDashboardSnapshot,
): readonly ExecutiveBriefBlock[] {
  const pendingCount = snapshot.pending_approvals.length;
  const hasDivisions = snapshot.divisions.length > 0;

  return [
    {
      key: "health",
      label: "Kesehatan",
      title: "Kesehatan Perusahaan",
      state: hasDivisions ? "PARTIAL" : "NOT_CONNECTED",
      summary: hasDivisions ? "Partial" : "Belum terhubung",
      hint: "Data divisi aktif; 9 lajur strategis penuh belum terhubung.",
    },
    {
      key: "decisions",
      label: "Keputusan",
      title: "Antrean Keputusan",
      state: "LIVE",
      summary: `${pendingCount} pending`,
      hint: `${pendingCount} item menunggu keputusan manusia.`,
      href: "/workspace/executive/approvals",
    },
    {
      key: "early_warning",
      label: "Early Warning",
      title: "Peringatan Dini",
      state: "PARTIAL",
      summary: "Partial",
      hint: "Mencakup perhatian proyek & task; risiko keuangan & legal belum terhubung.",
    },
    {
      key: "cash",
      label: "Kas & Dompet",
      title: "Posisi Kas & Likuiditas",
      state: "NOT_CONNECTED",
      summary: "Belum terhubung",
      hint: "Sumber data arus kas dan dompet belum terintegrasi.",
    },
    {
      key: "agent_overnight",
      label: "Jejak Agent",
      title: "Jejak Agent Semalam",
      state: "NOT_CONNECTED",
      summary: "Belum terhubung",
      hint: "Log dan ringkasan audit agent semalam belum terhubung.",
    },
  ];
}

const URGENCY_WEIGHT: Record<DecisionQueueItem["urgency"], number> = {
  OVERDUE: 3,
  DUE_SOON: 2,
  NORMAL: 1,
};

/**
 * Projects pending approvals into the Decision Queue with urgency ordering:
 * TERLAMBAT (OVERDUE) -> MENDEKATI TENGGAT (DUE_SOON) -> NORMAL.
 */
export function projectDecisionQueue(
  snapshot: ExecutiveDashboardSnapshot,
): readonly DecisionQueueItem[] {
  const items: DecisionQueueItem[] = snapshot.pending_approvals.map((approval) => ({
    approval_id: approval.approval_id,
    kind: approval.kind,
    kindLabel: approval.kind === "DOCUMENT" ? "Dokumen" : "Rilis GENESIS",
    title: approval.title,
    requested_by: approval.requested_by,
    workspace_name: approval.workspace_name,
    submitted_at: approval.submitted_at,
    age_days: approval.age_days,
    ageLabel: approvalAgeLabel(approval.age_days),
    urgency: approval.urgency,
    urgencyLabel:
      approval.urgency === "OVERDUE"
        ? "Terlambat"
        : approval.urgency === "DUE_SOON"
          ? "Mendekati Tenggat"
          : "Normal",
    href: "/workspace/executive/approvals",
  }));

  return items.sort((a, b) => {
    const weightDiff = URGENCY_WEIGHT[b.urgency] - URGENCY_WEIGHT[a.urgency];
    if (weightDiff !== 0) return weightDiff;
    return b.age_days - a.age_days;
  });
}

/**
 * Projects division list with honest status labels:
 * Sehat / Perlu Perhatian / Kritis / Belum Terhubung
 */
export function projectDivisionHealth(
  snapshot: ExecutiveDashboardSnapshot,
): readonly DivisionHealthItem[] {
  return snapshot.divisions.map((div) => {
    let healthLabel = "Belum terhubung";
    if (div.health === "HEALTHY") {
      healthLabel = "Sehat";
    } else if (div.health === "ATTENTION") {
      healthLabel = "Perlu Perhatian";
    } else if (div.health === "CRITICAL") {
      healthLabel = "Kritis";
    }

    return {
      division_code: div.division_code,
      division_name: div.division_name,
      health: div.health,
      healthLabel,
      document_count: div.document_count,
      pending_approvals: div.pending_approvals,
      active_genesis_workflows: div.active_genesis_workflows,
    };
  });
}

/**
 * Projects early warning signals solely from REAL operational data:
 * - Critical projects
 * - At-risk projects
 * - Overdue decisions
 * - Divisions requiring attention
 */
export function projectEarlyWarnings(snapshot: ExecutiveDashboardSnapshot) {
  const criticalProjects = snapshot.attention_projects.filter((p) => p.status === "CRITICAL");
  const atRiskProjects = snapshot.attention_projects.filter((p) => p.status === "AT_RISK");
  const overdueDecisions = snapshot.pending_approvals.filter((a) => a.urgency === "OVERDUE");
  const attentionDivisions = snapshot.divisions.filter(
    (d) => d.health === "ATTENTION" || d.health === "CRITICAL",
  );

  const totalWarnings =
    criticalProjects.length +
    atRiskProjects.length +
    overdueDecisions.length +
    attentionDivisions.length;

  return {
    totalWarnings,
    criticalProjects,
    atRiskProjects,
    overdueDecisions,
    attentionDivisions,
  };
}

/**
 * Projects AI & GENESIS context safely without fabricated numbers.
 */
export function projectExecutiveAIContext(
  snapshot: ExecutiveDashboardSnapshot,
): ExecutiveAIContext {
  const activeWorkflows = snapshot.divisions.reduce(
    (sum, div) => sum + (div.active_genesis_workflows || 0),
    0,
  );

  return {
    activeWorkflows,
    evidenceLineageStatus: "Belum tersedia",
    available: true,
    hint: "Total alur kerja analisis GENESIS yang aktif di seluruh divisi.",
  };
}
