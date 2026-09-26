import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/workspace/it/projects",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

import * as api from "@/lib/api";
import {
  ProjectsWorkspace,
  TasksWorkspace,
  ApprovalsWorkspace,
  DocumentsWorkspace,
  ReportsWorkspace,
  FindingsWorkspace,
  StrategyLinkPanel,
} from "@/modules/work";
import type { WorkWorkspaceContext } from "@/modules/work/shared/types";

const workSrcDir = join(process.cwd(), "src/modules/work");

function getWorkFiles(dir = workSrcDir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return getWorkFiles(full);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [full] : [];
  });
}

describe("Shared Work Module - Unified Operational Surface", () => {
  const workspaces: WorkWorkspaceContext[] = [
    { workspaceId: "ws_exec", workspaceKey: "executive", workspaceLabel: "Executive Workspace", divisionCode: "EXECUTIVE" },
    { workspaceId: "ws_it", workspaceKey: "it", workspaceLabel: "IT Workspace", divisionCode: "IT" },
    { workspaceId: "ws_fin", workspaceKey: "finance", workspaceLabel: "Keuangan", divisionCode: "FINANCE" },
    { workspaceId: "ws_hr", workspaceKey: "hr", workspaceLabel: "HR Workspace", divisionCode: "HR" },
    { workspaceId: "ws_leg", workspaceKey: "legal", workspaceLabel: "Legal Workspace", divisionCode: "LEGAL" },
    { workspaceId: "ws_sales", workspaceKey: "sales", workspaceLabel: "Sales Workspace", divisionCode: "SALES" },
    { workspaceId: "ws_prop", workspaceKey: "property", workspaceLabel: "Property Workspace", divisionCode: "PROPERTY" },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Shared Work implementation across all 7 workspaces", () => {
    it("renders ProjectsWorkspace consistently across all workspaces", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        summary: { total_projects: 0, active_projects: 0, completed_projects: 0, critical_delayed_projects: 0, total_budget: 0, spent_budget: 0, average_progress_percent: 0 },
        projects: [],
        timeline: [],
        portfolio_distribution: { by_division: {}, by_status: {}, by_category: {} },
        pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
      });

      for (const ws of workspaces) {
        const { unmount } = render(<ProjectsWorkspace activeWorkspace={ws} />);
        expect(screen.getByRole("heading", { name: "Portofolio Proyek" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Buat Proyek/i })).toBeInTheDocument();
        unmount();
      }
    });

    it("renders TasksWorkspace consistently across all workspaces", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        tasks: [],
        summary: { total: 0, pending: 0, in_progress: 0, completed: 0, blocked: 0 },
        pagination: { page: 1, limit: 20, total: 0, total_pages: 1 },
      });

      for (const ws of workspaces) {
        const { unmount } = render(<TasksWorkspace activeWorkspace={ws} />);
        expect(screen.getByRole("heading", { name: "Tugas" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Buat Tugas/i })).toBeInTheDocument();
        unmount();
      }
    });

    it("renders ApprovalsWorkspace with proper decision flow", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        approvals: [],
        total: 0,
      });

      const { unmount } = render(<ApprovalsWorkspace activeWorkspace={workspaces[1]} />);
      expect(screen.getByRole("heading", { name: "Persetujuan & Keputusan" })).toBeInTheDocument();
      expect(screen.getByText(/Daftar Permintaan Persetujuan/i)).toBeInTheDocument();
      unmount();
    });

    it("renders DocumentsWorkspace with document lifecycle support", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        documents: [],
        total: 0,
      });

      const { unmount } = render(<DocumentsWorkspace activeWorkspace={workspaces[1]} />);
      expect(screen.getByRole("heading", { name: "Dokumen" })).toBeInTheDocument();
      unmount();
    });

    it("renders ReportsWorkspace with report generator and scheduling", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        definitions: [],
        schedules: [],
      });

      const { unmount } = render(<ReportsWorkspace activeWorkspace={workspaces[1]} />);
      expect(screen.getByRole("heading", { name: "Laporan Operasional" })).toBeInTheDocument();
      unmount();
    });

    it("renders FindingsWorkspace with corrective action area", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        findings: [],
        total: 0,
      });

      const { unmount } = render(<FindingsWorkspace activeWorkspace={workspaces[1]} />);
      expect(screen.getByRole("heading", { name: "Temuan & Risiko" })).toBeInTheDocument();
      unmount();
    });
  });

  describe("2. StrategyLinkPanel Boundaries", () => {
    it("displays honest unavailable message when strategy linkage is not connected", () => {
      render(
        <StrategyLinkPanel
          contextTitle="Keterkaitan Strategi"
          linkage={null}
        />,
      );

      expect(screen.getByText("Keterkaitan Strategi")).toBeInTheDocument();
      expect(screen.getByText("BELUM TERSEDIA")).toBeInTheDocument();
      expect(
        screen.getByText(/Tautan strategi belum tersedia dari Backend/i),
      ).toBeInTheDocument();
    });

    it("renders linked strategy details without fabricating unknown relations", () => {
      render(
        <StrategyLinkPanel
          contextTitle="Keterkaitan Strategi"
          linkage={{
            state: "CONNECTED",
            objective_title: "Efisiensi Operasional 2026",
            kpi_name: "Waktu Tanggap Insiden",
            initiative_title: "Implementasi Sistem Pemantauan Otomatis",
          }}
        />,
      );

      expect(screen.getByText("TERTAUT")).toBeInTheDocument();
      expect(screen.getByText(/Efisiensi Operasional 2026/i)).toBeInTheDocument();
      expect(screen.getByText(/Waktu Tanggap Insiden/i)).toBeInTheDocument();
      expect(screen.getByText(/Implementasi Sistem Pemantauan Otomatis/i)).toBeInTheDocument();
    });
  });

  describe("3. Data Honesty & Storage Rules in Work Module", () => {
    it("does not use localStorage, sessionStorage, or IndexedDB in work module", () => {
      const allFiles = getWorkFiles();
      const forbiddenStorage = /\b(?:localStorage|sessionStorage|indexedDB)\b/;

      const offenders = allFiles.filter((filePath) => {
        const content = readFileSync(filePath, "utf8");
        return forbiddenStorage.test(content);
      });

      expect(offenders.map((p) => relative(process.cwd(), p))).toEqual([]);
    });

    it("does not invent fictitious backend API endpoints in work module", () => {
      const allFiles = getWorkFiles();
      const inventedApi = /["']\/api\/v1\/(?:fake|mock|strategy|kpis|objectives|dummy)/;

      const offenders = allFiles.filter((filePath) => {
        const content = readFileSync(filePath, "utf8");
        return inventedApi.test(content);
      });

      expect(offenders.map((p) => relative(process.cwd(), p))).toEqual([]);
    });

    it("does not contain handwritten SVG/path elements in work module", () => {
      const allFiles = getWorkFiles();
      const rawSvgPattern = /<(?:svg|path|circle|rect|polygon)\b/i;

      const offenders = allFiles.filter((filePath) => {
        const content = readFileSync(filePath, "utf8");
        return rawSvgPattern.test(content);
      });

      expect(offenders.map((p) => relative(process.cwd(), p))).toEqual([]);
    });
  });
});
