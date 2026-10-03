"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, authenticatedApiRequest, apiMessage } from "@/lib/api";
import type { AraActionProposalProjection, AraTaskExecutionReceipt } from "@/lib/contracts";

export function ReviewedTask({ proposal, threadId, runId }: Readonly<{
  proposal: AraActionProposalProjection; threadId: string; runId: string;
}>) {
  const params = useParams<{ workspaceKey: string }>();
  const path = `/api/v1/ara/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}/proposals/${encodeURIComponent(proposal.proposal_id)}/task`;
  const [receipt, setReceipt] = useState<AraTaskExecutionReceipt | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    authenticatedApiRequest<AraTaskExecutionReceipt>(path).then(result => { if (live) setReceipt(result); })
      .catch(failure => { if (live && !(failure instanceof ApiError && failure.status === 404)) setError(apiMessage(failure)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [path]);
  async function execute() {
    if (saving || receipt) return;
    setSaving(true); setError(null);
    try {
      setReceipt(await authenticatedApiRequest<AraTaskExecutionReceipt>(path, { method: "POST", body: {
        review_reason: reason.trim(), task: { title: title.trim(), priority: "NORMAL",
          ...(description.trim() ? { description: description.trim() } : {}) },
      } }));
    } catch (failure) { setError(apiMessage(failure)); }
    finally { setSaving(false); }
  }
  return <aside>
    <strong>{receipt ? "Tugas sudah dibuat setelah pemeriksaan" : "Usulan tugas · Perlu pemeriksaan Anda"}</strong>
    <p>{proposal.summary}</p>
    {receipt ? <><p>{receipt.review_reason}</p><Link href={`/workspace/${encodeURIComponent(params?.workspaceKey ?? "")}/tasks/${encodeURIComponent(receipt.task_id)}`}>Buka tugas</Link></>
      : !loading && <form onSubmit={event => { event.preventDefault(); void execute(); }}>
        <label>Judul tugas<input required maxLength={500} value={title} onChange={event => setTitle(event.target.value)} /></label>
        <label>Rincian pekerjaan<textarea maxLength={4000} value={description} onChange={event => setDescription(event.target.value)} /></label>
        <label>Alasan setelah pemeriksaan<textarea required maxLength={4000} value={reason} onChange={event => setReason(event.target.value)} /></label>
        <button type="submit" disabled={saving || !title.trim() || !reason.trim()}>Periksa dan buat tugas</button>
      </form>}
    {error && <p role="alert">{error}</p>}
  </aside>;
}
