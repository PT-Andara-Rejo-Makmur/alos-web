import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  DecisionQueuePanel,
  DivisionHealthPanel,
  ExecutiveAIGovernancePanel,
  ExecutiveBriefStrip,
  ExecutiveBriefPage,
  ExecutiveDivisionsPage,
  ExecutiveApprovalsWorkspace,
  ExecutiveDashboardHome,
  ExecutiveDashboardPage,
  ExecutiveMetricGrid,
  ProjectDistributionPanel,
  formatMetricDisplayValue,
  projectDecisionQueue,
  projectDivisionHealth,
  projectExecutiveAIContext,
  projectExecutiveBrief,
  type ExecutiveDashboardSnapshot,
} from "@/features/executive-dashboard";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    void props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt || ""} />;
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/executive",
}));

const MOCK_SNAPSHOT: ExecutiveDashboardSnapshot = {
  generated_at: "2026-09-22T07:45:00.000Z",
  profile: {
    display_name: "Direktur Utama",
    organization_name: "PT Andara Rejo Makmur",
    role_label: "Direktur Utama",
  },
  metrics: [
    {
      key: "active_projects",
      label: "Proyek Aktif",
      value: 14,
      unit: "COUNT",
      tone: "INFO",
      state: "LIVE",
      context: "Seluruh divisi",
    },
    {
      key: "pending_approvals",
      label: "Keputusan Tertunda",
      value: 3,
      unit: "COUNT",
      tone: "WARNING",
      state: "LIVE",
      context: "Menunggu persetujuan",
    },
    {
      key: "average_progress",
      label: "Kemajuan Rata-Rata",
      value: 81.5,
      unit: "PERCENT",
      tone: "SUCCESS",
      state: "LIVE",
      context: "Agregasi portofolio",
    },
    {
      key: "overdue_tasks",
      label: "Indeks Kesehatan",
      value: null,
      unit: "COUNT",
      tone: "INFO",
      state: "NOT_CONNECTED",
      context: "9 lajur strategis belum terhubung",
    },
  ],
  performance: {
    title: "Kinerja Operasional 2026",
    context: "Indeks pencapaian target",
    points: [
      { period: "2026-07", label: "Jul", value: 70, decision_count: 3 },
      { period: "2026-08", label: "Agu", value: 80, decision_count: 6 },
      { period: "2026-09", label: "Sep", value: 85, decision_count: 4 },
    ],
  },
  project_distribution: {
    available: true,
    total: 14,
    context: "Distribusi status proyek",
    items: [
      { key: "ON_TRACK", label: "Tepat Waktu", count: 10, tone: "GREEN" },
      { key: "AT_RISK", label: "Beresiko", count: 3, tone: "AMBER" },
      { key: "CRITICAL", label: "Kritis", count: 1, tone: "RED" },
      { key: "COMPLETED", label: "Selesai", count: 0, tone: "BLUE" },
    ],
  },
  divisions: [
    {
      division_code: "OPR",
      division_name: "Operation",
      health: "HEALTHY",
      document_count: 20,
      pending_approvals: 0,
      active_genesis_workflows: 2,
    },
    {
      division_code: "COMM",
      division_name: "Commercial",
      health: "HEALTHY",
      document_count: 15,
      pending_approvals: 0,
      active_genesis_workflows: 1,
    },
    {
      division_code: "SEC",
      division_name: "Corporate Secretary & Legal",
      health: "ATTENTION",
      document_count: 12,
      pending_approvals: 1,
      active_genesis_workflows: 1,
    },
    {
      division_code: "FIN",
      division_name: "Finance",
      health: "NOT_CONNECTED",
      document_count: 0,
      pending_approvals: 0,
      active_genesis_workflows: 0,
    },
    {
      division_code: "TECH",
      division_name: "Technology / IT",
      health: "HEALTHY",
      document_count: 28,
      pending_approvals: 2,
      active_genesis_workflows: 4,
    },
    {
      division_code: "EXEC",
      division_name: "Holding / Executive",
      health: "HEALTHY",
      document_count: 8,
      pending_approvals: 0,
      active_genesis_workflows: 0,
    },
  ],
  attention_projects: [
    {
      project_id: "prj_001",
      name: "Pergudangan Tahap II",
      progress_percent: 38,
      status: "CRITICAL",
    },
    {
      project_id: "prj_002",
      name: "Izin AMDAL Terpadu",
      progress_percent: 55,
      status: "AT_RISK",
    },
  ],
  pending_approvals: [
    {
      approval_id: "appr_norm",
      kind: "DOCUMENT",
      title: "Persetujuan SOP Baru",
      requested_by: "Dewi",
      workspace_name: "Operation",
      submitted_at: "2026-09-22T08:00:00.000Z",
      age_days: 0,
      urgency: "NORMAL",
    },
    {
      approval_id: "appr_overdue",
      kind: "DOCUMENT",
      title: "Kontrak Vendor Baja",
      requested_by: "Budi",
      workspace_name: "Corporate Secretary",
      submitted_at: "2026-09-17T08:00:00.000Z",
      age_days: 5,
      urgency: "OVERDUE",
    },
    {
      approval_id: "appr_duesoon",
      kind: "AGENT_RELEASE",
      title: "Rilis Agent Risk v1",
      requested_by: "Hendro",
      workspace_name: "Technology / IT",
      submitted_at: "2026-09-20T08:00:00.000Z",
      age_days: 2,
      urgency: "DUE_SOON",
    },
  ],
};

