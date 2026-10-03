"use client";

import { useState } from "react";
import { Alert, Button, FormField, Section } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessTargetDetail } from "@/lib/contracts";

export function ClosingActual({ rows, onSaved }: Readonly<{ rows: readonly BusinessTargetDetail[]; onSaved: () => Promise<void> }>) {
  const [selection, setSelection] = useState("");
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const targets = rows.filter(row => row.target.lifecycle_state === "ACTIVE" && row.target.scope.type === "DIVISION" && ["COUNT", "IDR"].includes(row.target.unit));
  const selected = targets.find(row => `${row.target.target_id}:${row.target.version}` === selection)?.target;
  async function calculate() {
    if (!selected) return;
    setBusy(true); setError(null); setMessage(null);
    const identity = requestId ?? crypto.randomUUID(); setRequestId(identity);
    try {
      const path = `/api/v1/business/targets/${encodeURIComponent(selected.target_id)}`;
      await authenticatedApiRequest(`${path}/source-binding`, { method: "POST", body: { target_version: selected.version, metric: selected.unit === "COUNT" ? "CLOSING_COUNT" : "CLOSING_VALUE", reason: reason.trim() } });
      await authenticatedApiRequest(`${path}/calculate`, { method: "POST", body: { target_version: selected.version, request_id: identity } });
      setMessage("Aktual dari Closing selesai telah dicatat dan menunggu verifikasi. Nilai kinerja mengikuti hasil verifikasi.");
      setRequestId(null); await onSaved();
    } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  if (!targets.length) return null;
  return <Section title="Hitung Aktual dari Penjualan">
    <FormField label="Target yang diukur"><select value={selection} onChange={event => { setSelection(event.target.value); setRequestId(null); }}><option value="">Pilih target divisi</option>{targets.map(row => <option key={`${row.target.target_id}:${row.target.version}`} value={`${row.target.target_id}:${row.target.version}`}>{row.target.name} · {row.target.unit === "COUNT" ? "Jumlah Closing selesai" : "Nilai Closing selesai"}</option>)}</select></FormField>
    <FormField label="Dasar pengukuran"><textarea value={reason} onChange={event => setReason(event.target.value)} /></FormField>
    <Button disabled={busy || !selected || !reason.trim()} onClick={() => void calculate()}>Catat Aktual dari Closing</Button>
    {message && <p role="status">{message}</p>}{error && <Alert variant="danger" message={error} />}
  </Section>;
}
