"use client";

import { useEffect, useState } from "react";

import { Button, EntitySelect, FormField } from "@/components/ui";

import { fetchWorkspaceMembers, type WorkspaceMember } from "../shared/workspace-members";

export interface ProjectOwnerSelection {
  readonly actorId: string;
  readonly name: string;
}

interface ProjectOwnerFieldProps {
  readonly workspaceId: string | null;
  readonly value: ProjectOwnerSelection | null;
  readonly onChange: (value: ProjectOwnerSelection | null) => void;
  readonly disabled?: boolean;
}

export function ProjectOwnerField({ workspaceId, value, onChange, disabled }: ProjectOwnerFieldProps) {
  const [members, setMembers] = useState<readonly WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadMembers() {
      setLoading(true);
      setError(null);
      setMembers([]);
      try {
        if (!workspaceId) throw new Error("Missing workspace context");
        const response = await fetchWorkspaceMembers();
        if (!Array.isArray(response)) throw new Error("Invalid member response");
        if (!cancelled) {
          // The directory is scoped by the Backend session. Do not infer Project
          // assignment permissions from task/finding flags or role names.
          setMembers(response.filter(member => member?.active === true && member.workspace_id === workspaceId
            && typeof member.actor_id === "string" && Boolean(member.actor_id)
            && typeof member.display_name === "string" && Boolean(member.display_name.trim())));
        }
      } catch {
        if (!cancelled) setError("Daftar penanggung jawab belum dapat dimuat. Coba lagi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadMembers();
    return () => { cancelled = true; };
  }, [workspaceId, attempt]);

  const options = members.map(member => ({
    value: member.actor_id,
    label: member.position_title ? `${member.display_name} · ${member.position_title}` : member.display_name,
  }));
  const unavailableSelection = value && !members.some(member => member.actor_id === value.actorId);
  if (unavailableSelection) {
    options.unshift({
      value: value.actorId,
      label: value.name || "Belum ditentukan",
    });
  }

  return <>
    <FormField label="Penanggung Jawab" error={error} description={
      !loading && !error && unavailableSelection
        ? "Penanggung jawab tersimpan tidak tersedia dalam daftar anggota aktif. Pilihan tetap dipertahankan sampai Anda menggantinya."
        : "Pilih anggota aktif dari ruang kerja ini."
    }>
      <EntitySelect
        label="Penanggung Jawab"
        value={value?.actorId ?? ""}
        options={options}
        emptyLabel="Belum ditentukan"
        disabled={disabled || loading || Boolean(error) || members.length === 0}
        onChange={actorId => {
          if (!actorId) { onChange(null); return; }
          const member = members.find(member => member.actor_id === actorId);
          if (member) onChange({ actorId: member.actor_id, name: member.display_name });
        }}
      />
    </FormField>
    {loading ? <p role="status">Memuat daftar penanggung jawab…</p> : null}
    {!loading && !error && members.length === 0 ? <p role="status">Belum ada anggota aktif yang tersedia di ruang kerja ini.</p> : null}
    {error ? <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => setAttempt(current => current + 1)}>Coba lagi</Button> : null}
  </>;
}
