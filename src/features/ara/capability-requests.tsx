"use client";

import { useEffect, useState } from "react";
import { Alert, Button, FormField, Section } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { CapabilityBusinessRequest, CapabilityBusinessRequestOverview } from "../../../../alos-contracts/generated/typescript/business";
import { ProcessRequest } from "@/features/business-records/process-request";

const root = "/api/v1/business/capability-requests";
const stateLabels = { UNRESOLVED: "Perlu pemeriksaan kebutuhan", RESOLVING: "Sedang dianalisis", RESOLVED: "Hasil analisis tersedia", FAILED: "Analisis perlu diulang" };

export function CapabilityRequests() {
  const [open, setOpen] = useState(false);
  return <Section title="Bantuan untuk kebutuhan bisnis">
    <Button onClick={() => setOpen(value => !value)} variant="secondary">{open ? "Tutup permintaan bantuan" : "Ajukan bantuan ALOS"}</Button>
    {open && <RequestContent />}
  </Section>;
}

function RequestContent() {
  const [overview, setOverview] = useState<CapabilityBusinessRequestOverview | null>(null);
  const [need, setNeed] = useState("");
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reload = async () => setOverview(await authenticatedApiRequest<CapabilityBusinessRequestOverview>(root));
  useEffect(() => {
    const controller = new AbortController();
    authenticatedApiRequest<CapabilityBusinessRequestOverview>(root, { signal: controller.signal }).then(setOverview)
      .catch(failure => { if (!controller.signal.aborted) setError(apiMessage(failure)); });
    return () => controller.abort();
  }, []);
  async function create() {
    setBusy(true); setError(null);
    try {
      await authenticatedApiRequest(root, { method: "POST", body: { need: need.trim(), goal: goal.trim(), business_context: context.trim() || null } });
      setNeed(""); setGoal(""); setContext(""); await reload();
    } catch (failure) { setError(apiMessage(failure)); }
    finally { setBusy(false); }
  }
  return <>
    {overview?.can_create && <form onSubmit={event => { event.preventDefault(); void create(); }}>
      <FormField label="Apa yang ingin dibantu ALOS?" required><textarea required maxLength={4000} value={need} onChange={event => setNeed(event.target.value)} /></FormField>
      <FormField label="Tujuan" required><textarea required maxLength={2000} value={goal} onChange={event => setGoal(event.target.value)} /></FormField>
      <FormField label="Konteks bisnis tambahan"><textarea maxLength={2000} value={context} onChange={event => setContext(event.target.value)} /></FormField>
      <Button type="submit" disabled={busy || !need.trim() || !goal.trim()}>Simpan kebutuhan</Button>
    </form>}
    {overview?.items.map(row => <RequestCard key={row.request_id} row={row} canResolve={overview.can_resolve} onChanged={reload} />)}
    {overview?.items.length === 0 && <p>Belum ada permintaan bantuan pada ruang kerja ini.</p>}
    {error && <Alert message={error} variant="danger" />}
  </>;
}

function RequestCard({ row, canResolve, onChanged }: Readonly<{ row: CapabilityBusinessRequest; canResolve: boolean; onChanged: () => Promise<void> }>) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function command(action: "resolve" | "review") {
    setBusy(true); setError(null);
    try { await authenticatedApiRequest(`${root}/${encodeURIComponent(row.request_id)}/${action}`, { method: "POST", body: { reason: reason.trim() } }); await onChanged(); setReason(""); }
    catch (failure) { setError(apiMessage(failure)); }
    finally { setBusy(false); }
  }
  return <article>
    <h3>{row.need}</h3><p>Tujuan: {row.goal}</p><p>{stateLabels[row.resolution_state]}</p>
    {row.business_context && <p>{row.business_context}</p>}
    <ProcessRequest domain="core" resource="capability_requests" identity={row.request_id} />
    {row.factory_result && <><p>{row.factory_result.decision === "REUSE" ? "Kapabilitas existing dapat digunakan" : "Draft bantuan baru telah disiapkan"}: {row.factory_result.reason}</p>
      {row.governance.map(item => <p key={`${item.subject_id}-${item.version}`}>{item.registry_state === "ACTIVE" && item.release_state === "ACTIVE" ? "Aktif melalui release yang disetujui" : "Menunggu pemeriksaan, pengujian, dan release"}</p>)}</>}
    {row.review_id && <p>Tinjauan AI tersimpan. Keputusan dan pengujian tetap mengikuti kewenangan perusahaan.</p>}
    {canResolve && <><FormField label="Hasil pemeriksaan atau alasan"><textarea value={reason} maxLength={4000} onChange={event => setReason(event.target.value)} /></FormField>
      {row.resolution_state !== "RESOLVED" && <Button disabled={busy || !reason.trim() || row.resolution_state === "RESOLVING"} onClick={() => void command("resolve")}>Periksa dan analisis kebutuhan</Button>}
      {row.factory_result?.agent_draft && <Button disabled={busy || !reason.trim()} onClick={() => void command("review")}>Minta tinjauan teknis</Button>}
    </>}
    {error && <Alert message={error} variant="danger" />}
  </article>;
}
