"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";
import type { SharedWorkFindingSeverity } from "@/lib/contracts";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      });
      if (!response.connected || !response.data) {
        setError(response.message || "Gagal membuat temuan.");
        return;
      }
      onCreated(response.data);
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
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
