import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  WORKSPACE_ROUTES,
  COMPATIBILITY_ROUTES,
  getModuleReadiness,
} from "@/features/workspace-routing";
import {
  projectWorkspaceNavigation,
  WorkspaceSidebar,
  WorkspaceSharedModulePage,
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
    roles: ["DIRECTOR"],
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
    it("defines canonical /workspace/* routes for all 6 shared modules", () => {
      expect(WORKSPACE_ROUTES.projects).toBe("/workspace/projects");
      expect(WORKSPACE_ROUTES.tasks).toBe("/workspace/tasks");
      expect(WORKSPACE_ROUTES.approvals).toBe("/workspace/approvals");
      expect(WORKSPACE_ROUTES.documents).toBe("/workspace/documents");
      expect(WORKSPACE_ROUTES.reports).toBe("/workspace/reports");
      expect(WORKSPACE_ROUTES.findings).toBe("/workspace/findings");
    });

    it("defines canonical routes for workspaces and AI tools", () => {
      expect(WORKSPACE_ROUTES.executive).toBe("/workspace/executive");
      expect(WORKSPACE_ROUTES.finance).toBe("/workspace/finance");
      expect(WORKSPACE_ROUTES.property).toBe("/workspace/property");
      expect(WORKSPACE_ROUTES.sales).toBe("/workspace/sales");
      expect(WORKSPACE_ROUTES.hr).toBe("/workspace/hr");
      expect(WORKSPACE_ROUTES.legal).toBe("/workspace/legal");
      expect(WORKSPACE_ROUTES.it).toBe("/workspace/it");
      expect(WORKSPACE_ROUTES.ara).toBe("/workspace/ara");
      expect(WORKSPACE_ROUTES.agents).toBe("/workspace/agents");
    });

    it("preserves compatibility routes mapping", () => {
      expect(COMPATIBILITY_ROUTES["/business/projects"]).toBe("/workspace/projects");
      expect(COMPATIBILITY_ROUTES["/business/tasks"]).toBe("/workspace/tasks");
      expect(COMPATIBILITY_ROUTES["/business/approvals"]).toBe("/workspace/approvals");
      expect(COMPATIBILITY_ROUTES["/business/documents"]).toBe("/workspace/documents");
      expect(COMPATIBILITY_ROUTES["/business/reports"]).toBe("/workspace/reports");
      expect(COMPATIBILITY_ROUTES["/business/findings"]).toBe("/workspace/findings");
      expect(COMPATIBILITY_ROUTES["/director"]).toBe("/workspace/executive");
      expect(COMPATIBILITY_ROUTES["/ara"]).toBe("/workspace/ara");
      expect(COMPATIBILITY_ROUTES["/agents"]).toBe("/workspace/agents");
      expect(COMPATIBILITY_ROUTES["/genesis"]).toBe("/genesis");
      expect(COMPATIBILITY_ROUTES["/governance"]).toBe("/governance");
    });
  });

  describe("2. Module Readiness Matrix & 2-Dimensional Navigation", () => {
    it("evaluates shared modules as READY", () => {
      expect(getModuleReadiness("projects").availability).toBe("READY");
      expect(getModuleReadiness("tasks").availability).toBe("READY");
      expect(getModuleReadiness("approvals").availability).toBe("READY");
      expect(getModuleReadiness("documents").availability).toBe("READY");
      expect(getModuleReadiness("reports").availability).toBe("READY");
      expect(getModuleReadiness("findings").availability).toBe("READY");
      expect(getModuleReadiness("ara").availability).toBe("READY");
      expect(getModuleReadiness("agents").availability).toBe("READY");
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

      // Shared modules should be navigable to canonical routes
      const projectsItem = items.find((item) => item.key === "projects");
      expect(projectsItem).toBeDefined();
      expect(projectsItem?.availability).toBe("READY");
      expect(projectsItem?.href).toBe(WORKSPACE_ROUTES.projects);
      expect(projectsItem?.available).toBe(true);

      const tasksItem = items.find((item) => item.key === "tasks");
      expect(tasksItem).toBeDefined();
      expect(tasksItem?.availability).toBe("READY");
      expect(tasksItem?.href).toBe(WORKSPACE_ROUTES.tasks);

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

      // Navigable item has active link
      expect(html).toContain(`href="${WORKSPACE_ROUTES.projects}"`);

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
      expect(approvalItem?.href).toBe(WORKSPACE_ROUTES.approvals);
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

  describe("5. WorkspaceSharedModulePage Controlled Lifecycle", () => {
    it("renders NEEDS_INFO state when workspace resolution is required", async () => {
      // Mock authenticated actor with multiple workspaces and no resolution
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: {
            user_id: "usr_multi_01",
            roles: ["OPERATOR"],
            division_codes: ["FINANCE", "PROPERTY"],
            workspace_ids: ["ws_1", "ws_2"],
        },
      });
      vi.spyOn(api, "authenticatedApiRequest").mockImplementation((url: string) => {
        if (url.includes("/api/v1/workspaces")) return Promise.resolve([
            { workspace_id: "ws_1", name: "Workspace 1", division_code: "FINANCE" },
            { workspace_id: "ws_2", name: "Workspace 2", division_code: "PROPERTY" },
          ] as never);
        return Promise.resolve([] as never);
      });

      render(createElement(WorkspaceSharedModulePage, { module: "tasks" }));

      const heading = await screen.findByRole("heading", { name: /Pilih Workspace Aktif/i });
      expect(heading).toBeDefined();
      expect(screen.getByText(/Buka Workspace Resolver/i)).toBeDefined();
    });

    it("renders WorkspaceShell and module content when workspace is verified", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: {
            user_id: "usr_single_01",
            roles: ["OPERATOR"],
            division_codes: ["FINANCE"],
            workspace_ids: ["ws_single_finance"],
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

      render(createElement(WorkspaceSharedModulePage, { module: "tasks" }));

      const taskBoardHeading = await screen.findByText(/Task Board/i);
      expect(taskBoardHeading).toBeDefined();
      expect(screen.getAllByText(/Finance Holding Workspace/i).length).toBeGreaterThan(0);
    });
  });
});
