export type LegalSourceReadinessKey =
  | "PERMITS"
  | "CONTRACTS"
  | "LAND_DOCS"
  | "CLAIMS"
  | "PRIVACY"
  | "CASES"
  | "REGULATORY";

export type LegalSourceState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export interface LegalSourceReadinessItem {
  readonly key: LegalSourceReadinessKey;
  readonly label: string;
  readonly state: LegalSourceState;
  readonly updatedAt?: string | null;
}

export interface LegalMetricItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly state: LegalSourceState;
}

export interface PermitReadinessRow {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface ContractReviewRow {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}

export interface ComplianceControlRow {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}

export interface LegalCadenceItem {
  readonly frequency: "Harian" | "Mingguan" | "Material";
  readonly controlId: string;
  readonly controlName: string;
  readonly workEvidence: string;
  readonly readinessStatus: LegalSourceState;
  readonly targetCapability: string;
}

export interface LegalAgentSupportItem {
  readonly agentId: string;
  readonly roleName: string;
  readonly taskDescription: string;
  readonly status: "Target capability" | "Active";
  readonly authorityNote: string;
}

export interface LegalDashboardSnapshot {
  readonly readiness: readonly LegalSourceReadinessItem[];
  readonly metrics: readonly LegalMetricItem[];
  readonly permitsLand: readonly PermitReadinessRow[];
  readonly contracts: readonly ContractReviewRow[];
  readonly compliance: readonly ComplianceControlRow[];
  readonly cadence: readonly LegalCadenceItem[];
  readonly agents: readonly LegalAgentSupportItem[];
}
