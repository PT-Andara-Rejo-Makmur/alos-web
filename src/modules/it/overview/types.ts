export type ItSourceReadinessKey =
  | "GENESIS"
  | "GOVERNANCE"
  | "MONITORING"
  | "BACKUP"
  | "SECURITY";

export type ItSourceState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export interface ItSourceReadinessItem {
  readonly key: ItSourceReadinessKey;
  readonly label: string;
  readonly state: ItSourceState;
  readonly context: string;
}

export interface SystemDeliveryRow {
  readonly id: string;
  readonly system: string;
  readonly source: string;
  readonly runtime: string;
  readonly telemetry: string;
  readonly context: string;
}

export interface OperationStatusRow {
  readonly id: string;
  readonly operation: string;
  readonly state: "NOT_CONNECTED";
  readonly source: string;
  readonly description: string;
}

export interface ReleaseControlRow {
  readonly id: string;
  readonly control: string;
  readonly state: "PARTIAL" | "NOT_CONNECTED";
  readonly evidence: string;
  readonly source: string;
}

export interface ItCadenceItem {
  readonly frequency: "Daily" | "Weekly" | "Monthly";
  readonly controlId: string;
  readonly controlName: string;
  readonly workEvidence: string;
  readonly readinessStatus: "PARTIAL" | "NOT_CONNECTED";
  readonly targetCapability: string;
}

export interface GenesisSummaryItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly moduleKey: string;
  readonly href: string;
}

export interface ItDashboardSnapshot {
  readonly readiness: readonly ItSourceReadinessItem[];
  readonly systems: readonly SystemDeliveryRow[];
  readonly operations: readonly OperationStatusRow[];
  readonly releaseControls: readonly ReleaseControlRow[];
  readonly cadence: readonly ItCadenceItem[];
  readonly genesisSummary: readonly GenesisSummaryItem[];
}
