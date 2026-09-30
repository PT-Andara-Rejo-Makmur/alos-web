"use client";

import { Plus, UserRound, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { navigationForItWorkspace } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button, DataTable, Dialog as UiDialog, Drawer, EmptyState, FormField, LoadingState, Metric, PageHeader, Status, Tabs, Toolbar, type DataTableColumn } from "@/components/ui";
import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";
import type { AuthorizationRole, IdentityAccountProjection, ProvisioningCandidateProjection, WorkspaceProjection } from "@/lib/contracts";

import { addMembership, changeAccountState, listActorIdentityHistory, listActorSessions, listAssignableRoles, listIdentityAccounts, listIdentityWorkspaces, listProvisioningCandidates, provisionAccount, resendActivation, revokeActorSession, revokeMembership, updateMembership } from "./account-management-api";
import { activeWorkspaceKey, hasItAccountManagementAccess } from "./account-management-model";
import { activeItWorkspaceKey, assignableRoleOptions, identityRoleLabel } from "./it-model";
import { ItSourceStateView } from "./shared/it-ui";
import styles from "./account-management-page.module.css";

type PageState = "loading" | "ready" | "denied" | "session_expired" | "error";
type GovernanceAction = "suspend" | "activate";
type MembershipAction = "add" | "edit" | "revoke";
type AuditReadinessRow = {
  readonly id: string;
  readonly occurredAt: string;
  readonly activity: string;
  readonly object: string;
  readonly workspace: string;
  readonly actor: string;
  readonly result: string;
  readonly source: string;
};

const accountTabs = ["Belum Memiliki Akun", "Menunggu Aktivasi", "Aktif", "Ditangguhkan", "Dinonaktifkan", "Semua"];
const auditColumns: readonly DataTableColumn<AuditReadinessRow>[] = [
  { header: "Waktu", key: "occurred-at", render: (row) => row.occurredAt },
  { header: "Aktivitas", key: "activity", render: (row) => row.activity },
  { header: "Objek", key: "object", render: (row) => row.object },
  { header: "Workspace", key: "workspace", render: (row) => row.workspace },
  { header: "Pelaksana", key: "actor", render: (row) => row.actor },
  { header: "Hasil", key: "result", render: (row) => row.result },
  { header: "Sumber", key: "source", render: (row) => row.source },
];

function humanizeIdentityError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sesi Anda sudah berakhir. Silakan masuk kembali.";
    if (error.status === 403) return "Anda tidak memiliki akses untuk melakukan tindakan ini.";
    if (error.status === 404) return "Data yang Anda cari tidak ditemukan.";
    if (error.status === 409) return "Data telah berubah. Muat ulang halaman lalu coba kembali.";
    if (error.status === 422) return "Data belum memenuhi aturan penyediaan akun.";
    if (error.status >= 500) return "Layanan identitas belum dapat memproses permintaan.";
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

function isSupportedRole(role: string, roles: readonly AuthorizationRole[]): boolean {
  return roles.includes(role as AuthorizationRole);
}

