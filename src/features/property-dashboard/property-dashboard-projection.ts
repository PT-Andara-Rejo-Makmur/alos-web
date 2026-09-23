import type {
  ConstructionCadenceItem,
  PropertyAgentSupportItem,
  PropertyDashboardSnapshot,
  PropertySourceReadinessItem,
} from "./types";
import type {
  ProjectPortfolioSnapshot,
} from "@/features/mvp1/lib/portfolio";

export const DEFAULT_PROPERTY_READINESS: readonly PropertySourceReadinessItem[] = [
  { key: "PROJECTS", label: "Projects", state: "LIVE" },
  { key: "MILESTONES", label: "Milestones", state: "LIVE" },
  { key: "ISSUES", label: "Issues", state: "LIVE" },
  { key: "BUDGET", label: "Budget", state: "PARTIAL" },
  { key: "SITE_EVIDENCE", label: "Site Evidence", state: "NOT_CONNECTED" },
];

export const DEFAULT_CONSTRUCTION_CADENCE: readonly ConstructionCadenceItem[] = [
  {
    frequency: "Harian",
    controlId: "TEC-D-01",
    name: "Bukti progres & opname",
    evidence: "Site evidence",
    status: "NOT_CONNECTED",
  },
  {
    frequency: "Harian",
    controlId: "TEC-D-02",
    name: "K3 / PPE briefing",
    evidence: "Safety log",
    status: "NOT_CONNECTED",
  },
  {
    frequency: "Mingguan",
    controlId: "TEC-W-01",
    name: "Progress vs baseline",
    evidence: "Project progress",
    status: "LIVE",
  },
  {
    frequency: "Mingguan",
    controlId: "TEC-W-02",
    name: "Hold-point signoff",
    evidence: "Checklist evidence",
    status: "NOT_CONNECTED",
  },
  {
    frequency: "Mingguan",
    controlId: "TEC-W-03",
    name: "NCR closure",
    evidence: "Issues / CAPA",
    status: "PARTIAL",
  },
  {
    frequency: "Bulanan",
    controlId: "TEC-M-01",
    name: "Change / payment / handover",
    evidence: "Cross-domain",
    status: "NOT_CONNECTED",
  },
];

export const DEFAULT_PROPERTY_AGENTS: readonly PropertyAgentSupportItem[] = [
  {
    id: "ALOS-AGT-017",
    name: "Technical / Property Progress",
    roleDescription: "Menganalisis jadwal, kurva progres, opname lapangan, dan RAB",
    status: "Target capability",
  },
  {
    id: "ALOS-AGT-004",
    name: "Checklist & Evidence",
    roleDescription: "Verifikasi kelengkapan bukti checklist mutu, foto geotag, dan K3",
    status: "Target capability",
  },
  {
    id: "ALOS-AGT-018",
    name: "CAPA & Risk",
    roleDescription: "Deteksi dini deviasi risiko dan rekomendasi tindakan korektif",
    status: "Target capability",
  },
  {
    id: "ALOS-AGT-006",
    name: "Approval & RACI",
    roleDescription: "Validasi kewenangan persetujuan berjenjang dan segregasi tugas (SoD)",
    status: "Target capability",
  },
];

