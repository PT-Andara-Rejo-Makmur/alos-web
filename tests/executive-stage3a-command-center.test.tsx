import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BusinessTarget, StrategyPlan } from "@/lib/contracts";
import {
  EXECUTIVE_DATA_REQUIREMENTS,
  ExecutiveDashboardHome,
  ExecutiveDashboardSkeleton,
  ExecutiveProgress,
  formatMetricDisplayValue,
  projectCorporateTargets,
  translateLifecycleState,
  translatePerformanceState,
  translateSourceReadiness,
  translateVerificationState,
  type ExecutiveDashboardSnapshot,
} from "@/features/executive-dashboard";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter = { push: mockPush, replace: mockReplace };

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/executive",
}));

const MOCK_STAGE3A_SNAPSHOT: ExecutiveDashboardSnapshot = {
  generated_at: "2026-09-27T10:00:00.000Z",
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
      label: "Keputusan Menunggu",
      value: 3,
      unit: "COUNT",
      tone: "WARNING",
      state: "LIVE",
      context: "Menunggu persetujuan",
    },
    {
      key: "average_progress",
      label: "Kemajuan Pekerjaan",
      value: 81.5,
      unit: "PERCENT",
      tone: "SUCCESS",
      state: "LIVE",
      context: "Agregasi portofolio",
    },
    {
      key: "overdue_tasks",
      label: "Tugas Terlambat",
      value: null,
      unit: "COUNT",
      tone: "INFO",
      state: "NOT_CONNECTED",
      context: "Belum terhubung",
    },
  ],
  performance: {
    title: "Kinerja Operasional 2026",
    context: "Indeks pencapaian target",
    points: [
      { period: "2026-07", label: "Jul", value: 70, decision_count: 3 },
      { period: "2026-08", label: "Agu", value: 80, decision_count: 6 },
    ],
  },
  project_distribution: {
    available: true,
    total: 14,
    context: "Distribusi status proyek",
    items: [
      { key: "ON_TRACK", label: "Tepat Waktu", count: 10, tone: "GREEN" },
      { key: "AT_RISK", label: "Berisiko", count: 3, tone: "AMBER" },
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
      approval_id: "appr_01",
      kind: "DOCUMENT",
      title: "Persetujuan SOP Baru",
      requested_by: "Dewi",
      workspace_name: "Operation",
      submitted_at: "2026-09-22T08:00:00.000Z",
      age_days: 0,
      urgency: "NORMAL",
    },
    {
      approval_id: "appr_02",
      kind: "DOCUMENT",
      title: "Kontrak Vendor Baja",
      requested_by: "Budi",
      workspace_name: "Corporate Secretary",
      submitted_at: "2026-09-17T08:00:00.000Z",
      age_days: 5,
      urgency: "OVERDUE",
    },
  ],
};

const MOCK_STAGE2_PLAN: StrategyPlan = {
  plan_id: "plan-rkap-2027",
  version: 1,
  tenant_id: "tenant-1",
  organization_id: "org-1",
  plan_type: "OPERATING_PLAN",
  name: "RKAP Perusahaan 2027",
  owner_workspace_id: "executive",
  owner_role_ref: "EXECUTIVE",
  period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31", label: "2027" },
  scope: { type: "COMPANY", ref: null },
  lifecycle_state: "ACTIVE",
  materiality: "MATERIAL",
  source_refs: [],
  evidence_refs: [],
  created_by: "director",
  created_at: "2026-09-27T00:00:00Z",
  updated_at: "2026-09-27T00:00:00Z",
  correlation_id: "corr-plan",
  authorized_actions: [],
};

