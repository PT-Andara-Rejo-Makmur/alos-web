"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
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
        report_type: reportType.trim(),
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
        <FormField label="Nama Laporan" required>
          <input
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Masukkan judul laporan"
            required
            value={title}
          />
        </FormField>
        <FormField label="Deskripsi"><textarea onChange={(event) => setDescription(event.target.value)} value={description} /></FormField>
        <FormField label="Periode Mulai"><input onChange={(event) => setPeriodStart(event.target.value)} type="date" value={periodStart} /></FormField>
        <FormField label="Periode Selesai"><input min={periodStart || undefined} onChange={(event) => setPeriodEnd(event.target.value)} type="date" value={periodEnd} /></FormField>
        <FormField label="Lingkup"><input onChange={(event) => setScope(event.target.value)} value={scope} /></FormField>
        <FormField label="Proyek"><select onChange={(event) => setProjectId(event.target.value)} value={projectId}>
          <option value="">Tanpa proyek</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
        </select></FormField>
        <FormField label="Jenis Laporan" required>
          <input
            maxLength={50}
            onChange={(event) => setReportType(event.target.value)}
            placeholder="Contoh: FINANCIAL, OPERATIONAL, AUDIT"
            required
            value={reportType}
          />
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
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
