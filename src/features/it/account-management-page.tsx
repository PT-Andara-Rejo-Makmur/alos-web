"use client";

import { Plus, UserRound, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { navigationForItWorkspace } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button, DataTable, Dialog as UiDialog, Drawer, EmptyState, FormField, LoadingState, Metric, PageHeader, Status, Tabs, Toolbar, type DataTableColumn } from "@/components/ui";
import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";
import type { AuthorizationRole, IdentityAccountProjection, WorkspaceProjection } from "@/lib/contracts";

import { listAssignableRoles, listIdentityAccounts, listIdentityWorkspaces } from "./account-management-api";
import { activeWorkspaceKey, hasItAccountManagementAccess } from "./account-management-model";
import { activeItWorkspaceKey, identityRoleLabel, mvpRoleOptions } from "./it-model";
import { ItSourceStateView } from "./shared/it-ui";
import styles from "./account-management-page.module.css";

type PageState = "loading" | "ready" | "denied" | "session_expired" | "error";
type GovernanceAction = "suspend";
type MembershipAction = "add" | "edit" | "revoke";

const accountTabs = ["Belum Memiliki Akun", "Menunggu Aktivasi", "Aktif", "Ditangguhkan", "Dinonaktifkan", "Semua"];
const accountSummary = ["Belum Memiliki Akun", "Menunggu Aktivasi", "Akun Aktif", "Akun Ditangguhkan", "Akses Perlu Review"];

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

function targetRoleOptionLabel(role: (typeof mvpRoleOptions)[number], roles: readonly AuthorizationRole[]): string {
  if (!isSupportedRole(role.value, roles)) return `${role.label} — belum tersedia`;
  if (role.value === "IT_ADMIN") return `${role.label} — memerlukan kewenangan terpisah`;
  return role.label;
}

function primaryWorkspaceUnknown(): string {
  return "—";
}

