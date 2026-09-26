"use client";

import { useEffect, useState } from "react";
import { authenticatedApiRequest } from "@/lib/api";
import {
  divisionHealthLabel,
  formatPortfolioDate,
  formatPortfolioPercent,
  shortDivisionName,
  type DivisionOverviewCard,
  type DivisionsOverviewSnapshot,
  type PortfolioTrendPoint,
} from "@/features/projects/portfolio";

const DIVISION_COLORS = ["#0b8b4b", "#074b3a", "#ef9511", "#1686df", "#7655d5", "#e83a2f"];

export function DivisionsOverviewDashboard() {
  const [data, setData] = useState<DivisionsOverviewSnapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setData(await authenticatedApiRequest<DivisionsOverviewSnapshot>("/api/v1/divisions/overview", { signal: controller.signal }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") setFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  if (failed) return <PortfolioLoadError label="ringkasan divisi" />;
  if (!data) return <PortfolioLoading label="Memuat ringkasan divisi…" />;
  return <DivisionsOverviewContent dashboard={data} />;
}

export function DivisionsOverviewContent({ dashboard }: { dashboard: DivisionsOverviewSnapshot }) {
  return (
    <section className="alos-content alos-divisions-dashboard" aria-label="Divisions Overview">
      <DataFreshness value={dashboard.generated_at} />
      <div className="alos-division-card-grid">
        {dashboard.divisions.map((division) => (
          <DivisionCard division={division} key={division.division_id} />
        ))}
      </div>
      <div className="alos-divisions-lower-grid">
        <article className="alos-portfolio-panel alos-division-comparison">
          <PanelHeading title="Perbandingan Kinerja Divisi" subtitle="Progress portofolio 7 bulan terakhir" />
          <DivisionComparisonChart divisions={dashboard.comparison} />
        </article>
        <article className="alos-portfolio-panel alos-division-issues">
          <PanelHeading title="Isu Divisi" subtitle="Isu terbuka berdasarkan severitas" />
          <DivisionIssues dashboard={dashboard} />
        </article>
        <article className="alos-portfolio-panel alos-division-attention">
          <PanelHeading title="Divisi yang Perlu Perhatian" subtitle="Prioritas tindak lanjut" />
          <DivisionAttention dashboard={dashboard} />
        </article>
      </div>
    </section>
  );
}

function DivisionCard({ division }: { division: DivisionOverviewCard }) {
  return (
    <article className={`alos-division-card ${division.health.toLowerCase()}`}>
      <header>
        <span>{divisionGlyph(division.division_code)}</span>
        <div>
          <h2>{shortDivisionName(division.division_name)}</h2>
          <small className={division.health.toLowerCase()}>
            <i />{divisionHealthLabel(division.health)}
          </small>
        </div>
      </header>
      <dl>
        <div><dt>Proyek Aktif</dt><dd>{division.active_projects}</dd></div>
        <div><dt>Progress Rata-rata</dt><dd>{formatPortfolioPercent(division.average_progress)}</dd></div>
        <div><dt>Task Overdue</dt><dd>{division.overdue_tasks}</dd></div>
        <div><dt>Approval Pending</dt><dd>{division.pending_approvals}</dd></div>
      </dl>
      <Sparkline label={`Tren ${division.division_name}`} points={division.trend} />
    </article>
  );
}

function DivisionComparisonChart({ divisions }: { divisions: DivisionOverviewCard[] }) {
  const available = divisions.some((division) => division.trend.some((point) => point.value !== null));
  return (
    <div className="alos-division-comparison-chart">
      <svg aria-label="Grafik perbandingan kinerja divisi" role="img" viewBox="0 0 700 250">
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line stroke="#e5e9e4" x1="48" x2="680" y1={205 - tick * 1.55} y2={205 - tick * 1.55} />
            <text x="5" y={209 - tick * 1.55}>{tick}%</text>
          </g>
        ))}
        {divisions.map((division, divisionIndex) => {
          const values = division.trend.flatMap((point, index) =>
            point.value === null ? [] : [{ index, value: point.value }],
          );
          const path = values.map((point, index) =>
            `${index ? "L" : "M"}${48 + point.index * (632 / 6)} ${205 - point.value * 1.55}`,
          ).join(" ");
          return path ? (
            <path
              d={path}
              fill="none"
              key={division.division_id}
              stroke={DIVISION_COLORS[divisionIndex % DIVISION_COLORS.length]}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          ) : null;
        })}
        {(divisions[0]?.trend ?? []).map((point, index) => (
          <text className="month" key={point.period} textAnchor="middle" x={48 + index * (632 / 6)} y="231">
            {point.label}
          </text>
        ))}
      </svg>
      {!available ? <PortfolioEmpty text="Belum ada histori progress proyek untuk dibandingkan." /> : null}
      <div className="alos-division-chart-legend">
        {divisions.map((division, index) => (
          <span key={division.division_id}>
            <i style={{ background: DIVISION_COLORS[index % DIVISION_COLORS.length] }} />
            {shortDivisionName(division.division_name)}
          </span>
        ))}
      </div>
    </div>
  );
}