const MOCK_STAGE2_TARGETS: readonly BusinessTarget[] = [
  {
    target_id: "target-closing",
    version: 1,
    tenant_id: "tenant-1",
    organization_id: "org-1",
    code: "KPI-SM-01",
    name: "Penjualan Rumah Klaten",
    plan_ref: { id: "plan-rkap-2027", version: 1 },
    objective_ref: null,
    metric_code: "KPI-SM-01",
    scope: { type: "DIVISION", ref: "sales" },
    period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31", label: "2027" },
    measurement_type: "HIGHER_IS_BETTER",
    unit: "COUNT",
    owner_workspace_id: "sales",
    owner_role_ref: "WORKSPACE_LEAD",
    materiality: "MATERIAL",
    lifecycle_state: "ACTIVE",
    performance_state: "AT_RISK",
    evidence_refs: ["ev-01"],
    source_refs: ["source-sales"],
    created_by: "director",
    created_at: "2026-09-27T00:00:00Z",
    updated_at: "2026-09-27T00:00:00Z",
    observations: [
      {
        observation_id: "obs-target-1",
        tenant_id: "tenant-1",
        organization_id: "org-1",
        target_id: "target-closing",
        target_version: 1,
        kind: "TARGET",
        value: 12,
        unit: "COUNT",
        period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31" },
        source_mode: "MANUAL_EVIDENCED",
        observed_at: "2026-09-27T00:00:00Z",
        verification_state: "VERIFIED",
        evidence_refs: ["ev-01"],
      },
      {
        observation_id: "obs-actual-1",
        tenant_id: "tenant-1",
        organization_id: "org-1",
        target_id: "target-closing",
        target_version: 1,
        kind: "ACTUAL",
        value: 7,
        unit: "COUNT",
        period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31" },
        source_mode: "MANUAL_EVIDENCED",
        observed_at: "2026-09-27T00:00:00Z",
        verification_state: "VERIFIED",
        evidence_refs: ["ev-02"],
      },
      {
        observation_id: "obs-forecast-1",
        tenant_id: "tenant-1",
        organization_id: "org-1",
        target_id: "target-closing",
        target_version: 1,
        kind: "FORECAST",
        value: 10,
        unit: "COUNT",
        period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31" },
        source_mode: "MANUAL_EVIDENCED",
        observed_at: "2026-09-27T00:00:00Z",
        verification_state: "PENDING_VERIFICATION",
        evidence_refs: [],
      },
    ],
  },
  {
    target_id: "target-rev",
    version: 1,
    tenant_id: "tenant-1",
    organization_id: "org-1",
    code: "HEADLINE-REVENUE",
    name: "Pendapatan Usaha Bruto",
    plan_ref: { id: "plan-rkap-2027", version: 1 },
    objective_ref: null,
    metric_code: "HEADLINE-REVENUE",
    scope: { type: "COMPANY", ref: null },
    period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31", label: "2027" },
    measurement_type: "CUMULATIVE",
    unit: "IDR",
    owner_workspace_id: "finance",
    owner_role_ref: "WORKSPACE_LEAD",
    materiality: "MATERIAL",
    lifecycle_state: "ACTIVE",
    performance_state: "NOT_EVALUATED",
    evidence_refs: [],
    source_refs: [],
    created_by: "director",
    created_at: "2026-09-27T00:00:00Z",
    updated_at: "2026-09-27T00:00:00Z",
    observations: [
      {
        observation_id: "obs-rev-target",
        tenant_id: "tenant-1",
        organization_id: "org-1",
        target_id: "target-rev",
        target_version: 1,
        kind: "TARGET",
        value: 15000000000,
        unit: "IDR",
        period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31" },
        source_mode: "MANUAL_EVIDENCED",
        observed_at: "2026-09-27T00:00:00Z",
        verification_state: "VERIFIED",
        evidence_refs: [],
      },
    ],
  },
];

