import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import { getModuleReadiness } from "@/features/workspace-routing";
import ItModuleRoute from "@/app/workspace/it/[module]/page";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

const mockNotFound = vi.fn();
const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/it",
  redirect: (url: string) => mockRedirect(url),
  notFound: () => mockNotFound(),
}));

describe("IT Menu Completeness and IA Verification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const identity = {
    workspaceId: "ws_it_01",
    workspaceKey: "it",
    workspaceLabel: "IT Workspace",
    divisionCode: "IT",
    roleLabel: "Administrator IT",
  };

  const actor = {
    user_id: "usr_it_admin",
    organization_id: "org_01",
    tenant_id: "tenant_01",
    roles: ["IT_ADMIN"],
    division_codes: ["IT"],
    workspace_ids: ["ws_it_01"],
    issued_at: "",
    expires_at: "",
  };

  it("verifies all 8 groups and all 29 items in canonical IT navigation", () => {
    const items = projectWorkspaceNavigation(identity, actor);

    const expectedGroups = [
      "UTAMA",
      "IDENTITY_ACCESS",
      "ALOS_PLATFORM",
      "ENGINEERING",
      "OPERATIONS",
      "GENESIS",
      "GOVERNANCE",
      "WORK",
      "AI",
    ];

    const actualGroups = Array.from(new Set(items.map((i) => i.group)));
    for (const group of expectedGroups) {
      expect(actualGroups).toContain(group);
    }

    const expectedItems: Array<{ key: string; label: string; href: string; group: string }> = [
      // UTAMA
      { key: "overview", label: "Overview", href: "/workspace/it", group: "UTAMA" },

      // IDENTITY & ACCESS
      { key: "users", label: "Kelola Akun", href: "/workspace/it/users", group: "IDENTITY_ACCESS" },
      { key: "register-user", label: "Register Akun", href: "/workspace/it/users/register", group: "IDENTITY_ACCESS" },
      { key: "workspace-access", label: "Workspace Access", href: "/workspace/it/users/access", group: "IDENTITY_ACCESS" },
      { key: "access-review", label: "Access Review", href: "/workspace/it/users/access-review", group: "IDENTITY_ACCESS" },

      // ALOS PLATFORM
      { key: "systems", label: "Systems", href: "/workspace/it/systems", group: "ALOS_PLATFORM" },
      { key: "integrations", label: "Integrations", href: "/workspace/it/integrations", group: "ALOS_PLATFORM" },
      { key: "database", label: "Database", href: "/workspace/it/database", group: "ALOS_PLATFORM" },
      { key: "environments", label: "Environments", href: "/workspace/it/environments", group: "ALOS_PLATFORM" },

      // ENGINEERING
      { key: "repositories", label: "Repositories", href: "/workspace/it/repositories", group: "ENGINEERING" },
      { key: "cicd", label: "CI/CD", href: "/workspace/it/cicd", group: "ENGINEERING" },
      { key: "releases", label: "Releases", href: "/workspace/it/releases", group: "ENGINEERING" },
      { key: "tech-debt", label: "Technical Debt", href: "/workspace/it/tech-debt", group: "ENGINEERING" },

      // OPERATIONS
      { key: "monitoring", label: "Monitoring", href: "/workspace/it/monitoring", group: "OPERATIONS" },
      { key: "incidents", label: "Incidents", href: "/workspace/it/incidents", group: "OPERATIONS" },
      { key: "security", label: "Security", href: "/workspace/it/security", group: "OPERATIONS" },
      { key: "backup", label: "Backup & DR", href: "/workspace/it/backup", group: "OPERATIONS" },

      // GENESIS
      { key: "control-plane", label: "Control Plane", href: "/workspace/it/genesis", group: "GENESIS" },
      { key: "agents", label: "Agents", href: "/workspace/it/genesis/agents", group: "GENESIS" },
      { key: "skills", label: "Skills", href: "/workspace/it/genesis/skills", group: "GENESIS" },
      { key: "research", label: "Research", href: "/workspace/it/genesis/research", group: "GENESIS" },
      { key: "models", label: "Models & Tools", href: "/workspace/it/genesis/models-tools", group: "GENESIS" },

      // GOVERNANCE
      { key: "evidence", label: "Evidence", href: "/workspace/it/governance/evidence", group: "GOVERNANCE" },
      { key: "uat", label: "UAT & Gates", href: "/workspace/it/governance/uat", group: "GOVERNANCE" },
      { key: "decisions", label: "Decisions", href: "/workspace/it/governance/decisions", group: "GOVERNANCE" },

      // WORK
      { key: "projects", label: "Projects", href: "/workspace/it/projects", group: "WORK" },
      { key: "tasks", label: "Tasks", href: "/workspace/it/tasks", group: "WORK" },
      { key: "approvals", label: "Approvals", href: "/workspace/it/approvals", group: "WORK" },
      { key: "documents", label: "Documents", href: "/workspace/it/documents", group: "WORK" },
      { key: "reports", label: "Reports", href: "/workspace/it/reports", group: "WORK" },
      { key: "findings", label: "Findings", href: "/workspace/it/findings", group: "WORK" },

      // AI
      { key: "ara", label: "ARA", href: "/workspace/it/ara", group: "AI" },
    ];

    for (const expected of expectedItems) {
      const actual = items.find((i) => i.key === expected.key);
      expect(actual, `Missing menu item: ${expected.key}`).toBeDefined();
      expect(actual?.label).toBe(expected.label);
      expect(actual?.href).toBe(expected.href);
      expect(actual?.group).toBe(expected.group);
      expect(actual?.navigable).toBe(true);

      // Verify availability is not inflated (must match getModuleReadiness)
      const readiness = getModuleReadiness(expected.key);
      if (expected.key === "overview" || expected.key === "control-plane") {
        // Special root entry keys
        expect(actual?.navigable).toBe(true);
      } else {
        expect(actual?.availability).toBe(readiness.availability);
      }
    }
  });

  it("verifies no business Agent Workforce in IT menu", () => {
    const items = projectWorkspaceNavigation(identity, actor);
    // Technical agents is under GENESIS group with href /workspace/it/genesis/agents
    const agentsItem = items.find((i) => i.key === "agents");
    expect(agentsItem).toBeDefined();
    expect(agentsItem?.group).toBe("GENESIS");
    expect(agentsItem?.href).toBe("/workspace/it/genesis/agents");

    // There should be no agents under WORK or PEKERJAAN
    const workAgents = items.find((i) => i.key === "agents" && (i.group === "WORK" || i.group === "PEKERJAAN"));
    expect(workAgents).toBeUndefined();
  });

  describe("Contextual Work Modules routing and fail-closed security", () => {
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

      vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
        if (path.includes("/api/v1/dashboard/operational")) {
          return {
            scope: "WORKSPACE",
            tasks: [],
            approvals: [],
            reports: [],
            findings: [],
          } as never;
        }
        if (path.includes("/api/v1/projects")) {
          return {
            generated_at: new Date().toISOString(),
            metrics: { total: 0, on_track: 0, at_risk: 0, critical: 0, completed: 0 },
            progress: [],
            distribution: [],
            projects: [],
            milestones: [],
            risk_summary: [],
            filter_options: { divisions: [], statuses: [], categories: [] },
            pagination: { page: 1, page_size: 20, total_items: 0, total_pages: 1 },
          } as never;
        }
        if (path.includes("/api/v1/workspaces")) {
          return [
            { workspace_id: "ws_it_01", name: "IT Workspace", slug: "it" },
          ] as never;
        }
        if (path.includes("/api/v1/documents")) {
          return [] as never;
        }
        return [] as never;
      });
    });

    it("renders contextual work projects module under IT workspace", async () => {
      const page = await ItModuleRoute({ params: Promise.resolve({ module: "projects" }) });
      render(page);

      // Projects renders ProjectPortfolioDashboard
      expect(await screen.findByText(/kelola proyek dalam scope anda/i)).toBeInTheDocument();
    });

    it("renders contextual work documents module under IT workspace", async () => {
      const page = await ItModuleRoute({ params: Promise.resolve({ module: "documents" }) });
      render(page);

      // Documents renders DocumentCenter
      expect(await screen.findByRole("heading", { name: "Documents", level: 2 })).toBeInTheDocument();
    });

    it("renders contextual work tasks module under IT workspace", async () => {
      const page = await ItModuleRoute({ params: Promise.resolve({ module: "tasks" }) });
      render(page);

      // Tasks renders OperationalModuleDashboard
      expect(await screen.findByRole("heading", { name: "Tasks", level: 2 })).toBeInTheDocument();
    });

    it("fails closed when user session is for a different workspace", async () => {
      // User is authenticated as FINANCE, but accesses IT route
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: canonicalPrincipal({
          actorId: "usr_fin_user",
          divisionCode: "FINANCE",
          workspaceId: "ws_fin_01",
          workspaceKey: "finance",
          workspaceName: "Finance Workspace",
          roles: ["WORKSPACE_MEMBER"],
        }),
      });

      const page = await ItModuleRoute({ params: Promise.resolve({ module: "tasks" }) });
      render(page);

      // ProtectedDomainWorkspace fails closed
      expect(await screen.findByText("Bukan Otoritas IT")).toBeInTheDocument();
    });

    it("fails closed calling notFound for non-existent module", async () => {
      mockNotFound.mockClear();
      await ItModuleRoute({ params: Promise.resolve({ module: "invalid-module-xyz" }) });
      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe("Architecture Hygiene Guards", () => {
    const srcDir = path.resolve(__dirname, "../src");

    it("guards against any src/workspaces folder revival", () => {
      const workspacesPath = path.join(srcDir, "workspaces");
      expect(fs.existsSync(workspacesPath)).toBe(false);
    });

    it("guards against raw handwritten svg or path in canonical IT modules", () => {
      const itModulesDir = path.join(srcDir, "modules", "it");

      function checkDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            checkDir(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
            const content = fs.readFileSync(fullPath, "utf-8");
            expect(content).not.toMatch(/<svg[^>]*>/i);
            expect(content).not.toMatch(/<path[^>]*>/i);
          }
        }
      }

      checkDir(itModulesDir);
    });
  });
});
