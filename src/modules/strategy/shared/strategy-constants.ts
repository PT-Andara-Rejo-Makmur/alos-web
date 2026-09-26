import type {
  KpiMeasurementType,
  StrategicHorizon,
  StrategyOverviewViewModel,
  StrategyStatus,
} from "./types";

export const DEFAULT_UNCONNECTED_STRATEGY_OVERVIEW: StrategyOverviewViewModel = {
  source_state: "NOT_CONNECTED",
  objectives: [],
  kpis: [],
  initiatives: [],
  reviews_requiring_attention: [],
  pending_revisions: [],
  sources: [],
  generated_at: null,
};

export const STRATEGY_SOURCE_HELPERS = {
  NOT_CONNECTED: "Sumber strategi dan KPI resmi dari Backend belum tersedia.",
  CONNECTED: "Terhubung dengan sistem strategi dan KPI Backend.",
  LOADING: "Memuat data strategi dari Backend…",
  ERROR: "Terjadi kesalahan saat memuat sumber strategi Backend.",
} as const;

export const STRATEGY_SUBMODULES = [
  { key: "overview", label: "Ringkasan", hrefSuffix: "" },
  { key: "objectives", label: "Sasaran", hrefSuffix: "/objectives" },
  { key: "kpis", label: "KPI", hrefSuffix: "/kpis" },
  { key: "initiatives", label: "Inisiatif", hrefSuffix: "/initiatives" },
  { key: "reviews", label: "Review Kinerja", hrefSuffix: "/reviews" },
  { key: "revisions", label: "Revisi Target", hrefSuffix: "/revisions" },
  { key: "sources", label: "Sumber Dokumen", hrefSuffix: "/sources" },
] as const;

export function horizonLabel(horizon?: StrategicHorizon | string | null): string {
  if (!horizon) return "—";
  switch (horizon) {
    case "SHORT_TERM":
      return "Jangka Pendek";
    case "MEDIUM_TERM":
      return "Jangka Menengah";
    case "LONG_TERM":
      return "Jangka Panjang";
    default:
      return String(horizon);
  }
}

export function measurementTypeLabel(type?: KpiMeasurementType | string | null): string {
  if (!type) return "—";
  switch (type) {
    case "HIGHER_IS_BETTER":
      return "Semakin tinggi semakin baik";
    case "LOWER_IS_BETTER":
      return "Semakin rendah semakin baik";
    case "BINARY":
      return "Biner (Ya / Tidak)";
    case "MILESTONE":
      return "Tahapan Milestone";
    case "CUMULATIVE":
      return "Akumulatif";
    case "PERCENTAGE":
      return "Persentase";
    default:
      return String(type);
  }
}

export function strategyStatusLabel(status?: StrategyStatus | string | null): string {
  if (!status) return "—";
  switch (status) {
    case "ON_TRACK":
      return "Sesuai Rencana";
    case "AT_RISK":
      return "Berisiko";
    case "BEHIND":
      return "Tidak Sesuai Rencana";
    case "ACHIEVED":
      return "Tercapai";
    case "UNDER_REVIEW":
      return "Dalam Review";
    case "REVISED":
      return "Direvisi";
    default:
      return String(status);
  }
}

export function formatAchievementPercent(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)}%`;
}
