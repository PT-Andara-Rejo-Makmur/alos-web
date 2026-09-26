import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  checkMakerCheckerConflict,
  createDefaultItSnapshot,
  ItDashboardHome,
  ItDashboardPage,
  sanitizeItClientContext,
} from "@/modules/it/overview";
import { ItMonitoringWorkspace } from "@/modules/it/monitoring";
import { GenesisControlPlaneWorkspace } from "@/modules/it/genesis/control-plane";
import { canonicalPrincipal } from "./helpers/canonical-session";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/workspace/it",
}));

describe("IT visual foundation", () => {
  const snapshot = createDefaultItSnapshot();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(cleanup);

  describe("IT Overview", () => {
    it("renders the operations heading and compact readiness strip", () => {
      render(<ItDashboardHome snapshot={snapshot} />);

      expect(screen.getByRole("heading", { level: 1, name: "IT Operations" })).toBeInTheDocument();
      const readiness = screen.getByRole("heading", { level: 2, name: "Operational Source Coverage" }).parentElement!;
      expect(within(readiness).getByText("GENESIS")).toBeInTheDocument();
      expect(within(readiness).getByText("Governance")).toBeInTheDocument();
      expect(within(readiness).getByText("Monitoring")).toBeInTheDocument();
      expect(within(readiness).getByText("Backup")).toBeInTheDocument();
      expect(within(readiness).getByText("Security")).toBeInTheDocument();
    });

    it("does not render fabricated KPI values or the old metric-card structure", () => {
      const { container } = render(<ItDashboardHome snapshot={snapshot} />);
      expect(container.textContent).not.toMatch(/99\.9%|100%|0 incidents|27 agents|98%/i);
      expect(container.querySelector('[class*="metricCard"]')).toBeNull();
    });

    it("separates repository presence from runtime health", () => {
      render(<ItDashboardHome snapshot={snapshot} />);
      const table = screen.getByRole("table", { name: "Systems and delivery status" });
      const webRow = within(table).getByText("Web App").closest("tr")!;
      expect(within(webRow).getByText("Current repository")).toBeInTheDocument();
      expect(within(webRow).getByText("Unknown")).toBeInTheDocument();
      expect(screen.getByText("Repository exists != runtime healthy.")).toBeInTheDocument();
    });

    it("reports Monitoring, Backup, and Security as NOT CONNECTED", () => {
      render(<ItDashboardHome snapshot={snapshot} />);
      const table = screen.getByRole("table", { name: "Operations source status" });
      for (const label of ["Monitoring", "Backup", "Security"]) {
        const row = within(table).getByText(label).closest("tr")!;
        expect(within(row).getByText("NOT CONNECTED")).toBeInTheDocument();
      }
    });

    it("uses a technical Control Cadence table with monospace control IDs", () => {
      render(<ItDashboardHome snapshot={snapshot} />);
      const table = screen.getByRole("table", { name: "IT control cadence" });
      expect(within(table).getAllByRole("row")).toHaveLength(7);
      expect(within(table).getByText("IT-D-01").tagName).toBe("CODE");
      expect(within(table).getByText("Backup success")).toBeInTheDocument();
      expect(within(table).getByText("Restore drill")).toBeInTheDocument();
    });

    it("links the GENESIS utility CTA to its canonical route", () => {
      render(<ItDashboardHome snapshot={snapshot} />);
      expect(screen.getByRole("link", { name: /Open Control Plane/i })).toHaveAttribute("href", "/workspace/it/genesis");
    });
  });

  describe("Monitoring", () => {
    it("preserves centralized BLOCKED readiness and telemetry NOT CONNECTED state", () => {
      render(<ItMonitoringWorkspace />);
      expect(screen.getByRole("heading", { level: 1, name: "Monitoring" })).toBeInTheDocument();
      expect(getModuleReadiness("monitoring")).toEqual({ availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" });
      expect(screen.getByText("BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      const sourceRegion = screen.getByRole("region", { name: "Telemetry source" });
      expect(within(sourceRegion).getByText("NOT CONNECTED")).toBeInTheDocument();
    });

    it("renders an honest empty service table and event region", () => {
      render(<ItMonitoringWorkspace />);
      const table = screen.getByRole("table", { name: "Service health telemetry" });
      expect(within(table).getByText("No telemetry source connected.")).toBeInTheDocument();
      expect(within(table).queryAllByRole("row")).toHaveLength(2);
      expect(screen.getByText("No operational events available.")).toBeInTheDocument();
      expect(document.body.textContent).not.toMatch(/99\.9%|uptime|deployed at|incident opened/i);
    });

    it("shows all six coverage rows without a card grid", () => {
      const { container } = render(<ItMonitoringWorkspace />);
      for (const label of ["Application", "Backend", "Infrastructure", "Database", "Security", "Backup"]) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
      expect(container.querySelector('[class*="coverageCard"]')).toBeNull();
    });

    it("contains no handwritten SVG markup in the canonical source", () => {
      const source = readFileSync(resolve(process.cwd(), "src/modules/it/monitoring/it-monitoring-workspace.tsx"), "utf8");
      expect(source).not.toMatch(/<(svg|path|circle|polygon|rect)\b/i);
    });
  });

  describe("GENESIS Control Plane", () => {
    it("renders centralized control-plane status without a health claim", () => {
      render(<GenesisControlPlaneWorkspace />);
      expect(screen.getByRole("heading", { level: 1, name: "GENESIS Control Plane" })).toBeInTheDocument();
      expect(getModuleReadiness("control-plane")).toEqual({ availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" });
      expect(screen.getByText("Frontend control surface available. Backend operational integration not connected.")).toBeInTheDocument();
      expect(document.body.textContent).not.toMatch(/healthy|online|27 agents|AI score/i);
    });

    it("resolves every technical registry readiness from the centralized matrix", () => {
      render(<GenesisControlPlaneWorkspace />);
      const table = screen.getByRole("table", { name: "GENESIS technical registry" });
      for (const [label, key] of [["Agents", "agents"], ["Skills", "skills"], ["Research", "research"], ["Models & Tools", "models-tools"]] as const) {
        const row = within(table).getByText(label).closest("tr")!;
        expect(within(row).getByText(getModuleReadiness(key).availability)).toBeInTheDocument();
        expect(within(row).getByText(getModuleReadiness(key).blockReason!)).toBeInTheDocument();
      }
    });

    it("uses centralized governance readiness and canonical routes", () => {
      render(<GenesisControlPlaneWorkspace />);
      const routes = [
        "/workspace/it/governance/evidence",
        "/workspace/it/governance/uat",
        "/workspace/it/governance/decisions",
      ];
      for (const route of routes) {
        expect(screen.getByRole("link", { name: route })).toHaveAttribute("href", route);
      }
    });

    it("does not restore any legacy subsystem UI", () => {
      render(<GenesisControlPlaneWorkspace />);
      for (const legacy of ["FactoryWorkspace", "ItReviewProjection", "GenesisRdGovernanceView", "Show All", "Capability Factory"]) {
        expect(screen.queryByText(legacy)).not.toBeInTheDocument();
      }
    });
  });

  describe("access and client boundaries", () => {
    it("loads the protected Overview for an authorized IT principal", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
        authenticated: true,
        principal: canonicalPrincipal({ actorId: "usr_it_01", divisionCode: "IT", workspaceId: "ws_it_01", workspaceKey: "it", workspaceName: "IT Workspace", roles: ["IT_ADMIN"] }),
      });
      render(<ItDashboardPage initialSnapshot={snapshot} />);
      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "IT Operations" })).toBeInTheDocument());
    });

    it("preserves secret sanitization and maker-checker checks", () => {
      const sanitized = sanitizeItClientContext({ apiKey: "secret", password: "secret", systemName: "ALOS Core" });
      expect(sanitized).toEqual({ systemName: "ALOS Core" });
      expect(checkMakerCheckerConflict("user_123", "user_123")).toBe(true);
      expect(checkMakerCheckerConflict("user_123", "user_456")).toBe(false);
    });
  });
});
