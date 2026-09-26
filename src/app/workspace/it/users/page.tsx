"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent } from "react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { RolePicker } from "@/workspaces/it/overview/role-picker";
import styles from "@/workspaces/it/overview/user-management.module.css";

type Membership = {
  workspace: { workspace_id: string; workspace_key: string; workspace_name: string; workspace_type?: string };
  role_refs: string[];
  permission_refs: string[];
  scope_refs: string[];
  data_scope: "COMPANY" | "ORGANIZATIONAL_UNIT" | "WORKSPACE" | "PROJECT" | "OWN_ASSIGNED";
};
type Account = { actor_id: string; display_name: string; email: string; active: boolean; workspace_access: Membership[] };
type WorkspaceOption = Membership["workspace"];
type DraftMembership = Membership & { original_workspace_id: string | null };

function displayRole(role: string): string { return role.replaceAll("_", " "); }

export default function ItUsersPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [workspaceOptions, setWorkspaceOptions] = useState<WorkspaceOption[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [draftMemberships, setDraftMemberships] = useState<DraftMembership[]>([]);
  const [draftActive, setDraftActive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [nextAccounts, nextRoles, nextWorkspaces] = await Promise.all([
        authenticatedApiRequest<Account[]>("/api/v1/identity/accounts"),
        authenticatedApiRequest<string[]>("/api/v1/identity/assignable-roles"),
        authenticatedApiRequest<WorkspaceOption[]>("/api/v1/identity/workspaces"),
      ]);
      setAccounts(nextAccounts); setRoleOptions(nextRoles); setWorkspaceOptions(nextWorkspaces);
    } catch (cause) { setError(apiMessage(cause)); } finally { setLoading(false); }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function openEdit(account: Account) {
    setError(""); setEditingAccount(account); setDraftActive(account.active);
    setDraftMemberships(account.workspace_access.map((membership) => ({ ...membership, role_refs: [...membership.role_refs], original_workspace_id: membership.workspace.workspace_id })));
  }
  function updateDraft(index: number, patch: Partial<DraftMembership>) { setDraftMemberships((current) => current.map((membership, itemIndex) => itemIndex === index ? { ...membership, ...patch } : membership)); }
  function selectWorkspace(index: number, event: ChangeEvent<HTMLSelectElement>) {
    const option = workspaceOptions.find((item) => item.workspace_id === event.target.value);
    if (option) updateDraft(index, { workspace: option });
  }

  async function saveAccount() {
    if (!editingAccount) return;
    if (!draftMemberships.length || draftMemberships.some((membership) => !membership.workspace.workspace_id || membership.role_refs.length === 0)) { setError("Setiap akun harus memiliki workspace dan minimal satu role pada setiap membership."); return; }
    if (new Set(draftMemberships.map((membership) => membership.workspace.workspace_id)).size !== draftMemberships.length) { setError("Satu workspace hanya boleh memiliki satu membership per akun."); return; }
    setSaving(true); setError("");
    try {
      const actorPath = `/api/v1/identity/actors/${encodeURIComponent(editingAccount.actor_id)}`;
      const original = editingAccount.workspace_access;
      for (const membership of draftMemberships) {
        const body = { workspace_id: membership.workspace.workspace_id, role_refs: membership.role_refs, permission_refs: membership.permission_refs, scope_refs: membership.scope_refs, data_scope: membership.data_scope };
        if (membership.original_workspace_id && membership.original_workspace_id !== membership.workspace.workspace_id) {
          await authenticatedApiRequest(`${actorPath}/memberships`, { method: "POST", body });
          await authenticatedApiRequest(`${actorPath}/memberships/${encodeURIComponent(membership.original_workspace_id)}`, { method: "DELETE" });
        } else if (membership.original_workspace_id) {
          await authenticatedApiRequest(`${actorPath}/memberships`, { method: "PUT", body });
        } else await authenticatedApiRequest(`${actorPath}/memberships`, { method: "POST", body });
      }
      const retainedIds = new Set(draftMemberships.map((membership) => membership.original_workspace_id).filter(Boolean));
      for (const membership of original) if (!retainedIds.has(membership.workspace.workspace_id)) await authenticatedApiRequest(`${actorPath}/memberships/${encodeURIComponent(membership.workspace.workspace_id)}`, { method: "DELETE" });
      if (draftActive !== editingAccount.active) await authenticatedApiRequest(`${actorPath}/${draftActive ? "activate" : "suspend"}`, { method: "POST" });
      setEditingAccount(null); await load();
    } catch (cause) { setError(apiMessage(cause)); } finally { setSaving(false); }
  }

  return <ProtectedDomainWorkspace activeNavKey="users" deniedTitle="Kelola Akun hanya untuk IT" divisionCodes={["IT", "TECHNOLOGY"]} workspaceKeys={["it", "technology"]} loadingLabel="Memverifikasi otoritas IT…">
    {({ actor }) => {
      const allowed = actor.roles.includes("IT_ADMIN") && actor.permissions?.includes("identity.accounts.manage");
      if (!allowed) return <section className="panel workspace-panel"><h1>Akses Dibatasi</h1><p>Hanya IT Admin dengan izin kelola akun yang dapat membuka halaman ini.</p></section>;
      return <section className={styles.pageShell}>
        <div className={styles.headerRow}><div><p className={styles.eyebrow}>IT · IDENTITY & ACCESS</p><h1 className={styles.title}>Kelola Akun</h1></div><Link className={styles.primaryButton} href="/workspace/it/users/register">+ Register Akun Baru</Link></div>
        <p className={styles.intro}>Kelola informasi akun, membership workspace, role, dan status akses dari satu tempat.</p>
        {error ? <p className={styles.alert} role="alert">{error}</p> : null}
        {loading ? <div className={styles.loadingState}>Memuat akun…</div> : <div className={styles.accountTableWrap}><table className={styles.accountTable}><thead><tr><th>Pengguna</th><th>Email</th><th>Workspace</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{accounts.map((account) => { const first = account.workspace_access[0]; const extraCount = Math.max(0, account.workspace_access.length - 1); return <tr key={account.actor_id}><td><strong>{account.display_name}</strong></td><td>{account.email}</td><td><div className={styles.tableWorkspace}>{first ? first.workspace.workspace_name : "Belum ada"}{extraCount ? <span>+{extraCount} workspace lainnya</span> : null}</div></td><td><div className={styles.tableRoles}>{first?.role_refs.slice(0, 2).map((role) => <span className={styles.roleChip} key={role}>{displayRole(role)}</span>)}{first && first.role_refs.length > 2 ? <span className={styles.moreBadge}>+{first.role_refs.length - 2}</span> : null}</div></td><td><span className={account.active ? styles.statusButtonActive : styles.statusButtonMuted}>{account.active ? "Aktif" : "Nonaktif"}</span></td><td><button className={styles.editButton} type="button" onClick={() => openEdit(account)}>Edit</button></td></tr>; })}</tbody></table></div>}
        {editingAccount ? <div className={styles.drawerBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditingAccount(null); }}><aside aria-labelledby="edit-account-title" aria-modal="true" className={styles.editDrawer} role="dialog"><div className={styles.drawerHeader}><div><p className={styles.eyebrow}>EDIT AKUN</p><h2 id="edit-account-title">{editingAccount.display_name}</h2><p>{editingAccount.email}</p></div><button aria-label="Tutup edit akun" className={styles.closeButton} type="button" onClick={() => setEditingAccount(null)}>×</button></div><div className={styles.drawerBody}><section className={styles.formSection}><h3>Informasi Akun</h3><div className={styles.accountInfoGrid}><label>Nama lengkap<input readOnly value={editingAccount.display_name} /></label><label>Email<input readOnly value={editingAccount.email} /></label><label>Status<select value={draftActive ? "active" : "inactive"} onChange={(event) => setDraftActive(event.target.value === "active")}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></label></div></section><section className={styles.formSection}><div className={styles.sectionHeading}><div><h3>Workspace & Role</h3><p>Role dan workspace mengikuti otorisasi Backend.</p></div><button className={styles.secondaryButton} type="button" onClick={() => setDraftMemberships((current) => [...current, { workspace: { workspace_id: "", workspace_key: "", workspace_name: "Pilih workspace" }, role_refs: roleOptions.length ? [roleOptions[0]] : [], permission_refs: [], scope_refs: [], data_scope: "OWN_ASSIGNED", original_workspace_id: null }])}>+ Tambah Workspace</button></div><div className={styles.editMembershipList}>{draftMemberships.map((membership, index) => <div className={styles.editMembershipCard} key={`${membership.original_workspace_id ?? "new"}-${index}`}><div className={styles.membershipCardHeader}><label>Workspace<select value={membership.workspace.workspace_id} onChange={(event) => selectWorkspace(index, event)}><option value="">Pilih workspace</option>{workspaceOptions.map((item) => <option key={item.workspace_id} value={item.workspace_id}>{item.workspace_name}</option>)}</select></label><button aria-label="Hapus membership" className={styles.removeMembership} type="button" onClick={() => setDraftMemberships((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Hapus</button></div><div><span className={styles.formLabel}>Role</span><RolePicker options={roleOptions} selected={membership.role_refs} onChange={(roles) => updateDraft(index, { role_refs: roles })} /></div></div>)}</div></section></div><div className={styles.drawerFooter}><button className={styles.cancelButton} disabled={saving} type="button" onClick={() => setEditingAccount(null)}>Batal</button><button className={styles.saveButton} disabled={saving} type="button" onClick={() => void saveAccount()}>{saving ? "Menyimpan…" : "Simpan Perubahan"}</button></div></aside></div> : null}
      </section>;
    }}
  </ProtectedDomainWorkspace>;
}
