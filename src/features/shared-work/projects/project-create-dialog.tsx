"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";

import { createProject } from "./project-model";
import type { WorkProject } from "./project-types";
import styles from "./projects.module.css";

interface ProjectCreateDialogProps {
  readonly onClose: () => void;
  readonly onCreated: (project: WorkProject) => void;
  readonly open: boolean;
}

export function ProjectCreateDialog({ onClose, onCreated, open }: ProjectCreateDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "CRITICAL">("NORMAL");
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createProject({
        code: code.trim(),
        name: name.trim(),
        objective: objective.trim(),
        priority,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(targetEndDate ? { target_end_date: targetEndDate } : {}),
      });
      onCreated(created);
      setCode("");
      setName("");
      setDescription("");
      setObjective("");
      setPriority("NORMAL");
      setStartDate("");
      setTargetEndDate("");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tambah Proyek">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Kode Proyek" required>
          <input maxLength={128} onChange={(event) => setCode(event.target.value)} required value={code} />
        </FormField>
        <FormField label="Nama Proyek" required>
          <input maxLength={300} onChange={(event) => setName(event.target.value)} required value={name} />
        </FormField>
        <FormField label="Deskripsi">
          <textarea onChange={(event) => setDescription(event.target.value)} value={description} />
        </FormField>
        <FormField label="Tujuan Proyek" required>
          <textarea required maxLength={4000} onChange={event => setObjective(event.target.value)} value={objective} />
        </FormField>
        <FormField label="Prioritas">
          <select value={priority} onChange={event => setPriority(event.target.value as typeof priority)}>
            <option value="LOW">Rendah</option><option value="NORMAL">Normal</option><option value="HIGH">Tinggi</option><option value="CRITICAL">Mendesak</option>
          </select>
        </FormField>
        <FormField label="Tanggal Mulai">
          <input onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} />
        </FormField>
        <FormField label="Target Selesai">
          <input onChange={(event) => setTargetEndDate(event.target.value)} type="date" value={targetEndDate} />
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={submitting} type="submit">Simpan Proyek</Button>
        </div>
      </form>
    </Dialog>
  );
}
