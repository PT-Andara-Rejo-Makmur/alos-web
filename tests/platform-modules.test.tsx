import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";

import * as api from "@/lib/api";
import type { IntegrationDiagnostic } from "@/lib/contracts";
import {
  projectWorkspaceNavigation,
  WorkspaceSidebar,
} from "@/features/workspace-shell";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  DatabaseWorkspace,
  IntegrationsWorkspace,
  renderItWorkspaceModule,
  SystemsWorkspace,
} from "@/modules/it";
import ItModuleRoute from "@/app/workspace/it/[module]/page";
import { canonicalPrincipal } from "./helpers/canonical-session";

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

const itIdentity = {
  workspaceId: "ws_it_01",
  workspaceKey: "it",
  workspaceLabel: "IT Workspace",
  roleLabel: "IT Administrator",
  divisionCode: "IT",
};

const itActor = {
  user_id: "usr_it_admin",
  organization_id: "org_01",
  roles: ["IT_ADMIN"],
  division_codes: ["IT"],
  workspace_ids: ["ws_it_01"],
  issued_at: "",
  expires_at: "",
};

const mockSuccessfulDiagnostic: IntegrationDiagnostic = {
  correlation_id: "corr_diag_test_998877",
  status: "connected",
  backend: {
    service: "alos-backend",
    status: "reachable",
    authority: "ALOS_BACKEND",
  },
  genesis: {
    service: "genesis-ai",
    status: "reachable",
    role: "AI_CONTROL_PLANE",
    authoritative_business_state: false,
    provider_required: false,
    correlation_id: "corr_diag_test_998877",
  },
};

const originalBaseUrl = process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;

