import type { BusinessMetric, BusinessPerformance, BusinessSummary, BusinessWorkQueue } from "@/lib/contracts";

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isBusinessWorkQueue(value: unknown): value is BusinessWorkQueue {
  if (!record(value) || !["processes", "tasks", "approvals", "findings", "notifications"].every(key => Array.isArray(value[key]))) return false;
  const items = (key: string, id: string) => (value[key] as unknown[]).every(item => record(item) && typeof item[id] === "string");
  return items("tasks", "task_id") && items("approvals", "approval_id") && items("findings", "finding_id") && items("notifications", "notification_id")
    && (value.processes as unknown[]).every(item => record(item) && typeof item.process_id === "string" && record(item.packet)
      && Array.isArray(item.steps) && item.steps.every(step => record(step) && typeof step.step_id === "string") && Array.isArray(item.history));
}

export function isBusinessMetric(value: unknown): value is BusinessMetric {
  return record(value) && typeof value.code === "string" && typeof value.label === "string"
    && typeof value.available === "boolean" && ["COUNT", "AMOUNT", "PERCENT"].includes(String(value.unit))
    && (value.value === null || typeof value.value === "string" || (typeof value.value === "number" && Number.isFinite(value.value)))
    && (value.source === null || typeof value.source === "string");
}

export function isBusinessSummary(value: unknown, domain?: BusinessSummary["domain"]): value is BusinessSummary {
  return record(value) && ["sales", "property", "finance", "legal", "hr", "it"].includes(String(value.domain))
    && (!domain || value.domain === domain) && typeof value.generated_at === "string"
    && Array.isArray(value.metrics) && value.metrics.every(isBusinessMetric);
}

export function isBusinessPerformance(value: unknown): value is BusinessPerformance {
  if (!record(value) || !Array.isArray(value.domains) || !value.domains.every(item => isBusinessSummary(item))
    || !Array.isArray(value.attention) || !value.attention.every(item => record(item) && typeof item.domain === "string" && isBusinessMetric(item))
    || !Array.isArray(value.target_details) || !record(value.strategy)
    || !["plans", "active_strategic_plans", "active_operating_plans", "objectives", "targets", "assumptions"].every(key => Array.isArray(value.strategy && (value.strategy as Record<string, unknown>)[key]))) return false;
  const targetValid = (item: unknown) => record(item) && record(item.target) && record(item.target.scope)
    && typeof item.target.target_id === "string" && typeof item.target.name === "string"
    && Array.isArray(item.observations) && Array.isArray(item.relationships) && Array.isArray(item.revisions);
  if (!value.target_details.every(targetValid)) return false;
  return [value.decisions, value.acknowledgements].every(items => Array.isArray(items) && items.every(item =>
    record(item) && typeof item.process_id === "string" && record(item.packet)
    && Array.isArray(item.steps) && item.steps.every(step => record(step) && typeof step.step_id === "string" && typeof step.status === "string")
    && Array.isArray(item.history)));
}
