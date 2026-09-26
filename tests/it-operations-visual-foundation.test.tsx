import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import { ItDashboardPage } from "@/workspaces/it/overview";
import { ItMonitoringWorkspace } from "@/workspaces/it/monitoring";
import { GenesisControlPlaneWorkspace } from "@/workspaces/it/genesis/control-plane";
import WorkspaceItGenesisPage from "@/app/workspace/it/genesis/page";
import ItModuleRoute from "@/app/workspace/it/[module]/page";
import { getModuleReadiness } from "@/features/workspace-routing";
import { projectWorkspaceNavigation, WorkspaceSidebar } from "@/features/workspace-shell";

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

describe("IT Operations Visual Foundation (Tahap 1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("A. IT Overview Visual Layout & Zero-Fabrication", () => {
    it("renders technical operations console header with breadcrumb and honest source state", async () => {
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

      render(<ItDashboardPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "IT Operations", level: 1 }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("ALOS / IT & TECHNOLOGY")).toBeInTheDocument();
      expect(
        screen.getByText("Platform status, delivery controls, operational readiness, dan technical AI control plane."),
      ).toBeInTheDocument();
      expect(screen.getByText("Backend Projection · Read-only")).toBeInTheDocument();
    });

    it("renders compact Operational Readiness Strip with proper items and states", async () => {
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

      render(<ItDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("IT Operational Readiness")).toBeInTheDocument();
      });

      const strip = screen.getByLabelText("Kesiapan Data IT & Telemetri");
      expect(within(strip).getByText("GENESIS")).toBeInTheDocument();
      expect(within(strip).getByText("Governance")).toBeInTheDocument();
      expect(within(strip).getByText("Monitoring")).toBeInTheDocument();
      expect(within(strip).getByText("Backup")).toBeInTheDocument();
      expect(within(strip).getByText("Security")).toBeInTheDocument();

      expect(within(strip).getAllByText("PARTIAL").length).toBe(2);
      expect(within(strip).getAllByText("NOT CONNECTED").length).toBe(3);
    });

    it("renders Systems & Delivery table asserting repository existence != runtime health", async () => {
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

      render(<ItDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Systems & Delivery")).toBeInTheDocument();
      });

      expect(screen.getByText("Web App")).toBeInTheDocument();
      expect(screen.getByText("Backend API")).toBeInTheDocument();
      expect(screen.getByText("Contracts")).toBeInTheDocument();
      expect(screen.getByText("Infrastructure")).toBeInTheDocument();
      expect(screen.getByText("Repo existence != runtime health.")).toBeInTheDocument();
    });

    it("renders dense technical Control Cadence table with 6 rows and monospace control IDs", async () => {
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

      render(<ItDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("IT Control Cadence")).toBeInTheDocument();
      });

      expect(screen.getByText("IT-D-01")).toBeInTheDocument();
      expect(screen.getByText("IT-D-02")).toBeInTheDocument();
      expect(screen.getByText("IT-W-01")).toBeInTheDocument();
      expect(screen.getByText("IT-W-02")).toBeInTheDocument();
      expect(screen.getByText("IT-M-01/02/03")).toBeInTheDocument();
      expect(screen.getByText("IT-M-04")).toBeInTheDocument();

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(7); // 1 header + 6 data rows
    });

    it("renders GENESIS Control Plane summary with canonical technical routes", async () => {
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

      render(<ItDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Control Plane Operations")).toBeInTheDocument();
      });

      const ctaLink = screen.getByRole("link", { name: /Buka GENESIS Control Plane/i });
      expect(ctaLink).toHaveAttribute("href", "/workspace/it/genesis");

      const agentLink = screen.getByRole("link", { name: /Agent Registry/i });
      expect(agentLink).toHaveAttribute("href", "/workspace/it/genesis/agents");
    });
  });

  describe("B. Dedicated IT Monitoring Page & Honest BLOCKED State", () => {
    it("renders dedicated monitoring workspace with NOT CONNECTED telemetry source", () => {
      render(<ItMonitoringWorkspace />);

      expect(screen.getByRole("heading", { name: "Monitoring", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT & TECHNOLOGY / MONITORING")).toBeInTheDocument();
      expect(screen.getByText("Operational telemetry and service health.")).toBeInTheDocument();

      expect(screen.getByText("Telemetry Source: NOT CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("Backend telemetry integration belum tersedia.")).toBeInTheDocument();
    });

    it("renders Service Health table with honest empty state without fake service rows", () => {
      render(<ItMonitoringWorkspace />);

      expect(screen.getByText("Service Health Table")).toBeInTheDocument();
      expect(screen.getByText("No telemetry source connected.")).toBeInTheDocument();
      expect(screen.queryByText("99.99% uptime")).not.toBeInTheDocument();
      expect(screen.queryByText("healthy")).not.toBeInTheDocument();
    });

    it("renders Active Signal & Event stream with honest empty state without fake incidents", () => {
      render(<ItMonitoringWorkspace />);

      expect(screen.getByText("Active Signal & Event Stream")).toBeInTheDocument();
      expect(screen.getByText("No operational events available.")).toBeInTheDocument();
      expect(screen.queryByText("0 critical incidents")).not.toBeInTheDocument();
    });

    it("renders 6 coverage categories with NOT CONNECTED status", () => {
      render(<ItMonitoringWorkspace />);

      expect(screen.getByText("Monitoring Coverage")).toBeInTheDocument();
      expect(screen.getByText("Application")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
      expect(screen.getByText("Infrastructure")).toBeInTheDocument();
      expect(screen.getByText("Database")).toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();
      expect(screen.getByText("Backup")).toBeInTheDocument();

      const notConnectedBadges = screen.getAllByText("NOT CONNECTED");
      expect(notConnectedBadges.length).toBe(6);
    });

    it("renders operational notice explaining presentation boundary", () => {
      render(<ItMonitoringWorkspace />);

      expect(
        screen.getByText(/Monitoring page is presentation only. Source of truth remains backend telemetry and operations integrations./i),
      ).toBeInTheDocument();
    });

    it("verifies module readiness for monitoring remains BLOCKED with BACKEND_NOT_CONNECTED", () => {
      const readiness = getModuleReadiness("monitoring");
      expect(readiness.availability).toBe("BLOCKED");
      expect(readiness.blockReason).toBe("BACKEND_NOT_CONNECTED");
    });

    it("renders ItMonitoringWorkspace through ItModuleRoute for canonicalModule monitoring under verified IT session", async () => {
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

      const pageResult = await ItModuleRoute({ params: Promise.resolve({ module: "monitoring" }) });
      render(pageResult);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Monitoring", level: 1 })).toBeInTheDocument();
      });
      expect(screen.getByText("Telemetry Source: NOT CONNECTED")).toBeInTheDocument();
    });
  });

  describe("C. GENESIS Control Plane Redesign", () => {
    it("renders technical control plane header and PARTIAL status strip", () => {
      render(<GenesisControlPlaneWorkspace />);

      expect(
        screen.getByRole("heading", { name: "GENESIS Control Plane", level: 1 }),
      ).toBeInTheDocument();
      expect(screen.getByText("ALOS / IT / GENESIS")).toBeInTheDocument();
      expect(
        screen.getByText("Technical AI operations, agent registry, capability controls, research and governance."),
      ).toBeInTheDocument();

      expect(screen.getByText("Control Plane Status: PARTIAL")).toBeInTheDocument();
      expect(
        screen.getByText(/Configuration & governance models active; autonomous telemetry awaiting backend connector./i),
      ).toBeInTheDocument();
    });

    it("renders Core Registry technical areas reading from centralized readiness", () => {
      render(<GenesisControlPlaneWorkspace />);

      expect(screen.getByText("Technical Areas")).toBeInTheDocument();

      const agentsLink = screen.getByRole("link", { name: /Agent Workforce & Factory/i });
      expect(agentsLink).toHaveAttribute("href", "/workspace/it/genesis/agents");
      expect(within(agentsLink).getByText("BLOCKED")).toBeInTheDocument();

      const skillsLink = screen.getByRole("link", { name: /Skill Registry & Tools/i });
      expect(skillsLink).toHaveAttribute("href", "/workspace/it/genesis/skills");
      expect(within(skillsLink).getByText("BLOCKED")).toBeInTheDocument();

      const researchLink = screen.getByRole("link", { name: /R&D Domain Governance/i });
      expect(researchLink).toHaveAttribute("href", "/workspace/it/genesis/research");
      expect(within(researchLink).getByText("BLOCKED")).toBeInTheDocument();

      const modelsLink = screen.getByRole("link", { name: /Models & Tools Registry/i });
      expect(modelsLink).toHaveAttribute("href", "/workspace/it/genesis/models-tools");
      expect(within(modelsLink).getByText("BLOCKED")).toBeInTheDocument();
    });

    it("renders Governance cross-reference section pointing to canonical IT governance routes", () => {
      render(<GenesisControlPlaneWorkspace />);

      expect(screen.getByText("Audit & Decision Portals")).toBeInTheDocument();

      const evidenceLink = screen.getByRole("link", { name: /Evidence Chain & Logs/i });
      expect(evidenceLink).toHaveAttribute("href", "/workspace/it/governance/evidence");

      const uatLink = screen.getByRole("link", { name: /UAT Gates & Verification/i });
      expect(uatLink).toHaveAttribute("href", "/workspace/it/governance/uat");

      const decisionsLink = screen.getByRole("link", { name: /Operational Decisions/i });
      expect(decisionsLink).toHaveAttribute("href", "/workspace/it/governance/decisions");
    });

    it("does NOT render legacy subsystem tabs or legacy workspaces in control plane", () => {
      render(<GenesisControlPlaneWorkspace />);

      // Subsystem tabs must NOT be present
      expect(screen.queryByRole("tab", { name: "Capability Factory" })).not.toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "Assurance Structure" })).not.toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "R&D Domain Access" })).not.toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "Platform Governance" })).not.toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "Show All" })).not.toBeInTheDocument();

      // Legacy UI content must NOT be present
      expect(screen.queryByText("Requirement menjadi proposal terstruktur")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Analisis melalui Backend" })).not.toBeInTheDocument();
      expect(screen.queryByText("Status Tata Kelola 4 Domain R&D")).not.toBeInTheDocument();
    });

    it("renders WorkspaceItGenesisPage under verified IT authority", async () => {
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

      render(<WorkspaceItGenesisPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "GENESIS Control Plane", level: 1 })).toBeInTheDocument();
      });
      expect(screen.getByText("ALOS / IT / GENESIS")).toBeInTheDocument();
    });
  });

  describe("D. Navigation Navigability vs Operational Readiness (Section 25)", () => {
    const itIdentity = {
      workspaceId: "ws_it_01",
      workspaceKey: "it",
      workspaceLabel: "IT Workspace",
      roleLabel: "IT Lead",
      divisionCode: "IT",
    };
    const itActor = {
      user_id: "usr_01",
      organization_id: "org_01",
      roles: ["IT_ADMIN"],
      division_codes: ["IT"],
      workspace_ids: ["ws_it_01"],
      issued_at: "",
      expires_at: "",
    };

    it("A. Monitoring: readiness BLOCKED, surface navigable, href /workspace/it/monitoring, sidebar clickable", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      const monitoringItem = nav.find((i) => i.key === "monitoring");

      expect(monitoringItem).toBeDefined();
      expect(monitoringItem?.availability).toBe("BLOCKED");
      expect(monitoringItem?.navigable).toBe(true);
      expect(monitoringItem?.href).toBe("/workspace/it/monitoring");

      render(<WorkspaceSidebar identity={itIdentity} navigation={nav} activeNavKey="overview" />);
      const monitoringLink = screen.getByRole("link", { name: /Monitoring/i });
      expect(monitoringLink).toBeInTheDocument();
      expect(monitoringLink).toHaveAttribute("href", "/workspace/it/monitoring");
      expect(within(monitoringLink).getByText("Belum terhubung")).toBeInTheDocument();
    });

    it("B. Control Plane: readiness BLOCKED, surface navigable, href /workspace/it/genesis, sidebar clickable", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      const cpItem = nav.find((i) => i.key === "control-plane");

      expect(cpItem).toBeDefined();
      expect(cpItem?.availability).toBe("BLOCKED");
      expect(cpItem?.navigable).toBe(true);
      expect(cpItem?.href).toBe("/workspace/it/genesis");

      render(<WorkspaceSidebar identity={itIdentity} navigation={nav} activeNavKey="overview" />);
      const cpLink = screen.getByRole("link", { name: /Control Plane/i });
      expect(cpLink).toBeInTheDocument();
      expect(cpLink).toHaveAttribute("href", "/workspace/it/genesis");
    });

    it("C. Module without surface: BLOCKED, navigable false, sidebar disabled", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      const systemsItem = nav.find((i) => i.key === "systems");

      expect(systemsItem).toBeDefined();
      expect(systemsItem?.availability).toBe("BLOCKED");
      expect(systemsItem?.navigable).toBe(false);
      expect(systemsItem?.href).toBeNull();

      render(<WorkspaceSidebar identity={itIdentity} navigation={nav} activeNavKey="overview" />);
      expect(screen.queryByRole("link", { name: /^Systems/i })).not.toBeInTheDocument();

      const incidentsItem = nav.find((i) => i.key === "incidents");
      expect(incidentsItem?.navigable).toBe(false);
      expect(incidentsItem?.href).toBeNull();
    });
  });
});
