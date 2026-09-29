import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

// Universal navigation and features
import { navigationForSession } from "@/app/navigation";
import { executiveNavigation } from "@/features/executive/navigation";
import { salesNavigation } from "@/features/sales/navigation";
import {
  DocumentsPage,
  ProjectsPage,
  TasksPage,
  ApprovalsPage,
  ReportsPage,
  FindingsPage,
} from "@/features/shared-work";
import { AraPage } from "@/features/ara";

import { ExecutiveSummaryPage } from "@/features/executive";
import { SalesSummaryPage } from "@/features/sales";

// Routes under [workspaceKey]
import WorkspaceKeyRoot from "@/app/workspace/[workspaceKey]/page";
import SummaryRoute from "@/app/workspace/[workspaceKey]/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/performance/page";
import UniversalAraRoute from "@/app/workspace/[workspaceKey]/ara/page";
import UniversalProjectsRoute from "@/app/workspace/[workspaceKey]/projects/page";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/penjualan-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

function createSession(
  workspaceKey: string,
  divisionCode: string,
  workspaceType: "EXECUTIVE" | "BUSINESS" | "IT_OPERATIONS" = "BUSINESS",
  role: "EXECUTIVE" | "WORKSPACE_LEAD" | "WORKSPACE_MEMBER" = workspaceType === "EXECUTIVE" ? "EXECUTIVE" : "WORKSPACE_LEAD",
) {
  const principal: AuthenticatedPrincipalProjection = {
    actor: {
      actor_id: `actor_${divisionCode.toLowerCase() || "exec"}`,
      active: true,
      display_name: `${divisionCode || "Executive"} Lead`,
      organization_id: "org_andara",
      tenant_id: "tenant_andara",
    },
    active_workspace: {
      active: true,
      data_scope: workspaceType === "EXECUTIVE" ? "COMPANY" : "WORKSPACE",
      permission_refs: ["read:*", "write:*"],
      role_refs: [role],
      scope_refs: [`workspace_${workspaceKey}`],
      workspace: {
        active: true,
        division_code: divisionCode || null,
        organization_id: "org_andara",
        workspace_id: `ws_${workspaceKey}`,
        workspace_key: workspaceKey,
        workspace_name: workspaceType === "EXECUTIVE" ? "Pusat Kendali" : `Ruang Kerja ${divisionCode}`,
        workspace_type: workspaceType,
      },
    },
    email: `${(divisionCode || "exec").toLowerCase()}@andara.co.id`,
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };

  return {
    authenticated: true,
    principal,
  };
}

