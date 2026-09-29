import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { navigationForSession } from "@/app/navigation";
import {
  TaskDetailView,
  TaskDrawer,
  TasksPage,
  canCreateTask,
  formatTaskDueDate,
  getTaskPriorityInfo,
  getTaskStatusInfo,
  isTaskOverdue,
  type WorkTask,
} from "@/features/shared-work";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";
import * as api from "@/lib/api";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/property/tasks",
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
      actor_id: "actor_budi",
      active: true,
      display_name: "Budi Santoso",
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
    email: "budi@andara.co.id",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
    ...overrides,
  };
}

function authenticatedSession(principal = makePrincipal()) {
  return { authenticated: true, principal };
}

const sampleTask: WorkTask = {
  id: "task_verify_site_plan",
  title: "Verifikasi dokumen site plan",
  description: "Periksa kelengkapan dokumen site plan sebelum diajukan ke dinas terkait.",
  status: "IN_PROGRESS",
  priority: "HIGH",
  projectId: "proj_the_park",
  projectName: "The Park Cluster",
  projectCode: "PRJ-PRP-001",
  ownerActorId: "actor_budi",
  ownerName: "Budi Santoso",
  createdBy: "actor_rani",
  creatorName: "Rani Andara",
  startDate: "2026-09-01",
  dueAt: "2026-10-15T00:00:00Z",
  workspaceIds: ["workspace_property"],
  workspaceName: "Property",
  blockedBy: ["task_survey_topografi"],
  blockedByTitles: ["Survei topografi lahan tahap 1"],
  createdAt: "2026-09-01T08:00:00Z",
  updatedAt: "2026-09-27T10:00:00Z",
  documentsCount: 3,
  findingsCount: 1,
  evidenceCount: 4,
  commentsCount: 2,
};

