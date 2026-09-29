import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import type {
  BusinessTarget,
  MetricObservation,
  StrategyBusinessScope as BusinessScope,
  StrategyPlan,
  StrategyVerificationState,
} from "@/lib/contracts";

export interface ExecutiveStrategyData {
  readonly plans: readonly StrategyPlan[];
  readonly targets: readonly BusinessTarget[];
}

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
    default: return "Belum Dinilai";
  }
}

export function observationFor(
  target: BusinessTarget,
  kind: MetricObservation["kind"],
): MetricObservation | null {
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
    default: return "Belum Dinilai";
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
  switch (state) {
    case "DRAFT": return "Draf";
    case "UNDER_REVIEW": return "Dalam Peninjauan";
    case "APPROVED": return "Disetujui";
    case "ACTIVE": return "Aktif";
    case "SUPERSEDED": return "Digantikan";
    case "ARCHIVED": return "Diarsipkan";
    default: return "Belum Dinilai";
  }
}

export function verificationLabel(state: StrategyVerificationState | null | undefined): string {
  switch (state) {
    case "VERIFIED": return "Terverifikasi";
    case "PENDING_VERIFICATION": return "Menunggu Verifikasi";
    case "CONFLICT": return "Perlu Klarifikasi";
    case "REJECTED": return "Ditolak";
    default: return "Belum Diverifikasi";
  }
}

export function periodLabel(period: StrategyPlan["period"] | BusinessTarget["period"]): string {
  if (period.label?.trim()) return period.label;
  const formatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
  return `${formatter.format(new Date(period.starts_at))} – ${formatter.format(new Date(period.ends_at))}`;
}

export function generateCanonicalId(prefix: string): string {
  const uuid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "00000000-0000-4000-8000-000000000000";
  return `${prefix}-${uuid}`;
}
