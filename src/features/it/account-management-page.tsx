"use client";

import { AlertCircle, Plus, UserRound, Users, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { navigationForItWorkspace } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Alert, Button, DataTable, Dialog as UiDialog, Drawer, EmptyState, FormField, LoadingState, PageHeader, Status, Toolbar, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { AuthorizationRole, IdentityAccountProjection, WorkspaceProjection } from "@/lib/contracts";
import { ApiError, sessionApiRequest } from "@/lib/api";
import { resolveWorkspaceDomain } from "@/features/session";

import { listAssignableRoles, listIdentityAccounts, listIdentityWorkspaces, revokeAccountMembership, setAccountActive } from "./account-management-api";
import { activeWorkspaceKey, hasItAccountManagementAccess } from "./account-management-model";
import { activeItWorkspaceKey, identityRoleLabel } from "./it-model";
import styles from "./account-management-page.module.css";

type PageState = "loading" | "ready" | "denied" | "session_expired" | "error";

function humanizeIdentityError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sesi Anda sudah berakhir. Silakan masuk kembali.";
    if (error.status === 403) return "Anda tidak memiliki akses untuk melakukan tindakan ini.";
    if (error.status === 404) return "Data yang Anda cari tidak ditemukan.";
    if (error.status === 409) return "Data telah berubah. Muat ulang halaman lalu coba kembali.";
  }
  return "Data belum dapat dimuat. Silakan coba kembali.";
}

function activeMembership(session: SessionProjection | null) {
  const principal = session?.principal;
  return principal && "actor" in principal ? principal.active_workspace : null;
}

function canManageMemberships(session: SessionProjection | null): boolean {
  return Boolean(activeMembership(session)?.permission_refs.includes("identity.memberships.manage"));
}

function workspaceLabel(workspace: WorkspaceProjection | undefined): string { return workspace?.workspace_name ?? "—"; }