export function AccountManagementPage({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [accounts, setAccounts] = useState<IdentityAccountProjection[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceProjection[]>([]);
  const [roles, setRoles] = useState<AuthorizationRole[]>([]);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [accountTab, setAccountTab] = useState("Semua");
  const [selectedAccount, setSelectedAccount] = useState<IdentityAccountProjection | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [governanceAction, setGovernanceAction] = useState<GovernanceAction | null>(null);
  const [governanceAccount, setGovernanceAccount] = useState<IdentityAccountProjection | null>(null);
  const [membershipAction, setMembershipAction] = useState<MembershipAction | null>(null);
  const [membershipAccount, setMembershipAccount] = useState<IdentityAccountProjection | null>(null);
  const [membershipWorkspace, setMembershipWorkspace] = useState<WorkspaceProjection | null>(null);

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
      if (accountTab === "Aktif" && !account.active) return false;
      if (["Belum Memiliki Akun", "Menunggu Aktivasi", "Ditangguhkan", "Dinonaktifkan"].includes(accountTab)) return false;
      if (!query) return true;
      // Employee name and Employee ID are intentionally excluded until HR linkage exists.
      return [account.email, ...account.workspace_access.flatMap((access) => [access.workspace.workspace_name, ...access.role_refs.map(identityRoleLabel)])].join(" ").toLowerCase().includes(query);
    });
  }, [accountTab, accounts, search]);

  const columns: readonly DataTableColumn<IdentityAccountProjection>[] = [
    { header: "Nama", key: "employee-name", render: () => <div className={styles.cellPrimary}><strong>—</strong><span className={styles.cellSecondary}>Sumber HR belum terhubung</span></div> },
    { header: "ID Karyawan", key: "employee-id", render: () => "—" },
    { header: "Jabatan", key: "position", render: () => "—" },
    { header: "Workspace Utama", key: "primary-workspace", render: () => <div className={styles.cellPrimary}><strong>{primaryWorkspaceUnknown()}</strong><span className={styles.cellSecondary}>Penanda ruang kerja utama belum tersedia</span></div> },
    { header: "Role Utama", key: "primary-role", render: () => <div className={styles.cellPrimary}><strong>—</strong><span className={styles.cellSecondary}>Role utama belum tersedia</span></div> },
    { header: "Email", key: "account-email", render: (account) => account.email || "—" },
    { header: "Status Akun", key: "account-status", render: (account) => <Status label={account.active ? "Aktif" : "Nonaktif"} variant={account.active ? "success" : "neutral"} /> },
    { header: "Status Aktivasi", key: "activation-status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
    { header: "Login Terakhir", key: "last-login", render: () => "—" },
  ];

  if (pageState === "loading") return <LoadingState label="Memeriksa hak akses IT…" variant="page" />;
  if (pageState === "session_expired") return <AccessState title="Sesi Anda sudah berakhir." text="Silakan masuk kembali untuk melanjutkan." />;
  if (pageState === "denied") return <AccessState title="Anda tidak memiliki akses ke halaman ini." text="Halaman ini tersedia untuk ruang kerja IT aktif dan kewenangan pengelolaan akun yang diberikan." />;
  if (pageState === "error") return <AccessState title="Data belum dapat dimuat." text={humanizeIdentityError(loadError)} retry={() => { setPageState("loading"); void loadData(); }} />;
  if (!session) return null;

  const actualWorkspaceKey = activeWorkspaceKey(session) ?? workspaceKey;
  const activeWorkspaceName = activeMembership(session)?.workspace.workspace_name ?? "—";
  const emptyTitle = ["Semua", "Aktif"].includes(accountTab) ? "Belum ada data" : "Belum Terhubung";
  const emptyDescription = emptyTitle === "Belum Terhubung" ? "Status ini menunggu sumber lifecycle akun dan aktivasi resmi." : "Belum ada akun yang sesuai dengan tampilan saat ini.";
  const manageMemberships = canManageMemberships(session);

  return <AppShell navigationSections={navigationForItWorkspace(actualWorkspaceKey)} session={session}>
    <div className={styles.page}>
      <PageHeader actions={<Button iconBefore={<Plus size={16} />} onClick={() => setCreateOpen(true)} variant="primary">Daftarkan Akun</Button>} description="Daftarkan dan kelola akun sistem berdasarkan data tenaga kerja yang telah tersedia." eyebrow="AKSES & IDENTITAS" metadata={`Ruang kerja aktif: ${activeWorkspaceName}`} title="Akun Karyawan" />
      <section aria-label="Ringkasan akun" className={styles.summaryGrid}>{accountSummary.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
      <Tabs ariaLabel="Filter akun karyawan" items={accountTabs.map((label) => ({ id: label, label }))} onValueChange={setAccountTab} value={accountTab} />
      <Toolbar search={<div className={styles.toolbarSearch}><Users aria-hidden="true" size={16} /><input aria-label="Cari akun" onChange={(event) => setSearch(event.target.value)} placeholder="Cari email, ruang kerja, atau role…" type="search" value={search} /></div>} />
      <p className={styles.formHint}>Pencarian Nama dan ID Karyawan tersedia setelah sumber HR terhubung.</p>
      <DataTable caption={`Daftar akun karyawan — ${accountTab}`} columns={columns} emptyState={<EmptyState icon={<UserRound size={24} />} title={emptyTitle} description={emptyDescription} />} getRowKey={(account) => account.actor_id} loading={false} rowAction={(account) => <Button onClick={() => setSelectedAccount(account)} size="sm" variant="ghost">Lihat Detail</Button>} rows={filteredAccounts} />
    </div>
    <AccountDetailDrawer account={selectedAccount} canManageMemberships={manageMemberships} formWorkspaces={workspaces} key={selectedAccount?.actor_id ?? "empty-account"} onGovernance={(account) => { setGovernanceAction("suspend"); setGovernanceAccount(account); }} onMembership={(action, account, workspace) => { setMembershipAction(action); setMembershipAccount(account); setMembershipWorkspace(workspace ?? null); }} onClose={() => setSelectedAccount(null)} open={Boolean(selectedAccount)} />
    <AccountReadinessDialog formRoles={roles} formWorkspaces={workspaces} onClose={() => setCreateOpen(false)} open={createOpen} />
    <GovernanceReadinessDialog account={governanceAccount} action={governanceAction} onClose={() => { setGovernanceAction(null); setGovernanceAccount(null); }} open={Boolean(governanceAction)} />
    <MembershipReadinessDialog action={membershipAction} account={membershipAccount} formRoles={roles} formWorkspaces={workspaces} onClose={() => { setMembershipAction(null); setMembershipAccount(null); setMembershipWorkspace(null); }} open={Boolean(membershipAction)} workspace={membershipWorkspace} />
  </AppShell>;
}

function AccountDetailDrawer({ account, canManageMemberships, formWorkspaces, onClose, onGovernance, onMembership, open }: Readonly<{ account: IdentityAccountProjection | null; canManageMemberships: boolean; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; onGovernance: (account: IdentityAccountProjection) => void; onMembership: (action: MembershipAction, account: IdentityAccountProjection, workspace?: WorkspaceProjection) => void; open: boolean }>) {
  const [activeTab, setActiveTab] = useState("Ringkasan");
  if (!account) return null;
  const memberships = account.workspace_access;
  const tabs = ["Ringkasan", "Workspace & Akses", "Sesi", "Riwayat"];
  return <Drawer description="Informasi akun, akses, sesi, dan riwayat mengikuti sumber identitas resmi." footer={<Button onClick={onClose} variant="secondary">Tutup</Button>} onClose={onClose} open={open} title="Detail Akun Karyawan">
    <Tabs ariaLabel="Detail akun karyawan" items={tabs.map((label) => ({ id: label, label }))} onValueChange={setActiveTab} value={activeTab} />
    {activeTab === "Ringkasan" ? <div className={styles.detailSection}>
      <div className={styles.detailGrid}>
        <DetailItem label="Nama Akun" value={account.display_name || "—"} />
        <DetailItem label="ID Karyawan" value="—" />
        <DetailItem label="Jabatan" value="—" />
        <DetailItem label="Divisi" value="—" />
        <DetailItem label="Email Akun" value={account.email || "—"} />
        <DetailItem label="Status Akun" value={account.active ? "Aktif" : "Nonaktif"} />
        <DetailItem label="Status Aktivasi" value="Belum Terhubung" />
        <DetailItem label="Workspace Utama" value={primaryWorkspaceUnknown()} />
        <DetailItem label="Status Kepegawaian" value="Belum Terhubung" />
        <DetailItem label="Login Terakhir" value="—" />
        <DetailItem label="Tanggal Dibuat" value="—" />
      </div>
      <div className={styles.actions}>
        <Button disabled variant="secondary">Edit Akun belum tersedia</Button>
        <Button disabled variant="secondary">Kirim Ulang Aktivasi belum tersedia</Button>
        <Button disabled variant="secondary">Reset Akses belum tersedia</Button>
        {account.active ? <Button onClick={() => onGovernance(account)} variant="secondary">Ajukan Penangguhan Akun</Button> : <Button disabled variant="secondary">Aktifkan Kembali belum tersedia</Button>}
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
    {activeTab === "Sesi" ? <div className={styles.detailSection}><ItSourceStateView description="Perangkat, peramban, waktu dibuat, dan aktivitas terakhir akan tampil setelah sumber sesi tersedia." state="unavailable" title="Sesi" /><Button disabled variant="secondary">Cabut Sesi belum tersedia</Button></div> : null}
    {activeTab === "Riwayat" ? <div className={styles.detailSection}><ItSourceStateView description="Riwayat akses dan aktivitas administrasi akun belum tersedia dari sumber audit identitas." state="unavailable" title="Riwayat" /></div> : null}
  </Drawer>;
}

function DetailItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return <div><span className={styles.detailLabel}>{label}</span><span className={styles.detailValue}>{value}</span></div>;
}

function AccountReadinessDialog({ formRoles, formWorkspaces, onClose, open }: Readonly<{ formRoles: readonly AuthorizationRole[]; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; open: boolean }>) {
  return <UiDialog description="Pendaftaran akun menunggu sumber karyawan dan alur aktivasi resmi. Antarmuka tidak meminta kata sandi atau membuat akun secara lokal." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled type="button">Pendaftaran akun belum tersedia</Button></>} onClose={onClose} open={open} size="lg" title="Daftarkan Akun Karyawan">
    <form onSubmit={(event) => event.preventDefault()}>
      <section aria-labelledby="it-register-employee"><h3 id="it-register-employee">1. Karyawan</h3>
        <FormField description="Karyawan hanya dapat dipilih dari sumber HR resmi." htmlFor="it-employee-ref" label="Karyawan" required><select className={styles.formControl} disabled id="it-employee-ref"><option>Pilihan karyawan belum tersedia.</option></select></FormField>
        <div className={styles.detailGrid}><DetailItem label="Nama" value="—" /><DetailItem label="ID Karyawan" value="—" /><DetailItem label="Jabatan" value="—" /><DetailItem label="Divisi" value="—" /></div>
      </section>
      <section aria-labelledby="it-register-identity"><h3 id="it-register-identity">2. Identitas Akun</h3>
        <FormField htmlFor="it-login-identifier" label="Email Akun" required><input className={styles.formControl} id="it-login-identifier" placeholder="Alamat email atau nama pengguna" /></FormField>
      </section>
      <section aria-labelledby="it-register-access"><h3 id="it-register-access">3. Workspace & Role</h3>
        <FormField description={formWorkspaces.length ? "Penanda workspace utama belum tersedia dari sumber identitas resmi." : "Pilihan ruang kerja belum tersedia."} htmlFor="it-primary-workspace" label="Workspace Utama" required><select className={styles.formControl} disabled={formWorkspaces.length === 0} id="it-primary-workspace"><option value="">{formWorkspaces.length ? "Pilih workspace" : "Pilihan workspace belum tersedia."}</option>{formWorkspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.workspace_name}</option>)}</select></FormField>
        <FormField description="Role lama yang sudah ada tidak digunakan untuk penugasan baru. Role target yang belum ada di katalog tetap dinonaktifkan." htmlFor="it-role" label="Role" required><select className={styles.formControl} disabled={formRoles.length === 0} id="it-role"><option value="">{formRoles.length ? "Pilih role" : "Pilihan role belum tersedia."}</option>{mvpRoleOptions.map((role) => <option disabled={!isSupportedRole(role.value, formRoles) || role.value === "IT_ADMIN"} key={role.value} value={role.value}>{targetRoleOptionLabel(role, formRoles)}</option>)}</select></FormField>
        <div className={styles.formGrid}><FormField htmlFor="it-effective-date" label="Tanggal Aktif" required><input className={styles.formControl} id="it-effective-date" type="date" /></FormField><FormField htmlFor="it-expiration-date" label="Tanggal Berakhir"><input className={styles.formControl} id="it-expiration-date" type="date" /></FormField></div>
      </section>
      <section aria-labelledby="it-register-review"><h3 id="it-register-review">4. Review</h3>
        <div className={styles.detailGrid}><DetailItem label="Karyawan" value="Belum Terhubung" /><DetailItem label="Employee ID" value="—" /><DetailItem label="Email Akun" value="—" /><DetailItem label="Workspace Utama" value={primaryWorkspaceUnknown()} /><DetailItem label="Role" value="Belum Dinilai" /><DetailItem label="Tanggal Aktif" value="—" /><DetailItem label="Tanggal Berakhir" value="—" /><DetailItem label="Catatan" value="—" /></div>
        <p className={styles.formHint}>Aktivasi aman dan penentuan kata sandi dilakukan oleh karyawan melalui layanan resmi. Jenis akun belum menjadi pilihan pendaftaran.</p>
      </section>
    </form>
  </UiDialog>;
}

