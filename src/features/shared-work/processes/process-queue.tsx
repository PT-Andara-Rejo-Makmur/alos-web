"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Button, FormField, Section } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessWorkQueue, BusinessProcessProjection, BusinessProcessActionRequest } from "@/lib/contracts";
import { SharedWorkDetailRoute } from "../shared/detail-route";
import { ProcessResults } from "./process-results";
import { ProcessPacket } from "./process-packet";

const fetchQueue = async () => ({ connected: true, data: await authenticatedApiRequest<BusinessWorkQueue>("/api/v1/business/work-queue") });
const labels: Record<string, string> = { READY: "Siap diperiksa", IN_PROGRESS: "Sedang ditangani", RETURNED: "Perlu diperbaiki", COMPLETED: "Selesai", PENDING: "Menunggu", CANCELLED: "Dibatalkan", SKIPPED: "Tidak diperlukan",
  REVIEW: "Perlu Diperiksa", DECISION: "Perlu Keputusan", EXECUTION: "Perlu Ditindaklanjuti", ACKNOWLEDGEMENT: "Untuk Diketahui",
  DIVISION_LEAD: "Kepala Divisi", DIVISION_MEMBER: "Anggota Divisi", IT_ADMIN: "Administrator IT", EXECUTIVE: "Direktur" };

