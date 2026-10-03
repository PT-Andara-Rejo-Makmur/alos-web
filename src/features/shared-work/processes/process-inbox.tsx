"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState, PageHeader, Section, Status } from "@/components/ui";
import type { BusinessWorkQueue } from "@/lib/contracts";
import { statusLabel, roleLabel } from "@/lib/presentation";
import { processTypeLabel, processTitle } from "./process-presentation";
import styles from "@/components/ui/work-surface.module.css";

const filters = ["Semua", "Perlu Diperiksa", "Perlu Keputusan", "Perlu Diperbaiki", "Untuk Diketahui", "Terlambat"] as const;

export function ProcessInbox({ queue, workspaceKey }: Readonly<{ queue: BusinessWorkQueue; workspaceKey: string }>) {
  const [filter, setFilter] = useState<string>("Semua");
  const [search, setSearch] = useState("");
  const [now] = useState(() => Date.now());
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const rows = [
    ...queue.processes.map(item => { const step = item.steps.find(value => value.can_act); return {
      key: `process-${item.process_id}`, title: processTitle(item), category: processTypeLabel(item.business_type),
      status: item.status === "RETURNED" ? "Perlu Diperbaiki" : step ? statusLabel(step.kind) : statusLabel(item.status),
      context: item.responsible_workspace_name ?? "Penanggung jawab pengajuan", description: item.next_action ?? "Ikuti perkembangan pengajuan.",
      due: item.due_at, href: `${base}/processes/${encodeURIComponent(item.process_id)}`, action: step ? step.kind === "DECISION" ? "Tinjau Keputusan" : "Periksa" : item.can_resubmit ? "Perbaiki" : "Lihat Pengajuan",
      role: step ? roleLabel(step.role) : null,
    }; }),
    ...queue.tasks.map(item => ({ key: `task-${item.task_id}`, title: item.title, category: "Tugas", status: statusLabel(item.status), context: item.owner_name ?? "Belum ditugaskan", description: item.description ?? "Tindak lanjuti tugas Anda.", due: item.due_at, href: `${base}/tasks/${encodeURIComponent(item.task_id)}`, action: "Buka Tugas", role: null })),
    ...queue.approvals.map(item => ({ key: `approval-${item.approval_id}`, title: item.subject_title ?? item.reason ?? "Pengajuan keputusan", category: "Persetujuan", status: item.status === "RETURNED" ? "Perlu Diperbaiki" : ["HELD","HOLD"].includes(item.status) ? "Ditahan" : "Perlu Keputusan", context: "Pengajuan dalam ruang kerja Anda", description: "Periksa data dan bukti sebelum mengambil keputusan.", due: null, href: `${base}/approvals/${encodeURIComponent(item.approval_id)}`, action: "Lihat Pengajuan", role: null })),
    ...queue.findings.map(item => ({ key: `finding-${item.finding_id}`, title: item.title, category: "Temuan", status: statusLabel(item.status), context: item.owner_name ?? "Belum ditugaskan", description: item.description ?? "Periksa masalah dan tindakan korektif.", due: item.due_date, href: `${base}/findings/${encodeURIComponent(item.finding_id)}`, action: "Buka Temuan", role: null })),
  ];
  const visible = rows.filter(row => (filter === "Semua" || (filter === "Terlambat" ? !!row.due && Date.parse(row.due) < now : row.status === filter || (filter === "Perlu Diperiksa" && row.status === "Sedang Diperiksa"))) && `${row.title} ${row.category} ${row.context}`.toLocaleLowerCase("id-ID").includes(search.toLocaleLowerCase("id-ID")));
  return <div className={styles.stack}>
    <PageHeader title="Perlu Tindakan" description="Periksa pengajuan dan tindak lanjut yang tersedia dalam ruang kerja Anda." />
    <div className={styles.filters}><strong>{rows.length} item</strong><input className="alos-form-control" type="search" aria-label="Cari pekerjaan" placeholder="Cari pengajuan atau pekerjaan…" value={search} onChange={event => setSearch(event.target.value)} /></div>
    <div className={styles.filters} role="group" aria-label="Filter pekerjaan">{filters.map(label => <button type="button" className={styles.filter} aria-pressed={filter === label} key={label} onClick={() => setFilter(label)}>{label}</button>)}</div>
    {visible.length ? <ul className={styles.workList}>{visible.map(row => <li className={styles.workRow} key={row.key}><div><small>{row.category}</small><h3>{row.title}</h3><Status label={row.status} variant={row.status === "Perlu Diperbaiki" ? "warning" : "info"} /><p>{row.context}{row.role ? ` · ${row.role}` : ""}</p><p>{row.description}</p>{row.due ? <small>Tenggat {new Date(row.due).toLocaleDateString("id-ID")}{Date.parse(row.due) < now ? " · Terlambat" : ""}</small> : null}</div><Link href={row.href}>{row.action} →</Link></li>)}</ul> : <EmptyState title={rows.length ? "Tidak ada pekerjaan yang sesuai filter" : "Belum ada pekerjaan yang perlu ditangani"} description={rows.length ? "Coba pilih filter lain atau ubah pencarian." : "Pengajuan dan tindak lanjut baru akan muncul di sini saat ditugaskan kepada Anda."} />}
    {queue.notifications.length ? <Section title="Untuk Diketahui"><ul className={styles.workList}>{queue.notifications.map(item => <li className={styles.workRow} key={item.notification_id}><div><h3>{item.title}</h3><small>{new Date(item.created_at).toLocaleString("id-ID")}</small></div>{item.event !== "ESCALATED" ? <Link href={`${base}/processes/${encodeURIComponent(item.process_id)}`}>Lihat</Link> : null}</li>)}</ul></Section> : null}
  </div>;
}
