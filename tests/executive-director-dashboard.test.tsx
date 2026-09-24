import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  DecisionQueuePanel,
  DivisionHealthPanel,
  ExecutiveAIGovernancePanel,
  ExecutiveBriefStrip,
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

  // 14. Full Page Integration: Renders all core sections in IA order
  it("merender seluruh komponen utama dalam ExecutiveDashboardHome sesuai Information Architecture", () => {
    render(<ExecutiveDashboardHome snapshot={MOCK_SNAPSHOT} />);

    // 1. Breadcrumb & Title
    expect(screen.getByText("EXECUTIVE COMMAND CENTER")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Executive Command Center", level: 1 })).toBeInTheDocument();

    // 2. 07.45 Brief Strip
    expect(screen.getByLabelText("Brief Pagi 07.45")).toBeInTheDocument();

    // 3. 4 Health Metric Cards
    expect(screen.getByLabelText("Metrik Kesehatan Perusahaan")).toBeInTheDocument();

    // 4. Middle Split
    expect(screen.getByLabelText("Antrean Keputusan")).toBeInTheDocument();
    expect(screen.getByLabelText("Kesehatan Organisasi & Divisi")).toBeInTheDocument();

    // 5. Bottom Grid
    expect(screen.getByLabelText("Tren Kinerja Perusahaan")).toBeInTheDocument();
    expect(screen.getByLabelText("Distribusi Portofolio Proyek")).toBeInTheDocument();
    expect(screen.getByLabelText("Konteks AI dan Tata Kelola")).toBeInTheDocument();

    // 6. Early Warning Projects
    expect(screen.getByLabelText("Proyek yang Membutuhkan Perhatian")).toBeInTheDocument();
  });
});
