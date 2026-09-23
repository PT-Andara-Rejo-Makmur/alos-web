"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";

import type { DashboardMetric, DashboardModuleKey } from "@/features/workspace-routing/dashboard-modules";
import {
  getDashboardProfile,
  type DashboardPersona,
  type DashboardProfile,
} from "@/features/access-control/dashboard-access";
import { DocumentCenter } from "@/features/documents/document-center";
import { GenesisChat } from "@/features/genesis-workspace/conversation-workspace";
import { OperationalModuleDashboard } from "@/features/operations/operational-module-dashboard";
import {
  DivisionsOverviewDashboard,
  ProjectPortfolioDashboard,
} from "@/features/projects/portfolio-dashboards";
import {
  approvalAgeLabel,
  approvalKindLabel,
  formatExecutiveMetric,
  type ExecutiveDashboardMetric,
  type ExecutiveDashboardSnapshot,
} from "@/features/executive-dashboard/legacy-projection";
import type { SessionActor } from "@/features/session";
import { ProtectedDomainWorkspace, type WorkspaceShellIdentity } from "@/features/workspace-shell";

type ExecutiveDashboardProps = {
  module?: DashboardModuleKey;
};

type IconName = "home" | "divisions" | "projects" | "tasks" | "approvals" | "documents" | "reports" | "findings" | "genesis" | "settings" | "governance" | "logout" | "bell" | "chevron" | DashboardMetric["icon"];

export const navItems: Array<{ href: string; key: DashboardModuleKey; label: string; icon: IconName }> = [
  { href: "/business/divisions", key: "divisions", label: "Divisi", icon: "divisions" },
  { href: "/business/projects", key: "projects", label: "Proyek", icon: "projects" },
  { href: "/business/tasks", key: "tasks", label: "Tugas", icon: "tasks" },
  { href: "/business/approvals", key: "approvals", label: "Approval", icon: "approvals" },
  { href: "/business/documents", key: "documents", label: "Dokumen", icon: "documents" },
  { href: "/business/reports", key: "reports", label: "Laporan", icon: "reports" },
  { href: "/business/findings", key: "findings", label: "Temuan", icon: "findings" },
];

export function ExecutiveDashboard({ module }: ExecutiveDashboardProps) {
  return (
    <ProtectedDomainWorkspace
      divisionCodes={["FINANCE", "HR", "IT", "LEGAL", "PROPERTY", "SALES", "SALES_MARKETING"]}
      loadingLabel="Memuat ALOS…"
      roleLabel="Anggota Tim"
      workspaceKeys={["executive", "finance", "hr", "it", "legal", "property", "sales"]}
    >
      {({ actor, identity }) => (
        <BusinessDashboardContent actor={actor} identity={identity} module={module} />
      )}
    </ProtectedDomainWorkspace>
  );
}

