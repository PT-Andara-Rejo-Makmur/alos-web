import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import { statusLabel } from "@/lib/presentation";
import type {
  BusinessTarget,
  MetricObservation,
  StrategyBusinessScope as BusinessScope,
  StrategyPlan,
  StrategyVerificationState,
} from "@/lib/contracts";

export function hasExecutiveContext(session: SessionProjection): boolean {
  const resolution = resolveWorkspaceDomain(session);
  return resolution.valid && resolution.domain === "EXECUTIVE";
}

export function activeExecutiveWorkspaceKey(session: SessionProjection): string | null {
  return hasExecutiveContext(session) && session.principal && "actor" in session.principal
    ? session.principal.active_workspace?.workspace.workspace_key ?? null
    : null;
}

export function activePlan(plans: readonly StrategyPlan[]): StrategyPlan | null {
  return plans.find((plan) => plan.lifecycle_state === "ACTIVE") ?? null;
}

export function corporateTargets(targets: readonly BusinessTarget[]): readonly BusinessTarget[] {
  return targets.filter((target) => target.scope.type === "COMPANY");
}

export function scopeLabel(scope: BusinessScope | null | undefined): string {
  if (scope?.label && !["COMPANY", "DIVISION", "PROJECT"].includes(scope.label)) {
    return scope.label;
  }

  switch (scope?.type) {
    case "COMPANY": return "Korporasi";
    case "DIVISION": return "Divisi";
    case "PROJECT": return "Proyek";
    default: return scope?.type ? statusLabel(scope.type) : "Belum Dinilai";
  }
}

export function observationFor(
  target: BusinessTarget,
  kind: MetricObservation["kind"],
): MetricObservation | null {
  if (target.selected_observations) {
    if (kind === "TARGET") return target.selected_observations.target;
    if (kind === "ACTUAL") return target.selected_observations.actual;
    if (kind === "FORECAST") return target.selected_observations.forecast;
  }
  return target.observations?.find((observation) => observation.kind === kind) ?? null;
}

export function valueForObservation(
  observation: MetricObservation | null,
  format: (value: number | string | boolean, unit: MetricObservation["unit"]) => string = formatValue,
): string {
  return observation?.value === null || observation?.value === undefined
    ? "—"
    : format(observation.value, observation.unit);
}

export function formatValue(value: number | string | boolean, unit: MetricObservation["unit"]): string {
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "string") return value;
  if (unit === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      currency: "IDR",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(value);
  }
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

export function performanceLabel(state: BusinessTarget["performance_state"]): string {
  switch (state) {
    case "ON_TRACK": return "Sesuai Target";
    case "AT_RISK": return "Perlu Perhatian";
    case "OFF_TRACK": return "Tidak Sesuai Target";
    case "ACHIEVED": return "Tercapai";
    default: return state ? statusLabel(state) : "Belum Dinilai";
  }
}

export function performanceVariant(state: BusinessTarget["performance_state"]): "danger" | "neutral" | "success" | "warning" {
  switch (state) {
    case "ON_TRACK":
    case "ACHIEVED": return "success";
    case "AT_RISK": return "warning";
    case "OFF_TRACK": return "danger";
    default: return "neutral";
  }
}

export function lifecycleLabel(state: string | null | undefined): string {
  return state === "DRAFT" ? "Draf" : state ? statusLabel(state) : "Belum Dinilai";
}

export function verificationLabel(state: StrategyVerificationState | null | undefined): string {
  return state ? statusLabel(state) : "Belum Diperiksa";
}

export function observationKindLabel(kind: MetricObservation["kind"]): string {
  return statusLabel(kind);
}

export function periodLabel(period: StrategyPlan["period"] | BusinessTarget["period"]): string {
  if (period.label?.trim()) return period.label;
  const formatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
  return `${formatter.format(new Date(period.starts_at))} – ${formatter.format(new Date(period.ends_at))}`;
}

export function generateCanonicalId(prefix: string): string {
  const uuid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : (() => { throw new Error("Canonical identifier generation is unavailable."); })();
  return `${prefix}-${uuid}`;
}