function GovernanceReadinessDialog({ account, action, onClose, open }: Readonly<{ account: IdentityAccountProjection | null; action: GovernanceAction | null; onClose: () => void; open: boolean }>) {
  return <UiDialog description="Penangguhan akun memerlukan alasan, waktu berlaku, bukti, dan alur resmi." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled type="button">Pengajuan belum tersedia</Button></>} onClose={onClose} open={open} title={action === "suspend" ? "Ajukan Penangguhan Akun" : "Tindakan Akun"}>
    <form onSubmit={(event) => event.preventDefault()}><div className={styles.formGrid}>
      <FormField htmlFor="governance-user" label="Akun" required><input className={styles.formControl} id="governance-user" readOnly value={account?.display_name || "—"} /></FormField>
      <FormField description="Status akun tidak mengubah status kepegawaian." htmlFor="governance-reason" label="Alasan" required><textarea className={styles.formControl} id="governance-reason" placeholder="Jelaskan alasan pengajuan" required rows={3} /></FormField>
      <FormField htmlFor="governance-effective-at" label="Tanggal Berlaku" required><input className={styles.formControl} id="governance-effective-at" required type="datetime-local" /></FormField>
      <FormField htmlFor="governance-evidence" label="Bukti Pendukung"><input className={styles.formControl} id="governance-evidence" placeholder="Nomor arsip, dokumen, atau tautan referensi" /></FormField>
    </div><p className={styles.formHint}>Penangguhan akun berbeda dari pemutusan hubungan kerja. Tidak ada perubahan akun yang dikirim.</p></form>
  </UiDialog>;
}