export function AccountManagementPage({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [accounts, setAccounts] = useState<IdentityAccountProjection[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceProjection[]>([]);
  const [roles, setRoles] = useState<AuthorizationRole[]>([]);
  const [candidates, setCandidates] = useState<ProvisioningCandidateProjection[]>([]);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [accountTab, setAccountTab] = useState("Semua");
  const [workspaceFilter, setWorkspaceFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [accountStatusFilter, setAccountStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activationFilter, setActivationFilter] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<IdentityAccountProjection | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [governanceAction, setGovernanceAction] = useState<GovernanceAction | null>(null);
  const [governanceAccount, setGovernanceAccount] = useState<IdentityAccountProjection | null>(null);
  const [membershipAction, setMembershipAction] = useState<MembershipAction | null>(null);
  const [membershipAccount, setMembershipAccount] = useState<IdentityAccountProjection | null>(null);
  const [membershipWorkspace, setMembershipWorkspace] = useState<WorkspaceProjection | null>(null);
  const [resendBusyId, setResendBusyId] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [nextAccounts, nextWorkspaces, nextRoles, nextCandidates] = await Promise.all([listIdentityAccounts(), listIdentityWorkspaces(), listAssignableRoles(), listProvisioningCandidates()]);
      setAccounts(nextAccounts);
      setWorkspaces(nextWorkspaces);
      setRoles(nextRoles);
      setCandidates(nextCandidates ?? []);
      setPageState("ready");
    } catch (error) {
      setLoadError(error);
      setPageState(error instanceof ApiError && error.status === 401 ? "session_expired" : "error");
    }
  }, []);

  const handleResendActivation = useCallback(async (actorId: string) => {
    setResendBusyId(actorId);
    setResendNotice(null);
    try {
      const res = await resendActivation(actorId);
      setResendNotice(res.email_delivered ? "Tautan aktivasi berhasil dikirim ulang ke email karyawan." : "Token aktivasi diperbarui, namun pengiriman email belum berhasil.");
      await loadData();
    } catch (err) {
      setResendNotice(humanizeIdentityError(err));
    } finally {
      setResendBusyId(null);
    }
  }, [loadData]);

  useEffect(() => {
    let cancelled = false;
    async function preparePage() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        const resolution = resolveWorkspaceDomain(nextSession, workspaceKey);
        const allowed = resolution.valid && resolution.domain === "IT" && hasItAccountManagementAccess(nextSession, workspaceKey);
        setSession(nextSession);
        if (!allowed || activeItWorkspaceKey(nextSession) !== workspaceKey) {
          setPageState("denied");
          return;
        }
        void loadData();
      } catch (error: unknown) {
        if (!cancelled) {
          setLoadError(error);
          setPageState(error instanceof ApiError && error.status === 401 ? "session_expired" : "error");
        }
      }
    }
    void preparePage();
    return () => { cancelled = true; };
  }, [loadData, workspaceKey]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (accountTab === "Aktif" && (!account.active || account.activation_state !== "ACTIVATED")) return false;
      if (accountTab === "Menunggu Aktivasi" && account.activation_state !== "PENDING") return false;
      if (accountTab === "Ditangguhkan" && account.administrative_state !== "SUSPENDED") return false;
      if (accountTab === "Dinonaktifkan" && account.administrative_state !== "DISABLED") return false;
      if (accountTab === "Belum Memiliki Akun") return false;
      if (accountStatusFilter === "active" && !account.active) return false;
      if (accountStatusFilter === "inactive" && account.active) return false;
      if (departmentFilter && account.department_code !== departmentFilter) return false;
      if (activationFilter && account.activation_state !== activationFilter) return false;
      if (employmentFilter && account.employment_status !== employmentFilter) return false;
      if (workspaceFilter && !account.workspace_access.some((access) => access.workspace.workspace_id === workspaceFilter)) return false;
      if (roleFilter && !account.workspace_access.some((access) => access.role_refs.includes(roleFilter as AuthorizationRole))) return false;
      if (!query) return true;
      return [account.display_name, account.employee_id, account.employee_number, account.position_title, account.department_code, account.email, account.administrative_state, account.activation_state, ...account.workspace_access.flatMap((access) => [access.workspace.workspace_name, ...access.role_refs.map(identityRoleLabel)])].join(" ").toLowerCase().includes(query);
    });
  }, [accountStatusFilter, accountTab, accounts, activationFilter, departmentFilter, employmentFilter, roleFilter, search, workspaceFilter]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (departmentFilter && candidate.department_code !== departmentFilter) return false;
      if (employmentFilter && candidate.employment_status !== employmentFilter) return false;
      return !query || [candidate.full_name, candidate.employee_id, candidate.employee_number, candidate.email, candidate.position_title, candidate.department_code].join(" ").toLowerCase().includes(query);
    });
  }, [candidates, departmentFilter, employmentFilter, search]);

  const departmentOptions = [...new Set([...accounts.map((account) => account.department_code), ...candidates.map((candidate) => candidate.department_code)].filter((value): value is string => Boolean(value)))].sort();
  const employmentOptions = [...new Set([...accounts.map((account) => account.employment_status), ...candidates.map((candidate) => candidate.employment_status)].filter((value): value is string => Boolean(value)))].sort();

  const columns: readonly DataTableColumn<IdentityAccountProjection>[] = [
    { header: "Nama", key: "employee-name", render: (account) => <div className={styles.cellPrimary}><strong>{account.display_name}</strong><span className={styles.cellSecondary}>{account.department_code ?? "—"}</span></div> },
    { header: "ID Karyawan", key: "employee-id", render: (account) => account.employee_number ?? account.employee_id ?? "—" },
    { header: "Jabatan", key: "position", render: (account) => account.position_title ?? "—" },
    { header: "Workspace Utama", key: "primary-workspace", render: (account) => workspaceLabel(workspaces.find((item) => item.workspace_id === account.primary_workspace_id)) },
    { header: "Role Utama", key: "primary-role", render: (account) => identityRoleLabel(account.workspace_access.find((item) => item.workspace.workspace_id === account.primary_workspace_id)?.role_refs[0] ?? "") },
    { header: "Email", key: "account-email", render: (account) => account.email || "—" },
    { header: "Status Akun", key: "account-status", render: (account) => <Status label={account.administrative_state === "ENABLED" ? "Aktif" : account.administrative_state === "SUSPENDED" ? "Ditangguhkan" : "Dinonaktifkan"} variant={account.active ? "success" : "neutral"} /> },
    { header: "Status Aktivasi", key: "activation-status", render: (account) => <Status label={account.activation_state === "ACTIVATED" ? "Aktif" : account.activation_state === "PENDING" ? "Menunggu Aktivasi" : "Kedaluwarsa"} variant={account.activation_state === "ACTIVATED" ? "success" : "neutral"} /> },
    { header: "Pengiriman Email", key: "email-delivery", render: (account) => <Status label={account.email_delivered ? "Terkirim" : "Gagal / Belum"} variant={account.email_delivered ? "success" : "neutral"} /> },
    { header: "Login Terakhir", key: "last-login", render: (account) => account.last_login_at ? new Date(account.last_login_at).toLocaleString("id-ID") : "—" },
    { header: "Tanggal Dibuat", key: "created-at", render: (account) => account.created_at ? new Date(account.created_at).toLocaleDateString("id-ID") : "—" },
  ];
  const candidateColumns: readonly DataTableColumn<ProvisioningCandidateProjection>[] = [
    { header: "Nama", key: "employee-name", render: (candidate) => candidate.full_name },
    { header: "ID Karyawan", key: "employee-id", render: (candidate) => candidate.employee_number ?? candidate.employee_id },
    { header: "Jabatan", key: "position", render: (candidate) => candidate.position_title ?? "—" },
    { header: "Divisi", key: "department", render: (candidate) => candidate.department_code ?? "—" },
    { header: "Status Kepegawaian", key: "employment", render: (candidate) => candidate.employment_status },
    { header: "Email HR", key: "employee-email", render: (candidate) => candidate.email ?? "—" },
  ];

  if (pageState === "loading") return <LoadingState label="Memeriksa hak akses IT…" variant="page" />;
  if (pageState === "session_expired") return <AccessState title="Sesi Anda sudah berakhir." text="Silakan masuk kembali untuk melanjutkan." />;
  if (pageState === "denied") return <AccessState title="Anda tidak memiliki akses ke halaman ini." text="Halaman ini tersedia untuk ruang kerja IT aktif dan kewenangan pengelolaan akun yang diberikan." />;
  if (pageState === "error") return <AccessState title="Data belum dapat dimuat." text={humanizeIdentityError(loadError)} retry={() => { setPageState("loading"); void loadData(); }} />;
  if (!session) return null;

  const actualWorkspaceKey = activeWorkspaceKey(session) ?? workspaceKey;
  const activeWorkspaceName = activeMembership(session)?.workspace.workspace_name ?? "—";
  const emptyTitle = "Belum ada data";
  const emptyDescription = accountTab === "Belum Memiliki Akun" ? "Tidak ada karyawan yang memenuhi syarat provisioning." : "Belum ada akun yang sesuai dengan tampilan saat ini.";
  const manageMemberships = canManageMemberships(session);

  return <AppShell navigationSections={navigationForItWorkspace(actualWorkspaceKey)} session={session}>
    <div className={styles.page}>
      <PageHeader actions={<Button iconBefore={<Plus size={16} />} onClick={() => setCreateOpen(true)} variant="primary">Daftarkan Akun</Button>} description="Daftarkan dan kelola akun sistem berdasarkan data tenaga kerja yang telah tersedia." eyebrow="AKSES & IDENTITAS" metadata={`Ruang kerja aktif: ${activeWorkspaceName}`} title="Akun Karyawan" />
      <section aria-label="Ringkasan akun" className={styles.summaryGrid}>
        <Metric label="Belum Memiliki Akun" status="Kandidat HR" value={candidates.length} />
        <Metric label="Menunggu Aktivasi" status="Identity" value={accounts.filter((account) => account.activation_state === "PENDING").length} />
        <Metric label="Akun Aktif" status="Identity" value={accounts.filter((account) => account.active && account.activation_state === "ACTIVATED").length} />
        <Metric label="Akun Ditangguhkan" status="Identity" value={accounts.filter((account) => account.administrative_state === "SUSPENDED").length} />
        <Metric label="Akses Perlu Review" status="Identity" value={accounts.filter((account) => account.activation_state === "EXPIRED" || account.workspace_access.every((access) => !access.active)).length} />
      </section>
      <Tabs ariaLabel="Filter akun karyawan" items={accountTabs.map((label) => ({ id: label, label }))} onValueChange={setAccountTab} value={accountTab} />
      <Toolbar filters={<div className={styles.filters}>
        <label className={styles.filterGroup}><span className={styles.filterLabel}>Divisi</span><select aria-label="Divisi" className={styles.toolbarSelect} onChange={(event) => setDepartmentFilter(event.target.value)} value={departmentFilter}><option value="">Semua divisi</option>{departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}</select></label>
        <label className={styles.filterGroup}><span className={styles.filterLabel}>Workspace</span><select aria-label="Workspace" className={styles.toolbarSelect} disabled={workspaces.length === 0} onChange={(event) => setWorkspaceFilter(event.target.value)} value={workspaceFilter}><option value="">{workspaces.length ? "Semua workspace" : "Belum tersedia"}</option>{workspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.workspace_name}</option>)}</select></label>
        <label className={styles.filterGroup}><span className={styles.filterLabel}>Role</span><select aria-label="Role" className={styles.toolbarSelect} disabled={roles.length === 0} onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}><option value="">{roles.length ? "Semua role" : "Belum tersedia"}</option>{roles.map((role) => <option key={role} value={role}>{identityRoleLabel(role)}</option>)}</select></label>
        <label className={styles.filterGroup}><span className={styles.filterLabel}>Status Akun</span><select aria-label="Status Akun" className={styles.toolbarSelect} onChange={(event) => setAccountStatusFilter(event.target.value)} value={accountStatusFilter}><option value="">Semua status akun</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></label>
        <label className={styles.filterGroup}><span className={styles.filterLabel}>Status Aktivasi</span><select aria-label="Status Aktivasi" className={styles.toolbarSelect} onChange={(event) => setActivationFilter(event.target.value)} value={activationFilter}><option value="">Semua status aktivasi</option><option value="PENDING">Menunggu Aktivasi</option><option value="ACTIVATED">Aktif</option><option value="EXPIRED">Kedaluwarsa</option></select></label>
        <label className={styles.filterGroup}><span className={styles.filterLabel}>Status Kepegawaian</span><select aria-label="Status Kepegawaian" className={styles.toolbarSelect} onChange={(event) => setEmploymentFilter(event.target.value)} value={employmentFilter}><option value="">Semua status kepegawaian</option>{employmentOptions.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
      </div>} search={<div className={styles.toolbarSearch}><Users aria-hidden="true" size={16} /><input aria-label="Cari akun" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, ID karyawan, email, atau role…" type="search" value={search} /></div>} />
      {resendNotice ? <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", background: "var(--color-surface-subtle, #f4f4f5)", borderRadius: "6px", fontSize: "0.875rem" }} role="status">{resendNotice}</div> : null}
      {accountTab === "Belum Memiliki Akun" ? <DataTable caption="Karyawan yang belum memiliki akun" columns={candidateColumns} emptyState={<EmptyState icon={<UserRound size={24} />} title={emptyTitle} description={emptyDescription} />} getRowKey={(candidate) => candidate.employee_id} loading={false} rowAction={() => <Button onClick={() => setCreateOpen(true)} size="sm" variant="ghost">Daftarkan Akun</Button>} rows={filteredCandidates} /> : <DataTable caption={`Daftar akun karyawan — ${accountTab}`} columns={columns} emptyState={<EmptyState icon={<UserRound size={24} />} title={emptyTitle} description={emptyDescription} />} getRowKey={(account) => account.actor_id} loading={false} rowAction={(account) => <div style={{ display: "flex", gap: "0.5rem" }}><Button onClick={() => setSelectedAccount(account)} size="sm" variant="ghost">Lihat Detail</Button>{account.activation_state === "PENDING" ? <Button disabled={resendBusyId === account.actor_id} onClick={() => void handleResendActivation(account.actor_id)} size="sm" variant="ghost">{resendBusyId === account.actor_id ? "Mengirim…" : "Kirim Ulang"}</Button> : null}</div>} rows={filteredAccounts} />}
    </div>
    <AccountDetailDrawer account={selectedAccount} canManageMemberships={manageMemberships} formWorkspaces={workspaces} key={selectedAccount?.actor_id ?? "empty-account"} onGovernance={(action, account) => { setGovernanceAction(action); setGovernanceAccount(account); }} onMembership={(action, account, workspace) => { setMembershipAction(action); setMembershipAccount(account); setMembershipWorkspace(workspace ?? null); }} onResendActivation={handleResendActivation} resendBusy={Boolean(resendBusyId && selectedAccount && resendBusyId === selectedAccount.actor_id)} onClose={() => setSelectedAccount(null)} open={Boolean(selectedAccount)} />
    <AccountReadinessDialog candidates={candidates} formRoles={roles} formWorkspaces={workspaces} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); void loadData(); }} open={createOpen} />
    <GovernanceReadinessDialog account={governanceAccount} action={governanceAction} onClose={() => { setGovernanceAction(null); setGovernanceAccount(null); }} onSaved={() => { setGovernanceAction(null); setGovernanceAccount(null); setSelectedAccount(null); void loadData(); }} open={Boolean(governanceAction)} />
    <MembershipReadinessDialog action={membershipAction} account={membershipAccount} formRoles={roles} formWorkspaces={workspaces} onClose={() => { setMembershipAction(null); setMembershipAccount(null); setMembershipWorkspace(null); }} onSaved={() => { setMembershipAction(null); setMembershipAccount(null); setMembershipWorkspace(null); void loadData(); }} open={Boolean(membershipAction)} workspace={membershipWorkspace} />
  </AppShell>;
}

