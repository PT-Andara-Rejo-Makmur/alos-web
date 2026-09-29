"use client";

import { AlertCircle, Plus, UserRound, Users, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { navigationForItWorkspace } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import {
  Alert,
  Button,
  DataTable,
  Dialog as UiDialog,
  Drawer,
  EmptyState,
  FormField,
  LoadingState,
  PageHeader,
  Status,
  Toolbar,
  type DataTableColumn,
} from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type {
  AuthorizationRole,
  IdentityAccountProjection,
  ProvisionAccountRequest,
  WorkspaceProjection,
} from "@/lib/contracts";
import { ApiError, sessionApiRequest } from "@/lib/api";

import {
  addAccountMembership,
  listAssignableRoles,
  listIdentityAccounts,
  listIdentityWorkspaces,
  provisionIdentityAccount,
  revokeAccountMembership,
  setAccountActive,
} from "./account-management-api";
import { activeWorkspaceKey, hasItAccountManagementAccess } from "./account-management-model";
import { resolveWorkspaceDomain } from "@/features/session";
import styles from "./account-management-page.module.css";

type PageState = "loading" | "ready" | "denied" | "session_expired" | "error";
type AccountForm = { displayName: string; email: string; password: string; workspaceId: string; role: AuthorizationRole | "" };

const EMPTY_FORM: AccountForm = { displayName: "", email: "", password: "", workspaceId: "", role: "" };

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

function workspaceLabel(workspace: WorkspaceProjection | undefined): string {
  return workspace?.workspace_name ?? "—";
}

function roleLabel(role: string): string {
  return role.replaceAll("_", " ");
}

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
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [accountForm, setAccountForm] = useState<AccountForm>(EMPTY_FORM);
  const [membershipWorkspaceId, setMembershipWorkspaceId] = useState("");
  const [membershipRole, setMembershipRole] = useState<AuthorizationRole | "">("");
  const [mutationError, setMutationError] = useState("");
  const [mutating, setMutating] = useState(false);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [nextAccounts, nextWorkspaces, nextRoles] = await Promise.all([
        listIdentityAccounts(),
        listIdentityWorkspaces(),
        listAssignableRoles(),
      ]);
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
        const allowed = resolution.valid && resolution.domain === "IT" && hasItAccountManagementAccess(nextSession);
        if (!allowed) {
          setSession(nextSession);
          setPageState("denied");
          return;
        }
        if (cancelled) return;
        setSession(nextSession);
        if (!hasItAccountManagementAccess(nextSession) || activeWorkspaceKey(nextSession) !== workspaceKey) {
          setPageState("denied");
          return;
        }
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
      return [account.display_name, account.email, ...account.workspace_access.flatMap((access) => [access.workspace.workspace_name, ...access.role_refs])]
        .join(" ").toLowerCase().includes(query);
    });
  }, [accounts, search, statusFilter]);

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const workspaceId = accountForm.workspaceId || workspaces[0]?.workspace_id || "";
    const role = accountForm.role || roles[0] || "";
    if (mutating || !role || !workspaceId) return;
    setMutating(true);
    setMutationError("");
    const payload: ProvisionAccountRequest = {
      display_name: accountForm.displayName.trim(),
      email: accountForm.email.trim(),
      password: accountForm.password,
      workspace_id: workspaceId,
      role_refs: [role],
    };
    try {
      await provisionIdentityAccount(payload);
      setCreateOpen(false);
      setAccountForm(EMPTY_FORM);
      await loadData();
    } catch (error) {
      setMutationError(humanizeIdentityError(error));
    } finally {
      setMutating(false);
    }
  };

  const changeAccountState = async (account: IdentityAccountProjection) => {
    if (mutating) return;
    setMutating(true);
    setMutationError("");
    try {
      await setAccountActive(account.actor_id, !account.active);
      await loadData();
      setSelectedAccount((current) => current?.actor_id === account.actor_id ? { ...current, active: !account.active } : current);
    } catch (error) {
      setMutationError(humanizeIdentityError(error));
    } finally {
      setMutating(false);
    }
  };

  const addMembership = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const workspaceId = membershipWorkspaceId || workspaces.find((workspace) => !selectedAccount?.workspace_access.some((access) => access.workspace.workspace_id === workspace.workspace_id))?.workspace_id || "";
    const role = membershipRole || roles[0] || "";
    if (!selectedAccount || !workspaceId || !role || mutating) return;
    setMutating(true);
    setMutationError("");
    try {
      const addedMembership = await addAccountMembership(selectedAccount.actor_id, { workspace_id: workspaceId, role_refs: [role] });
      setMembershipOpen(false);
      await loadData();
      setSelectedAccount((current) => current ? { ...current, workspace_access: [...current.workspace_access, addedMembership] } : current);
    } catch (error) {
      setMutationError(humanizeIdentityError(error));
    } finally {
      setMutating(false);
    }
  };

  const revokeMembership = async (account: IdentityAccountProjection, workspaceId: string) => {
    if (mutating) return;
    setMutating(true);
    setMutationError("");
    try {
      await revokeAccountMembership(account.actor_id, workspaceId);
      await loadData();
      setSelectedAccount(null);
    } catch (error) {
      setMutationError(humanizeIdentityError(error));
    } finally {
      setMutating(false);
    }
  };

  const columns: readonly DataTableColumn<IdentityAccountProjection>[] = [
    { header: "Nama", key: "name", render: (account) => <div className={styles.cellPrimary}><strong>{account.display_name || "—"}</strong><span className={styles.cellSecondary}>{account.actor_id}</span></div> },
    { header: "Email / Username", key: "email", render: (account) => account.email || "—" },
    { header: "Status Akun", key: "account-status", render: (account) => <Status label={account.active ? "Aktif" : "Nonaktif"} variant={account.active ? "success" : "neutral"} /> },
    { header: "Workspace", key: "workspace", render: (account) => <div className={styles.stack}>{account.workspace_access.length ? account.workspace_access.map((access) => <span className={styles.tag} key={access.workspace.workspace_id}>{workspaceLabel(access.workspace)}</span>) : "—"}</div> },
    { header: "Role", key: "role", render: (account) => <div className={styles.stack}>{account.workspace_access.flatMap((access) => access.role_refs).length ? account.workspace_access.flatMap((access) => access.role_refs).map((role) => <span className={styles.tag} key={role}>{roleLabel(role)}</span>) : "—"}</div> },
    { header: "Status Akses", key: "access-status", render: (account) => <Status label={account.workspace_access.some((access) => access.active) ? "Terhubung" : "Belum Terhubung"} variant={account.workspace_access.some((access) => access.active) ? "info" : "neutral"} /> },
  ];

  if (pageState === "loading") return <LoadingState label="Memeriksa akses Workspace IT…" variant="page" />;
  if (pageState === "session_expired") return <AccessState title="Sesi Anda sudah berakhir." text="Silakan masuk kembali untuk melanjutkan." />;
  if (pageState === "denied") return <AccessState title="Anda tidak memiliki akses ke halaman ini." text="Halaman ini tersedia untuk active workspace IT dan permission pengelolaan akun yang diberikan Backend." />;
  if (pageState === "error") return <AccessState title="Data belum dapat dimuat." text={humanizeIdentityError(loadError)} retry={() => { setPageState("loading"); void loadData(); }} />;
  if (!session) return null;
  const membershipWorkspaces = selectedAccount
    ? workspaces.filter((workspace) => !selectedAccount.workspace_access.some((access) => access.workspace.workspace_id === workspace.workspace_id))
    : workspaces;
  const formAccount = {
    ...accountForm,
    workspaceId: accountForm.workspaceId || workspaces[0]?.workspace_id || "",
    role: accountForm.role || roles[0] || "",
  };

  return (
    <AppShell navigationSections={navigationForItWorkspace(workspaceKey)} session={session}>
      <div className={styles.page}>
        <PageHeader
          actions={<Button iconBefore={<Plus size={16} />} onClick={() => { setMutationError(""); setCreateOpen(true); }} variant="primary">Tambah Pengguna</Button>}
          description="Lihat dan kelola akun sesuai workspace membership dan permission yang diberikan Backend."
          eyebrow="WORKSPACE IT · ADMINISTRASI"
          title="Pengguna & Akses"
          metadata={`Workspace aktif: ${activeWorkspaceKey(session) ?? "—"}`}
        />
        {mutationError ? <div className={styles.notice}><Alert icon={<AlertCircle size={18} />} message={mutationError} title="Tindakan belum berhasil" variant="danger" /></div> : null}
        <Toolbar
          filters={<><select aria-label="Filter status akun" className={styles.toolbarSelect} onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="ALL">Semua Status</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select></>}
          search={<div className={styles.toolbarSearch}><Users aria-hidden="true" size={16} /><input aria-label="Cari pengguna" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, workspace…" type="search" value={search} /></div>}
        />
        <DataTable caption="Daftar pengguna dan akses" columns={columns} emptyState={<EmptyState icon={<UserRound size={24} />} title="Belum ada data" description="Belum ada akun yang sesuai dengan filter saat ini." />} getRowKey={(account) => account.actor_id} loading={false} rowAction={(account) => <Button onClick={() => { setMutationError(""); setSelectedAccount(account); }} size="sm" variant="ghost">Lihat Detail</Button>} rows={filteredAccounts} />
      </div>

      <AccountDetailDrawer account={selectedAccount} canManageMemberships={canManageMemberships(session)} mutating={mutating} onAddWorkspace={() => { const available = selectedAccount ? workspaces.filter((workspace) => !selectedAccount.workspace_access.some((access) => access.workspace.workspace_id === workspace.workspace_id)) : workspaces; setMembershipWorkspaceId(available[0]?.workspace_id ?? ""); setMembershipRole(roles[0] ?? ""); setMutationError(""); setMembershipOpen(true); }} onChangeState={() => selectedAccount ? void changeAccountState(selectedAccount) : undefined} onClose={() => setSelectedAccount(null)} onRevoke={(workspaceId) => selectedAccount ? void revokeMembership(selectedAccount, workspaceId) : undefined} open={Boolean(selectedAccount)} workspaces={workspaces} />

      <CreateAccountDialog accountForm={formAccount} createOpen={createOpen} error={mutationError} formRoles={roles} formWorkspaces={workspaces} mutating={mutating} onClose={() => setCreateOpen(false)} onFormChange={setAccountForm} onSubmit={createAccount} />

      <UiDialog
        description="Membership baru akan divalidasi dan disimpan oleh Backend. Permission tidak diisi atau ditebak oleh Web."
        footer={<><Button onClick={() => setMembershipOpen(false)} variant="secondary">Batal</Button><Button form="membership-form" loading={mutating} loadingLabel="Menyimpan…" type="submit">Tambahkan akses</Button></>}
        onClose={() => setMembershipOpen(false)}
        open={membershipOpen}
        title="Tambah workspace"
      >
        <form id="membership-form" onSubmit={addMembership}>
          <div className={styles.formGrid}>
            <FormField htmlFor="membership-workspace" label="Workspace" required><select className={styles.formControl} id="membership-workspace" onChange={(event) => setMembershipWorkspaceId(event.target.value)} required value={membershipWorkspaceId || membershipWorkspaces[0]?.workspace_id || ""}>{membershipWorkspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.workspace_name}</option>)}</select></FormField>
            <FormField htmlFor="membership-role" label="Role" required><select className={styles.formControl} id="membership-role" onChange={(event) => setMembershipRole(event.target.value as AuthorizationRole)} required value={membershipRole || roles[0] || ""}>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></FormField>
          </div>
        </form>
      </UiDialog>
    </AppShell>
  );
}

