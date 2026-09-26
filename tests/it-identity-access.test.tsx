import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import WorkspaceItUsersAccessPage from "@/app/workspace/it/users/access/page";
import WorkspaceItUsersAccessReviewPage from "@/app/workspace/it/users/access-review/page";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/it/users/access",
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

describe("IT Identity & Access - Workspace Access & Access Review", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Navigation projection", () => {
    it("projects Workspace Access and Access Review for IT_ADMIN", () => {
      const nav = projectWorkspaceNavigation(
        {
          workspaceId: "ws_it_01",
          workspaceKey: "it",
          workspaceLabel: "IT Workspace",
          divisionCode: "IT",
          roleLabel: "Administrator IT",
        },
        {
          user_id: "usr_it_admin",
          organization_id: "org_01",
          tenant_id: "tenant_01",
          roles: ["IT_ADMIN"],
          division_codes: ["IT"],
          workspace_ids: ["ws_it_01"],
          issued_at: "",
          expires_at: "",
        },
      );

      const accessItem = nav.find((i) => i.key === "workspace-access");
      const reviewItem = nav.find((i) => i.key === "access-review");

      expect(accessItem).toBeDefined();
      expect(accessItem?.href).toBe("/workspace/it/users/access");
      expect(accessItem?.navigable).toBe(true);
      expect(accessItem?.group).toBe("IDENTITY_ACCESS");

      expect(reviewItem).toBeDefined();
      expect(reviewItem?.href).toBe("/workspace/it/users/access-review");
      expect(reviewItem?.navigable).toBe(true);
      expect(reviewItem?.group).toBe("IDENTITY_ACCESS");
    });
  });

  describe("Workspace Access Surface", () => {
    it("fails closed when actor lacks IT_ADMIN authority", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: canonicalPrincipal({
          actorId: "usr_guest",
          divisionCode: "IT",
          workspaceId: "ws_it_01",
          workspaceKey: "it",
          workspaceName: "IT Workspace",
          roles: ["WORKSPACE_MEMBER"],
        }),
      });

      render(<WorkspaceItUsersAccessPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Akses ditolak: role IT_ADMIN dan izin identity.accounts.manage diperlukan untuk mengelola keanggotaan workspace."),
        ).toBeInTheDocument();
      });
    });

    it("renders workspace memberships table when authorized", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: canonicalPrincipal({
          actorId: "usr_it_admin",
          divisionCode: "IT",
          workspaceId: "ws_it_01",
          workspaceKey: "it",
          workspaceName: "IT Workspace",
          roles: ["IT_ADMIN"],
          permissions: ["identity.accounts.manage"],
        }),
      });

      vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
        if (path === "/api/v1/identity/accounts") {
          return [
            {
              actor_id: "usr_01",
              display_name: "Alice Developer",
              email: "alice@andara.co.id",
              active: true,
              workspace_access: [
                {
                  workspace: {
                    workspace_id: "ws_it_01",
                    workspace_key: "it",
                    workspace_name: "IT Workspace",
                  },
                  role_refs: ["IT_ENGINEER"],
                  permission_refs: ["git.push"],
                  scope_refs: ["repo:main"],
                  data_scope: "WORKSPACE",
                },
              ],
            },
          ] as never;
        }
        if (path === "/api/v1/identity/assignable-roles") {
          return ["IT_ENGINEER", "IT_ADMIN"] as never;
        }
        if (path === "/api/v1/identity/workspaces") {
          return [
            {
              workspace_id: "ws_it_01",
              workspace_key: "it",
              workspace_name: "IT Workspace",
            },
          ] as never;
        }
        return [] as never;
      });

      render(<WorkspaceItUsersAccessPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Workspace Access", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Alice Developer")).toBeInTheDocument();
        expect(screen.getAllByText("IT Workspace").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("IT ENGINEER")).toBeInTheDocument();
      });
    });
  });

  describe("Access Review Surface", () => {
    it("fails closed when actor lacks IT_ADMIN authority", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: canonicalPrincipal({
          actorId: "usr_guest",
          divisionCode: "IT",
          workspaceId: "ws_it_01",
          workspaceKey: "it",
          workspaceName: "IT Workspace",
          roles: ["WORKSPACE_MEMBER"],
        }),
      });

      render(<WorkspaceItUsersAccessReviewPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Akses ditolak: role IT_ADMIN dan izin identity.accounts.manage diperlukan untuk meninjau hak akses pengguna."),
        ).toBeInTheDocument();
      });
    });

    it("renders effective access review and honest change history source unavailable notice", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: canonicalPrincipal({
          actorId: "usr_it_admin",
          divisionCode: "IT",
          workspaceId: "ws_it_01",
          workspaceKey: "it",
          workspaceName: "IT Workspace",
          roles: ["IT_ADMIN"],
          permissions: ["identity.accounts.manage"],
        }),
      });

      vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
        if (path === "/api/v1/identity/accounts") {
          return [
            {
              actor_id: "usr_02",
              display_name: "Bob SysAdmin",
              email: "bob@andara.co.id",
              active: true,
              workspace_access: [
                {
                  workspace: {
                    workspace_id: "ws_it_01",
                    workspace_key: "it",
                    workspace_name: "IT Workspace",
                  },
                  role_refs: ["IT_ADMIN"],
                  permission_refs: ["system.manage"],
                  scope_refs: ["cluster:prod"],
                  data_scope: "COMPANY",
                },
              ],
            },
          ] as never;
        }
        return [] as never;
      });

      render(<WorkspaceItUsersAccessReviewPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Access Review", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Bob SysAdmin")).toBeInTheDocument();
        expect(screen.getByText("Change history source unavailable.")).toBeInTheDocument();
      });
    });
  });
});
