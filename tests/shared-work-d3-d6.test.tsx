import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { navigationForSession } from "@/app/navigation";
import {
  // Approvals
  ApprovalsPage,
  ApprovalDetailView,
  ApprovalDrawer,
  getApprovalStatusInfo,
  type WorkApproval,
  // Documents
  DocumentsPage,
  DocumentDetailView,
  DocumentDrawer,
  getDocumentStatusInfo,
  type WorkDocument,
  // Reports
  ReportsPage,
  ReportDetailView,
  ReportDrawer,
  getReportStatusInfo,
  type WorkReportResult,
  type WorkReportDefinition,
  // Findings
  FindingsPage,
  FindingDetailView,
  FindingDrawer,
  getFindingSeverityInfo,
  getFindingStatusInfo,
  type WorkFinding,
} from "@/features/shared-work";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";
import * as api from "@/lib/api";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/property/approvals",
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
      role_refs: ["DIVISION_MEMBER"],
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

// Sample fixtures for unit tests
const sampleApproval: WorkApproval = {
  id: "appr_spk_001",
  subjectType: "PROJECT",
  subjectId: "project_park",
  subjectTitle: "Persetujuan Proyek The Park",
  reason: "Pengajuan SPK untuk pengerjaan cut and fill lahan The Park Cluster tahap 1.",
  requestedBy: "actor_ahmad",
  requesterName: "Ahmad Subarjo",
  approverActorId: "actor_budi",
  approverName: "Budi Santoso",
  status: "PENDING",
  decision: null,
  decisionReason: null,
  requestedAt: "2026-09-25T10:00:00Z",
  decidedAt: null,
  workspaceIds: ["workspace_property"],
  workspaceName: "Property",
  materialityValue: null,
  documentsCount: null,
  evidenceCount: null,
  commentsCount: null,
};

const sampleDocument: WorkDocument = {
  id: "doc_site_plan_001",
  title: "Site Plan Kawasan Residensial The Park",
  category: "Teknik & Arsitektur",
  dataClassification: "INTERNAL",
  status: "APPROVED",
  currentVersion: "v1.2",
  ownerActorId: "actor_ahmad",
  ownerName: "Ahmad Subarjo",
  workspaceIds: ["workspace_property"],
  workspaceName: "Property",
  projectId: "proj_the_park",
  projectName: "The Park Cluster",
  createdAt: "2026-08-15T09:00:00Z",
  updatedAt: "2026-09-20T11:00:00Z",
  effectiveDate: "2026-09-20T00:00:00Z",
  expiryDate: null,
  description: "Gambar tata letak dan master plan kawasan perumahan.",
  versions: [
    {
      documentId: "doc_site_plan_001",
      version: "v1.2",
      contentHash: "sha256:abcd1234efgh5678",
      createdAt: "2026-09-20T11:00:00Z",
      createdBy: "actor_ahmad",
      creatorName: "Ahmad Subarjo",
    },
    {
      documentId: "doc_site_plan_001",
      version: "v1.0",
      contentHash: "sha256:1111222233334444",
      createdAt: "2026-08-15T09:00:00Z",
      createdBy: "actor_ahmad",
      creatorName: "Ahmad Subarjo",
    },
  ],
  tasksCount: 4,
  approvalsCount: 1,
  evidenceCount: 3,
};

const sampleReportResult: WorkReportResult = {
  id: "rep_weekly_w38",
  title: "Laporan Kemajuan Mingguan Konstruksi W38",
  description: "Progres fisik pengerjaan struktur cluster minggu ke-38.",
  reportType: "Laporan Proyek",
  periodStart: "2026-09-18",
  periodEnd: "2026-09-24",
  scope: "The Park Cluster",
  ownerActorId: "actor_ahmad",
  ownerName: "Ahmad Subarjo",
  status: "PUBLISHED",
  createdAt: "2026-09-25T08:00:00Z",
  publishedAt: "2026-09-25T14:00:00Z",
  workspaceIds: ["workspace_property"],
  workspaceName: "Property",
  evidenceCount: 5,
  commentsCount: 2,
};

const sampleReportDefinition: WorkReportDefinition = {
  id: "def_weekly_progress",
  ownerActorId: "actor_ahmad",
  createdAt: "2026-09-25T08:00:00Z",
  updatedAt: "2026-09-25T08:00:00Z",
  scheduleConfig: {},
  name: "Laporan Kemajuan Proyek Mingguan",
  reportType: "Laporan Proyek",
  frequency: "WEEKLY",
  scope: "Seluruh Proyek Aktif",
  ownerName: "Tim PMO",
  reviewRequired: true,
  recipients: ["Direktur Operasional", "Project Manager"],
  dataSources: ["Database Proyek", "Sistem Log Harian"],
  workspaceIds: ["workspace_property"],
  workspaceName: "Property",
};

