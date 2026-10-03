"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Button, FormField } from "@/components/ui";
import { ApiRequestError, apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessProcessProjection, BusinessProcessType } from "@/lib/contracts";

const types: Record<string, BusinessProcessType> = { "property/change_orders": "CHANGE_ORDER",
  "property/payment_certificates": "PAYMENT_CERTIFICATE", "sales/bookings": "BOOKING",
  "hr/onboardings": "ONBOARDING", "hr/employees": "OFFBOARDING", "hr/recruitments": "RECRUITMENT", "hr/employment_contracts": "EMPLOYMENT_CONTRACT", "core/capability_requests": "CAPABILITY_REQUEST" };

export function ProcessRequest({ domain, resource, identity }: Readonly<{ domain: string; resource: string; identity: string }>) {
  const kind = types[`${domain}/${resource}`];
  const params = useParams<{ workspaceKey?: string }>();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BusinessProcessProjection | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!kind) return;
    let current = true;
    void authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/subjects/${kind}/${encodeURIComponent(identity)}`).then(value => {
      if (!current) return;
      if (!value || typeof value.process_id !== "string" || !Array.isArray(value.steps)) throw new Error("Riwayat pengajuan belum dapat dimuat.");
      setResult(value);
    })
      .catch(caught => { if (current && !(caught instanceof ApiRequestError && caught.status === 404)) setError(apiMessage(caught)); });
    return () => { current = false; };
  }, [kind, identity]);
  if (!kind) return null;
  async function submit() {
    setBusy(true); setError(null);
    try { setResult(await authenticatedApiRequest<BusinessProcessProjection>("/api/v1/processes", {
      method: "POST", body: { business_type: kind, subject_id: identity, reason: reason.trim() },
    })); } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  return <section aria-label="Alur pemeriksaan bisnis">
    {!result ? <><FormField label="Alasan pengajuan" htmlFor={`process-reason-${identity}`}><textarea id={`process-reason-${identity}`} value={reason} onChange={event => setReason(event.target.value)} /></FormField>
    <Button disabled={busy || !reason.trim()} onClick={() => void submit()}>{kind === "OFFBOARDING" ? "Ajukan Pengakhiran Kerja" : "Ajukan Pemeriksaan"}</Button></> : null}
    {result ? <p role="status">{result.next_action ?? "Pemeriksaan selesai"}. Buka Perlu Tindakan untuk pemeriksaan yang ditugaskan kepada Anda.</p> : null}
    {result && params?.workspaceKey ? <Link href={`/workspace/${encodeURIComponent(params.workspaceKey)}/processes/${encodeURIComponent(result.process_id)}`}>Lihat Penanggung Jawab dan Riwayat Pengajuan</Link> : null}
    {error ? <Alert variant="danger" message={error} /> : null}
  </section>;
}
