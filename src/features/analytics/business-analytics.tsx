"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Alert, LoadingState, Section } from "@/components/ui";
import type {
  AnalyticsBreakdown,
  AnalyticsComparison,
  AnalyticsPeriod,
  AnalyticsSeries,
  BusinessAnalyticsProjection,
  BusinessTargetDetail,
} from "@/lib/contracts";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { isBusinessAnalyticsProjection } from "@/lib/business-projection";
import { businessMetricValue } from "@/lib/presentation";
import { periodLabel as strategyPeriodLabel } from "@/features/executive/executive-model";

import styles from "./business-analytics.module.css";

type AnalyticsDomain = BusinessAnalyticsProjection["domain"];
type AnalyticsUnit = AnalyticsSeries["unit"];
type ChartRow = Record<string, string | number | null> & { label: string };

const CHART_COLORS = {
  primary: "#155e4b",
  actual: "#155e4b",
  target: "#6b7a72",
  forecast: "#b38838",
  grid: "#e5ece8",
  text: "#52615a",
} as const;

const CHART_LABELS: Readonly<Record<string, string>> = {
  closing_count: "Jumlah Closing selesai",
  closing_value: "Nilai Penjualan",
  receipts_amount: "Nilai pembayaran piutang",
  payments_amount: "Nilai pembayaran utang",
  candidate_count: "Kandidat tercatat",
  incident_count: "Insiden dicatat",
  active_pipeline_by_stage: "Pipeline Aktif menurut Tahap",
  milestones_by_status: "Milestone menurut status",
  ncr_by_status: "NCR menurut status",
  payment_exposure: "Piutang dan utang menurut jatuh tempo",
  contracts_by_status: "Kontrak menurut status",
  contract_expiry: "Kontrak aktif menurut tanggal akhir",
  risks_by_status: "Risiko menurut status",
  candidate_funnel: "Kandidat menurut tahap rekrutmen",
  incidents_by_status: "Insiden menurut status",
  security_by_severity: "Temuan keamanan menurut tingkat keparahan",
  releases_by_status: "Rilis menurut status",
};

const MAX_SAFE_CHART_NUMBER = Number.MAX_SAFE_INTEGER;

export function isSafeChartValue(value: string | number | null, unit: AnalyticsUnit): boolean {
  if (value === null) return true;
  if (unit === "COUNT") {
    return typeof value === "number" ? Number.isSafeInteger(value) : (
      Number.isInteger(Number(value)) && Math.abs(Number(value)) <= MAX_SAFE_CHART_NUMBER
    );
  }
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && Math.abs(number) <= MAX_SAFE_CHART_NUMBER;
}

