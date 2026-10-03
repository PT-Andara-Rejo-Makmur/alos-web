"use client";

import { useEffect, useState } from "react";
import { Alert, Button, FormField } from "@/components/ui";
import { apiMessage, authenticatedApiRequest, withQuery } from "@/lib/api";
import type { SharedWorkApprovalProjection, SharedWorkApprovalRequest, SharedWorkMaterialActionProjection } from "@/lib/contracts";
import type { Resource } from "./resource";
import { statusLabel } from "@/lib/presentation";

const statusLabels: Record<SharedWorkApprovalProjection["status"], string> = {
  PENDING: "Menunggu Persetujuan", APPROVED: "Disetujui — Siap Dieksekusi",
  RETURNED: "Dikembalikan", REJECTED: "Ditolak", HELD: "Ditahan",
};

export function MaterialActions({ actions, identity, resource, canRequest, onSaved }: Readonly<{
  actions: readonly SharedWorkMaterialActionProjection[]; identity: string; resource: Resource;
  canRequest: boolean; onSaved: (record: object) => void;
}>) {
  const [approvals, setApprovals] = useState<readonly SharedWorkApprovalProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const subjectType = actions[0]?.subject_type;

  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    void authenticatedApiRequest<readonly SharedWorkApprovalProjection[]>(
      withQuery("/api/v1/approvals", { subject_type: subjectType }), { signal: controller.signal },
    ).then((data) => { if (current) { setApprovals(data.filter((approval) => approval.subject_id === identity)); setLoading(false); } })
      .catch((caught: unknown) => { if (current) { setError(apiMessage(caught)); setLoading(false); } });
    return () => { current = false; controller.abort(); };
  }, [identity, subjectType]);

  async function request(action: SharedWorkMaterialActionProjection) {
    setBusy(true); setError(null);
    const body: SharedWorkApprovalRequest = { subject_type: action.subject_type, subject_id: identity,
      requested_action: action.requested_action, ...(reason.trim() ? { reason: reason.trim() } : {}) };
    try {
      const approval = await authenticatedApiRequest<SharedWorkApprovalProjection>("/api/v1/approvals", { method: "POST", body });
      setApprovals((previous) => [approval, ...previous]);
    } catch (caught) { setError(apiMessage(caught)); }
    finally { setBusy(false); }
  }

  async function execute(action: SharedWorkMaterialActionProjection, approval: SharedWorkApprovalProjection) {
    setBusy(true); setError(null);
    try { onSaved(await resource.transition(identity, action.target_status, approval.approval_id)); }
    catch (caught) { setError(apiMessage(caught)); }
    finally { setBusy(false); }
  }

  return <div aria-label="Persetujuan tindakan material">
    <p>Keputusan persetujuan memerlukan reviewer independen di Persetujuan. Eksekusi bisnis dilakukan secara eksplisit setelah disetujui.</p>
    {canRequest ? <FormField label="Alasan permintaan" htmlFor={`material-reason-${identity}`}><textarea id={`material-reason-${identity}`} value={reason} onChange={(event) => setReason(event.target.value)} /></FormField> : null}
    {loading ? <p role="status">Memuat persetujuan…</p> : actions.map((action) => {
      const approval = approvals.find((item) => item.requested_action === action.requested_action);
      return <div key={action.requested_action}>
        <p>{statusLabel(action.requested_action)} · {approval?.consumed_at ? "Persetujuan sudah digunakan" : approval ? statusLabels[approval.status] ?? statusLabel(approval.status) : "Belum diminta"}</p>
        {canRequest && (!approval || ["RETURNED", "REJECTED", "HELD"].includes(approval.status) || !!approval.consumed_at) ? <Button disabled={busy} onClick={() => void request(action)}>Minta Persetujuan {statusLabel(action.target_status)}</Button> : null}
        {canRequest && approval?.status === "APPROVED" && !approval.consumed_at ? <Button disabled={busy} variant="secondary" onClick={() => void request(action)}>Minta Persetujuan Baru {statusLabel(action.target_status)}</Button> : null}
        {approval?.status === "APPROVED" && !approval.consumed_at && action.execution_allowed ? <Button disabled={busy} onClick={() => void execute(action, approval)}>Jalankan Tindakan {statusLabel(action.target_status)}</Button> : null}
        {approval?.status === "APPROVED" && !action.execution_allowed ? <p>Tindakan memerlukan kewenangan penanggung jawab yang sesuai.</p> : null}
      </div>;
    })}
    {error ? <Alert title="Persetujuan belum dapat diproses" message={error} variant="danger" /> : null}
  </div>;
}
