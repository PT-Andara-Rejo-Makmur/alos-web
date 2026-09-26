import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import { getGovernanceRoute } from "@/features/workspace-routing";
import {
  DecisionsWorkspace,
  EvidenceWorkspace,
  UatWorkspace,
} from "@/modules/it/governance";
import WorkspaceItGovernanceSubmodulePage from "@/app/workspace/it/governance/[submodule]/page";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

const mockNotFound = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/it/governance",
  redirect: vi.fn(),
  notFound: () => mockNotFound(),
}));

describe("IT Governance Submodules", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Direct Workspace Components", () => {
    it("renders EvidenceWorkspace with truthful blocked and not-connected state", () => {
      render(<EvidenceWorkspace />);

      expect(screen.getByRole("heading", { name: "Evidence", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Sumber Bukti")).toBeInTheDocument();
      expect(screen.getByText("NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("Sumber bukti dari Backend belum terhubung.")).toBeInTheDocument();
      expect(screen.getByText("Batas Sumber Bukti")).toBeInTheDocument();
    });

    it("renders UatWorkspace with truthful blocked and not-connected state", () => {
      render(<UatWorkspace />);

      expect(screen.getByRole("heading", { name: "UAT & Gates", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Sumber Bukti UAT")).toBeInTheDocument();
      expect(screen.getByText("NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("Sumber bukti UAT dan gate belum terhubung.")).toBeInTheDocument();
      expect(screen.getByText("Batas Verifikasi UAT")).toBeInTheDocument();
    });

    it("renders DecisionsWorkspace with truthful blocked and not-connected state", () => {
      render(<DecisionsWorkspace />);

      expect(screen.getByRole("heading", { name: "Decisions", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Sumber Keputusan Teknologi")).toBeInTheDocument();
      expect(screen.getByText("NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("Sumber keputusan teknologi dari Backend belum terhubung.")).toBeInTheDocument();
      expect(screen.getByText("Batas Sumber Keputusan")).toBeInTheDocument();
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

    it("renders EvidenceWorkspace for submodule 'evidence'", async () => {
      render(<WorkspaceItGovernanceSubmodulePage params={{ submodule: "evidence" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Evidence", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Sumber bukti dari Backend belum terhubung.")).toBeInTheDocument();
      });
    });

    it("renders UatWorkspace for submodule 'uat'", async () => {
      render(<WorkspaceItGovernanceSubmodulePage params={{ submodule: "uat" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "UAT & Gates", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Sumber bukti UAT dan gate belum terhubung.")).toBeInTheDocument();
      });
    });

    it("renders DecisionsWorkspace for submodule 'decisions'", async () => {
      render(<WorkspaceItGovernanceSubmodulePage params={{ submodule: "decisions" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Decisions", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("Sumber keputusan teknologi dari Backend belum terhubung.")).toBeInTheDocument();
      });
    });

    it("fails closed calling notFound for unknown submodule", () => {
      render(<WorkspaceItGovernanceSubmodulePage params={{ submodule: "unknown-submodule" }} />);
      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe("Navigation Projection", () => {
    it("projects evidence, uat, and decisions as navigable: true but availability: BLOCKED", () => {
      const items = projectWorkspaceNavigation(
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
        { key: "evidence", href: getGovernanceRoute("evidence") },
        { key: "uat", href: getGovernanceRoute("uat") },
        { key: "decisions", href: getGovernanceRoute("decisions") },
      ];

      for (const target of targetSubmodules) {
        const item = items.find((i) => i.key === target.key);
        expect(item).toBeDefined();
        expect(item?.href).toBe(target.href);
        expect(item?.group).toBe("GOVERNANCE");
        expect(item?.navigable).toBe(true);
        expect(item?.availability).toBe("BLOCKED");
      }
    });
  });
});
