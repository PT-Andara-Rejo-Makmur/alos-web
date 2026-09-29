import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountManagementPage, hasItAccountManagementAccess } from "@/features/it";
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
  actor: {
    actor_id: "actor_it_admin",
    tenant_id: "tenant_andara",
    organization_id: "org_andara",
    display_name: "IT Administrator",
    active: true,
  },
  email: "it.admin@andara.local",
  workspace_access: [itMembership],
  active_workspace: itMembership,
  issued_at: "2026-09-28T00:00:00Z",
  expires_at: "2026-09-29T00:00:00Z",
};

const session: SessionProjection = { authenticated: true, principal };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("IT account management authority boundary", () => {
  it("only allows the Backend-selected IT membership with account permission", () => {
    expect(hasItAccountManagementAccess(session)).toBe(true);
    expect(hasItAccountManagementAccess({ ...session, principal: { ...principal, active_workspace: null } })).toBe(false);
    expect(hasItAccountManagementAccess({ ...session, principal: { ...principal, active_workspace: { ...itMembership, permission_refs: [] } } })).toBe(false);
    expect(hasItAccountManagementAccess({ ...session, principal: { ...principal, active_workspace: { ...itMembership, workspace: { ...itMembership.workspace, workspace_type: "BUSINESS" } } } })).toBe(false);
  });

  it("uses authoritative workspace and role catalogs, and calls Backend provisioning", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options = {}) => {
      if (path === "/api/v1/identity/accounts" && options.method === "POST") {
        return { actor_id: "actor_new", display_name: "Pengguna Baru", email: "baru@andara.local", active: true, workspace_access: [] } as never;
      }
      if (path === "/api/v1/identity/accounts") return [] as never;
      if (path === "/api/v1/identity/workspaces") return [itMembership.workspace] as never;
      if (path === "/api/v1/identity/assignable-roles") return ["WORKSPACE_MEMBER"] as never;
      return undefined as never;
    });

    render(<AccountManagementPage workspaceKey="it-operations" />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Pengguna & Akses" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Tambah Pengguna" }));
    expect(screen.getByRole("option", { name: "IT Operations" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "WORKSPACE MEMBER" })).toBeInTheDocument();
    fireEvent.change(document.getElementById("new-user-name") as HTMLInputElement, { target: { value: "Pengguna Baru" } });
    fireEvent.change(document.getElementById("new-user-email") as HTMLInputElement, { target: { value: "baru@andara.local" } });
    fireEvent.change(document.getElementById("new-user-password") as HTMLInputElement, { target: { value: "StrongPass!123" } });
    fireEvent.click(screen.getByRole("button", { name: "Daftarkan akun" }));

    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/identity/accounts", expect.objectContaining({ method: "POST" })));
    const provisionCall = request.mock.calls.find(([path, options]) => path === "/api/v1/identity/accounts" && options?.method === "POST");
    expect(provisionCall?.[1]?.body).toEqual(expect.objectContaining({ workspace_id: "workspace_it_ops", role_refs: ["WORKSPACE_MEMBER"] }));
  });

  it("fails closed on an IT route mismatch without changing active workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([] as never);

    render(<AccountManagementPage workspaceKey="it-secondary" />);

    await waitFor(() => expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument());
    expect(request).not.toHaveBeenCalledWith("/api/v1/auth/active-workspace", expect.anything());
  });
});
