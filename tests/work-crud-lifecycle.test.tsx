import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  ProjectsWorkspace,
  TasksWorkspace,
  ApprovalsWorkspace,
  DocumentsWorkspace,
  ReportsWorkspace,
  FindingsWorkspace,
} from "@/modules/work";
import type { WorkWorkspaceContext } from "@/modules/work/shared/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/it/projects",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

const mockWorkspace: WorkWorkspaceContext = {
  workspaceId: "ws_it_01",
  workspaceKey: "it",
  workspaceLabel: "IT Workspace",
  divisionCode: "IT",
};

describe("Shared Work - Comprehensive CRUD & Lifecycle Testing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "prompt").mockReturnValue("Catatan / Jadwal uji");
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Projects Workspace Lifecycle", () => {
    it("handles create, update, delete, milestone, and issue", async () => {
      const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, init) => {
        if (typeof path === "string" && path.includes("/api/v1/projects/portfolio")) {
          return {
            generated_at: "2026-09-01T00:00:00Z",
            metrics: { total: 1, on_track: 1, at_risk: 0, critical: 0, completed: 0 },
            progress: [],
            distribution: [],
            risk_summary: [],
            filter_options: { divisions: ["IT"], categories: ["PROPERTY"], statuses: ["ON_TRACK"] },
            pagination: { page: 1, page_size: 20, total_items: 1, total_pages: 1 },
            projects: [{
              project_id: "proj_01",
              workspace_id: "ws_it_01",
              division_code: "IT",
              division_name: "Information Technology",
              code: "PRJ-001",
              name: "ALOS Core Upgrade",
              category: "PROPERTY",
              progress_percent: 50,
              deadline: "2026-12-31",
              status: "ON_TRACK",
              budget_planned: 100,
              budget_spent: 50,
              currency: "IDR",
              milestones: [],
              issues: [],
            }],
          };
        }
        if (typeof path === "string" && path === "/api/v1/projects" && init?.method === "POST") {
          return { project_id: "proj_new", code: "PRJ-NEW", name: "New Proj" };
        }
        if (typeof path === "string" && path === "/api/v1/projects/proj_01" && init?.method === "PATCH") {
          return { project_id: "proj_01", status: "AT_RISK" };
        }
        if (typeof path === "string" && path === "/api/v1/projects/proj_01" && init?.method === "DELETE") {
          return { success: true };
        }
        if (typeof path === "string" && path.includes("/milestones") && init?.method === "POST") {
          return { milestone_id: "ms_01", title: "Milestone 1" };
        }
        if (typeof path === "string" && path === "/api/v1/project-issues" && init?.method === "POST") {
          return { issue_id: "iss_01", title: "Issue 1" };
        }
        return {};
      });

      render(<ProjectsWorkspace activeWorkspace={mockWorkspace} />);
      expect(await screen.findByText("ALOS Core Upgrade")).toBeInTheDocument();

      // Open and submit create form
      fireEvent.click(screen.getByRole("button", { name: /Buat Proyek/i }));
      fireEvent.change(screen.getByLabelText(/Kode Proyek/i), { target: { value: "PRJ-NEW" } });
      fireEvent.change(screen.getByLabelText(/Nama Proyek/i), { target: { value: "New Proj" } });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Proyek/i }));

      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/projects", expect.objectContaining({ method: "POST" }));
      });

      // Submit update
      fireEvent.click(screen.getByRole("button", { name: /Perbarui Proyek/i }));
      fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/projects/proj_01", expect.objectContaining({ method: "PATCH" }));
      });

      // Submit milestone
      fireEvent.click(screen.getByRole("button", { name: /Tambah Milestone/i }));
      fireEvent.change(screen.getByLabelText(/Judul Milestone/i), { target: { value: "Phase 1 Complete" } });
      fireEvent.change(screen.getByLabelText(/Tenggat Milestone/i), { target: { value: "2026-11-30" } });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/projects/proj_01/milestones", expect.objectContaining({ method: "POST" }));
      });

      // Submit issue
      fireEvent.click(screen.getByRole("button", { name: /Catat Isu/i }));
      fireEvent.change(screen.getByLabelText(/Judul Isu/i), { target: { value: "Database bottleneck" } });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/project-issues", expect.objectContaining({ method: "POST" }));
      });

      // Submit delete
      fireEvent.click(screen.getByRole("button", { name: /Hapus Proyek/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/projects/proj_01", expect.objectContaining({ method: "DELETE" }));
      });
    });
  });

  describe("2. Tasks Workspace Lifecycle", () => {
    it("handles create, status transition, and delete", async () => {
      const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, init) => {
        if (typeof path === "string" && path.includes("/api/v1/dashboard/operational")) {
          return {
            tasks: [{
              task_id: "tsk_01",
              workspace_id: "ws_it_01",
              division_code: "IT",
              title: "Setup Auth Matrix",
              description: "Configure RBAC",
              status: "TODO",
              priority: "HIGH",
              due_date: "2026-10-15",
              evidence_required: false,
              created_at: "2026-09-01T00:00:00Z",
              updated_at: "2026-09-01T00:00:00Z",
            }],
          };
        }
        if (typeof path === "string" && path === "/api/v1/tasks" && init?.method === "POST") {
          return { task_id: "tsk_new", title: "New Task" };
        }
        if (typeof path === "string" && path.includes("/status") && init?.method === "PATCH") {
          return { task_id: "tsk_01", status: "IN_PROGRESS" };
        }
        if (typeof path === "string" && path === "/api/v1/tasks/tsk_01" && init?.method === "DELETE") {
          return { success: true };
        }
        return {};
      });

      render(<TasksWorkspace activeWorkspace={mockWorkspace} />);
      expect(await screen.findByText("Setup Auth Matrix")).toBeInTheDocument();

      // Create Task
      fireEvent.click(screen.getByRole("button", { name: /Buat Tugas/i }));
      fireEvent.change(screen.getByLabelText(/Judul Tugas/i), { target: { value: "New Task" } });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Tugas/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/tasks", expect.objectContaining({ method: "POST" }));
      });

      // Switch to table view and perform status transition
      fireEvent.click(screen.getByRole("button", { name: /Tabel/i }));
      const startButton = await screen.findByRole("button", { name: /Sedang Dikerjakan/i });
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/tasks/tsk_01/status", expect.objectContaining({ method: "PATCH" }));
      });

      // Delete Task
      const deleteButton = screen.getByTitle("Hapus tugas");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/tasks/tsk_01", expect.objectContaining({ method: "DELETE" }));
      });
    });
  });

  describe("3. Approvals Workspace Lifecycle", () => {
    it("handles approve/reject and execute proposed actions", async () => {
      const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, init) => {
        if (typeof path === "string" && path === "/api/v1/dashboard/operational") {
          return {
            approvals: [{
              approval_request_id: "appr_01",
              title: "Budget Allocation Request",
              description: "Additional budget for servers",
              approval_kind: "FINANCIAL",
              status: "PENDING",
              payload_digest: "sha256_mock_digest",
              created_at: "2026-09-20T00:00:00Z",
            }],
          };
        }
        if (typeof path === "string" && path === "/api/v1/proposed-actions") {
          return [{
            proposed_action_id: "pa_01",
            title: "Deploy Cluster Node",
            rationale: "Scale workload",
            action_type: "DEPLOY",
            status: "APPROVED",
            payload: { title: "Deploy Cluster Node" },
            payload_digest: "sha256_action_digest",
            created_at: "2026-09-20T00:00:00Z",
          }];
        }
        if (typeof path === "string" && path.includes("/decision") && init?.method === "POST") {
          return { success: true };
        }
        if (typeof path === "string" && path.includes("/execute") && init?.method === "POST") {
          return { success: true };
        }
        return {};
      });

      render(<ApprovalsWorkspace activeWorkspace={mockWorkspace} />);
      expect(await screen.findByText("Budget Allocation Request")).toBeInTheDocument();

      // Enter decision notes and approve
      const noteInput = screen.getByPlaceholderText(/Catatan wajib sebelum persetujuan/i);
      fireEvent.change(noteInput, { target: { value: "Disetujui untuk operasional." } });
      fireEvent.click(screen.getByRole("button", { name: /^Setujui$/i }));

      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/approvals/appr_01/decision", expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            decision: "APPROVED",
            payload_digest: "sha256_mock_digest",
            notes: "Disetujui untuk operasional.",
          }),
        }));
      });

      // Execute proposed action
      expect(await screen.findByText("Deploy Cluster Node")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /^Eksekusi$/i }));

      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/proposed-actions/pa_01/execute", expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ payload_digest: "sha256_action_digest" }),
        }));
      });
    });
  });

  describe("4. Documents Workspace Lifecycle", () => {
    it("handles create, submit for review, approve, and reject", async () => {
      let docStatus: "DRAFT" | "IN_REVIEW" = "DRAFT";

      const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, init) => {
        if (typeof path === "string" && path === "/api/v1/documents") {
          if (init?.method === "POST") {
            return {
              document: { document_id: "doc_new", title: "Dokumen Baru" },
            };
          }
          return [{
            document_id: "doc_01",
            workspace_id: "ws_it_01",
            title: "SOP Infrastruktur Cloud",
            category: "SOP",
            classification: "INTERNAL",
            version_number: 1,
            status: docStatus,
            created_by_name: "Staff IT",
            created_at: "2026-09-20T00:00:00Z",
            updated_at: "2026-09-20T00:00:00Z",
          }];
        }
        if (typeof path === "string" && path === "/api/v1/documents/doc_01") {
          return {
            document: {
              document_id: "doc_01",
              workspace_id: "ws_it_01",
              title: "SOP Infrastruktur Cloud",
              category: "SOP",
              classification: "INTERNAL",
              version_number: 1,
              status: docStatus,
              created_by_name: "Staff IT",
              created_at: "2026-09-20T00:00:00Z",
              updated_at: "2026-09-20T00:00:00Z",
            },
            content: "Konten SOP Cloud...",
            checklist: [],
            reviews: [],
          };
        }
        if (typeof path === "string" && path.includes("/submit-review") && init?.method === "POST") {
          docStatus = "IN_REVIEW";
          return { success: true };
        }
        if (typeof path === "string" && path.includes("/approve") && init?.method === "POST") {
          return { success: true };
        }
        if (typeof path === "string" && path.includes("/reject") && init?.method === "POST") {
          return { success: true };
        }
        return {};
      });

      render(<DocumentsWorkspace activeWorkspace={mockWorkspace} />);
      expect(await screen.findByText("SOP Infrastruktur Cloud")).toBeInTheDocument();

      // Create Document
      fireEvent.click(screen.getByRole("button", { name: /Buat Dokumen/i }));
      fireEvent.change(screen.getByLabelText(/Judul Dokumen/i), { target: { value: "Dokumen Baru" } });
      fireEvent.change(screen.getByLabelText(/Isi Dokumen/i), { target: { value: "Isi dokumen..." } });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Dokumen/i }));

      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/documents", expect.objectContaining({ method: "POST" }));
      });

      // View details of doc_01
      fireEvent.click(screen.getByText("SOP Infrastruktur Cloud"));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/documents/doc_01");
      });

      // Submit for review
      const submitReviewBtn = await screen.findByRole("button", { name: /Ajukan untuk Review/i });
      fireEvent.click(submitReviewBtn);
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/documents/doc_01/submit-review", expect.objectContaining({ method: "POST" }));
      });

      // Now status is UNDER_REVIEW: approve button is available
      const approveBtn = await screen.findByRole("button", { name: /Setujui Dokumen/i });
      fireEvent.click(approveBtn);
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/documents/doc_01/approve", expect.objectContaining({ method: "POST" }));
      });

      // Reject Document
      const rejectBtn = screen.getByRole("button", { name: /Tolak Dokumen/i });
      fireEvent.click(rejectBtn);
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/documents/doc_01/reject", expect.objectContaining({ method: "POST" }));
      });
    });
  });

  describe("5. Reports Workspace Lifecycle", () => {
    it("handles create definition, generate, schedule, and delete", async () => {
      const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, init) => {
        if (typeof path === "string" && path === "/api/v1/report-definitions") {
          if (init?.method === "POST") {
            return { report_definition_id: "rep_def_new", name: "Definisi Baru" };
          }
          return [{
            report_definition_id: "rep_def_01",
            workspace_id: "ws_it_01",
            name: "Laporan Bulanan IT",
            period: "MONTHLY",
            scope: "WORKSPACE",
            schedule_expression: "0 8 1 * *",
            created_at: "2026-09-01T00:00:00Z",
          }];
        }
        if (typeof path === "string" && path === "/api/v1/dashboard/operational") {
          return { reports: [] };
        }
        if (typeof path === "string" && path.includes("/generate") && init?.method === "POST") {
          return { success: true };
        }
        if (typeof path === "string" && path.includes("/schedule") && init?.method === "PUT") {
          return { success: true };
        }
        if (typeof path === "string" && path === "/api/v1/report-definitions/rep_def_01" && init?.method === "DELETE") {
          return { success: true };
        }
        return {};
      });

      render(<ReportsWorkspace activeWorkspace={mockWorkspace} />);
      expect(await screen.findByText("Laporan Bulanan IT")).toBeInTheDocument();

      // Create definition
      fireEvent.click(screen.getAllByRole("button", { name: /Definisi Laporan/i })[0]);
      fireEvent.change(screen.getByLabelText(/Nama Laporan/i), { target: { value: "Definisi Baru" } });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Definisi/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/report-definitions", expect.objectContaining({ method: "POST" }));
      });

      // Generate report
      fireEvent.click(screen.getByTitle("Generate laporan sekarang"));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/report-definitions/rep_def_01/generate", expect.objectContaining({ method: "POST" }));
      });

      // Schedule report
      fireEvent.click(screen.getByTitle("Atur jadwal cron"));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/report-definitions/rep_def_01/schedule", expect.objectContaining({ method: "PUT" }));
      });

      // Delete definition
      fireEvent.click(screen.getByTitle("Hapus definisi laporan"));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/report-definitions/rep_def_01", expect.objectContaining({ method: "DELETE" }));
      });
    });
  });

  describe("6. Findings Workspace Lifecycle", () => {
    it("handles create, status update, and delete", async () => {
      const apiSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, init) => {
        if (typeof path === "string" && path === "/api/v1/dashboard/operational") {
          return {
            findings: [{
              finding_id: "fnd_01",
              title: "SSL Certificate Expiring",
              description: "Wildcard cert expires in 7 days",
              severity: "HIGH",
              status: "OPEN",
              owner_name: "Security Lead",
              created_at: "2026-09-20T00:00:00Z",
            }],
          };
        }
        if (typeof path === "string" && path === "/api/v1/findings" && init?.method === "POST") {
          return { finding_id: "fnd_new", title: "New Finding" };
        }
        if (typeof path === "string" && path.includes("/status") && init?.method === "PATCH") {
          return { finding_id: "fnd_01", status: "ACKNOWLEDGED" };
        }
        if (typeof path === "string" && path === "/api/v1/findings/fnd_01" && init?.method === "DELETE") {
          return { success: true };
        }
        return {};
      });

      render(<FindingsWorkspace activeWorkspace={mockWorkspace} />);
      expect(await screen.findByText("SSL Certificate Expiring")).toBeInTheDocument();

      // Create finding
      fireEvent.click(screen.getByRole("button", { name: /Catat Temuan/i }));
      fireEvent.change(screen.getByLabelText(/Judul Temuan/i), { target: { value: "New Finding" } });
      fireEvent.change(screen.getByLabelText(/Deskripsi & Catatan Lapangan/i), { target: { value: "Impact details..." } });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Temuan/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/findings", expect.objectContaining({ method: "POST" }));
      });

      // Status transition (Acknowledge)
      fireEvent.click(screen.getByRole("button", { name: /^Akui$/i }));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/findings/fnd_01/status", expect.objectContaining({ method: "PATCH" }));
      });

      // Delete finding
      fireEvent.click(screen.getByTitle("Hapus temuan"));
      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/api/v1/findings/fnd_01", expect.objectContaining({ method: "DELETE" }));
      });
    });
  });
});
