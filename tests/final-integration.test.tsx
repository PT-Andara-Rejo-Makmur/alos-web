import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  WORKSPACE_ROUTES,
  COMPATIBILITY_ROUTES,
  getModuleReadiness,
  getWorkspaceRoot,
  getWorkspaceModuleRoute,
  getWorkspaceAraRoute,
  getWorkspaceAgentsRoute,
  getGenesisRoute,
  getGovernanceRoute,
} from "@/features/workspace-routing";
import {
  projectWorkspaceNavigation,
  WorkspaceSidebar,
  ContextualWorkspaceModulePage,
} from "@/features/workspace-shell";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import { dashboardModules } from "@/features/workspace-routing/dashboard-modules";
import { NotificationCenter } from "@/features/notifications/notification-center";
import type { SessionActor } from "@/features/session";
import * as api from "@/lib/api";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

const mockRouter = {
  push: mockPush,
  replace: mockReplace,
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/projects",
  useSearchParams: () => mockSearchParams,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => createElement("a", { href, ...props }, children),
}));

describe("ALOS Web Shared Modules & Final Integration", () => {
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

  const sampleDirectorActor: SessionActor = {
    user_id: "usr_dir_01",
    organization_id: "org_andara_holding",
    roles: ["EXECUTIVE"],
    division_codes: ["EXECUTIVE"],
    workspace_ids: ["ws_executive_01", "ws_finance_02"],
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  };

  const samplePropertyActor: SessionActor = {
    user_id: "usr_prop_01",
    organization_id: "org_andara_holding",
    roles: ["PROPERTY_MANAGER"],
    division_codes: ["PROPERTY"],
    workspace_ids: ["ws_property_park_town", "ws_property_other"],
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  };

  const samplePropertyIdentity: WorkspaceShellIdentity = {
    workspaceId: "ws_property_park_town",
    workspaceKey: "property",
    workspaceLabel: "The Park Town Sukoharjo",
    roleLabel: "Property Manager",
    divisionCode: "PROPERTY",
  };

  describe("1. Centralized Routing & Canonical Routes", () => {
    it("defines canonical workspace roots for all 7 workspaces and resolver", () => {
      expect(WORKSPACE_ROUTES.resolver).toBe("/workspace");
      expect(WORKSPACE_ROUTES.executive).toBe("/workspace/executive");
      expect(WORKSPACE_ROUTES.finance).toBe("/workspace/finance");
      expect(WORKSPACE_ROUTES.property).toBe("/workspace/property");
      expect(WORKSPACE_ROUTES.sales).toBe("/workspace/sales");
      expect(WORKSPACE_ROUTES.hr).toBe("/workspace/hr");
      expect(WORKSPACE_ROUTES.legal).toBe("/workspace/legal");
      expect(WORKSPACE_ROUTES.it).toBe("/workspace/it");
      expect(getWorkspaceRoot("finance")).toBe("/workspace/finance");
    });

    it("generates canonical contextual routes for shared work, ARA, and agents", () => {
      expect(getWorkspaceModuleRoute("finance", "tasks")).toBe("/workspace/finance/tasks");
      expect(getWorkspaceModuleRoute("hr", "tasks")).toBe("/workspace/hr/tasks");
      expect(getWorkspaceModuleRoute("property", "projects")).toBe("/workspace/property/projects");
      expect(getWorkspaceModuleRoute("finance", "month-close")).toBe("/workspace/finance/month-close");
      expect(getWorkspaceModuleRoute("property", "payment-certificates")).toBe(
        "/workspace/property/payment-certificates",
      );
      expect(getWorkspaceAraRoute("finance")).toBe("/workspace/finance/ara");
      expect(getWorkspaceAgentsRoute("finance")).toBe("/workspace/finance/agents");
      expect(getWorkspaceAgentsRoute("it")).toBe("/workspace/it/genesis/agents");
      expect(getGenesisRoute()).toBe("/workspace/it/genesis");
      expect(getGenesisRoute("agents")).toBe("/workspace/it/genesis/agents");
      expect(getGenesisRoute("models-tools")).toBe("/workspace/it/genesis/models-tools");
      expect(getGovernanceRoute()).toBe("/workspace/it/governance");
    });

    it("preserves compatibility routes mapping", () => {
      expect(COMPATIBILITY_ROUTES.businessProjects).toBe("/business/projects");
      expect(COMPATIBILITY_ROUTES.businessTasks).toBe("/business/tasks");
      expect(COMPATIBILITY_ROUTES.businessApprovals).toBe("/business/approvals");
      expect(COMPATIBILITY_ROUTES.businessDocuments).toBe("/business/documents");
      expect(COMPATIBILITY_ROUTES.businessReports).toBe("/business/reports");
      expect(COMPATIBILITY_ROUTES.businessFindings).toBe("/business/findings");
      expect(COMPATIBILITY_ROUTES.director).toBe("/director");
      expect(COMPATIBILITY_ROUTES.ara).toBe("/ara");
      expect(COMPATIBILITY_ROUTES.agents).toBe("/agents");
      expect(COMPATIBILITY_ROUTES.genesis).toBe("/genesis");
      expect(COMPATIBILITY_ROUTES.governance).toBe("/governance");
    });
  });

  describe("2. Module Readiness Matrix & 2-Dimensional Navigation", () => {
    it("keeps shared modules BLOCKED until backend and E2E are complete", () => {
      expect(getModuleReadiness("projects").availability).toBe("BLOCKED");
      expect(getModuleReadiness("tasks").availability).toBe("BLOCKED");
      expect(getModuleReadiness("approvals").availability).toBe("BLOCKED");
      expect(getModuleReadiness("documents").availability).toBe("BLOCKED");
      expect(getModuleReadiness("reports").availability).toBe("BLOCKED");
      expect(getModuleReadiness("findings").availability).toBe("BLOCKED");
      expect(getModuleReadiness("ara").availability).toBe("BLOCKED");
      expect(getModuleReadiness("agents").availability).toBe("BLOCKED");
      expect(getModuleReadiness("research").availability).toBe("BLOCKED");
      expect(getModuleReadiness("evidence").availability).toBe("BLOCKED");
      expect(getModuleReadiness("decisions").availability).toBe("BLOCKED");
      expect(getModuleReadiness("control-plane").availability).toBe("BLOCKED");
    });

    it("evaluates unintegrated domain sub-modules as BLOCKED with clear blockReason", () => {
      const construction = getModuleReadiness("construction");
      expect(construction.availability).toBe("BLOCKED");
      expect(construction.blockReason).toBe("BACKEND_NOT_CONNECTED");

      const quality = getModuleReadiness("quality");
      expect(quality.availability).toBe("BLOCKED");
      expect(quality.blockReason).toBe("CONTRACT_PENDING");

      const unknownModule = getModuleReadiness("non_existent_module");
      expect(unknownModule.availability).toBe("BLOCKED");
    });

    it("maps navigation items to READY or BLOCKED with href=null when BLOCKED", () => {
      const items = projectWorkspaceNavigation(samplePropertyIdentity, samplePropertyActor);

      // Shared modules stay visible but fail closed until every readiness dimension is green.
      const projectsItem = items.find((item) => item.key === "projects");
      expect(projectsItem).toBeDefined();
      expect(projectsItem?.availability).toBe("BLOCKED");
      expect(projectsItem?.href).toBeNull();
      expect(projectsItem?.available).toBe(false);

      const tasksItem = items.find((item) => item.key === "tasks");
      expect(tasksItem).toBeDefined();
      expect(tasksItem?.availability).toBe("BLOCKED");
      expect(tasksItem?.href).toBeNull();

      // Blocked domain modules should have null href and BLOCKED availability
      const constructionItem = items.find((item) => item.key === "construction");
      expect(constructionItem).toBeDefined();
      expect(constructionItem?.availability).toBe("BLOCKED");
      expect(constructionItem?.href).toBeNull();
      expect(constructionItem?.available).toBe(false);
      expect(constructionItem?.blockReason).toBe("BACKEND_NOT_CONNECTED");
    });

    it("renders blocked items with aria-disabled='true' and 'Belum tersedia' badge", () => {
      const items = projectWorkspaceNavigation(samplePropertyIdentity, samplePropertyActor);

      const html = renderToStaticMarkup(
        createElement(WorkspaceSidebar, {
          activeNavKey: "projects",
          identity: samplePropertyIdentity,
          navigation: items,
        })
      );

      expect(html).not.toContain('href="/workspace/property/projects"');

      // Blocked items have aria-disabled="true" and "Belum tersedia" badge
      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain("Belum tersedia");
      expect(html).toContain("Menunggu integrasi sistem");
    });
  });

  describe("3. Elimination of workspace_ids[0] & division_codes[0] Assumptions", () => {
    it("respects injected activeWorkspace context over actor.workspace_ids[0]", () => {
      // Actor has workspace_ids: ["ws_executive_01", "ws_finance_02"]
      // Target active identity is "ws_finance_02"
      const targetIdentity: WorkspaceShellIdentity = {
        workspaceId: "ws_finance_02",
        workspaceKey: "finance",
        workspaceLabel: "Finance Holding",
        roleLabel: "Direktur",
        divisionCode: "FINANCE",
      };

      const nav = projectWorkspaceNavigation(targetIdentity, sampleDirectorActor);
      expect(nav).toBeDefined();

      // Navigation uses canonical routes
      const approvalItem = nav.find((item) => item.key === "approvals");
      expect(approvalItem?.href).toBeNull();
    });
  });

  describe("4. Taxonomy & Icon Cleanup", () => {
    it("documents GENESIS as AI Control Plane and not AI Executive Assistant", () => {
      expect(dashboardModules.genesis.title).toBe("GENESIS");
      expect(dashboardModules.genesis.description).toContain("AI Control Plane");
      expect(dashboardModules.genesis.description).not.toContain("AI Executive Assistant");
    });

    it("renders NotificationCenter using Lucide Bell icon without raw SVG path", () => {
      vi.spyOn(api, "apiRequest").mockResolvedValueOnce([]);

      const { container } = render(createElement(NotificationCenter));
      const button = container.querySelector(".alos-notifications");
      expect(button).toBeDefined();

      // Lucide Bell has lucide-bell or class lucide
      const svg = button?.querySelector("svg");
      expect(svg).toBeDefined();
      expect(svg?.classList.contains("lucide-bell") || svg?.classList.contains("lucide")).toBe(true);

      // Verify no raw hardcoded old path exists
      expect(container.innerHTML).not.toContain("M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4");
    });
  });

  describe("5. ContextualWorkspaceModulePage Controlled Lifecycle", () => {
    it("renders NEEDS_INFO state when workspace resolution is required", async () => {
      // Mock authenticated actor with multiple workspaces and no resolution
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: {
          actor: {
            actor_id: "usr_multi_01",
            tenant_id: "tenant_1",
            organization_id: "org_1",
            display_name: "Multi Workspace User",
            active: true,
          },
          email: "multi@andara.local",
          workspace_access: [],
          active_workspace: null,
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
      });
      vi.spyOn(api, "authenticatedApiRequest").mockImplementation((url: string) => {
        if (url.includes("/api/v1/workspaces")) return Promise.resolve([
            { workspace_id: "ws_1", name: "Workspace 1", division_code: "FINANCE" },
            { workspace_id: "ws_2", name: "Workspace 2", division_code: "PROPERTY" },
          ] as never);
        return Promise.resolve([] as never);
      });

      render(createElement(ContextualWorkspaceModulePage, { workspaceKey: "finance", module: "tasks" }));

      const heading = await screen.findByRole("heading", { name: /Bukan Otoritas Finance/i });
      expect(heading).toBeDefined();
      expect(screen.getByText(/Kembali ke Ruang Kerja Saya/i)).toBeDefined();
    });

    it("renders WorkspaceShell and module content when workspace is verified", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: {
          actor: {
            actor_id: "usr_single_01",
            tenant_id: "tenant_1",
            organization_id: "org_1",
            display_name: "Finance User",
            active: true,
          },
          email: "finance@andara.local",
          workspace_access: [],
          active_workspace: {
            workspace: {
              workspace_id: "ws_single_finance",
              workspace_key: "finance",
              organization_id: "org_1",
              workspace_name: "Finance Holding Workspace",
              workspace_type: "BUSINESS",
              division_code: "FINANCE",
              active: true,
            },
            role_refs: ["WORKSPACE_MEMBER"],
            permission_refs: [],
            scope_refs: [],
            data_scope: "WORKSPACE",
            active: true,
          },
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
      });
      vi.spyOn(api, "authenticatedApiRequest").mockImplementation((url: string) => {
        if (url.includes("/api/v1/workspaces")) {
          return Promise.resolve([
            {
              workspace_id: "ws_single_finance",
              name: "Finance Holding Workspace",
              division_code: "FINANCE",
              workspace_key: "finance",
            },
          ]);
        }
        if (url.includes("/api/v1/dashboard/operational")) {
          return Promise.resolve({
            scope: "DIVISION",
            metrics: { tasks: 0, overdue_tasks: 0 },
            tasks: [],
            approvals: [],
            findings: [],
            reports: [],
          });
        }
        return Promise.resolve([]);
      });

      render(createElement(ContextualWorkspaceModulePage, { workspaceKey: "finance", module: "tasks" }));

      const taskBoardHeading = await screen.findByText(/Task Board/i);
      expect(taskBoardHeading).toBeDefined();
      expect(screen.getAllByText(/Finance Holding Workspace/i).length).toBeGreaterThan(0);
    });
  });
});