function AccountDetailDrawer({ account, canManageMemberships, mutating, onAddWorkspace, onChangeState, onClose, onRevoke, open, workspaces }: Readonly<{ account: IdentityAccountProjection | null; canManageMemberships: boolean; mutating: boolean; onAddWorkspace: () => void; onChangeState: () => void; onClose: () => void; onRevoke: (workspaceId: string) => void; open: boolean; workspaces: readonly WorkspaceProjection[] }>) {
  if (!account) return null;
  const memberships = account.workspace_access;
  const availableWorkspaces = workspaces.filter((workspace) => !memberships.some((access) => access.workspace.workspace_id === workspace.workspace_id));
  return <Drawer description="Projection akun dan workspace membership dari Backend." footer={<div className={styles.actions}><Button disabled={mutating} onClick={onChangeState} variant={account.active ? "danger" : "secondary"}>{account.active ? "Nonaktifkan akun" : "Aktifkan akun"}</Button>{canManageMemberships && availableWorkspaces.length > 0 ? <Button disabled={mutating} iconBefore={<Plus size={16} />} onClick={onAddWorkspace} variant="secondary">Tambah workspace</Button> : null}</div>} onClose={onClose} open={open} title="Detail akun">
    <div className={styles.detailSection}><div className={styles.detailGrid}><div><span className={styles.detailLabel}>Nama</span><span className={styles.detailValue}>{account.display_name || "—"}</span></div><div><span className={styles.detailLabel}>Email / Username</span><span className={styles.detailValue}>{account.email || "—"}</span></div><div><span className={styles.detailLabel}>Actor ID</span><span className={styles.detailValue}>{account.actor_id || "—"}</span></div><div><span className={styles.detailLabel}>Status akun</span><Status label={account.active ? "Aktif" : "Nonaktif"} variant={account.active ? "success" : "neutral"} /></div></div></div>
    <div className={styles.detailSection}><h3>Workspace membership</h3>{memberships.length ? memberships.map((access) => <div className={styles.membership} key={access.workspace.workspace_id}><div className={styles.membershipHeader}><div><div className={styles.membershipTitle}>{workspaceLabel(access.workspace)}</div><div className={styles.membershipMeta}>{access.workspace.division_code ?? "—"} · {access.workspace.workspace_type}</div></div><Status label={access.active ? "Aktif" : "Nonaktif"} variant={access.active ? "success" : "neutral"} /></div><div className={styles.stack}>{access.role_refs.length ? access.role_refs.map((role) => <span className={styles.tag} key={role}>{roleLabel(role)}</span>) : <span className={styles.cellSecondary}>Role: —</span>}</div><div className={styles.membershipMeta}>Scope: {access.scope_refs.length ? access.scope_refs.join(", ") : "—"}</div>{canManageMemberships ? <Button disabled={mutating} iconBefore={<XCircle size={14} />} onClick={() => onRevoke(access.workspace.workspace_id)} size="sm" variant="ghost">Cabut akses workspace</Button> : null}</div>) : <EmptyState title="Belum ada data" description="Akun ini belum memiliki workspace membership aktif." />}</div>
  </Drawer>;
}