function AccountDetailDrawer({ account, canManageMemberships, formWorkspaces, onClose, onGovernance, onMembership, onResendActivation, resendBusy, open }: Readonly<{ account: IdentityAccountProjection | null; canManageMemberships: boolean; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; onGovernance: (action: GovernanceAction, account: IdentityAccountProjection) => void; onMembership: (action: MembershipAction, account: IdentityAccountProjection, workspace?: WorkspaceProjection) => void; onResendActivation: (actorId: string) => Promise<void>; resendBusy: boolean; open: boolean }>) {
  const [activeTab, setActiveTab] = useState("Ringkasan");
  if (!account) return null;
  const memberships = account.workspace_access;
  const tabs = ["Ringkasan", "Workspace & Akses", "Sesi", "Riwayat"];
  return <Drawer description="Informasi akun, akses, sesi, dan riwayat mengikuti sumber identitas resmi." footer={<Button onClick={onClose} variant="secondary">Tutup</Button>} onClose={onClose} open={open} title="Detail Akun Karyawan">
    <Tabs ariaLabel="Detail akun karyawan" items={tabs.map((label) => ({ id: label, label }))} onValueChange={setActiveTab} value={activeTab} />
    {activeTab === "Ringkasan" ? <div className={styles.detailSection}>
      <div className={styles.detailGrid}>
        <DetailItem label="Nama" value={account.display_name || "—"} />
        <DetailItem label="Nama Akun" value={account.display_name || "—"} />
        <DetailItem label="ID Karyawan" value={account.employee_number ?? account.employee_id ?? "—"} />
        <DetailItem label="Jabatan" value={account.position_title ?? "—"} />
        <DetailItem label="Divisi" value={account.department_code ?? "—"} />
        <DetailItem label="Email Akun" value={account.email || "—"} />
        <DetailItem label="Status Akun" value={account.administrative_state} />
        <DetailItem label="Status Aktivasi" value={account.activation_state} />
        <DetailItem label="Pengiriman Email" value={account.email_delivered ? "Terkirim" : "Gagal / Belum"} />
        <DetailItem label="Workspace Utama" value={workspaceLabel(formWorkspaces.find((item) => item.workspace_id === account.primary_workspace_id))} />
        <DetailItem label="Status Kepegawaian" value={account.employment_status ?? "—"} />
        <DetailItem label="Login Terakhir" value={account.last_login_at ? new Date(account.last_login_at).toLocaleString("id-ID") : "—"} />
        <DetailItem label="Tanggal Dibuat" value={account.created_at ? new Date(account.created_at).toLocaleDateString("id-ID") : "—"} />
      </div>
      <div className={styles.actions}>
        <Button disabled variant="secondary">Edit Akun belum tersedia</Button>
        {account.activation_state === "PENDING" ? (
          <Button disabled={resendBusy} onClick={() => void onResendActivation(account.actor_id)} variant="secondary">
            {resendBusy ? "Mengirim ulang…" : "Kirim Ulang Aktivasi"}
          </Button>
        ) : (
          <Button disabled variant="secondary">Kirim Ulang Aktivasi belum tersedia</Button>
        )}
        <Button disabled variant="secondary">Reset Akses belum tersedia</Button>
        {account.active ? <Button onClick={() => onGovernance("suspend", account)} variant="secondary">Tangguhkan Akun</Button> : <Button onClick={() => onGovernance("activate", account)} variant="secondary">Aktifkan Kembali</Button>}
      </div>
    </div> : null}
    {activeTab === "Workspace & Akses" ? <div className={styles.detailSection}>
      <div className={styles.membershipHeader}><h3>Workspace & Akses</h3>{canManageMemberships ? <Button onClick={() => onMembership("add", account)} size="sm" variant="secondary">+ Tambah Workspace</Button> : <Button disabled size="sm" variant="secondary">Tambah Workspace belum tersedia</Button>}</div>
      {memberships.length ? memberships.map((access) => <div className={styles.membership} key={access.workspace.workspace_id}>
        <div className={styles.membershipHeader}><div className={styles.membershipTitle}>{workspaceLabel(access.workspace)}</div><Status label={access.active ? "Aktif" : "Nonaktif"} variant={access.active ? "success" : "neutral"} /></div>
        <div className={styles.stack}>{access.role_refs.length ? access.role_refs.map((role) => <span className={styles.tag} key={role}>{identityRoleLabel(role)}</span>) : "Belum Dinilai"}</div>
        <div className={styles.detailGrid}><DetailItem label="Tanggal Aktif" value="—" /><DetailItem label="Tanggal Berakhir" value="—" /></div>
        {access.role_refs.length > 1 ? <p className={styles.formHint}>Lebih dari satu role tersimpan pada membership ini; tidak dipilih atau digabungkan oleh antarmuka.</p> : null}
        {canManageMemberships ? <div className={styles.actions}><Button onClick={() => onMembership("edit", account, access.workspace)} size="sm" variant="ghost">Edit Akses</Button><Button onClick={() => onMembership("revoke", account, access.workspace)} size="sm" variant="ghost">Cabut Akses</Button></div> : null}
      </div>) : <ItSourceStateView description="Akun belum memiliki akses ruang kerja dari sumber yang tersedia." state="connected-empty" title="Akses" />}
      {formWorkspaces.length === 0 ? <p className={styles.formHint}>Pilihan ruang kerja belum tersedia.</p> : null}
    </div> : null}
    {activeTab === "Sesi" ? <SessionAdminSection actorId={account.actor_id} workspaces={formWorkspaces} /> : null}
    {activeTab === "Riwayat" ? <IdentityHistorySection actorId={account.actor_id} /> : null}
  </Drawer>;
}

