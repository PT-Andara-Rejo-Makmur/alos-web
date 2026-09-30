"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkDocumentSourceOptionProjection } from "@/lib/contracts";

import { createDocumentVersion, fetchDocumentSourceOptions } from "./document-model";
import type { WorkDocumentVersion } from "./document-types";
import styles from "./documents.module.css";

interface Props {
  readonly documentId: string;
  readonly onClose: () => void;
  readonly onCreated: (version: WorkDocumentVersion) => void;
}

export function DocumentVersionDialog({ documentId, onClose, onCreated }: Props) {
  const [options, setOptions] = useState<readonly SharedWorkDocumentSourceOptionProjection[]>([]);
  const [selection, setSelection] = useState("");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchDocumentSourceOptions(documentId)
      .then((items) => { if (!cancelled) setOptions(items); })
      .catch((caught) => { if (!cancelled) setError(apiMessage(caught)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [documentId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const selected = options.find((_, index) => String(index) === selection);
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createDocumentVersion(documentId, {
        version: version.trim(), source_id: selected.source_id,
        source_version: selected.source_version,
      });
      onCreated(created);
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog onClose={onClose} open title="Tambah Versi Dokumen">
    <form className={styles.createForm} onSubmit={submit}>
      <FormField label="Versi" required><input maxLength={100} onChange={(event) => setVersion(event.target.value)} required value={version} /></FormField>
      <FormField label="Sumber Terverifikasi" required>
        <select disabled={loading} onChange={(event) => setSelection(event.target.value)} required value={selection}>
          <option value="">Pilih sumber dan versi</option>
          {options.map((option, index) => <option key={`${option.source_id}:${option.source_version}`} value={String(index)}>
            {option.source_title} · {option.source_version}
          </option>)}
        </select>
      </FormField>
      {!loading && options.length === 0 ? <p>Belum ada SourceVersion terverifikasi untuk ruang kerja ini.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      <div className={styles.drawerFooterActions}>
        <Button onClick={onClose} variant="secondary">Batal</Button>
        <Button disabled={!selection || !version.trim() || loading} loading={submitting} type="submit">Simpan Versi</Button>
      </div>
    </form>
  </Dialog>;
}