export function AccountManagementPage({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [accounts, setAccounts] = useState<IdentityAccountProjection[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceProjection[]>([]);
  const [roles, setRoles] = useState<AuthorizationRole[]>([]);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAccount, setSelectedAccount] = useState<IdentityAccountProjection | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [mutating, setMutating] = useState(false);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [nextAccounts, nextWorkspaces, nextRoles] = await Promise.all([listIdentityAccounts(), listIdentityWorkspaces(), listAssignableRoles()]);
      setAccounts(nextAccounts);
      setWorkspaces(nextWorkspaces);
      setRoles(nextRoles);
      setPageState("ready");
    } catch (error) {
      setLoadError(error);
      setPageState(error instanceof ApiError && error.status === 401 ? "session_expired" : "error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function preparePage() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        const resolution = resolveWorkspaceDomain(nextSession, workspaceKey);
        const allowed = resolution.valid && resolution.domain === "IT" && hasItAccountManagementAccess(nextSession, workspaceKey);
        setSession(nextSession);
        if (!allowed || activeItWorkspaceKey(nextSession) !== workspaceKey) { setPageState("denied"); return; }
        void loadData();
      } catch (error: unknown) {
        if (cancelled) return;
        setLoadError(error);
        setPageState(error instanceof ApiError && error.status === 401 ? "session_expired" : "error");
      }
    }
    void preparePage();
    return () => { cancelled = true; };
  }, [loadData, workspaceKey]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (statusFilter === "ACTIVE" && !account.active) return false;
      if (statusFilter === "INACTIVE" && account.active) return false;
      if (!query) return true;
      return [account.display_name, account.email, ...account.workspace_access.flatMap((access) => [access.workspace.workspace_name, ...access.role_refs.map(identityRoleLabel)])].join(" ").toLowerCase().includes(query);
    });
  }, [accounts, search, statusFilter]);

  const changeAccountState = async (account: IdentityAccountProjection) => {
    if (mutating) return;
    setMutating(true);
    setMutationError("");
    try {
      await setAccountActive(account.actor_id, !account.active);
      await loadData();
      setSelectedAccount((current) => current?.actor_id === account.actor_id ? { ...current, active: !account.active } : current);
    } catch (error) { setMutationError(humanizeIdentityError(error)); } finally { setMutating(false); }
  };

  const revokeMembership = async (account: IdentityAccountProjection, workspaceId: string) => {
    if (mutating) return;
    setMutating(true);
    setMutationError("");
    try {
      await revokeAccountMembership(account.actor_id, workspaceId);
      await loadData();
      setSelectedAccount(null);
    } catch (error) { setMutationError(humanizeIdentityError(error)); } finally { setMutating(false); }
  };

  const columns: readonly DataTableColumn<IdentityAccountProjection>[] = [
    { header: "Nama Karyawan", key: "name", render: (account) => <div className={styles.cellPrimary}><strong>{account.display_name || "—"}</strong><span className={styles.cellSecondary}>Akun identitas</span></div> },
    { header: "Email / Username", key: "email", render: (account) => account.email || "—" },
    { header: "Status Akun", key: "account-status", render: (account) => <Status label={account.active ? "Aktif" : "Nonaktif"} variant={account.active ? "success" : "neutral"} /> },
    { header: "Ruang Kerja", key: "workspace", render: (account) => <div className={styles.stack}>{account.workspace_access.length ? account.workspace_access.map((access) => <span className={styles.tag} key={access.workspace.workspace_id}>{workspaceLabel(access.workspace)}</span>) : "—"}</div> },
    { header: "Peran", key: "role", render: (account) => <div className={styles.stack}>{account.workspace_access.flatMap((access) => access.role_refs).length ? account.workspace_access.flatMap((access) => access.role_refs).map((role) => <span className={styles.tag} key={role}>{identityRoleLabel(role)}</span>) : "—"}</div> },
    { header: "Status Akses", key: "access-status", render: (account) => <Status label={account.workspace_access.some((access) => access.active) ? "Terhubung" : "Belum Terhubung"} variant={account.workspace_access.some((access) => access.active) ? "info" : "neutral"} /> },
  ];

  if (pageState === "loading") return <LoadingState label="Memeriksa hak akses IT…" variant="page" />;
  if (pageState === "session_expired") return <AccessState title="Sesi Anda sudah berakhir." text="Silakan masuk kembali untuk melanjutkan." />;
  if (pageState === "denied") return <AccessState title="Anda tidak memiliki akses ke halaman ini." text="Halaman ini tersedia untuk ruang kerja IT aktif dan kewenangan pengelolaan akun yang diberikan." />;
  if (pageState === "error") return <AccessState title="Data belum dapat dimuat." text={humanizeIdentityError(loadError)} retry={() => { setPageState("loading"); void loadData(); }} />;
  if (!session) return null;
  const actualWorkspaceKey = activeWorkspaceKey(session) ?? workspaceKey;
  const activeWorkspaceName = activeMembership(session)?.workspace.workspace_name ?? "—";

  return <AppShell navigationSections={navigationForItWorkspace(actualWorkspaceKey)} session={session}>
    <div className={styles.page}>
      <PageHeader actions={<Button iconBefore={<Plus size={16} />} onClick={() => { setMutationError(""); setCreateOpen(true); }} variant="primary">Siapkan Akun</Button>} description="Daftarkan dan kelola akun sistem karyawan berdasarkan data tenaga kerja yang telah tersedia." eyebrow="AKSES & IDENTITAS" metadata={`Ruang kerja aktif: ${activeWorkspaceName}`} title="Akun Karyawan" />
      {mutationError ? <div className={styles.notice}><Alert icon={<AlertCircle size={18} />} message={mutationError} title="Tindakan belum berhasil" variant="danger" /></div> : null}
      <Toolbar filters={<select aria-label="Filter status akun" className={styles.toolbarSelect} onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="ALL">Semua Status</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select>} search={<div className={styles.toolbarSearch}><Users aria-hidden="true" size={16} /><input aria-label="Cari akun karyawan" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, ruang kerja…" type="search" value={search} /></div>} />
      <DataTable caption="Daftar akun karyawan dan akses" columns={columns} emptyState={<EmptyState icon={<UserRound size={24} />} title="Belum ada data" description="Belum ada akun yang sesuai dengan filter saat ini." />} getRowKey={(account) => account.actor_id} loading={false} rowAction={(account) => <Button onClick={() => { setMutationError(""); setSelectedAccount(account); }} size="sm" variant="ghost">Lihat Detail</Button>} rows={filteredAccounts} />
    </div>
    <AccountDetailDrawer account={selectedAccount} canManageMemberships={canManageMemberships(session)} mutating={mutating} onChangeState={() => selectedAccount ? void changeAccountState(selectedAccount) : undefined} onClose={() => setSelectedAccount(null)} onRevoke={(workspaceId) => selectedAccount ? void revokeMembership(selectedAccount, workspaceId) : undefined} open={Boolean(selectedAccount)} workspaces={workspaces} />
    <AccountReadinessDialog formRoles={roles} formWorkspaces={workspaces} onClose={() => setCreateOpen(false)} open={createOpen} />
  </AppShell>;
}