describe("Shared Work / Modul Tugas (Tasks)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("1 & 2. Route & Sidebar Navigation", () => {
    it("memakai shared navigation dengan item Tugas aktif dan URL konsisten", () => {
      const sections = navigationForSession(false, "property");
      const workSection = sections.find((s) => s.label === "PEKERJAAN");
      expect(workSection).toBeDefined();

      const taskItem = workSection?.items.find((item) => item.label === "Tugas");
      expect(taskItem).toBeDefined();
      expect(taskItem?.href).toBe("/workspace/property/tasks");
    });
  });

  describe("3. Unauthenticated Fail Closed", () => {
    it("menampilkan penolakan akses dan tidak membocorkan data jika session gagal", async () => {
      vi.spyOn(api, "sessionApiRequest").mockRejectedValueOnce(
        new ApiError(401, "Unauthorized", "corr_401"),
      );

      render(<TasksPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Sesi Berakhir")).toBeInTheDocument();
      });
      expect(screen.queryByText(/Verifikasi dokumen site plan/)).not.toBeInTheDocument();
    });
  });

  describe("4, 5 & 6. Permission Authority & Role Synthesis Prevention", () => {
    it("hanya menampilkan aksi Tambah Tugas jika permission task.create ada pada session", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([]);

      render(<TasksPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tugas", level: 1 })).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /Tambah Tugas/i })).not.toBeInTheDocument();
    });

    it("WORKSPACE_LEAD tanpa permission task.create TIDAK otomatis mendapatkan izin tambah", () => {
      const leadSessionWithoutPerm = authenticatedSession(
        makePrincipal({
          active_workspace: {
            active: true,
            data_scope: "WORKSPACE",
            permission_refs: [],
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

      expect(canCreateTask(leadSessionWithoutPerm)).toBe(false);

      const sessionWithPerm = authenticatedSession(
        makePrincipal({
          active_workspace: {
            active: true,
            data_scope: "WORKSPACE",
            permission_refs: ["task.create"],
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
      );

      expect(canCreateTask(sessionWithPerm)).toBe(true);
    });

    it("menampilkan aksi tambah disabled ketika permission ada tetapi mutation belum tersedia", async () => {
      const principal = makePrincipal({
        active_workspace: {
          ...makePrincipal().active_workspace!,
          permission_refs: ["task.create"],
        },
      });
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession(principal));
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([]);

      render(<TasksPage workspaceKey="property" />);

      const action = await screen.findByRole("button", { name: "Tambah Tugas — Belum Tersedia" });
      expect(action).toBeDisabled();
      expect(screen.queryByText("Berhasil disimpan")).not.toBeInTheDocument();
      expect(screen.queryByText("Tugas baru")).not.toBeInTheDocument();
    });
  });

  describe("7. Source Honesty & Technical Message Guard", () => {
    it("menampilkan pesan non-teknis jujur ketika backend belum terhubung dan tidak membocorkan kata teknis", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValueOnce(
        new ApiError(404, "Not Found", "corr_404"),
      );

      render(<TasksPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Data Tugas Belum Terhubung")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Data tugas belum terhubung. Daftar tugas akan ditampilkan setelah sumber data tersedia."),
      ).toBeInTheDocument();

      // Ensure no raw technical leakage in UI
      expect(screen.queryByText(/FastAPI|endpoint|\/api\/v1|migration 0013|postgres/i)).not.toBeInTheDocument();
    });
  });

  describe("8 & 9. Null Value & Missing Relation Presentation", () => {
    it("merender null field sebagai — dan relasi yang belum terhubung bukan 0", () => {
      const taskWithNulls: WorkTask = {
        ...sampleTask,
        projectId: null,
        projectName: null,
        ownerName: null,
        ownerActorId: null,
        description: null,
        dueAt: null,
        startDate: null,
        documentsCount: null,
        findingsCount: null,
        evidenceCount: null,
        commentsCount: null,
        blockedByTitles: [],
      };

      render(
        <TaskDrawer
          isConnected={false}
          onClose={vi.fn()}
          open={true}
          task={taskWithNulls}
          workspaceKey="property"
        />,
      );

      expect(screen.getByText("Verifikasi dokumen site plan")).toBeInTheDocument();
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);

      // Relationship counts should show "Belum Terhubung", NOT "0"
      const unconnectedItems = screen.getAllByText("Belum Terhubung");
      expect(unconnectedItems.length).toBeGreaterThan(0);
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  describe("10. Table Columns & Row Content", () => {
    it("merender tabel tugas dengan kolom lengkap sesuai requirement", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([sampleTask]);

      render(<TasksPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Verifikasi dokumen site plan")).toBeInTheDocument();
      });

      expect(screen.getByRole("columnheader", { name: "Tugas" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Proyek" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Pemilik" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Prioritas" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Tenggat" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Workspace" })).toBeInTheDocument();
    });
  });

  describe("11, 12 & 13. Interaction: Drawer & Full Detail Navigation", () => {
    it("membuka TaskDrawer saat baris diklik dan dapat bernavigasi ke halaman detail lengkap", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([sampleTask]);

      render(<TasksPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Verifikasi dokumen site plan")).toBeInTheDocument();
      });

      // Click "Lihat" button in row
      const lihatButton = screen.getByRole("button", { name: "Lihat" });
      fireEvent.click(lihatButton);

      // Verify drawer opened with task details
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Buka Halaman Lengkap" })).toBeInTheDocument();

      // Click "Buka Halaman Lengkap"
      fireEvent.click(screen.getByRole("button", { name: "Buka Halaman Lengkap" }));
      expect(mockPush).toHaveBeenCalledWith("/workspace/property/tasks/task_verify_site_plan");
    });
  });

  describe("14, 15 & 16. Presentation Status & Priority Indonesian Mapping", () => {
    it("tidak membocorkan raw enum status dan memetakan ke Bahasa Indonesia", () => {
      expect(getTaskStatusInfo("OPEN").label).toBe("Belum Dimulai");
      expect(getTaskStatusInfo("IN_PROGRESS").label).toBe("Dalam Proses");
      expect(getTaskStatusInfo("BLOCKED").label).toBe("Terhambat");
      expect(getTaskStatusInfo("UNDER_REVIEW").label).toBe("Menunggu Review");
      expect(getTaskStatusInfo("COMPLETED").label).toBe("Selesai");
      expect(getTaskStatusInfo("CANCELLED").label).toBe("Dibatalkan");
      expect(getTaskStatusInfo("UNKNOWN_VAL").label).toBe("Belum Dinilai");
      expect(getTaskStatusInfo(null).label).toBe("Belum Dinilai");
    });

    it("tidak membocorkan raw enum prioritas dan memetakan ke Bahasa Indonesia", () => {
      expect(getTaskPriorityInfo("LOW").label).toBe("Rendah");
      expect(getTaskPriorityInfo("NORMAL").label).toBe("Normal");
      expect(getTaskPriorityInfo("HIGH").label).toBe("Tinggi");
      expect(getTaskPriorityInfo("CRITICAL").label).toBe("Kritis");
      expect(getTaskPriorityInfo("UNKNOWN_PRIORITY").label).toBe("—");
      expect(getTaskPriorityInfo(null).label).toBe("—");
    });
  });

  describe("17. Due Date & Overdue Calculation", () => {
    it("tidak melabeli 'Terlambat' jika tugas berstatus Selesai atau Dibatalkan meskipun tanggal telah lewat", () => {
      const pastDate = "2020-01-01T00:00:00Z";

      // Open task in past -> Overdue
      expect(isTaskOverdue(pastDate, "OPEN")).toBe(true);
      expect(isTaskOverdue(pastDate, "IN_PROGRESS")).toBe(true);

      // Completed or cancelled task in past -> NOT overdue
      expect(isTaskOverdue(pastDate, "COMPLETED")).toBe(false);
      expect(isTaskOverdue(pastDate, "CANCELLED")).toBe(false);

      // Future task -> NOT overdue
      const futureDate = "2099-01-01T00:00:00Z";
      expect(isTaskOverdue(futureDate, "OPEN")).toBe(false);

      // Null due date -> NOT overdue
      expect(isTaskOverdue(null, "OPEN")).toBe(false);

      // Formatting helper check
      const completedDue = formatTaskDueDate(pastDate, "COMPLETED");
      expect(completedDue.isOverdue).toBe(false);
    });
  });

  describe("18, 19 & 20. Detail Page: No Fake Checklist, Comments, or Evidence", () => {
    it("merender halaman detail tugas dengan state kesiapan jujur tanpa fake local data", () => {
      render(
        <TaskDetailView
          isConnected={true}
          task={sampleTask}
          workspaceKey="property"
        />,
      );

      expect(screen.getByRole("heading", { name: "Verifikasi dokumen site plan" })).toBeInTheDocument();
      expect(screen.getByText("The Park Cluster")).toBeInTheDocument();

      // Click Checklist tab
      const checklistTab = screen.getByRole("tab", { name: "Checklist" });
      fireEvent.click(checklistTab);
      expect(screen.getByText("Checklist belum tersedia.")).toBeInTheDocument();

      // Click Relasi tab
      const relasiTab = screen.getByRole("tab", { name: "Relasi" });
      fireEvent.click(relasiTab);
      expect(screen.getByText("Relasi Belum Terhubung")).toBeInTheDocument();
    });
  });

  describe("21 & 22. No Fake Backend API or LocalStorage Authority", () => {
    it("tidak menulis atau membaca hak akses dari localStorage", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      canCreateTask(authenticatedSession());
      expect(getItemSpy).not.toHaveBeenCalledWith(expect.stringMatching(/role|permission/i));
      expect(setItemSpy).not.toHaveBeenCalledWith(expect.stringMatching(/role|permission/i));
    });
  });

  describe("23 & 24. Responsive Layout & Bahasa Indonesia Quality", () => {
    it("menampilkan seluruh label antarmuka dalam Bahasa Indonesia yang baku dan bersih", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([]);

      render(<TasksPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tugas", level: 1 })).toBeInTheDocument();
      });

      expect(screen.getByText("Semua")).toBeInTheDocument();
      expect(screen.getByText("Tugas Saya")).toBeInTheDocument();
      expect(screen.getByText("Ditugaskan oleh Saya")).toBeInTheDocument();
      expect(screen.getByText("Tim")).toBeInTheDocument();
      expect(screen.getByText("Terlambat")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Cari tugas…")).toBeInTheDocument();
    });

    it("tidak menyamakan tab Tim dengan Semua ketika scope tim belum canonical", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([sampleTask]);

      render(<TasksPage workspaceKey="property" />);
      await screen.findByText("Verifikasi dokumen site plan");

      fireEvent.click(screen.getByRole("tab", { name: "Tim" }));

      expect(screen.getByText("Tugas Tim Belum Terhubung")).toBeInTheDocument();
      expect(screen.getByText("Data tugas tim akan tersedia setelah sumber scope tim terhubung.")).toBeInTheDocument();
      expect(screen.queryByText("Verifikasi dokumen site plan")).not.toBeInTheDocument();
    });
  });
});
