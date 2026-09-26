export type ItSourceReadinessKey =
  | "GENESIS"
  | "GOVERNANCE"
  | "MONITORING"
  | "INCIDENTS"
  | "BACKUP"
  | "SECURITY"
  | "ACCESS_REVIEW"
  | "RECOVERY";

export type ItSourceState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export interface ItSourceReadinessItem {
  readonly key: ItSourceReadinessKey;
  readonly label: string;
  readonly state: ItSourceState;
  readonly updatedAt?: string | null;
  readonly context?: string;
}

export interface ItMetricItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly state: ItSourceState;
}

export interface PlatformDeliveryRow {
  readonly id: string;
  readonly name: string;
  readonly repoStatus: string;
  readonly healthBadge: string;
  readonly healthState: "AVAILABLE" | "NEEDS_TELEMETRY" | "PARTIAL" | "NOT_CONNECTED";
}

export interface ReleaseChangeRow {
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly state: "AVAILABLE" | "PARTIAL" | "NOT_CONNECTED";
}

export interface SecurityAccessRow {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface ItCadenceItem {
  readonly frequency: "Harian" | "Mingguan" | "Bulanan";
  readonly controlId: string;
  readonly controlName: string;
  readonly workEvidence: string;
  readonly readinessStatus: ItSourceState;
  readonly targetCapability: string;
}

export interface GenesisControlPlaneItem {
  readonly id: string;
  readonly title: string;
  readonly badge: string;
  readonly href: string;
}

export interface ItDashboardSnapshot {
  readonly readiness: readonly ItSourceReadinessItem[];
  readonly metrics: readonly ItMetricItem[];
  readonly platformDelivery: readonly PlatformDeliveryRow[];
  readonly releaseChange: readonly ReleaseChangeRow[];
  readonly securityAccess: readonly SecurityAccessRow[];
  readonly cadence: readonly ItCadenceItem[];
  readonly genesisOperations: readonly GenesisControlPlaneItem[];
}