function SessionAdminSection({ actorId, workspaces }: Readonly<{ actorId: string; workspaces: readonly WorkspaceProjection[] }>) {
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof listActorSessions>>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setSessions(await listActorSessions(actorId)); }
    catch (cause) { setError(humanizeIdentityError(cause)); }
    finally { setLoading(false); }
  }, [actorId]);
  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);
  async function revoke(sessionId: string) {
    setBusyId(sessionId); setError("");
    try { await revokeActorSession(actorId, sessionId); await reload(); }
    catch (cause) { setError(humanizeIdentityError(cause)); }
    finally { setBusyId(""); }
  }
  if (loading) return <LoadingState label="Memuat sesi akun…" />;
  return <div className={styles.detailSection}>
    {error ? <p role="alert" className={styles.formHint}>{error}</p> : null}
    {sessions.length ? sessions.map((session) => <div className={styles.membership} key={session.session_id}>
      <div className={styles.membershipHeader}><strong>{session.session_id}</strong><Status label={session.revoked ? "Dicabut" : session.expired ? "Kedaluwarsa" : "Aktif"} variant={session.revoked || session.expired ? "neutral" : "success"} /></div>
      <div className={styles.detailGrid}><DetailItem label="Dibuat" value={new Date(session.issued_at).toLocaleString("id-ID")} /><DetailItem label="Berakhir" value={new Date(session.expires_at).toLocaleString("id-ID")} /><DetailItem label="Workspace Aktif" value={workspaceLabel(workspaces.find((item) => item.workspace_id === session.active_workspace_id))} /><DetailItem label="Aktivitas Terakhir" value={session.last_activity_at ? new Date(session.last_activity_at).toLocaleString("id-ID") : "—"} /></div>
      {!session.revoked && !session.expired ? <Button disabled={busyId === session.session_id} onClick={() => void revoke(session.session_id)} size="sm" variant="ghost">{busyId === session.session_id ? "Mencabut…" : "Cabut Sesi"}</Button> : null}
    </div>) : <ItSourceStateView description="Akun ini belum memiliki sesi autentikasi." state="connected-empty" title="Sesi" />}
  </div>;
}