function AccountDetailDrawer({ account, canManageMemberships, mutating, onChangeState, onClose, onRevoke, open, workspaces }: Readonly<{ account: IdentityAccountProjection | null; canManageMemberships: boolean; mutating: boolean; onChangeState: () => void; onClose: () => void; onRevoke: (workspaceId: string) => void; open: boolean; workspaces: readonly WorkspaceProjection[] }>) {
  if (!account) return null;
  const memberships = account.workspace_access;
  return <Drawer description="Status akun dan akses ruang kerja dari sumber identitas resmi." footer={<div className={styles.actions}><Button disabled={mutating} onClick={onChangeState} variant={account.active ? "danger" : "secondary"}>{account.active ? "Tangguhkan Akun" : "Aktifkan Akun"}</Button></div>} onClose={onClose} open={open} title="Detail Akun Karyawan">
    <div className={styles.detailSection}><div className={styles.detailGrid}><div><span className={styles.detailLabel}>Nama</span><span className={styles.detailValue}>{account.display_name || "—"}</span></div><div><span className={styles.detailLabel}>Email / Username</span><span className={styles.detailValue}>{account.email || "—"}</span></div><div><span className={styles.detailLabel}>Status akun</span><Status label={account.active ? "Aktif" : "Nonaktif"} variant={account.active ? "success" : "neutral"} /></div></div></div>
    <div className={styles.detailSection}><h3>Akses ruang kerja</h3>{memberships.length ? memberships.map((access) => <div className={styles.membership} key={access.workspace.workspace_id}><div className={styles.membershipHeader}><div><div className={styles.membershipTitle}>{workspaceLabel(access.workspace)}</div></div><Status label={access.active ? "Aktif" : "Nonaktif"} variant={access.active ? "success" : "neutral"} /></div><div className={styles.stack}>{access.role_refs.length ? access.role_refs.map((role) => <span className={styles.tag} key={role}>{identityRoleLabel(role)}</span>) : <span className={styles.cellSecondary}>Peran: —</span>}</div>{canManageMemberships ? <Button disabled={mutating} iconBefore={<XCircle size={14} />} onClick={() => onRevoke(access.workspace.workspace_id)} size="sm" variant="ghost">Cabut akses ruang kerja</Button> : null}</div>) : <EmptyState title="Belum ada data" description="Akun ini belum memiliki akses ruang kerja." />}</div>
    {workspaces.length === 0 ? <p className={styles.formHint}>Pilihan ruang kerja belum tersedia.</p> : null}
  </Drawer>;
}

function AccountReadinessDialog({ formRoles, formWorkspaces, onClose, open }: Readonly<{ formRoles: readonly AuthorizationRole[]; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; open: boolean }>) {
  return <UiDialog description="Penyediaan akun menunggu sumber karyawan dan alur aktivasi resmi. Antarmuka tidak meminta kata sandi atau membuat akun secara lokal." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled type="button">Penyediaan akun belum tersedia</Button></>} onClose={onClose} open={open} size="lg" title="Siapkan Akun Karyawan">
    <form onSubmit={(event) => event.preventDefault()}>
      <div className={styles.formGrid}>
        <FormField htmlFor="it-employee-ref" label="Karyawan" required><select className={styles.formControl} disabled id="it-employee-ref"><option>Pilihan karyawan belum tersedia.</option></select></FormField>
        <FormField htmlFor="it-login-identifier" label="Email / Nama Pengguna" required><input className={styles.formControl} id="it-login-identifier" placeholder="Akan diisi dari sumber identitas resmi" /></FormField>
        <FormField htmlFor="it-primary-workspace" label="Ruang Kerja Utama" required><select className={styles.formControl} disabled={formWorkspaces.length === 0} id="it-primary-workspace"><option value="">{formWorkspaces.length ? "Pilih ruang kerja" : "Pilihan ruang kerja belum tersedia."}</option>{formWorkspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.workspace_name}</option>)}</select></FormField>
        <FormField htmlFor="it-role" label="Peran" required><select className={styles.formControl} disabled={formRoles.length === 0} id="it-role"><option value="">{formRoles.length ? "Pilih peran" : "Pilihan peran belum tersedia."}</option>{formRoles.map((role) => <option key={role} value={role}>{identityRoleLabel(role)}</option>)}</select></FormField>
        <FormField htmlFor="it-effective-date" label="Tanggal Berlaku" required><input className={styles.formControl} id="it-effective-date" type="date" /></FormField>
        <FormField htmlFor="it-expiration-date" label="Tanggal Berakhir"><input className={styles.formControl} id="it-expiration-date" type="date" /></FormField>
        <div className={styles.formFull}><FormField htmlFor="it-account-notes" label="Catatan"><textarea className={styles.formControl} id="it-account-notes" placeholder="Catatan permintaan akses" rows={3} /></FormField></div>
      </div>
      <p className={styles.formHint}>Kata sandi, kode aktivasi, dan ID internal dikelola oleh layanan resmi, bukan dimasukkan oleh IT. Pilihan karyawan belum terhubung ke sumber HR.</p>
    </form>
  </UiDialog>;
}

function AccessState({ retry, text, title }: Readonly<{ retry?: () => void; text: string; title: string }>) {
  return <main className={styles.accessState}><div className={styles.accessCard}><h1 className={styles.accessTitle}>{title}</h1><p className={styles.accessText}>{text}</p>{retry ? <div className={styles.actions}><Button onClick={retry} size="sm" variant="secondary">Coba lagi</Button></div> : null}</div></main>;
}
