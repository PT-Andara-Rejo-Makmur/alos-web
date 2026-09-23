export { apiErrorDetail } from "@/lib/api";

export type Budget = {
  workspace_id: string;
  daily_request_limit: number;
  daily_output_token_limit: number;
  daily_cost_cap_usd: string;
};

export type Usage = {
  workspace_id: string;
  request_count: number;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: string;
};

export type ModelPolicy = {
  provider: string;
  model_light: string;
  model_standard: string;
  model_critical: string;
  max_output_tokens: number;
};

export type Run = {
  agent_run_id: string;
  agent_key: string;
  semantic_version: string;
  status: string;
  correlation_id: string;
  created_at: string;
  completed_at: string | null;
  provider: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  latency_milliseconds: number | null;
  estimated_cost_usd: string | null;
  error_code?: string | null;
  block_reason?: string | null;
};

export type AuditEvent = {
  audit_event_id: string;
  actor_kind?: string;
  actor_user_id?: string | null;
  system_actor?: string | null;
  action: string;
  entity_type?: string;
  entity_id?: string | null;
  correlation_id?: string;
  reason: string;
  metadata?: Record<string, unknown>;
  occurred_at: string;
};

export function canChangeBudget(roles: string[]): boolean {
  return roles.includes("EXECUTIVE") || roles.includes("IT_ADMIN");
}

export function canApprovePermission(roles: string[]): boolean {
  return roles.includes("EXECUTIVE") || roles.includes("QA_ASSURANCE");
}

export function canRegisterPermission(roles: string[]): boolean {
  return roles.some((role) =>
    ["EXECUTIVE", "IT_ADMIN", "QA_ASSURANCE", "WORKSPACE_LEAD"].includes(role)
  );
}

export function remainingBudget(budget: Budget, usage: Usage) {
  return {
    requests: Math.max(0, budget.daily_request_limit - usage.request_count),
    tokens: Math.max(0, budget.daily_output_token_limit - usage.output_tokens),
    cost: Math.max(0, Number(budget.daily_cost_cap_usd) - Number(usage.estimated_cost_usd)).toFixed(4),
  };
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatCurrency(value: string): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(Number(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
