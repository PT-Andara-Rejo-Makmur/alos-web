"use client";

import Link from "next/link";
import { Alert, Button, Dialog, FormField } from "@/components/ui";
import styles from "@/components/ui/work-surface.module.css";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, authenticatedApiRequest, apiMessage } from "@/lib/api";
import type { AraActionProposalProjection, AraTaskExecutionReceipt } from "@/lib/contracts";

export function ReviewedTask({ proposal, threadId, runId }: Readonly<{
  proposal: AraActionProposalProjection; threadId: string; runId: string;
}>) {
  const params = useParams<{ workspaceKey: string }>();
  const path = `/api/v1/ara/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}/proposals/${encodeURIComponent(proposal.proposal_id)}/task`;
  const [reviewing, setReviewing] = useState(false);
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
  return <aside className={styles.actionArea}>
    <strong>{receipt ? "Tugas sudah dibuat setelah pemeriksaan" : "ARA menyarankan tindakan"}</strong>
    <p>{proposal.summary}</p>
    {receipt ? <><p>{receipt.review_reason}</p><Link href={`/workspace/${encodeURIComponent(params?.workspaceKey ?? "")}/tasks/${encodeURIComponent(receipt.task_id)}`}>Buka tugas</Link></>
      : !loading && <><Button variant="secondary" onClick={() => setReviewing(true)}>Tinjau</Button><Dialog open={reviewing} onClose={() => setReviewing(false)} title="Tinjau Usulan Tugas" description="Periksa pekerjaan dan alasan sebelum membuat tugas dalam ruang kerja Anda."><form className={styles.stack} onSubmit={event => { event.preventDefault(); void execute(); }}>
        <FormField label="Judul tugas" required><input required maxLength={500} value={title} onChange={event => setTitle(event.target.value)} /></FormField>
        <FormField label="Rincian pekerjaan"><textarea maxLength={4000} value={description} onChange={event => setDescription(event.target.value)} /></FormField>
        <FormField label="Alasan setelah pemeriksaan" required><textarea required maxLength={4000} value={reason} onChange={event => setReason(event.target.value)} /></FormField>
        <Button type="submit" disabled={saving || !title.trim() || !reason.trim()} loading={saving}>Periksa dan buat tugas</Button>{error ? <Alert variant="danger" message={error} /> : null}
      </form></Dialog></>}
    {error && <p role="alert">{error}</p>}
  </aside>;
}
