"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkTaskPriority, SharedWorkTaskUpdateRequest } from "@/lib/contracts";

import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";
import { updateTask } from "./task-model";
import type { WorkTask } from "./task-types";
import styles from "./tasks.module.css";

interface TaskEditDialogProps {
  readonly task: WorkTask;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSaved: (task: WorkTask) => void;
}

function localDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function TaskEditDialog({ task, open, onClose, onSaved }: TaskEditDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<SharedWorkTaskPriority>(task.priority as SharedWorkTaskPriority);
  const [dueAt, setDueAt] = useState(localDateTime(task.dueAt));
  const [startDate, setStartDate] = useState(task.startDate ?? "");
  const [projectId, setProjectId] = useState(task.projectId ?? "");
  const [projectChanged, setProjectChanged] = useState(false);
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
    if (projectChanged && projectId && !projects.some((project) => project.id === projectId)) {
      setError("Proyek yang dipilih tidak tersedia pada ruang kerja aktif.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const request: SharedWorkTaskUpdateRequest = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        start_date: startDate || null,
        ...(projectChanged ? { project_id: projectId || null } : {}),
      };
      const saved = await updateTask(task.id, request);
      onSaved(saved);
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Ubah Tugas">
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
          <select onChange={(event) => { setProjectId(event.target.value); setProjectChanged(true); }} value={projectId}>
            <option value="">Tanpa proyek</option>
            {task.projectId && !projects.some((project) => project.id === task.projectId) ? (
              <option disabled value={task.projectId}>Proyek saat ini tidak tersedia</option>
            ) : null}
            {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
          </select>
        </FormField>
        {!projectsConnected ? <p>Daftar proyek belum terhubung. Relasi proyek saat ini tidak diubah.</p> : null}
        <FormField label="Tanggal Mulai">
          <input onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} />
        </FormField>
        <FormField label="Tenggat">
          <input onChange={(event) => setDueAt(event.target.value)} type="datetime-local" value={dueAt} />
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={submitting} type="submit">Simpan Perubahan</Button>
        </div>
      </form>
    </Dialog>
  );
}