const sampleFinding: WorkFinding = {
  id: "fnd_drainase_tersumbat",
  title: "Saluran drainase primer tersumbat material urukan",
  description: "Ditemukan endapan tanah uruk menutupi separuh penampang saluran pembuangan utama sisi barat.",
  severity: "HIGH",
  status: "OPEN",
  sourceType: "Inspeksi Lapangan",
  category: "Konstruksi & K3",
  identifiedAt: "2026-09-26T14:30:00Z",
  dueDate: "2026-10-02T17:00:00Z",
  workspaceIds: ["workspace_property"],
  workspaceName: "Property",
  projectId: "proj_the_park",
  projectName: "The Park Cluster",
  ownerActorId: "actor_budi",
  ownerName: "Budi Santoso",
  verifierActorId: "actor_ahmad",
  verifierName: "Ahmad Subarjo",
  impact: "Potensi genangan air saat hujan lebat yang dapat merusak struktur pondasi cluster.",
  rootCause: "Kurangnya proteksi saringan sedimen saat pengerjaan pengurukan tanah blok C.",
  correctiveActionTaskId: "task_bersihkan_drainase",
  correctiveActionTaskTitle: "Pembersihan endapan drainase blok C",
  evidenceCount: 3,
  tasksCount: 1,
  createdAt: "2026-09-26T15:00:00Z",
};

