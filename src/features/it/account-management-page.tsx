"use client";

import { Plus, UserRound, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { navigationForItWorkspace } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button, DataTable, Dialog as UiDialog, Drawer, EmptyState, FormField, LoadingState, Metric, PageHeader, Status, Tabs, Toolbar, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { AuthorizationRole, IdentityAccountProjection, WorkspaceProjection } from "@/lib/contracts";
import { ApiError, sessionApiRequest } from "@/lib/api";
import { resolveWorkspaceDomain } from "@/features/session";

import { listAssignableRoles, listIdentityAccounts, listIdentityWorkspaces } from "./account-management-api";
import { activeWorkspaceKey, hasItAccountManagementAccess } from "./account-management-model";
import { activeItWorkspaceKey, identityRoleLabel } from "./it-model";
import { ItSourceStateView } from "./shared/it-ui";
import styles from "./account-management-page.module.css";

type PageState = "loading" | "ready" | "denied" | "session_expired" | "error";
type GovernanceAction = "suspend" | "revoke";
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

function workspaceLabel(workspace: WorkspaceProjection | undefined): string { return workspace?.workspace_name ?? "—"; }

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
  const [governanceWorkspace, setGovernanceWorkspace] = useState<WorkspaceProjection | null>(null);

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
        if (!cancelled) { setLoadError(error); setPageState(error instanceof ApiError && error.status === 401 ? "session_expired" : "error"); }
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
      return [account.display_name, account.email, ...account.workspace_access.flatMap((access) => [access.workspace.workspace_name, ...access.role_refs.map(identityRoleLabel)])].join(" ").toLowerCase().includes(query);
    });
  }, [accountTab, accounts, search]);

  const columns: readonly DataTableColumn<IdentityAccountProjection>[] = [
    { header: "Nama Karyawan", key: "employee-name", render: () => <div className={styles.cellPrimary}><strong>—</strong><span className={styles.cellSecondary}>Sumber HR belum terhubung</span></div> },
    { header: "ID Karyawan", key: "employee-id", render: () => "—" },
    { header: "Divisi", key: "division", render: () => "—" },
    { header: "Jabatan", key: "position", render: () => "—" },
    { header: "Email Akun", key: "account-email", render: (account) => account.email || "—" },
    { header: "Workspace Utama", key: "primary-workspace", render: (account) => workspaceLabel(account.workspace_access.find((access) => access.active)?.workspace ?? account.workspace_access[0]?.workspace) },
    { header: "Status Akun", key: "account-status", render: (account) => <Status label={account.active ? "Aktif" : "Nonaktif"} variant={account.active ? "success" : "neutral"} /> },
    { header: "Status Aktivasi", key: "activation-status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
    { header: "Akses", key: "access-status", render: (account) => <Status label={account.workspace_access.some((access) => access.active) ? "Terhubung" : "Belum Terhubung"} variant={account.workspace_access.some((access) => access.active) ? "info" : "neutral"} /> },
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

  return <AppShell navigationSections={navigationForItWorkspace(actualWorkspaceKey)} session={session}>
    <div className={styles.page}>
      <PageHeader actions={<Button iconBefore={<Plus size={16} />} onClick={() => setCreateOpen(true)} variant="primary">Siapkan Akun</Button>} description="Daftarkan dan kelola akun sistem berdasarkan data tenaga kerja yang telah tersedia." eyebrow="AKSES & IDENTITAS" metadata={`Ruang kerja aktif: ${activeWorkspaceName}`} title="Akun Karyawan" />
      <section aria-label="Ringkasan akun" className={styles.summaryGrid}>{accountSummary.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
      <Tabs ariaLabel="Filter akun karyawan" items={accountTabs.map((label) => ({ id: label, label }))} onValueChange={setAccountTab} value={accountTab} />
      <Toolbar search={<div className={styles.toolbarSearch}><Users aria-hidden="true" size={16} /><input aria-label="Cari akun karyawan" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama akun, email, ruang kerja…" type="search" value={search} /></div>} />
      <DataTable caption={`Daftar akun karyawan — ${accountTab}`} columns={columns} emptyState={<EmptyState icon={<UserRound size={24} />} title={emptyTitle} description={emptyDescription} />} getRowKey={(account) => account.actor_id} loading={false} rowAction={(account) => <Button onClick={() => setSelectedAccount(account)} size="sm" variant="ghost">Lihat Detail</Button>} rows={filteredAccounts} />
    </div>
    <AccountDetailDrawer account={selectedAccount} canManageMemberships={canManageMemberships(session)} key={selectedAccount?.actor_id ?? "empty-account"} onGovernance={(action, account, workspace) => { setGovernanceAction(action); setGovernanceAccount(account); setGovernanceWorkspace(workspace ?? null); }} onClose={() => setSelectedAccount(null)} open={Boolean(selectedAccount)} workspaces={workspaces} />
    <AccountReadinessDialog formRoles={roles} formWorkspaces={workspaces} onClose={() => setCreateOpen(false)} open={createOpen} />
    <GovernanceReadinessDialog action={governanceAction} account={governanceAccount} onClose={() => { setGovernanceAction(null); setGovernanceAccount(null); setGovernanceWorkspace(null); }} open={Boolean(governanceAction)} workspace={governanceWorkspace} />
  </AppShell>;
}

function AccountDetailDrawer({ account, canManageMemberships, onClose, onGovernance, open, workspaces }: Readonly<{ account: IdentityAccountProjection | null; canManageMemberships: boolean; onClose: () => void; onGovernance: (action: GovernanceAction, account: IdentityAccountProjection, workspace?: WorkspaceProjection) => void; open: boolean; workspaces: readonly WorkspaceProjection[] }>) {
  const [activeTab, setActiveTab] = useState("Ringkasan");
  if (!account) return null;
  const memberships = account.workspace_access;
  const primaryWorkspace = memberships.find((access) => access.active)?.workspace ?? memberships[0]?.workspace;
  const tabs = ["Ringkasan", "Workspace & Akses", "Role", "Sesi", "Riwayat Akses", "Aktivitas Administratif"];
  return <Drawer description="Informasi akun, akses, dan riwayat mengikuti sumber identitas resmi." footer={<Button onClick={onClose} variant="secondary">Tutup</Button>} onClose={onClose} open={open} title="Detail Akun Karyawan">
    <Tabs ariaLabel="Detail akun karyawan" items={tabs.map((label) => ({ id: label, label }))} onValueChange={setActiveTab} value={activeTab} />
    {activeTab === "Ringkasan" ? <div className={styles.detailSection}><div className={styles.detailGrid}><DetailItem label="Nama Akun" value={account.display_name || "—"} /><DetailItem label="Email Akun" value={account.email || "—"} /><DetailItem label="Karyawan HR" value="Belum Terhubung" /><DetailItem label="Status Akun" value={account.active ? "Aktif" : "Nonaktif"} /><DetailItem label="Status Aktivasi" value="Belum Terhubung" /><DetailItem label="Workspace Utama" value={workspaceLabel(primaryWorkspace)} /><DetailItem label="Status Kepegawaian" value="Belum Terhubung" /><DetailItem label="Dibuat" value="—" /><DetailItem label="Login Terakhir" value="—" /></div></div> : null}
    {activeTab === "Workspace & Akses" ? <div className={styles.detailSection}><h3>Workspace & Akses</h3>{memberships.length ? memberships.map((access) => <div className={styles.membership} key={access.workspace.workspace_id}><div className={styles.membershipHeader}><div className={styles.membershipTitle}>{workspaceLabel(access.workspace)}</div><Status label={access.active ? "Aktif" : "Nonaktif"} variant={access.active ? "success" : "neutral"} /></div><div className={styles.stack}>{access.role_refs.length ? access.role_refs.map((role) => <span className={styles.tag} key={role}>{identityRoleLabel(role)}</span>) : "—"}</div>{canManageMemberships ? <Button onClick={() => onGovernance("revoke", account, access.workspace)} size="sm" variant="ghost">Ajukan Pencabutan Akses</Button> : null}</div>) : <ItSourceStateView description="Akun belum memiliki akses ruang kerja dari sumber yang tersedia." state="connected-empty" title="Akses" />}{workspaces.length === 0 ? <p className={styles.formHint}>Pilihan ruang kerja belum tersedia.</p> : null}</div> : null}
    {activeTab === "Role" ? <div className={styles.detailSection}><h3>Role</h3>{memberships.some((access) => access.role_refs.length) ? memberships.flatMap((access) => access.role_refs.map((role) => <div className={styles.membership} key={`${access.workspace.workspace_id}-${role}`}><span className={styles.detailValue}>{identityRoleLabel(role)}</span><span className={styles.cellSecondary}>{role === "IT_ADMIN" || role === "AI_ADMIN" ? "Memerlukan kewenangan dan persetujuan terpisah." : "Sumber role resmi."}</span></div>)) : <ItSourceStateView description="Katalog role belum memberikan penugasan untuk akun ini." state="connected-empty" title="Role" />}</div> : null}
    {activeTab === "Sesi" ? <div className={styles.detailSection}><ItSourceStateView description="Perangkat, peramban, waktu dibuat, dan aktivitas terakhir akan tampil setelah sumber sesi tersedia." state="unavailable" title="Sesi" /><Button disabled variant="secondary">Cabut Sesi belum tersedia</Button></div> : null}
    {activeTab === "Riwayat Akses" ? <div className={styles.detailSection}><ItSourceStateView description="Riwayat perubahan akses belum tersedia dari sumber audit identitas." state="unavailable" title="Riwayat Akses" /></div> : null}
    {activeTab === "Aktivitas Administratif" ? <div className={styles.detailSection}><ItSourceStateView description="Aktivitas administrasi akun belum tersedia dari sumber audit identitas." state="unavailable" title="Aktivitas Administratif" /></div> : null}
    <div className={styles.detailSection}><h3>Tindakan Governed</h3><Button onClick={() => onGovernance("suspend", account)} variant="secondary">Ajukan Penangguhan Akun</Button></div>
  </Drawer>;
}

function DetailItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div><span className={styles.detailLabel}>{label}</span><span className={styles.detailValue}>{value}</span></div>; }

function AccountReadinessDialog({ formRoles, formWorkspaces, onClose, open }: Readonly<{ formRoles: readonly AuthorizationRole[]; formWorkspaces: readonly WorkspaceProjection[]; onClose: () => void; open: boolean }>) {
  return <UiDialog description="Penyediaan akun menunggu sumber karyawan dan alur aktivasi resmi. Antarmuka tidak meminta kata sandi atau membuat akun secara lokal." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled type="button">Penyediaan akun belum tersedia</Button></>} onClose={onClose} open={open} size="lg" title="Siapkan Akun Karyawan">
    <form onSubmit={(event) => event.preventDefault()}>
      <div className={styles.formGrid}>
        <FormField htmlFor="it-employee-ref" label="Karyawan" required><select className={styles.formControl} disabled id="it-employee-ref"><option>Pilihan karyawan belum tersedia.</option></select></FormField>
        <FormField htmlFor="it-login-identifier" label="Email / Nama Pengguna" required><input className={styles.formControl} id="it-login-identifier" placeholder="Akan diisi dari sumber identitas resmi" /></FormField>
        <FormField htmlFor="it-primary-workspace" label="Ruang Kerja Utama" required><select className={styles.formControl} disabled={formWorkspaces.length === 0} id="it-primary-workspace"><option value="">{formWorkspaces.length ? "Pilih ruang kerja" : "Pilihan ruang kerja belum tersedia."}</option>{formWorkspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.workspace_name}</option>)}</select></FormField>
        <FormField htmlFor="it-role" label="Role" required><select className={styles.formControl} disabled={formRoles.length === 0} id="it-role"><option value="">{formRoles.length ? "Pilih role" : "Pilihan role belum tersedia."}</option>{formRoles.map((role) => <option disabled={role === "IT_ADMIN" || role === "AI_ADMIN"} key={role} value={role}>{identityRoleLabel(role)}{role === "IT_ADMIN" || role === "AI_ADMIN" ? " — memerlukan persetujuan" : ""}</option>)}</select></FormField>
        <FormField htmlFor="it-effective-date" label="Tanggal Berlaku" required><input className={styles.formControl} id="it-effective-date" type="date" /></FormField>
        <FormField htmlFor="it-expiration-date" label="Tanggal Berakhir"><input className={styles.formControl} id="it-expiration-date" type="date" /></FormField>
        <div className={styles.formFull}><FormField htmlFor="it-account-notes" label="Catatan"><textarea className={styles.formControl} id="it-account-notes" placeholder="Catatan permintaan akses" rows={3} /></FormField></div>
      </div>
      <p className={styles.formHint}>Kata sandi, kode aktivasi, dan ID internal dikelola oleh layanan resmi, bukan dimasukkan oleh IT. Pilihan karyawan belum terhubung ke sumber HR.</p>
    </form>
  </UiDialog>;
}

