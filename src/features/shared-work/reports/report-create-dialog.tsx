"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, EntitySelect, FormField, FormSection } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";

import { createReportResult } from "./report-model";
import type { WorkReportResult } from "./report-types";
import styles from "./reports.module.css";

interface ReportCreateDialogProps {
  readonly onClose: () => void;
  readonly onCreated: (report: WorkReportResult) => void;
  readonly open: boolean;
}

export function ReportCreateDialog({ onClose, onCreated, open }: ReportCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [customType, setCustomType] = useState("");
  const [reportType, setReportType] = useState("FINANCIAL");
  const [description, setDescription] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [scope, setScope] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<readonly WorkProject[]>([]);
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
      const response = await createReportResult({
        title: title.trim(),
        report_type: reportType === "CUSTOM" ? customType.trim() : reportType,
        description: description.trim() || null,
        period_start: periodStart || null,
        period_end: periodEnd || null,
        scope: scope.trim() || null,
        project_id: projectId || null,
      });
      if (!response.connected || !response.data) {
        setError(response.message || "Gagal membuat laporan.");
        return;
      }
      onCreated(response.data);
      setTitle("");
      setReportType("FINANCIAL");
      setDescription(""); setPeriodStart(""); setPeriodEnd(""); setScope(""); setProjectId("");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tambah Laporan">
      <form className={styles.createForm} onSubmit={submit}>
<FormSection title="Laporan"><FormField label="Nama Laporan" required>
          <input
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Masukkan judul laporan"
            required
            value={title}
          />
        </FormField>
<FormField label="Deskripsi"><textarea onChange={(event) => setDescription(event.target.value)} value={description} /></FormField>
<FormField label="Jenis Laporan" required>
          <select onChange={event => setReportType(event.target.value)} value={reportType} required><option value="FINANCIAL">Keuangan</option><option value="OPERATIONAL">Operasional</option><option value="PROGRESS">Kemajuan Pekerjaan</option><option value="CUSTOM">Lainnya</option></select>
        </FormField>{reportType === "CUSTOM" ? <FormField label="Jenis Laporan Lainnya" required><input maxLength={50} required value={customType} onChange={event => setCustomType(event.target.value)} /></FormField> : null}</FormSection>
<FormSection title="Periode"><FormField label="Periode Mulai"><input onChange={(event) => setPeriodStart(event.target.value)} type="date" value={periodStart} /></FormField>
<FormField label="Periode Selesai"><input min={periodStart || undefined} onChange={(event) => setPeriodEnd(event.target.value)} type="date" value={periodEnd} /></FormField></FormSection>
<FormSection title="Pekerjaan Terkait"><FormField label="Lingkup"><input onChange={(event) => setScope(event.target.value)} value={scope} /></FormField>
<FormField label="Proyek"><EntitySelect label="Proyek" value={projectId} options={projects.map(project => ({value:project.id,label:project.code + " — " + project.name}))} emptyLabel="Tanpa proyek" onChange={setProjectId} /></FormField></FormSection>{error ? <p role="alert">{error}</p> : null}
<div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">
            Batal
          </Button>
          <Button loading={submitting} type="submit">
            Simpan Laporan
          </Button>
        </div>
</form>
    </Dialog>
  );
}
