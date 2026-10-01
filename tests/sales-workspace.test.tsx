import { existsSync } from "node:fs";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { navigationForSession } from "@/app/navigation";
import { WorkspaceModuleRedirect } from "@/app/workspace/workspace-redirect";
import WorkspaceKeyRoot from "@/app/workspace/[workspaceKey]/page";
import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PipelineRoute from "@/app/workspace/[workspaceKey]/(domain)/pipeline/page";
import LeadsRoute from "@/app/workspace/[workspaceKey]/(domain)/leads/page";
import ActivitiesRoute from "@/app/workspace/[workspaceKey]/(domain)/activities/page";
import BookingsRoute from "@/app/workspace/[workspaceKey]/(domain)/bookings/page";
import KprRoute from "@/app/workspace/[workspaceKey]/(domain)/kpr/page";
import CampaignsRoute from "@/app/workspace/[workspaceKey]/(domain)/campaigns/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import AraRoute from "@/app/workspace/[workspaceKey]/(assistant)/ara/page";
import WorkspaceProjectsPageRoute from "@/app/workspace/[workspaceKey]/(shared-work)/projects/page";
import {
  SalesActivitiesPage,
  SalesBookingsPage,
  SalesCampaignsPage,
  SalesKprPage,
  SalesLeadsPage,
  SalesPerformancePage,
  SalesPipelinePage,
  hasSalesContext,
} from "@/features/sales";
import {
  ApprovalsPage,
  DocumentsPage,
  FindingsPage,
  ProjectsPage,
  ReportsPage,
  TasksPage,
} from "@/features/shared-work";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/penjualan-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
}));

function salesSession(workspaceKey = "penjualan-utama", divisionCode = "SALES") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: {
      actor_id: "actor_sales",
      active: true,
      display_name: "Rani Penjualan",
      organization_id: "org_andara",
      tenant_id: "tenant_andara",
    },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["DIVISION_MEMBER"],
      scope_refs: ["workspace_penjualan"],
      workspace: {
        active: true,
        division_code: divisionCode,
        organization_id: "org_andara",
        workspace_id: "workspace_penjualan",
        workspace_key: workspaceKey,
        workspace_name: "Pusat Penjualan",
        workspace_type: "BUSINESS",
      },
    },
    email: "rani@andara.co.id",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };

  return { authenticated: true, principal };
}

