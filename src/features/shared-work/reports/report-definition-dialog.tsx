"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkReportFrequency } from "@/lib/contracts";

import { createReportDefinition, updateReportDefinition } from "./report-model";
import type { WorkReportDefinition } from "./report-types";
import styles from "./reports.module.css";

interface Props {
  readonly definition?: WorkReportDefinition | null;
  readonly onClose: () => void;
  readonly onSaved: (definition: WorkReportDefinition) => void;
  readonly open: boolean;
}

const frequencies: readonly SharedWorkReportFrequency[] = [
  "DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ON_DEMAND",
];

function splitItems(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

export function ReportDefinitionDialog({ definition, onClose, onSaved, open }: Props) {
  const [name, setName] = useState(definition?.name ?? "");
  const [description, setDescription] = useState(definition?.description ?? "");
  const [reportType, setReportType] = useState(definition?.reportType ?? "");
  const [frequency, setFrequency] = useState<SharedWorkReportFrequency>(
    (definition?.frequency as SharedWorkReportFrequency) ?? "MONTHLY",
  );
  const [scope, setScope] = useState(definition?.scope ?? "");
  const [reviewRequired, setReviewRequired] = useState(definition?.reviewRequired ?? true);
  const [recipients, setRecipients] = useState(definition?.recipients?.join(", ") ?? "");
  const [sections, setSections] = useState(definition?.sections?.join(", ") ?? "");
  const [dataSources, setDataSources] = useState(definition?.dataSources?.join(", ") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const payload = {
      name: name.trim(), description: description.trim() || null,
      report_type: reportType.trim(), frequency,
      scope: scope.trim() || null, review_required: reviewRequired,
      recipients: splitItems(recipients), sections: splitItems(sections),
      data_sources: splitItems(dataSources),
    };
    try {
      const saved = definition
        ? await updateReportDefinition(definition.id, payload)
        : await createReportDefinition(payload);
      onSaved(saved);
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title={definition ? "Ubah Definisi Laporan" : "Tambah Definisi Laporan"}>
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Nama" required><input required maxLength={500} value={name} onChange={(event) => setName(event.target.value)} /></FormField>
        <FormField label="Deskripsi"><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
        <FormField label="Jenis Laporan" required><input required value={reportType} onChange={(event) => setReportType(event.target.value)} /></FormField>
        <FormField label="Frekuensi" required>
          <select value={frequency} onChange={(event) => setFrequency(event.target.value as SharedWorkReportFrequency)}>
            {frequencies.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </FormField>
        <FormField label="Lingkup"><input value={scope} onChange={(event) => setScope(event.target.value)} /></FormField>
        <FormField label="Review Wajib"><input checked={reviewRequired} type="checkbox" onChange={(event) => setReviewRequired(event.target.checked)} /></FormField>
        <FormField label="Penerima"><textarea value={recipients} onChange={(event) => setRecipients(event.target.value)} placeholder="Pisahkan dengan koma" /></FormField>
        <FormField label="Bagian"><textarea value={sections} onChange={(event) => setSections(event.target.value)} placeholder="Pisahkan dengan koma" /></FormField>
        <FormField label="Sumber Data"><textarea value={dataSources} onChange={(event) => setDataSources(event.target.value)} placeholder="Pisahkan dengan koma" /></FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={busy} onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={busy} type="submit">Simpan</Button>
        </div>
      </form>
    </Dialog>
  );
}
