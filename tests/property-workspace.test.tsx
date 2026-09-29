import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { navigationForSession } from "@/app/navigation";
import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import AraRoute from "@/app/workspace/[workspaceKey]/(assistant)/ara/page";
import { ProjectsPage } from "@/features/shared-work";
import {
  PropertyBudgetPage,
  PropertyContractorsPage,
  PropertyExecutionPage,
  PropertyMaterialsPage,
  PropertyPerformancePage,
  PropertyPortfolioPage,
  PropertyProgressPage,
  PropertyQualityPage,
  PropertySummaryPage,
  PropertyUnitsPage,
  hasPropertyContext,
} from "@/features/property";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/proyek-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
}));

function propertySession(workspaceKey = "proyek-utama", divisionCode = "property") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_property", active: true, display_name: "Budi Properti", organization_id: "org_andara", tenant_id: "tenant_andara" },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["WORKSPACE_MEMBER"],
      scope_refs: ["workspace_property"],
      workspace: {
        active: true,
        division_code: divisionCode,
        organization_id: "org_andara",
        workspace_id: "workspace_property",
        workspace_key: workspaceKey,
        workspace_name: "Pusat Proyek",
        workspace_type: "BUSINESS",
      },
    },
    email: "budi@andara.co.id",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };
  return { authenticated: true, principal };
}

function salesSession() {
  return propertySession("penjualan-utama", "SALES");
}

describe("Property workspace", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("resolves lowercase Property metadata through canonical domain helper", () => {
    expect(hasPropertyContext(propertySession())).toBe(true);
    expect(hasPropertyContext(salesSession())).toBe(false);
  });

  it("builds the exact 17-item Property sidebar with the actual workspace key", () => {
    const sections = navigationForSession(false, "proyek-utama", false, propertySession());
    expect(sections.map((section) => section.label)).toEqual(["PUSAT PROYEK", "PELAKSANAAN", "SUMBER DAYA", "KINERJA", "PEKERJAAN", "ARA"]);
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).toEqual([
      "Ringkasan", "Portofolio Proyek", "Progres & Jadwal", "Pekerjaan & Milestone", "Unit & Kesiapan", "Inspeksi & Kualitas",
      "Kontraktor", "Anggaran & RAB", "Material & Pengadaan", "Target & Kinerja", "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA",
    ]);
    expect(sections.flatMap((section) => section.items).every((item) => item.href.startsWith("/workspace/proyek-utama/"))).toBe(true);
  });

  it("fails closed for non-Property and mismatched workspace authority", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(salesSession());
    render(<PropertyPortfolioPage workspaceKey="penjualan-utama" />);
    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    cleanup();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(propertySession());
    render(<PropertyPortfolioPage workspaceKey="workspace-lain" />);
    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
  });

  it("routes Property summary and performance through the shared resolvers", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<SummaryRoute params={{ workspaceKey: "proyek-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Ringkasan Property" })).toBeInTheDocument();
    cleanup();

    render(<PerformanceRoute params={{ workspaceKey: "proyek-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Target & Kinerja" })).toBeInTheDocument();
  });

  it.each([
    ["Portofolio Proyek", PropertyPortfolioPage], ["Progres & Jadwal", PropertyProgressPage], ["Pekerjaan & Milestone", PropertyExecutionPage],
    ["Unit & Kesiapan", PropertyUnitsPage], ["Inspeksi & Kualitas", PropertyQualityPage], ["Kontraktor", PropertyContractorsPage],
    ["Anggaran & RAB", PropertyBudgetPage], ["Material & Pengadaan", PropertyMaterialsPage], ["Target & Kinerja", PropertyPerformancePage],
  ])("%s renders inside one AppShell with source-unavailable state", async (title, Page) => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<Page workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
  });

  it("keeps universal Shared Work Project and ARA reusable for Property", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(new api.ApiError(404, "Not Found", "corr_404"));
    render(<ProjectsPage workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Proyek" })).toBeInTheDocument();
    expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
    cleanup();

    render(<AraRoute params={{ workspaceKey: "proyek-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
    expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
  });

  it("does not turn unavailable Property values into fake operational facts", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<PropertySummaryPage workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Ringkasan Property" })).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Rp\s*0|0%|Tepat Waktu|Available|Aman/)).not.toBeInTheDocument();
  });

  it("keeps Property forms unavailable and extraction candidates non-authoritative", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<PropertyProgressPage workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Progres & Jadwal" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tambah Progres" }));
    expect(screen.getByRole("dialog", { name: "Tambah Progress" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan Progres" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    fireEvent.click(screen.getByRole("button", { name: "Ambil dari Dokumen" }));
    expect(screen.getAllByText("Perlu Diperiksa").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Simpan Draft" })).toBeDisabled();
  });

  it("has canonical Property routes and no static Property route tree or duplicate ownership", () => {
    const base = "src/app/workspace/[workspaceKey]";
    for (const route of ["portfolio", "progress", "execution", "units", "quality", "contractors", "budget", "materials"]) {
      expect(existsSync(resolve(`${base}/(domain)/${route}/page.tsx`))).toBe(true);
    }
    expect(existsSync(resolve("src/app/workspace/property"))).toBe(false);
    expect(existsSync(resolve("src/features/property/projects"))).toBe(false);
    expect(existsSync(resolve("src/features/property/ara"))).toBe(false);
    const propertySources = [
      "src/features/property/property-model.ts", "src/features/property/property-layout.tsx", "src/features/property/navigation.ts",
      "src/features/property/shared/property-ui.tsx",
    ].map((file) => readFileSync(resolve(file), "utf8")).join("\n");
    expect(propertySources).not.toContain("@/features/shared-work/projects");
    expect(propertySources).not.toContain("@/features/ara");
  });
});