describe("Shared Work / FASE D3 sampai D6", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ==========================================
  // MODUL 1: PERSETUJUAN
  // ==========================================
  describe("MODUL 1: Persetujuan (Approvals)", () => {
    it("memastikan sidebar navigasi memuat Persetujuan", () => {
      const sections = navigationForSession(false, "property");
      const workSection = sections.find((s) => s.label === "PEKERJAAN");
      const approvalItem = workSection?.items.find((item) => item.label === "Persetujuan");
      expect(approvalItem).toBeDefined();
      expect(approvalItem?.href).toBe("/workspace/property/approvals");
    });

    it("memetakan status persetujuan ke Bahasa Indonesia tanpa membocorkan raw enum", () => {
      expect(getApprovalStatusInfo("PENDING").label).toBe("Menunggu Keputusan");
      expect(getApprovalStatusInfo("APPROVED").label).toBe("Disetujui");
      expect(getApprovalStatusInfo("RETURNED").label).toBe("Dikembalikan");
      expect(getApprovalStatusInfo("REJECTED").label).toBe("Ditolak");
      expect(getApprovalStatusInfo("HELD").label).toBe("Ditahan");
      expect(getApprovalStatusInfo("UNKNOWN_ENUM").label).toBe("Belum Dinilai");
      expect(getApprovalStatusInfo(null).label).toBe("Belum Dinilai");
    });

    it("menampilkan pesan non-teknis jujur saat backend persetujuan belum terhubung", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValueOnce(
        new ApiError(404, "Not Found", "corr_404"),
      );

      render(<ApprovalsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Data Persetujuan Belum Terhubung")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Data persetujuan belum terhubung. Daftar persetujuan akan ditampilkan setelah sumber data tersedia.",
        ),
      ).toBeInTheDocument();

      // Ensure no raw technical leakage
      expect(screen.queryByText(/FastAPI|endpoint|\/api\/v1|migration 0013|postgres/i)).not.toBeInTheDocument();
    });

    it("menampilkan pengusul dan pengambil keputusan tanpa peninjau fiktif", () => {
      render(<ApprovalDetailView approval={sampleApproval} workspaceKey="property" />);

      expect(screen.getByText("Alur Kewenangan")).toBeInTheDocument();
      expect(screen.getAllByText("Pengusul").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Peninjau (Reviewer)")).not.toBeInTheDocument();
      expect(screen.getByText("Pengambil Keputusan")).toBeInTheDocument();
      expect(screen.getAllByText("Ahmad Subarjo").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Budi Santoso").length).toBeGreaterThanOrEqual(1);
    });

    it("tidak menampilkan tombol mutasi setujui/tolak jika izin mutasi tidak ada pada session (fail-closed)", () => {
      render(<ApprovalDetailView approval={sampleApproval} workspaceKey="property" />);
      // Should NOT have interactive button for Setujui without mutation API
      expect(screen.queryByRole("button", { name: /^Setujui$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Tolak$/i })).not.toBeInTheDocument();
    });

    it("menampilkan quick view drawer saat item persetujuan dipilih", () => {
      const handleClose = vi.fn();
      render(
        <ApprovalDrawer
          approval={sampleApproval}
          onClose={handleClose}
          open={true}
          workspaceKey="property"
        />,
      );

      expect(screen.getByText("Persetujuan Proyek The Park")).toBeInTheDocument();

      const detailBtn = screen.getByRole("button", { name: /Buka Halaman Lengkap/i });
      fireEvent.click(detailBtn);
      expect(mockPush).toHaveBeenCalledWith("/workspace/property/approvals/appr_spk_001");
    });
  });

  // ==========================================
  // MODUL 2: DOKUMEN
  // ==========================================
  describe("MODUL 2: Dokumen (Documents)", () => {
    it("memastikan sidebar navigasi memuat Dokumen", () => {
      const sections = navigationForSession(false, "property");
      const workSection = sections.find((s) => s.label === "PEKERJAAN");
      const docItem = workSection?.items.find((item) => item.label === "Dokumen");
      expect(docItem).toBeDefined();
      expect(docItem?.href).toBe("/workspace/property/documents");
    });

    it("memetakan status dan klasifikasi dokumen dengan benar", () => {
      expect(getDocumentStatusInfo("DRAFT").label).toBe("Draf");
      expect(getDocumentStatusInfo("IN_REVIEW").label).toBe("Dalam Review");
      expect(getDocumentStatusInfo("APPROVED").label).toBe("Disetujui");
      expect(getDocumentStatusInfo("REJECTED").label).toBe("Ditolak");
      expect(getDocumentStatusInfo("RETIRED").label).toBe("Tidak Berlaku");
      expect(getDocumentStatusInfo("UNKNOWN").label).toBe("Belum Dinilai");
    });

    it("menampilkan pesan non-teknis jujur saat backend dokumen belum terhubung", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValueOnce(
        new ApiError(404, "Not Found", "corr_404"),
      );

      render(<DocumentsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Data Dokumen Belum Terhubung")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Data dokumen belum terhubung. Daftar dokumen akan ditampilkan setelah sumber data tersedia.",
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText("Belum ada dokumen yang dapat Anda akses.")).not.toBeInTheDocument();
    });

    it("membedakan kegagalan pemuatan dari sumber dokumen yang belum terhubung", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValueOnce(
        new ApiError(500, "Internal Server Error", "corr_500"),
      );

      render(<DocumentsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Data Dokumen Belum Dapat Dimuat")).toBeInTheDocument();
      });

      expect(screen.getByText("Data dokumen belum dapat dimuat. Silakan coba kembali.")).toBeInTheDocument();
      expect(screen.queryByText("Data Dokumen Belum Terhubung")).not.toBeInTheDocument();
      expect(screen.queryByText("Belum ada dokumen yang dapat Anda akses.")).not.toBeInTheDocument();
    });

    it("menjaga versi immutable dan TIDAK ADA tombol 'Edit Versi'", () => {
      render(<DocumentDetailView document={sampleDocument} workspaceKey="property" />);

      // Switch to Versi tab
      const versionTab = screen.getByRole("tab", { name: "Versi" });
      fireEvent.click(versionTab);

      expect(screen.getByText("Riwayat Versi Dokumen (Immutable)")).toBeInTheDocument();
      expect(screen.getByText(/Versi dokumen bersifat immutable/)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Edit Versi/i })).not.toBeInTheDocument();
      expect(screen.getByText("Hash Integritas: sha256:abcd1234efgh5678")).toBeInTheDocument();
    });

    it("menampilkan quick view drawer untuk dokumen", () => {
      const handleClose = vi.fn();
      render(
        <DocumentDrawer
          document={sampleDocument}
          onClose={handleClose}
          open={true}
          workspaceKey="property"
        />,
      );

      expect(screen.getByText("Site Plan Kawasan Residensial The Park")).toBeInTheDocument();
      expect(screen.getByText("Teknik & Arsitektur")).toBeInTheDocument();
    });
  });

  // ==========================================
  // MODUL 3: LAPORAN
  // ==========================================
  describe("MODUL 3: Laporan (Reports)", () => {
    it("memastikan sidebar navigasi memuat Laporan", () => {
      const sections = navigationForSession(false, "property");
      const workSection = sections.find((s) => s.label === "PEKERJAAN");
      const reportItem = workSection?.items.find((item) => item.label === "Laporan");
      expect(reportItem).toBeDefined();
      expect(reportItem?.href).toBe("/workspace/property/reports");
    });

    it("memetakan status laporan ke Bahasa Indonesia", () => {
      expect(getReportStatusInfo("DRAFT").label).toBe("Draf");
      expect(getReportStatusInfo("IN_REVIEW").label).toBe("Dalam Review");
      expect(getReportStatusInfo("APPROVED").label).toBe("Disetujui");
      expect(getReportStatusInfo("PUBLISHED").label).toBe("Diterbitkan");
      expect(getReportStatusInfo("ARCHIVED").label).toBe("Diarsipkan");
      expect(getReportStatusInfo("UNKNOWN").label).toBe("Belum Dinilai");
    });

    it("memisahkan tampilan primer Hasil Laporan dan Definisi Laporan", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([]);

      render(<ReportsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: "Hasil Laporan" })).toBeInTheDocument();
      });

      expect(screen.getByRole("tab", { name: "Definisi Laporan" })).toBeInTheDocument();
      // Default active is Hasil Laporan
      expect(screen.getByRole("tab", { name: "Hasil Laporan" })).toHaveAttribute("aria-selected", "true");
    });

    it("tidak ada tombol ekspor palsu (Unduh PDF / Unduh DOCX) pada detail laporan", () => {
      render(<ReportDetailView isConnected={true} report={sampleReportResult} workspaceKey="property" />);

      expect(screen.getByText("Laporan Kemajuan Mingguan Konstruksi W38")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Unduh PDF/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Unduh DOCX/i })).not.toBeInTheDocument();
    });

    it("menampilkan drawer untuk hasil laporan dan definisi laporan", () => {
      const handleClose = vi.fn();
      render(
        <ReportDrawer
          definition={sampleReportDefinition}
          onClose={handleClose}
          open={true}
          report={null}
          workspaceKey="property"
        />,
      );

      expect(screen.getByText("Laporan Kemajuan Proyek Mingguan")).toBeInTheDocument();
      expect(screen.getByText("Mingguan")).toBeInTheDocument();
    });
  });

  // ==========================================
  // MODUL 4: TEMUAN
  // ==========================================
  describe("MODUL 4: Temuan (Findings)", () => {
    it("memastikan sidebar navigasi memuat Temuan", () => {
      const sections = navigationForSession(false, "property");
      const workSection = sections.find((s) => s.label === "PEKERJAAN");
      const findingItem = workSection?.items.find((item) => item.label === "Temuan");
      expect(findingItem).toBeDefined();
      expect(findingItem?.href).toBe("/workspace/property/findings");
    });

    it("memetakan severity dan status temuan ke Bahasa Indonesia", () => {
      expect(getFindingSeverityInfo("LOW").label).toBe("Rendah");
      expect(getFindingSeverityInfo("MEDIUM").label).toBe("Sedang");
      expect(getFindingSeverityInfo("HIGH").label).toBe("Tinggi");
      expect(getFindingSeverityInfo("CRITICAL").label).toBe("Kritis");
      expect(getFindingSeverityInfo("UNKNOWN").label).toBe("Belum Dinilai");

      expect(getFindingStatusInfo("OPEN").label).toBe("Terbuka");
      expect(getFindingStatusInfo("IN_REVIEW").label).toBe("Belum Dinilai");
      expect(getFindingStatusInfo("ASSIGNED").label).toBe("Ditugaskan");
      expect(getFindingStatusInfo("IN_PROGRESS").label).toBe("Dalam Perbaikan");
      expect(getFindingStatusInfo("PENDING_VERIFICATION").label).toBe("Menunggu Verifikasi");
      expect(getFindingStatusInfo("VERIFIED").label).toBe("Terverifikasi");
      expect(getFindingStatusInfo("CLOSED").label).toBe("Ditutup");
    });

    it("menampilkan pesan non-teknis jujur saat backend temuan belum terhubung", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValueOnce(
        new ApiError(404, "Not Found", "corr_404"),
      );

      render(<FindingsPage workspaceKey="property" />);

      await waitFor(() => {
        expect(screen.getByText("Data Temuan Belum Terhubung")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Data temuan belum terhubung. Daftar temuan akan ditampilkan setelah sumber data tersedia.",
        ),
      ).toBeInTheDocument();
    });

    it("menghubungkan relasi corrective action ke Tugas perbaikan secara terstruktur", () => {
      render(<FindingDetailView finding={sampleFinding} workspaceKey="property" />);

      expect(screen.getByText("Saluran drainase primer tersumbat material urukan")).toBeInTheDocument();

      // Switch to Tindak Lanjut tab
      const correctiveTab = screen.getByRole("tab", { name: "Tindak Lanjut" });
      fireEvent.click(correctiveTab);

      expect(screen.getByText("Tindak Lanjut Temuan")).toBeInTheDocument();
      expect(screen.getByText("Pembersihan endapan drainase blok C")).toBeInTheDocument();
    });

    it("menampilkan quick view drawer untuk temuan", () => {
      const handleClose = vi.fn();
      render(
        <FindingDrawer
          finding={sampleFinding}
          onClose={handleClose}
          open={true}
          workspaceKey="property"
        />,
      );

      expect(screen.getByText("Saluran drainase primer tersumbat material urukan")).toBeInTheDocument();
      expect(screen.getByText("Tinggi")).toBeInTheDocument();

      const detailBtn = screen.getByRole("button", { name: /Buka Halaman Lengkap/i });
      fireEvent.click(detailBtn);
      expect(mockPush).toHaveBeenCalledWith("/workspace/property/findings/fnd_drainase_tersumbat");
    });
  });
});
