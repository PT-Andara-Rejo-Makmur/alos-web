import { resolveWorkspaceDomain } from "@/features/session";
import type { SessionProjection } from "@/features/session";
import type { BusinessTarget } from "@/lib/contracts";

export type FinanceSourceState = "loading" | "unavailable" | "error" | "connected-empty" | "connected-data";

/** Finance authority is derived only from the active workspace metadata. */
export function hasFinanceContext(session: SessionProjection | null | undefined): boolean {
  const resolution = resolveWorkspaceDomain(session);
  return resolution.valid && resolution.domain === "FINANCE";
}

export function activeFinanceWorkspaceKey(session: SessionProjection | null | undefined): string | null {
  if (!hasFinanceContext(session) || !session?.principal || !("actor" in session.principal)) return null;
  return session.principal.active_workspace?.workspace.workspace_key ?? null;
}

export function formatFinancialValue(value: number | null | undefined, currency = "Rp"): string {
  if (value === null || value === undefined) return "—";
  const formatted = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
  return currency === "Rp" ? `Rp${formatted}` : `${currency} ${formatted}`;
}

export function maskAccountNumber(accountNumber: string | null | undefined): string {
  if (!accountNumber) return "—";
  const normalized = accountNumber.replace(/\s+/g, "");
  if (normalized.length <= 4) return `**** ${normalized}`;
  return `**** ${normalized.slice(-4)}`;
}

export function formatFinancePeriod(period: BusinessTarget["period"] | null | undefined): string {
  if (!period) return "—";
  if (period.label?.trim()) return period.label;
  const startsAt = new Date(period.starts_at);
  const endsAt = new Date(period.ends_at);
  if (Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf())) return "Belum Dinilai";
  const formatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
  return `${formatter.format(startsAt)} – ${formatter.format(endsAt)}`;
}

export function strategyTargetValue(target: BusinessTarget): string {
  const observation = target.observations?.find((candidate) => candidate.kind === "TARGET");
  if (observation?.value === null || observation?.value === undefined) return "—";
  if (typeof observation.value === "number") return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(observation.value);
  if (typeof observation.value === "boolean") return observation.value ? "Ya" : "Tidak";
  return String(observation.value);
}
