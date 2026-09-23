"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { dashboardModules, type DashboardModuleKey } from "@/features/workspace-routing/dashboard-modules";
import type { SessionActor } from "@/features/session";
import {
  formatOperationalDate,
  humanStatus,
  type Approval,
  type Finding,
  type OperationalDashboard,
  type OperationalTask,
  type ProposedAction,
  type Report,
  type ReportDefinition,
  type TaskStatus,
} from "@/features/operations/types";

import type { ActiveWorkspaceContext } from "@/features/workspace-routing";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell";

type OperationalModule = Extract<DashboardModuleKey, "tasks" | "approvals" | "findings" | "reports">;

export function OperationalModuleDashboard({
  actor,
  module,
  activeWorkspace,
}: {
  actor: SessionActor;
  module: OperationalModule;
  activeWorkspace: ActiveWorkspaceContext | WorkspaceShellIdentity;
}) {
  const [dashboard, setDashboard] = useState<OperationalDashboard | null>(null);
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [proposedActions, setProposedActions] = useState<ProposedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextDashboard, nextDefinitions, nextActions] = await Promise.all([
        authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational"),
        module === "reports"
          ? authenticatedApiRequest<ReportDefinition[]>("/api/v1/report-definitions")
          : Promise.resolve([]),
        module === "approvals"
          ? authenticatedApiRequest<ProposedAction[]>("/api/v1/proposed-actions")
          : Promise.resolve([]),
      ]);
      setDashboard(nextDashboard);
      setDefinitions(nextDefinitions);
      setProposedActions(nextActions);
    } catch (failure) {
      setError(apiMessage(failure));
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const page = dashboardModules[module];
  const mutation = async (work: () => Promise<unknown>, success: string) => {
    setError("");
    setNotice("");
    try {
      await work();
      setNotice(success);
      await load();
    } catch (failure) {
      setError(apiMessage(failure));
    }
  };

  if (loading && !dashboard) {
    return <section className="alos-content"><div className="alos-operation-state">Memuat data operasional sesuai scope Anda…</div></section>;
  }

  return (
    <section className="alos-content alos-operational-content" aria-label={`${page.title} ALOS`}>
      <div className="alos-section-heading">
        <div><p className="alos-kicker">ALOS / {module.toUpperCase()}</p><h2>{page.title}</h2></div>
        <span>{dashboard ? `Scope: ${humanStatus(dashboard.scope)}` : "Data tidak tersedia"}</span>
      </div>
      {error ? <div className="alos-operation-banner error" role="alert">{error}</div> : null}
      {notice ? <div className="alos-operation-banner success" role="status">{notice}</div> : null}
      <OperationalMetrics dashboard={dashboard} definitions={definitions} module={module} />
      <div className="alos-operation-toolbar">
        <label><span className="sr-only">Filter</span><input onChange={(event) => setFilter(event.target.value)} placeholder={page.searchPlaceholder} type="search" value={filter} /></label>
        <button className="alos-outline-button" disabled={loading} onClick={() => void load()} type="button">{loading ? "Memuat…" : "Muat ulang"}</button>
      </div>
      {module === "tasks" ? <TasksWorkspace activeWorkspace={activeWorkspace} filter={filter} mutate={mutation} tasks={dashboard?.tasks ?? []} /> : null}
      {module === "approvals" ? <ApprovalsWorkspace actions={proposedActions} approvals={dashboard?.approvals ?? []} filter={filter} mutate={mutation} /> : null}
      {module === "findings" ? <FindingsWorkspace activeWorkspace={activeWorkspace} filter={filter} findings={dashboard?.findings ?? []} mutate={mutation} /> : null}
      {module === "reports" ? <ReportsWorkspace activeWorkspace={activeWorkspace} actor={actor} definitions={definitions} filter={filter} mutate={mutation} reports={dashboard?.reports ?? []} /> : null}
    </section>
  );
}

