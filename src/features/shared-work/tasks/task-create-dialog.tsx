"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import type { SharedWorkTaskPriority } from "@/lib/contracts";
import { apiMessage } from "@/lib/api";

import { createTask } from "./task-model";
import type { WorkTask } from "./task-types";
import styles from "./tasks.module.css";

interface TaskCreateDialogProps {
  readonly onClose: () => void;
  readonly onCreated: (task: WorkTask) => void;
  readonly open: boolean;
}

export function TaskCreateDialog({ onClose, onCreated, open }: TaskCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SharedWorkTaskPriority>("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask({
        title: title.trim(),
        priority,
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      onCreated(created);
      setTitle("");
      setDescription("");
      setPriority("NORMAL");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tambah Tugas">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Judul Tugas" required>
          <input maxLength={500} onChange={(event) => setTitle(event.target.value)} required value={title} />
        </FormField>
        <FormField label="Deskripsi">
          <textarea onChange={(event) => setDescription(event.target.value)} value={description} />
        </FormField>
        <FormField label="Prioritas">
          <select onChange={(event) => setPriority(event.target.value as SharedWorkTaskPriority)} value={priority}>
            <option value="LOW">Rendah</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Tinggi</option>
            <option value="CRITICAL">Kritis</option>
          </select>
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={submitting} type="submit">Simpan Tugas</Button>
        </div>
      </form>
    </Dialog>
  );
}