export function ProcessItem({ initial, workspaceKey }: Readonly<{ initial: BusinessProcessProjection; workspaceKey: string }>) {
  const [process, setProcess] = useState(initial);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [observedAt] = useState(() => Date.now());
  const step = process.steps.find(item => item.can_act);
  const refresh = async () => { setProcess(await authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/${encodeURIComponent(process.process_id)}`)); };
  async function act(action: BusinessProcessActionRequest["action"]) {
    if (!step) return;
    setBusy(true); setError(null);
    try { setProcess(await authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/${encodeURIComponent(process.process_id)}/steps/${encodeURIComponent(step.step_id)}/actions`, {
      method: "POST", body: { action, subject_snapshot: process.subject_snapshot, reason: reason.trim() },
    })); setReason(""); } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  async function resubmit() {
    setBusy(true); setError(null);
    try { setProcess(await authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/${encodeURIComponent(process.process_id)}/resubmit`, { method: "POST", body: { reason: reason.trim() } })); setReason(""); }
    catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  async function requestDirection() {
    setBusy(true); setError(null);
    try { setProcess(await authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/${encodeURIComponent(process.process_id)}/request-direction`, { method: "POST", body: { reason: reason.trim() } })); setReason(""); }
    catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  async function createTask() {
    if (!step) return;
    setBusy(true); setError(null);
    try {
      await authenticatedApiRequest(`/api/v1/processes/${encodeURIComponent(process.process_id)}/steps/${encodeURIComponent(step.step_id)}/task`, { method: "POST", body: { reason: reason.trim() } });
      setProcess(await authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/${encodeURIComponent(process.process_id)}`));
      setReason("");
    } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  const subject = process.packet.certificate_number ?? process.packet.change_number ?? process.packet.contract_number ?? process.packet.position_title ?? process.packet.employee_number ?? "Pengajuan bisnis";
  return <Section title={String(subject)}>
    <p>{labels[process.status]} · {step ? labels[step.kind] : "Pemeriksaan tersimpan"}</p>
    <p>{process.next_action ?? "Tidak ada tindakan berikutnya"}</p>
    <ProcessPacket packet={process.packet} />
    {process.responsible_workspace_name ? <p>Ditangani: {process.responsible_workspace_name} · {labels[process.responsible_role ?? ""] ?? "Penanggung jawab pengajuan"}</p> : null}
    {step ? <p>Bertindak sebagai: {labels[step.role]} · {step.reason}</p> : null}
    {process.due_at ? <p>Tenggat: {new Date(process.due_at).toLocaleString("id-ID")}{Date.parse(process.due_at) < observedAt ? " · Terlambat" : ""}</p> : null}
    <ol>{process.steps.map(item => <li key={item.step_id}>{item.workspace_name} · {item.instruction}: {labels[item.status]}{item.actor_name ? ` · ${item.actor_name}` : ""}{item.task_id ? <> · <Link href={`/workspace/${encodeURIComponent(workspaceKey)}/tasks/${encodeURIComponent(item.task_id)}`}>Buka Tugas Pelaksanaan</Link></> : null}</li>)}</ol>
    {step ? <><FormField label="Hasil pemeriksaan atau alasan" htmlFor={`reason-${process.process_id}`}><textarea id={`reason-${process.process_id}`} value={reason} onChange={event => setReason(event.target.value)} /></FormField>
      <Button disabled={busy || !reason.trim()} onClick={() => void act(step.kind === "ACKNOWLEDGEMENT" ? "ACKNOWLEDGE" : "COMPLETE")}>{step.kind === "EXECUTION" ? "Konfirmasi Pelaksanaan" : step.kind === "ACKNOWLEDGEMENT" ? "Sudah Diketahui" : "Simpan Hasil Pemeriksaan"}</Button>
      <Button variant="secondary" disabled={busy || !reason.trim()} onClick={() => void act("RETURN")}>Kembalikan untuk Perbaikan</Button></> : null}
    {step?.can_create_task ? <Button variant="secondary" disabled={busy || !reason.trim()} onClick={() => void createTask()}>Buat Tugas Pelaksanaan</Button> : null}
    {process.can_resubmit ? <><p>Perbaiki pengajuan asal dan kirim kembali sebelum meminta pemeriksaan ulang.</p><FormField label="Perbaikan yang dilakukan"><textarea value={reason} onChange={event => setReason(event.target.value)} /></FormField><Button disabled={busy || !reason.trim()} onClick={() => void resubmit()}>Ajukan Pemeriksaan Ulang</Button></> : null}
    {process.can_request_direction ? <>{!step && <FormField label="Alasan meminta arahan Direktur"><textarea value={reason} onChange={event => setReason(event.target.value)} /></FormField>}<Button variant="secondary" disabled={busy || !reason.trim()} onClick={() => void requestDirection()}>Minta Arahan Direktur</Button></> : null}
    {error ? <Alert variant="danger" message={error} /> : null}
    <ProcessResults process={process} workspaceKey={workspaceKey} onRefresh={refresh} />
    <details><summary>Riwayat proses</summary><ol>{process.history.map(event => <li key={event.history_id}>{new Date(event.occurred_at).toLocaleString("id-ID")} · {event.actor_name} · {event.workspace_name} · {event.reason}</li>)}</ol></details>
  </Section>;
}

export function ProcessQueuePage({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  return <SharedWorkDetailRoute<BusinessWorkQueue> workspaceKey={workspaceKey} id="current" fetchDetail={fetchQueue}
    title="Perlu Tindakan" notFoundTitle="Antrean belum tersedia" loadingLabel="Memuat pekerjaan yang perlu ditangani…"
    renderDetail={queue => <div>{queue.processes.length ? queue.processes.map(item => <ProcessItem key={item.process_id} initial={item} workspaceKey={workspaceKey} />) : <p>Tidak ada pemeriksaan yang perlu Anda tangani di ruang kerja aktif.</p>}
      {queue.tasks.length ? <Section title="Perlu Ditindaklanjuti"><ul>{queue.tasks.map(task => <li key={task.task_id}><Link href={`/workspace/${encodeURIComponent(workspaceKey)}/tasks/${encodeURIComponent(task.task_id)}`}>{task.title}</Link>{task.due_at ? ` · Tenggat ${new Date(task.due_at).toLocaleDateString("id-ID")}` : ""}</li>)}</ul></Section> : null}
      {queue.approvals.length ? <Section title="Perlu Keputusan atau Perbaikan"><ul>{queue.approvals.map(item => <li key={item.approval_id}><Link href={`/workspace/${encodeURIComponent(workspaceKey)}/approvals/${encodeURIComponent(item.approval_id)}`}>{item.reason ?? "Pengajuan keputusan"}</Link></li>)}</ul></Section> : null}
      {queue.findings.length ? <Section title="Temuan Perlu Ditangani"><ul>{queue.findings.map(item => <li key={item.finding_id}><Link href={`/workspace/${encodeURIComponent(workspaceKey)}/findings/${encodeURIComponent(item.finding_id)}`}>{item.title}</Link>{item.due_date ? ` · Tenggat ${new Date(item.due_date).toLocaleDateString("id-ID")}` : ""}</li>)}</ul></Section> : null}
      {queue.notifications.length ? <Section title="Pemberitahuan"><ul>{queue.notifications.map(item => <li key={item.notification_id}>{item.event === "ESCALATED" ? item.title : <Link href={`/workspace/${encodeURIComponent(workspaceKey)}/processes/${encodeURIComponent(item.process_id)}`}>{item.title}</Link>} · {new Date(item.created_at).toLocaleString("id-ID")}</li>)}</ul></Section> : null}
    </div>} />;
}
