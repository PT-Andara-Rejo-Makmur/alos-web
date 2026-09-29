import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountManagementPage, hasItAccountManagementAccess, itNavigation } from "@/features/it";
import type { SessionProjection } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
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
      if (path === "/api/v1/identity/workspaces") return [itMembership.workspace] as never;
      if (path === "/api/v1/identity/assignable-roles") return ["WORKSPACE_MEMBER"] as never;
      if (options.method === "POST") throw new Error("mutation must remain unavailable");
      return undefined as never;
    });

    render(<AccountManagementPage workspaceKey="it-operations" />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Akun Karyawan" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Siapkan Akun" }));
    expect(screen.getByRole("combobox", { name: "Karyawan" })).toBeDisabled();
    expect(screen.queryByLabelText("Kata sandi awal")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Penyediaan akun belum tersedia" })).toBeDisabled();
    expect(request).not.toHaveBeenCalledWith("/api/v1/identity/accounts", expect.objectContaining({ method: "POST" }));
  });

  it("fails closed on an IT route mismatch without changing active workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([] as never);
    render(<AccountManagementPage workspaceKey="it-secondary" />);
    await waitFor(() => expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument());
    expect(request).not.toHaveBeenCalledWith("/api/v1/auth/active-workspace", expect.anything());
  });

  it("keeps the exact 20-item IT sidebar and encodes the actual workspace key", () => {
    const sections = itNavigation("it/utama");
    const labels = sections.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toHaveLength(20);
    expect(labels).toEqual(["Ringkasan", "Layanan & Insiden", "Sistem & Aplikasi", "Infrastruktur & Lingkungan", "ALOS & GENESIS", "Integrasi & Connector", "Akun Karyawan", "Akses & Identitas", "Keamanan & Kepatuhan", "Perubahan & Rilis", "Aset IT", "Dukungan & Permintaan", "Target & Kinerja", "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA"]);
    expect(sections[0].items[0].href).toBe("/workspace/it%2Futama/summary");
  });
});
