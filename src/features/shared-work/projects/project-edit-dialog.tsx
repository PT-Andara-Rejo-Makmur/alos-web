"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { projectMutationMessage, updateProject } from "./project-model";
import { ProjectOwnerField, type ProjectOwnerSelection } from "./project-owner-field";
import type { WorkProject } from "./project-types";
import styles from "./projects.module.css";

interface ProjectEditDialogProps {
  readonly project: WorkProject;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSaved: (project: WorkProject) => void;
  readonly workspaceId: string | null;
}

export function ProjectEditDialog({ project, open, onClose, onSaved, workspaceId }: ProjectEditDialogProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [targetEndDate, setTargetEndDate] = useState(project.targetEndDate ?? "");
  const [owner, setOwner] = useState<ProjectOwnerSelection | null>(project.ownerActorId
    ? { actorId: project.ownerActorId, name: project.ownerName || "Belum ditentukan" }
    : null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ownerChanged = (owner?.actorId ?? null) !== project.ownerActorId;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const saved = await updateProject(project.id, {
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate || null,
        target_end_date: targetEndDate || null,
        // Omission preserves an existing assignment, including an inactive owner.
        ...(ownerChanged ? { owner_actor_id: owner?.actorId ?? null } : {}),
      });
      onSaved(saved);
      onClose();
    } catch (caught) {
      setError(projectMutationMessage(caught, ownerChanged && Boolean(owner)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Ubah Proyek">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Nama Proyek" required>
          <input maxLength={300} onChange={(event) => setName(event.target.value)} required value={name} />
        </FormField>
        <FormField label="Deskripsi">
          <textarea onChange={(event) => setDescription(event.target.value)} value={description} />
        </FormField>
        <ProjectOwnerField workspaceId={workspaceId} value={owner} onChange={setOwner} disabled={submitting} />
        <FormField label="Tanggal Mulai">
          <input onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} />
        </FormField>
        <FormField label="Target Selesai">
          <input onChange={(event) => setTargetEndDate(event.target.value)} type="date" value={targetEndDate} />
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