function DivisionIssues({ dashboard }: { dashboard: DivisionsOverviewSnapshot }) {
  if (!dashboard.issues.length) return <PortfolioEmpty text="Tidak ada isu divisi terbuka." />;
  return (
    <div className="alos-portfolio-table-wrap">
      <table>
        <thead><tr><th>Divisi</th><th>Isu</th><th>Severitas</th><th>Owner</th><th>Status</th><th>Due Date</th></tr></thead>
        <tbody>
          {dashboard.issues.map((issue) => (
            <tr key={issue.issue_id}>
              <td><strong>{shortDivisionName(issue.division_name)}</strong></td>
              <td>{issue.title}</td>
              <td><StatusPill value={issue.severity} /></td>
              <td>{issue.owner_name ?? "Belum ditetapkan"}</td>
              <td><StatusPill value={issue.status} /></td>
              <td>{formatPortfolioDate(issue.due_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DivisionAttention({ dashboard }: { dashboard: DivisionsOverviewSnapshot }) {
  if (!dashboard.attention.length) return <PortfolioEmpty text="Tidak ada divisi yang memerlukan perhatian." />;
  return (
    <div className="alos-division-attention-list">
      {dashboard.attention.map((division) => (
        <div key={division.division_id}>
          <span className={division.health.toLowerCase()}>!</span>
          <p><strong>{shortDivisionName(division.division_name)}</strong><small>{division.summary}</small></p>
          <StatusPill value={division.health} />
          <Sparkline compact label={`Tren ${division.division_name}`} points={division.trend} />
        </div>
      ))}
    </div>
  );
}

function Sparkline({ compact = false, label, points }: { compact?: boolean; label: string; points: PortfolioTrendPoint[] }) {
  const values = points.flatMap((point, index) => point.value === null ? [] : [{ index, value: point.value }]);
  const width = compact ? 88 : 180;
  const height = compact ? 34 : 62;
  const path = values.map((point, index) => `${index ? "L" : "M"}${5 + point.index * ((width - 10) / Math.max(1, points.length - 1))} ${height - 6 - point.value * ((height - 14) / 100)}`).join(" ");
  return <svg aria-label={label} className={`alos-sparkline${compact ? " compact" : ""}`} role="img" viewBox={`0 0 ${width} ${height}`}><line stroke="#e2e9e3" x1="4" x2={width - 4} y1={height - 6} y2={height - 6} />{path ? <path d={path} fill="none" stroke="#098449" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /> : <path d={`M4 ${height / 2} L${width - 4} ${height / 2}`} fill="none" stroke="#c8d4cb" strokeDasharray="4 4" />}</svg>;
}

function StatusPill({ value }: { value: string }) {
  const className = value.toLowerCase().replaceAll(" ", "_");
  return <span className={`alos-status-pill ${className}`}>{value.replaceAll("_", " ")}</span>;
}

function PanelHeading({ subtitle, title }: { subtitle: string; title: string }) {
  return <div className="alos-portfolio-panel-heading"><h2>{title}</h2><p>{subtitle}</p></div>;
}

function DataFreshness({ value }: { value: string }) {
  return <p className="alos-portfolio-freshness"><i />Data diperbarui {new Intl.DateTimeFormat("id-ID", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "short" }).format(new Date(value))}</p>;
}

function PortfolioLoading({ label }: { label: string }) {
  return <section className="alos-content alos-portfolio-loading" aria-live="polite"><p>{label}</p><div /><div /></section>;
}

function PortfolioLoadError({ label }: { label: string }) {
  return <section className="alos-content"><article className="alos-executive-error"><strong>Gagal memuat {label}</strong><span>Data tetap aman. Muat ulang halaman untuk mencoba kembali.</span></article></section>;
}

function PortfolioEmpty({ text }: { text: string }) {
  return <div className="alos-portfolio-empty"><span>◇</span><p>{text}</p></div>;
}

function divisionGlyph(code: string) {
  if (code === "SALES_MARKETING") return "◆";
  if (code === "FINANCE") return "◎";
  if (code === "HR") return "●";
  if (code === "IT") return "⚙";
  if (code === "LEGAL") return "◇";
  return "▦";
}