function chartNumber(value: string | number | null, unit: AnalyticsUnit): number | null {
  if (value === null) return null;
  if (!isSafeChartValue(value, unit)) return null;
  if (unit === "COUNT") {
    return typeof value === "number" && Number.isSafeInteger(value) ? value : Math.round(Number(value));
  }
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function displayValue(value: string | number | null, unit: AnalyticsUnit): string {
  if (value === null) return "Belum tersedia";
  return businessMetricValue({
    code: "analytics_value",
    label: "Nilai",
    value,
    unit,
    available: true,
    source: null,
  });
}

function tooltipValue(value: unknown, exact: unknown): string | number | null {
  if (typeof exact === "string" || typeof exact === "number") return exact;
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function compactTick(value: number, unit: AnalyticsUnit): string {
  const magnitude = Math.abs(value);
  if (unit === "AMOUNT" && magnitude >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (unit === "AMOUNT" && magnitude >= 1_000_000) return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (unit === "AMOUNT" && magnitude >= 1_000) return `Rp ${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  return displayValue(value, unit);
}

function periodLabel(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit", timeZone: "UTC" }).format(date);
}

function dateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function chartMetadata(period: AnalyticsPeriod, generatedAt: string, source: string): string {
  const updated = new Date(generatedAt);
  const timestamp = Number.isNaN(updated.getTime())
    ? "Waktu pembaruan belum tersedia"
    : `Diperbarui ${updated.toLocaleString("id-ID")}`;
  return `Periode ${dateLabel(period.from)} - ${dateLabel(period.to)} · ${timestamp} · ${source}`;
}

function snapshotMetadata(generatedAt: string, source: string): string {
  const updated = new Date(generatedAt);
  const snapshotDate = Number.isNaN(updated.getTime()) ? "Tanggal snapshot belum tersedia" : dateLabel(updated.toISOString().slice(0, 10));
  const timestamp = Number.isNaN(updated.getTime()) ? "Waktu pembaruan belum tersedia" : updated.toLocaleString("id-ID");
  return `Snapshot ${snapshotDate} · Diperbarui ${timestamp} · ${source}`;
}

function ChartFrame({
  title,
  description,
  metadata,
  rowCount,
  rows,
  headers,
  tall = false,
  emptyMessage = "Belum cukup data untuk menampilkan tren.",
  isUnsafe = false,
  variant = "default",
  children,
}: Readonly<{
  title: string;
  description: string;
  metadata: string;
  rowCount: number;
  rows: readonly ChartRow[];
  headers: readonly { key: string; label: string; unit?: AnalyticsUnit }[];
  tall?: boolean;
  emptyMessage?: string;
  isUnsafe?: boolean;
  variant?: "default" | "compact";
  children: ReactNode;
}>) {
  const uniqueId = useId().replace(/:/g, "");
  const titleId = `analytics-${uniqueId}`;
  const frameClass = `${styles.chartFrame} ${tall ? styles.chartFrameTall : ""} ${variant === "compact" ? styles.chartFrameCompact : ""}`;
  return (
    <article className={`${styles.chartCard} ${variant === "compact" ? styles.chartCardCompact : ""}`} aria-labelledby={`${titleId}-title`}>
      <h3 id={`${titleId}-title`}>{title}</h3>
      <p className={styles.meta}>{metadata}</p>
      <p id={`${titleId}-description`} className={styles.srOnly}>
        {description} Data angka juga tersedia pada tabel pendamping.
      </p>
      {isUnsafe ? (
        <div className={styles.empty} role="status">
          Nilai tersedia dalam tabel karena skalanya tidak aman untuk divisualisasikan.
        </div>
      ) : rowCount ? (
        <div
          className={frameClass}
          aria-labelledby={`${titleId}-title`}
          aria-describedby={`${titleId}-description`}
        >
          {children}
        </div>
      ) : (
        <div className={styles.empty} role="status">{emptyMessage}</div>
      )}
      {rows.length ? (
        <details className={styles.tableDetails} open={isUnsafe}>
          <summary>Lihat data dalam tabel</summary>
          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <caption className={styles.srOnly}>{title}</caption>
              <thead><tr>{headers.map(header => <th key={header.key} scope="col">{header.label}</th>)}</tr></thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${String(row.label)}-${index}`}>
                    {headers.map(header => (
                      <td key={header.key}>
                        {header.unit
                          ? displayValue(row[header.key] as string | number | null, header.unit)
                          : String(row[header.key] ?? "Belum tersedia")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </article>
  );
}

export function TrendChart({
  series,
  period,
  generatedAt,
  variant = "default",
}: Readonly<{
  series: AnalyticsSeries;
  period: AnalyticsPeriod;
  generatedAt: string;
  variant?: "default" | "compact";
}>) {
  const hasUnsafe = series.points.some(
    point => point.value !== null && !isSafeChartValue(point.value, series.unit)
  );
  const chartRows = hasUnsafe ? [] : series.points.flatMap(point => {
    const value = chartNumber(point.value, series.unit);
    return value === null ? [] : [{ label: periodLabel(point.period), period: point.period, value, exact: point.value }];
  });
  const rows: ChartRow[] = series.points.map(point => ({ period: dateLabel(point.period), label: dateLabel(point.period), value: point.value }));
  const description = `${series.label}; ${chartRows.length} periode memiliki catatan.`;
  return (
    <ChartFrame
      title={series.label}
      description={description}
      metadata={chartMetadata(period, generatedAt, series.source)}
      rowCount={series.available && chartRows.length >= 2 ? chartRows.length : 0}
      rows={rows}
      headers={[{ key: "period", label: "Periode" }, { key: "value", label: series.label, unit: series.unit }]}
      emptyMessage={!series.available ? "Belum tersedia" : chartRows.length === 1 ? "Belum cukup data untuk menampilkan tren." : "Belum ada catatan pada periode ini."}
      isUnsafe={hasUnsafe}
      variant={variant}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartRows} accessibilityLayer margin={{ top: 8, right: 12, left: 12, bottom: 4 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickFormatter={periodLabel} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} minTickGap={16} />
          <YAxis tickFormatter={value => compactTick(Number(value), series.unit)} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} width={82} />
          <Tooltip
            formatter={(value, _name, item) => displayValue(
              tooltipValue(value, (item.payload as ChartRow | undefined)?.exact),
              series.unit,
            )}
            labelFormatter={label => dateLabel(String(label))}
          />
          <Line dataKey="value" name={series.label} type="monotone" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: chartRows.length < 8 ? 3 : 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function BreakdownChart({
  breakdown,
  generatedAt,
  variant = "default",
}: Readonly<{
  breakdown: AnalyticsBreakdown;
  generatedAt: string;
  variant?: "default" | "compact";
}>) {
  const hasUnsafe = breakdown.items.some(
    item => item.value !== null && !isSafeChartValue(item.value, breakdown.unit)
  );
  const chartRows: ChartRow[] = hasUnsafe ? [] : breakdown.items.flatMap(item => {
    const value = chartNumber(item.value, breakdown.unit);
    return value === null ? [] : [{ label: item.label, value, exact: item.value }];
  });
  const rows: ChartRow[] = breakdown.items.map(item => ({ label: item.label, value: item.value }));
  const allZero = chartRows.length > 0 && chartRows.every(row => row.value === 0);
  return (
    <ChartFrame
      title={breakdown.label}
      description={`${breakdown.label}; ${breakdown.items.length} kategori tersedia.`}
      metadata={snapshotMetadata(generatedAt, breakdown.source)}
      rowCount={breakdown.available && !allZero ? chartRows.length : 0}
      rows={rows}
      headers={[{ key: "label", label: "Kategori" }, { key: "value", label: breakdown.label, unit: breakdown.unit }]}
      tall={chartRows.length > 6}
      emptyMessage={!breakdown.available ? "Belum tersedia" : allZero ? "Seluruh kategori bernilai 0 pada snapshot ini." : "Belum ada catatan yang dapat ditampilkan."}
      isUnsafe={hasUnsafe}
      variant={variant}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartRows} layout="vertical" accessibilityLayer margin={{ top: 8, right: 16, left: 6, bottom: 4 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={breakdown.unit !== "COUNT"} tickFormatter={value => compactTick(Number(value), breakdown.unit)} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
          <YAxis type="category" dataKey="label" width={132} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
          <Tooltip formatter={(value, _name, item) => displayValue(
            tooltipValue(value, (item.payload as ChartRow | undefined)?.exact),
            breakdown.unit,
          )} />
          <Bar dataKey="value" name={breakdown.label} fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function comparisonValue(item: AnalyticsComparison["items"][number], key: string): string | number | null {
  return item[key as keyof typeof item] as string | number | null;
}

export function ComparisonChart({
  comparison,
  generatedAt,
  metadata,
  variant = "default",
}: Readonly<{
  comparison: AnalyticsComparison;
  generatedAt?: string;
  metadata?: string;
  variant?: "default" | "compact";
}>) {
  const fields = [
    { key: "value", label: "Progres" },
    { key: "target_value", label: "Target" },
    { key: "actual_value", label: "Aktual" },
    { key: "forecast_value", label: "Perkiraan" },
  ].filter(field => (comparison.code === "project_progress" || field.key !== "value")
    && comparison.items.some(item => comparisonValue(item, field.key) !== null));

  const hasUnsafe = comparison.items.some(item =>
    fields.some(field => {
      const val = comparisonValue(item, field.key);
      return val !== null && !isSafeChartValue(val, comparison.unit);
    })
  );

  const chartRows: ChartRow[] = hasUnsafe ? [] : comparison.items.map(item => {
    const values: ChartRow = { label: item.label };
    for (const field of fields) {
      const exactValue = comparisonValue(item, field.key);
      values[field.key] = chartNumber(exactValue, comparison.unit);
      values[`exact_${field.key}`] = exactValue;
    }
    return values;
  });
  const tableRows: ChartRow[] = comparison.items.map(item => ({
    label: item.label,
    value: item.value,
    target: item.target_value,
    actual: item.actual_value,
    forecast: item.forecast_value,
  }));
  const headers: { key: string; label: string; unit?: AnalyticsUnit }[] = comparison.code === "project_progress"
    ? [{ key: "label", label: "Proyek" }, { key: "value", label: "Progres", unit: comparison.unit }]
    : [
      { key: "label", label: "Target" },
      { key: "target", label: "Target", unit: comparison.unit },
      { key: "actual", label: "Aktual", unit: comparison.unit },
      { key: "forecast", label: "Perkiraan", unit: comparison.unit },
    ];
  return (
    <ChartFrame
      title={comparison.label}
      description={`${comparison.label}; ${comparison.items.length} pembanding.`}
      metadata={metadata ? `${metadata} · ${comparison.source}` : generatedAt ? snapshotMetadata(generatedAt, comparison.source) : comparison.source}
      rowCount={comparison.available && fields.length && chartRows.length ? chartRows.length : 0}
      rows={tableRows}
      headers={headers}
      tall={chartRows.length > 6}
      emptyMessage={!comparison.available ? "Belum tersedia" : "Belum ada nilai yang dapat dibandingkan."}
      isUnsafe={hasUnsafe}
      variant={variant}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartRows} layout="vertical" accessibilityLayer margin={{ top: 8, right: 16, left: 6, bottom: 4 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={comparison.unit !== "COUNT"} tickFormatter={value => compactTick(Number(value), comparison.unit)} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
          <YAxis type="category" dataKey="label" width={148} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
          <Tooltip formatter={(value, name, item) => {
            const dataKey = String(item.dataKey ?? name);
            return displayValue(
              tooltipValue(value, (item.payload as ChartRow | undefined)?.[`exact_${dataKey}`]),
              comparison.unit,
            );
          }} />
          {fields.length > 1 ? <Legend /> : null}
          {fields.map(field => (
            <Bar
              key={field.key}
              dataKey={field.key}
              name={field.label}
              fill={field.key === "target_value" ? CHART_COLORS.target : field.key === "forecast_value" ? CHART_COLORS.forecast : CHART_COLORS.actual}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function observationValue(value: unknown, unit: AnalyticsUnit): string | number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (unit === "AMOUNT") return /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(String(value)) ? String(value) : null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (unit === "COUNT") return Number.isSafeInteger(number) && number >= 0 ? number : null;
  return number;
}

export function StrategyTargetCharts({
  rows,
}: Readonly<{ rows: readonly BusinessTargetDetail[] }>) {
  const byUnit = new Map<AnalyticsUnit, AnalyticsComparison["items"][number][]>();
  for (const row of rows) {
    const selected = row.selected_observations;
    const observations = [selected?.target ?? null, selected?.actual ?? null, selected?.forecast ?? null];
    const sourceUnits = new Set(observations.filter((item): item is NonNullable<typeof item> => item !== null).map(item => item.unit));
    if (sourceUnits.size !== 1) continue;
    const sourceUnit = [...sourceUnits][0];
    const unit = sourceUnit === "IDR" ? "AMOUNT" : sourceUnit;
    if (!(unit === "COUNT" || unit === "AMOUNT" || unit === "PERCENT")) continue;
    const target = observationValue(selected?.target?.value, unit);
    const actual = observationValue(selected?.actual?.value, unit);
    const forecast = observationValue(selected?.forecast?.value, unit);
    if (target === null && actual === null && forecast === null) continue;
    const items = byUnit.get(unit) ?? [];
    items.push({
      code: row.target.target_id,
      label: `${row.target.name} · ${strategyPeriodLabel(row.target.period)}`,
      value: actual,
      target_value: target,
      actual_value: actual,
      forecast_value: forecast,
    });
    byUnit.set(unit, items);
  }
  const groups = [...byUnit].map(([unit, items]) => ({
    code: `strategy_target_actual_${unit.toLowerCase()}`,
    label: "Target, aktual, dan perkiraan",
    unit,
    available: items.length > 0,
    source: "Observasi target strategi yang dipilih",
    items,
  } satisfies AnalyticsComparison));
  const latestUpdate = rows.map(row => row.last_updated_at).filter((value): value is string => Boolean(value)).sort().at(-1);
  const metadata = latestUpdate
    ? `Periode mengikuti target strategi · Diperbarui ${new Date(latestUpdate).toLocaleString("id-ID")}`
    : "Periode mengikuti target strategi · Waktu pembaruan belum tersedia";
  return groups.length ? <div className={styles.grid}>{groups.map(group => (
    <ComparisonChart key={group.code} comparison={group} metadata={metadata} />
  ))}</div> : (
    <div className={styles.empty} role="status">Belum tersedia observasi target yang dapat dibandingkan.</div>
  );
}

function missingChart(code: string, variant: "default" | "compact" = "default") {
  const label = CHART_LABELS[code] ?? (code === "project_progress" ? "Progres Proyek" : code === "strategy_target_actual" ? "Target vs Aktual" : "Analitik tambahan");
  return (
    <article className={`${styles.chartCard} ${variant === "compact" ? styles.chartCardCompact : ""}`} key={code}>
      <h3>{label}</h3>
      <div className={styles.empty}>Belum tersedia</div>
    </article>
  );
}

function AnalyticsCharts({ projection }: Readonly<{ projection: BusinessAnalyticsProjection }>) {
  const series = new Map(projection.series.map(item => [item.code, item]));
  const breakdowns = new Map(projection.breakdowns.map(item => [item.code, item]));
  const comparisons = new Map(projection.comparisons.map(item => [item.code, item]));

  const trendCodes: Readonly<Record<AnalyticsDomain, readonly string[]>> = {
    sales: ["closing_count", "closing_value"],
    property: [],
    finance: ["receipts_amount", "payments_amount"],
    legal: [],
    hr: ["candidate_count"],
    it: ["incident_count"],
    executive: ["closing_value", "closing_count"],
  };
  const breakdownCodes: Readonly<Record<AnalyticsDomain, readonly string[]>> = {
    sales: ["active_pipeline_by_stage"],
    property: ["milestones_by_status", "ncr_by_status"],
    finance: ["payment_exposure"],
    legal: ["contracts_by_status", "contract_expiry", "risks_by_status"],
    hr: ["candidate_funnel"],
    it: ["incidents_by_status", "security_by_severity", "releases_by_status"],
    executive: [],
  };

  const charts: React.ReactNode[] = [];
  for (const code of trendCodes[projection.domain]) {
    const item = series.get(code);
    charts.push(item
      ? <TrendChart key={code} series={item} period={projection.period} generatedAt={projection.generated_at} />
      : missingChart(code));
  }
  for (const code of breakdownCodes[projection.domain]) {
    const item = breakdowns.get(code);
    charts.push(item
      ? <BreakdownChart key={code} breakdown={item} generatedAt={projection.generated_at} />
      : missingChart(code));
  }
  for (const code of projection.domain === "executive" ? ["project_progress"] : projection.domain === "property" ? ["project_progress"] : []) {
    const item = comparisons.get(code);
    charts.push(item
      ? <ComparisonChart key={code} comparison={item} generatedAt={projection.generated_at} />
      : missingChart(code));
  }
  if (projection.domain === "executive") {
    const targets = [...comparisons.values()].filter(item => item.code.startsWith("strategy_target_actual_"));
    charts.push(targets.length
      ? targets.map(item => <ComparisonChart key={item.code} comparison={item} generatedAt={projection.generated_at} />)
      : missingChart("strategy_target_actual"));
  }
  return <div className={styles.grid}>{charts}</div>;
}

function analyticsPeriod(): AnalyticsPeriod {
  const today = new Date();
  const dateTo = today.toISOString().slice(0, 10);
  const dateFrom = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1)).toISOString().slice(0, 10);
  return { from: dateFrom, to: dateTo, granularity: "MONTH" };
}

function AnalyticsPanel({
  domain,
  title,
  executive = false,
}: Readonly<{ domain: AnalyticsDomain; title: string; executive?: boolean }>) {
  const [projection, setProjection] = useState<BusinessAnalyticsProjection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const period = analyticsPeriod();

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ from: period.from, to: period.to, granularity: period.granularity });
    const path = executive
      ? `/api/v1/business/executive/analytics?${query}`
      : `/api/v1/business/${domain}/analytics?${query}`;
    void authenticatedApiRequest<unknown>(path, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        if (!isBusinessAnalyticsProjection(result, domain)) throw new Error("Projection analitik belum memberikan data yang sesuai.");
        setProjection(result);
        setError(null);
      })
      .catch(failure => { if (!controller.signal.aborted) setError(apiMessage(failure)); });
    return () => controller.abort();
  }, [domain, executive, period.from, period.to, period.granularity]);

  return (
    <Section title={title} description="Tren menggunakan periode pilihan. Distribusi dan progres menunjukkan snapshot terbaru dari catatan bisnis.">
      {error ? <Alert message={error} title="Analitik belum dapat dimuat" variant="warning" />
        : projection ? <AnalyticsCharts projection={projection} />
          : <LoadingState label="Memuat analitik bisnis…" variant="section" />}
    </Section>
  );
}

export function BusinessAnalyticsPanel({ domain }: Readonly<{ domain: Exclude<AnalyticsDomain, "executive"> }>) {
  return <AnalyticsPanel domain={domain} title="Analitik Bisnis" />;
}

export function ExecutiveAnalyticsPanel() {
  return <AnalyticsPanel domain="executive" executive title="Kinerja Perusahaan" />;
}

export function useExecutiveAnalytics() {
  const [projection, setProjection] = useState<BusinessAnalyticsProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const period = analyticsPeriod();

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({
      from: period.from,
      to: period.to,
      granularity: period.granularity,
    });
    authenticatedApiRequest<unknown>(`/api/v1/business/executive/analytics?${query}`, {
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return;
        if (!isBusinessAnalyticsProjection(result, "executive")) {
          throw new Error("Projection analitik belum memberikan data yang sesuai.");
        }
        setProjection(result);
        setError(null);
        setLoading(false);
      })
      .catch(failure => {
        if (!controller.signal.aborted) {
          setError(apiMessage(failure));
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [period.from, period.to, period.granularity]);

  return { projection, loading, error };
}

export function ExecutiveCompactAnalytics({
  projection,
  loading = false,
  error = null,
}: Readonly<{
  projection: BusinessAnalyticsProjection | null;
  loading?: boolean;
  error?: string | null;
}>) {
  if (loading) {
    return <LoadingState label="Memuat analitik ringkas…" variant="section" />;
  }
  if (error) {
    return <Alert message={error} title="Analitik belum dapat dimuat" variant="warning" />;
  }
  if (!projection) {
    return <div className={styles.empty}>Belum tersedia</div>;
  }

  const salesSeries = projection.series.find(s => s.code === "closing_value");
  const projectProgress = projection.comparisons.find(c => c.code === "project_progress");
  const targetActual = projection.comparisons.find(c => c.code.startsWith("strategy_target_actual_"));

  return (
    <div className={styles.gridCompact}>
      {salesSeries ? (
        <TrendChart
          series={salesSeries}
          period={projection.period}
          generatedAt={projection.generated_at}
          variant="compact"
        />
      ) : (
        missingChart("closing_value", "compact")
      )}
      {projectProgress ? (
        <ComparisonChart
          comparison={projectProgress}
          generatedAt={projection.generated_at}
          variant="compact"
        />
      ) : (
        missingChart("project_progress", "compact")
      )}
      {targetActual ? (
        <ComparisonChart
          comparison={{ ...targetActual, label: "Target vs Aktual" }}
          generatedAt={projection.generated_at}
          variant="compact"
        />
      ) : (
        missingChart("strategy_target_actual", "compact")
      )}
    </div>
  );
}
