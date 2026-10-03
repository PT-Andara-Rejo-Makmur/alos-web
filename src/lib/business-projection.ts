import type { BusinessAnalyticsProjection, BusinessMetric, BusinessPerformance, BusinessSummary, BusinessWorkQueue } from "@/lib/contracts";

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

const analyticsDomains = ["sales", "property", "finance", "legal", "hr", "it", "executive"] as const;
const analyticsUnits = ["COUNT", "AMOUNT", "PERCENT"] as const;

function validPeriodDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validAnalyticsValue(value: unknown, unit: string, nullable = false): boolean {
  if (nullable && value === null) return true;
  if (unit === "AMOUNT") return typeof value === "string" && /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value);
  if (unit === "COUNT") return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
  return typeof value === "number" && Number.isFinite(value);
}

function validAnalyticsItem(item: unknown, unit: string): boolean {
  return record(item) && typeof item.code === "string" && typeof item.label === "string"
    && validAnalyticsValue(item.value, unit);
}

export function isBusinessAnalyticsProjection(
  value: unknown,
  domain?: BusinessAnalyticsProjection["domain"],
): value is BusinessAnalyticsProjection {
  if (!record(value) || !analyticsDomains.includes(value.domain as (typeof analyticsDomains)[number])
    || (domain && value.domain !== domain) || typeof value.generated_at !== "string"
    || !record(value.period) || !validPeriodDate(value.period.from) || !validPeriodDate(value.period.to)
    || value.period.from > value.period.to || !["DAY", "MONTH", "QUARTER", "YEAR"].includes(String(value.period.granularity))
    || !Array.isArray(value.series) || !Array.isArray(value.breakdowns) || !Array.isArray(value.comparisons)) return false;

  const seriesValid = value.series.every(item => record(item) && typeof item.code === "string"
    && typeof item.label === "string" && typeof item.source === "string"
    && analyticsUnits.includes(item.unit as (typeof analyticsUnits)[number])
    && typeof item.available === "boolean" && Array.isArray(item.points)
    && (item.available || item.points.length === 0)
    && item.points.every(point => record(point) && validPeriodDate(point.period)
      && validAnalyticsValue(point.value, String(item.unit))));
  const breakdownsValid = value.breakdowns.every(item => record(item) && typeof item.code === "string"
    && typeof item.label === "string" && typeof item.source === "string"
    && analyticsUnits.includes(item.unit as (typeof analyticsUnits)[number])
    && typeof item.available === "boolean" && Array.isArray(item.items)
    && (item.available || item.items.length === 0)
    && item.items.every(entry => validAnalyticsItem(entry, String(item.unit))));
  const comparisonsValid = value.comparisons.every(group => record(group) && typeof group.code === "string"
    && typeof group.label === "string" && typeof group.source === "string"
    && analyticsUnits.includes(group.unit as (typeof analyticsUnits)[number])
    && typeof group.available === "boolean" && Array.isArray(group.items)
    && (group.available || group.items.length === 0)
    && group.items.every(item => record(item) && typeof item.code === "string" && typeof item.label === "string"
      && ["value", "target_value", "actual_value", "forecast_value"].every(key =>
        Object.hasOwn(item, key) && validAnalyticsValue(item[key], String(group.unit), true))));
  return seriesValid && breakdownsValid && comparisonsValid;
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
