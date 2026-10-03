"use client";

import { useState, type FormEvent } from "react";

import { Dialog, FormField, FormJourney } from "@/components/ui";
import { createProject, projectMutationMessage } from "./project-model";
import { ProjectOwnerField, type ProjectOwnerSelection } from "./project-owner-field";
import type { WorkProject } from "./project-types";
import workStyles from "@/components/ui/work-surface.module.css";

interface ProjectCreateDialogProps {
  readonly onClose: () => void;
  readonly onCreated: (project: WorkProject) => void;
  readonly open: boolean;
  readonly workspaceId: string | null;
  readonly workspaceName: string | null;
  readonly creator: ProjectOwnerSelection | null;
}

export function ProjectCreateDialog({ onClose, onCreated, open, workspaceId, workspaceName, creator }: ProjectCreateDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "CRITICAL">("NORMAL");
  const [owner, setOwner] = useState<ProjectOwnerSelection | null>(creator);
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
        ...(owner ? { owner_actor_id: owner.actorId } : {}),
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
      setOwner(creator);
      setStartDate("");
      setTargetEndDate("");
      onClose();
    } catch (caught) {
      setError(projectMutationMessage(caught, Boolean(owner)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tambah Proyek">
      <FormJourney onSubmit={submit} onCancel={onClose} busy={submitting} submitLabel="Simpan Proyek" feedback={error ? <p role="alert">{error}</p> : null} steps={[
        { title: "Identitas", content: <>
          <FormField label="Kode Proyek" required><input maxLength={128} value={code} onChange={event => setCode(event.target.value)} required /></FormField>
          <FormField label="Nama Proyek" required><input maxLength={300} value={name} onChange={event => setName(event.target.value)} required /></FormField>
          <FormField label="Tujuan Proyek" required><textarea maxLength={4000} value={objective} onChange={event => setObjective(event.target.value)} required /></FormField>
          <FormField label="Deskripsi"><textarea value={description} onChange={event => setDescription(event.target.value)} /></FormField>
        </> },
        { title: "Tanggung Jawab", content: <>
          <dl className={workStyles.facts}><div><dt>Ruang Kerja</dt><dd>{workspaceName || "Belum tersedia"}</dd></div></dl>
          <ProjectOwnerField workspaceId={workspaceId} value={owner} onChange={setOwner} disabled={submitting} creator={creator} />
          <FormField label="Prioritas"><select value={priority} onChange={event => setPriority(event.target.value as typeof priority)}><option value="LOW">Rendah</option><option value="NORMAL">Normal</option><option value="HIGH">Tinggi</option><option value="CRITICAL">Mendesak</option></select></FormField>
        </> },
        { title: "Rencana", content: <>
          <FormField label="Tanggal Mulai"><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></FormField>
          <FormField label="Target Selesai"><input type="date" min={startDate || undefined} value={targetEndDate} onChange={event => setTargetEndDate(event.target.value)} /></FormField>
        </> },
        { title: "Tinjau", content: <dl className={workStyles.facts}><div><dt>Proyek</dt><dd>{code} · {name}</dd></div><div><dt>Tujuan</dt><dd>{objective}</dd></div><div><dt>Penanggung Jawab</dt><dd>{owner?.name || "Pembuat proyek (Anda)"}</dd></div><div><dt>Rencana</dt><dd>{startDate || "Belum ditentukan"} → {targetEndDate || "Belum ditentukan"}</dd></div></dl> },
      ]} />
    </Dialog>
  );
}
