"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";

import { fetchWorkspaceMembers, type WorkspaceMember } from "../shared/workspace-members";
import { assignFinding } from "./finding-model";
import type { WorkFinding } from "./finding-types";
import styles from "./findings.module.css";

interface FindingAssignDialogProps {
  readonly finding: WorkFinding;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onAssigned: (finding: WorkFinding) => void;
}

export function FindingAssignDialog({ finding, open, onClose, onAssigned }: FindingAssignDialogProps) {
  const [members, setMembers] = useState<readonly WorkspaceMember[]>([]);
  const [actorId, setActorId] = useState("");
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
      if (!cancelled) setMembers(items.filter((item) => item.finding_assignable));
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
      onAssigned(await assignFinding(finding.id, actorId));
      setActorId("");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tugaskan Temuan">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Anggota Tujuan" required>
          <select disabled={loading} onChange={(event) => setActorId(event.target.value)} required value={actorId}>
            <option value="">{loading ? "Memuat anggota…" : "Pilih anggota"}</option>
            {members.map((member) => (
              <option key={member.actor_id} value={member.actor_id}>
                {member.display_name}{member.position_title ? ` — ${member.position_title}` : ""}
              </option>
            ))}
          </select>
        </FormField>
        {!loading && members.length === 0 ? <p>Belum ada anggota yang dapat menerima temuan.</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button onClick={onClose} variant="secondary">Batal</Button>
          <Button disabled={!actorId || loading} loading={submitting} type="submit">Simpan Penugasan</Button>
        </div>
      </form>
    </Dialog>
  );
}
