"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, EntitySelect, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import { fetchWorkspaceMembers, type WorkspaceMember } from "../shared/workspace-members";

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
  const [members, setMembers] = useState<readonly WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) { setLoading(true); setError(null); }
      return fetchWorkspaceMembers();
    }).then((items) => {
      if (!cancelled) setMembers(items.filter((member) => member.task_assignable));
    }).catch((caught) => {
      if (!cancelled) setError(apiMessage(caught));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !members.some((member) => member.actor_id === actorId)) return;
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
    <Dialog onClose={onClose} open={open} title="Tugaskan kepada Anggota Ruang Kerja">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Anggota Tujuan" required>
          <EntitySelect label="Anggota" disabled={loading} required value={actorId} onChange={setActorId} emptyLabel={loading ? "Memuat anggota…" : "Pilih anggota"} options={members.map(member => ({value:member.actor_id,label:member.display_name + (member.position_title ? " — " + member.position_title : "")}))} />
        </FormField>
        {!loading && members.length === 0 ? <p>Belum ada anggota yang dapat menerima tugas.</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Batal</Button>
          <Button disabled={!actorId || loading} loading={submitting} type="submit">Simpan Penugasan</Button>
        </div>
      </form>
    </Dialog>
  );
}
