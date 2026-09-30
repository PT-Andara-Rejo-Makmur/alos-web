"use client";

import { useState, type FormEvent } from "react";

import { Button, Dialog, FormField } from "@/components/ui";
import { apiMessage } from "@/lib/api";

import { createProject } from "./project-model";
import type { WorkProject } from "./project-types";
import styles from "./projects.module.css";

interface ProjectCreateDialogProps {
  readonly onClose: () => void;
  readonly onCreated: (project: WorkProject) => void;
  readonly open: boolean;
}

export function ProjectCreateDialog({ onClose, onCreated, open }: ProjectCreateDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      onCreated(created);
      setCode("");
      setName("");
      setDescription("");
      onClose();
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onClose={onClose} open={open} title="Tambah Proyek">
      <form className={styles.createForm} onSubmit={submit}>
        <FormField label="Kode Proyek" required>
          <input maxLength={128} onChange={(event) => setCode(event.target.value)} required value={code} />
        </FormField>
        <FormField label="Nama Proyek" required>
          <input maxLength={300} onChange={(event) => setName(event.target.value)} required value={name} />
        </FormField>
        <FormField label="Deskripsi">
          <textarea onChange={(event) => setDescription(event.target.value)} value={description} />
        </FormField>
        {error ? <p role="alert">{error}</p> : null}
        <div className={styles.createActions}>
          <Button disabled={submitting} onClick={onClose} variant="secondary">Batal</Button>
          <Button loading={submitting} type="submit">Simpan Proyek</Button>
        </div>
      </form>
    </Dialog>
  );
}
