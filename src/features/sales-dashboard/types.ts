export type SalesSourceReadinessKey =
  | "LEADS"
  | "CRM"
  | "WHATSAPP"
  | "BOOKING"
  | "ATTRIBUTION"
  | "COMPLAINTS";

export type SalesSourceState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export interface SalesSourceReadinessItem {
  readonly key: SalesSourceReadinessKey;
  readonly label: string;
  readonly state: SalesSourceState;
}

export interface SalesMetricItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly state: SalesSourceState;
}

export interface SalesFunnelStage {
  readonly stage: string;
  readonly label: string;
  readonly count: number | null;
  readonly conversionRate: number | null;
}

export interface SalesDailyControlItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly target: string;
  readonly state: SalesSourceState;
}

export interface SalesChannelAttributionItem {
  readonly channelId: string;
  readonly channelName: string;
  readonly leadShare: number | null;
  readonly qualityScore: number | null;
}

export interface SalesCadenceItem {
  readonly frequency: "Harian" | "Mingguan" | "Bulanan";
  readonly controlId: string;
  readonly controlName: string;
  readonly workEvidence: string;
  readonly readinessStatus: SalesSourceState;
}

export interface SalesAgentSupportItem {
  readonly agentId: string;
  readonly roleName: string;
  readonly taskDescription: string;
  readonly status: "Target capability" | "Active";
}

export interface SalesDashboardSnapshot {
  readonly readiness: readonly SalesSourceReadinessItem[];
  readonly metrics: readonly SalesMetricItem[];
  readonly funnel: readonly SalesFunnelStage[];
  readonly dailyControl: readonly SalesDailyControlItem[];
  readonly channelAttribution: readonly SalesChannelAttributionItem[];
  readonly cadence: readonly SalesCadenceItem[];
  readonly agents: readonly SalesAgentSupportItem[];
}
