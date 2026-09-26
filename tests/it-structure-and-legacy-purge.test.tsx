import { Suspense } from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import { GenesisControlPlaneWorkspace } from "@/modules/it/genesis/control-plane";
import WorkspaceItPage from "@/app/workspace/it/page";
import WorkspaceItUsersPage from "@/app/workspace/it/users/page";
import WorkspaceItUsersRegisterPage from "@/app/workspace/it/users/register/page";
import WorkspaceItGovernancePage from "@/app/workspace/it/governance/page";
import WorkspaceItGovernanceSubmodulePage from "@/app/workspace/it/governance/[submodule]/page";
import WorkspaceItGenesisSubmodulePage from "@/app/workspace/it/genesis/[submodule]/page";
import ItModuleRoute from "@/app/workspace/it/[module]/page";
import { renderItWorkspaceModule } from "@/modules/it";
import { WorkspaceMobileNav } from "@/features/workspace-shell/workspace-mobile-nav";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import { getModuleReadiness, isKnownItModule } from "@/features/workspace-routing";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/it",
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

describe("IT Structure Normalization and Legacy Purge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Mobile Navigation & Icon Policy (Section 20-22, 33)", () => {
    const itIdentity = {
      workspaceId: "ws_it_01",
      workspaceKey: "it",
      workspaceLabel: "IT Workspace",
      roleLabel: "IT Lead",
      divisionCode: "IT",
    };
    const itAdminActor = {
      user_id: "usr_01",
      organization_id: "org_01",
      roles: ["IT_ADMIN"],
      division_codes: ["IT"],
      workspace_ids: ["ws_it_01"],
      issued_at: "",
      expires_at: "",
    };

    it("projects clickable Monitoring and Control Plane shortcuts, and excludes Systems and Security", () => {
      const navigation = projectWorkspaceNavigation(itIdentity, itAdminActor);

      render(
        <WorkspaceMobileNav
          activeNavKey="overview"
          identity={itIdentity}
          navigation={navigation}
        />,
      );

      const bottomNav = screen.getByRole("navigation", { name: "Navigasi Bawah Ringkas" });

      // Clickable shortcuts must be in bottom nav
      const monitoringLink = within(bottomNav).getByRole("link", { name: /Monitoring/i });
      expect(monitoringLink).toHaveAttribute("href", "/workspace/it/monitoring");

      const controlPlaneLink = within(bottomNav).getByRole("link", { name: /Control Plane/i });
      expect(controlPlaneLink).toHaveAttribute("href", "/workspace/it/genesis");

      const overviewLink = within(bottomNav).getByRole("link", { name: /Overview/i });
      expect(overviewLink).toHaveAttribute("href", "/workspace/it");

      // Non-navigable modules Systems and Security must NOT appear in bottom navigation shortcuts
      expect(within(bottomNav).queryByRole("link", { name: /Systems/i })).not.toBeInTheDocument();
      expect(within(bottomNav).queryByRole("link", { name: /Security/i })).not.toBeInTheDocument();
    });

    it("does NOT use letter-circle icons (O/S/G/X/M/AI) for IT mobile bottom shortcuts", () => {
      const navigation = projectWorkspaceNavigation(itIdentity, itAdminActor);

      render(
        <WorkspaceMobileNav
          activeNavKey="overview"
          identity={itIdentity}
          navigation={navigation}
        />,
      );

      const bottomNav = screen.getByRole("navigation", { name: "Navigasi Bawah Ringkas" });
      const letterCircles = bottomNav.querySelectorAll('[class*="bottomNavIconCircle"]');
      expect(letterCircles.length).toBe(0);

      // Verify SVGs from lucide icons exist in bottom nav items
      const svgs = bottomNav.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("2. Governance Canonical Route Legacy Purge (Section 10-13, 34)", () => {
    it("/workspace/it/governance does not render legacy ItReviewProjection and shows clean unavailable surface", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      render(<WorkspaceItGovernancePage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "IT Governance", level: 2 })).toBeInTheDocument();
      });

      // Legacy presentation content must NOT exist
      expect(screen.queryByText(/Detailed assurance structure/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/REVIEW PACKAGE · IT PROJECTION/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/AI recommendation ditampilkan sebagai assurance input/i)).not.toBeInTheDocument();

      // Honest unavailable state
      expect(screen.getByText(/Backend operational integration belum terhubung/i)).toBeInTheDocument();
      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
    });

    it("/workspace/it/governance/evidence does not render legacy ItReviewProjection", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      render(
        <Suspense fallback={<div>Loading...</div>}>
          <WorkspaceItGovernanceSubmodulePage
            params={{ submodule: "evidence" }}
          />
        </Suspense>,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "IT Governance: EVIDENCE", level: 2 }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByText(/Detailed assurance structure/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/REVIEW PACKAGE · IT PROJECTION/i)).not.toBeInTheDocument();
    });

    it("/workspace/it/governance/decisions does not render old generic OperationalModuleDashboard", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      render(
        <Suspense fallback={<div>Loading...</div>}>
          <WorkspaceItGovernanceSubmodulePage
            params={{ submodule: "decisions" }}
          />
        </Suspense>,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "IT Governance: DECISIONS", level: 2 }),
        ).toBeInTheDocument();
      });

      expect(screen.queryByText(/Daftar Approval/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Modul tata kelola ini belum tersedia/i)).toBeInTheDocument();
    });
  });

  describe("3. GENESIS Research Legacy Fallback Purge (Section 14-15, 35)", () => {
    it("/workspace/it/genesis/research does not render legacy SharedResearchWorkspace", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      render(
        <Suspense fallback={<div>Loading...</div>}>
          <WorkspaceItGenesisSubmodulePage
            params={{ submodule: "research" }}
          />
        </Suspense>,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "GENESIS: RESEARCH", level: 2 }),
        ).toBeInTheDocument();
      });

      // Old SharedResearchWorkspace elements must NOT exist
      expect(screen.queryByText("Status Tata Kelola 4 Domain R&D")).not.toBeInTheDocument();
      expect(screen.queryByText("Kirim Riset")).not.toBeInTheDocument();
      expect(screen.queryByText("R&D Domain Access")).not.toBeInTheDocument();

      // Honest new-generation unavailable state
      expect(screen.getByText(/Modul teknis ini belum tersedia pada sistem/i)).toBeInTheDocument();
      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
    });
  });

  describe("4. GENESIS Control Plane Readiness (Section 16-17, 36)", () => {
    it("reads centralized readiness and shows honest wording without PARTIAL/READY/ACTIVE claims", () => {
      render(<GenesisControlPlaneWorkspace />);

      const readiness = getModuleReadiness("control-plane");
      expect(readiness.availability).toBe("BLOCKED");

      expect(screen.getByText(`Control Plane Status: ${readiness.availability}`)).toBeInTheDocument();
      expect(
        screen.getByText("Frontend control surface tersedia. Backend operational integration belum terhubung."),
      ).toBeInTheDocument();

      expect(screen.queryByText(/Control Plane Status: PARTIAL/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Control Plane Status: READY/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Control Plane Status: ACTIVE/i)).not.toBeInTheDocument();
    });
  });

  describe("5. Thin App Route Boundaries (Section 3, 6, 7)", () => {
    it("renders thin route WorkspaceItPage wrapping ItOverviewPage", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      render(<WorkspaceItPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "IT Operations", level: 1 })).toBeInTheDocument();
      });
    });

    it("renders thin route WorkspaceItUsersPage wrapping AccountManagementPage", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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
        if (path === "/api/v1/identity/accounts") return [] as never;
        if (path === "/api/v1/identity/assignable-roles") return [] as never;
        if (path === "/api/v1/identity/workspaces") return [] as never;
        return [] as never;
      });

      render(<WorkspaceItUsersPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Kelola Akun", level: 1 })).toBeInTheDocument();
      });
      expect(screen.getByText("IT · IDENTITY & ACCESS")).toBeInTheDocument();
    });

    it("renders thin route WorkspaceItUsersRegisterPage wrapping AccountRegistrationPage", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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
        if (path === "/api/v1/identity/assignable-roles") return [] as never;
        if (path === "/api/v1/identity/workspaces") return [] as never;
        return [] as never;
      });

      render(<WorkspaceItUsersRegisterPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Register Akun Baru", level: 1 })).toBeInTheDocument();
      });
    });
  });

  describe("6. IT Module Renderer Behavior (Section 3-7, 15)", () => {
    it("renders dedicated ItMonitoringWorkspace for monitoring", () => {
      const result = renderItWorkspaceModule("monitoring");
      expect(result).not.toBeNull();
      render(result);
      expect(screen.getByRole("heading", { name: "Monitoring", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Telemetry Source: NOT CONNECTED")).toBeInTheDocument();
    });

    it("renders ItUnavailableSurface with title Systems and centralized readiness for systems", () => {
      const result = renderItWorkspaceModule("systems");
      expect(result).not.toBeNull();
      render(result);
      expect(screen.getByRole("heading", { name: "Systems", level: 2 })).toBeInTheDocument();
      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT / SYSTEMS")).toBeInTheDocument();
    });

    it("renders ItUnavailableSurface with title Security and centralized readiness for security", () => {
      const result = renderItWorkspaceModule("security");
      expect(result).not.toBeNull();
      render(result);
      expect(screen.getByRole("heading", { name: "Security", level: 2 })).toBeInTheDocument();
      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT / SECURITY")).toBeInTheDocument();
    });

    it("renders ItUnavailableSurface with title Repositories and centralized readiness for repositories", () => {
      const result = renderItWorkspaceModule("repositories");
      expect(result).not.toBeNull();
      render(result);
      expect(screen.getByRole("heading", { name: "Repositories", level: 2 })).toBeInTheDocument();
      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT / REPOSITORIES")).toBeInTheDocument();
    });

    it("returns null for unknown modules", () => {
      expect(renderItWorkspaceModule("unknown-module")).toBeNull();
      expect(renderItWorkspaceModule("foobar")).toBeNull();
    });

    it("verifies isKnownItModule identifies known IT modules", () => {
      expect(isKnownItModule("systems")).toBe(true);
      expect(isKnownItModule("integrations")).toBe(true);
      expect(isKnownItModule("database")).toBe(true);
      expect(isKnownItModule("environments")).toBe(true);
      expect(isKnownItModule("repositories")).toBe(true);
      expect(isKnownItModule("cicd")).toBe(true);
      expect(isKnownItModule("releases")).toBe(true);
      expect(isKnownItModule("tech-debt")).toBe(true);
      expect(isKnownItModule("monitoring")).toBe(true);
      expect(isKnownItModule("incidents")).toBe(true);
      expect(isKnownItModule("security")).toBe(true);
      expect(isKnownItModule("backup")).toBe(true);
      expect(isKnownItModule("unknown-slug")).toBe(false);
    });
  });

  describe("7. Direct URL Canonical IT Blocked Modules (Section 13, 14, 16)", () => {
    it("/workspace/it/systems renders ItUnavailableSurface, title Systems, BLOCKED, and no legacy workspace-panel", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      const pageResult = await ItModuleRoute({ params: Promise.resolve({ module: "systems" }) });
      const { container } = render(pageResult);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Systems", level: 2 })).toBeInTheDocument();
      });

      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT / SYSTEMS")).toBeInTheDocument();
      expect(screen.getByText(/Modul ini belum tersedia pada sistem backend/i)).toBeInTheDocument();

      // Must NOT use generic legacy fallback
      expect(container.querySelector(".workspace-panel")).toBeNull();
      expect(screen.queryByText(/Kesiapan operasional disajikan secara transparan tanpa data tiruan/i)).toBeInTheDocument();
    });

    it("/workspace/it/security renders ItUnavailableSurface, title Security, BLOCKED, and no legacy workspace-panel", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      const pageResult = await ItModuleRoute({ params: Promise.resolve({ module: "security" }) });
      const { container } = render(pageResult);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Security", level: 2 })).toBeInTheDocument();
      });

      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT / SECURITY")).toBeInTheDocument();
      expect(container.querySelector(".workspace-panel")).toBeNull();
    });

    it("/workspace/it/repositories renders ItUnavailableSurface, title Repositories, BLOCKED, and no legacy workspace-panel", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
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

      const pageResult = await ItModuleRoute({ params: Promise.resolve({ module: "repositories" }) });
      const { container } = render(pageResult);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Repositories", level: 2 })).toBeInTheDocument();
      });

      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT / REPOSITORIES")).toBeInTheDocument();
      expect(container.querySelector(".workspace-panel")).toBeNull();
    });
  });
});
