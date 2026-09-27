import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  usePathname: () => "/workspace/executive/strategy",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import {
  StrategyOverviewWorkspace,
  ObjectivesWorkspace,
  KpisWorkspace,
  InitiativesWorkspace,
  PerformanceReviewsWorkspace,
  TargetRevisionsWorkspace,
  StrategicSourcesWorkspace,
  StrategyPerformanceSummary,
  StrategySubmoduleRunner,
} from "@/modules/strategy";

const strategySrcDir = join(process.cwd(), "src/modules/strategy");

function getStrategyFiles(dir = strategySrcDir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return getStrategyFiles(full);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [full] : [];
  });
}

function mockSession(key: string, code: string, label: string) {
  vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
    authenticated: true,
    principal: canonicalPrincipal({
      actorId: `usr_${key}_01`,
      divisionCode: code,
      workspaceId: `ws_${key}_01`,
      workspaceKey: key,
      workspaceName: label,
      roles: ["WORKSPACE_MEMBER"],
    }),
  });
}

describe("Strategy & Performance Module Surfaces", () => {
  const execContext = {
    workspaceKey: "executive",
    workspaceLabel: "Executive Workspace",
    divisionCode: "EXECUTIVE",
    isCompanyWide: true,
  };

  const financeContext = {
    workspaceKey: "finance",
    workspaceLabel: "Keuangan",
    divisionCode: "FINANCE",
    isCompanyWide: false,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Executive Strategy Surfaces", () => {
    it("renders Executive Strategy Overview with 8 sections, horizons, and honest unavailable state", () => {
      render(<StrategyOverviewWorkspace context={execContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Strategi & Kinerja Perusahaan" })).toBeInTheDocument();
      expect(screen.getByText(/Sumber strategi dan KPI resmi dari Backend belum tersedia/i)).toBeInTheDocument();
      expect(screen.getByText("Jangka Pendek")).toBeInTheDocument();
      expect(screen.getByText("Jangka Menengah")).toBeInTheDocument();
      expect(screen.getByText("Jangka Panjang")).toBeInTheDocument();

      // Check all 8 sections
      expect(screen.getByText("Sumber Strategi & KPI")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Horizon Strategis" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Sasaran Perusahaan" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "KPI Perusahaan" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Inisiatif Strategis" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Status Kinerja" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Review yang Membutuhkan Perhatian" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Revisi Target yang Menunggu Keputusan" })).toBeInTheDocument();

      // ARA assistant area
      expect(screen.getByText(/Bantuan ARA untuk Analisis Kinerja/i)).toBeInTheDocument();
    });

    it("renders Objectives surface with honest empty state and disabled addition", () => {
      render(<ObjectivesWorkspace context={execContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Sasaran Strategis" })).toBeInTheDocument();
      expect(screen.getByText("Sumber sasaran strategis belum terhubung.")).toBeInTheDocument();
      expect(screen.getByText(/Sumber sasaran strategis belum terhubung dari Backend/i)).toBeInTheDocument();

      const addBtn = screen.getByRole("button", { name: /Tambah Sasaran/i });
      expect(addBtn).toBeInTheDocument();
    });

    it("renders KPIs surface with measurement concepts and honest achievement placeholder", () => {
      render(<KpisWorkspace context={execContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Indikator Kinerja Utama (KPI)" })).toBeInTheDocument();
      expect(screen.getAllByText(/Sumber indikator kinerja utama.*belum terhubung/i).length).toBeGreaterThan(0);

      // Open drawer to inspect supported measurement concepts
      const addBtn = screen.getByRole("button", { name: /Tambah KPI/i });
      fireEvent.click(addBtn);

      expect(screen.getByText(/Semakin tinggi semakin baik/i)).toBeInTheDocument();
      expect(screen.getByText(/Semakin rendah semakin baik/i)).toBeInTheDocument();
    });

    it("renders Initiatives surface with honest project link unavailable message", () => {
      render(<InitiativesWorkspace context={execContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Inisiatif Strategis" })).toBeInTheDocument();
      expect(screen.getByText(/Tautan inisiatif ke proyek belum tersedia dari Backend/i)).toBeInTheDocument();
    });

    it("renders Performance Reviews surface with root cause and corrective action boundaries", () => {
      render(<PerformanceReviewsWorkspace context={execContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Review Kinerja" })).toBeInTheDocument();
      expect(screen.getByText("Sumber review kinerja belum terhubung.")).toBeInTheDocument();
    });

    it("renders Target Revisions surface with honest revision history notice", () => {
      render(<TargetRevisionsWorkspace context={execContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Revisi Target" })).toBeInTheDocument();
      expect(screen.getByText("Sumber riwayat revisi target belum terhubung.")).toBeInTheDocument();
    });

    it("renders Strategic Sources surface reusing Document Center without storage duplication", () => {
      render(<StrategicSourcesWorkspace context={execContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Sumber Dokumen Strategis" })).toBeInTheDocument();
      expect(screen.getAllByText(/Ekstraksi sasaran dan KPI dari dokumen belum tersedia/i).length).toBeGreaterThan(0);

      const extractBtn = screen.getByRole("button", { name: /Ekstrak Sasaran & KPI/i });
      expect(extractBtn).toBeDisabled();

      const docLink = screen.getByRole("link", { name: /Buka Pusat Dokumen/i });
      expect(docLink).toHaveAttribute("href", "/workspace/executive/documents");
    });
  });

  describe("2. Division Contextual Strategy Views", () => {
    it("renders division contextual view with workspace scope description", () => {
      render(<StrategyOverviewWorkspace context={financeContext} />);

      expect(screen.getByRole("heading", { level: 1, name: "Strategi & Kinerja Keuangan" })).toBeInTheDocument();
      expect(screen.getByText(/Sasaran, KPI, inisiatif, dan review kinerja dalam cakupan divisi Keuangan\./i)).toBeInTheDocument();
    });

    const divisionMap = [
      { key: "it", code: "IT", label: "IT & TEKNOLOGI" },
      { key: "finance", code: "FINANCE", label: "KEUANGAN" },
      { key: "hr", code: "HR", label: "HR & PEOPLE" },
      { key: "legal", code: "LEGAL", label: "LEGAL & COMPLIANCE" },
      { key: "sales", code: "SALES", label: "SALES & MARKETING" },
      { key: "property", code: "PROPERTY", label: "PROPERTY & KONSTRUKSI" },
    ] as const;

    divisionMap.forEach(({ key, code, label }) => {
      it(`supports contextual runner for ${code} workspace`, async () => {
        mockSession(key, code, label);

        render(
          <StrategySubmoduleRunner
            directSubmodule="overview"
            workspaceKey={key}
          />,
        );

        const heading = await screen.findByRole("heading", { level: 1, name: `Strategi & Kinerja ${label}` });
        expect(heading).toBeInTheDocument();
      });
    });

    it("fails closed when user lacks authorized division scope", async () => {
      mockSession("finance", "FINANCE", "Finance");

      render(
        <StrategySubmoduleRunner
          directSubmodule="overview"
          workspaceKey="legal"
        />,
      );

      const heading = await screen.findByRole("heading", { name: /Bukan Otoritas Legal/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("3. Data Honesty & Architecture Boundaries", () => {
    it("never renders fabricated percentages or hardcoded business metrics", () => {
      const { container } = render(<StrategyPerformanceSummary context={execContext} />);

      expect(container.textContent).not.toMatch(/68%|92%|12 KPI|5 sasaran/i);
      expect(container.textContent).toContain("Kemajuan Pekerjaan");
      expect(container.textContent).toContain("Capaian KPI");
      expect(container.textContent).toContain("Capaian Sasaran");
    });

    it("does not use localStorage, sessionStorage, or IndexedDB in strategy module", () => {
      const allFiles = getStrategyFiles();
      const forbiddenStorage = /\b(?:localStorage|sessionStorage|indexedDB)\b/;

      const offenders = allFiles.filter((filePath) => {
        const content = readFileSync(filePath, "utf8");
        return forbiddenStorage.test(content);
      });

      expect(offenders.map((p) => relative(process.cwd(), p))).toEqual([]);
    });

    it("uses only the canonical Stage 2 strategy API namespace", () => {
      const allFiles = getStrategyFiles();
      const nonCanonicalApi = /["']\/api\/v1\/(?:kpis|objectives|initiatives|target-revisions)/;

      const offenders = allFiles.filter((filePath) => {
        const content = readFileSync(filePath, "utf8");
        return nonCanonicalApi.test(content);
      });

      expect(offenders.map((p) => relative(process.cwd(), p))).toEqual([]);
    });

    it("does not contain handwritten SVG/path elements in strategy module", () => {
      const allFiles = getStrategyFiles();
      const rawSvgPattern = /<(?:svg|path|circle|rect|polygon)\b/i;

      const offenders = allFiles.filter((filePath) => {
        const content = readFileSync(filePath, "utf8");
        return rawSvgPattern.test(content);
      });

      expect(offenders.map((p) => relative(process.cwd(), p))).toEqual([]);
    });
  });
});
