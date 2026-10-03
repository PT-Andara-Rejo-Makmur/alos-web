"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, LoadingState, Metric, Section, EmptyState } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { BusinessWorkQueue } from "@/lib/contracts";
import { authenticatedApiRequest, apiMessage } from "@/lib/api";
import { isBusinessWorkQueue } from "@/lib/business-projection";
import { roleLabel, statusLabel } from "@/lib/presentation";
import { processTitle } from "@/features/shared-work/processes/process-presentation";
import styles from "@/components/ui/work-surface.module.css";

export function RoleWorkSummary({ session }: Readonly<{ session: SessionProjection }>) {
  const principal = session.principal && "actor" in session.principal ? session.principal : null;
  const active = principal?.active_workspace;
  const key = active?.workspace.workspace_key;
  const [queue, setQueue] = useState<BusinessWorkQueue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    void authenticatedApiRequest<unknown>("/api/v1/business/work-queue", { signal: controller.signal })
      .then(value => {
        if (controller.signal.aborted) return;
        if (!isBusinessWorkQueue(value)) throw new Error("Sumber pekerjaan belum memberikan data yang sesuai.");
        setQueue(value);
      })
      .catch(caught => { if (!controller.signal.aborted) setError(apiMessage(caught)); });
    return () => controller.abort();
  }, [key]);
  if (!key) return null;
  const base = `/workspace/${encodeURIComponent(key)}`;
  const lead = active?.role_refs.some(role => role === "DIVISION_LEAD" || role === "IT_ADMIN");
  const reviews = queue?.processes.filter(item => item.steps.some(step => step.can_act && step.kind === "REVIEW")) ?? [];
  const decisions = queue?.processes.filter(item => item.steps.some(step => step.can_act && step.kind === "DECISION")) ?? [];
  const late = queue?.tasks.filter(task => !["COMPLETED","CANCELLED"].includes(task.status) && task.due_at && Date.parse(task.due_at) < now) ?? [];
  const soon = queue?.tasks.filter(task => !["COMPLETED","CANCELLED"].includes(task.status) && task.due_at && Date.parse(task.due_at) >= now && Date.parse(task.due_at) <= now + 3 * 86400000) ?? [];
  const waiting = queue?.tasks.filter(task => ["UNDER_REVIEW","BLOCKED"].includes(task.status)) ?? [];
  const returned = queue?.processes.filter(item => item.status === "RETURNED") ?? [];
  return <Section title={lead ? "Kondisi Pekerjaan Divisi" : "Pekerjaan Saya"} description={`${active?.workspace.workspace_name} · ${roleLabel(active?.role_refs ?? [])}`} actions={<Link href={`${base}/processes`}>Buka Perlu Tindakan →</Link>}>
    {error ? <Alert variant="warning" title="Pekerjaan belum dapat dimuat" message={error} /> : !queue ? <LoadingState label="Memuat pekerjaan Anda…" variant="section" /> : <>
      <div className={styles.metricStrip}>{lead ? <><Metric label="Perlu Diperiksa" value={String(reviews.length)} /><Metric label="Perlu Keputusan" value={String(decisions.length)} /><Metric label="Terlambat" value={String(late.length)} /><Metric label="Temuan Aktif" value={String(queue.findings.length)} /></> : <><Metric label="Tugas Saya" value={String(queue.tasks.length)} /><Metric label="Perlu Diperbaiki" value={String(returned.length)} /><Metric label="Mendekati Tenggat" value={String(soon.length)} supportingText="Dalam tiga hari" /><Metric label="Menunggu Tindak Lanjut" value={String(waiting.length)} /><Metric label="Terlambat" value={String(late.length)} /></>}</div>
      <ul className={styles.workList}>{queue.processes.slice(0,3).map(item => <li key={item.process_id} className={styles.workRow}><div><h3>{processTitle(item)}</h3><p>{item.next_action ?? statusLabel(item.status)}</p><small>{item.responsible_workspace_name ?? "Ruang kerja terkait"}</small></div><Link href={`${base}/processes/${encodeURIComponent(item.process_id)}`}>Lihat</Link></li>)}{queue.tasks.slice(0,4).map(task => <li key={task.task_id} className={styles.workRow}><div><h3>{task.title}</h3><p>{task.owner_name ?? "Belum ditugaskan"} · {statusLabel(task.status)}</p><small>{task.due_at ? `Tenggat ${new Date(task.due_at).toLocaleDateString("id-ID")}` : "Tenggat belum ditentukan"}</small></div><Link href={`${base}/tasks/${encodeURIComponent(task.task_id)}`}>Buka Tugas</Link></li>)}</ul>
      {!queue.processes.length && !queue.tasks.length ? <EmptyState title="Tidak ada pekerjaan yang perlu ditangani saat ini" description="Pengajuan dan tugas baru akan tampil saat tersedia dalam ruang kerja Anda." /> : null}
    </>}
  </Section>;
}
