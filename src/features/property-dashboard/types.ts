import type {
  PortfolioTrendPoint,
  ProjectPortfolioSnapshot,
  ProjectStatus,
} from "@/features/mvp1/lib/portfolio";

export type {
  PortfolioTrendPoint,
  ProjectPortfolioSnapshot,
  ProjectStatus,
};

export type PropertySourceReadinessKey =
  | "PROJECTS"
  | "MILESTONES"
  | "ISSUES"
  | "BUDGET"
  | "SITE_EVIDENCE"
  | "SAFETY"
  | "HOLD_POINT"
  | "NCR_CAPA"
  | "CHANGE_ORDER"
  | "PAYMENT_CERT"
  | "HANDOVER";

export type PropertySourceState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export interface PropertySourceReadinessItem {
  readonly key: PropertySourceReadinessKey;
  readonly label: string;
  readonly state: PropertySourceState;
}

export interface ConstructionCadenceItem {
  readonly frequency: "Harian" | "Mingguan" | "Bulanan";
  readonly controlId: string;
  readonly name: string;
  readonly evidence: string;
  readonly status: PropertySourceState;
}

export interface PropertyAgentSupportItem {
  readonly id: string;
  readonly name: string;
  readonly roleDescription: string;
  readonly status: "Target capability" | "Active";
}

export interface PropertyDashboardSnapshot {
  readonly portfolio: ProjectPortfolioSnapshot;
  readonly readiness: readonly PropertySourceReadinessItem[];
  readonly cadence: readonly ConstructionCadenceItem[];
  readonly agents: readonly PropertyAgentSupportItem[];
}