function BusinessDashboardContent({ actor, identity, module }: { actor: SessionActor; identity: WorkspaceShellIdentity; module?: DashboardModuleKey }) {
  const [executiveData, setExecutiveData] = useState<ExecutiveDashboardSnapshot | null>(null);
  const [executiveLoadFailed, setExecutiveLoadFailed] = useState(false);
  const profile = getDashboardProfile(actor.roles, actor.division_codes);

  useEffect(() => {
    if (!actor.roles.includes("EXECUTIVE")) return;
    const controller = new AbortController();
    authenticatedApiRequest<ExecutiveDashboardSnapshot>("/api/v1/executive-dashboard", { signal: controller.signal })
      .then(setExecutiveData)
      .catch(() => { if (!controller.signal.aborted) setExecutiveLoadFailed(true); });
    return () => controller.abort();
  }, [actor.roles]);

  return module
    ? <ModuleDashboard activeWorkspace={identity} actor={actor} module={module} />
    : <ExecutiveDashboardContent dashboard={executiveData} loadFailed={executiveLoadFailed} profile={profile} />;
}
export function ExecutiveDashboardContent({
  dashboard,
  loadFailed,
  profile,
}: {
  dashboard: ExecutiveDashboardSnapshot | null;
  loadFailed: boolean;
  profile: DashboardProfile;
}) {
  const content = homeDashboardContent(profile.persona);
  if (profile.persona === "director") {
    if (loadFailed) {
      return <section className="alos-content alos-executive-content"><article className="alos-executive-error"><strong>Ringkasan eksekutif belum dapat dimuat</strong><span>Data operasional tetap aman. Muat ulang halaman untuk mencoba kembali.</span></article></section>;
    }
    if (!dashboard) return <ExecutiveDashboardLoading />;
    return <ExecutiveHomeDashboard dashboard={dashboard} />;
  }
  return (
    <section className="alos-content" aria-label={profile.homeLabel}>
      <DashboardScope profile={profile} />
      <MetricGrid metrics={content.metrics} />
      <div className="alos-dashboard-grid">
        <DataPanel eyebrow={content.primaryEyebrow} title={content.primaryTitle} type="chart" />
        <DataPanel eyebrow={content.secondaryEyebrow} title={content.secondaryTitle} type="donut" />
      </div>
      <div className="alos-dashboard-grid alos-lower-grid">
        <DataPanel eyebrow={content.lowerPrimaryEyebrow} title={content.lowerPrimaryTitle} type="division-grid" />
        <DataPanel eyebrow={content.lowerSecondaryEyebrow} title={content.lowerSecondaryTitle} type="list" />
      </div>
    </section>
  );
}

export function ExecutiveHomeDashboard({ dashboard }: { dashboard: ExecutiveDashboardSnapshot }) {
  return (
    <section className="alos-content alos-executive-content" aria-label="Executive Dashboard">
      <div className="alos-executive-freshness">
        <span><i />Data governance live</span>
        <small>Diperbarui {formatDashboardTimestamp(dashboard.generated_at)}</small>
      </div>
      <div className="alos-executive-metrics">
        {dashboard.metrics.map((metric) => <ExecutiveMetricCard key={metric.key} metric={metric} />)}
      </div>
      <div className="alos-executive-primary-grid">
        <ExecutivePerformancePanel dashboard={dashboard} />
        <ExecutiveProjectDistributionPanel dashboard={dashboard} />
      </div>
      <div className="alos-executive-bottom-grid">
        <ExecutiveDivisionPanel dashboard={dashboard} />
        <ExecutiveAttentionPanel dashboard={dashboard} />
        <ExecutiveApprovalPanel dashboard={dashboard} />
      </div>
    </section>
  );
}

function ExecutiveDashboardLoading() {
  return <section className="alos-content alos-executive-content" aria-label="Memuat Executive Dashboard"><div className="alos-executive-metrics">{[0, 1, 2, 3].map((item) => <div className="alos-executive-skeleton metric" key={item} />)}</div><div className="alos-executive-primary-grid"><div className="alos-executive-skeleton panel" /><div className="alos-executive-skeleton panel" /></div></section>;
}

function ExecutiveMetricCard({ metric }: { metric: ExecutiveDashboardMetric }) {
  const icon: IconName = metric.key === "active_projects"
    ? "projects"
    : metric.key === "average_progress"
      ? "chart"
      : metric.key === "overdue_tasks"
        ? "alert"
        : "file";
  return <article className={`alos-executive-metric ${metric.tone.toLowerCase()} ${metric.state.toLowerCase()}`}><span className="alos-executive-metric-icon"><AppIcon name={icon} /></span><div><strong>{formatExecutiveMetric(metric)}</strong><p>{metric.label}</p><small><i />{metric.context}</small></div></article>;
}

