import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { navigationForSession } from "@/app/navigation";
import {
  ProjectDetailView,
  ProjectDrawer,
  ProjectsPage,
  canCreateProject,
  humanizeWorkError,
  type WorkProject,
} from "@/features/shared-work";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";
import * as api from "@/lib/api";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/property/projects",
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
    replace: mockReplace,
  }),
}));

function makePrincipal(
  overrides: Partial<AuthenticatedPrincipalProjection> = {},
): AuthenticatedPrincipalProjection {
  return {
    actor: {
      actor_id: "actor_rani",
      active: true,
      display_name: "Rani Andara",
      organization_id: "org_andara",
      tenant_id: "tenant_andara",
    },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["WORKSPACE_MEMBER"],
      scope_refs: ["workspace_property"],
      workspace: {
        active: true,
        division_code: "PROPERTY",
        organization_id: "org_andara",
        workspace_id: "workspace_property",
        workspace_key: "property",
        workspace_name: "Property",
        workspace_type: "BUSINESS",
      },
    },
    email: "rani@andara.co.id",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
    ...overrides,
  };
}

function authenticatedSession(principal = makePrincipal()) {
  return { authenticated: true, principal };
}

const sampleProject: WorkProject = {
  id: "proj_the_park",
  code: "PRJ-PRP-001",
  name: "The Park Cluster Residence",
  description: "Pembangunan kawasan residensial tahap pertama.",
  status: "ACTIVE",
  ownerActorId: "actor_rani",
  ownerName: "Rani Andara",
  workspaceIds: ["workspace_property"],
  workspaceName: "Property",
  startDate: "2026-01-15",
  targetEndDate: "2026-12-31",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-09-27T00:00:00Z",
  progressPercentage: 45,
  riskLevel: "SEDANG",
  tasksCount: 12,
  documentsCount: 8,
  approvalsCount: 2,
  findingsCount: 3,
  reportsCount: 4,
  evidenceCount: 18,
};

