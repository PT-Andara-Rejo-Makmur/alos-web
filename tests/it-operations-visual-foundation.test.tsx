import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import { ItDashboardPage } from "@/features/it-dashboard";
import { ItMonitoringWorkspace } from "@/features/it-monitoring";
import { GenesisControlPlaneWorkspace } from "@/features/genesis-control-plane";
import WorkspaceItGenesisPage from "@/app/workspace/it/genesis/page";
import ItModuleRoute from "@/app/workspace/it/[module]/page";
import { getModuleReadiness } from "@/features/workspace-routing";

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

    it("renders Core Registry technical areas with correct routes and readiness", () => {
      render(<GenesisControlPlaneWorkspace />);

      expect(screen.getByText("Technical Areas")).toBeInTheDocument();

      const agentsLink = screen.getByRole("link", { name: /Agent Workforce & Factory/i });
      expect(agentsLink).toHaveAttribute("href", "/workspace/it/genesis/agents");
      expect(within(agentsLink).getByText("READY")).toBeInTheDocument();

      const skillsLink = screen.getByRole("link", { name: /Skill Registry & Tools/i });
      expect(skillsLink).toHaveAttribute("href", "/workspace/it/genesis/skills");
      expect(within(skillsLink).getByText("BLOCKED")).toBeInTheDocument();

      const researchLink = screen.getByRole("link", { name: /R&D Domain Governance/i });
      expect(researchLink).toHaveAttribute("href", "/workspace/it/genesis/research");
      expect(within(researchLink).getByText("READY")).toBeInTheDocument();

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

    it("renders sub-system tabs and capability factory without stacking", () => {
      render(<GenesisControlPlaneWorkspace />);

      expect(screen.getByRole("tab", { name: "Capability Factory" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Assurance Structure" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "R&D Domain Access" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Platform Governance" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Show All" })).toBeInTheDocument();

      // Factory workspace is rendered inside bounded subsystem section
      expect(screen.getByText("Requirement menjadi proposal terstruktur")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Analisis melalui Backend" })).toBeInTheDocument();
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
});