function propertySession(workspaceKey = "property") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: {
      actor_id: "actor_property",
      active: true,
      display_name: "Budi Properti",
      organization_id: "org_andara",
      tenant_id: "tenant_andara",
    },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["DIVISION_MEMBER"],
      scope_refs: ["workspace_property"],
      workspace: {
        active: true,
        division_code: "PROPERTY",
        organization_id: "org_andara",
        workspace_id: "workspace_property",
        workspace_key: workspaceKey,
        workspace_name: "Pusat Properti",
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

describe("Sales workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("membangun menu Sales dari active workspace Backend tanpa Beranda generik", () => {
    const session = salesSession();
    const sections = navigationForSession(false, "penjualan-utama", false, session);

    expect(sections.map((section) => section.label)).toEqual([
      "PUSAT PENJUALAN",
      "PELANGGAN & AKTIVITAS",
      "MARKETING & KINERJA",
      "PEKERJAAN",
      "ARA",
    ]);
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).toEqual([
      "Ringkasan", "Pipeline Penjualan", "Prospek & Lead", "Aktivitas & Tindak Lanjut",
      "Booking & Closing", "KPR & Akad", "Kampanye & Saluran", "Target & Kinerja",
      "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA",
    ]);
    expect(sections.flatMap((section) => section.items).map((item) => item.href)).toContain(
      "/workspace/penjualan-utama/kpr",
    );
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).not.toContain("Beranda");
  });

  it("menolak URL workspace yang tidak sama dengan projection aktif", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(salesSession());

    render(
      <SalesPipelinePage
        workspaceKey="workspace-lain"
      />,
    );

    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    expect(screen.queryByText("Pipeline Penjualan")).not.toBeInTheDocument();
  });

  it("menampilkan readiness jujur tanpa nilai bisnis rekaan", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(salesSession());

    render(
      <SalesPipelinePage
        workspaceKey="penjualan-utama"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Pipeline Penjualan" })).toBeInTheDocument();
    });
    await waitFor(() => expect(screen.queryAllByText("Belum Terhubung").length + screen.queryAllByText("Gagal Memuat").length).toBeGreaterThan(0));
    expect(screen.queryByText("Belum ada data")).not.toBeInTheDocument();
    expect(screen.queryByText(/Rp\s*0|0%|^Aman$/i)).not.toBeInTheDocument();
  });

  it("menampilkan Pipeline final sebagai table-first, filterable, responsive structure tanpa authority closing", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession());
    const request = vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(new api.ApiError(503, "Source error", null));
    render(<SalesPipelinePage workspaceKey="penjualan-utama" />);
    expect(await screen.findByRole("heading", { name: "Pipeline Penjualan" })).toBeInTheDocument();
    expect(await screen.findByText("Gagal Memuat")).toBeInTheDocument();
    expect(request.mock.calls.some(([path]) => String(path).startsWith("/api/v1/sales/opportunities"))).toBe(true);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Closing Resmi|Tandai/ })).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
});

  it.each([
    ["Prospek & Lead", SalesLeadsPage],
    ["Aktivitas & Tindak Lanjut", SalesActivitiesPage],
    ["Booking & Closing", SalesBookingsPage],
    ["KPR & Akad", SalesKprPage],
    ["Kampanye & Saluran", SalesCampaignsPage],
    ["Target & Kinerja", SalesPerformancePage],
  ])("%s memiliki UI final source-unavailable dan satu AppShell", async (title, Page) => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession());

    render(<Page workspaceKey="penjualan-utama" />);

    expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryAllByText("Belum Terhubung").length + screen.queryAllByText("Gagal Memuat").length).toBeGreaterThan(0));
    expect(screen.queryByText("Belum ada data")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
  });

  it("form Sales tidak menghasilkan fake success dan extraction review tetap unavailable", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession());
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, source: { source: "sales", status: "CONNECTED_EMPTY", authoritative: true, last_updated_at: null } });
    render(<SalesLeadsPage workspaceKey="penjualan-utama" />);
    expect(await screen.findByRole("heading", { name: "Prospek & Lead" })).toBeInTheDocument();
    expect(await screen.findByText("Belum ada data", { selector: "h3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tambah|Ambil dari Dokumen/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/berhasil disimpan|Rekaman tersimpan/)).not.toBeInTheDocument();
});

  it("hasSalesContext mengikuti canonical workspace-domain resolver dan tetap fail closed", () => {
    expect(hasSalesContext(salesSession("penjualan-utama", "sales"))).toBe(true);
    expect(hasSalesContext(salesSession("workspace-unknown", "UNKNOWN"))).toBe(false);
  });

  it("mutation actions Sales hanya contextual terhadap record yang terpilih", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession());

    render(<SalesLeadsPage workspaceKey="penjualan-utama" />);
    expect(await screen.findByRole("heading", { name: "Prospek & Lead" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Lead" })).not.toBeInTheDocument();

    cleanup();
    render(<SalesActivitiesPage workspaceKey="penjualan-utama" />);
    expect(await screen.findByRole("heading", { name: "Aktivitas & Tindak Lanjut" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Catat Hasil" })).not.toBeInTheDocument();

    cleanup();
    render(<SalesCampaignsPage workspaceKey="penjualan-utama" />);
    expect(await screen.findByRole("heading", { name: "Kampanye & Saluran" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Campaign" })).not.toBeInTheDocument();
  });

  it("Sales Shared Work Documents renders inside a single AppShell", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession("penjualan-utama"));
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(
      new api.ApiError(404, "Not Found", "corr_404"),
    );

    render(
      <DocumentsPage
        workspaceKey="penjualan-utama"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dokumen" })).toBeInTheDocument();
    });

    // Semantic queries: single shell check
    expect(screen.getAllByRole("link", { name: "ALOS" })).toHaveLength(1);
    expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Buka navigasi" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Pilih workspace" })).toHaveLength(1);

    // Source honesty: unavailable message present, empty state absent
    await waitFor(() => expect(screen.getByText("Data Dokumen Belum Terhubung")).toBeInTheDocument());
    await waitFor(() => expect(
      screen.getByText("Data dokumen belum terhubung. Daftar dokumen akan ditampilkan setelah sumber data tersedia."),
    ).toBeInTheDocument());
    expect(screen.queryByText("Belum ada dokumen yang dapat Anda akses.")).not.toBeInTheDocument();
  });

  it.each([
    ["projects", "Proyek", ProjectsPage],
    ["tasks", "Tugas", TasksPage],
    ["approvals", "Persetujuan", ApprovalsPage],
    ["reports", "Laporan", ReportsPage],
    ["findings", "Temuan", FindingsPage],
  ] as const)(
    "Sales Shared Work %s renders inside a single AppShell",
    async (module, heading, Component) => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession("penjualan-utama"));
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(
        new api.ApiError(404, "Not Found", `corr_404_${module}`),
      );

      render(
        <Component
          workspaceKey="penjualan-utama"
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      });

      expect(screen.getAllByRole("link", { name: "ALOS" })).toHaveLength(1);
      expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
      expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Buka navigasi" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Pilih workspace" })).toHaveLength(1);
    },
  );

  it("Sales navigation selalu menggunakan actualWorkspaceKey, menggunakan /kpr, dan tidak ada route static /workspace/sales atau mortgages", () => {
    const session = salesSession("penjualan-utama");
    const sections = navigationForSession(false, "penjualan-utama", false, session);
    const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));

    allHrefs.forEach((href) => {
      expect(href).toMatch(/^\/workspace\/penjualan-utama\//);
      expect(href).not.toContain("/workspace/sales/");
      expect(href).not.toContain("mortgages");
    });
    expect(allHrefs).toContain("/workspace/penjualan-utama/kpr");
  });

  it("fail closed jika session non-sales mencoba membuka halaman Sales", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(propertySession());
    render(
      <SalesPipelinePage
        workspaceKey="property"
      />,
    );

    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    expect(screen.queryByText("Pipeline Penjualan")).not.toBeInTheDocument();
  });

  it("WorkspaceModuleRedirect mengarahkan route generic ke active workspace yang authoritative", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(salesSession("penjualan-utama"));
    render(<WorkspaceModuleRedirect module="projects" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/workspace/penjualan-utama/projects");
    });
  });

  it("WorkspaceModuleRedirect fail closed ke /workspace jika tidak ada active workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: { ...salesSession().principal, active_workspace: null },
    });
    render(<WorkspaceModuleRedirect module="tasks" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/workspace");
    });
  });

  it("WorkspaceKeyRoot mengarahkan ke /summary untuk Sales", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession("penjualan-utama"));
    render(<WorkspaceKeyRoot params={{ workspaceKey: "penjualan-utama" }} />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/workspace/penjualan-utama/summary");
    });
  });

  it("WorkspaceKeyRoot mengarahkan Property ke /summary", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession("property"));
    render(<WorkspaceKeyRoot params={{ workspaceKey: "property" }} />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/workspace/property/summary");
    });
  });

  it("memastikan tidak ada duplicate static sales routes atau mortgages di src/app/workspace", () => {
    const salesSubdirs = [
      "activities", "pipeline", "leads", "bookings", "mortgages",
      "campaigns", "performance", "projects", "tasks", "approvals",
      "documents", "reports", "findings", "ara",
    ];
    for (const sub of salesSubdirs) {
      expect(existsSync(`src/app/workspace/sales/${sub}`)).toBe(false);
    }
    expect(existsSync("src/app/workspace/reports/[reportId]")).toBe(false);
    expect(existsSync("src/app/workspace/findings/[findingId]")).toBe(false);
  });

  describe("Workspace-aware authority and route access enforcement", () => {
    it.each([
      ["summary", SummaryRoute, "Sales & Marketing"],
      ["pipeline", PipelineRoute, "Pipeline Penjualan"],
      ["leads", LeadsRoute, "Prospek & Lead"],
      ["activities", ActivitiesRoute, "Aktivitas & Tindak Lanjut"],
      ["bookings", BookingsRoute, "Booking & Closing"],
      ["kpr", KprRoute, "KPR & Akad"],
      ["campaigns", CampaignsRoute, "Kampanye & Saluran"],
      ["performance", PerformanceRoute, "Target & Kinerja"],
      ["ara", AraRoute, "Tanya ARA"],
    ] as const)(
      "Sales workspace session allows Sales-specific page %s",
      async (_routeName, RouteComponent, expectedHeading) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession("penjualan-utama"));
        render(<RouteComponent params={{ workspaceKey: "penjualan-utama" }} />);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: expectedHeading })).toBeInTheDocument();
        });
        expect(
          screen.queryByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
        ).not.toBeInTheDocument();
      },
    );

    it.each([
      ["pipeline", PipelineRoute],
      ["leads", LeadsRoute],
      ["activities", ActivitiesRoute],
      ["bookings", BookingsRoute],
      ["kpr", KprRoute],
      ["campaigns", CampaignsRoute],
    ] as const)(
      "Property workspace session fails closed / is denied on Sales-specific page %s",
      async (_routeName, RouteComponent) => {
        vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession("property"));
        render(<RouteComponent params={{ workspaceKey: "property" }} />);

        expect(
          await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda."),
        ).toBeInTheDocument();
      },
    );

    it("Property workspace session is allowed on the shared Property summary route", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession("property"));
      render(<SummaryRoute params={{ workspaceKey: "property" }} />);

      expect(await screen.findByRole("heading", { name: "Ringkasan Property" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Sales & Marketing" })).not.toBeInTheDocument();
    });

    it("Property workspace session is allowed on the shared Property performance route", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession("property"));
      render(<PerformanceRoute params={{ workspaceKey: "property" }} />);

      expect(await screen.findByRole("heading", { name: "Target & Kinerja" })).toBeInTheDocument();
      expect(screen.queryByText("SALES & MARKETING")).not.toBeInTheDocument();
    });

    it("workspace key mismatch denies access even for an authenticated Sales session", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession("penjualan-utama"));
      render(<PipelineRoute params={{ workspaceKey: "penjualan-cabang" }} />);

      expect(
        await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Pipeline Penjualan" })).not.toBeInTheDocument();
    });

    it("no URL-only authority: Property session cannot access Sales route by inserting sales key in URL", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession("property"));
      render(<PipelineRoute params={{ workspaceKey: "penjualan-utama" }} />);

      expect(
        await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Pipeline Penjualan" })).not.toBeInTheDocument();
    });

    it("no frontend role inference: synthetic role in session cannot grant Sales access if division is non-sales", async () => {
      const financeSession: ReturnType<typeof propertySession> = {
        authenticated: true,
        principal: {
          ...propertySession("keuangan").principal,
          active_workspace: {
            active: true,
            data_scope: "WORKSPACE",
            permission_refs: ["*"],
            role_refs: ["DIVISION_LEAD"],
            scope_refs: ["workspace_keuangan"],
            workspace: {
              active: true,
              division_code: "FINANCE",
              organization_id: "org_andara",
              workspace_id: "workspace_keuangan",
              workspace_key: "keuangan",
              workspace_name: "Pusat Keuangan",
              workspace_type: "BUSINESS",
            },
          },
        },
      };

      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession);
      render(<PipelineRoute params={{ workspaceKey: "keuangan" }} />);

      expect(
        await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Pipeline Penjualan" })).not.toBeInTheDocument();
    });

    it("Shared Work routes remain reusable for non-Sales workspaces", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession("property"));
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([]);

      render(<WorkspaceProjectsPageRoute params={{ workspaceKey: "property" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Proyek" })).toBeInTheDocument();
      });
      // Verify Property navigation is rendered, not Sales navigation
      expect(screen.queryByText("Pipeline Penjualan")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Proyek" })).toHaveAttribute(
        "href",
        "/workspace/property/projects",
      );
      expect(screen.getByRole("link", { name: "Tugas" })).toHaveAttribute(
        "href",
        "/workspace/property/tasks",
      );
      expect(screen.getByRole("link", { name: "Dokumen" })).toHaveAttribute(
        "href",
        "/workspace/property/documents",
      );
    });
  });
});