describe("Shared Work / Pekerjaan Foundation & Proyek Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("Sidebar Navigation & Structure", () => {
    it("menampilkan section PEKERJAAN dengan 6 instrumen kerja standar tanpa filter/submenu", () => {
      const sections = navigationForSession(false, "property");
      const workSection = sections.find((s) => s.label === "PEKERJAAN");

      expect(workSection).toBeDefined();
      expect(workSection?.items.map((item) => item.label)).toEqual([
        "Proyek",
        "Tugas",
        "Persetujuan",
        "Dokumen",
        "Laporan",
        "Temuan",
      ]);

      expect(workSection?.items.map((item) => item.href)).toEqual([
        "/workspace/property/projects",
        "/workspace/property/tasks",
        "/workspace/property/approvals",
        "/workspace/property/documents",
        "/workspace/property/reports",
        "/workspace/property/findings",
      ]);
    });
  });

  describe("Source Honesty & Backend Connection Boundary", () => {
    it("menampilkan satu state Belum Terhubung tanpa empty state ketika sumber proyek belum tersedia", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      // Backend returns 404 for /api/v1/projects
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValueOnce(
        new ApiError(404, "Not Found", "corr_404"),
      );

      render(<ProjectsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Proyek", level: 1 })).toBeInTheDocument();
      });

      await waitFor(() => expect(screen.getByText("Data Proyek Belum Terhubung")).toBeInTheDocument());
      expect(
        screen.queryByText("Belum ada proyek yang dapat Anda akses."),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/fake|mock|dummy/i)).not.toBeInTheDocument();
    });

    it("tidak mengarang nilai 0 untuk relasi yang tidak diketahui atau belum terhubung", () => {
      render(
        <ProjectDrawer
          isConnected={false}
          onClose={vi.fn()}
          open={true}
          project={{
            ...sampleProject,
            tasksCount: null,
            documentsCount: null,
          }}
          workspaceKey="property"
        />,
      );

      expect(screen.getByRole("heading", { name: /The Park Cluster Residence/ })).toBeInTheDocument();
      const unconnectedLabels = screen.getAllByText("Belum Terhubung");
      expect(unconnectedLabels.length).toBeGreaterThan(0);
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  describe("Permission Authority", () => {
    it("hanya menampilkan tombol Tambah Proyek jika user memiliki permission create", async () => {
      // 1. Session without project.create permission
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
        authenticatedSession(
          makePrincipal({
            active_workspace: {
              active: true,
              data_scope: "WORKSPACE",
              permission_refs: [],
              role_refs: ["WORKSPACE_MEMBER"],
              scope_refs: ["workspace_property"],
              workspace: {
                active: true,
                division_code: "PROPERTY",
                organization_id: "org_andara",
                workspace_id: "workspace_property",
                workspace_key: "property",
                workspace_name: "Property",
                workspace_type: "BUSINESS",
              },
            },
          }),
        ),
      );
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([]);

      render(<ProjectsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Proyek", level: 1 })).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: "Tambah Proyek" })).not.toBeInTheDocument();

      // Verify permission helper directly
      expect(canCreateProject(authenticatedSession())).toBe(false);

      const leadSession = authenticatedSession(
        makePrincipal({
          active_workspace: {
            active: true,
            data_scope: "WORKSPACE",
            permission_refs: ["project.create"],
            role_refs: ["WORKSPACE_LEAD"],
            scope_refs: ["workspace_property"],
            workspace: {
              active: true,
              division_code: "PROPERTY",
              organization_id: "org_andara",
              workspace_id: "workspace_property",
              workspace_key: "property",
              workspace_name: "Property",
              workspace_type: "BUSINESS",
            },
          },
        }),
      );
      expect(canCreateProject(leadSession)).toBe(true);
    });
  });

  describe("Table-First Listing & Quick View Drawer", () => {
    it("merender tabel proyek dengan kolom canonical dan membuka drawer quick view saat baris diklik", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([sampleProject]);

      render(<ProjectsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("The Park Cluster Residence")).toBeInTheDocument();
      });

      expect(screen.getByText("PRJ-PRP-001")).toBeInTheDocument();
      expect(screen.getAllByText("Berjalan").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("45%")).toBeInTheDocument();

      // Click "Lihat" button to open quick-view drawer
      const viewButton = screen.getByRole("button", { name: "Lihat" });
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: "Buka Halaman Lengkap" })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Buka Halaman Lengkap" }));
      expect(mockPush).toHaveBeenCalledWith("/workspace/property/projects/proj_the_park");
    });
  });

  describe("Detail Page Shell & Tabulation", () => {
    it("merender halaman rincian proyek dengan 8 tab canonical dan dua-column definition layout", () => {
      render(
        <ProjectDetailView
          isConnected={true}
          project={sampleProject}
          workspaceKey="property"
        />,
      );

      expect(
        screen.getByRole("heading", { name: "The Park Cluster Residence", level: 1 }),
      ).toBeInTheDocument();
      expect(screen.getByText("PRJ-PRP-001")).toBeInTheDocument();
      expect(screen.getByText("Rani Andara")).toBeInTheDocument();

      // Check all 8 tabs
      const expectedTabs = [
        "Ringkasan",
        "Rencana",
        "Tugas",
        "Dokumen",
        "Persetujuan",
        "Temuan",
        "Bukti",
        "Aktivitas",
      ];
      for (const tab of expectedTabs) {
        expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
      }

      // Check Ringkasan tab content
      expect(screen.getByText("Tingkat Risiko")).toBeInTheDocument();
      expect(screen.getByText("Progres Eksekusi")).toBeInTheDocument();
      expect(screen.getByText("45%")).toBeInTheDocument();
    });
  });

  describe("Error State Humanization", () => {
    it("menerjemahkan kode status error menjadi pesan ramah Bahasa Indonesia tanpa bocoran teknis", () => {
      expect(humanizeWorkError(new ApiError(401, "unauthorized", null))).toBe(
        "Sesi Anda sudah berakhir. Silakan masuk kembali.",
      );
      expect(humanizeWorkError(new ApiError(403, "forbidden", null))).toBe(
        "Anda tidak memiliki kewenangan untuk melakukan tindakan ini.",
      );
      expect(humanizeWorkError(new ApiError(404, "not found", null))).toBe(
        "Data yang Anda cari tidak ditemukan.",
      );
      expect(humanizeWorkError(new ApiError(409, "conflict", null))).toBe(
        "Data telah berubah sejak halaman ini dibuka. Muat versi terbaru sebelum melanjutkan.",
      );
      expect(humanizeWorkError(new Error("Network failed"))).toBe(
        "Data belum dapat dimuat. Silakan coba kembali.",
      );
    });
  });
});
