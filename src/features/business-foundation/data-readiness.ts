import type { BusinessSourceRef } from "./types";
import type { DataReadinessState } from "./enums";

export function resolveDataReadiness(source: BusinessSourceRef | null, now: Date, staleAfterMs: number): DataReadinessState {
  if (!source) return "NOT_CONNECTED";
  if (["NOT_CONNECTED", "ERROR", "LOADING", "STALE"].includes(source.readiness)) return source.readiness;
  if (!source.authoritative) return source.readiness === "PARTIAL" ? "PARTIAL" : "NOT_CONNECTED";
  if (!source.observed_at) return "PARTIAL";
  const observed = Date.parse(source.observed_at);
  if (Number.isNaN(observed)) return "PARTIAL";
  if (now.getTime() - observed > staleAfterMs) return "STALE";
  return source.readiness === "PARTIAL" ? "PARTIAL" : "LIVE";
}

export const dataReadinessLabel = (state: DataReadinessState): string => ({ NOT_CONNECTED: "Belum terhubung", LOADING: "Memuat", PARTIAL: "Sebagian", LIVE: "Live", STALE: "Kedaluwarsa", ERROR: "Gagal" })[state];
