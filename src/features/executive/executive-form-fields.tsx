"use client";

import type { SessionProjection } from "@/features/session";
import { EntitySelect } from "@/components/ui";
import { roleLabel } from "@/lib/presentation";

import styles from "./executive.module.css";

export interface ExecutiveWorkspaceOption {
  readonly workspaceId: string;
  readonly workspaceName: string;
}

export function executiveWorkspaceOptions(session: SessionProjection): readonly ExecutiveWorkspaceOption[] {
  const principal = session.principal;
  if (!session.authenticated || !principal || !("actor" in principal)) return [];

  const accesses = [
    ...(principal.active_workspace ? [principal.active_workspace] : []),
    ...principal.workspace_access,
  ];
  const seen = new Set<string>();

  return accesses.flatMap((access) => {
    const workspace = access.workspace;
    if (!access.active || !workspace.active || seen.has(workspace.workspace_id)) return [];
    seen.add(workspace.workspace_id);
    return [{ workspaceId: workspace.workspace_id, workspaceName: workspace.workspace_name }];
  });
}

export function activeExecutiveWorkspaceId(session: SessionProjection): string {
  return executiveWorkspaceOptions(session)[0]?.workspaceId ?? "";
}

export function ExecutiveWorkspacePicker({
  id,
  label = "Ruang Kerja Penanggung Jawab",
  onChange,
  required = true,
  session,
  value,
}: Readonly<{
  readonly id: string;
  readonly label?: string;
  readonly onChange: (workspaceId: string) => void;
  readonly required?: boolean;
  readonly session: SessionProjection;
  readonly value: string;
}>) {
  const options = executiveWorkspaceOptions(session);

  return (
    <>
      <label htmlFor={id}>{label}{required ? " *" : ""}</label>
      <select
        className={styles.formSelect}
        disabled={options.length === 0}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required && options.length > 0}
        value={value}
      >
        {options.length === 0 ? (
          <option value="">Pilihan ruang kerja belum tersedia.</option>
        ) : (
          <>
            <option value="">Pilih ruang kerja</option>
            {options.map((option) => (
              <option key={option.workspaceId} value={option.workspaceId}>
                {option.workspaceName}
              </option>
            ))}
          </>
        )}
      </select>
      {options.length === 0 ? (
        <p role="status" style={{ color: "var(--alos-text-secondary)", fontSize: "12px", margin: 0 }}>
          Pilihan ruang kerja belum tersedia.
        </p>
      ) : null}
    </>
  );
}

export function ExecutiveRolePicker({ id, session, workspaceId, value, onChange }: Readonly<{id:string;session:SessionProjection;workspaceId:string;value:string;onChange:(value:string)=>void}>) {
  const principal=session.principal && "actor" in session.principal ? session.principal : null;
  const access=[...(principal?.active_workspace ? [principal.active_workspace] : []), ...(principal?.workspace_access ?? [])].find(item=>item.active && item.workspace.active && item.workspace.workspace_id===workspaceId);
  const options=(access?.role_refs ?? []).map(role=>({value:role,label:roleLabel(role)}));
  return <><label htmlFor={id}>Jabatan Penanggung Jawab *</label><EntitySelect id={id} label="jabatan penanggung jawab" required value={value} options={options} onChange={onChange} emptyLabel="Pilih jabatan" />{!options.length ? <p role="status">Pilihan jabatan belum tersedia untuk ruang kerja ini.</p> : null}</>;
}
