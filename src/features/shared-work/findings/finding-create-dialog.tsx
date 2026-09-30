"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkFindingSeverity } from "@/lib/contracts";
import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";
import { fetchTasks } from "../tasks/task-model";
import type { WorkTask } from "../tasks/task-types";

import { createFinding } from "./finding-model";
import type { WorkFinding } from "./finding-types";
import styles from "./findings.module.css";

interface FindingCreateDialogProps {
  readonly onClose: () => void;
  readonly onCreated: (finding: WorkFinding) => void;
  readonly open: boolean;
}

export function FindingCreateDialog({ onClose, onCreated, open }: FindingCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<SharedWorkFindingSeverity>("MEDIUM");
  const [category, setCategory] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [impact, setImpact] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [correctiveTaskId, setCorrectiveTaskId] = useState("");
  const [projects, setProjects] = useState<readonly WorkProject[]>([]);
  const [tasks, setTasks] = useState<readonly WorkTask[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void Promise.all([fetchProjects(), fetchTasks()]).then(([projectResult, taskResult]) => {
      if (projectResult.connected) setProjects(projectResult.data);
      else setError(projectResult.message ?? "Gagal memuat proyek.");
      if (taskResult.connected) setTasks(taskResult.data);
      else setError(taskResult.message ?? "Gagal memuat tugas.");
    });
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await createFinding({
        title: title.trim(),
        severity,
        ...(description.trim() ? { description: description.trim() } : {}),
        category: category.trim() || null,
        project_id: projectId || null,
        due_date: dueDate || null,
        impact: impact.trim() || null,
        root_cause: rootCause.trim() || null,
        corrective_action_task_id: correctiveTaskId || null,
      });
      if (!response.connected || !response.data) {
        setError(response.message || "Gagal membuat temuan.");
        return;
      }
      onCreated(response.data);
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      setCategory(""); setProjectId(""); setDueDate(""); setImpact("");
      setRootCause(""); setCorrectiveTaskId("");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tambah Temuan">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Judul Temuan" required>
          <input
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Masukkan judul temuan"
            required
            value={title}
          />
        </FormField>
        <FormField label="Deskripsi">
          <textarea
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Keterangan detail mengenai temuan (opsional)"
            rows={4}
            value={description}
          />
        </FormField>
        <FormField label="Tingkat Keparahan (Severity)" required>
          <select
            onChange={(event) => setSeverity(event.target.value as SharedWorkFindingSeverity)}
            value={severity}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </FormField>
        <FormField label="Kategori"><input onChange={(event) => setCategory(event.target.value)} value={category} /></FormField>
        <FormField label="Proyek"><select onChange={(event) => { setProjectId(event.target.value); setCorrectiveTaskId(""); }} value={projectId}>
          <option value="">Tanpa proyek</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
        </select></FormField>
        <FormField label="Batas Waktu"><input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></FormField>
        <FormField label="Dampak"><textarea onChange={(event) => setImpact(event.target.value)} value={impact} /></FormField>
        <FormField label="Akar Masalah"><textarea onChange={(event) => setRootCause(event.target.value)} value={rootCause} /></FormField>
        <FormField label="Tugas Tindak Lanjut"><select onChange={(event) => setCorrectiveTaskId(event.target.value)} value={correctiveTaskId}>
          <option value="">Tanpa tugas</option>
          {tasks.filter((task) => !projectId || task.projectId === projectId).map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
        </select></FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">
            Batal
          </Button>
          <Button loading={submitting} type="submit">
            Simpan Temuan
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