describe("ALOS MVP-2 Stage 3A: Finalisasi Executive Command Center", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Render seluruh seksi kanonis Stage 3A
  it("merender seluruh 15 seksi kanonis Pusat Kendali Eksekutif", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    // 01. Header
    expect(screen.getByRole("heading", { name: "Pusat Kendali Eksekutif", level: 1 })).toBeInTheDocument();
    // 02. Status Data
    expect(screen.getByLabelText("Status Kesiapan Data Perusahaan")).toBeInTheDocument();
    // 03. Ringkasan Utama
    expect(screen.getByLabelText("Ringkasan Utama Perusahaan")).toBeInTheDocument();
    // 04. Target Perusahaan
    expect(screen.getByLabelText("Pencapaian Target Perusahaan")).toBeInTheDocument();
    // 05-10. Domain Operasional
    expect(screen.getByLabelText("Ringkasan Domain Operasional")).toBeInTheDocument();
    // 11. Peringatan Dini
    expect(screen.getByLabelText("Peringatan Dini")).toBeInTheDocument();
    // 12. Keputusan Menunggu
    expect(screen.getByLabelText("Keputusan yang Membutuhkan Perhatian")).toBeInTheDocument();
    // 13. Status Divisi
    expect(screen.getByLabelText("Status Operasional Divisi")).toBeInTheDocument();
    // 14. Analisis GENESIS
    expect(screen.getByLabelText("Analisis GENESIS")).toBeInTheDocument();
    // 15. Ritme Pelaporan & Tata Kelola
    expect(screen.getByLabelText("Ritme Pelaporan & Tata Kelola")).toBeInTheDocument();
  });

  // 2. Seluruh heading utama Bahasa Indonesia
  it("seluruh heading utama menggunakan Bahasa Indonesia yang baku dan bebas dari teks AI slop", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    expect(screen.getByText("Pusat Kendali Eksekutif")).toBeInTheDocument();
    expect(screen.getByText("Status Data")).toBeInTheDocument();
    expect(screen.getByText("Ringkasan Utama Perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Pencapaian Target Perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Ringkasan Domain Operasional")).toBeInTheDocument();
    expect(screen.getByText("Peringatan Dini")).toBeInTheDocument();
    expect(screen.getByText("Keputusan yang Membutuhkan Perhatian")).toBeInTheDocument();
    expect(screen.getByText("Status Operasional Divisi")).toBeInTheDocument();
    expect(screen.getByText("Analisis GENESIS")).toBeInTheDocument();
    expect(screen.getByText("Ritme Pelaporan & Tata Kelola")).toBeInTheDocument();

    // Verify AI Slop buzzwords do not exist
    expect(screen.queryByText(/AI Powered/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Supercharged/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next Generation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Smart Intelligence/i)).not.toBeInTheDocument();
  });

  // 3. Stage 1 scaffolding dihapus dari UI produksi
  it("tidak lagi menampilkan scaffolding BusinessDashboardFoundation pada tampilan produksi", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    expect(screen.queryByText("Arsitektur Informasi Stage 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Definisi KPI")).not.toBeInTheDocument();
    expect(screen.queryByText("Target, Actual, Forecast & Assumption")).not.toBeInTheDocument();
  });

  // 4. Data target Stage 2 terhubung dan authoritative
  it("menampilkan target perusahaan dari Stage 2 Strategy API secara authoritative", () => {
    const rows = projectCorporateTargets(MOCK_STAGE2_TARGETS);
    expect(rows).toHaveLength(2);

    const closingRow = rows.find((r) => r.code === "KPI-SM-01");
    expect(closingRow).toBeDefined();
    expect(closingRow?.targetDisplay).toBe("12");
    expect(closingRow?.actualDisplay).toBe("7");
    expect(closingRow?.forecastDisplay).toBe("10");
    expect(closingRow?.varianceDisplay).toBe("-5");
    expect(closingRow?.achievementPercent).toBeCloseTo(58.33, 1);
    expect(closingRow?.statusLabel).toBe("Berisiko");
    expect(closingRow?.verificationLabel).toBe("Terverifikasi");

    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    expect(screen.getByText("Penjualan Rumah Klaten")).toBeInTheDocument();
    expect(screen.getByText("KPI-SM-01")).toBeInTheDocument();
    expect(screen.getByText("58,3%")).toBeInTheDocument();
  });

  // 5. Target, Actual, Forecast, Assumption tidak tercampur
  it("memisahkan Target, Aktual, Perkiraan secara ketat tanpa mencampur nilai", () => {
    const rows = projectCorporateTargets(MOCK_STAGE2_TARGETS);
    const revRow = rows.find((r) => r.code === "HEADLINE-REVENUE");
    expect(revRow?.targetDisplay).toBe("Rp15.000.000.000");
    // Actual and forecast are null for revenue (source not connected)
    expect(revRow?.actualDisplay).toBe("—");
    expect(revRow?.forecastDisplay).toBe("—");
    expect(revRow?.varianceDisplay).toBe("—");
    expect(revRow?.achievementPercent).toBeNull();
  });

  // 6. Null tidak pernah berubah menjadi nol
  it("tidak mengubah null menjadi nol (menampilkan em-dash '—')", () => {
    expect(formatMetricDisplayValue({ key: "k", label: "L", value: null, unit: "COUNT", tone: "INFO", state: "NOT_CONNECTED", context: "" })).toBe("—");

    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    // Kas & Likuiditas has null actual -> must show em-dash
    const cashValue = screen.getByTestId("headline-value-cash");
    expect(cashValue.textContent).toBe("—");
    expect(cashValue.textContent).not.toBe("0");
    expect(cashValue.textContent).not.toBe("Rp0");
  });

  // 7. Missing source tampil "Belum Terhubung"
  it("menampilkan status 'Belum Terhubung' secara tegas untuk sumber data yang belum ada", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    const headlineRev = screen.getByTestId("headline-card-revenue");
    expect(headlineRev.textContent).toContain("Belum Terhubung");
    expect(headlineRev.textContent).toContain("Sumber data aktual belum terhubung.");

    const domainSales = screen.getByTestId("domain-card-sales");
    expect(domainSales.textContent).toContain("Belum Terhubung");

    const domainFinance = screen.getByTestId("domain-card-finance");
    expect(domainFinance.textContent).toContain("Belum Terhubung");
  });

  // 8. Translation mapping Bahasa Indonesia
  it("memetakan seluruh status enum ke Bahasa Indonesia baku", () => {
    expect(translateSourceReadiness("NOT_CONNECTED")).toBe("Belum Terhubung");
    expect(translateSourceReadiness("LIVE")).toBe("Terkini");
    expect(translateSourceReadiness("PARTIAL")).toBe("Sebagian Tersedia");
    expect(translateSourceReadiness("STALE")).toBe("Perlu Diperbarui");
    expect(translateSourceReadiness("ERROR")).toBe("Gagal Memuat");

    expect(translatePerformanceState("ON_TRACK")).toBe("Sesuai Target");
    expect(translatePerformanceState("AT_RISK")).toBe("Berisiko");
    expect(translatePerformanceState("OFF_TRACK")).toBe("Tidak Sesuai Target");
    expect(translatePerformanceState("ACHIEVED")).toBe("Tercapai");
    expect(translatePerformanceState("NOT_EVALUATED")).toBe("Belum Dinilai");

    expect(translateVerificationState("VERIFIED")).toBe("Terverifikasi");
    expect(translateVerificationState("PENDING_VERIFICATION")).toBe("Menunggu Verifikasi");
    expect(translateVerificationState("UNVERIFIED")).toBe("Belum Diverifikasi");
    expect(translateVerificationState("CONFLICT")).toBe("Data Tidak Sesuai");
    expect(translateVerificationState("REJECTED")).toBe("Ditolak");

    expect(translateLifecycleState("DRAFT")).toBe("Draf");
    expect(translateLifecycleState("ACTIVE")).toBe("Aktif");
    expect(translateLifecycleState("APPROVED")).toBe("Disetujui");
    expect(translateLifecycleState("UNDER_REVIEW")).toBe("Dalam Peninjauan");
  });

  // 9. Loading Skeleton dengan progress request nyata
  it("merender skeleton loading dan progress bar berbasis sumber nyata, bukan timer", () => {
    const tasks = [
      { id: "auth", label: "Konteks pengguna & otorisasi", completed: true },
      { id: "strategy", label: "Rencana & target perusahaan", completed: true },
      { id: "operational", label: "Ringkasan operasional eksekutif", completed: false },
    ];

    render(
      <ExecutiveDashboardSkeleton
        loadingTasks={tasks}
        completedCount={2}
        totalCount={3}
        percent={67}
      />,
    );

    expect(screen.getByText("Menyiapkan Pusat Kendali Eksekutif")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return (
          element?.tagName.toLowerCase() === "p" &&
          element.textContent?.includes("2 dari 3 selesai (67%)") === true
        );
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Konteks pengguna & otorisasi")).toBeInTheDocument();
    expect(screen.getByText("Rencana & target perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Ringkasan operasional eksekutif")).toBeInTheDocument();
  });

  // 10. Progress Component denominator safe & no NaN
  it("mencegah pembagian dengan nol atau NaN pada ExecutiveProgress", () => {
    // target 0 -> does not render progress bar
    const { container: c1 } = render(<ExecutiveProgress current={5} target={0} />);
    expect(c1.firstChild).toBeNull();

    // target null -> does not render
    const { container: c2 } = render(<ExecutiveProgress current={5} target={null} />);
    expect(c2.firstChild).toBeNull();

    // valid denominator -> renders safely
    const { container: c3 } = render(<ExecutiveProgress current={7} target={12} label="Closing" />);
    expect(c3.textContent).toContain("58,3%");
    expect(c3.textContent).not.toContain("NaN");
    expect(c3.textContent).not.toContain("Infinity");
  });

  // 11. Detail drawer terbuka saat memilih target atau status sumber
  it("membuka drawer rincian saat mengklik 'Lihat Rincian' target dan menutupnya dengan Escape", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    // Drawer is closed initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click 'Lihat Rincian' button on closing target
    const detailButtons = screen.getAllByRole("button", { name: /Lihat rincian target/i });
    fireEvent.click(detailButtons[0]);

    // Drawer opens
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Rincian Target: Penjualan Rumah Klaten/i)).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // 12. Drawer status sumber
  it("membuka drawer status sumber data saat mengklik 'Lihat Status Sumber'", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    const sourceBtn = screen.getByRole("button", { name: /Lihat Status Sumber/i });
    fireEvent.click(sourceBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Status Sumber Data Perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Rencana & Target Perusahaan (Stage 2)")).toBeInTheDocument();
  });

  // 13. Data requirement registry mencakup seluruh 16 kebutuhan eksekutif
  it("Executive Data Requirement Registry mendefinisikan 16 kebutuhan data bisnis eksekutif secara lengkap", () => {
    expect(EXECUTIVE_DATA_REQUIREMENTS).toHaveLength(16);
    const ids = EXECUTIVE_DATA_REQUIREMENTS.map((r) => r.id);
    expect(ids).toContain("executive.headline.revenue");
    expect(ids).toContain("executive.headline.closing");
    expect(ids).toContain("executive.headline.liquidity");
    expect(ids).toContain("executive.headline.delivery");
    expect(ids).toContain("executive.headline.decisions");
    expect(ids).toContain("executive.headline.risk");
    expect(ids).toContain("executive.corporate.targets");
    expect(ids).toContain("executive.domain.sales");
    expect(ids).toContain("executive.domain.finance");
    expect(ids).toContain("executive.domain.property");
    expect(ids).toContain("executive.domain.legal");
    expect(ids).toContain("executive.domain.hr");
    expect(ids).toContain("executive.domain.it");
    expect(ids).toContain("executive.division.health");
    expect(ids).toContain("executive.genesis.analysis");
    expect(ids).toContain("executive.governance.cadence");

    // All requirements must have non-empty business purpose and owner domain
    for (const req of EXECUTIVE_DATA_REQUIREMENTS) {
      expect(req.business_purpose.length).toBeGreaterThan(10);
      expect(req.owner_domain).toBeDefined();
      expect(req.freshness_rule).toBeDefined();
    }
  });

  // 14. GENESIS advisory panel tenang dan tidak membuat keputusan sepihak
  it("panel GENESIS menampilkan status 'Belum Tersedia' dan menegaskan batasan penasihat manusia", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    expect(screen.getByText("Status: Belum Tersedia")).toBeInTheDocument();
    expect(screen.getByText(/GENESIS berfungsi sebagai penasihat analitis \(advisory\)/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buka ARA & Analisis Agen/i })).toBeInTheDocument();
  });

  // 15. Header menampilkan konteks RKAP dan periode aktif
  it("header menampilkan nama RKAP aktif dan periode dari Stage 2 plan", () => {
    render(
      <ExecutiveDashboardHome
        snapshot={MOCK_STAGE3A_SNAPSHOT}
        activePlan={MOCK_STAGE2_PLAN}
        rawTargets={MOCK_STAGE2_TARGETS}
      />,
    );

    expect(screen.getByText("RKAP Perusahaan 2027")).toBeInTheDocument();
    expect(screen.getAllByText("2027").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Segarkan seluruh data eksekutif/i })).toBeInTheDocument();
  });
});
