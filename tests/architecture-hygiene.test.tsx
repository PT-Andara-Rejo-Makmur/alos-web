import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

// Universal shared work pages
import {
  DocumentsPage,
  ProjectsPage,
  TasksPage,
  ApprovalsPage,
  ReportsPage,
  FindingsPage,
} from "@/features/shared-work";

// Universal ARA
import { AraPage } from "@/features/ara";

// Sales pages
import { SalesSummaryPage, SalesReadinessPage } from "@/features/sales";

// Sales route components
import SummaryRoute from "@/app/workspace/[workspaceKey]/summary/page";
import PipelineRoute from "@/app/workspace/[workspaceKey]/pipeline/page";
import LeadsRoute from "@/app/workspace/[workspaceKey]/leads/page";
import ActivitiesRoute from "@/app/workspace/[workspaceKey]/activities/page";
import BookingsRoute from "@/app/workspace/[workspaceKey]/bookings/page";
import KprRoute from "@/app/workspace/[workspaceKey]/kpr/page";
import CampaignsRoute from "@/app/workspace/[workspaceKey]/campaigns/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/performance/page";

// Universal route components
import UniversalAraRoute from "@/app/workspace/[workspaceKey]/ara/page";
import UniversalProjectsRoute from "@/app/workspace/[workspaceKey]/projects/page";
import UniversalTasksRoute from "@/app/workspace/[workspaceKey]/tasks/page";
import UniversalApprovalsRoute from "@/app/workspace/[workspaceKey]/approvals/page";
import UniversalDocumentsRoute from "@/app/workspace/[workspaceKey]/documents/page";
import UniversalReportsRoute from "@/app/workspace/[workspaceKey]/reports/page";
import UniversalFindingsRoute from "@/app/workspace/[workspaceKey]/findings/page";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/penjualan-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
}));

function createSession(
  workspaceKey: string,
  divisionCode: string,
  role: "WORKSPACE_LEAD" | "WORKSPACE_MEMBER" = "WORKSPACE_LEAD",
) {
  const principal: AuthenticatedPrincipalProjection = {
    actor: {
      actor_id: `actor_${divisionCode.toLowerCase()}`,
      active: true,
      display_name: `${divisionCode} Lead`,
      organization_id: "org_andara",
      tenant_id: "tenant_andara",
    },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: ["read:*", "write:*"],
      role_refs: [role],
      scope_refs: [`workspace_${divisionCode.toLowerCase()}`],
      workspace: {
        active: true,
        division_code: divisionCode,
        organization_id: "org_andara",
        workspace_id: `ws_${divisionCode.toLowerCase()}`,
        workspace_key: workspaceKey,
        workspace_name: `Ruang Kerja ${divisionCode}`,
        workspace_type: "BUSINESS",
      },
    },
    email: `${divisionCode.toLowerCase()}@andara.co.id`,
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };

  return {
    authenticated: true,
    principal,
  };
}

