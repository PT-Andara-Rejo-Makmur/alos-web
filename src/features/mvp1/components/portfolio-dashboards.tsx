"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { apiMessage, apiRequest } from "@/lib/api";
import { type SessionActor, type Workspace } from "@/features/mvp1/lib/governance";

import {
  buildProjectPortfolioUrl,
  divisionHealthLabel,
  formatPortfolioDate,
  formatPortfolioMoney,
  formatPortfolioPercent,
  projectStatusLabel,
  shortDivisionName,
  type DivisionOverviewCard,
  type DivisionsOverviewSnapshot,
  type PortfolioTrendPoint,
  type ProjectPortfolioFilters,
  type ProjectPortfolioSnapshot,
  type ProjectStatus,
} from "@/features/mvp1/lib/portfolio";

const DIVISION_COLORS = ["#0b8b4b", "#074b3a", "#ef9511", "#1686df", "#7655d5", "#e83a2f"];
const STATUS_COLORS: Record<ProjectStatus, string> = {
  ON_TRACK: "#0b9952",
  AT_RISK: "#f09a0b",
  CRITICAL: "#ea2f29",
  COMPLETED: "#1686df",
};

const EMPTY_FILTERS: ProjectPortfolioFilters = {
  division_code: "",
  status: "",
  category: "",
  date_from: "",
  date_to: "",
  search: "",
  page: 1,
};

