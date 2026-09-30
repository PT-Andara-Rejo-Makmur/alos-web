"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkDataClassification } from "@/lib/contracts";
import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";

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
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<readonly WorkProject[]>([]);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void fetchProjects().then((result) => {
      if (result.connected) setProjects(result.data);
      else setError(result.message ?? "Gagal memuat proyek.");
    });
  }, [open]);

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
        description: description.trim() || null,
        project_id: projectId || null,
        effective_date: effectiveDate || null,
        expiry_date: expiryDate || null,
      });
      onCreated(created);
      setTitle("");
      setCategory("");
      setClassification("INTERNAL");
      setDescription(""); setProjectId(""); setEffectiveDate(""); setExpiryDate("");
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
        <FormField label="Deskripsi"><textarea onChange={(event) => setDescription(event.target.value)} value={description} /></FormField>
        <FormField label="Proyek">
          <select onChange={(event) => setProjectId(event.target.value)} value={projectId}>
            <option value="">Tanpa proyek</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
          </select>
        </FormField>
        <FormField label="Tanggal Berlaku"><input onChange={(event) => setEffectiveDate(event.target.value)} type="date" value={effectiveDate} /></FormField>
        <FormField label="Tanggal Kedaluwarsa"><input min={effectiveDate || undefined} onChange={(event) => setExpiryDate(event.target.value)} type="date" value={expiryDate} /></FormField>
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
