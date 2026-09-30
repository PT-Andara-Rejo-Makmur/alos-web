"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import type { SharedWorkTaskPriority } from "@/lib/contracts";
import { apiMessage } from "@/lib/api";

import { createTask } from "./task-model";
import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";
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
  const [projectId, setProjectId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [startDate, setStartDate] = useState("");
  const [projects, setProjects] = useState<readonly WorkProject[]>([]);
  const [projectsConnected, setProjectsConnected] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void fetchProjects().then((response) => {
      if (cancelled) return;
      setProjects(response.data);
      setProjectsConnected(response.connected);
    });
    return () => { cancelled = true; };
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (projectId && !projects.some((project) => project.id === projectId)) {
      setError("Proyek yang dipilih tidak tersedia pada ruang kerja aktif.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask({
        title: title.trim(),
        priority,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(projectId ? { project_id: projectId } : {}),
        ...(dueAt ? { due_at: new Date(dueAt).toISOString() } : {}),
        ...(startDate ? { start_date: startDate } : {}),
      });
      onCreated(created);
      setTitle("");
      setDescription("");
      setPriority("NORMAL");
      setProjectId("");
      setDueAt("");
      setStartDate("");
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
        <FormField label="Proyek">
          <select onChange={(event) => setProjectId(event.target.value)} value={projectId}>
            <option value="">Tanpa proyek</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
          </select>
        </FormField>
        {!projectsConnected ? <p>Daftar proyek belum terhubung. Tugas tetap dapat dibuat tanpa proyek.</p> : null}
        <FormField label="Tanggal Mulai">
          <input onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} />
        </FormField>
        <FormField label="Tenggat">
          <input onChange={(event) => setDueAt(event.target.value)} type="datetime-local" value={dueAt} />
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