export function DivisionsOverviewDashboard() {
  const [data, setData] = useState<DivisionsOverviewSnapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setData(await apiRequest<DivisionsOverviewSnapshot>("/api/v1/divisions/overview", { signal: controller.signal }));
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

export function ProjectPortfolioDashboard({ actor }: { actor?: SessionActor }) {
  const [filters, setFilters] = useState<ProjectPortfolioFilters>(EMPTY_FILTERS);
  const [data, setData] = useState<ProjectPortfolioSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const url = useMemo(() => buildProjectPortfolioUrl(filters), [filters]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setFailed(false);
      try {
        setData(await apiRequest<ProjectPortfolioSnapshot>(url, { signal: controller.signal }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [reloadKey, url]);

  if (failed && !data) return <PortfolioLoadError label="portofolio proyek" />;
  if (!data) return <PortfolioLoading label="Memuat portofolio proyek…" />;
  return (
    <>
      {actor ? <ProjectCreatePanel actor={actor} onCreated={() => setReloadKey((value) => value + 1)} /> : null}
      {actor ? <ProjectOperationsPanel onChanged={() => setReloadKey((value) => value + 1)} projects={data.projects} /> : null}
      <ProjectPortfolioContent
      dashboard={data}
      filters={filters}
      loading={loading}
      onFiltersChange={setFilters}
      />
    </>
  );
}

type ProjectControl = ProjectPortfolioSnapshot["projects"][number];

function ProjectOperationsPanel({ onChanged, projects }: { onChanged: () => void; projects: ProjectControl[] }) {
  const [projectId, setProjectId] = useState(projects[0]?.project_id ?? "");
  const [mode, setMode] = useState<"update" | "milestone" | "issue">("update");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selected = projects.find((project) => project.project_id === projectId) ?? projects[0];
  const [update, setUpdate] = useState({ status: "ON_TRACK", progress_percent: "0", deadline: "", budget_spent: "" });
  const [milestone, setMilestone] = useState({ title: "", due_date: "", status: "ON_TRACK" });
  const [issue, setIssue] = useState({ title: "", description: "", severity: "MEDIUM", due_date: "" });

  useEffect(() => {
    if (!projectId && projects[0]) {
      const timer = window.setTimeout(() => setProjectId(projects[0].project_id), 0);
      return () => window.clearTimeout(timer);
    }
  }, [projectId, projects]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      if (mode === "update") {
        await apiRequest(`/api/v1/projects/${selected.project_id}`, { method: "PATCH", body: JSON.stringify({ status: update.status, progress_percent: Number(update.progress_percent), deadline: update.deadline || null, budget_spent: update.budget_spent ? Number(update.budget_spent) : null }) });
        setNotice("Status dan progress proyek diperbarui.");
      } else if (mode === "milestone") {
        await apiRequest(`/api/v1/projects/${selected.project_id}/milestones`, { method: "POST", body: JSON.stringify({ ...milestone }) });
        setMilestone({ title: "", due_date: "", status: "ON_TRACK" }); setNotice("Milestone berhasil ditambahkan.");
      } else {
        await apiRequest("/api/v1/project-issues", { method: "POST", body: JSON.stringify({ workspace_id: selected.workspace_id, division_code: selected.division_code, project_id: selected.project_id, title: issue.title, description: issue.description, severity: issue.severity, due_date: issue.due_date || null }) });
        setIssue({ title: "", description: "", severity: "MEDIUM", due_date: "" }); setNotice("Isu proyek berhasil dicatat.");
      }
      onChanged();
    } catch (failure) { setError(apiMessage(failure)); } finally { setSaving(false); }
  }

  async function removeProject() {
    if (!selected || saving) return;
    if (!window.confirm(`Hapus proyek “${selected.name}” secara permanen? Proyek tanpa data terkait akan langsung hilang dari dashboard.`)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await apiRequest(`/api/v1/projects/${selected.project_id}`, { method: "DELETE" });
      setProjectId("");
      setNotice("Proyek telah dihapus.");
      onChanged();
    } catch (failure) { setError(apiMessage(failure)); } finally { setSaving(false); }
  }

  if (!projects.length) return null;
  return <section className="alos-content alos-project-create-shell"><div className="alos-operation-heading"><div><p className="alos-kicker">PROJECT CONTROLS</p><h3>Perbarui proyek, milestone, dan isu</h3></div><select aria-label="Pilih proyek" onChange={(event) => setProjectId(event.target.value)} value={selected?.project_id ?? ""}>{projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.code} · {project.name}</option>)}</select></div>{error ? <div className="alos-operation-banner error">{error}</div> : null}{notice ? <div className="alos-operation-banner success">{notice}</div> : null}<div className="alos-operation-toolbar"><button className={mode === "update" ? "alos-workspace-primary" : "alos-outline-button"} onClick={() => setMode("update")} type="button">Update proyek</button><button className={mode === "milestone" ? "alos-workspace-primary" : "alos-outline-button"} onClick={() => setMode("milestone")} type="button">Tambah milestone</button><button className={mode === "issue" ? "alos-workspace-primary" : "alos-outline-button"} onClick={() => setMode("issue")} type="button">Catat isu</button><button className="danger" disabled={saving} onClick={() => void removeProject()} type="button">Hapus proyek</button></div><form className="alos-operation-form" onSubmit={(event) => void submit(event)}>{mode === "update" ? <><label>Status<select onChange={(event) => setUpdate({ ...update, status: event.target.value })} value={update.status}><option>ON_TRACK</option><option>AT_RISK</option><option>CRITICAL</option><option>COMPLETED</option></select></label><label>Progress (%)<input max="100" min="0" onChange={(event) => setUpdate({ ...update, progress_percent: event.target.value })} required step="0.1" type="number" value={update.progress_percent} /></label><label>Tenggat<input onChange={(event) => setUpdate({ ...update, deadline: event.target.value })} type="date" value={update.deadline} /></label><label>Biaya aktual<input min="0" onChange={(event) => setUpdate({ ...update, budget_spent: event.target.value })} step="1" type="number" value={update.budget_spent} /></label></> : null}{mode === "milestone" ? <><label className="wide">Milestone<input minLength={2} onChange={(event) => setMilestone({ ...milestone, title: event.target.value })} required value={milestone.title} /></label><label>Tenggat<input onChange={(event) => setMilestone({ ...milestone, due_date: event.target.value })} required type="date" value={milestone.due_date} /></label><label>Status<select onChange={(event) => setMilestone({ ...milestone, status: event.target.value })} value={milestone.status}><option>ON_TRACK</option><option>AT_RISK</option><option>CRITICAL</option><option>COMPLETED</option></select></label></> : null}{mode === "issue" ? <><label className="wide">Judul isu<input minLength={2} onChange={(event) => setIssue({ ...issue, title: event.target.value })} required value={issue.title} /></label><label className="wide">Deskripsi<textarea onChange={(event) => setIssue({ ...issue, description: event.target.value })} value={issue.description} /></label><label>Severity<select onChange={(event) => setIssue({ ...issue, severity: event.target.value })} value={issue.severity}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label><label>Tenggat<input onChange={(event) => setIssue({ ...issue, due_date: event.target.value })} type="date" value={issue.due_date} /></label></> : null}<button className="alos-workspace-primary" disabled={saving} type="submit">{saving ? "Menyimpan…" : "Simpan"}</button></form></section>;
}

function ProjectCreatePanel({ actor, onCreated }: { actor: SessionActor; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState(actor.workspace_ids[0] ?? "");
  const [form, setForm] = useState({ code: "", name: "", category: "PROPERTY", deadline: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const activeWorkspace = workspaces.find((item) => item.workspace_id === workspaceId);

  useEffect(() => {
    if (!open || workspaces.length) return;
    apiRequest<Workspace[]>("/api/v1/workspaces")
      .then((items) => {
        const visible = items.filter((item) => actor.workspace_ids.includes(item.workspace_id));
        setWorkspaces(visible);
        if (!workspaceId && visible[0]) setWorkspaceId(visible[0].workspace_id);
      })
      .catch((failure) => setError(apiMessage(failure)));
  }, [actor.workspace_ids, open, workspaceId, workspaces.length]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!activeWorkspace?.division_code) return;
    setSaving(true); setError("");
    try {
      await apiRequest("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          division_code: activeWorkspace.division_code,
          code: form.code,
          name: form.name,
          category: form.category,
          deadline: form.deadline || null,
        }),
      });
      setForm({ code: "", name: "", category: "PROPERTY", deadline: "" });
      setOpen(false);
      onCreated();
    } catch (failure) {
      setError(apiMessage(failure));
    } finally {
      setSaving(false);
    }
  }

  return <section className="alos-content alos-project-create-shell"><div className="alos-operation-heading"><div><p className="alos-kicker">PORTFOLIO OPERATIONS</p><h3>Kelola proyek dalam scope Anda</h3></div><button className="alos-workspace-primary" onClick={() => setOpen((value) => !value)} type="button">{open ? "Tutup" : "+ Buat proyek"}</button></div>{error ? <div className="alos-operation-banner error">{error}</div> : null}{open ? <form className="alos-operation-form" onSubmit={(event) => void submit(event)}><label>Workspace<select onChange={(event) => setWorkspaceId(event.target.value)} required value={workspaceId}>{workspaces.map((item) => <option key={item.workspace_id} value={item.workspace_id}>{item.name} · {item.division_code ?? "Tanpa divisi"}</option>)}</select></label><label>Kode<input maxLength={40} minLength={2} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} required value={form.code} /></label><label>Kategori<input maxLength={80} minLength={2} onChange={(event) => setForm({ ...form, category: event.target.value })} required value={form.category} /></label><label className="wide">Nama proyek<input maxLength={160} minLength={2} onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} /></label><label>Tenggat<input onChange={(event) => setForm({ ...form, deadline: event.target.value })} type="date" value={form.deadline} /></label><button className="alos-workspace-primary" disabled={saving || !activeWorkspace?.division_code} type="submit">{saving ? "Menyimpan…" : "Simpan proyek"}</button></form> : null}</section>;
}

