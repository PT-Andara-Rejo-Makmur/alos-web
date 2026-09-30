"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkFindingSeverity, SharedWorkFindingUpdateRequest } from "@/lib/contracts";

import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";
import { fetchTasks } from "../tasks/task-model";
import type { WorkTask } from "../tasks/task-types";
import { updateFinding } from "./finding-model";
import type { WorkFinding } from "./finding-types";
import styles from "./findings.module.css";

interface FindingEditDialogProps {
  readonly finding: WorkFinding;
  readonly onClose: () => void;
  readonly onSaved: (finding: WorkFinding) => void;
  readonly open: boolean;
}

export function FindingEditDialog({ finding, onClose, onSaved, open }: FindingEditDialogProps) {
  const [title, setTitle] = useState(finding.title);
  const [description, setDescription] = useState(finding.description ?? "");
  const [severity, setSeverity] = useState<SharedWorkFindingSeverity>(finding.severity as SharedWorkFindingSeverity);
  const [category, setCategory] = useState(finding.category ?? "");
  const [projectId, setProjectId] = useState(finding.projectId ?? "");
  const [dueDate, setDueDate] = useState(finding.dueDate ?? "");
  const [impact, setImpact] = useState(finding.impact ?? "");
  const [rootCause, setRootCause] = useState(finding.rootCause ?? "");
  const [correctiveTaskId, setCorrectiveTaskId] = useState(finding.correctiveActionTaskId ?? "");
  const [projects, setProjects] = useState<readonly WorkProject[]>([]);
  const [tasks, setTasks] = useState<readonly WorkTask[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void Promise.all([fetchProjects(), fetchTasks()]).then(([projectResult, taskResult]) => {
      if (cancelled) return;
      if (projectResult.connected) setProjects(projectResult.data);
      else setError(projectResult.message ?? "Gagal memuat proyek.");
      if (taskResult.connected) setTasks(taskResult.data);
      else setError(taskResult.message ?? "Gagal memuat tugas.");
    });
    return () => { cancelled = true; };
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (projectId && projectId !== finding.projectId && !projects.some((project) => project.id === projectId)) {
      setError("Proyek tidak tersedia pada ruang kerja aktif.");
      return;
    }
    if (correctiveTaskId && correctiveTaskId !== finding.correctiveActionTaskId && !tasks.some((task) => task.id === correctiveTaskId)) {
      setError("Tugas tidak tersedia pada ruang kerja aktif.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const request: SharedWorkFindingUpdateRequest = {
        title: title.trim(), description: description.trim() || null, severity,
        category: category.trim() || null, project_id: projectId || null,
        due_date: dueDate || null, impact: impact.trim() || null,
        root_cause: rootCause.trim() || null,
        corrective_action_task_id: correctiveTaskId || null,
      };
      onSaved(await updateFinding(finding.id, request));
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Ubah Temuan">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Judul Temuan" required><input maxLength={500} onChange={(event) => setTitle(event.target.value)} required value={title} /></FormField>
        <FormField label="Deskripsi"><textarea onChange={(event) => setDescription(event.target.value)} value={description} /></FormField>
        <FormField label="Tingkat Keparahan" required><select onChange={(event) => setSeverity(event.target.value as SharedWorkFindingSeverity)} value={severity}>
          <option value="LOW">Rendah</option><option value="MEDIUM">Sedang</option><option value="HIGH">Tinggi</option><option value="CRITICAL">Kritis</option>
        </select></FormField>
        <FormField label="Kategori"><input onChange={(event) => setCategory(event.target.value)} value={category} /></FormField>
        <FormField label="Proyek"><select onChange={(event) => { setProjectId(event.target.value); setCorrectiveTaskId(""); }} value={projectId}>
          <option value="">Tanpa proyek</option>
          {finding.projectId && !projects.some((project) => project.id === finding.projectId) ? (
            <option value={finding.projectId}>{finding.projectName ?? "Proyek saat ini"}</option>
          ) : null}
          {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
        </select></FormField>
        <FormField label="Batas Waktu"><input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></FormField>
        <FormField label="Dampak"><textarea onChange={(event) => setImpact(event.target.value)} value={impact} /></FormField>
        <FormField label="Akar Masalah"><textarea onChange={(event) => setRootCause(event.target.value)} value={rootCause} /></FormField>
        <FormField label="Tugas Tindak Lanjut"><select onChange={(event) => setCorrectiveTaskId(event.target.value)} value={correctiveTaskId}>
          <option value="">Tanpa tugas</option>
          {finding.correctiveActionTaskId && !tasks.some((task) => task.id === finding.correctiveActionTaskId) ? (
            <option value={finding.correctiveActionTaskId}>{finding.correctiveActionTaskTitle ?? "Tugas saat ini"}</option>
          ) : null}
          {tasks.filter((task) => !projectId || task.projectId === projectId).map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
        </select></FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={submitting} type="submit">Simpan Perubahan</Button>
        </div>
      </form>
    </Dialog>
  );
}