function CreateAccountDialog({ accountForm, createOpen, error, formRoles, formWorkspaces, mutating, onClose, onFormChange, onSubmit }: Readonly<{ accountForm: AccountForm; createOpen: boolean; error: string; formRoles: readonly AuthorizationRole[]; formWorkspaces: readonly WorkspaceProjection[]; mutating: boolean; onClose: () => void; onFormChange: (form: AccountForm) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }>) {
  return <UiDialog description="Akun dibuat melalui endpoint provisioning resmi Backend. Web tidak membuat password, role, permission, atau membership secara lokal." footer={<><Button onClick={onClose} variant="secondary">Batal</Button><Button form="create-account-form" loading={mutating} loadingLabel="Mendaftarkan…" type="submit">Daftarkan akun</Button></>} onClose={onClose} open={createOpen} size="lg" title="Tambah pengguna">
    <form id="create-account-form" onSubmit={onSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.formFull}><FormField htmlFor="new-user-name" label="Nama Lengkap" required><input autoComplete="name" className={styles.formControl} id="new-user-name" onChange={(event) => onFormChange({ ...accountForm, displayName: event.target.value })} required value={accountForm.displayName} /></FormField></div>
        <FormField htmlFor="new-user-email" label="Email / Username" required><input autoComplete="username" className={styles.formControl} id="new-user-email" onChange={(event) => onFormChange({ ...accountForm, email: event.target.value })} required type="email" value={accountForm.email} /></FormField>
        <FormField htmlFor="new-user-password" label="Kata sandi awal" required><input autoComplete="new-password" className={styles.formControl} id="new-user-password" minLength={8} onChange={(event) => onFormChange({ ...accountForm, password: event.target.value })} required type="password" value={accountForm.password} /></FormField>
        <FormField htmlFor="new-user-workspace" label="Workspace" required><select className={styles.formControl} id="new-user-workspace" onChange={(event) => onFormChange({ ...accountForm, workspaceId: event.target.value })} required value={accountForm.workspaceId}>{formWorkspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.workspace_name}</option>)}</select></FormField>
        <FormField htmlFor="new-user-role" label="Role" required><select className={styles.formControl} id="new-user-role" onChange={(event) => onFormChange({ ...accountForm, role: event.target.value as AuthorizationRole })} required value={accountForm.role}>{formRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></FormField>
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <p className={styles.formHint}>Workspace dan role diambil dari catalog Backend. Permission tidak dipilih manual oleh antarmuka.</p>
    </form>
  </UiDialog>;
}

function AccessState({ retry, text, title }: Readonly<{ retry?: () => void; text: string; title: string }>) {
  return <main className={styles.accessState}><div className={styles.accessCard}><h1 className={styles.accessTitle}>{title}</h1><p className={styles.accessText}>{text}</p>{retry ? <div className={styles.actions}><Button onClick={retry} size="sm" variant="secondary">Coba lagi</Button></div> : null}</div></main>;
}
