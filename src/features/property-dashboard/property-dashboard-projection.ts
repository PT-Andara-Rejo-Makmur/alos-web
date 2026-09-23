import type {
  ConstructionCadenceItem,
  PropertyAgentSupportItem,
  PropertyDashboardSnapshot,
  PropertySourceReadinessItem,
} from "./types";
import type {
  ProjectPortfolioSnapshot,
} from "@/features/projects/portfolio";

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

export const EMPTY_PROPERTY_PORTFOLIO: ProjectPortfolioSnapshot = {
  generated_at: "",
  metrics: { total: 0, on_track: 0, at_risk: 0, critical: 0, completed: 0 },
  progress: [],
  distribution: [],
  projects: [],
  milestones: [],
  risk_summary: [],
  filter_options: { divisions: [], categories: [], statuses: [] },
  pagination: { page: 1, page_size: 20, total_items: 0, total_pages: 0 },
};

export const DEFAULT_PROPERTY_SNAPSHOT: PropertyDashboardSnapshot = {
  portfolio: EMPTY_PROPERTY_PORTFOLIO,
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
  const resolvedPortfolio = portfolio ?? EMPTY_PROPERTY_PORTFOLIO;
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