function OperationalMetrics({ dashboard, definitions, module }: { dashboard: OperationalDashboard | null; definitions: ReportDefinition[]; module: OperationalModule }) {
  const source = dashboard?.metrics ?? {};
  const values: Record<OperationalModule, Array<[string, number]>> = {
    tasks: [["Total tugas", source.tasks ?? 0], ["Overdue", source.overdue_tasks ?? 0], ["Tampil saat ini", dashboard?.tasks.length ?? 0]],
    approvals: [["Pending", source.pending_approvals ?? 0], ["Tampil saat ini", dashboard?.approvals.length ?? 0], ["Urgent", dashboard?.approvals.filter((item) => item.status === "PENDING" && item.urgency === "URGENT").length ?? 0]],
    findings: [["Terbuka", source.open_findings ?? 0], ["Kritis", dashboard?.findings.filter((item) => item.status !== "RESOLVED" && item.severity === "CRITICAL").length ?? 0], ["Tampil saat ini", dashboard?.findings.length ?? 0]],
    reports: [["Laporan", source.reports ?? 0], ["Definisi", definitions.length], ["Terjadwal", definitions.filter((item) => item.schedule_expression !== null).length]],
  };
  return <div className="alos-operation-metrics">{values[module].map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>;
}

type Mutation = (work: () => Promise<unknown>, success: string) => Promise<void>;

function TasksWorkspace({
  filter,
  mutate,
  tasks,
  activeWorkspace,
}: {
  filter: string;
  mutate: Mutation;
  tasks: OperationalTask[];
  activeWorkspace: ActiveWorkspaceContext | WorkspaceShellIdentity;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const workspaceId = activeWorkspace.workspaceId;
  const divisionCode = activeWorkspace.divisionCode ?? "";
  const visible = useMemo(() => matchRows(tasks, filter, (item) => `${item.title} ${item.description} ${item.project_name ?? ""} ${item.status}`), [filter, tasks]);
  const columns: Array<{ label: string; statuses: TaskStatus[] }> = [
    { label: "To do", statuses: ["DRAFT", "TODO"] },
    { label: "In progress", statuses: ["IN_PROGRESS"] },
    { label: "In review", statuses: ["IN_REVIEW"] },
    { label: "Selesai", statuses: ["DONE", "CANCELLED"] },
  ];
  return <>
    <div className="alos-operation-heading"><div><p className="alos-kicker">TUGAS TERDAFTAR</p><h3>Task Board</h3></div><button className="alos-workspace-primary" disabled={!workspaceId || !divisionCode} onClick={() => setShowCreate((value) => !value)} type="button">{showCreate ? "Tutup" : "+ Buat tugas"}</button></div>
    {showCreate ? <TaskCreateForm divisionCode={divisionCode} mutate={mutate} onDone={() => setShowCreate(false)} workspaceId={workspaceId} /> : null}
    <div className="alos-live-kanban">{columns.map((column) => <section key={column.label}><header><strong>{column.label}</strong><span>{visible.filter((item) => column.statuses.includes(item.status)).length}</span></header><div>{visible.filter((item) => column.statuses.includes(item.status)).map((task) => <TaskCard key={task.task_id} mutate={mutate} task={task} />)}{visible.every((item) => !column.statuses.includes(item.status)) ? <OperationEmpty text="Belum ada tugas pada tahap ini." /> : null}</div></section>)}</div>
  </>;
}

function TaskCreateForm({ divisionCode, mutate, onDone, workspaceId }: { divisionCode: string; mutate: Mutation; onDone: () => void; workspaceId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    await mutate(
      () => authenticatedApiRequest("/api/v1/tasks", { method: "POST", body: JSON.stringify({ workspace_id: workspaceId, division_code: divisionCode, title, description, priority, due_date: dueDate || null, evidence_required: false, idempotency_key: crypto.randomUUID() }) }),
      "Tugas berhasil dibuat dan dicatat pada audit trail.",
    );
    onDone();
  }
  return <form className="alos-operation-form" onSubmit={(event) => void submit(event)}><label>Judul<input minLength={2} onChange={(event) => setTitle(event.target.value)} required value={title} /></label><label>Prioritas<select onChange={(event) => setPriority(event.target.value)} value={priority}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label><label>Tenggat<input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></label><label className="wide">Deskripsi<textarea maxLength={10000} onChange={(event) => setDescription(event.target.value)} value={description} /></label><button className="alos-workspace-primary" type="submit">Simpan tugas</button></form>;
}

function TaskCard({ mutate, task }: { mutate: Mutation; task: OperationalTask }) {
  const next: Partial<Record<TaskStatus, TaskStatus>> = { DRAFT: "TODO", TODO: "IN_PROGRESS", IN_PROGRESS: "IN_REVIEW", IN_REVIEW: "DONE" };
  return <article className="alos-operation-card"><div><span className={`alos-live-status ${task.priority.toLowerCase()}`}>{task.priority}</span><small>{formatOperationalDate(task.due_date)}</small></div><strong>{task.title}</strong><p>{task.description || "Tanpa deskripsi."}</p><div className="alos-approval-actions">{next[task.status] ? <button onClick={() => void mutate(() => authenticatedApiRequest(`/api/v1/tasks/${task.task_id}/status`, { method: "PATCH", body: JSON.stringify({ status: next[task.status] }) }), `Status tugas diubah menjadi ${humanStatus(next[task.status] ?? "")}.`)} type="button">Lanjut ke {humanStatus(next[task.status] ?? "")}</button> : <span className="alos-operation-done">{humanStatus(task.status)}</span>}<DeleteButton label={`tugas “${task.title}”`} mutate={mutate} path={`/api/v1/tasks/${task.task_id}`} /></div></article>;
}

function ApprovalsWorkspace({ actions, approvals, filter, mutate }: { actions: ProposedAction[]; approvals: Approval[]; filter: string; mutate: Mutation }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const visible = useMemo(() => matchRows(approvals, filter, (item) => `${item.title} ${item.description} ${item.approval_kind} ${item.status}`), [approvals, filter]);
  const decide = (approval: Approval, decision: "APPROVED" | "REJECTED") => {
    const decisionNotes = notes[approval.approval_request_id]?.trim();
    if (!decisionNotes) return;
    if (!window.confirm(`${decision === "APPROVED" ? "Setujui" : "Tolak"} permintaan “${approval.title}”? Keputusan ini akan diaudit.`)) return;
    void mutate(
      () => authenticatedApiRequest(`/api/v1/approvals/${approval.approval_request_id}/decision`, { method: "POST", body: JSON.stringify({ decision, payload_digest: approval.payload_digest, notes: decisionNotes }) }),
      `Approval telah ${decision === "APPROVED" ? "disetujui" : "ditolak"}.`,
    );
  };
  return <><OperationTable title="Daftar approval"><table><thead><tr><th>Permintaan</th><th>Jenis</th><th>Urgensi</th><th>Status</th><th>Keputusan</th></tr></thead><tbody>{visible.map((item) => <tr key={item.approval_request_id}><td><strong>{item.title}</strong><small>{item.description || item.subject_type}</small></td><td>{humanStatus(item.approval_kind)}</td><td><span className={`alos-live-status ${item.urgency.toLowerCase()}`}>{item.urgency}</span></td><td>{humanStatus(item.status)}</td><td>{item.status === "PENDING" ? <div className="alos-approval-actions"><input aria-label={`Catatan keputusan ${item.title}`} onChange={(event) => setNotes((current) => ({ ...current, [item.approval_request_id]: event.target.value }))} placeholder="Catatan wajib" value={notes[item.approval_request_id] ?? ""} /><button disabled={!notes[item.approval_request_id]?.trim()} onClick={() => decide(item, "APPROVED")} type="button">Setujui</button><button className="danger" disabled={!notes[item.approval_request_id]?.trim()} onClick={() => decide(item, "REJECTED")} type="button">Tolak</button></div> : <small>{item.decision_notes ?? "Keputusan tercatat"}</small>}</td></tr>)}</tbody></table>{visible.length === 0 ? <OperationEmpty text="Tidak ada approval dalam scope atau filter ini." /> : null}</OperationTable><OperationTable title="Eksekusi aksi yang disetujui"><table><thead><tr><th>Aksi</th><th>Risiko</th><th>Status</th><th>Payload digest</th><th>Eksekusi</th></tr></thead><tbody>{actions.map((item) => <tr key={item.proposed_action_id}><td><strong>{humanStatus(item.action_type)}</strong><small>{String(item.payload.title ?? item.proposed_action_id)}</small></td><td>{item.risk_level}</td><td>{humanStatus(item.status)}</td><td><code>{item.payload_digest.slice(0, 16)}…</code></td><td>{item.status === "APPROVED" ? <button onClick={() => { if (window.confirm("Jalankan aksi yang telah disetujui tepat satu kali?")) void mutate(() => authenticatedApiRequest(`/api/v1/proposed-actions/${item.proposed_action_id}/execute`, { method: "POST", body: JSON.stringify({ payload_digest: item.payload_digest }) }), "Aksi yang disetujui berhasil dijalankan tepat satu kali."); }} type="button">Eksekusi</button> : item.executed_entity_id ? <small>{item.executed_entity_type}: {item.executed_entity_id}</small> : <small>Menunggu approval</small>}</td></tr>)}</tbody></table>{actions.length === 0 ? <OperationEmpty text="Belum ada aksi material yang diajukan." /> : null}</OperationTable></>;
}

function FindingsWorkspace({
  filter,
  findings,
  mutate,
  activeWorkspace,
}: {
  filter: string;
  findings: Finding[];
  mutate: Mutation;
  activeWorkspace: ActiveWorkspaceContext | WorkspaceShellIdentity;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const workspaceId = activeWorkspace.workspaceId;
  const divisionCode = activeWorkspace.divisionCode ?? "";
  const visible = useMemo(() => matchRows(findings, filter, (item) => `${item.title} ${item.description} ${item.severity} ${item.status}`), [filter, findings]);
  return <>
    <div className="alos-operation-heading"><div><p className="alos-kicker">MONITORING</p><h3>Temuan dan risiko</h3></div><button className="alos-workspace-primary" disabled={!workspaceId} onClick={() => setShowCreate((value) => !value)} type="button">{showCreate ? "Tutup" : "+ Catat temuan"}</button></div>
    {showCreate ? <FindingCreateForm divisionCode={divisionCode} mutate={mutate} onDone={() => setShowCreate(false)} workspaceId={workspaceId} /> : null}
    <OperationTable title="Daftar temuan"><table><thead><tr><th>Temuan</th><th>Sumber</th><th>Severitas</th><th>Status</th><th>Tindak lanjut</th></tr></thead><tbody>{visible.map((item) => <tr key={item.finding_id}><td><strong>{item.title}</strong><small>{item.description}</small></td><td>{humanStatus(item.source_kind)}</td><td><span className={`alos-live-status ${item.severity.toLowerCase()}`}>{item.severity}</span></td><td>{humanStatus(item.status)}</td><td><div className="alos-approval-actions">{item.status === "OPEN" ? <button onClick={() => void mutate(() => authenticatedApiRequest(`/api/v1/findings/${item.finding_id}/status`, { method: "PATCH", body: JSON.stringify({ status: "ACKNOWLEDGED" }) }), "Temuan telah diakui dan siap ditindaklanjuti.")} type="button">Akui</button> : item.status !== "RESOLVED" && item.status !== "DISMISSED" ? <button onClick={() => void mutate(() => authenticatedApiRequest(`/api/v1/findings/${item.finding_id}/status`, { method: "PATCH", body: JSON.stringify({ status: "RESOLVED", resolution: "Resolved through the ALOS findings workspace." }) }), "Temuan ditandai selesai.")} type="button">Selesaikan</button> : <small>{item.resolution ?? "Ditutup"}</small>}<DeleteButton label={`temuan “${item.title}”`} mutate={mutate} path={`/api/v1/findings/${item.finding_id}`} /></div></td></tr>)}</tbody></table>{visible.length === 0 ? <OperationEmpty text="Tidak ada temuan dalam scope atau filter ini." /> : null}</OperationTable>
  </>;
}

function FindingCreateForm({ divisionCode, mutate, onDone, workspaceId }: { divisionCode: string; mutate: Mutation; onDone: () => void; workspaceId: string }) {
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [severity, setSeverity] = useState("MEDIUM");
  async function submit(event: FormEvent) {
    event.preventDefault();
    await mutate(() => authenticatedApiRequest("/api/v1/findings", {
      method: "POST",
      body: JSON.stringify({
        workspace_id: workspaceId,
        division_code: divisionCode || null,
        source_kind: "GENESIS",
        title,
        description,
        severity,
        recommendation: "",
      }),
    }), "Temuan berhasil dicatat.");
    onDone();
  }
  return <form className="alos-operation-form" onSubmit={(event) => void submit(event)}><label>Judul<input minLength={2} onChange={(event) => setTitle(event.target.value)} required value={title} /></label><label>Severitas<select onChange={(event) => setSeverity(event.target.value)} value={severity}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label><label className="wide">Deskripsi<textarea minLength={2} onChange={(event) => setDescription(event.target.value)} required value={description} /></label><button className="alos-workspace-primary" type="submit">Simpan temuan</button></form>;
}

function ReportsWorkspace({
  actor,
  definitions,
  filter,
  mutate,
  reports,
  activeWorkspace,
}: {
  actor: SessionActor;
  definitions: ReportDefinition[];
  filter: string;
  mutate: Mutation;
  reports: Report[];
  activeWorkspace: ActiveWorkspaceContext | WorkspaceShellIdentity;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const workspaceId = activeWorkspace.workspaceId;
  const divisionCode = activeWorkspace.divisionCode ?? "";
  const visibleDefinitions = useMemo(() => matchRows(definitions, filter, (item) => `${item.name} ${item.period} ${item.scope}`), [definitions, filter]);
  const visibleReports = useMemo(() => matchRows(reports, filter, (item) => `${item.report_id} ${item.status}`), [filter, reports]);
  return <>
    <div className="alos-operation-heading"><div><p className="alos-kicker">DEFINISI TERKENDALI</p><h3>Definisi dan jadwal laporan</h3></div><button className="alos-workspace-primary" disabled={!workspaceId} onClick={() => setShowCreate((value) => !value)} type="button">{showCreate ? "Tutup" : "+ Definisi laporan"}</button></div>
    {showCreate ? <ReportCreateForm actor={actor} divisionCode={divisionCode} mutate={mutate} onDone={() => setShowCreate(false)} workspaceId={workspaceId} /> : null}
    <div className="alos-report-definitions">{visibleDefinitions.map((definition) => <article className="alos-operation-card" key={definition.report_definition_id}><div><span className="alos-live-status info">{definition.period}</span><small>{definition.schedule_expression ?? "On demand"}</small></div><strong>{definition.name}</strong><p>{humanStatus(definition.scope)} · {definition.review_required ? "Perlu review" : "Tanpa review"}</p><div className="alos-approval-actions"><button onClick={() => void mutate(() => authenticatedApiRequest(`/api/v1/report-definitions/${definition.report_definition_id}/generate`, { method: "POST", body: JSON.stringify({ idempotency_key: crypto.randomUUID() }) }), "Laporan DRAFT berhasil dihasilkan dengan provenance.")} type="button">Generate sekarang</button><DeleteButton label={`definisi laporan “${definition.name}” beserta laporannya`} mutate={mutate} path={`/api/v1/report-definitions/${definition.report_definition_id}`} /></div><ReportScheduleControl definition={definition} mutate={mutate} /></article>)}{visibleDefinitions.length === 0 ? <OperationEmpty text="Belum ada definisi laporan dalam scope ini." /> : null}</div>
    <OperationTable title="Laporan terbaru"><table><thead><tr><th>ID laporan</th><th>Status</th><th>Dibuat</th><th>Provenance</th><th>Aksi</th></tr></thead><tbody>{visibleReports.map((item) => <tr key={item.report_id}><td><code>{item.report_id}</code></td><td>{humanStatus(item.status)}</td><td>{formatOperationalDate(item.created_at)}</td><td>{item.provenance.length} sumber</td><td><DeleteButton label="laporan ini" mutate={mutate} path={`/api/v1/reports/${item.report_id}`} /></td></tr>)}</tbody></table>{visibleReports.length === 0 ? <OperationEmpty text="Belum ada laporan yang dihasilkan." /> : null}</OperationTable>
  </>;
}

function DeleteButton({ label, mutate, path }: { label: string; mutate: Mutation; path: string }) {
  return <button className="danger" onClick={() => {
    if (!window.confirm(`Hapus ${label} secara permanen? Data akan langsung hilang dari dashboard.`)) return;
    void mutate(() => authenticatedApiRequest(path, { method: "DELETE" }), `${label} telah dihapus.`);
  }} type="button">Hapus</button>;
}

function ReportScheduleControl({ definition, mutate }: { definition: ReportDefinition; mutate: Mutation }) {
  const [expression, setExpression] = useState(definition.schedule_expression ?? "DAILY 17:00");
  const [timezone, setTimezone] = useState(definition.timezone ?? "Asia/Jakarta");
  return <div className="alos-report-schedule"><input aria-label={`Jadwal ${definition.name}`} onChange={(event) => setExpression(event.target.value)} placeholder="DAILY 17:00" value={expression} /><select aria-label={`Zona waktu ${definition.name}`} onChange={(event) => setTimezone(event.target.value)} value={timezone}><option>Asia/Jakarta</option><option>Asia/Makassar</option><option>Asia/Jayapura</option></select><button onClick={() => { if (window.confirm(`Aktifkan ${definition.name} dengan jadwal ${expression} (${timezone})?`)) void mutate(() => authenticatedApiRequest(`/api/v1/report-definitions/${definition.report_definition_id}/schedule`, { method: "PUT", body: JSON.stringify({ schedule_expression: expression, timezone, confirm: true }) }), "Jadwal durable aktif dan akan diproses scheduler/worker."); }} type="button">Aktifkan jadwal</button></div>;
}

function ReportCreateForm({ actor, divisionCode, mutate, onDone, workspaceId }: { actor: SessionActor; divisionCode: string; mutate: Mutation; onDone: () => void; workspaceId: string }) {
  const [name, setName] = useState(""); const [period, setPeriod] = useState("WEEKLY"); const [scope, setScope] = useState(actor.roles.includes("DIRECTOR") ? "COMPANY" : "DIVISION");
  async function submit(event: FormEvent) {
    event.preventDefault();
    await mutate(() => authenticatedApiRequest("/api/v1/report-definitions", {
      method: "POST",
      body: JSON.stringify({
        workspace_id: workspaceId,
        division_code: scope === "COMPANY" ? null : divisionCode || null,
        name,
        template_key: "EXECUTIVE_SUMMARY",
        scope,
        period,
        sections: ["summary", "tasks", "findings"],
        data_sources: ["tasks", "findings", "approvals"],
        review_required: true,
        recipient_user_ids: [],
      }),
    }), "Definisi laporan DRAFT berhasil dibuat.");
    onDone();
  }
  return <form className="alos-operation-form" onSubmit={(event) => void submit(event)}><label>Nama<input minLength={2} onChange={(event) => setName(event.target.value)} required value={name} /></label><label>Periode<select onChange={(event) => setPeriod(event.target.value)} value={period}><option>DAILY</option><option>WEEKLY</option><option>MONTHLY</option><option>ON_DEMAND</option></select></label><label>Scope<select onChange={(event) => setScope(event.target.value)} value={scope}>{actor.roles.includes("DIRECTOR") ? <option>COMPANY</option> : null}<option>DIVISION</option><option>OWN_ASSIGNED</option></select></label><button className="alos-workspace-primary" type="submit">Simpan DRAFT</button></form>;
}

function OperationTable({ children, title }: { children: React.ReactNode; title: string }) {
  return <article className="alos-panel alos-live-table"><div className="alos-panel-title"><p className="alos-kicker">DATA TERDAFTAR</p><h3>{title}</h3></div><div className="alos-live-table-scroll">{children}</div></article>;
}

function OperationEmpty({ text }: { text: string }) { return <div className="alos-operation-empty"><span>○</span><p>{text}</p></div>; }

function matchRows<T>(items: T[], filter: string, value: (item: T) => string): T[] {
  const query = filter.trim().toLocaleLowerCase("id-ID");
  return query ? items.filter((item) => value(item).toLocaleLowerCase("id-ID").includes(query)) : items;
}
