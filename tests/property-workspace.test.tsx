import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  PropertyContractorDetailPage,
  PropertyUnitDetailPage,
  PropertyUnitsPage,
  hasPropertyContext,
} from "@/features/property";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";
import { mockAraBackend } from "./helpers/ara";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ workspaceKey: "proyek-utama" }),
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
      role_refs: ["DIVISION_MEMBER"],
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
  beforeEach(() => { vi.clearAllMocks(); mockAraBackend(); vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(new api.ApiError(503, "Source failure", null)); });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("resolves lowercase Property metadata through canonical domain helper", () => {
    expect(hasPropertyContext(propertySession())).toBe(true);
    expect(hasPropertyContext(salesSession())).toBe(false);
  });

  it("builds the exact 18-item Property sidebar with the actual workspace key", () => {
    const sections = navigationForSession(false, "proyek-utama", false, propertySession());
    expect(sections.map((section) => section.label)).toEqual(["PUSAT PROYEK", "PELAKSANAAN", "SUMBER DAYA", "KINERJA", "PEKERJAAN", "ARA"]);
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).toEqual([
      "Ringkasan", "Portofolio Proyek", "Progres & Jadwal", "Pekerjaan & Milestone", "Unit & Kesiapan", "Inspeksi & Kualitas",
      "Kontraktor", "Anggaran & RAB", "Material & Pengadaan", "Target & Kinerja", "Perlu Tindakan", "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA",
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
    await waitFor(() => expect(screen.queryAllByText("Belum Terhubung").length + screen.queryAllByText("Gagal Memuat").length).toBeGreaterThan(0));
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
    expect(screen.getAllByText("Belum tersedia").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Rp\s*0|0%|Tepat Waktu|Available|Aman/)).not.toBeInTheDocument();
  });

  it("keeps Property forms unavailable and extraction candidates non-authoritative", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<PropertyMaterialsPage workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Material & Pengadaan" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ajukan Permintaan Material" }));
    expect(screen.getByRole("button", { name: "Simpan Permintaan" })).toBeDisabled();
    expect(screen.queryByText("Rekaman tersimpan.")).not.toBeInTheDocument();
});

  it("summary exposes the complete source status strip and readiness drawer", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/property/overview") return { source: { source: "property", status: "CONNECTED_EMPTY", authoritative: true, last_updated_at: null }, counts: {}, last_updated_at: null } as never;
      throw new api.ApiError(503, "Source failure", null);
    });
    render(<PropertySummaryPage workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Ringkasan Property" })).toBeInTheDocument();
    await waitFor(() => expect(api.authenticatedApiRequest).toHaveBeenCalledWith("/api/v1/business/property/summary", expect.any(Object)));
    expect(screen.getAllByText("Belum tersedia").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Rp\s*0|0%|Tepat Waktu|Available|Aman/)).not.toBeInTheDocument();
});

  it("exposes the final Property form field matrix without enabling mutations", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, source: { source: "property", status: "CONNECTED_EMPTY", authoritative: true, last_updated_at: null } });
    render(<PropertyProgressPage workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Progres & Jadwal" })).toBeInTheDocument();
    expect(await screen.findByText("Belum ada data", { selector: "h3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tambah/ })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pembaruan Konstruksi" })).toBeInTheDocument();
});

  it("keeps Unit and Contractor detail information separated with final tabs", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<PropertyUnitDetailPage unitId="unit-1" workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Detail Unit" })).toBeInTheDocument();
    for (const label of ["Ringkasan", "Progres", "Milestone", "Inspeksi", "Dokumen", "Temuan", "Booking / Sales", "Serah Terima", "Aktivitas"]) expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    expect(screen.getByText("Status Komersial")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Booking Status/i)).not.toBeInTheDocument();
    cleanup();

    render(<PropertyContractorDetailPage contractorId="contractor-1" workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Detail Kontraktor" })).toBeInTheDocument();
    for (const label of ["Ringkasan", "Pekerjaan", "Progres", "Dokumen", "Inspeksi", "Temuan", "Opname", "Riwayat"]) expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Paid|Approve Contract/i })).not.toBeInTheDocument();
  });

  it("quality flow points to Shared Work and keeps failed inspection actions unavailable", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<PropertyQualityPage workspaceKey="proyek-utama" />);
    expect(await screen.findByRole("heading", { name: "Inspeksi & Kualitas" })).toBeInTheDocument();
    for (const label of ["Inspeksi Mutu", "Temuan Mutu / NCR", "Insiden Keselamatan"]) expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve|Pembayaran|Severity AI/ })).not.toBeInTheDocument();
});

  it("portfolio preserves the canonical Shared Work Project destination", () => {
    const source = readFileSync(resolve("src/features/business-records/project-references.tsx"), "utf8");
    expect(source).toContain('"/api/v1/projects"');
    expect(source).toContain('/projects/');
    expect(source).toContain('Buka Proyek');
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