export function ProjectPortfolioContent({
  dashboard,
  filters,
  loading,
  onFiltersChange,
}: {
  dashboard: ProjectPortfolioSnapshot;
  filters: ProjectPortfolioFilters;
  loading: boolean;
  onFiltersChange: (filters: ProjectPortfolioFilters) => void;
}) {
  const setFilter = (key: keyof ProjectPortfolioFilters, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value, page: key === "page" ? Number(value) : 1 });
  };
  return (
    <section className={`alos-content alos-projects-dashboard${loading ? " loading" : ""}`} aria-label="Portfolio Proyek">
      <ProjectFilters dashboard={dashboard} filters={filters} onChange={setFilter} onReset={() => onFiltersChange(EMPTY_FILTERS)} />
      <DataFreshness value={dashboard.generated_at} />
      <ProjectMetrics dashboard={dashboard} />
      <div className="alos-project-overview-grid">
        <ProjectProgress dashboard={dashboard} />
        <ProjectMilestones dashboard={dashboard} />
      </div>
      <div className="alos-project-detail-grid">
        <ProjectTable dashboard={dashboard} filters={filters} onChange={setFilter} />
        <ProjectRisk dashboard={dashboard} />
      </div>
    </section>
  );
}

function ProjectFilters({
  dashboard,
  filters,
  onChange,
  onReset,
}: {
  dashboard: ProjectPortfolioSnapshot;
  filters: ProjectPortfolioFilters;
  onChange: (key: keyof ProjectPortfolioFilters, value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="alos-project-filters" aria-label="Filter proyek">
      <select aria-label="Filter divisi" onChange={(event) => onChange("division_code", event.target.value)} value={filters.division_code}>
        <option value="">Semua Divisi</option>
        {dashboard.filter_options.divisions.map((division) => <option key={division}>{division}</option>)}
      </select>
      <select aria-label="Filter status" onChange={(event) => onChange("status", event.target.value)} value={filters.status}>
        <option value="">Semua Status</option>
        {dashboard.filter_options.statuses.map((status) => <option key={status} value={status}>{projectStatusLabel(status)}</option>)}
      </select>
      <select aria-label="Filter kategori" onChange={(event) => onChange("category", event.target.value)} value={filters.category}>
        <option value="">Semua Kategori</option>
        {dashboard.filter_options.categories.map((category) => <option key={category}>{category}</option>)}
      </select>
      <label><span>Dari</span><input onChange={(event) => onChange("date_from", event.target.value)} type="date" value={filters.date_from} /></label>
      <label><span>Sampai</span><input onChange={(event) => onChange("date_to", event.target.value)} type="date" value={filters.date_to} /></label>
      <button onClick={onReset} type="button">↻ Reset Filter</button>
    </div>
  );
}

function ProjectMetrics({ dashboard }: { dashboard: ProjectPortfolioSnapshot }) {
  const metrics = [
    { key: "total", label: "Total Proyek", value: dashboard.metrics.total, tone: "total", icon: "▦" },
    { key: "on-track", label: "On Track", value: dashboard.metrics.on_track, tone: "on-track", icon: "●" },
    { key: "at-risk", label: "At Risk", value: dashboard.metrics.at_risk, tone: "at-risk", icon: "●" },
    { key: "critical", label: "Critical", value: dashboard.metrics.critical, tone: "critical", icon: "●" },
  ];
  return (
    <div className="alos-project-metrics">
      {metrics.map((metric) => (
        <article className={metric.tone} key={metric.key}>
          <span>{metric.icon}</span><div><strong>{metric.value}</strong><p>{metric.label}</p><small>Data portofolio terverifikasi</small></div>
        </article>
      ))}
    </div>
  );
}

function ProjectProgress({ dashboard }: { dashboard: ProjectPortfolioSnapshot }) {
  const values = dashboard.progress.flatMap((point, index) =>
    point.value === null ? [] : [{ index, value: point.value }],
  );
  const path = values.map((point, index) =>
    `${index ? "L" : "M"}${50 + point.index * (580 / 11)} ${185 - point.value * 1.35}`,
  ).join(" ");
  const total = dashboard.metrics.total;
  let cursor = 0;
  const stops = dashboard.distribution.map((item) => {
    const start = cursor;
    cursor += total ? item.count / total * 100 : 0;
    return `${STATUS_COLORS[item.status]} ${start}% ${cursor}%`;
  });
  return (
    <article className="alos-portfolio-panel alos-project-progress">
      <PanelHeading title="Progress Portofolio Proyek" subtitle={`Tahun ${new Date(dashboard.generated_at).getFullYear()}`} />
      <div className="alos-project-progress-body">
        <div className="alos-project-progress-chart">
          <svg aria-label="Grafik progress portofolio" role="img" viewBox="0 0 650 225">
            {[0, 25, 50, 75, 100].map((tick) => <g key={tick}><line stroke="#e5e9e4" x1="50" x2="630" y1={185 - tick * 1.35} y2={185 - tick * 1.35} /><text x="5" y={189 - tick * 1.35}>{tick}%</text></g>)}
            {path ? <path d={path} fill="none" stroke="#07533e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /> : null}
            {dashboard.progress.map((point, index) => <text className="month" key={point.period} textAnchor="middle" x={50 + index * (580 / 11)} y="211">{point.label}</text>)}
          </svg>
          {!path ? <PortfolioEmpty text="Belum ada histori progress proyek." /> : null}
        </div>
        <div className="alos-project-portfolio-donut-wrap">
          <div className="alos-project-portfolio-donut" style={{ background: total ? `conic-gradient(${stops.join(",")})` : "#e7ebe7" }}>
            <div><strong>{total}</strong><span>Proyek</span></div>
          </div>
          <div className="alos-project-distribution-legend">
            {dashboard.distribution.map((item) => <p key={item.status}><i style={{ background: STATUS_COLORS[item.status] }} /><span>{item.label}</span><strong>{item.count}</strong></p>)}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectMilestones({ dashboard }: { dashboard: ProjectPortfolioSnapshot }) {
  return (
    <article className="alos-portfolio-panel alos-project-milestones">
      <PanelHeading title="Milestone Terdekat" subtitle="Tenggat yang perlu dipantau" />
      {dashboard.milestones.length ? <div className="alos-milestone-list">{dashboard.milestones.map((milestone) => (
        <div key={milestone.milestone_id}>
          <i style={{ background: STATUS_COLORS[milestone.status] }} />
          <time>{formatPortfolioDate(milestone.due_date)}</time>
          <p><strong>{milestone.project_name}</strong><span>{milestone.title}</span></p>
          <StatusPill value={projectStatusLabel(milestone.status)} status={milestone.status} />
        </div>
      ))}</div> : <PortfolioEmpty text="Belum ada milestone aktif." />}
    </article>
  );
}

function ProjectTable({
  dashboard,
  filters,
  onChange,
}: {
  dashboard: ProjectPortfolioSnapshot;
  filters: ProjectPortfolioFilters;
  onChange: (key: keyof ProjectPortfolioFilters, value: string | number) => void;
}) {
  return (
    <article className="alos-portfolio-panel alos-project-table-panel">
      <div className="alos-project-table-toolbar">
        <PanelHeading title="Daftar Proyek" subtitle={`${dashboard.pagination.total_items} proyek ditemukan`} />
        <label><input onChange={(event) => onChange("search", event.target.value)} placeholder="Cari proyek…" value={filters.search} /><span>⌕</span></label>
        <button disabled={!dashboard.projects.length} onClick={() => exportProjects(dashboard)} type="button">↓ Export</button>
      </div>
      {dashboard.projects.length ? <div className="alos-portfolio-table-wrap"><table><thead><tr><th>Nama Proyek</th><th>Divisi</th><th>PIC</th><th>Progress</th><th>Deadline</th><th>Status</th><th>Budget Ringkas</th></tr></thead><tbody>{dashboard.projects.map((project) => (
        <tr key={project.project_id}>
          <td><strong>{project.name}</strong><small>{project.code}</small></td>
          <td>{shortDivisionName(project.division_name)}</td>
          <td>{project.owner_name ?? "Belum ditetapkan"}</td>
          <td><span className="alos-project-progress-cell"><b>{formatPortfolioPercent(project.progress_percent)}</b><i><em style={{ width: `${project.progress_percent}%` }} /></i></span></td>
          <td>{formatPortfolioDate(project.deadline)}</td>
          <td><StatusPill status={project.status} value={projectStatusLabel(project.status)} /></td>
          <td>{formatPortfolioMoney(project.budget_spent, project.currency)} / {formatPortfolioMoney(project.budget_planned, project.currency)}</td>
        </tr>
      ))}</tbody></table></div> : <PortfolioEmpty text="Belum ada proyek yang sesuai filter." />}
      <div className="alos-project-pagination">
        <span>Halaman {dashboard.pagination.page} dari {dashboard.pagination.total_pages}</span>
        <div><button disabled={filters.page <= 1} onClick={() => onChange("page", filters.page - 1)} type="button">←</button><strong>{filters.page}</strong><button disabled={filters.page >= dashboard.pagination.total_pages} onClick={() => onChange("page", filters.page + 1)} type="button">→</button></div>
      </div>
    </article>
  );
}

function ProjectRisk({ dashboard }: { dashboard: ProjectPortfolioSnapshot }) {
  return (
    <article className="alos-portfolio-panel alos-project-risk">
      <PanelHeading title="Project Risk Summary" subtitle="Berdasarkan status proyek aktif" />
      <div className="alos-project-risk-list">
        {dashboard.risk_summary.map((risk) => (
          <div key={risk.status}>
            <span className={risk.status.toLowerCase()}>{risk.status === "CRITICAL" ? "!" : risk.status === "AT_RISK" ? "▲" : "✓"}</span>
            <p><strong>{risk.count} Proyek {projectStatusLabel(risk.status)}</strong><small>{risk.description}</small></p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Sparkline({ compact = false, label, points }: { compact?: boolean; label: string; points: PortfolioTrendPoint[] }) {
  const values = points.flatMap((point, index) => point.value === null ? [] : [{ index, value: point.value }]);
  const width = compact ? 88 : 180;
  const height = compact ? 34 : 62;
  const path = values.map((point, index) => `${index ? "L" : "M"}${5 + point.index * ((width - 10) / Math.max(1, points.length - 1))} ${height - 6 - point.value * ((height - 14) / 100)}`).join(" ");
  return <svg aria-label={label} className={`alos-sparkline${compact ? " compact" : ""}`} role="img" viewBox={`0 0 ${width} ${height}`}><line stroke="#e2e9e3" x1="4" x2={width - 4} y1={height - 6} y2={height - 6} />{path ? <path d={path} fill="none" stroke="#098449" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /> : <path d={`M4 ${height / 2} L${width - 4} ${height / 2}`} fill="none" stroke="#c8d4cb" strokeDasharray="4 4" />}</svg>;
}

function StatusPill({ status, value }: { status?: ProjectStatus; value: string }) {
  const className = (status ?? value).toLowerCase().replaceAll(" ", "_");
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

function exportProjects(dashboard: ProjectPortfolioSnapshot) {
  const rows = [
    ["Kode", "Nama", "Divisi", "PIC", "Progress", "Deadline", "Status", "Budget Terpakai", "Budget Rencana"],
    ...dashboard.projects.map((project) => [
      project.code,
      project.name,
      project.division_name,
      project.owner_name ?? "",
      String(project.progress_percent),
      project.deadline ?? "",
      project.status,
      String(project.budget_spent ?? ""),
      String(project.budget_planned ?? ""),
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "alos-project-portfolio.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}



