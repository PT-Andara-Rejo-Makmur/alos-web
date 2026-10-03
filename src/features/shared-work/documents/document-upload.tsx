"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, FormField, Status } from "@/components/ui";
import { apiMessage, authenticatedApiRequest, withQuery } from "@/lib/api";
import type { DocumentUpload } from "@/lib/contracts";
import styles from "@/components/ui/work-surface.module.css";

export function documentFileError(file: File): string | null {
  if (!/\.(txt|docx)$/i.test(file.name)) return "Saat ini dokumen yang dapat diproses otomatis adalah DOCX dan TXT.";
  if (!file.size || file.size > 10 * 1024 * 1024) return "Pilih berkas berisi dokumen dengan ukuran maksimal 10 MB.";
  return null;
}

export function uploadDocumentFile(documentId: string, file: File, version: string): Promise<DocumentUpload> {
  const error = documentFileError(file);
  if (error) return Promise.reject(new Error(error));
  return authenticatedApiRequest<DocumentUpload>(withQuery(`/api/v1/documents/${encodeURIComponent(documentId)}/uploads`, { filename: file.name, version: version.trim() }), {
    method: "POST", body: file, headers: { "Content-Type": file.name.toLowerCase().endsWith(".txt") ? "text/plain" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  });
}

export function DocumentFilePicker({ file, onChange, disabled, id = "document-file" }: Readonly<{ file: File | null; onChange: (file: File | null) => void; disabled?: boolean; id?: string }>) {
  const [error, setError] = useState<string | null>(null);
  function choose(value: File | null) { const failure = value ? documentFileError(value) : null; setError(failure); onChange(failure ? null : value); }
  return <div className={styles.uploadArea} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!disabled) choose(event.dataTransfer.files[0] ?? null); }}>
    <FormField label="Berkas" htmlFor={id} error={error ?? undefined}><input id={id} type="file" accept=".txt,.docx" disabled={disabled} onChange={event => choose(event.target.files?.[0] ?? null)} /></FormField>
    <p>Tarik berkas ke sini atau pilih berkas. Saat ini dokumen yang dapat diproses otomatis adalah DOCX dan TXT, maksimal 10 MB.</p>
    {file ? <p role="status">{file.name} · {(file.size / 1024).toFixed(1)} KB</p> : null}
  </div>;
}

const uploadLabels = { QUEUED: "Menunggu pemrosesan", RUNNING: "Membaca isi berkas", SUCCEEDED: "Versi siap diperiksa", FAILED: "Berkas belum dapat dibaca", CANCELLED: "Pemrosesan dibatalkan" };

export function DocumentUploadStatus({ initial, onReady, onChanged }: Readonly<{ initial: DocumentUpload; onReady?: () => void; onChanged?: (result: DocumentUpload) => void }>) {
  const [result, setResult] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const ready = useRef<string | null>(null);
  const readyCallback = useRef(onReady);
  const changedCallback = useRef(onChanged);
  useEffect(() => { changedCallback.current = onChanged; }, [onChanged]);
  useEffect(() => { changedCallback.current?.(result); }, [result]);
  useEffect(() => { readyCallback.current = onReady; }, [onReady]);
  const pending = result.status === "QUEUED" || result.status === "RUNNING";
  useEffect(() => {
    if (result.status === "SUCCEEDED" && ready.current !== result.upload_id) { ready.current = result.upload_id; readyCallback.current?.(); }
  }, [result.status, result.upload_id]);
  useEffect(() => {
    if (!pending || error) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      try {
        const next = await authenticatedApiRequest<DocumentUpload>(`/api/v1/documents/uploads/${encodeURIComponent(result.upload_id)}`, { signal: controller.signal });
        if (!controller.signal.aborted) { setResult(next); if (next.status === "QUEUED" || next.status === "RUNNING") timer = setTimeout(() => void poll(), 2000); }
      } catch (caught) { if (!controller.signal.aborted) setError(apiMessage(caught)); }
    }
    timer = setTimeout(() => void poll(), 2000);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [result.upload_id, pending, error, retry]);
  return <div className={styles.stack} aria-live="polite"><Status label={uploadLabels[result.status]} variant={result.status === "SUCCEEDED" ? "success" : result.status === "FAILED" ? "danger" : "info"} />
    {result.status === "FAILED" ? <p>Periksa isi berkas lalu unggah versi baru. Dokumen yang sudah tersimpan tetap tersedia.</p> : null}
    {error ? <><Alert variant="warning" message={error} /><Button variant="secondary" onClick={() => { setError(null); setRetry(value => value + 1); }}>Periksa Status Lagi</Button></> : null}
  </div>;
}

export function DocumentFileUpload({ documentId, onReady }: Readonly<{ documentId: string; onReady?: () => void }>) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [result, setResult] = useState<DocumentUpload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function upload() {
    if (!file || busy) return;
    setBusy(true); setError(null);
    try { setResult(await uploadDocumentFile(documentId, file, version)); } catch (caught) { setError(apiMessage(caught)); } finally { setBusy(false); }
  }
  return <section className={styles.stack} aria-label="Unggah berkas dokumen">
    <DocumentFilePicker id={`file-${documentId}`} file={file} onChange={setFile} disabled={busy} />
    <FormField label="Versi dokumen" htmlFor={`version-${documentId}`}><input id={`version-${documentId}`} value={version} maxLength={100} pattern={"[\\w.-]+"} onChange={event => setVersion(event.target.value)} /></FormField>
    <Button disabled={!file || !version.trim() || busy || result?.status === "QUEUED" || result?.status === "RUNNING"} onClick={() => void upload()}>{busy ? "Mengunggah…" : "Unggah Berkas"}</Button>
    {result ? <DocumentUploadStatus key={result.upload_id} initial={result} onReady={onReady} onChanged={setResult} /> : null}
    {error ? <Alert variant="danger" message={error} /> : null}
  </section>;
}
