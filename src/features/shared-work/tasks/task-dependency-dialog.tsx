"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";

import { addTaskDependency, fetchTasks, removeTaskDependency } from "./task-model";
import type { WorkTask } from "./task-types";
import styles from "./tasks.module.css";

interface Props {
  readonly task: WorkTask;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onChanged: (task: WorkTask) => void;
}

export function TaskDependencyDialog({ task, open, onClose, onChanged }: Props) {
  const [candidateId, setCandidateId] = useState("");
  const [candidates, setCandidates] = useState<readonly WorkTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void Promise.resolve().then(async () => {
      setLoading(true);
      setError(null);
      const result = await fetchTasks();
      if (!result.connected) throw new Error(result.message ?? "Daftar tugas tidak dapat dimuat.");
      return result.data;
    }).then((items) => {
      if (!cancelled) setCandidates(items.filter((item) => item.id !== task.id));
    }).catch((caught) => {
      if (!cancelled) setError(apiMessage(caught));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, task.id]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !candidates.some((item) => item.id === candidateId)) return;
    setSubmitting(true);
    setError(null);
    try {
      onChanged(await addTaskDependency(task.id, candidateId));
      setCandidateId("");
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(blockedByTaskId: string) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      onChanged(await removeTaskDependency(task.id, blockedByTaskId));
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Ketergantungan Tugas">
      <form className={styles.createForm} onSubmit={add}>
        <FormField label="Tugas Penghambat" required>
          <select disabled={loading} onChange={(event) => setCandidateId(event.target.value)} required value={candidateId}>
            <option value="">{loading ? "Memuat tugas…" : "Pilih tugas"}</option>
            {candidates.filter((item) => !task.blockedBy?.includes(item.id)).map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Tutup</Button>
          <Button disabled={!candidateId || loading} loading={submitting} type="submit">Tambahkan</Button>
        </div>
      </form>
      {task.blockedBy?.map((id, index) => (
        <div className={styles.dependencyItem} key={id}>
          <span>{task.blockedByTitles?.[index] ?? id}</span>
          <Button disabled={submitting} onClick={() => void remove(id)} variant="secondary">Lepas</Button>
        </div>
      ))}
    </Dialog>
  );
}