describe("Architecture Hygiene Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Pattern Isolation: src/features Structure", () => {
    it("src/features/sales must NOT export or contain SalesSharedWorkPage or shared-work wrappers", () => {
      const salesIndexPath = resolve("src/features/sales/index.ts");
      const salesIndexContent = readFileSync(salesIndexPath, "utf-8");
      expect(salesIndexContent).not.toContain("SalesSharedWorkPage");

      const salesPagesPath = resolve("src/features/sales/sales-pages.tsx");
      const salesPagesContent = readFileSync(salesPagesPath, "utf-8");
      expect(salesPagesContent).not.toContain("SalesSharedWorkPage");
      expect(salesPagesContent).not.toContain("@/features/shared-work");
    });

    it("src/features/sales must NOT contain any ARA implementation or duplicate ARA files", () => {
      const salesDir = resolve("src/features/sales");
      const files = readdirSync(salesDir);
      for (const file of files) {
        expect(file).not.toMatch(/ara/i);
        const content = readFileSync(resolve(salesDir, file), "utf-8");
        expect(content).not.toContain("@/features/ara");
      }
    });

    it("src/features/ara is the single source of truth for Universal ARA", () => {
      const araDir = resolve("src/features/ara");
      expect(existsSync(araDir)).toBe(true);

      const araFiles = readdirSync(araDir);
      expect(araFiles).toContain("ara-page.tsx");
      expect(araFiles).toContain("ara-readiness.tsx");
      expect(araFiles).toContain("ara-model.ts");
      expect(araFiles).toContain("index.ts");
    });

    it("src/features/executive/executive-ara.tsx delegates directly to Universal ARA without duplicate UI implementation", () => {
      const execAraPath = resolve("src/features/executive/executive-ara.tsx");
      expect(existsSync(execAraPath)).toBe(true);
      const content = readFileSync(execAraPath, "utf-8");
      expect(content).toContain("@/features/ara");
      expect(content).not.toContain("useState");
      expect(content).not.toContain("executive.module.css");
    });

    it("src/features/shared-work contains all canonical shared work sub-features", () => {
      const sharedWorkDir = resolve("src/features/shared-work");
      expect(existsSync(sharedWorkDir)).toBe(true);

      const subdirs = readdirSync(sharedWorkDir);
      expect(subdirs).toContain("documents");
      expect(subdirs).toContain("projects");
      expect(subdirs).toContain("tasks");
      expect(subdirs).toContain("approvals");
      expect(subdirs).toContain("reports");
      expect(subdirs).toContain("findings");
    });
  });

  describe("2. Routing Tree Hygiene: src/app/workspace", () => {
    it("no static Sales route tree competing with [workspaceKey]", () => {
      const staticSalesSubdirs = [
        "pipeline", "leads", "activities", "bookings", "mortgages", "kpr",
        "campaigns", "performance", "projects", "tasks", "approvals",
        "documents", "reports", "findings", "ara",
      ];
      for (const sub of staticSalesSubdirs) {
        expect(existsSync(resolve(`src/app/workspace/sales/${sub}`))).toBe(false);
      }
    });

    it("no /mortgages routes or directories exist anywhere (canonical is /kpr)", () => {
      expect(existsSync(resolve("src/app/workspace/mortgages"))).toBe(false);
      expect(existsSync(resolve("src/app/workspace/[workspaceKey]/mortgages"))).toBe(false);
      expect(existsSync(resolve("src/app/workspace/sales/mortgages"))).toBe(false);
    });

    it("src/app/workspace/[workspaceKey] houses all canonical feature routes", () => {
      const base = "src/app/workspace/[workspaceKey]";
      const requiredRoutes = [
        "summary", "pipeline", "leads", "activities", "bookings", "kpr",
        "campaigns", "performance", "projects", "tasks", "approvals",
        "documents", "reports", "findings", "ara",
      ];
      for (const route of requiredRoutes) {
        expect(existsSync(resolve(`${base}/${route}/page.tsx`))).toBe(true);
      }
    });
  });

  describe("3. Route Authority Enforcement: Sales vs Universal routes", () => {
    it.each([
      ["summary", SummaryRoute],
      ["pipeline", PipelineRoute],
      ["leads", LeadsRoute],
      ["activities", ActivitiesRoute],
      ["bookings", BookingsRoute],
      ["kpr", KprRoute],
      ["campaigns", CampaignsRoute],
      ["performance", PerformanceRoute],
    ] as const)(
      "Sales-specific route /%s FAILS CLOSED (no access) when accessed by non-Sales session",
      async (_path, RouteComponent) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(
          createSession("property-ws", "PROPERTY"),
        );

        render(<RouteComponent params={{ workspaceKey: "property-ws" }} />);

        await waitFor(() => {
          expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
        });
        expect(screen.getByText("Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.")).toBeInTheDocument();
      },
    );

    it.each([
      ["summary", SummaryRoute],
      ["pipeline", PipelineRoute],
      ["leads", LeadsRoute],
      ["activities", ActivitiesRoute],
      ["bookings", BookingsRoute],
      ["kpr", KprRoute],
      ["campaigns", CampaignsRoute],
      ["performance", PerformanceRoute],
    ] as const)(
      "Sales-specific route /%s FAILS CLOSED when workspaceKey does not match active sales key",
      async (_path, RouteComponent) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(
          createSession("penjualan-utama", "SALES"),
        );

        render(<RouteComponent params={{ workspaceKey: "another-sales-key" }} />);

        await waitFor(() => {
          expect(screen.getByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
        });
      },
    );

    it.each([
      ["ara", UniversalAraRoute, "Tanya ARA"],
      ["projects", UniversalProjectsRoute, "Proyek"],
      ["tasks", UniversalTasksRoute, "Tugas"],
      ["approvals", UniversalApprovalsRoute, "Persetujuan"],
      ["documents", UniversalDocumentsRoute, "Dokumen"],
      ["reports", UniversalReportsRoute, "Laporan"],
      ["findings", UniversalFindingsRoute, "Temuan"],
    ] as const)(
      "Universal route /%s succeeds for non-Sales workspace without Sales restriction",
      async (_path, RouteComponent, headingName) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(
          createSession("property-ws", "PROPERTY"),
        );
        vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(
          new api.ApiError(404, "Not Found", "corr_property"),
        );

        render(<RouteComponent params={{ workspaceKey: "property-ws" }} />);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: headingName })).toBeInTheDocument();
        });
        expect(screen.queryByText("Anda tidak memiliki akses ke halaman ini.")).not.toBeInTheDocument();
      },
    );
  });

  describe("4. Nested AppShell Regression Guard", () => {
    it.each([
      ["DocumentsPage", DocumentsPage],
      ["ProjectsPage", ProjectsPage],
      ["TasksPage", TasksPage],
      ["ApprovalsPage", ApprovalsPage],
      ["ReportsPage", ReportsPage],
      ["FindingsPage", FindingsPage],
      ["AraPage", AraPage],
    ] as const)(
      "Universal feature %s renders exactly ONE AppShell (single landmark structure)",
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

    it("SalesSummaryPage renders exactly ONE AppShell", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(
        createSession("penjualan-utama", "SALES"),
      );

      render(<SalesSummaryPage workspaceKey="penjualan-utama" />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Sales & Marketing" })).toBeInTheDocument();
      });

      expect(screen.getAllByRole("link", { name: "ALOS" })).toHaveLength(1);
      expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
      expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Buka navigasi" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Pilih workspace" })).toHaveLength(1);
    });

    it("SalesReadinessPage renders exactly ONE AppShell", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(
        createSession("penjualan-utama", "SALES"),
      );

      render(
        <SalesReadinessPage
          workspaceKey="penjualan-utama"
          title="Pipeline Penjualan"
          description="Pantau prospek"
          detail="Belum terhubung."
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Pipeline Penjualan" })).toBeInTheDocument();
      });

      expect(screen.getAllByRole("link", { name: "ALOS" })).toHaveLength(1);
      expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
      expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Buka navigasi" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Pilih workspace" })).toHaveLength(1);
    });
  });
});
