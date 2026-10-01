"use client";

import Link from "next/link";

import { DataTable, EmptyState, Section } from "@/components/ui";
import type { ExecutiveConnectionStatus, ExecutiveSharedWorkSummary } from "@/lib/contracts";
import { ApprovalStatusBadge } from "@/features/shared-work/approvals/approval-status";
import { FindingSeverityBadge, FindingStatusBadge } from "@/features/shared-work/findings/finding-status";
import { ProjectStatusBadge } from "@/features/shared-work/shared/status/project-status";
import { TaskPriorityBadge, TaskStatusBadge } from "@/features/shared-work/tasks/task-status";
import { ReportStatusBadge } from "@/features/shared-work/reports/report-status";
import { DocumentStatusBadge } from "@/features/shared-work/documents/document-status";

import { ExecutiveSourceState, sourceDate } from "./executive-source-status";
import styles from "./executive.module.css";

export function ExecutiveWorkSections({ base, status, data }: Readonly<{
  base: string;
  status: ExecutiveConnectionStatus | "loading";
  data: ExecutiveSharedWorkSummary | null;
}>) {
  if (!data) return <Section title="Shared Work"><ExecutiveSourceState status={status} /></Section>;
  const counts = data.counts;
  const link = (resource: string, id: string) => <Link className={styles.detailLink} href={`${base}/${resource}/${encodeURIComponent(id)}`}>Lihat Detail</Link>;
  const empty = <EmptyState title="Belum ada data." description="Tidak ada entitas dalam visibility ruang kerja aktif." />;

  return <>
    <Section title="Shared Work" description={`Data authoritative dalam visibility ruang kerja aktif · Waktu sumber ${sourceDate(data.last_updated_at)} · Pratinjau hingga 50 entitas per bagian.`}>
      <ExecutiveSourceState status={status} />
      <p>{counts.active_projects} proyek aktif · {counts.on_hold_projects} ditahan · {counts.completed_projects} selesai</p>
      <p>{counts.overdue_tasks} tugas lewat tenggat · {counts.blocked_tasks} terhambat · {counts.critical_tasks} kritis · {counts.pending_review_tasks} menunggu peninjauan</p>
      <p>{counts.pending_approvals} persetujuan menunggu · {counts.active_findings} temuan aktif · {counts.critical_findings} kritis · {counts.high_findings} tinggi · {counts.pending_verification_findings} menunggu verifikasi</p>
    </Section>
    <div className={styles.twoColumn}>
      <Section title="Peringatan & Temuan" actions={<Link className={styles.detailLink} href={`${base}/findings`}>Lihat Semua Temuan</Link>}>
        <DataTable caption="Temuan Shared Work" columns={[
          { key: "title", header: "Temuan", render: (row) => row.title },
          { key: "severity", header: "Tingkat Temuan", render: (row) => <FindingSeverityBadge severity={row.severity} /> },
          { key: "status", header: "Status", render: (row) => <FindingStatusBadge status={row.status} /> },
          { key: "owner", header: "Penanggung Jawab", render: (row) => row.owner_name ?? row.owner_actor_id ?? "—" },
          { key: "project", header: "Proyek terkait", render: (row) => row.project_id ? link("projects", row.project_id) : "—" },
          { key: "updated", header: "Update", render: (row) => sourceDate(row.updated_at) },
        ]} rows={data.findings} getRowKey={(row) => row.finding_id} rowAction={(row) => link("findings", row.finding_id)} emptyState={empty} />
      </Section>
      <Section title="Persetujuan Shared Work" actions={<Link className={styles.detailLink} href={`${base}/approvals`}>Lihat Semua Persetujuan</Link>}>
        <DataTable caption="Persetujuan Shared Work" columns={[
          { key: "subject", header: "Subjek", render: (row) => row.subject_title ?? row.reason ?? row.subject_id },
          { key: "status", header: "Status", render: (row) => <ApprovalStatusBadge status={row.status} /> },
          { key: "updated", header: "Update", render: (row) => sourceDate(row.decided_at ?? row.requested_at) },
        ]} rows={data.approvals} getRowKey={(row) => row.approval_id} rowAction={(row) => link("approvals", row.approval_id)} emptyState={empty} />
      </Section>
    </div>
    <Section title="Proyek Relevan" actions={<Link className={styles.detailLink} href={`${base}/projects`}>Lihat Semua Proyek</Link>}>
      <DataTable caption="Proyek Shared Work" columns={[
        { key: "name", header: "Proyek", render: (row) => row.name },
        { key: "status", header: "Status", render: (row) => <ProjectStatusBadge status={row.status} /> },
        { key: "owner", header: "Penanggung Jawab", render: (row) => row.owner_name ?? row.owner_actor_id ?? "—" },
        { key: "updated", header: "Update", render: (row) => sourceDate(row.updated_at) },
      ]} rows={data.projects} getRowKey={(row) => row.project_id} rowAction={(row) => link("projects", row.project_id)} emptyState={empty} />
    </Section>
    <Section title="Tugas Relevan" actions={<Link className={styles.detailLink} href={`${base}/tasks`}>Lihat Semua Tugas</Link>}>
      <DataTable caption="Tugas Shared Work" columns={[
        { key: "title", header: "Tugas", render: (row) => row.title },
        { key: "status", header: "Status", render: (row) => <TaskStatusBadge status={row.status} /> },
        { key: "priority", header: "Prioritas", render: (row) => <TaskPriorityBadge priority={row.priority} /> },
        { key: "due", header: "Tenggat", render: (row) => sourceDate(row.due_at) },
        { key: "updated", header: "Update", render: (row) => sourceDate(row.updated_at) },
      ]} rows={data.tasks} getRowKey={(row) => row.task_id} rowAction={(row) => link("tasks", row.task_id)} emptyState={empty} />
    </Section>
    <Section title="Laporan Relevan" actions={<Link className={styles.detailLink} href={`${base}/reports`}>Lihat Semua Laporan</Link>}>
      <DataTable caption="Laporan Shared Work" columns={[
        { key: "title", header: "Laporan", render: (row) => row.title },
        { key: "status", header: "Status", render: (row) => <ReportStatusBadge status={row.status} /> },
        { key: "updated", header: "Update", render: (row) => sourceDate(row.updated_at) },
      ]} rows={data.reports} getRowKey={(row) => row.report_id} rowAction={(row) => link("reports", row.report_id)} emptyState={empty} />
    </Section>
    <Section title="Dokumen Relevan" actions={<Link className={styles.detailLink} href={`${base}/documents`}>Lihat Semua Dokumen</Link>}>
      <DataTable caption="Dokumen Shared Work" columns={[
        { key: "title", header: "Dokumen", render: (row) => row.title },
        { key: "status", header: "Status", render: (row) => <DocumentStatusBadge status={row.status} /> },
        { key: "updated", header: "Update", render: (row) => sourceDate(row.updated_at) },
      ]} rows={data.documents} getRowKey={(row) => row.document_id} rowAction={(row) => link("documents", row.document_id)} emptyState={empty} />
    </Section>
  </>;
}