function MembershipReadinessDialog({ account, action, formRoles, formWorkspaces, onClose, open, workspace }: Readonly<{ account: IdentityAccountProjection | null; action: MembershipAction | null; formRoles: readonly AuthorizationRole[]; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; open: boolean; workspace: WorkspaceProjection | null }>) {
  const revoke = action === "revoke";
  const edit = action === "edit";
  const title = revoke ? "Cabut Akses" : edit ? "Edit Akses" : "Tambah Workspace";
  return <UiDialog description="Perubahan workspace dan role menunggu sumber identitas resmi yang mendukung tanggal berlaku, konflik, dan riwayat." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled type="button">Penyimpanan akses belum tersedia</Button></>} onClose={onClose} open={open} size="lg" title={title}>
    <form onSubmit={(event) => event.preventDefault()}><div className={styles.formGrid}>
      <FormField htmlFor="membership-account" label="Akun" required><input className={styles.formControl} id="membership-account" readOnly value={account?.display_name || "—"} /></FormField>
      <FormField htmlFor="membership-workspace" label="Workspace" required><select className={styles.formControl} disabled={edit || revoke || formWorkspaces.length === 0} id="membership-workspace"><option value="">{workspace?.workspace_name ?? (formWorkspaces.length ? "Pilih workspace" : "Pilihan workspace belum tersedia.")}</option>{!edit && !revoke ? formWorkspaces.map((candidate) => <option key={candidate.workspace_id} value={candidate.workspace_id}>{candidate.workspace_name}</option>) : null}</select></FormField>
      {!revoke ? <FormField description="Role utama berlaku dalam workspace ini. Role target yang belum ada di katalog tetap dinonaktifkan." htmlFor="membership-role" label="Role" required><select className={styles.formControl} disabled={formRoles.length === 0} id="membership-role"><option value="">Pilih role</option>{mvpRoleOptions.map((role) => <option disabled={!isSupportedRole(role.value, formRoles) || role.value === "IT_ADMIN"} key={role.value} value={role.value}>{targetRoleOptionLabel(role, formRoles)}</option>)}</select></FormField> : null}
      {!revoke ? <FormField htmlFor="membership-effective-date" label="Tanggal Aktif" required><input className={styles.formControl} id="membership-effective-date" required type="date" /></FormField> : null}
      {!revoke ? <FormField htmlFor="membership-expiration-date" label="Tanggal Berakhir"><input className={styles.formControl} id="membership-expiration-date" type="date" /></FormField> : null}
      {revoke ? <FormField description="Isi jika pencabutan dijadwalkan." htmlFor="membership-effective-at" label="Berlaku Mulai"><input className={styles.formControl} id="membership-effective-at" type="datetime-local" /></FormField> : null}
      <div className={styles.formFull}><FormField htmlFor="membership-reason" label={revoke ? "Alasan" : "Alasan / Catatan"} required={revoke}><textarea className={styles.formControl} id="membership-reason" placeholder="Jelaskan kebutuhan atau alasan perubahan" required={revoke} rows={3} /></FormField></div>
      <div className={styles.formFull}><FormField htmlFor="membership-evidence" label="Bukti Pendukung"><input className={styles.formControl} id="membership-evidence" placeholder="Nomor arsip, dokumen, atau tautan referensi" /></FormField></div>
    </div><p className={styles.formHint}>{revoke ? "Pencabutan bukan penghapusan; riwayat membership harus tetap dapat diaudit." : "Workspace tambahan tidak diberikan otomatis dan perubahan membership tidak membuat ulang akun."}</p></form>
  </UiDialog>;
}

function AccessState({ retry, text, title }: Readonly<{ retry?: () => void; text: string; title: string }>) {
  return <main className={styles.accessState}><div className={styles.accessCard}><h1 className={styles.accessTitle}>{title}</h1><p className={styles.accessText}>{text}</p>{retry ? <div className={styles.actions}><Button onClick={retry} size="sm" variant="secondary">Coba lagi</Button></div> : null}</div></main>;
}
