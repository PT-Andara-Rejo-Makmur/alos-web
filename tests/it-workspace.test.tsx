import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { activeItWorkspaceKey, hasItContext, identityRoleLabel, itNavigation, mvpRoleOptions } from "@/features/it";
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

  it("keeps the exact 20-item master sidebar with encoded workspace identity", () => {
    const sections = itNavigation("it utama");
    expect(sections.flatMap((section) => section.items)).toHaveLength(20);
    expect(sections.map((section) => section.label)).toEqual(["PUSAT IT", "PLATFORM & SISTEM", "AKSES & IDENTITAS", "PERUBAHAN", "OPERASIONAL", "KINERJA", "PEKERJAAN", "ARA"]);
    expect(sections.flatMap((section) => section.items).every((item) => item.href.startsWith("/workspace/it%20utama/"))).toBe(true);
  });

  it("maps role labels without leaking raw canonical enums", () => {
    expect(identityRoleLabel("IT_ADMIN")).toBe("Administrator IT");
    expect(identityRoleLabel("EXECUTIVE")).toBe("Direktur");
    expect(identityRoleLabel("DIVISION_LEAD")).toBe("Manajer / Kepala Divisi");
    expect(identityRoleLabel("DIVISION_MEMBER")).toBe("Anggota Divisi");
    expect(identityRoleLabel("WORKSPACE_MEMBER")).toContain("Role lama");
    expect(identityRoleLabel("UNKNOWN_ROLE")).toBe("Belum Dinilai");
    expect(identityRoleLabel("IT_ADMIN")).not.toBe("IT_ADMIN");
    expect(mvpRoleOptions.map((role) => role.value)).toEqual(["EXECUTIVE", "DIVISION_LEAD", "DIVISION_MEMBER", "IT_ADMIN"]);
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
    expect(source("src/features/it/account-management-api.ts")).not.toMatch(/method:\s*["'](?:POST|PUT|DELETE)["']/);
  });

  it("keeps account provisioning source-honest and does not expose internal identity fields", () => {
    const page = source("src/features/it/account-management-page.tsx");
    expect(page).toContain("Pilihan karyawan belum tersedia.");
    expect(page).toContain("Pendaftaran akun belum tersedia");
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

  it("aligns the IT summary and account identity indicators without invented values", () => {
    const summary = source("src/features/it/summary/it-summary-page.tsx");
    const account = source("src/features/it/account-management-page.tsx");
    for (const label of ["Akun Menunggu Pendaftaran", "Aktivasi Menunggu", "Permintaan Akses", "Akses Perlu Review", "Leaver Menunggu Revokasi"]) expect(summary).toContain(label);
    for (const label of ["Nama", "ID Karyawan", "Jabatan", "Workspace Utama", "Role Utama", "Email", "Status Akun", "Status Aktivasi", "Login Terakhir"]) expect(account).toContain(label);
    expect(account).toContain("Sumber HR belum terhubung");
    expect(account).toContain('Status label="Belum Terhubung"');
    expect(account).not.toContain("Nama Karyawan}>{account.display_name");
    expect(account).not.toContain("account.workspace_access.find((access) => access.active)?.workspace");
    expect(account).not.toContain("account.workspace_access[0]?.workspace");
  });

  it("keeps account state, activation, access, and governance as separate readiness concepts", () => {
    const account = source("src/features/it/account-management-page.tsx");
    expect(account).toContain("Status Aktivasi");
    expect(account).toContain("Akun Ditangguhkan");
    expect(account).toContain("Ajukan Penangguhan Akun");
    expect(account).toContain("Daftarkan Akun");
    expect(account).toContain("+ Tambah Workspace");
    expect(account).toContain("Edit Akses");
    expect(account).toContain("Cabut Akses");
    expect(account).toContain("Reset Akses belum tersedia");
    expect(account).toContain("Kirim Ulang Aktivasi belum tersedia");
    expect(account).toContain("Aktifkan Kembali belum tersedia");
    expect(account).toContain("Berlaku Mulai");
    expect(account).not.toContain("setAccountActive(");
    expect(account).not.toContain("revokeAccountMembership(");
    expect(account).not.toContain("Hapus Akun");
    expect(account).toContain("Akun Aktif");
    expect(account).toContain('const tabs = ["Ringkasan", "Workspace & Akses", "Sesi", "Riwayat"]');
    expect(account).not.toContain('const tabs = ["Ringkasan", "Workspace & Akses", "Role", "Sesi", "Riwayat Akses", "Aktivitas Administratif"]');
  });

  it("keeps access request, joiner/mover/leaver, and problem/root-cause UX contextual", () => {
    const modules = source("src/features/it/modules/it-module-page.tsx");
    for (const label of ["Problem / Root Cause", "Ajukan Akses", "User", "Workspace / Sistem", "Role / Akses yang Diminta", "Alasan", "Durasi", "Bukti Pendukung", "JOINER", "MOVER", "LEAVER", "Antrian Revokasi Leaver", "Approved tidak berarti provisioned"]) expect(modules).toContain(label);
    expect(modules).toContain("Layanan Terdampak");
    expect(modules).toContain("Aset Ditugaskan");
  });

  it("keeps privileged role and security boundaries source-honest", () => {
    const account = source("src/features/it/account-management-page.tsx");
    const docs = source("docs/it-access-governance.md");
    expect(account).toContain("mvpRoleOptions");
    expect(account).toContain('role.value === "IT_ADMIN"');
    expect(account).toContain("!isSupportedRole");
    expect(account).toContain("memerlukan kewenangan terpisah");
    expect(account).toContain("Cabut Sesi belum tersedia");
    expect(docs).toContain("bukan superuser bisnis");
    expect(docs).toContain("409 access conflict");
  });

  it("keeps employee/account/access/activation and cross-domain ownership separate", () => {
    const account = source("src/features/it/account-management-page.tsx");
    const provisioning = source("docs/it-account-provisioning.md");
    expect(account).toContain("sumber HR resmi");
    expect(account).toContain("Status Akun");
    expect(account).toContain("Status Aktivasi");
    expect(account).toContain("Workspace & Akses");
    expect(provisioning).toContain("employee existing in HR does not imply an account");
    expect(provisioning).toContain("an account does not imply activation");
    expect(provisioning).toContain("approval does not imply provisioning");
    expect(provisioning).toContain("no hard delete action");
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
