"use client";

import { useEffect, useState } from "react";
import { Button, FormField } from "@/components/ui";
import { apiMessage, authenticatedApiRequest, withQuery } from "@/lib/api";
import type { DocumentUpload } from "@/lib/contracts";

export function DocumentFileUpload({ documentId }: Readonly<{ documentId: string }>) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [result, setResult] = useState<DocumentUpload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadId = result?.upload_id;
  const pending = result?.status === "QUEUED" || result?.status === "RUNNING";
  useEffect(() => {
    if (!uploadId || !pending) return;
    const controller = new AbortController();
    const timer = setInterval(() => { void authenticatedApiRequest<DocumentUpload>(`/api/v1/documents/uploads/${encodeURIComponent(uploadId)}`, { signal: controller.signal })
      .then(setResult).catch(caught => { if (!controller.signal.aborted) setError(apiMessage(caught)); }); }, 2000);
    return () => { clearInterval(timer); controller.abort(); };
  }, [uploadId, pending]);
  async function upload() {
    if (!file) return;
    setBusy(true); setError(null);
    try { setResult(await authenticatedApiRequest<DocumentUpload>(withQuery(`/api/v1/documents/${encodeURIComponent(documentId)}/uploads`, { filename: file.name, version: version.trim() }),
      { method: "POST", body: file, headers: { "Content-Type": file.name.toLowerCase().endsWith(".txt") ? "text/plain" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } }));
    } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  const labels = { QUEUED: "Menunggu pemrosesan", RUNNING: "Membaca isi berkas", SUCCEEDED: "Versi siap diperiksa", FAILED: "Berkas belum dapat dibaca", CANCELLED: "Pemrosesan dibatalkan" };
  return <section aria-label="Unggah berkas dokumen">
    <FormField label="Berkas" htmlFor={`file-${documentId}`}><input id={`file-${documentId}`} type="file" accept=".txt,.docx" onChange={event => setFile(event.target.files?.[0] ?? null)} /></FormField>
    <FormField label="Versi dokumen" htmlFor={`version-${documentId}`}><input id={`version-${documentId}`} value={version} maxLength={100} onChange={event => setVersion(event.target.value)} /></FormField>
    <p>TEXT dan DOCX, maksimal 10 MB. Akses mengikuti pengaturan dokumen.</p>
    <Button disabled={!file || !version.trim() || pending || busy} onClick={() => void upload()}>Unggah Berkas</Button>
    {result ? <p role="status">{labels[result.status]}{result.status === "SUCCEEDED" ? ". Muat ulang detail untuk melihat versi baru." : ""}</p> : null}
    {error ? <p role="alert">{error}</p> : null}
  </section>;
}
