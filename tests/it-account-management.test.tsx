import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountManagementPage, hasItAccountManagementAccess, itNavigation, mvpRoleOptions } from "@/features/it";
import type { SessionProjection } from "@/features/session";
import type { AuthenticatedPrincipalProjection, IdentityAccountProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/it-operations/accounts",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
}));

const itMembership = {
  workspace: {
    workspace_id: "workspace_it_ops",
    workspace_key: "it-operations",
    organization_id: "org_andara",
    workspace_name: "IT Operations",
    workspace_type: "IT_OPERATIONS" as const,
    division_code: "IT",
    active: true,
  },
  role_refs: ["IT_ADMIN" as const],
  permission_refs: ["identity.accounts.manage", "identity.memberships.manage"],
  scope_refs: ["scope.identity.manage"],
  data_scope: "COMPANY" as const,
  access_level: "IT_ADMIN",
  active: true,
};

const principal: AuthenticatedPrincipalProjection = {
  actor: { actor_id: "actor_it_admin", tenant_id: "tenant_andara", organization_id: "org_andara", display_name: "IT Administrator", active: true },
  email: "it.admin@andara.local",
  workspace_access: [itMembership],
  active_workspace: itMembership,
  issued_at: "2026-09-28T00:00:00Z",
  expires_at: "2026-09-29T00:00:00Z",
};

const session: SessionProjection = { authenticated: true, principal };

const financeMembership = {
  workspace: {
    workspace_id: "workspace_finance",
    workspace_key: "finance-utama",
    organization_id: "org_andara",
    workspace_name: "Finance & Pajak",
    workspace_type: "BUSINESS" as const,
    division_code: "FINANCE",
    active: true,
  },
  role_refs: ["WORKSPACE_MEMBER", "BUSINESS_REVIEWER"] as const,
  permission_refs: [],
  scope_refs: ["scope.finance"],
  data_scope: "WORKSPACE" as const,
  access_level: "WORKSPACE_MEMBER",
  active: true,
};

const accountFixture: IdentityAccountProjection = {
  actor_id: "actor_existing",
  display_name: "Nama Akun Identity",
  email: "akun@example.test",
  active: true,
  workspace_access: [itMembership, financeMembership],
};

afterEach(() => { vi.restoreAllMocks(); });

