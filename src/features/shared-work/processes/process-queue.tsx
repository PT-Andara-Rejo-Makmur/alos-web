"use client";

import { useState } from "react";
import { Alert, Button, Dialog, FormField, Section, Status } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { isBusinessWorkQueue } from "@/lib/business-projection";
import type { BusinessWorkQueue, BusinessProcessProjection, BusinessProcessActionRequest } from "@/lib/contracts";
import { SharedWorkDetailRoute } from "../shared/detail-route";
import { ProcessResults } from "./process-results";
import { ProcessPacket } from "./process-packet";
import { ProcessInbox } from "./process-inbox";
import { ProcessTimeline } from "./process-timeline";
import { processTitle } from "./process-presentation";
import { roleLabel, statusLabel } from "@/lib/presentation";
import styles from "@/components/ui/work-surface.module.css";

const fetchQueue = async () => {
  const data = await authenticatedApiRequest<unknown>("/api/v1/business/work-queue");
  if (!isBusinessWorkQueue(data)) throw new Error("Sumber pekerjaan belum memberikan data yang sesuai.");
  return { connected: true, data };
};

export function ProcessItem({ initial, workspaceKey }: Readonly<{ initial: BusinessProcessProjection; workspaceKey: string }>) {
  const [process, setProcess] = useState(initial);
  const [reason, setReason] = useState("");
  const [directionOpen, setDirectionOpen] = useState(false);
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
    try { setProcess(await authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/${encodeURIComponent(process.process_id)}/request-direction`, { method: "POST", body: { reason: reason.trim() } })); setReason(""); setDirectionOpen(false); }
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
  return <div className={styles.stack}>
    <Section title={processTitle(process)} description={process.next_action ?? "Ikuti perkembangan pengajuan."}>
      <div className={styles.detailLayout}>
        <div className={styles.stack}>
          <Section title="Informasi Pengajuan"><ProcessPacket packet={process.packet} workspaceKey={workspaceKey} /></Section>
          {(step || process.can_resubmit) ? <section className={styles.actionArea} aria-label="Tindakan Anda">
            <h3>{step ? statusLabel(step.kind) : "Perlu Diperbaiki"}</h3>
            {step ? <><p>Bertindak sebagai: {step.workspace_name ?? process.responsible_workspace_name ?? "Ruang kerja Anda"} · {roleLabel(step.role)}</p><p>{step.instruction}</p><p>{step.reason}</p></> : <p>Perbaiki pengajuan asal dan kirim kembali sebelum meminta pemeriksaan ulang.</p>}
            <FormField label={step ? "Hasil pemeriksaan atau alasan" : "Perbaikan yang dilakukan"} htmlFor={`reason-${process.process_id}`} required><textarea id={`reason-${process.process_id}`} value={reason} onChange={event => setReason(event.target.value)} /></FormField>
            <div className={styles.actions}>
              {step ? <><Button disabled={busy || !reason.trim()} onClick={() => void act(step.kind === "ACKNOWLEDGEMENT" ? "ACKNOWLEDGE" : "COMPLETE")}>{step.kind === "EXECUTION" ? "Konfirmasi Pelaksanaan" : step.kind === "ACKNOWLEDGEMENT" ? "Sudah Diketahui" : "Simpan Hasil Pemeriksaan"}</Button><Button variant="secondary" disabled={busy || !reason.trim()} onClick={() => void act("RETURN")}>Kembalikan untuk Perbaikan</Button></> : null}
              {step?.can_create_task ? <Button variant="secondary" disabled={busy || !reason.trim()} onClick={() => void createTask()}>Buat Tugas Pelaksanaan</Button> : null}
              {process.can_resubmit ? <Button disabled={busy || !reason.trim()} onClick={() => void resubmit()}>Ajukan Pemeriksaan Ulang</Button> : null}
            </div>
          </section> : null}
          {error ? <Alert variant="danger" message={error} /> : null}
          <ProcessResults process={process} workspaceKey={workspaceKey} onRefresh={refresh} />
          <details><summary>Riwayat proses</summary><ol className={styles.timeline}>{process.history.map(event => <li key={event.history_id}><strong>{event.actor_name ?? "Pengguna perusahaan"} · {event.workspace_name ?? "Ruang kerja terkait"}</strong><p>{event.reason}</p><small>{new Date(event.occurred_at).toLocaleString("id-ID")}</small></li>)}</ol></details>
        </div>
        <aside className={styles.context} aria-label="Konteks pengajuan">
          <Status label={statusLabel(process.status)} variant={process.status === "COMPLETED" ? "success" : process.status === "RETURNED" ? "warning" : "info"} />
          <div><strong>Penanggung Jawab</strong><p>{process.responsible_workspace_name ?? "Belum tersedia"} · {roleLabel(process.responsible_role ?? "")}</p></div>
          <div><strong>Tenggat</strong><p>{process.due_at ? new Date(process.due_at).toLocaleString("id-ID") : "Belum ditentukan"}{!["COMPLETED", "CANCELLED"].includes(process.status) && process.due_at && Date.parse(process.due_at) < observedAt ? " · Terlambat" : ""}</p></div>
          <Section title="Alur Proses"><ProcessTimeline process={process} workspaceKey={workspaceKey} /></Section>
          {process.can_request_direction ? <Button variant="ghost" disabled={busy} onClick={() => { setReason(""); setDirectionOpen(true); }}>Minta Arahan Direktur</Button> : null}
        </aside>
      </div>
    </Section>
    <Dialog open={directionOpen} onClose={() => setDirectionOpen(false)} title="Minta Arahan Direktur" description="Jelaskan alasan kasus ini perlu arahan pimpinan. Arahan tidak menggantikan pemeriksaan atau persetujuan yang diperlukan.">
      <FormField label="Alasan meminta arahan Direktur" required><textarea value={reason} onChange={event => setReason(event.target.value)} /></FormField>
      <div className={styles.actions}><Button variant="secondary" onClick={() => setDirectionOpen(false)}>Batal</Button><Button disabled={busy || !reason.trim()} onClick={() => void requestDirection()}>Kirim Permintaan Arahan</Button></div>
      {error ? <Alert message={error} variant="danger" /> : null}
    </Dialog>
  </div>;
}

export function ProcessQueuePage({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  return <SharedWorkDetailRoute<BusinessWorkQueue> workspaceKey={workspaceKey} id="current" fetchDetail={fetchQueue}
    title="Perlu Tindakan" notFoundTitle="Antrean belum tersedia" loadingLabel="Memuat pekerjaan yang perlu ditangani…"
    renderDetail={queue => <ProcessInbox queue={queue} workspaceKey={workspaceKey} />} />;
}
