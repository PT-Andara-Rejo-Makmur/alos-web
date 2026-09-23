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
      organization_name: "Tidak tersedia",
      role_label: "Direktur Utama",
    },
    metrics: [
      { key: "active_projects", label: "Proyek Aktif", value: null, unit: "COUNT", tone: "INFO", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "pending_approvals", label: "Keputusan Tertunda", value: null, unit: "COUNT", tone: "WARNING", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "average_progress", label: "Kemajuan Rata-Rata", value: null, unit: "PERCENT", tone: "INFO", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
      { key: "overdue_tasks", label: "Tugas Terlambat", value: null, unit: "COUNT", tone: "WARNING", state: "NOT_CONNECTED", context: "Sumber belum terhubung" },
    ],
    performance: { title: "Kinerja perusahaan", context: "Sumber belum terhubung", points: [] },
    project_distribution: { available: false, total: 0, context: "Sumber belum terhubung", items: [] },
    divisions: [],
    attention_projects: [],
    pending_approvals: [],
  };
}

/**
 * Maps current Backend snapshot into the 07.45 Brief 5-block readiness projection.
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
      href: "/business/approvals",
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

/**
 * Weights for decision queue sorting.
 * Urgent decisions are placed first: OVERDUE -> DUE_SOON -> NORMAL.
 */
const URGENCY_WEIGHT: Record<DecisionQueueItem["urgency"], number> = {
  OVERDUE: 3,
  DUE_SOON: 2,
  NORMAL: 1,
};

/**
 * Projects pending approvals into the Decision Queue with urgency ordering.
 * Material decisions always link to human verification without fake auto-actions.
 */
export function projectDecisionQueue(
  snapshot: ExecutiveDashboardSnapshot,
): readonly DecisionQueueItem[] {
  const items: DecisionQueueItem[] = snapshot.pending_approvals.map((approval) => ({
    approval_id: approval.approval_id,
    kind: approval.kind,
    kindLabel: approval.kind === "DOCUMENT" ? "DOCUMENT" : "AGENT RELEASE",
    title: approval.title,
    requested_by: approval.requested_by,
    workspace_name: approval.workspace_name,
    submitted_at: approval.submitted_at,
    age_days: approval.age_days,
    ageLabel: approval.age_days === 0 ? "Hari ini" : `${approval.age_days} hari lalu`,
    urgency: approval.urgency,
    urgencyLabel:
      approval.urgency === "OVERDUE"
        ? "Overdue"
        : approval.urgency === "DUE_SOON"
          ? "Mendekati Tenggat"
          : "Normal",
    href: "/business/approvals",
  }));

  return items.sort((a, b) => {
    const weightDiff = URGENCY_WEIGHT[b.urgency] - URGENCY_WEIGHT[a.urgency];
    if (weightDiff !== 0) return weightDiff;
    return b.age_days - a.age_days;
  });
}

/**
 * Projects division list for Organization Health panel.
 */
export function projectDivisionHealth(
  snapshot: ExecutiveDashboardSnapshot,
): readonly DivisionHealthItem[] {
  return snapshot.divisions.map((div) => ({
    division_code: div.division_code,
    division_name: div.division_name,
    health: div.health,
    healthLabel:
      div.health === "HEALTHY"
        ? "Healthy"
        : div.health === "ATTENTION"
          ? "Attention"
          : "Belum terhubung",
    document_count: div.document_count,
    pending_approvals: div.pending_approvals,
    active_genesis_workflows: div.active_genesis_workflows,
  }));
}

/**
 * Projects AI & GENESIS context safely without fabricated agent numbers or costs.
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

/**
 * Formats metric value: null MUST return "—", never "0".
 */
export function formatMetricDisplayValue(metric: ExecutiveDashboardMetric): string {
  if (metric.value === null) return "—";
  if (metric.unit === "PERCENT") {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(metric.value)}%`;
  }
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(metric.value);
}
