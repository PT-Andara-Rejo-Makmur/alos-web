import type { MetricObservation, PerformanceMetric } from "./types";
import type { MetricValueKind } from "./enums";

export function formatBusinessValue(value: number | string | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return typeof value === "number" ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value) : String(value);
}

export function metricObservation(metric: PerformanceMetric, kind: MetricValueKind): MetricObservation | null {
  const map = { TARGET: metric.target, ACTUAL: metric.actual, FORECAST: metric.forecast, ASSUMPTION: metric.assumption } as const;
  return map[kind];
}

export function formatMetricObservation(metric: PerformanceMetric, kind: MetricValueKind): string {
  return formatBusinessValue(metricObservation(metric, kind)?.value);
}