describe("Final Architecture Consistency & Hygiene Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Executive & Sales Navigation Uses Actual Authoritative workspace_key", () => {
    it("Executive actual workspace_key is used in executiveNavigation and navigationForSession", () => {
      const customKey = "holding-corp-2027";
      const sections = executiveNavigation(customKey);
      const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));

      // All links must be anchored to the actual workspace key
      expect(allHrefs).toContain(`/workspace/${customKey}/summary`);
      expect(allHrefs).toContain(`/workspace/${customKey}/brief`);
      expect(allHrefs).toContain(`/workspace/${customKey}/planning`);
      expect(allHrefs).toContain(`/workspace/${customKey}/performance`);
      expect(allHrefs).toContain(`/workspace/${customKey}/divisions`);
      expect(allHrefs).toContain(`/workspace/${customKey}/projects`);
      expect(allHrefs).toContain(`/workspace/${customKey}/ara`);
      allHrefs.forEach((href) => {
        expect(href).toMatch(new RegExp(`^/workspace/${customKey}/`));
        expect(href).not.toContain("/workspace/executive/");
      });

      // navigationForSession resolves the authoritative session
      const execSession = createSession(customKey, "", "EXECUTIVE");
      const sessionSections = navigationForSession(true, customKey, false, execSession);
      const sessionHrefs = sessionSections.flatMap((s) => s.items.map((i) => i.href));
      expect(sessionHrefs).toContain(`/workspace/${customKey}/summary`);
    });

    it("Sales actual workspace_key is used in salesNavigation and navigationForSession", () => {
      const salesKey = "penjualan-cabang-bandung";
      const sections = salesNavigation(salesKey);
      const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));

      expect(allHrefs).toContain(`/workspace/${salesKey}/summary`);
      expect(allHrefs).toContain(`/workspace/${salesKey}/pipeline`);
      expect(allHrefs).toContain(`/workspace/${salesKey}/kpr`);
      expect(allHrefs).toContain(`/workspace/${salesKey}/projects`);
      expect(allHrefs).toContain(`/workspace/${salesKey}/ara`);
      allHrefs.forEach((href) => {
        expect(href).toMatch(new RegExp(`^/workspace/${salesKey}/`));
        expect(href).not.toContain("/workspace/sales/");
      });

      const salesSessionData = createSession(salesKey, "SALES", "BUSINESS");
      const sessionSections = navigationForSession(false, salesKey, false, salesSessionData);
      const sessionHrefs = sessionSections.flatMap((s) => s.items.map((i) => i.href));
      expect(sessionHrefs).toContain(`/workspace/${salesKey}/summary`);
    });
  });

  describe("2. URL Mismatch & Authority Fail-Closed Enforcement", () => {
    it("Executive feature fails closed when requested workspaceKey does not match active workspace", async () => {
      const execSession = createSession("holding-corp", "", "EXECUTIVE");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(execSession);

      render(<ExecutiveSummaryPage workspaceKey="wrong-key" />);

      await waitFor(() => {
        expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
      });
      expect(screen.queryByText("Target & Kinerja Perusahaan")).not.toBeInTheDocument();
    });

    it("Sales feature fails closed when requested workspaceKey does not match active workspace", async () => {
      const salesSessionData = createSession("penjualan-utama", "SALES", "BUSINESS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSessionData);

      render(<SalesSummaryPage workspaceKey="different-sales-key" />);

      await waitFor(() => {
        expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
      });
      expect(screen.queryByText("Sales & Marketing")).not.toBeInTheDocument();
    });

    it("No URL-only authority: string 'executive' in URL fails closed if session is not executive", async () => {
      const salesSessionData = createSession("executive", "SALES", "BUSINESS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSessionData);

      render(<ExecutiveSummaryPage workspaceKey="executive" />);

      await waitFor(() => {
        expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
      });
    });
  });

  describe("3. Collision Routes: /summary & /performance Domain Resolution", () => {
    it("/summary for Executive session resolves to Executive Summary", async () => {
      const execSession = createSession("pusat-kendali", "", "EXECUTIVE");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(execSession);

      render(<SummaryRoute params={{ workspaceKey: "pusat-kendali" }} />);

      await waitFor(() => {
        expect(screen.getByText("Target & Kinerja Perusahaan")).toBeInTheDocument();
      });
      // Does not render Sales Summary page header
      expect(screen.queryByText("Ringkasan target, pipeline, aktivitas, dan hasil penjualan.")).not.toBeInTheDocument();
    });

    it("/summary for Sales session resolves to Sales Summary", async () => {
      const salesSessionData = createSession("penjualan-utama", "SALES", "BUSINESS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSessionData);

      render(<SummaryRoute params={{ workspaceKey: "penjualan-utama" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Sales & Marketing" })).toBeInTheDocument();
      });
      expect(screen.queryByText("Target & Kinerja Perusahaan")).not.toBeInTheDocument();
    });

    it("Property /summary does NOT enter Sales Summary and fails closed", async () => {
      const propertySession = createSession("property-utama", "PROPERTY", "BUSINESS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession);

      render(<SummaryRoute params={{ workspaceKey: "property-utama" }} />);

      await waitFor(() => {
        expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
      });
      expect(screen.queryByText("Ringkasan target, pipeline, aktivitas, dan hasil penjualan.")).not.toBeInTheDocument();
      expect(screen.queryByText("Target & Kinerja Perusahaan")).not.toBeInTheDocument();
    });

    it("/performance for Executive session resolves to Executive Performance", async () => {
      const execSession = createSession("pusat-kendali", "", "EXECUTIVE");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(execSession);

      render(<PerformanceRoute params={{ workspaceKey: "pusat-kendali" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Kinerja" })).toBeInTheDocument();
      });
      expect(screen.getAllByText("STRATEGI & KINERJA").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Target dan kinerja Sales")).not.toBeInTheDocument();
    });

    it("/performance for Sales session resolves to Sales Target & Kinerja", async () => {
      const salesSessionData = createSession("penjualan-utama", "SALES", "BUSINESS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSessionData);

      render(<PerformanceRoute params={{ workspaceKey: "penjualan-utama" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Target & Kinerja" })).toBeInTheDocument();
      });
      expect(screen.getByText("SALES & MARKETING")).toBeInTheDocument();
    });
  });

  describe("4. Root Workspace Route /workspace/[workspaceKey] Normalization", () => {
    it("redirects Executive workspace to summary", async () => {
      const execSession = createSession("pusat-kendali", "", "EXECUTIVE");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(execSession);

      render(<WorkspaceKeyRoot params={{ workspaceKey: "pusat-kendali" }} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/workspace/pusat-kendali/summary");
      });
    });

    it("redirects Sales workspace to summary", async () => {
      const salesSessionData = createSession("penjualan-utama", "SALES", "BUSINESS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSessionData);

      render(<WorkspaceKeyRoot params={{ workspaceKey: "penjualan-utama" }} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/workspace/penjualan-utama/summary");
      });
    });

    it("redirects other workspaces (Property, IT, Finance) to projects", async () => {
      const propertySession = createSession("property-utama", "PROPERTY", "BUSINESS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession);

      render(<WorkspaceKeyRoot params={{ workspaceKey: "property-utama" }} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/workspace/property-utama/projects");
      });
    });
  });

  describe("5. Shared Work & Universal ARA Portability", () => {
    it.each([
      ["Executive", createSession("exec-ws", "", "EXECUTIVE")],
      ["Sales", createSession("sales-ws", "SALES", "BUSINESS")],
      ["Property", createSession("prop-ws", "PROPERTY", "BUSINESS")],
      ["IT", createSession("it-ws", "IT", "IT_OPERATIONS")],
    ] as const)(
      "Universal ARA works across %s workspace context",
      async (_domain, session) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

        render(<UniversalAraRoute params={{ workspaceKey: session.principal.active_workspace!.workspace.workspace_key }} />);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
        });
        expect(screen.getByText("ARA belum terhubung.")).toBeInTheDocument();
      },
    );

    it.each([
      ["Executive", createSession("exec-ws", "", "EXECUTIVE")],
      ["Sales", createSession("sales-ws", "SALES", "BUSINESS")],
      ["Property", createSession("prop-ws", "PROPERTY", "BUSINESS")],
    ] as const)(
      "Universal Shared Work Projects works across %s workspace context",
      async (_domain, session) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
        vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(
          new api.ApiError(404, "Not Found", "corr_shared"),
        );

        render(<UniversalProjectsRoute params={{ workspaceKey: session.principal.active_workspace!.workspace.workspace_key }} />);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: "Proyek" })).toBeInTheDocument();
        });
      },
    );
  });

  describe("6. Single AppShell Landmark Guarantee (No Nested Shell)", () => {
    it.each([
      ["DocumentsPage", DocumentsPage],
      ["ProjectsPage", ProjectsPage],
      ["TasksPage", TasksPage],
      ["ApprovalsPage", ApprovalsPage],
      ["ReportsPage", ReportsPage],
      ["FindingsPage", FindingsPage],
      ["AraPage", AraPage],
    ] as const)(
      "Universal feature %s renders exactly ONE AppShell",
      async (_name, Component) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(
          createSession("penjualan-utama", "SALES"),
        );
        vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(
          new api.ApiError(404, "Not Found", "corr_404"),
        );

        render(<Component workspaceKey="penjualan-utama" />);

        await waitFor(() => {
          expect(screen.getAllByRole("link", { name: "ALOS" })).toHaveLength(1);
        });

        expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
        expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
        expect(screen.getAllByRole("button", { name: "Buka navigasi" })).toHaveLength(1);
        expect(screen.getAllByRole("button", { name: "Pilih workspace" })).toHaveLength(1);
      },
    );
  });

  describe("7. Architecture Hygiene Guard: No Duplicate Trees", () => {
    it("src/app/workspace/sales and src/app/workspace/executive only contain page.tsx redirect (no competing static tree)", () => {
      const salesFiles = readdirSync(resolve("src/app/workspace/sales"));
      expect(salesFiles).toEqual(["page.tsx"]);

      const execFiles = readdirSync(resolve("src/app/workspace/executive"));
      expect(execFiles).toEqual(["page.tsx"]);
    });

    it("src/app/workspace/[workspaceKey] contains canonical feature routes for all domains", () => {
      const base = "src/app/workspace/[workspaceKey]";
      const requiredRoutes = [
        "summary", "performance", "brief", "planning", "initiatives",
        "reviews", "divisions", "pipeline", "leads", "activities",
        "bookings", "kpr", "campaigns", "accounts", "projects",
        "tasks", "approvals", "documents", "reports", "findings", "ara",
      ];
      for (const route of requiredRoutes) {
        expect(existsSync(resolve(`${base}/${route}/page.tsx`))).toBe(true);
      }
    });

    it("src/features/sales does not implement duplicate shared work or ARA", () => {
      const salesDir = resolve("src/features/sales");
      const files = readdirSync(salesDir);
      for (const file of files) {
        expect(file).not.toMatch(/ara/i);
        const content = readFileSync(resolve(salesDir, file), "utf-8");
        expect(content).not.toContain("SalesSharedWorkPage");
        expect(content).not.toContain("@/features/shared-work");
        expect(content).not.toContain("@/features/ara");
      }
    });

    it("src/features/executive does not implement duplicate shared work or ARA", () => {
      const execDir = resolve("src/features/executive");
      const files = readdirSync(execDir);
      expect(files).not.toContain("executive-shared-work.tsx");
      const araWrapper = readFileSync(resolve(execDir, "executive-ara.tsx"), "utf-8");
      // Must only delegate to Universal ARA
      expect(araWrapper).toContain("@/features/ara");
      expect(araWrapper).not.toContain("useState");
    });
  });
});
