"use client";

import { useState } from "react";
import { Alert, Button, FormField } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { ProcessRequest } from "./process-request";
import type { Resource } from "./resource";

export function BusinessRecordActions({ resource, record, canHire = false, onSaved }: Readonly<{ resource: Resource; record: Readonly<Record<string, unknown>>; canHire?: boolean; onSaved: (row: object) => void }>) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [hiredNumber, setHiredNumber] = useState<string | null>(null);
  const identity = String(record[resource.identifier]);
  async function implement() {
    setBusy(true); setError(null);
    try { onSaved(await authenticatedApiRequest(`/api/v1/property/change-orders/${encodeURIComponent(identity)}/implement`, { method: "POST", body: { reason: reason.trim() } })); }
    catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  async function hire() {
    setBusy(true); setError(null);
    try {
      const employee = await authenticatedApiRequest<{ employee_number: string }>(`/api/v1/hr/candidates/${encodeURIComponent(identity)}/hire`, {
        method: "POST", body: { employee_number: employeeNumber.trim(), join_date: joinDate, reason: reason.trim() },
      });
      setHiredNumber(employee.employee_number);
      onSaved(await authenticatedApiRequest(`/api/v1/hr/candidates/${encodeURIComponent(identity)}`));
    } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  return <div><ProcessRequest key={identity} domain={resource.domain} resource={resource.key} identity={identity} />
    {resource.domain === "property" && resource.key === "change_orders" && record.status === "APPROVED" ? <><FormField label="Hasil pelaksanaan perubahan"><textarea value={reason} onChange={event => setReason(event.target.value)} /></FormField><Button disabled={busy || !reason.trim()} onClick={() => void implement()}>Catat Pelaksanaan Perubahan</Button></> : null}
    {canHire && resource.domain === "hr" && resource.key === "candidates" && ["INTERVIEW", "OFFERED"].includes(String(record.status)) ? <section aria-label="Keputusan penerimaan kandidat">
      <FormField label="Nomor karyawan" htmlFor="hire-employee-number" required><input id="hire-employee-number" value={employeeNumber} onChange={event => setEmployeeNumber(event.target.value)} /></FormField>
      <FormField label="Tanggal mulai bekerja" htmlFor="hire-join-date" required><input id="hire-join-date" type="date" value={joinDate} onChange={event => setJoinDate(event.target.value)} /></FormField>
      <FormField label="Alasan penerimaan" htmlFor="hire-reason" required><textarea id="hire-reason" value={reason} onChange={event => setReason(event.target.value)} /></FormField>
      <Button disabled={busy || !employeeNumber.trim() || !joinDate || !reason.trim()} onClick={() => void hire()}>Terima Kandidat sebagai Karyawan</Button>
    </section> : null}
    {hiredNumber ? <p role="status">Karyawan {hiredNumber} tersimpan dari keputusan penerimaan.</p> : null}
    {error ? <Alert variant="danger" message={error} /> : null}
  </div>;
}
