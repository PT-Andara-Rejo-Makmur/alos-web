"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, EntitySelect, FormField, FormJourney } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { DocumentUpload, SharedWorkDataClassification } from "@/lib/contracts";
import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";

import { createDocument } from "./document-model";
import type { WorkDocument } from "./document-types";
import { DocumentFilePicker, DocumentUploadStatus, uploadDocumentFile } from "./document-upload";
import styles from "@/components/ui/work-surface.module.css";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: (document: WorkDocument) => void;
}

export function DocumentCreateDialog({ open, onClose, onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("1");
  const [createdDocument, setCreatedDocument] = useState<WorkDocument | null>(null);
  const [upload, setUpload] = useState<DocumentUpload | null>(null);
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

  function close() {
    if (submitting) return;
    setCreatedDocument(null); setUpload(null); setFile(null); setVersion("1");
    setTitle(""); setCategory(""); setDescription(""); setProjectId(""); setClassification("INTERNAL");
    setEffectiveDate(""); setExpiryDate(""); setError(null); onClose();
  }

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
      const created = createdDocument ?? await createDocument({
        title: title.trim(),
        category: category.trim(),
        data_classification: classification,
        description: description.trim() || null,
        project_id: projectId || null,
        effective_date: effectiveDate || null,
        expiry_date: expiryDate || null,
      });
      if (!createdDocument) { setCreatedDocument(created); onCreated(created); }
      if (file) { setUpload(await uploadDocumentFile(created.id, file, version)); return; }
      setTitle("");
      setCategory("");
      setClassification("INTERNAL");
      setDescription(""); setProjectId(""); setEffectiveDate(""); setExpiryDate("");
      close();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog onClose={close} open={open} title="Tambah Dokumen" description="Hubungkan berkas, informasi, dan akses dokumen dengan pekerjaan perusahaan.">
    {upload ? <div className={styles.stack}><h3>{createdDocument?.title}</h3><p>Pantau pemrosesan berkas di bawah. Versi yang berhasil dibaca dapat dilanjutkan ke pemeriksaan dokumen.</p><DocumentUploadStatus initial={upload} /><Button onClick={close}>Kembali ke Dokumen</Button></div>
      : <FormJourney onSubmit={submit} onCancel={close} busy={submitting} disabled={!!file && !version.trim()} submitLabel={createdDocument ? "Coba Unggah Lagi" : "Simpan Dokumen"} feedback={error ? <p role="alert">{error}{createdDocument ? " Informasi dokumen sudah tersimpan; coba unggah lagi tanpa membuat dokumen baru." : ""}</p> : null} steps={[
        { title: "File", content: <><DocumentFilePicker file={file} onChange={setFile} disabled={submitting} /><FormField label="Versi dokumen"><input maxLength={100} value={version} onChange={event => setVersion(event.target.value)} /></FormField><p>Bila berkas berasal dari sumber perusahaan yang sudah tersedia, informasi dokumen dapat disimpan dahulu. Berkas atau sumber dapat dihubungkan dari detail dokumen.</p></> },
        { title: "Informasi", content: <>
          <FormField label="Judul" required><input maxLength={500} value={title} onChange={event => setTitle(event.target.value)} required disabled={!!createdDocument} /></FormField>
          <FormField label="Kategori" required><input maxLength={128} value={category} onChange={event => setCategory(event.target.value)} required disabled={!!createdDocument} /></FormField>
          <FormField label="Deskripsi"><textarea value={description} onChange={event => setDescription(event.target.value)} disabled={!!createdDocument} /></FormField>
          <FormField label="Proyek"><EntitySelect label="Proyek" value={projectId} options={projects.map(project => ({ value: project.id, label: `${project.code} — ${project.name}` }))} emptyLabel="Tanpa proyek" disabled={!!createdDocument} onChange={setProjectId} /></FormField>
          <FormField label="Tanggal Berlaku"><input type="date" value={effectiveDate} onChange={event => setEffectiveDate(event.target.value)} disabled={!!createdDocument} /></FormField>
          <FormField label="Tanggal Kedaluwarsa"><input type="date" min={effectiveDate || undefined} value={expiryDate} onChange={event => setExpiryDate(event.target.value)} disabled={!!createdDocument} /></FormField>
        </> },
        { title: "Akses", content: <><FormField label="Klasifikasi Data" required><select value={classification} disabled={!!createdDocument} onChange={event => setClassification(event.target.value as SharedWorkDataClassification)}><option value="PUBLIC">Publik</option><option value="INTERNAL">Internal</option><option value="CONFIDENTIAL">Rahasia</option><option value="RESTRICTED">Terbatas</option></select></FormField><p>Akses mengikuti pengaturan perusahaan dan ruang kerja dokumen. Berkas tidak dapat dibuka oleh pengguna yang tidak memiliki akses.</p></> },
        { title: "Tinjau", content: <dl className={styles.facts}><div><dt>Dokumen</dt><dd>{title}</dd></div><div><dt>Berkas</dt><dd>{file?.name ?? "Dihubungkan melalui detail dokumen"}</dd></div><div><dt>Versi</dt><dd>{version}</dd></div><div><dt>Proyek</dt><dd>{projects.find(project => project.id === projectId)?.name ?? "Tanpa proyek"}</dd></div></dl> },
      ]} />}
  </Dialog>;
}
