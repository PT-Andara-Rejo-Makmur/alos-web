"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";

import { assignTask } from "./task-model";
import type { WorkTask } from "./task-types";
import styles from "./tasks.module.css";

interface TaskAssignDialogProps {
  readonly task: WorkTask;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onAssigned: (task: WorkTask) => void;
}

export function TaskAssignDialog({ task, open, onClose, onAssigned }: TaskAssignDialogProps) {
  const [actorId, setActorId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const assigned = await assignTask(task.id, { owner_actor_id: actorId.trim() });
      onAssigned(assigned);
      setActorId("");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tugaskan kepada Actor">
      <form className={styles.createForm} onSubmit={submit}>
        <p>Gunakan ID actor resmi. Backend memeriksa membership aktif dalam ruang kerja ini.</p>
        <FormField label="ID Actor Tujuan" required>
          <input maxLength={128} onChange={(event) => setActorId(event.target.value)} required value={actorId} />
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={submitting} type="submit">Simpan Penugasan</Button>
        </div>
      </form>
    </Dialog>
  );
}
