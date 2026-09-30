"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await createReportResult({
        title: title.trim(),
        report_type: reportType.trim(),
      });
      if (!response.connected || !response.data) {
        setError(response.message || "Gagal membuat laporan.");
        return;
      }
      onCreated(response.data);
      setTitle("");
      setReportType("FINANCIAL");
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
