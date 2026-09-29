import { resolveWorkspaceDomain } from "@/features/session";
import type { SessionProjection } from "@/features/session";

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
  if (value === 0) return `${currency}0`;
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

export function maskAccountNumber(accountNumber: string | null | undefined): string {
  if (!accountNumber) return "—";
  const normalized = accountNumber.replace(/\s+/g, "");
  if (normalized.length <= 4) return `**** ${normalized}`;
  return `**** ${normalized.slice(-4)}`;
}