function GovernanceReadinessDialog({ account, action, onClose, open, workspace }: Readonly<{ account: IdentityAccountProjection | null; action: GovernanceAction | null; onClose: () => void; open: boolean; workspace: WorkspaceProjection | null }>) {
  const revoke = action === "revoke";
  return <UiDialog description={revoke ? "Pencabutan akses memerlukan alasan, waktu berlaku, bukti, dan alur resmi." : "Penangguhan akun memerlukan alasan, waktu berlaku, bukti, dan alur resmi."} footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled type="button">Pengajuan belum tersedia</Button></>} onClose={onClose} open={open} title={revoke ? "Ajukan Pencabutan Akses" : "Ajukan Penangguhan Akun"}>
    <form onSubmit={(event) => event.preventDefault()}><div className={styles.formGrid}>
      <FormField htmlFor="governance-user" label="User" required><input className={styles.formControl} id="governance-user" readOnly value={account?.display_name || "—"} /></FormField>
      {revoke ? <FormField htmlFor="governance-access" label="Akses" required><input className={styles.formControl} id="governance-access" readOnly value={workspace?.workspace_name || "—"} /></FormField> : null}
      <FormField htmlFor="governance-reason" label="Alasan" required><textarea className={styles.formControl} id="governance-reason" placeholder="Jelaskan alasan pengajuan" required rows={3} /></FormField>
      <FormField htmlFor="governance-effective-at" label="Berlaku Mulai" required><input className={styles.formControl} id="governance-effective-at" required type="datetime-local" /></FormField>
      <FormField htmlFor="governance-evidence" label="Bukti Pendukung"><input className={styles.formControl} id="governance-evidence" placeholder="Nomor arsip, dokumen, atau tautan referensi" /></FormField>
    </div><p className={styles.formHint}>Penyimpanan dan keputusan governance belum tersedia. Tidak ada perubahan akun atau akses yang dikirim.</p></form>
  </UiDialog>;
}

function AccessState({ retry, text, title }: Readonly<{ retry?: () => void; text: string; title: string }>) { return <main className={styles.accessState}><div className={styles.accessCard}><h1 className={styles.accessTitle}>{title}</h1><p className={styles.accessText}>{text}</p>{retry ? <div className={styles.actions}><Button onClick={retry} size="sm" variant="secondary">Coba lagi</Button></div> : null}</div></main>; }
