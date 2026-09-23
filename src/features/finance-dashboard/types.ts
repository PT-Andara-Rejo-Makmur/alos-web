export type Money = {
  readonly amount: string;
  readonly currency: string;
};

export type FinanceSourceState = "LIVE" | "PARTIAL" | "NOT_CONNECTED";

export type FinanceSourceReadinessKey = "ledger" | "bank" | "aging" | "budget" | "tax";

export type FinanceSourceReadiness = {
  readonly key: FinanceSourceReadinessKey;
  readonly label: string;
  readonly state: FinanceSourceState;
  readonly stateLabel: string;
  readonly description: string;
  readonly updatedAt?: string | null;
};

export type FinanceCadenceFrequency = "HARIAN" | "MINGGUAN" | "BULANAN";

export type FinanceCadenceItem = {
  readonly code: string;
  readonly frequency: FinanceCadenceFrequency;
  readonly frequencyLabel: string;
  readonly name: string;
  readonly target: string;
  readonly evidence: string;
  readonly supportingAgent: string;
  readonly state: "COMPLIANT" | "ATTENTION" | "OVERDUE" | "NOT_CONNECTED";
  readonly stateLabel: string;
  readonly displayValue: string;
};

export type FinanceAgentSupportItem = {
  readonly code: string;
  readonly name: string;
  readonly role: string;
  readonly status: "Target capability" | "Active";
};

export type FundAccount = {
  readonly fundId: string;
  readonly label: string;
  readonly class: string;
  readonly currency: string;
  readonly balance: Money | null;
  readonly reconciliationState: string;
};

export type FinanceDashboardMetric = {
  readonly key: "cash_position" | "receivables" | "payables" | "budget_variance";
  readonly label: string;
  readonly mobileLabel: string;
  readonly value: Money | null;
  readonly percent?: number | null;
  readonly state: FinanceSourceState;
  readonly context: string;
};

export type FinanceDashboardSnapshot = {
  readonly generated_at: string;
  readonly workspace_id: string;
  readonly workspace_name: string;
  readonly source_readiness: readonly FinanceSourceReadiness[];
  readonly metrics: readonly FinanceDashboardMetric[];
  readonly control_cadence: readonly FinanceCadenceItem[];
  readonly agent_support: readonly FinanceAgentSupportItem[];
};