function IdentityHistorySection({ actorId }: Readonly<{ actorId: string }>) {
  const [rows, setRows] = useState<AuditReadinessRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    void listActorIdentityHistory(actorId).then((history) => {
      if (cancelled) return;
      setRows(history.map((item) => ({ id: `${item.occurred_at}:${item.event_type}:${item.entity_id}`, occurredAt: new Date(item.occurred_at).toLocaleString("id-ID"), activity: item.event_type, object: item.entity_type, workspace: item.workspace_id ?? "—", actor: item.actor_id, result: item.outcome, source: "Backend" })));
    }).catch((cause: unknown) => { if (!cancelled) setError(humanizeIdentityError(cause)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [actorId]);
  return <div className={styles.detailSection}>
    {error ? <p role="alert" className={styles.formHint}>{error}</p> : null}
    {loading ? <LoadingState label="Memuat riwayat identitas…" /> : <DataTable caption="Riwayat akses dan aktivitas administrasi akun" columns={auditColumns} emptyState={<ItSourceStateView description="Belum ada perubahan identitas yang tercatat." state="connected-empty" title="Riwayat" />} rows={rows} />}
  </div>;
}

function DetailItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return <div><span className={styles.detailLabel}>{label}</span><span className={styles.detailValue}>{value}</span></div>;
}

function AccountReadinessDialog({ candidates = [], formRoles, formWorkspaces, onClose, onCreated, open }: Readonly<{ candidates?: readonly ProvisioningCandidateProjection[]; formRoles: readonly AuthorizationRole[]; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; onCreated: () => void; open: boolean }>) {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [role, setRole] = useState<AuthorizationRole | "">("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiresDate, setExpiresDate] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const employee = candidates.find((candidate) => candidate.employee_id === employeeId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employee || !role || !workspaceId) return;
    setBusy(true); setError("");
    try {
      await provisionAccount({ employee_id: employee.employee_id, email: email || employee.email || "", workspace_id: workspaceId, role_refs: [role], effective_at: new Date(`${effectiveDate}T00:00:00Z`).toISOString(), expires_at: expiresDate ? new Date(`${expiresDate}T23:59:59Z`).toISOString() : null, note: note || null });
      onCreated();
    } catch (cause) { setError(humanizeIdentityError(cause)); }
    finally { setBusy(false); }
  }
  return <UiDialog description="Pilih karyawan yang memenuhi syarat. Karyawan akan membuat kata sandi sendiri saat aktivasi." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled={busy || !employee || !role || !workspaceId} form="identity-provision-form" type="submit">{busy ? "Menyimpan…" : "Daftarkan Akun"}</Button></>} onClose={onClose} open={open} size="lg" title="Daftarkan Akun Karyawan">
    <form id="identity-provision-form" onSubmit={(event) => void submit(event)}>
      <section aria-labelledby="it-register-employee"><h3 id="it-register-employee">1. Karyawan</h3>
        <FormField description="Pilihan hanya memuat karyawan aktif yang belum terhubung ke akun." htmlFor="it-employee-ref" label="Karyawan" required><select className={styles.formControl} id="it-employee-ref" onChange={(event) => setEmployeeId(event.target.value)} required value={employeeId}><option value="">Pilih karyawan</option>{candidates.map((candidate) => <option key={candidate.employee_id} value={candidate.employee_id}>{candidate.full_name} · {candidate.employee_number}</option>)}</select></FormField>
        <div className={styles.detailGrid}><DetailItem label="Nama" value={employee?.full_name ?? "—"} /><DetailItem label="ID Karyawan" value={employee?.employee_number ?? employee?.employee_id ?? "—"} /><DetailItem label="Jabatan" value={employee?.position_title ?? "—"} /><DetailItem label="Divisi" value={employee?.department_code ?? "—"} /></div>
      </section>
      <section aria-labelledby="it-register-identity"><h3 id="it-register-identity">2. Identitas Akun</h3>
        <FormField htmlFor="it-login-identifier" label="Email Akun" required><input className={styles.formControl} id="it-login-identifier" onChange={(event) => setEmail(event.target.value)} placeholder="Alamat email" required type="email" value={email || employee?.email || ""} /></FormField>
      </section>
      <section aria-labelledby="it-register-access"><h3 id="it-register-access">3. Workspace & Role</h3>
        <FormField htmlFor="it-primary-workspace" label="Workspace Utama" required><select className={styles.formControl} id="it-primary-workspace" onChange={(event) => setWorkspaceId(event.target.value)} required value={workspaceId}><option value="">Pilih workspace</option>{formWorkspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.workspace_name}</option>)}</select></FormField>
        <FormField htmlFor="it-role" label="Role" required><select className={styles.formControl} id="it-role" onChange={(event) => setRole(event.target.value as AuthorizationRole)} required value={role}><option value="">Pilih role</option>{assignableRoleOptions.filter((item) => isSupportedRole(item.value, formRoles)).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></FormField>
        <div className={styles.formGrid}><FormField htmlFor="it-effective-date" label="Tanggal Aktif" required><input className={styles.formControl} id="it-effective-date" onChange={(event) => setEffectiveDate(event.target.value)} required type="date" value={effectiveDate} /></FormField><FormField htmlFor="it-expiration-date" label="Tanggal Berakhir"><input className={styles.formControl} id="it-expiration-date" onChange={(event) => setExpiresDate(event.target.value)} type="date" value={expiresDate} /></FormField><FormField htmlFor="it-account-note" label="Catatan"><textarea className={styles.formControl} id="it-account-note" onChange={(event) => setNote(event.target.value)} rows={3} value={note} /></FormField></div>
      </section>
      {error ? <p role="alert" className={styles.formHint}>{error}</p> : null}
    </form>
  </UiDialog>;
}