describe("ALOS Platform Modules — Systems, Integrations, Database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = "https://backend.alos.test";
  });

  afterEach(() => {
    cleanup();
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_ALOS_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = originalBaseUrl;
    }
  });

  describe("1. Navigation Projection (Section 4, 13, 22)", () => {
    it("projects Systems as navigable: true, href /workspace/it/systems, but availability BLOCKED", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      const item = nav.find((i) => i.key === "systems");

      expect(item).toBeDefined();
      expect(item?.navigable).toBe(true);
      expect(item?.href).toBe("/workspace/it/systems");
      expect(item?.availability).toBe("BLOCKED");
      expect(item?.blockReason).toBe("BACKEND_NOT_CONNECTED");
    });

    it("projects Integrations as navigable: true, href /workspace/it/integrations, but availability BLOCKED", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      const item = nav.find((i) => i.key === "integrations");

      expect(item).toBeDefined();
      expect(item?.navigable).toBe(true);
      expect(item?.href).toBe("/workspace/it/integrations");
      expect(item?.availability).toBe("BLOCKED");
      expect(item?.blockReason).toBe("BACKEND_NOT_CONNECTED");
    });

    it("projects Database as navigable: true, href /workspace/it/database, but availability BLOCKED", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      const item = nav.find((i) => i.key === "database");

      expect(item).toBeDefined();
      expect(item?.navigable).toBe(true);
      expect(item?.href).toBe("/workspace/it/database");
      expect(item?.availability).toBe("BLOCKED");
      expect(item?.blockReason).toBe("BACKEND_NOT_CONNECTED");
    });

    it("keeps Environments as non-navigable with null href and availability BLOCKED", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      const item = nav.find((i) => i.key === "environments");

      expect(item).toBeDefined();
      expect(item?.navigable).toBe(false);
      expect(item?.href).toBeNull();
      expect(item?.availability).toBe("BLOCKED");
    });

    it("renders clickable sidebar links for Systems, Integrations, and Database with 'Belum terhubung'", () => {
      const nav = projectWorkspaceNavigation(itIdentity, itActor);
      render(<WorkspaceSidebar activeNavKey="systems" identity={itIdentity} navigation={nav} />);

      const systemsLink = screen.getByRole("link", { name: /^Systems/i });
      expect(systemsLink).toHaveAttribute("href", "/workspace/it/systems");
      expect(within(systemsLink).getByText("Belum terhubung")).toBeInTheDocument();

      const integrationsLink = screen.getByRole("link", { name: /^Integrations/i });
      expect(integrationsLink).toHaveAttribute("href", "/workspace/it/integrations");
      expect(within(integrationsLink).getByText("Belum terhubung")).toBeInTheDocument();

      const dbLink = screen.getByRole("link", { name: /^Database/i });
      expect(dbLink).toHaveAttribute("href", "/workspace/it/database");
      expect(within(dbLink).getByText("Belum terhubung")).toBeInTheDocument();

      expect(screen.queryByRole("link", { name: /^Environments/i })).not.toBeInTheDocument();
    });
  });

  describe("2. Module Renderer (Section 5, 23)", () => {
    it("renders dedicated SystemsWorkspace for 'systems'", () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);
      const el = renderItWorkspaceModule("systems");
      expect(el).not.toBeNull();
      render(el!);
      expect(screen.getByRole("heading", { name: "Systems", level: 1 })).toBeInTheDocument();
    });

    it("renders dedicated IntegrationsWorkspace for 'integrations'", () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);
      const el = renderItWorkspaceModule("integrations");
      expect(el).not.toBeNull();
      render(el!);
      expect(screen.getByRole("heading", { name: "Integrations", level: 1 })).toBeInTheDocument();
    });

    it("renders dedicated DatabaseWorkspace for 'database'", () => {
      const el = renderItWorkspaceModule("database");
      expect(el).not.toBeNull();
      render(el!);
      expect(screen.getByRole("heading", { name: "Database", level: 1 })).toBeInTheDocument();
    });

    it("renders ItUnavailableSurface for 'environments'", () => {
      const el = renderItWorkspaceModule("environments");
      expect(el).not.toBeNull();
      render(el!);
      expect(screen.getByRole("heading", { name: "Environments", level: 2 })).toBeInTheDocument();
      expect(screen.getByText("BLOCKED · BACKEND_NOT_CONNECTED")).toBeInTheDocument();
    });
  });

  describe("3. Feature 1 — Systems (/workspace/it/systems) (Section 8, 19)", () => {
    it("renders Systems page header with breadcrumb and honest BLOCKED readiness", async () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);

      render(<SystemsWorkspace />);

      expect(screen.getByText("ALOS / IT & TECHNOLOGY / SYSTEMS")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Systems", level: 1 })).toBeInTheDocument();

      const readinessSection = screen.getByLabelText("Module readiness");
      expect(within(readinessSection).getByText("BLOCKED")).toBeInTheDocument();
      expect(within(readinessSection).getByText("BACKEND_NOT_CONNECTED")).toBeInTheDocument();
      expect(getModuleReadiness("systems").availability).toBe("BLOCKED");
    });

    it("renders contract facts upon successful integration diagnostic", async () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);

      render(<SystemsWorkspace />);

      await waitFor(() => {
        expect(screen.getAllByText("CONNECTED").length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getAllByText("alos-backend").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("ALOS_BACKEND").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/genesis-ai/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("AI_CONTROL_PLANE")).toBeInTheDocument();
      expect(screen.getByText("corr_diag_test_998877")).toBeInTheDocument();
    });

    it("renders honest disconnected state when diagnostic fails without fake health", async () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockRejectedValueOnce(new Error("Network error"));

      render(<SystemsWorkspace />);

      await waitFor(() => {
        expect(screen.getAllByText("DISCONNECTED").length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getAllByText("Integration diagnostic unavailable").length).toBeGreaterThanOrEqual(1);
      // Must not render fake healthy metrics
      expect(screen.queryByText("100%")).toBeNull();
      expect(screen.queryByText("99.9%")).toBeNull();
    });

    it("renders System Registry table and architecture flow boundary", async () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);

      const { container } = render(<SystemsWorkspace />);

      const table = screen.getByRole("table", { name: "Platform systems registry" });
      expect(within(table).getByText("Web App")).toBeInTheDocument();
      expect(within(table).getByText("ALOS Backend")).toBeInTheDocument();
      expect(within(table).getByText("GENESIS")).toBeInTheDocument();
      expect(within(table).getByText("Database & Infra")).toBeInTheDocument();

      expect(screen.getByText("Web Client")).toBeInTheDocument();
      expect(
        screen.getByText(/The browser never issues direct requests to GENESIS/i),
      ).toBeInTheDocument();

      // No secrets or credentials in DOM
      expect(container.innerHTML).not.toMatch(/bearer\s+[a-zA-Z0-9_-]|password\s*[:=]|private_key/i);
      // No custom SVG paths
      expect(container.querySelector("path[d*='custom']")).toBeNull();
    });
  });

  describe("4. Feature 2 — Integrations (/workspace/it/integrations) (Section 9, 20)", () => {
    it("renders Integrations page header, BLOCKED readiness, and connected probe facts", async () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);

      render(<IntegrationsWorkspace />);

      expect(screen.getByText("ALOS / IT & TECHNOLOGY / INTEGRATIONS")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Integrations", level: 1 })).toBeInTheDocument();

      const readinessSection = screen.getByLabelText("Module readiness");
      expect(within(readinessSection).getByText("BLOCKED")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getAllByText("ALOS_BACKEND").length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getByText("GET /api/v1/system/integration")).toBeInTheDocument();
      expect(screen.getAllByText("corr_diag_test_998877").length).toBeGreaterThanOrEqual(1);
    });

    it("does not infer internal hop failure when diagnostic fails", async () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockRejectedValueOnce(new Error("Generic failure"));

      render(<IntegrationsWorkspace />);

      await waitFor(() => {
        expect(screen.getAllByText("DISCONNECTED").length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getAllByText("Integration diagnostic unavailable").length).toBeGreaterThanOrEqual(1);
      // Must not falsely assert individual hop failure
      expect(screen.queryByText("GENESIS down")).toBeNull();
      expect(screen.queryByText("Backend down")).toBeNull();
    });

    it("protects security boundaries: no direct internal GENESIS URL and no secrets", async () => {
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);

      const { container } = render(<IntegrationsWorkspace />);

      expect(container.innerHTML).not.toContain("genesis-internal.service");
      expect(container.innerHTML).not.toContain("http://localhost:8001");
      expect(container.innerHTML).not.toMatch(/authorization:\s*bearer/i);
    });
  });

  describe("5. Feature 3 — Database (/workspace/it/database) (Section 10, 21)", () => {
    it("renders Database page header, BLOCKED readiness, and NOT CONNECTED source", () => {
      render(<DatabaseWorkspace />);

      expect(screen.getByText("ALOS / IT & TECHNOLOGY / DATABASE")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Database", level: 1 })).toBeInTheDocument();

      const readinessSection = screen.getByLabelText("Module readiness");
      expect(within(readinessSection).getByText("BLOCKED")).toBeInTheDocument();

      const sourceSection = screen.getByLabelText("Database source status");
      expect(within(sourceSection).getByText("NOT CONNECTED")).toBeInTheDocument();
      expect(within(sourceSection).getByText("Backend database inventory source is not connected.")).toBeInTheDocument();
    });

    it("displays honest empty state for Database Registry with zero fake instances", () => {
      const { container } = render(<DatabaseWorkspace />);

      const table = screen.getByRole("table", { name: "Database instances registry" });
      expect(within(table).getByText("No backend database inventory source connected.")).toBeInTheDocument();

      // Zero fabricated DB instances
      expect(container.innerHTML).not.toContain("production-db");
      expect(container.innerHTML).not.toContain("postgres-main");
      expect(container.innerHTML).not.toContain("rds.amazonaws.com");
      expect(container.innerHTML).not.toContain("5432");
    });

    it("shows NOT CONNECTED for all operational evidence rows and strict security notice", () => {
      const { container } = render(<DatabaseWorkspace />);

      expect(screen.getByText("Database Connectivity")).toBeInTheDocument();
      expect(screen.getByText("Schema & Migrations")).toBeInTheDocument();
      expect(screen.getByText("Engine Health Signals")).toBeInTheDocument();

      expect(
        screen.getByText(
          /Browser does not connect directly to business databases\. Database authority and credentials remain behind Backend \/ infrastructure boundaries\./i,
        ),
      ).toBeInTheDocument();

      // Zero credentials
      expect(container.innerHTML).not.toMatch(/postgres:\/\/|mysql:\/\/|mongodb:\/\/|password\s*[:=]|dsn/i);
    });
  });

  describe("6. Canonical Route Loading via ItModuleRoute", () => {
    it("loads Systems surface via canonical route /workspace/it/systems", async () => {
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
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);

      const page = await ItModuleRoute({ params: Promise.resolve({ module: "systems" }) });
      render(page);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Systems", level: 1 })).toBeInTheDocument();
      });
    });

    it("loads Integrations surface via canonical route /workspace/it/integrations", async () => {
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
      vi.spyOn(api, "getIntegrationDiagnostic").mockResolvedValueOnce(mockSuccessfulDiagnostic);

      const page = await ItModuleRoute({ params: Promise.resolve({ module: "integrations" }) });
      render(page);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Integrations", level: 1 })).toBeInTheDocument();
      });
    });

    it("loads Database surface via canonical route /workspace/it/database", async () => {
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

      const page = await ItModuleRoute({ params: Promise.resolve({ module: "database" }) });
      render(page);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Database", level: 1 })).toBeInTheDocument();
      });
    });
  });
});