function ExecutivePerformancePanel({ dashboard }: { dashboard: ExecutiveDashboardSnapshot }) {
  const points = dashboard.performance.points;
  const available = points.flatMap((point, index) => point.value === null ? [] : [{ ...point, index }]);
  const x = (index: number) => 51 + index * (612 / Math.max(1, points.length - 1));
  const y = (value: number) => 180 - Math.min(100, Math.max(0, value)) * 1.38;
  const line = available.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.index)} ${y(point.value!)}`).join(" ");
  const area = available.length > 1 ? `${line} L${x(available.at(-1)!.index)} 180 L${x(available[0].index)} 180 Z` : "";
  return <article className="alos-executive-panel alos-executive-performance"><div className="alos-executive-panel-heading"><div><h2>Kinerja Perusahaan</h2><p>{dashboard.performance.title}</p></div><span>7 Bulan Terakhir <AppIcon name="chevron" /></span></div><div className="alos-performance-chart"><svg aria-label="Grafik rasio approval" role="img" viewBox="0 0 700 220"><defs><linearGradient id="executive-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0b6a43" stopOpacity=".2" /><stop offset="1" stopColor="#0b6a43" stopOpacity=".01" /></linearGradient></defs>{[0, 25, 50, 75, 100].map((tick) => <g key={tick}><line stroke="#e5e8e3" x1="51" x2="663" y1={y(tick)} y2={y(tick)} /><text x="10" y={y(tick) + 4}>{tick}</text></g>)}{area ? <path d={area} fill="url(#executive-chart-fill)" /> : null}{line ? <path d={line} fill="none" stroke="#07523d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /> : null}{available.map((point) => <circle cx={x(point.index)} cy={y(point.value!)} fill="#07523d" key={point.period} r="4.5" />)}{points.map((point, index) => <text className="month" key={point.period} textAnchor="middle" x={x(index)} y="207">{point.label}</text>)}</svg>{available.length === 0 ? <div className="alos-chart-empty"><strong>Belum ada keputusan pada periode ini</strong><span>Grafik akan terisi dari review dokumen dan release agent.</span></div> : null}</div><div className="alos-performance-legend"><span><i className="healthy" />Approved</span><span><i className="neutral" />Returned / Rejected</span><small>{dashboard.performance.context}</small></div></article>;
}

function ExecutiveProjectDistributionPanel({ dashboard }: { dashboard: ExecutiveDashboardSnapshot }) {
  const distribution = dashboard.project_distribution;
  const colors = { BLUE: "#1687e8", GREEN: "#07934e", AMBER: "#f2a00d", RED: "#e72b23" } as const;
  let cursor = 0;
  const stops = distribution.items.map((item) => {
    const start = cursor;
    cursor += distribution.total ? item.count / distribution.total * 100 : 0;
    return `${colors[item.tone]} ${start}% ${cursor}%`;
  });
  const background = distribution.available && distribution.total
    ? `conic-gradient(${stops.join(", ")})`
    : "conic-gradient(#e5e9e5 0 100%)";
  return <article className="alos-executive-panel alos-executive-distribution"><div className="alos-executive-panel-heading"><div><h2>Distribusi Proyek</h2><p>Status portofolio saat ini</p></div><Link href="/business/projects">Lihat Detail <span>→</span></Link></div><div className="alos-project-distribution-body"><div className={`alos-project-donut${distribution.available ? "" : " unavailable"}`} style={{ background }}><div><strong>{distribution.available ? distribution.total : "—"}</strong><span>Proyek</span></div></div><div className="alos-project-legend">{distribution.items.map((item) => <div key={item.key}><i style={{ background: colors[item.tone] }} /><span>{item.label}</span><strong>{item.count} {distribution.total ? `(${Math.round(item.count / distribution.total * 100)}%)` : "(0%)"}</strong></div>)}</div></div>{!distribution.available ? <p className="alos-data-notice">{distribution.context}</p> : null}</article>;
}

function ExecutiveDivisionPanel({ dashboard }: { dashboard: ExecutiveDashboardSnapshot }) {
  return <article className="alos-executive-panel alos-executive-divisions"><div className="alos-executive-panel-heading"><div><h2>Ringkasan Per Divisi</h2><p>Data yang sudah tercatat di ALOS</p></div></div><div className="alos-division-summary-grid">{dashboard.divisions.map((division) => <div className="alos-division-summary" key={division.division_code}><strong>{shortDivisionName(division.division_name)}</strong><span className={division.health.toLowerCase()}><i />{divisionHealthLabel(division.health)}</span><dl><div><dt>Dokumen</dt><dd>{division.document_count}</dd></div><div><dt>Approval</dt><dd>{division.pending_approvals}</dd></div><div><dt>Analisis</dt><dd>{division.active_genesis_workflows}</dd></div></dl></div>)}</div>{dashboard.divisions.length === 0 ? <ExecutiveEmpty text="Belum ada divisi yang dapat diakses." /> : null}</article>;
}

function ExecutiveAttentionPanel({ dashboard }: { dashboard: ExecutiveDashboardSnapshot }) {
  return <article className="alos-executive-panel alos-executive-attention"><div className="alos-executive-panel-heading"><div><h2>Proyek yang Perlu Perhatian</h2><p>Risiko portofolio aktif</p></div></div>{dashboard.attention_projects.length ? <div className="alos-attention-list">{dashboard.attention_projects.map((project) => <div key={project.project_id}><span><strong>{project.name}</strong><small>{formatExecutivePercent(project.progress_percent)}</small></span><i><b style={{ width: `${project.progress_percent}%` }} /></i><em className={project.status.toLowerCase()}>{projectStatusLabel(project.status)}</em></div>)}</div> : <ExecutiveEmpty text="Sumber proyek belum terhubung; tidak ada risiko proyek yang dibuat-buat." />}</article>;
}

function ExecutiveApprovalPanel({ dashboard }: { dashboard: ExecutiveDashboardSnapshot }) {
  return <article className="alos-executive-panel alos-executive-approvals"><div className="alos-executive-panel-heading"><div><h2>Approval Pending</h2><p>Dokumen dan release agent</p></div><Link href="/business/approvals">Lihat Semua <span>→</span></Link></div>{dashboard.pending_approvals.length ? <div className="alos-approval-table-wrap"><table><thead><tr><th>ID</th><th>Jenis</th><th>Permintaan</th><th>Umur</th></tr></thead><tbody>{dashboard.pending_approvals.map((approval) => <tr key={approval.approval_id}><td><code>{approval.approval_id.slice(0, 8).toUpperCase()}</code></td><td>{approvalKindLabel(approval.kind)}</td><td><strong>{approval.title}</strong><small>{approval.requested_by} · {approval.workspace_name}</small></td><td><span className={approval.urgency.toLowerCase()}>{approvalAgeLabel(approval.age_days)}</span></td></tr>)}</tbody></table></div> : <ExecutiveEmpty text="Tidak ada approval yang menunggu keputusan." />}</article>;
}

function ExecutiveEmpty({ text }: { text: string }) {
  return <div className="alos-executive-empty"><span>✓</span><p>{text}</p></div>;
}

function divisionHealthLabel(health: ExecutiveDashboardSnapshot["divisions"][number]["health"]) {
  if (health === "HEALTHY") return "Healthy";
  if (health === "ATTENTION") return "Attention";
  return "Belum terhubung";
}

function projectStatusLabel(status: ExecutiveDashboardSnapshot["attention_projects"][number]["status"]) {
  if (status === "ON_TRACK") return "On Track";
  if (status === "AT_RISK") return "At Risk";
  return "Critical";
}

function shortDivisionName(name: string) {
  return name.replace("Sales & Marketing", "Marketing").replace("Human Resources", "HR").replace("Information Technology", "IT");
}

function formatExecutivePercent(value: number) {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatDashboardTimestamp(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "short" }).format(new Date(value));
}

function DashboardScope({ profile }: { profile: DashboardProfile }) {
  return (
    <article className="alos-role-scope">
      <div>
        <p className="alos-kicker">RUANG KERJA AKTIF</p>
        <h2>{profile.scopeTitle}</h2>
        <p>{profile.scopeDescription}</p>
      </div>
      <dl>
        <div><dt>Peran</dt><dd>{profile.roleLabel}</dd></div>
        <div><dt>Lingkup divisi</dt><dd>{profile.divisionLabel ?? "Lintas fungsi"}</dd></div>
      </dl>
    </article>
  );
}

function homeDashboardContent(persona: DashboardPersona) {
  const shared: Record<DashboardPersona, {
    lowerPrimaryEyebrow: string;
    lowerPrimaryTitle: string;
    lowerSecondaryEyebrow: string;
    lowerSecondaryTitle: string;
    metrics: DashboardMetric[];
    primaryEyebrow: string;
    primaryTitle: string;
    secondaryEyebrow: string;
    secondaryTitle: string;
  }> = {
    director: {
      metrics: [
        { label: "Proyek aktif", hint: "Belum ada proyek terhubung", icon: "folder", tone: "success" },
        { label: "Rata-rata progres", hint: "Menunggu pembaruan proyek", icon: "chart", tone: "warning" },
        { label: "Tugas overdue", hint: "Belum ada tugas terdaftar", icon: "alert", tone: "danger" },
        { label: "Approval pending", hint: "Belum ada permintaan", icon: "file", tone: "info" },
      ],
      primaryEyebrow: "KINERJA PERUSAHAAN",
      primaryTitle: "Tren kinerja",
      secondaryEyebrow: "DISTRIBUSI PROYEK",
      secondaryTitle: "Kesehatan proyek",
      lowerPrimaryEyebrow: "RINGKASAN PER DIVISI",
      lowerPrimaryTitle: "Kesehatan organisasi",
      lowerSecondaryEyebrow: "MEMERLUKAN PERHATIAN",
      lowerSecondaryTitle: "Proyek, isu, dan approval",
    },
    division_lead: {
      metrics: [
        { label: "Prioritas divisi", hint: "Belum ada prioritas terdaftar", icon: "folder", tone: "success" },
        { label: "Progres kerja", hint: "Menunggu pembaruan tim", icon: "chart", tone: "warning" },
        { label: "Tenggat perhatian", hint: "Belum ada tenggat terdaftar", icon: "alert", tone: "danger" },
        { label: "Menunggu keputusan", hint: "Belum ada approval", icon: "file", tone: "info" },
      ],
      primaryEyebrow: "KINERJA DIVISI",
      primaryTitle: "Tren prioritas dan progres",
      secondaryEyebrow: "KESEHATAN KERJA",
      secondaryTitle: "Status pekerjaan divisi",
      lowerPrimaryEyebrow: "TIM & EVIDENCE",
      lowerPrimaryTitle: "Kesiapan proses divisi",
      lowerSecondaryEyebrow: "PERLU TINDAK LANJUT",
      lowerSecondaryTitle: "Tugas, risiko, dan approval",
    },
    member: {
      metrics: [
        { label: "Tugas saya", hint: "Belum ada tugas ditugaskan", icon: "check", tone: "success" },
        { label: "Jatuh tempo", hint: "Belum ada tenggat", icon: "calendar", tone: "warning" },
        { label: "Perlu perhatian", hint: "Belum ada isu", icon: "alert", tone: "danger" },
        { label: "Menunggu review", hint: "Belum ada item", icon: "file", tone: "info" },
      ],
      primaryEyebrow: "PEKERJAAN SAYA",
      primaryTitle: "Prioritas dan penyelesaian",
      secondaryEyebrow: "STATUS TUGAS",
      secondaryTitle: "Kesehatan pekerjaan saya",
      lowerPrimaryEyebrow: "DOKUMEN & EVIDENCE",
      lowerPrimaryTitle: "Sumber yang dapat diakses",
      lowerSecondaryEyebrow: "BUTUH PERHATIAN",
      lowerSecondaryTitle: "Tugas dan approval terkait",
    },
    it_lead: {
      metrics: [
        { label: "Agent terdaftar", hint: "Menunggu release yang disetujui", icon: "folder", tone: "success" },
        { label: "Sumber terverifikasi", hint: "Belum ada sumber baru", icon: "check", tone: "info" },
        { label: "Kontrol menunggu", hint: "Belum ada kontrol baru", icon: "alert", tone: "warning" },
        { label: "UAT & release", hint: "Belum ada aktivitas baru", icon: "file", tone: "violet" },
      ],
      primaryEyebrow: "OPERASI SISTEM",
      primaryTitle: "Kesiapan runtime dan sumber",
      secondaryEyebrow: "GENESIS & AGENT",
      secondaryTitle: "Status kontrak dan release",
      lowerPrimaryEyebrow: "KONTROL TEKNIS",
      lowerPrimaryTitle: "Guardrail dan evidence",
      lowerSecondaryEyebrow: "TINDAK LANJUT",
      lowerSecondaryTitle: "UAT, review, dan release",
    },
    deputy_it: {
      metrics: [
        { label: "Kontrol untuk review", hint: "Belum ada kontrol menunggu", icon: "shield", tone: "warning" },
        { label: "Evidence terverifikasi", hint: "Belum ada evidence baru", icon: "check", tone: "success" },
        { label: "Temuan guardrail", hint: "Belum ada temuan", icon: "alert", tone: "danger" },
        { label: "Audit tersedia", hint: "Menunggu aktivitas", icon: "file", tone: "info" },
      ],
      primaryEyebrow: "KONTROL & EVIDENCE",
      primaryTitle: "Kesiapan kontrol operasi",
      secondaryEyebrow: "HASIL UJI",
      secondaryTitle: "Ringkasan UAT dan guardrail",
      lowerPrimaryEyebrow: "AUDIT LINTAS FUNGSI",
      lowerPrimaryTitle: "Status pemeriksaan",
      lowerSecondaryEyebrow: "MEMERLUKAN REVIEW",
      lowerSecondaryTitle: "Approval dan pengecualian",
    },
  };
  return shared[persona];
}

function ModuleDashboard({
  actor,
  module,
  activeWorkspace,
}: {
  actor: SessionActor;
  module: DashboardModuleKey;
  activeWorkspace: WorkspaceShellIdentity;
}) {
  if (module === "genesis") return <GenesisDashboard activeWorkspace={activeWorkspace} actor={actor} />;
  if (module === "settings") return <SettingsDashboard actor={actor} />;
  if (module === "documents") return <DocumentCenter activeWorkspace={activeWorkspace} actor={actor} mode="documents" />;
  if (module === "divisions") return <DivisionsOverviewDashboard />;
  if (module === "projects") return <ProjectPortfolioDashboard activeWorkspace={activeWorkspace} />;
  if (module === "tasks" || module === "approvals" || module === "findings" || module === "reports") {
    return <OperationalModuleDashboard activeWorkspace={activeWorkspace} actor={actor} module={module} />;
  }
  return null;
}

function GenesisDashboard({ actor, activeWorkspace }: { actor: SessionActor; activeWorkspace: WorkspaceShellIdentity }) {
  return <GenesisChat activeDivisionCode={activeWorkspace.divisionCode} activeWorkspaceId={activeWorkspace.workspaceId} actor={actor} />;
}

function SettingsDashboard({ actor }: { actor: SessionActor }) {
  const roleLabel = getDashboardProfile(actor.roles, actor.division_codes).roleLabel;
  return (
    <section className="alos-content" aria-label="Pengaturan ALOS">
      <div className="alos-section-heading"><div><p className="alos-kicker">ALOS / ADMINISTRATION</p><h2>Settings &amp; Administration</h2></div><span>Hak akses aktif</span></div>
      <div className="alos-settings-top"><article className="alos-panel"><PanelTitle eyebrow="AKUN" title="Sesi aktif" /><dl className="review-list"><div><dt>User ID</dt><dd className="digest-value">{actor.user_id}</dd></div><div><dt>Berlaku hingga</dt><dd>{actor.expires_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(actor.expires_at)) : "Tidak tersedia"}</dd></div></dl></article><article className="alos-panel"><PanelTitle eyebrow="ORGANISASI" title="Scope organisasi" /><dl className="review-list"><div><dt>Organization ID</dt><dd className="digest-value">{actor.organization_id ?? "Tidak tersedia"}</dd></div><div><dt>Workspace terakses</dt><dd>{actor.workspace_ids.length}</dd></div><div><dt>Divisi terakses</dt><dd>{actor.division_codes.join(", ") || "Lintas organisasi sesuai policy"}</dd></div></dl></article><article className="alos-panel"><PanelTitle eyebrow="AKSES" title="Role &amp; control" /><div className="alos-role-card"><AppIcon name="shield" /><div><strong>{roleLabel}</strong><span>{actor.roles.join(" · ") || "Role terdaftar"}</span></div></div><Link className="alos-text-button" href="/governance">Buka Governance &amp; Agent Control →</Link></article></div>
      <div className="alos-settings-grid"><article className="alos-panel alos-setting-card"><AppIcon name="bell" /><div><h3>Notifikasi</h3><p>Gunakan ikon notifikasi di bar atas untuk melihat dan menandai inbox Anda.</p></div></article><IntegrationStatusPanel actor={actor} /></div>
    </section>
  );
}

type IntegrationStatus = { integration_key: string; provider: string; status: string; allowed_hosts: string[]; updated_at: string };

function IntegrationStatusPanel({ actor }: { actor: SessionActor }) {
  const canView = actor.roles.some((role) => ["EXECUTIVE", "IT_ADMIN", "AI_ADMIN"].includes(role));
  const [items, setItems] = useState<IntegrationStatus[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!canView) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      authenticatedApiRequest<IntegrationStatus[]>("/api/v1/integrations/status", { signal: controller.signal }).then(setItems).catch((failure) => {
        if (!controller.signal.aborted) setError(apiMessage(failure));
      });
    }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [canView]);
  if (!canView) return <article className="alos-panel alos-setting-card"><AppIcon name="shield" /><div><h3>Status integrasi</h3><p>Status konektor hanya tersedia untuk peran observability.</p></div></article>;
  return <article className="alos-panel alos-setting-card"><AppIcon name="settings" /><div><h3>Status integrasi</h3>{error ? <p>{error}</p> : items.length ? <ul>{items.map((item) => <li key={item.integration_key}>{item.integration_key}: <strong>{item.status}</strong> · {item.provider}</li>)}</ul> : <p>Belum ada integrasi yang terdaftar untuk organisasi ini.</p>}</div><Link aria-label="Buka governance" href="/governance"><AppIcon name="chevron" /></Link></article>;
}

function MetricGrid({ metrics }: { metrics: readonly DashboardMetric[] }) {
  return <div className="alos-metric-grid">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>;
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  return <article className={`alos-metric alos-metric-${metric.tone}`}><span className="alos-metric-icon"><AppIcon name={metric.icon} /></span><div><strong>—</strong><p>{metric.label}</p><small>{metric.hint}</small></div></article>;
}

function DataPanel({ eyebrow, title, type }: { eyebrow: string; title: string; type: "chart" | "donut" | "division-grid" | "list" | "severity" }) {
  return <article className={`alos-panel alos-panel-${type}`}><PanelTitle eyebrow={eyebrow} title={title} />{type === "chart" && <EmptyChart />}{type === "donut" && <EmptyDonut />}{type === "division-grid" && <EmptyDivisionGrid />}{type === "severity" && <EmptySeverity />}{type === "list" && <EmptyList />}</article>;
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="alos-panel-title"><p className="alos-kicker">{eyebrow}</p><h3>{title}</h3></div>;
}

function EmptyChart() {
  return <div className="alos-empty-chart"><span>Belum ada data tren</span><i /><i /><i /><i /><i /><i /></div>;
}

function EmptyDonut() {
  return <div className="alos-donut-empty"><div><strong>—</strong><span>Data</span></div><p>Status akan tersedia setelah data terhubung.</p></div>;
}

function EmptyDivisionGrid() {
  return <div className="alos-division-empty"><div>Divisi <span>—</span></div><div>Kesehatan <span>—</span></div><div>Progres <span>—</span></div><div>Isu <span>—</span></div><p>Struktur divisi belum terdaftar.</p></div>;
}

function EmptySeverity() {
  return <div className="alos-severity-empty"><i /><i /><i /><i /><p>Belum ada temuan audit.</p></div>;
}

function EmptyList() {
  return <div className="alos-empty-list"><div /><div /><div /><p>Belum ada item untuk ditampilkan.</p></div>;
}

function AppIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></>,
    divisions: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    projects: <><path d="M4 7h16v13H4zM8 7V4h8v3M8 12h8" /></>,
    tasks: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 9 1.5 1.5L13 7m-5 8 1.5 1.5L13 13m3-4h.01M16 15h.01" /></>,
    approvals: <><path d="m5 12 4 4L19 6" /><path d="M21 12a9 9 0 1 1-3-6.7" /></>,
    documents: <><path d="M6 3h9l3 3v15H6zM9 11h6M9 15h6M9 7h3" /></>,
    reports: <><path d="M4 20V10m5 10V4m6 16v-7m5 7V7" /></>,
    findings: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4m-5-8v4m0 4h.01" /></>,
    genesis: <><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06-2.1 2.1-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V20.5h-3v-.11A1.8 1.8 0 0 0 10.45 18.7a1.8 1.8 0 0 0-2 .36l-.06.06-2.1-2.1.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.1H5v-3h.11A1.8 1.8 0 0 0 6.8 9.75a1.8 1.8 0 0 0-.36-2l-.06-.06 2.1-2.1.06.06a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.1-1.65V4.25h3v.11a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.06-.06 2.1 2.1-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.65 1.1h.11v3h-.11A1.8 1.8 0 0 0 19.4 15Z" /></>,
    governance: <><path d="M12 3 4 6v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    folder: <><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></>,
    chart: <><path d="M4 20V10m6 10V4m6 16v-7m4 7V8" /></>,
    alert: <><path d="M12 3 2.5 20h19Z" /><path d="M12 9v4m0 3h.01" /></>,
    file: <><path d="M6 3h9l3 3v15H6zM9 12h6M9 16h6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    shield: <><path d="M12 3 4 6v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6Z" /><path d="M12 8v5m0 3h.01" /></>,
    document: <><path d="M6 3h9l3 3v15H6zM9 11h6M9 15h6M9 7h3" /></>,
    report: <><path d="M5 20V4h14v16Z" /><path d="M8 16v-3m4 3V8m4 8v-5" /></>,
  };
  return <svg aria-hidden="true" className="alos-icon" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">{paths[name]}</svg>;
}

export function LiveJakartaClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <time className="alos-date" dateTime={now?.toISOString()}>
      <strong>{now ? formatJakartaDate(now) : "Waktu Indonesia Barat"}</strong>
      <span>{now ? formatJakartaTime(now) : "--.-- WIB"}</span>
    </time>
  );
}

export function formatJakartaDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
  }).format(value);
}

export function formatJakartaTime(value: Date) {
  const clock = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(value);
  return `${clock.replace(":", ".")} WIB`;
}

export function roleInitial(roleLabel: string) {
  return roleLabel.replace(/[^A-Z]/g, "").slice(0, 2) || "A";
}