export const DEFAULT_FALLBACK_PORTFOLIO: ProjectPortfolioSnapshot = {
  generated_at: "2026-09-23T00:00:00.000Z",
  metrics: {
    total: 3,
    on_track: 2,
    at_risk: 1,
    critical: 0,
    completed: 0,
  },
  progress: [
    { period: "2026-01", label: "Jan", value: 12 },
    { period: "2026-02", label: "Feb", value: 24 },
    { period: "2026-03", label: "Mar", value: 38 },
    { period: "2026-04", label: "Apr", value: 49 },
    { period: "2026-05", label: "Mei", value: 62 },
    { period: "2026-06", label: "Jun", value: 75 },
    { period: "2026-07", label: "Jul", value: 83 },
  ],
  distribution: [
    { status: "ON_TRACK", label: "On Track", count: 2 },
    { status: "AT_RISK", label: "At Risk", count: 1 },
    { status: "CRITICAL", label: "Critical", count: 0 },
    { status: "COMPLETED", label: "Completed", count: 0 },
  ],
  projects: [
    {
      project_id: "prj_park_01",
      workspace_id: "ws_prop_01",
      code: "AND-PRP-01",
      name: "The Park Residential Phase 1",
      division_code: "PROPERTY",
      division_name: "Property & Project",
      workspace_name: "Property Workspace",
      category: "RESIDENTIAL",
      owner_name: "Ir. Bambang Tri",
      progress_percent: 78.5,
      deadline: "2026-12-15",
      status: "ON_TRACK",
      budget_planned: 4500000000,
      budget_spent: 3200000000,
      currency: "IDR",
      overdue_tasks: 0,
    },
    {
      project_id: "prj_klaten_02",
      workspace_id: "ws_prop_01",
      code: "AND-PRP-02",
      name: "Klaten Commercial Hub",
      division_code: "PROPERTY",
      division_name: "Property & Project",
      workspace_name: "Property Workspace",
      category: "COMMERCIAL",
      owner_name: "Siti Rahmawati, ST",
      progress_percent: 42.0,
      deadline: "2027-03-30",
      status: "AT_RISK",
      budget_planned: 6800000000,
      budget_spent: 3100000000,
      currency: "IDR",
      overdue_tasks: 3,
    },
    {
      project_id: "prj_mulur_03",
      workspace_id: "ws_prop_01",
      code: "AND-PRP-03",
      name: "Mulur Eco Resort",
      division_code: "PROPERTY",
      division_name: "Property & Project",
      workspace_name: "Property Workspace",
      category: "RESORT",
      owner_name: "Eko Prasetyo",
      progress_percent: 21.0,
      deadline: "2027-08-20",
      status: "ON_TRACK",
      budget_planned: 12500000000,
      budget_spent: 2600000000,
      currency: "IDR",
      overdue_tasks: 0,
    },
  ],
  milestones: [
    {
      milestone_id: "mls_01",
      project_id: "prj_park_01",
      project_name: "The Park",
      title: "Site preparation",
      due_date: "2026-09-26",
      status: "ON_TRACK",
    },
    {
      milestone_id: "mls_02",
      project_id: "prj_klaten_02",
      project_name: "Klaten",
      title: "Foundation review",
      due_date: "2026-10-04",
      status: "AT_RISK",
    },
    {
      milestone_id: "mls_03",
      project_id: "prj_mulur_03",
      project_name: "Mulur",
      title: "Design freeze",
      due_date: "2026-10-12",
      status: "ON_TRACK",
    },
  ],
  risk_summary: [
    {
      status: "ON_TRACK",
      count: 2,
      description: "2 proyek berjalan sesuai jadwal dan anggaran baseline.",
    },
    {
      status: "AT_RISK",
      count: 1,
      description: "1 proyek teridentifikasi mengalami deviasi jadwal dan task overdue.",
    },
    {
      status: "CRITICAL",
      count: 0,
      description: "Tidak ada proyek dengan status kritis saat ini.",
    },
  ],
  filter_options: {
    divisions: ["PROPERTY"],
    categories: ["RESIDENTIAL", "COMMERCIAL", "RESORT"],
    statuses: ["ON_TRACK", "AT_RISK", "CRITICAL", "COMPLETED"],
  },
  pagination: {
    page: 1,
    page_size: 20,
    total_items: 3,
    total_pages: 1,
  },
};

export const DEFAULT_PROPERTY_SNAPSHOT: PropertyDashboardSnapshot = {
  portfolio: DEFAULT_FALLBACK_PORTFOLIO,
  readiness: DEFAULT_PROPERTY_READINESS,
  cadence: DEFAULT_CONSTRUCTION_CADENCE,
  agents: DEFAULT_PROPERTY_AGENTS,
};

export function buildPropertyDashboardSnapshot(
  portfolio?: ProjectPortfolioSnapshot | null,
  customReadiness?: readonly PropertySourceReadinessItem[],
  customCadence?: readonly ConstructionCadenceItem[],
  customAgents?: readonly PropertyAgentSupportItem[],
): PropertyDashboardSnapshot {
  const resolvedPortfolio = portfolio ?? DEFAULT_FALLBACK_PORTFOLIO;
  return {
    portfolio: resolvedPortfolio,
    readiness: customReadiness ?? DEFAULT_PROPERTY_READINESS,
    cadence: customCadence ?? DEFAULT_CONSTRUCTION_CADENCE,
    agents: customAgents ?? DEFAULT_PROPERTY_AGENTS,
  };
}

export function sortMilestonesDeterministically<T extends { due_date: string; status: string }>(
  milestones: readonly T[],
): readonly T[] {
  const priorityMap: Record<string, number> = {
    CRITICAL: 1,
    AT_RISK: 2,
    ON_TRACK: 3,
    COMPLETED: 4,
  };

  return [...milestones].sort((a, b) => {
    const priorityA = priorityMap[a.status] ?? 99;
    const priorityB = priorityMap[b.status] ?? 99;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
}
