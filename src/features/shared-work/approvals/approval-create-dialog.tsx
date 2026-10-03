"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, EntitySelect, FormField, FormSection } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkApprovalSubjectType } from "@/lib/contracts";

import { fetchProjects } from "../projects/project-model";
import type { WorkProject } from "../projects/project-types";
import { fetchTasks } from "../tasks/task-model";
import type { WorkTask } from "../tasks/task-types";
import { createApproval } from "./approval-model";
import type { WorkApproval } from "./approval-types";
import styles from "./approvals.module.css";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: (approval: WorkApproval) => void;
}

export function ApprovalCreateDialog({ open, onClose, onCreated }: Props) {
  const [subjectType, setSubjectType] = useState<SharedWorkApprovalSubjectType>("PROJECT");
  const [subjectId, setSubjectId] = useState("");
  const [reason, setReason] = useState("");
  const [materialityValue, setMaterialityValue] = useState("");
  const [projects, setProjects] = useState<readonly WorkProject[]>([]);
  const [tasks, setTasks] = useState<readonly WorkTask[]>([]);
  const [projectsConnected, setProjectsConnected] = useState(false);
  const [tasksConnected, setTasksConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void Promise.all([fetchProjects(), fetchTasks()]).then(([projectResponse, taskResponse]) => {
      if (cancelled) return;
      setProjects(projectResponse.data);
      setTasks(taskResponse.data);
      setProjectsConnected(projectResponse.connected);
      setTasksConnected(taskResponse.connected);
    });
    return () => { cancelled = true; };
  }, [open]);

  const choices = subjectType === "PROJECT"
    ? projects.map((project) => ({ id: project.id, label: `${project.code} — ${project.name}` }))
    : tasks.map((task) => ({ id: task.id, label: task.title }));
  const connected = subjectType === "PROJECT" ? projectsConnected : tasksConnected;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (!choices.some((choice) => choice.id === subjectId)) {
      setError("Objek tidak tersedia pada ruang kerja aktif.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const created = await createApproval({
        subject_type: subjectType,
        subject_id: subjectId,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
        ...(materialityValue.trim() ? { materiality_value: Number(materialityValue) } : {}),
      });
      onCreated(created);
      setSubjectId("");
      setReason("");
      setMaterialityValue("");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Ajukan Persetujuan">
      <form className={styles.createForm} onSubmit={submit}>
<FormSection title="Pengajuan"><FormField label="Jenis Objek" required>
          <select onChange={(event) => { setSubjectType(event.target.value as SharedWorkApprovalSubjectType); setSubjectId(""); }} value={subjectType}>
            <option value="PROJECT">Proyek</option>
            <option value="TASK">Tugas</option>
          </select>
        </FormField>
<FormField label="Objek" required>
          <EntitySelect label="Pengajuan" value={subjectId} required options={choices.map(choice => ({value:choice.id,label:choice.label}))} emptyLabel="Pilih pengajuan" onChange={setSubjectId} />
        </FormField></FormSection>
<FormSection title="Dasar Keputusan"><FormField label="Nilai Pengajuan">
          <input min="0" onChange={(event) => setMaterialityValue(event.target.value)} step="0.01" type="number" value={materialityValue} />
        </FormField></FormSection>
<FormSection title="Informasi Tambahan"><FormField label="Alasan Permintaan">
          <textarea onChange={(event) => setReason(event.target.value)} value={reason} />
        </FormField></FormSection>{!connected ? <p>Daftar objek belum terhubung.</p> : null}
{error ? <p role="alert">{error}</p> : null}
<div className={styles.drawerFooterActions}>
          <Button onClick={onClose} variant="secondary">Batal</Button>
          <Button disabled={!connected || loading} loading={loading} type="submit">Ajukan</Button>
        </div>
</form>
    </Dialog>
  );
}
