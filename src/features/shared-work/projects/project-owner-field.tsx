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
  readonly creator?: ProjectOwnerSelection | null;
}

export function ProjectOwnerField({ workspaceId, value, onChange, disabled, creator }: ProjectOwnerFieldProps) {
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
          setMembers(response.filter(member => member?.active === true && member.project_assignable === true
            && member.workspace_id === workspaceId
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

  const creating = creator !== undefined;
  const options = members.map(member => ({
    value: member.actor_id,
    label: [member.display_name, member.position_title, member.actor_id === creator?.actorId ? "Anda" : null].filter(Boolean).join(" · "),
  }));
  const unavailableSelection = value && !members.some(member => member.actor_id === value.actorId);
  if (unavailableSelection) {
    options.unshift({
      value: value.actorId,
      label: `${value.name || "Belum ditentukan"}${value.actorId === creator?.actorId ? " · Anda" : ""}`,
    });
  }

  return <>
    <FormField label="Penanggung Jawab" error={error} description={
      creating
        ? error
          ? "Jika melanjutkan tanpa memilih pengganti, pembuat proyek tetap menjadi penanggung jawab."
          : "Pembuat proyek menjadi penanggung jawab secara default. Pilih anggota lain untuk menggantinya."
        : !loading && !error && unavailableSelection
          ? "Penanggung jawab tersimpan tidak ada dalam daftar anggota yang dapat dipilih. Pilihan tetap dipertahankan sampai Anda menggantinya."
          : "Pilih anggota ruang kerja yang dapat menjadi penanggung jawab proyek."
    }>
      <EntitySelect
        label="Penanggung Jawab"
        value={value?.actorId ?? ""}
        options={options}
        emptyLabel={creating ? "Pembuat proyek (Anda)" : "Belum ditentukan"}
        disabled={disabled || loading || Boolean(error) || (members.length === 0 && (!creator || value?.actorId === creator.actorId))}
        onChange={actorId => {
          if (!actorId) { onChange(creator ?? null); return; }
          const member = members.find(member => member.actor_id === actorId);
          if (member) onChange({ actorId: member.actor_id, name: member.display_name });
        }}
      />
    </FormField>
    {loading ? <p role="status">Memuat daftar penanggung jawab…</p> : null}
    {!loading && !error && members.length === 0 ? <p role="status">{creating
      ? "Belum ada anggota lain yang dapat dipilih. Penanggung jawab bawaan adalah pembuat proyek."
      : "Belum ada anggota yang dapat menjadi penanggung jawab di ruang kerja ini."}</p> : null}
    {error ? <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => setAttempt(current => current + 1)}>Coba lagi</Button> : null}
  </>;
}