describe("Executive / Director Dashboard ALOS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Brief Pagi 07.45
  it("merender Brief Pagi 07.45 dengan tepat 5 blok kesiapan operasional", () => {
    const blocks = projectExecutiveBrief(MOCK_SNAPSHOT);
    expect(blocks).toHaveLength(5);
    expect(blocks.map((b) => b.key)).toEqual([
      "health",
      "decisions",
      "early_warning",
      "cash",
      "agent_overnight",
    ]);

    render(<ExecutiveBriefStrip blocks={blocks} />);
    expect(screen.getByText("Brief Pagi 07.45")).toBeInTheDocument();
    expect(screen.getByText("Status Kesiapan Operasional")).toBeInTheDocument();
    expect(screen.getByText("Kesehatan")).toBeInTheDocument();
    expect(screen.getByText("Keputusan")).toBeInTheDocument();
    expect(screen.getByText("Early Warning")).toBeInTheDocument();
    expect(screen.getByText("Kas & Dompet")).toBeInTheDocument();
    expect(screen.getByText("Jejak Agent")).toBeInTheDocument();

    // Strategic targets are honestly marked NOT_CONNECTED
    expect(blocks.find((b) => b.key === "cash")?.state).toBe("NOT_CONNECTED");
    expect(blocks.find((b) => b.key === "agent_overnight")?.state).toBe("NOT_CONNECTED");
    expect(blocks.find((b) => b.key === "decisions")?.state).toBe("LIVE");
  });

  // 2. Metric Grid: Zero Fabrication for null values
  it("menampilkan em-dash ('—') dan BUKAN '0' jika metric.value bernilai null", () => {
    const nullMetric = {
      key: "overdue_tasks" as const,
      label: "Indeks Kesehatan",
      value: null,
      unit: "COUNT" as const,
      tone: "INFO" as const,
      state: "NOT_CONNECTED" as const,
      context: "9 lajur strategis belum terhubung",
    };

    expect(formatMetricDisplayValue(nullMetric)).toBe("—");

    render(<ExecutiveMetricGrid metrics={[nullMetric]} />);
    const valElem = screen.getByTestId("metric-value-overdue_tasks");
    expect(valElem.textContent).toBe("—");
    expect(valElem.textContent).not.toBe("0");
    expect(screen.getByText("9 lajur strategis belum terhubung")).toBeInTheDocument();
  });

  // 3. Metric Grid: Formats percent properly
  it("memformat metrik persentase dengan benar (e.g. 81,5%)", () => {
    const percentMetric = {
      key: "average_progress" as const,
      label: "Kemajuan Rata-Rata",
      value: 81.5,
      unit: "PERCENT" as const,
      tone: "SUCCESS" as const,
      state: "LIVE" as const,
      context: "Agregasi portofolio",
    };

    const formatted = formatMetricDisplayValue(percentMetric);
    expect(formatted).toMatch(/81[,.]5%/);
  });

  // 4. Decision Queue: Urgency Sorting (OVERDUE -> DUE_SOON -> NORMAL)
  it("mengurutkan Antrean Keputusan berdasarkan urgensi: OVERDUE -> DUE_SOON -> NORMAL", () => {
    const sorted = projectDecisionQueue(MOCK_SNAPSHOT);
    expect(sorted[0].approval_id).toBe("appr_overdue");
    expect(sorted[0].urgency).toBe("OVERDUE");
    expect(sorted[1].approval_id).toBe("appr_duesoon");
    expect(sorted[1].urgency).toBe("DUE_SOON");
    expect(sorted[2].approval_id).toBe("appr_norm");
    expect(sorted[2].urgency).toBe("NORMAL");
  });

  // 5. Decision Queue: Human Review Footnote & No Auto-Approve
  it("menampilkan footnote bahwa persetujuan material membutuhkan tinjauan manusia", () => {
    const items = projectDecisionQueue(MOCK_SNAPSHOT);
    render(<DecisionQueuePanel items={items} />);

    expect(
      screen.getByText(/Seluruh persetujuan material membutuhkan tinjauan manusia/i),
    ).toBeInTheDocument();
    // Detail button navigates to approvals
    const detailLinks = screen.getAllByRole("link", { name: /Lihat Detail/i });
    expect(detailLinks.length).toBe(3);
  });

  // 6. Decision Queue: Empty state
  it("menampilkan empty state yang jelas jika antrean keputusan kosong", () => {
    render(<DecisionQueuePanel items={[]} />);
    expect(
      screen.getByText("Tidak ada antrean keputusan yang menunggu persetujuan Direktur saat ini."),
    ).toBeInTheDocument();
  });

  // 7. Division Health: 6 divisions with honest health status
  it("merender 6 divisi dengan status kesehatan yang jujur (NOT_CONNECTED = netral)", () => {
    const divisionItems = projectDivisionHealth(MOCK_SNAPSHOT);
    expect(divisionItems).toHaveLength(6);

    render(<DivisionHealthPanel divisions={divisionItems} />);
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("Commercial")).toBeInTheDocument();
    expect(screen.getByText("Corporate Secretary & Legal")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("Technology / IT")).toBeInTheDocument();
    expect(screen.getByText("Holding / Executive")).toBeInTheDocument();

    const finCard = screen.getByTestId("division-health-FIN");
    expect(finCard.textContent).toContain("Belum terhubung");
  });

  // 8. Project Distribution: Donut Chart
  it("merender Donut Chart dengan total dan legend distribusi proyek", () => {
    render(<ProjectDistributionPanel distribution={MOCK_SNAPSHOT.project_distribution} />);
    expect(screen.getByTestId("donut-total").textContent).toBe("14");
    expect(screen.getByText(/Tepat Waktu:/i)).toBeInTheDocument();
    expect(screen.getByText(/Beresiko:/i)).toBeInTheDocument();
    expect(screen.getByText(/Kritis:/i)).toBeInTheDocument();
  });

  // 9. Project Distribution: Fallback when unavailable
  it("menampilkan '—' pada donut center text jika distribusi proyek belum tersedia", () => {
    const unavailableDist = {
      available: false,
      total: 0,
      context: "Data portofolio belum terhubung",
      items: [],
    };
    render(<ProjectDistributionPanel distribution={unavailableDist} />);
    expect(screen.getByTestId("donut-total").textContent).toBe("—");
  });

  // 10. AI & Governance Context: Zero fake numbers, sum workflows correctly
  it("menghitung total alur kerja aktif secara jujur dan TIDAK menampilkan angka palsu 710", () => {
    const aiContext = projectExecutiveAIContext(MOCK_SNAPSHOT);
    // Sum from divisions: 2 + 1 + 1 + 0 + 4 + 0 = 8
    expect(aiContext.activeWorkflows).toBe(8);
    expect(aiContext.evidenceLineageStatus).toBe("Belum tersedia");

    render(<ExecutiveAIGovernancePanel aiContext={aiContext} />);
    expect(screen.getByTestId("ai-active-workflows").textContent).toBe("8");
    expect(screen.getByText("Belum tersedia")).toBeInTheDocument();

    // Verify 710 agent number does NOT exist
    expect(screen.queryByText("710")).not.toBeInTheDocument();
    expect(screen.queryByText(/710 Agen/i)).not.toBeInTheDocument();
  });

  // 11. Attention Projects: Lists projects needing attention
  it("merender daftar proyek yang membutuhkan perhatian", () => {
    render(<ExecutiveDashboardHome snapshot={MOCK_SNAPSHOT} />);
    expect(screen.getByText("Pergudangan Tahap II")).toBeInTheDocument();
    expect(screen.getByText(/Kemajuan saat ini: 38%/i)).toBeInTheDocument();
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText("Izin AMDAL Terpadu")).toBeInTheDocument();
  });

  // 12. Security & RBAC: Redirect to /login on 401 unauthenticated
  it("mengarahkan ke /login jika pengguna tidak terautentikasi (401)", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });

    render(<ExecutiveDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 13. Security & RBAC: Controlled 403 Access Denied without organizational-title claims
  it("menampilkan controlled state 403 tanpa mengklaim jabatan organisasi", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_staff_01",
        email: "staff@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["PROPERTY"],
        workspace_ids: ["ws_prop_01"],
      },
    });

    render(<ExecutiveDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Akses Dibatasi")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Halaman ini merupakan Executive Command Center/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali ke Ruang Kerja Saya/i })).toBeInTheDocument();
  });

  // 14. Full Page Integration: Renders all 8 core sections in exact canonical order
  it("merender seluruh komponen utama dalam ExecutiveDashboardHome sesuai 8 urutan kanonis Pusat Kendali Eksekutif", () => {
    render(<ExecutiveDashboardHome snapshot={MOCK_SNAPSHOT} />);

    // Header & Title
    expect(screen.getByText("PUSAT KENDALI EKSEKUTIF")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pusat Kendali Eksekutif", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ringkasan strategis, kondisi operasional, keputusan, dan perhatian lintas divisi PT Andara Rejo Makmur/i),
    ).toBeInTheDocument();

    // 1. Waktu pembaruan data
    expect(screen.getByLabelText("Waktu Pembaruan Data")).toBeInTheDocument();

    // 2. Strategi & Kinerja Perusahaan
    expect(screen.getByLabelText("Strategi & Kinerja Perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Sumber KPI dan sasaran perusahaan belum tersedia.")).toBeInTheDocument();

    // 3. Ringkasan Operasional
    expect(screen.getByLabelText("Ringkasan Operasional")).toBeInTheDocument();

    // 4. Keputusan yang Membutuhkan Perhatian
    expect(screen.getByLabelText("Keputusan yang Membutuhkan Perhatian")).toBeInTheDocument();

    // 5. Status Operasional Divisi
    expect(screen.getByLabelText("Status Operasional Divisi")).toBeInTheDocument();

    // 6. Peringatan Dini
    expect(screen.getByLabelText("Peringatan Dini")).toBeInTheDocument();

    // 7. Portofolio Pekerjaan
    expect(screen.getByLabelText("Portofolio Pekerjaan")).toBeInTheDocument();

    // 8. Bantuan ARA
    expect(screen.getByLabelText("Bantuan ARA")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buka ARA/i })).toBeInTheDocument();
  });

  // 15. Kebijakan Kinerja: Kemajuan proyek tidak disebut sebagai KPI dan sasaran
  it("membedakan kemajuan pekerjaan dengan capaian KPI & sasaran secara tegas dan jujur", () => {
    render(<ExecutiveDashboardHome snapshot={MOCK_SNAPSHOT} />);

    // Kemajuan Pekerjaan shows progress (81,5%)
    expect(screen.getByText("Kemajuan Pekerjaan")).toBeInTheDocument();
    expect(screen.getAllByText("81,5%").length).toBeGreaterThanOrEqual(1);

    // Capaian KPI and Capaian Sasaran explicitly show em-dash '—'
    expect(screen.getByText("Capaian KPI")).toBeInTheDocument();
    expect(screen.getByText("Capaian Sasaran")).toBeInTheDocument();
    expect(
      screen.getByText("Sumber KPI dan sasaran perusahaan belum tersedia."),
    ).toBeInTheDocument();
  });

  // 16. Kesalahan memuat data tidak disamarkan sebagai data kosong
  it("menampilkan pesan error manusiawi dan TIDAK menyamarkan kegagalan memuat sebagai data kosong", async () => {
    const { canonicalPrincipal } = await import("./helpers/canonical-session");
    const principal = canonicalPrincipal({
      actorId: "usr_dir_01",
      divisionCode: "EXEC",
      workspaceId: "ws_exec_01",
      workspaceKey: "executive",
      workspaceName: "Executive Workspace",
      roles: ["EXECUTIVE"],
    });

    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal,
    });

    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (url: string) => {
      if (url === "/api/v1/executive-dashboard") {
        throw new Error("Network connection lost");
      }
      return [] as never;
    });

    render(<ExecutiveDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Ringkasan eksekutif belum dapat dimuat. Silakan coba lagi beberapa saat."),
      ).toBeInTheDocument();
    });

    // Verify Muat Ulang button is provided
    expect(screen.getByRole("button", { name: /Muat Ulang/i })).toBeInTheDocument();
  });

  // 17. Halaman Brief Eksekutif: 5 bagian utama dan status BELUM TERHUBUNG
  it("merender Halaman Brief Eksekutif dengan 5 area fokus dan penandaan BELUM TERHUBUNG yang jujur", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (url: string) => {
      if (url === "/api/v1/executive-dashboard") return MOCK_SNAPSHOT;
      return {} as never;
    });

    render(<ExecutiveBriefPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Brief Eksekutif", level: 1 })).toBeInTheDocument();
    });

    // 1. Kondisi Operasional
    expect(screen.getByLabelText("Kondisi Operasional")).toBeInTheDocument();

    // 2. Antrean Keputusan
    expect(screen.getByLabelText("Antrean Keputusan")).toBeInTheDocument();

    // 3. Peringatan Dini
    expect(screen.getByLabelText("Peringatan Dini")).toBeInTheDocument();

    // 4. Posisi Kas & Likuiditas (BELUM TERHUBUNG)
    expect(screen.getByLabelText("Posisi Kas & Likuiditas")).toBeInTheDocument();
    expect(screen.getAllByText("BELUM TERHUBUNG").length).toBeGreaterThanOrEqual(1);

    // 5. Aktivitas GENESIS
    expect(screen.getByLabelText("Aktivitas GENESIS")).toBeInTheDocument();
  });

  // 18. Halaman Divisi: 5 bagian utama tanpa skor buatan
  it("merender Halaman Divisi dengan status operasional lintas divisi tanpa skor buatan", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (url: string) => {
      if (url === "/api/v1/executive-dashboard") return MOCK_SNAPSHOT;
      return {} as never;
    });

    render(<ExecutiveDivisionsPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Status Divisi", level: 1 })).toBeInTheDocument();
    });

    // 1. Ringkasan Divisi
    expect(screen.getByLabelText("Ringkasan Divisi")).toBeInTheDocument();

    // 2. Divisi yang Membutuhkan Perhatian
    expect(screen.getByLabelText("Divisi yang Membutuhkan Perhatian")).toBeInTheDocument();

    // 3. Persetujuan Menunggu
    expect(screen.getByLabelText("Persetujuan Menunggu Lintas Divisi")).toBeInTheDocument();

    // 4. Aktivitas GENESIS
    expect(screen.getByLabelText("Aktivitas GENESIS Lintas Divisi")).toBeInTheDocument();

    // 5. Status Ketersediaan Data
    expect(screen.getByLabelText("Status Ketersediaan Data")).toBeInTheDocument();

    // Verify no fake scores
    expect(screen.queryByText(/skor kesehatan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/skor risiko/i)).not.toBeInTheDocument();
  });

  // 19. Persetujuan Rilis GENESIS untuk Director: 4 opsi keputusan & validasi alasan
  it("merender Persetujuan Rilis GENESIS untuk Direktur dengan 4 opsi keputusan dan validasi alasan", async () => {
    const { fireEvent } = await import("@testing-library/react");

    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (url: string) => {
      if (url === "/api/v1/executive-dashboard") {
        return MOCK_SNAPSHOT;
      }
      if (url.includes("/api/v1/releases/")) {
        return {
          release_id: "appr_duesoon",
          review_id: "rev_001",
          subject_id: "Risk Analysis Capability",
          subject_version: "v1.2.0",
          state: "READY_FOR_DIRECTOR",
          correlation_id: "corr_01",
          kill_switch_active: false,
          rollback_target_release_id: null,
          ever_released: false,
          materiality: "MATERIAL",
        };
      }
      if (url === "/api/v1/dashboard/operational") {
        return { approvals: [] };
      }
      if (url === "/api/v1/proposed-actions") {
        return [];
      }
      return {};
    });

    render(
      <ExecutiveApprovalsWorkspace
        activeWorkspace={{
          workspaceId: "ws_exec",
          workspaceKey: "executive",
          workspaceLabel: "Executive Workspace",
          divisionCode: "EXECUTIVE",
        }}
      />,
    );

    // Switch to GENESIS tab
    const genesisTab = screen.getByRole("tab", { name: /Persetujuan Rilis GENESIS/i });
    fireEvent.click(genesisTab);

    await waitFor(() => {
      expect(screen.getByText("Rilis Agent Risk v1")).toBeInTheDocument();
    });

    // Check 4 Decision radio options are present
    expect(screen.getByText("Setujui")).toBeInTheDocument();
    expect(screen.getByText("Kembalikan untuk Perbaikan")).toBeInTheDocument();
    expect(screen.getByText("Tolak")).toBeInTheDocument();
    expect(screen.getByText("Tahan")).toBeInTheDocument();

    // Submit without selecting decision -> validation message
    const submitBtn = screen.getByRole("button", { name: /Simpan Keputusan/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Pilih keputusan terlebih dahulu.")).toBeInTheDocument();

    // Select 'Setujui' but leave rationale empty -> validation message
    const setujuiRadio = screen.getByLabelText("Setujui");
    fireEvent.click(setujuiRadio);
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Tambahkan alasan keputusan sebelum melanjutkan."),
    ).toBeInTheDocument();
  });

  // 20. Navigasi Executive tidak memiliki menu teknis GENESIS
  it("tidak menampilkan menu teknis GENESIS pada navigasi Executive", async () => {
    const { projectWorkspaceNavigation } = await import(
      "@/features/workspace-shell/workspace-navigation"
    );
    const mockActor = {
      user_id: "usr_exec_01",
      organization_id: "org_andara",
      roles: ["EXECUTIVE"],
      division_codes: ["EXECUTIVE"],
      workspace_ids: ["ws_exec"],
      issued_at: "2026-09-24T00:00:00Z",
      expires_at: "2026-09-25T00:00:00Z",
    };

    const nav = projectWorkspaceNavigation(
      {
        workspaceId: "ws_exec",
        workspaceKey: "executive",
        workspaceLabel: "Executive Workspace",
        divisionCode: "EXECUTIVE",
        roleLabel: "Direktur",
      },
      mockActor,
    );

    const genesisItem = nav.find(
      (item) => item.key === "genesis" || item.label.toUpperCase() === "GENESIS",
    );
    expect(genesisItem).toBeUndefined();

    // Verify ARA is present under AI
    const araItem = nav.find((item) => item.key === "ara");
    expect(araItem).toBeDefined();
    expect(araItem?.group).toBe("AI");
  });
});