function GovernanceReadinessDialog({ account, action, onClose, onSaved, open }: Readonly<{ account: IdentityAccountProjection | null; action: GovernanceAction | null; onClose: () => void; onSaved: () => void; open: boolean }>) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account || !action) return;
    setBusy(true); setError("");
    try { await changeAccountState(account.actor_id, action === "activate", reason); onSaved(); }
    catch (cause) { setError(humanizeIdentityError(cause)); }
    finally { setBusy(false); }
  }
  return <UiDialog description="Perubahan status akun dicatat oleh Backend dan tidak mengubah data kepegawaian." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled={busy || !reason.trim()} form="identity-governance-form" type="submit">{busy ? "Menyimpan…" : action === "suspend" ? "Tangguhkan Akun" : "Aktifkan Kembali"}</Button></>} onClose={onClose} open={open} title={action === "suspend" ? "Tangguhkan Akun" : "Aktifkan Kembali"}>
    <form id="identity-governance-form" onSubmit={(event) => void submit(event)}><div className={styles.formGrid}>
      <FormField htmlFor="governance-user" label="Akun" required><input className={styles.formControl} id="governance-user" readOnly value={account?.display_name || "—"} /></FormField>
      <FormField description="Status akun tidak mengubah status kepegawaian." htmlFor="governance-reason" label="Alasan" required><textarea className={styles.formControl} id="governance-reason" onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan alasan perubahan" required rows={3} value={reason} /></FormField>
    </div>{error ? <p role="alert" className={styles.formHint}>{error}</p> : null}</form>
  </UiDialog>;
}

