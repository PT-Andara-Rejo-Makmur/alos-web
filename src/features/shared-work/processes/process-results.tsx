"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, FormField } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessProcessProjection, FinancePayableProjection, LegalContractListProjection } from "@/lib/contracts";

export function ProcessResults({ process, workspaceKey, onRefresh }: Readonly<{ process: BusinessProcessProjection; workspaceKey: string; onRefresh: () => Promise<void> }>) {
  const [contracts, setContracts] = useState<LegalContractListProjection["items"]>([]);
  const [contract, setContract] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [payable, setPayable] = useState<FinancePayableProjection | null>(null);
  useEffect(() => {
    if (!process.can_attach_contract) return;
    let current = true;
    void authenticatedApiRequest<LegalContractListProjection>("/api/v1/legal/contracts").then(value => { if (current) setContracts(value.items); }).catch(caught => { if (current) setError(apiMessage(caught)); });
    return () => { current = false; };
  }, [process.can_attach_contract]);
  async function linkContract() {
    setBusy(true); setError(null);
    try {
      await authenticatedApiRequest(`/api/v1/legal/contracts/${encodeURIComponent(contract)}/business-origin`, { method: "POST", body: { process_id: process.process_id, reason: reason.trim() } });
      setMessage("Kontrak terhubung. Penanggung jawab perlu mengajukan pemeriksaan ulang."); await onRefresh();
    } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  async function createPayable() {
    setBusy(true); setError(null);
    try { setPayable(await authenticatedApiRequest<FinancePayableProjection>(`/api/v1/finance/payment-certificates/${encodeURIComponent(process.process_id)}/payable`, { method: "POST", body: {} })); }
    catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  return <div>{process.can_attach_contract ? <><FormField label="Kontrak yang mendukung pengajuan"><select value={contract} onChange={event => setContract(event.target.value)}><option value="">Pilih kontrak Legal</option>{contracts.map(item => <option key={item.contract_id} value={item.contract_id}>{item.contract_number}</option>)}</select></FormField>
    <FormField label="Alasan hubungan kontrak"><textarea value={reason} onChange={event => setReason(event.target.value)} /></FormField><Button disabled={busy || !contract || !reason.trim()} onClick={() => void linkContract()}>Hubungkan Kontrak</Button></> : null}
    {process.can_create_payable ? <Button disabled={busy} onClick={() => void createPayable()}>Buat Kewajiban Pembayaran</Button> : null}
    {payable ? <p role="status">Kewajiban {payable.reference} tersimpan dengan nilai {payable.amount}. <Link href={`/workspace/${encodeURIComponent(workspaceKey)}/payables`}>Buka Utang dan Pembayaran</Link></p> : null}
    {message ? <p role="status">{message}</p> : null}{error ? <Alert variant="danger" message={error} /> : null}
  </div>;
}
