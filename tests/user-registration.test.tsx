import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { AccountRegistrationPage as UserRegistrationPage } from "@/modules/it/identity-access/account-registration";

vi.mock("@/features/workspace-shell", () => ({
  ProtectedDomainWorkspace: ({ children }: { children: (value: unknown) => React.ReactNode }) =>
    children({
      actor: {
        tenant_id: "tenant_admin",
        organization_id: "org_admin",
        roles: ["IT_ADMIN"],
        permissions: ["identity.accounts.manage"],
        scopes: ["scope.identity.manage", "scope.finance.secret"],
      },
    }),
}));

describe("UserRegistrationPage canonical identity payload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options = {}) => {
      if (path === "/api/v1/identity/assignable-roles") return ["WORKSPACE_MEMBER"] as never;
      if (path === "/api/v1/identity/workspaces") {
        return [
          { workspace_id: "workspace_finance", workspace_key: "finance", workspace_name: "Finance Workspace", workspace_type: "BUSINESS", active: true },
          { workspace_id: "workspace_hr", workspace_key: "hr", workspace_name: "HR & People Workspace", workspace_type: "BUSINESS", active: true },
        ] as never;
      }
      if (path === "/api/v1/identity/accounts" && options.method === "POST") {
        return { actor: { actor_id: "actor_new" } } as never;
      }
      return {} as never;
    });
  });

  it("loads Backend options and creates memberships without browser authority metadata", async () => {
    render(<UserRegistrationPage />);

    fireEvent.change(screen.getByLabelText("Nama lengkap"), { target: { value: "Target User" } });
    fireEvent.change(screen.getByLabelText("Email kerja"), { target: { value: "target@andara.local" } });
    fireEvent.change(screen.getByLabelText("Password awal"), { target: { value: "StrongPass!456" } });
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));

    await screen.findByText("Finance Workspace");
    fireEvent.click(screen.getByLabelText("Finance Workspace"));
    fireEvent.click(screen.getByLabelText("HR & People Workspace"));
    fireEvent.click(screen.getByText("Tambah Role"));
    fireEvent.click(screen.getByLabelText("WORKSPACE MEMBER"));
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));
    fireEvent.click(screen.getByRole("button", { name: "Register Akun" }));

    await waitFor(() => {
      expect(api.authenticatedApiRequest).toHaveBeenCalledWith(
        "/api/v1/identity/accounts",
        expect.objectContaining({ method: "POST" }),
      );
    });
    const calls = vi.mocked(api.authenticatedApiRequest).mock.calls;
    const createBody = calls.find(([path]) => path === "/api/v1/identity/accounts")?.[1]?.body;
    expect(createBody).toEqual({
      display_name: "Target User",
      email: "target@andara.local",
      password: "StrongPass!456",
      role_refs: ["WORKSPACE_MEMBER"],
      workspace_id: "workspace_finance",
      permission_refs: [],
      scope_refs: [],
      data_scope: "OWN_ASSIGNED",
    });
    expect(createBody).not.toHaveProperty("tenant_id");
    expect(createBody).not.toHaveProperty("organization_id");
    expect(createBody).not.toHaveProperty("workspace_key");
    expect(createBody).not.toHaveProperty("workspace_name");
    expect(createBody).not.toHaveProperty("workspace_type");

    const membershipBody = calls.find(([path]) =>
      String(path).includes("/identity/actors/actor_new/memberships"),
    )?.[1]?.body;
    expect(membershipBody).toEqual({
      workspace_id: "workspace_hr",
      role_refs: ["WORKSPACE_MEMBER"],
      permission_refs: [],
      scope_refs: [],
      data_scope: "OWN_ASSIGNED",
    });
  });
});