function MembershipReadinessDialog({ account, action, formRoles, formWorkspaces, onClose, onSaved, open, workspace }: Readonly<{ account: IdentityAccountProjection | null; action: MembershipAction | null; formRoles: readonly AuthorizationRole[]; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; onSaved: () => void; open: boolean; workspace: WorkspaceProjection | null }>) {
  const revoke = action === "revoke";
  const edit = action === "edit";
  const title = revoke ? "Cabut Akses" : edit ? "Edit Akses" : "Tambah Workspace";
  const existing = account?.workspace_access.find((item) => item.workspace.workspace_id === workspace?.workspace_id);
  const [workspaceId, setWorkspaceId] = useState(workspace?.workspace_id ?? "");
  const [role, setRole] = useState<AuthorizationRole | "">(existing?.role_refs[0] ?? "");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiresDate, setExpiresDate] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    setBusy(true); setError("");
    try {
      if (revoke) await revokeMembership(account.actor_id, workspaceId, note);
      else {
        if (!role || !workspaceId) return;
        const payload = { workspace_id: workspaceId, role_refs: [role] as [AuthorizationRole], effective_at: new Date(`${effectiveDate}T00:00:00Z`).toISOString(), expires_at: expiresDate ? new Date(`${expiresDate}T23:59:59Z`).toISOString() : null, note: note || null };
        if (edit) await updateMembership(account.actor_id, payload);
        else await addMembership(account.actor_id, payload);
      }
      onSaved();
    } catch (cause) { setError(humanizeIdentityError(cause)); }
    finally { setBusy(false); }
  }
  return <UiDialog description="Perubahan workspace dan role diproses oleh Backend dan tercatat pada audit identitas." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled={busy || (!revoke && !role)} form="identity-membership-form" type="submit">{busy ? "Menyimpan…" : title}</Button></>} onClose={onClose} open={open} size="lg" title={title}>
    <form id="identity-membership-form" onSubmit={(event) => void submit(event)}><div className={styles.formGrid}>
      <FormField htmlFor="membership-account" label="Akun" required><input className={styles.formControl} id="membership-account" readOnly value={account?.display_name || "—"} /></FormField>
      <FormField htmlFor="membership-workspace" label="Workspace" required><select className={styles.formControl} disabled={edit || revoke} id="membership-workspace" onChange={(event) => setWorkspaceId(event.target.value)} required value={workspaceId}><option value="">Pilih workspace</option>{formWorkspaces.filter((candidate) => edit || revoke || !account?.workspace_access.some((access) => access.workspace.workspace_id === candidate.workspace_id)).map((candidate) => <option key={candidate.workspace_id} value={candidate.workspace_id}>{candidate.workspace_name}</option>)}</select></FormField>
      {!revoke ? <FormField htmlFor="membership-role" label="Role" required><select className={styles.formControl} id="membership-role" onChange={(event) => setRole(event.target.value as AuthorizationRole)} required value={role}><option value="">Pilih role</option>{assignableRoleOptions.filter((item) => isSupportedRole(item.value, formRoles)).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></FormField> : null}
      {!revoke ? <FormField htmlFor="membership-effective-date" label="Tanggal Aktif" required><input className={styles.formControl} id="membership-effective-date" onChange={(event) => setEffectiveDate(event.target.value)} required type="date" value={effectiveDate} /></FormField> : null}
      {!revoke ? <FormField htmlFor="membership-expiration-date" label="Tanggal Berakhir"><input className={styles.formControl} id="membership-expiration-date" onChange={(event) => setExpiresDate(event.target.value)} type="date" value={expiresDate} /></FormField> : null}
      <div className={styles.formFull}><FormField htmlFor="membership-reason" label={revoke ? "Alasan" : "Alasan / Catatan"} required={revoke}><textarea className={styles.formControl} id="membership-reason" onChange={(event) => setNote(event.target.value)} placeholder="Jelaskan kebutuhan atau alasan perubahan" required={revoke} rows={3} value={note} /></FormField></div>
      <div className={styles.formFull}><FormField htmlFor="membership-evidence" label="Bukti Pendukung"><input className={styles.formControl} id="membership-evidence" placeholder="Nomor arsip, dokumen, atau tautan referensi" /></FormField></div>
    </div>{error ? <p role="alert" className={styles.formHint}>{error}</p> : null}<p className={styles.formHint}>{revoke ? "Pencabutan bukan penghapusan; riwayat membership harus tetap dapat diaudit." : "Workspace tambahan tidak diberikan otomatis dan perubahan membership tidak membuat ulang akun."}</p></form>
  </UiDialog>;
}

function AccessState({ retry, text, title }: Readonly<{ retry?: () => void; text: string; title: string }>) {
  return <main className={styles.accessState}><div className={styles.accessCard}><h1 className={styles.accessTitle}>{title}</h1><p className={styles.accessText}>{text}</p>{retry ? <div className={styles.actions}><Button onClick={retry} size="sm" variant="secondary">Coba lagi</Button></div> : null}</div></main>;
}
