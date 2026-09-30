"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkDataClassification } from "@/lib/contracts";

import { createDocument } from "./document-model";
import type { WorkDocument } from "./document-types";
import styles from "./documents.module.css";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: (document: WorkDocument) => void;
}

export function DocumentCreateDialog({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [classification, setClassification] = useState<SharedWorkDataClassification>("INTERNAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createDocument({
        title: title.trim(),
        category: category.trim(),
        data_classification: classification,
      });
      onCreated(created);
      setTitle("");
      setCategory("");
      setClassification("INTERNAL");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tambah Metadata Dokumen">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Judul" required>
          <input maxLength={500} onChange={(event) => setTitle(event.target.value)} required value={title} />
        </FormField>
        <FormField label="Kategori" required>
          <input maxLength={128} onChange={(event) => setCategory(event.target.value)} required value={category} />
        </FormField>
        <FormField label="Klasifikasi Data" required>
          <select onChange={(event) => setClassification(event.target.value as SharedWorkDataClassification)} value={classification}>
            <option value="PUBLIC">Publik</option>
            <option value="INTERNAL">Internal</option>
            <option value="CONFIDENTIAL">Rahasia</option>
            <option value="RESTRICTED">Terbatas</option>
          </select>
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.drawerFooterActions}>
          <Button onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={submitting} type="submit">Simpan Metadata</Button>
        </div>
      </form>
    </Dialog>
  );
}