describe("IT account management authority boundary", () => {
  it("uses the canonical IT resolver and fails closed for mismatch or non-IT workspace", () => {
    expect(hasItAccountManagementAccess(session, "it-operations")).toBe(true);
    expect(hasItAccountManagementAccess(session, "it-secondary")).toBe(false);
    expect(hasItAccountManagementAccess({ ...session, principal: { ...principal, active_workspace: { ...itMembership, permission_refs: [] } } }, "it-operations")).toBe(false);
    expect(hasItAccountManagementAccess({ ...session, principal: { ...principal, active_workspace: { ...itMembership, workspace: { ...itMembership.workspace, workspace_type: "BUSINESS", division_code: "SALES" } } } }, "it-operations")).toBe(false);
  });

  it("renders authoritative catalogs as readiness and never renders password provisioning", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options = {}) => {
      if (path === "/api/v1/identity/accounts") return [] as never;
      if (path === "/api/v1/identity/workspaces") return [itMembership.workspace, financeMembership.workspace] as never;
      if (path === "/api/v1/identity/assignable-roles") return ["WORKSPACE_MEMBER"] as never;
      if (options.method === "POST") throw new Error("mutation must remain unavailable");
      return undefined as never;
    });

    render(<AccountManagementPage workspaceKey="it-operations" />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Akun Karyawan" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Daftarkan Akun" }));
    expect(screen.getByRole("combobox", { name: "Karyawan" })).toBeDisabled();
    expect(screen.queryByLabelText("Kata sandi awal")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pendaftaran akun belum tersedia" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "1. Karyawan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2. Identitas Akun" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3. Workspace & Role" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "4. Review" })).toBeInTheDocument();
    for (const option of mvpRoleOptions) expect(screen.getByRole("option", { name: new RegExp(option.label) })).toBeDisabled();
    expect(request).not.toHaveBeenCalledWith("/api/v1/identity/accounts", expect.objectContaining({ method: "POST" }));
  });

  it("fails closed on an IT route mismatch without changing active workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([] as never);
    render(<AccountManagementPage workspaceKey="it-secondary" />);
    await waitFor(() => expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument());
    expect(request).not.toHaveBeenCalledWith("/api/v1/auth/active-workspace", expect.anything());
  });

  it("separates HR employee fields from account identity and exposes governed detail tabs", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/identity/accounts") return [accountFixture] as never;
      if (path === "/api/v1/identity/workspaces") return [itMembership.workspace] as never;
      if (path === "/api/v1/identity/assignable-roles") return ["WORKSPACE_MEMBER"] as never;
      return undefined as never;
    });

    render(<AccountManagementPage workspaceKey="it-operations" />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Akun Karyawan" })).toBeInTheDocument());
    expect(screen.getAllByRole("columnheader", { name: "Nama" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("columnheader", { name: "Status Aktivasi" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("columnheader", { name: "Role Utama" }).length).toBeGreaterThan(0);
    expect(screen.queryByText("Nama Akun Identity")).not.toBeInTheDocument();
    expect(screen.getAllByRole("combobox", { name: "Divisi" }).some((element) => element.hasAttribute("disabled"))).toBe(true);
    expect(screen.getAllByRole("combobox", { name: "Status Aktivasi" }).some((element) => element.hasAttribute("disabled"))).toBe(true);
    expect(screen.getAllByRole("combobox", { name: "Status Kepegawaian" }).some((element) => element.hasAttribute("disabled"))).toBe(true);
    expect(screen.getAllByRole("combobox", { name: "Workspace" }).some((element) => !element.hasAttribute("disabled"))).toBe(true);
    expect(screen.getAllByRole("combobox", { name: "Role" }).some((element) => !element.hasAttribute("disabled"))).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Lihat Detail" }));
    expect(screen.getByRole("dialog", { name: "Detail Akun Karyawan" })).toBeInTheDocument();
    expect(screen.getByText("Nama Akun Identity")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Sesi" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Riwayat" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Role" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Riwayat Akses" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Aktivitas Administratif" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Sesi" }));
    expect(screen.getByText(/Perangkat, peramban/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cabut Sesi belum tersedia" })).toBeDisabled();
    fireEvent.click(screen.getByRole("tab", { name: "Workspace & Akses" }));
    const detailDialog = screen.getByRole("dialog", { name: "Detail Akun Karyawan" });
    expect(within(detailDialog).getByText("Finance & Pajak")).toBeInTheDocument();
    expect(within(detailDialog).getByText("Role lama: Anggota Ruang Kerja")).toBeInTheDocument();
    expect(within(detailDialog).getByText("Role lama: Peninjau Bisnis")).toBeInTheDocument();
    expect(within(detailDialog).getByText(/Lebih dari satu role tersimpan/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit Akses" })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "+ Tambah Workspace" })[0]);
    const addWorkspaceDialog = screen.getByRole("dialog", { name: "Tambah Workspace" });
    expect(addWorkspaceDialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Penyimpanan akses belum tersedia" })).toBeDisabled();
    fireEvent.click(within(addWorkspaceDialog).getByRole("button", { name: "Tutup" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Cabut Akses" })[0]);
    const membershipDialog = screen.getByRole("dialog", { name: "Cabut Akses" });
    expect(membershipDialog.querySelector("#membership-reason")).toHaveAttribute("required");
    expect(membershipDialog.querySelector("#membership-effective-at")).not.toHaveAttribute("required");
    expect(within(membershipDialog).getByRole("button", { name: "Penyimpanan akses belum tersedia" })).toBeDisabled();
    fireEvent.click(within(membershipDialog).getByRole("button", { name: "Tutup" }));
    fireEvent.click(screen.getByRole("tab", { name: "Riwayat" }));
    for (const header of ["Waktu", "Aktivitas", "Objek", "Workspace", "Pelaksana", "Hasil", "Sumber"]) expect(screen.getByRole("columnheader", { name: header })).toBeInTheDocument();
    expect(screen.getByText("Riwayat: Belum Terhubung")).toBeInTheDocument();
  });

  it("keeps the exact 20-item IT sidebar and encodes the actual workspace key", () => {
    const sections = itNavigation("it/utama");
    const labels = sections.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toHaveLength(20);
    expect(labels).toEqual(["Ringkasan", "Layanan & Insiden", "Sistem & Aplikasi", "Infrastruktur & Lingkungan", "ALOS & GENESIS", "Integrasi & Connector", "Akun Karyawan", "Akses & Identitas", "Keamanan & Kepatuhan", "Perubahan & Rilis", "Aset IT", "Dukungan & Permintaan", "Target & Kinerja", "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA"]);
    expect(sections[0].items[0].href).toBe("/workspace/it%2Futama/summary");
  });
});
