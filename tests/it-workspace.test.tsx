import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { activeItWorkspaceKey, hasItContext, identityRoleLabel, itNavigation, assignableRoleOptions } from "@/features/it";
import type { SessionProjection } from "@/features/session";

const itAccess = {
  active: true,
  data_scope: "COMPANY" as const,
  permission_refs: [],
  role_refs: ["IT_ADMIN" as const],
  scope_refs: [],
  workspace: { active: true, division_code: "IT", organization_id: "org_1", workspace_id: "ws_it", workspace_key: "it-utama", workspace_name: "IT", workspace_type: "IT_OPERATIONS" as const },
};

const itSession: SessionProjection = {
  authenticated: true,
  principal: {
    actor: { actor_id: "actor_it", active: true, display_name: "Admin IT", organization_id: "org_1", tenant_id: "tenant_1" },
    email: "it@example.test",
    workspace_access: [itAccess],
    active_workspace: itAccess,
    issued_at: "2026-09-01T00:00:00Z",
    expires_at: "2026-10-01T00:00:00Z",
  },
};

function source(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("IT frontend master matrix", () => {
  it("uses IT domain authority and rejects a workspace-key mismatch", () => {
    expect(hasItContext(itSession, "it-utama")).toBe(true);
    expect(hasItContext(itSession, "it-lain")).toBe(false);
    expect(activeItWorkspaceKey(itSession)).toBe("it-utama");
  });

  it("keeps the usable IT sidebar with encoded workspace identity", () => {
    const sections = itNavigation("it utama");
    expect(sections.flatMap((section) => section.items)).toHaveLength(19);
    expect(sections.map((section) => section.label)).toEqual(["PUSAT IT", "PLATFORM & SISTEM", "AKSES & IDENTITAS", "PERUBAHAN", "KINERJA", "PEKERJAAN", "ARA"]);
    expect(sections.flatMap((section) => section.items).every((item) => item.href.startsWith("/workspace/it%20utama/"))).toBe(true);
  });

  it("maps role labels without leaking raw canonical enums", () => {
    expect(identityRoleLabel("IT_ADMIN")).toBe("Administrator IT");
    expect(identityRoleLabel("EXECUTIVE")).toBe("Direktur");
    expect(identityRoleLabel("DIVISION_LEAD")).toBe("Manajer / Kepala Divisi");
    expect(identityRoleLabel("DIVISION_MEMBER")).toBe("Anggota Divisi");
    expect(identityRoleLabel("Anggota Divisi"));
    expect(identityRoleLabel("UNKNOWN_ROLE")).toBe("Belum Dinilai");
    expect(identityRoleLabel("IT_ADMIN")).not.toBe("IT_ADMIN");
    expect(assignableRoleOptions.map((role) => role.value)).toEqual(["EXECUTIVE", "DIVISION_LEAD", "DIVISION_MEMBER", "IT_ADMIN"]);
  });

  it("locks canonical IT dispatch and route shape without a static IT tree", () => {
    const root = source("src/app/workspace/[workspaceKey]/page.tsx");
    const summary = source("src/app/workspace/[workspaceKey]/(domain)/summary/page.tsx");
    const performance = source("src/app/workspace/[workspaceKey]/(domain)/performance/page.tsx");
    expect(root).toContain('resolution.domain === "IT"');
    expect(summary).toContain("ItSummaryPage");
    expect(performance).toContain("ItPerformancePage");
    expect(source("src/features/it/account-management-page.tsx")).not.toContain("new-user-password");
    expect(source("src/features/it/account-management-page.tsx")).not.toContain("ProvisionAccountRequest");
    expect(source("src/features/it/account-management-api.ts")).toContain("provisionAccount");
    expect(source("src/features/it/account-management-api.ts")).toContain("revokeMembership");
  });

  it("keeps account provisioning source-honest and does not expose internal identity fields", () => {
    const page = source("src/features/it/account-management-page.tsx");
    expect(page).toContain("listProvisioningCandidates");
    expect(page).toContain("provisionAccount({");
    expect(page).not.toContain("Actor ID");
    expect(page).not.toContain("tenant_id");
    expect(page).not.toContain("organization_id");
    expect(page).not.toContain("activation token");
    expect(page).not.toMatch(/password/i);
    expect(page).not.toMatch(/session token/i);
    expect(page).not.toContain("reset token");
    expect(page).not.toContain("API key");
    expect(page).not.toContain("Delete Account");
  });

  it("keeps the same-origin session boundary and avoids duplicated Shared Work/ARA features", () => {
    expect(source("src/features/it/account-management-page.tsx")).not.toContain("selectActiveWorkspace");
    expect(source("src/features/it/it-layout.tsx")).toContain("resolveWorkspaceDomain");
    expect(source("src/features/it/navigation.ts")).toContain("/projects");
    expect(source("src/features/it/navigation.ts")).toContain("/ara");
    expect(source("src/features/it/navigation.ts")).not.toContain("features/shared-work");
    expect(source("src/features/it/navigation.ts")).not.toContain("features/ara");
  });

  it("keeps source states mutually exclusive in the shared IT presentation", () => {
    const ui = source("src/features/it/shared/it-ui.tsx");
    expect(ui).toContain('unavailable: "Belum Terhubung"');
    expect(ui).toContain('error: "Data belum dapat dimuat"');
    expect(ui).toContain('"connected-empty": "Belum ada data"');
    expect(ui).toContain('"connected-data": "Tersedia"');
  });

  it("uses IT owner overview without synthetic operational indicators", () => {
    const summary = source("src/features/it/summary/it-summary-page.tsx");
    expect(summary).toContain("itApi.overview");
    for (const label of ["Uptime", "MTTR", "Skor Keamanan", "Tingkat Keberhasilan Backup"]) expect(summary).toContain(label);
    expect(summary).not.toContain("99.9");
  });

  it("keeps account state, activation, access, and governance as separate readiness concepts", () => {
    const account = source("src/features/it/account-management-page.tsx");
    expect(account).toContain("Status Aktivasi");
    expect(account).toContain("Akun Ditangguhkan");
    expect(account).toContain("Tangguhkan Akun");
    expect(account).toContain("Daftarkan Akun");
    expect(account).toContain("+ Tambah Workspace");
    expect(account).toContain("Edit Akses");
    expect(account).toContain("Cabut Akses");
    expect(account).not.toContain("Reset Akses belum tersedia");
    expect(account).not.toContain("Kirim Ulang Aktivasi belum tersedia");
    expect(account).not.toContain("Edit Akun belum tersedia");
    expect(account).toContain("Aktifkan Kembali");
    expect(account).not.toContain("setAccountActive(");
    expect(account).not.toContain("revokeAccountMembership(");
    expect(account).not.toContain("Hapus Akun");
    expect(account).toContain("Akun Aktif");
    expect(account).toContain('const tabs = ["Ringkasan", "Workspace & Akses", "Sesi", "Riwayat"]');
    expect(account).not.toContain('const tabs = ["Ringkasan", "Workspace & Akses", "Role", "Sesi", "Riwayat Akses", "Aktivitas Administratif"]');
  });

  it("keeps account filters source-aware and never infers employee or primary workspace data", () => {
    const account = source("src/features/it/account-management-page.tsx");
    for (const label of ["Divisi", "Workspace", "Role", "Status Akun", "Status Aktivasi", "Status Kepegawaian"]) expect(account).toContain(`aria-label="${label}"`);
    expect(account).toContain("Cari nama, ID karyawan, email, atau role");
    expect(account).toContain('<DetailItem label="Nama" value={account.display_name || "—"} />');
    expect(account).toContain('<DetailItem label="Nama Akun" value={account.display_name || "—"} />');
    expect(account).not.toContain("workspace_access[0]");
    expect(account).not.toContain("role_refs.join");
  });

  it("keeps one role per workspace and reads audit and session projections", () => {
    const account = source("src/features/it/account-management-page.tsx");
    const workspace = source("docs/it-workspace.md");
    const governance = source("docs/it-access-governance.md");
    expect(account).toContain("access.role_refs.map");
    expect(account).toContain("role_refs[0]");
    for (const header of ["Waktu", "Aktivitas", "Objek", "Workspace", "Pelaksana", "Hasil", "Sumber"]) expect(account).toContain(`header: "${header}"`);
    for (const event of ["Account Created", "Account Edited", "Activation Resent", "Account Activated", "Workspace Added", "Workspace Role Changed", "Workspace Access Edited", "Workspace Revoked", "Account Suspended", "Account Reactivated", "Password Reset Requested", "Session Revoked"]) expect(workspace).toContain(event);
    expect(workspace).toContain("Frontend tidak membuat kebenaran audit");
    expect(governance).toContain("Membership revocation is soft");
    expect(governance).toContain("Backend authorizes every account");
    expect(governance).toContain("identity administration permission");
    expect(account).toContain("listActorIdentityHistory");
    expect(account).toContain("listActorSessions");
  });

  it("keeps the exact target role vocabulary and cross-domain privilege boundary", () => {
    expect(assignableRoleOptions).toHaveLength(4);
    expect(assignableRoleOptions.map((role) => role.value)).toEqual(["EXECUTIVE", "DIVISION_LEAD", "DIVISION_MEMBER", "IT_ADMIN"]);
    const account = source("src/features/it/account-management-page.tsx");
    const governance = source("docs/it-access-governance.md");
    expect(account).toContain("assignableRoleOptions.filter");
    expect(governance).toContain("IT_ADMIN` alone does not grant Finance");
    expect(governance).toContain("exactly one role");
    expect(governance).toContain("Membership revocation is soft");
  });

  it("keeps the account page responsive and semantically table-based", () => {
    const page = source("src/features/it/account-management-page.tsx");
    const styles = source("src/features/it/account-management-page.module.css");
    expect(page).toContain("<DataTable");
    expect(page).toContain("<Drawer");
    expect(styles).toContain("@media (max-width: 639px)");
    expect(styles).toContain(".filterGroup");
  });

  it("reuses Identity for access while cross-domain workflow remains unavailable", () => {
    const modules = source("src/features/it/modules/it-module-page.tsx");
    expect(modules).toContain('module === "access"');
    expect(modules).toContain("AccountManagementPage");
    expect(modules).toContain("Production Approve / Release / Rollback");
    expect(modules).not.toContain("it.accounts");
  });

  it("maps operational modules only to migration-owned canonical records", () => {
    const modules = source("src/features/it/modules/it-module-page.tsx");
    for (const resource of ["incidents", "service_monitors", "systems", "databases", "environments", "repositories", "cicd_pipelines", "ci_runs", "releases", "security_findings", "backup_policies", "backup_runs", "restore_tests", "dr_plans"]) expect(modules).toContain("itResources." + resource);
    for (const label of ["Live Monitoring", "Connector Eksternal", "Eksekusi Backup atau Restore", "Eksekusi GitHub Live"]) expect(modules).toContain(label);
    expect(modules).toContain('module === "assets" || module === "support"');
  });

  it("keeps privileged role and security boundaries source-honest", () => {
    const account = source("src/features/it/account-management-page.tsx");
    const docs = source("docs/it-access-governance.md");
    const security = source("docs/it-security-boundaries.md");
    expect(account).toContain("assignableRoleOptions");
    expect(account).toContain("isSupportedRole(item.value, formRoles)");
    expect(account).toContain("Cabut Sesi");
    expect(docs).toContain("does not grant Finance, HR, Legal, or Executive data access");
    for (const division of ["Finance", "HR", "Legal", "Executive"]) expect(docs).toContain(division);
    expect(security).toContain("Global self-service owns");
    expect(security).toContain("IT does not see or choose a password");
    expect(docs).toContain("Membership dates are authoritative");
  });

  it("keeps employee/account/access/activation and cross-domain ownership separate", () => {
    const account = source("src/features/it/account-management-page.tsx");
    const provisioning = source("docs/it-account-provisioning.md");
    expect(account).toContain("Pilihan hanya memuat karyawan aktif");
    expect(account).toContain("Status Akun");
    expect(account).toContain("Status Aktivasi");
    expect(account).toContain("Workspace & Akses");
    expect(provisioning).toContain("employees without an actor link");
    expect(provisioning).toContain("activation pending");
    expect(provisioning).toContain("activation flow");
    expect(provisioning).toContain("actor link");
    expect(provisioning).toContain("Backend provisions actor, account, membership");
  });

  it("keeps the expanded data and form registries aligned with the master", () => {
    const data = source("docs/it-data-requirements.md");
    const forms = source("docs/it-form-requirements.md");
    for (const component of ["it.summary.identity", "it.services", "it.incidents", "it.problem", "it.accounts", "it.activation", "it.workspace-access", "it.access-request", "it.sessions", "it.joiner", "it.mover", "it.leaver"]) expect(data).toContain(component);
    expect(data).toContain("Employee Source");
    expect(data).toContain("Permission Source");
    expect(forms).toContain("it.account.create");
    expect(forms).toContain("it.account.suspend");
    expect(forms).toContain("it.access.request");
    expect(forms).toContain("it.access.revoke");
    expect(forms).toContain("Account, Reason, Effective At");
    expect(forms).toContain("Account, Workspace, Reason");
    expect(forms).toContain("it.workspace.add");
    expect(forms).toContain("it.workspace.update");
    expect(forms).toContain("it.workspace.revoke");
    expect(forms).toContain("it.activation.resend");
    expect(forms).toContain("it.access.reset");
    expect(forms).toContain("it.session.revoke");
    expect(forms).not.toContain("Password");
  });

  it("keeps the explicit identity error boundary", () => {
    const account = source("src/features/it/account-management-page.tsx");
    for (const message of ["Sesi Anda sudah berakhir", "Anda tidak memiliki akses", "Data yang Anda cari tidak ditemukan", "Data telah berubah", "Data belum memenuhi aturan penyediaan akun", "Layanan identitas belum dapat memproses permintaan"]) expect(account).toContain(message);
  });
});
