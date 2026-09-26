import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import { getGenesisRoute } from "@/features/workspace-routing";
import WorkspaceItGenesisSubmodulePage from "@/app/workspace/it/genesis/[submodule]/page";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

const mockNotFound = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/it/genesis",
  redirect: vi.fn(),
  notFound: () => mockNotFound(),
}));

describe("IT GENESIS Technical Administration Submodules", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Navigation projection", () => {
    it("projects all technical GENESIS items under GENESIS group with navigable: true", () => {
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

      const targetSubmodules = [
        { key: "control-plane", href: getGenesisRoute() },
        { key: "agents", href: getGenesisRoute("agents") },
        { key: "skills", href: getGenesisRoute("skills") },
        { key: "research", href: getGenesisRoute("research") },
        { key: "models-tools", href: getGenesisRoute("models-tools") },
      ];

      for (const target of targetSubmodules) {
        const item = nav.find((i) => i.key === target.key);
        expect(item).toBeDefined();
        expect(item?.href).toBe(target.href);
        expect(item?.group).toBe("GENESIS");
        expect(item?.navigable).toBe(true);
      }
    });
  });

  describe("Submodule Routing & Rendering", () => {
    beforeEach(() => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: canonicalPrincipal({
          actorId: "usr_it_admin",
          divisionCode: "IT",
          workspaceId: "ws_it_01",
          workspaceKey: "it",
          workspaceName: "IT Workspace",
          roles: ["IT_ADMIN"],
        }),
      });
    });

    it("renders AgentsWorkspace for submodule 'agents' without secret exposure", async () => {
      render(<WorkspaceItGenesisSubmodulePage params={{ submodule: "agents" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Agents", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Sumber registri agen dari Backend belum terhubung.")).toBeInTheDocument();
      });

      expect(screen.queryByText(/prompt_template/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/api_key/i)).not.toBeInTheDocument();
    });

    it("renders SkillsWorkspace for submodule 'skills' with honest empty state", async () => {
      render(<WorkspaceItGenesisSubmodulePage params={{ submodule: "skills" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Skills", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Sumber registri skill dari Backend belum terhubung.")).toBeInTheDocument();
      });
    });

    it("renders ResearchWorkspace for submodule 'research' with domain access and request form", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
        if (path === "/api/v1/research/domain-access") {
          return {
            records: [
              {
                domain: "TECHNOLOGY",
                status: "AUTHORIZED",
                is_allowed: true,
                required_scope: "research:technology",
                reason: "Authorized by IT role",
              },
            ],
          } as never;
        }
        return [] as never;
      });

      render(<WorkspaceItGenesisSubmodulePage params={{ submodule: "research" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Research", level: 1 })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Kontrol Akses Domain", level: 2 })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Permintaan Riset", level: 2 })).toBeInTheDocument();
      });
    });

    it("renders ModelsToolsWorkspace for submodule 'models-tools' with zero credential exposure", async () => {
      render(<WorkspaceItGenesisSubmodulePage params={{ submodule: "models-tools" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Models & Tools", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Sumber registri model belum terhubung.")).toBeInTheDocument();
        expect(screen.getByText("Sumber registri tools belum terhubung.")).toBeInTheDocument();
      });

      expect(screen.queryByText(/gpt-4 online/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/claude online/i)).not.toBeInTheDocument();
    });

    it("fails closed with notFound for unknown submodule", () => {
      render(<WorkspaceItGenesisSubmodulePage params={{ submodule: "unknown-submodule" }} />);
      expect(mockNotFound).toHaveBeenCalled();
    });
  });
});
