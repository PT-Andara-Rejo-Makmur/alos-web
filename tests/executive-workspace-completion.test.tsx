import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ExecutiveBriefPage,
  ExecutiveDivisionDetailPage,
  ExecutiveDivisionsPage,
  ExecutiveInitiativesPage,
  ExecutivePerformancePage,
  ExecutivePlanningPage,
  ExecutiveReviewsPage,
} from "@/features/executive";
import type {
  AuthenticatedPrincipalProjection,
  BusinessTarget,
  MetricObservation,
  StrategyPlan,
} from "@/lib/contracts";
import * as api from "@/lib/api";
import { strategyApi } from "@/modules/strategy";
import { lifecycleLabel } from "@/features/executive/executive-model";

const push = vi.fn();
const replace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/pusat-kendali-direksi",
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));

const period = {
  ends_at: "2027-12-31T00:00:00Z",
  granularity: "ANNUAL" as const,
  label: "2027",
  starts_at: "2027-01-01T00:00:00Z",
};

const executivePrincipal: AuthenticatedPrincipalProjection = {
  actor: {
    actor_id: "actor_exec",
    active: true,
    display_name: "Pengguna Eksekutif",
    organization_id: "org_1",
    tenant_id: "tenant_1",
  },
  active_workspace: {
    active: true,
    data_scope: "COMPANY",
    permission_refs: ["task.create", "strategy.company.manage"],
    role_refs: ["EXECUTIVE"],
    scope_refs: ["org_1"],
    workspace: {
      active: true,
      division_code: null,
      organization_id: "org_1",
      workspace_id: "workspace_exec",
      workspace_key: "pusat-kendali-direksi",
      workspace_name: "Pusat Kendali",
      workspace_type: "EXECUTIVE",
    },
  },
  email: "executive@example.test",
  expires_at: "2027-12-31T00:00:00Z",
  issued_at: "2027-01-01T00:00:00Z",
  workspace_access: [],
};

const mockPlan: StrategyPlan = {
  correlation_id: "corr_plan",
  created_at: "2027-01-01T00:00:00Z",
  created_by: "actor_exec",
  description: "Rencana 2027",
  evidence_refs: ["ev_doc_1"],
  lifecycle_state: "ACTIVE",
  materiality: "MATERIAL",
  name: "Renstra Korporasi 2027",
  organization_id: "org_1",
  owner_role_ref: "EXECUTIVE",
  owner_workspace_id: "workspace_exec",
  period,
  plan_id: "plan_2027",
  plan_type: "STRATEGIC_PLAN",
  scope: { ref: null, type: "COMPANY", label: "Korporasi" },
  source_refs: ["src_sk_1"],
  tenant_id: "tenant_1",
  updated_at: "2027-01-01T00:00:00Z",
  version: 1,
  authorized_actions: ["EDIT", "SUBMIT"],
};

const mockTarget: BusinessTarget & { readonly observations: readonly MetricObservation[] } = {
  code: "TGT-REV-01",
  created_at: "2027-01-01T00:00:00Z",
  created_by: "actor_exec",
  evidence_refs: ["ev_tgt_1"],
  lifecycle_state: "ACTIVE",
  materiality: "MATERIAL",
  measurement_type: "HIGHER_IS_BETTER",
  metric_code: "METRIC_REVENUE",
  name: "Pertumbuhan Pendapatan",
  objective_ref: null,
  organization_id: "org_1",
  owner_role_ref: "EXECUTIVE",
  owner_workspace_id: "workspace_exec",
  performance_state: "ON_TRACK",
  period,
  plan_ref: { id: "plan_2027", version: 1 },
  scope: { label: "Perusahaan", ref: null, type: "COMPANY" },
  source_refs: ["src_tgt_1"],
  target_id: "tgt_revenue",
  tenant_id: "tenant_1",
  unit: "IDR",
  updated_at: "2027-01-01T00:00:00Z",
  version: 1,
  observations: [
    {
      evidence_refs: ["ev_tgt_1"],
      kind: "TARGET",
      observation_id: "obs_tgt_val",
      observed_at: "2027-01-02T00:00:00Z",
      organization_id: "org_1",
      period,
      source_mode: "SOURCE_LINKED",
      source_ref: "src_ref_1",
      target_id: "tgt_revenue",
      target_version: 1,
      tenant_id: "tenant_1",
      unit: "IDR",
      value: 1000000000,
      verification_state: "VERIFIED",
    },
    {
      evidence_refs: ["ev_act_1"],
      kind: "ACTUAL",
      observation_id: "obs_act_val",
      observed_at: "2027-01-15T00:00:00Z",
      organization_id: "org_1",
      period,
      source_mode: "MANUAL_EVIDENCED",
      target_id: "tgt_revenue",
      target_version: 1,
      tenant_id: "tenant_1",
      unit: "IDR",
      value: 950000000,
      verification_state: "PENDING_VERIFICATION",
    },
  ],
};

function authenticatedSession(principal = executivePrincipal) {
  return { authenticated: true, principal };
}

describe("Executive Workspace Completion & Functional Gap Closure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(authenticatedSession());
    vi.spyOn(strategyApi, "listPlans").mockResolvedValue([mockPlan]);
    vi.spyOn(strategyApi, "listTargets").mockResolvedValue([mockTarget]);
    vi.spyOn(strategyApi, "listAssumptions").mockResolvedValue([]);
    vi.spyOn(strategyApi, "getAuthority").mockResolvedValue({
      authorized_actions: ["CREATE_COMPANY_PLAN"],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // 1. Brief actual composition
  it("renders Executive Brief composition with sections A to H without raw empty state soup", async () => {
    render(<ExecutiveBriefPage />);

    expect(await screen.findByRole("heading", { name: "Brief Eksekutif" })).toBeInTheDocument();
    expect(screen.getByText("A. Kondisi Perusahaan Saat Ini")).toBeInTheDocument();
    expect(screen.getByText("B. Sorotan Utama")).toBeInTheDocument();
    expect(screen.getByText("C. Keputusan Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("D. Risiko & Peringatan")).toBeInTheDocument();
    expect(screen.getByText("E. Progres Penting")).toBeInTheDocument();
    expect(screen.getByText("F. Agenda & Tenggat")).toBeInTheDocument();
    expect(screen.getByText("G. Arahan Pimpinan")).toBeInTheDocument();
    expect(screen.getByText("H. GENESIS Advisory")).toBeInTheDocument();

    // Directive notice when task mutation is not available
    expect(
      screen.getByText("Pembuatan arahan akan tersedia setelah tindakan tugas dapat digunakan."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah Arahan" })).not.toBeInTheDocument();
  });

  // 2. Form Renstra & RKAP completeness
  it("opens Renstra form and verifies canonical field completeness", async () => {
    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const createBtn = await screen.findByRole("button", { name: "Buat Renstra" });
    fireEvent.click(createBtn);

    expect(await screen.findByText("Formulir Renstra")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Renstra *")).toBeInTheDocument();
    expect(screen.getByLabelText("Tanggal Mulai *")).toBeInTheDocument();
    expect(screen.getByLabelText("Tanggal Selesai *")).toBeInTheDocument();
    expect(screen.getByLabelText("Granularitas *")).toBeInTheDocument();
    expect(screen.getByLabelText("Ruang Lingkup *")).toBeInTheDocument();
    expect(screen.getByLabelText("Ruang Kerja Penanggung Jawab *")).toBeInTheDocument();
    expect(screen.getByLabelText("Peran / Jabatan Penanggung Jawab *")).toBeInTheDocument();
    expect(screen.getByLabelText("Tingkat Kepentingan *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan Draf" })).toBeInTheDocument();
  });

  it("opens RKAP form and verifies Renstra Induk and canonical fields", async () => {
    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const rkapTab = await screen.findByRole("tab", { name: "RKAP" });
    fireEvent.click(rkapTab);

    const createBtn = await screen.findByRole("button", { name: "Buat RKAP" });
    fireEvent.click(createBtn);

    expect(await screen.findByText("Formulir RKAP")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama RKAP *")).toBeInTheDocument();
    expect(screen.getByLabelText("Renstra Induk *")).toBeInTheDocument();
    expect(screen.getByLabelText("Tanggal Mulai *")).toBeInTheDocument();
    expect(screen.getByLabelText("Tanggal Selesai *")).toBeInTheDocument();
  });

  // 3. Form Sasaran: system generated fields are hidden
  it("opens Sasaran form without exposing objective_id or version to user", async () => {
    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const sasaranTab = await screen.findByRole("tab", { name: "Sasaran" });
    fireEvent.click(sasaranTab);

    const addBtn = await screen.findByRole("button", { name: "Tambah Sasaran" });
    fireEvent.click(addBtn);

    expect(await screen.findByText("Formulir Sasaran")).toBeInTheDocument();
    expect(screen.getByLabelText("Rencana Induk *")).toBeInTheDocument();
    expect(screen.getByLabelText("Kode Sasaran *")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Sasaran *")).toBeInTheDocument();
    expect(screen.queryByLabelText(/objective_id/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/version/i)).not.toBeInTheDocument();
  });

  // 4. Form Target metadata + TARGET observation separation
  it("enforces Target metadata Step 1 and observation TARGET Step 2 separation", async () => {
    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const targetTab = await screen.findByRole("tab", { name: "Target" });
    fireEvent.click(targetTab);

    const addBtn = await screen.findByRole("button", { name: "Tambah Target" });
    fireEvent.click(addBtn);

    expect(await screen.findByText(/Formulir Target/)).toBeInTheDocument();
    expect(screen.getByText("Langkah 1:")).toBeInTheDocument();
    expect(screen.queryByLabelText("Referensi Definisi KPI")).not.toBeInTheDocument();
    expect(screen.getByText("Referensi KPI akan tersedia setelah sumber definisi KPI terhubung.")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/ID definisi KPI/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ID Bukti Dokumen/i)).not.toBeInTheDocument();

    // Fill metadata Step 1
    fireEvent.change(screen.getByLabelText("Kode Target *"), { target: { value: "TGT-NEW-01" } });
    fireEvent.change(screen.getByLabelText("Nama Target *"), { target: { value: "Target Baru" } });
    fireEvent.change(screen.getByLabelText("Ruang Kerja Penanggung Jawab *"), { target: { value: "workspace_exec" } });
    fireEvent.change(screen.getByLabelText("Peran / Jabatan Penanggung Jawab *"), { target: { value: "Direktur" } });

    const nextBtn = screen.getByRole("button", { name: "Lanjut: Nilai Target →" });
    fireEvent.click(nextBtn);

    // Step 2: Observasi TARGET
    expect(await screen.findByText("Langkah 2:")).toBeInTheDocument();
    expect(screen.getByLabelText("Nilai Target *")).toBeInTheDocument();
    expect(
      screen.getAllByText(/Nilai target dicatat sebagai observasi/i).length,
    ).toBeGreaterThan(0);
  });

  // 5. Assumption ratio validation (0 - 1)
  it("validates assumption ratio strictly between 0 and 1", async () => {
    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const asmTab = await screen.findByRole("tab", { name: "Asumsi" });
    fireEvent.click(asmTab);

    const addBtn = await screen.findByRole("button", { name: "Tambah Asumsi" });
    fireEvent.click(addBtn);

    expect(await screen.findByText("Formulir Asumsi")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nama Asumsi *"), { target: { value: "Rasio Penjualan" } });
    fireEvent.change(screen.getByLabelText("Satuan (Unit) *"), { target: { value: "RATIO" } });
    fireEvent.change(screen.getByLabelText(/Nilai \*/), { target: { value: "2.5" } });
    fireEvent.change(screen.getByLabelText("Periode Mulai *"), { target: { value: "2027-01-01" } });
    fireEvent.change(screen.getByLabelText("Periode Selesai *"), { target: { value: "2027-12-31" } });
    fireEvent.change(screen.getByLabelText("Ruang Kerja Penanggung Jawab *"), { target: { value: "workspace_exec" } });
    fireEvent.change(screen.getByLabelText("Peran / Jabatan Penanggung Jawab *"), { target: { value: "Tim Anggaran" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan Asumsi" });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Nilai rasio harus berada dalam rentang 0 hingga 1.")).toBeInTheDocument();
  });

  // 6. Cascade preview before accept
  it("requires cascade preview before accept and renders simulation results", async () => {
    const previewSpy = vi.spyOn(strategyApi, "previewCascade").mockResolvedValueOnce({
      cascade_run_id: "cas_run_1",
      status: "VALID",
      root_target_ref: { id: "tgt_revenue", version: 1 },
      derived_targets: [{ target_id: "tgt_sales_derived" }],
      calculation_trace: [],
      assumptions_used: [],
      constraint_results: [
        {
          constraint_id: "c_1",
          result: "PASS",
          critical: true,
          message: "Kapasitas anggaran mencukupi",
          evaluated_at: "2026-10-01T00:00:00Z",
        },
      ],
      blocking_conditions: [],
      input_hash: "hash_1",
      result_hash: "hash_2",
    });

    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const casTab = await screen.findByRole("tab", { name: "Cascade" });
    fireEvent.click(casTab);

    expect(screen.queryByLabelText("Target Turunan (Opsional)")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/ID Target Turunan/i)).not.toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /Terapkan Cascade/ })).not.toBeInTheDocument();

    const previewBtn = await screen.findByRole("button", { name: "Jalankan Pratinjau Cascade" });
    fireEvent.click(previewBtn);

    expect(previewSpy).toHaveBeenCalled();
    expect(previewSpy.mock.calls[0]?.[0]).toEqual(expect.objectContaining({
      rules: expect.arrayContaining([
        expect.objectContaining({
          organization_id: "org_1",
          tenant_id: "tenant_1",
        }),
      ]),
    }));
    expect(await screen.findByText("Hasil Pratinjau Cascade")).toBeInTheDocument();
    expect(screen.getByText("Kapasitas anggaran mencukupi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Terapkan Cascade/ })).toBeInTheDocument();
    const acceptSpy = vi.spyOn(strategyApi, "acceptCascade");
    fireEvent.click(screen.getByRole("button", { name: /Terapkan Cascade/ }));
    expect(await screen.findByText("Metadata canonical target turunan belum tersedia untuk penerimaan cascade.")).toBeInTheDocument();
    expect(acceptSpy).not.toHaveBeenCalled();
    expect(screen.queryByText("Hasil cascade berhasil diterima dan target turunan didaftarkan.")).not.toBeInTheDocument();

  });

  // 7. Document extraction UX and candidate review
  it("enforces document version and blocks Save Draft if required candidate fields are ambiguous", async () => {
    const mockCandidateList = [
      {
        id: "cand_1",
        fieldName: "Nama Target",
        value: "Target Penjualan",
        sourceText: "Pertumbuhan penjualan",
        anchor: "Hal 12",
        status: "PERLU_DIPERIKSA" as const,
        required: true,
      },
    ];

    render(
      <ExecutivePlanningPage
        initialCandidates={mockCandidateList}
        initialProcessed={true}
      />
    );

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const extTab = await screen.findByRole("tab", { name: "Ekstraksi Dokumen" });
    fireEvent.click(extTab);

    expect(await screen.findByText("Telaah Kandidat Ekstraksi")).toBeInTheDocument();
    expect(screen.getByText(/Dilarang langsung menetapkan hasil ekstraksi sebagai aktif/i)).toBeInTheDocument();

    // Ambiguous candidate is present with Perlu Diperiksa
    expect(screen.getByText("Perlu Diperiksa")).toBeInTheDocument();

    // Simpan Draf button must NOT exist — persistence is not available, notice shown instead
    expect(screen.queryByRole("button", { name: /Simpan Draf Ekstraksi/i })).not.toBeInTheDocument();

    // Readiness notice must be shown
    expect(screen.getByText(/memerlukan integrasi layanan ekstraksi resmi yang belum terhubung/i)).toBeInTheDocument();
  });


  // 8. Performance Detail Query (?target=tgt_revenue)
  it("opens Target Performance Detail when query parameter target is present", async () => {
    mockSearchParams = new URLSearchParams("target=tgt_revenue");

    render(<ExecutivePerformancePage />);

    expect(await screen.findByText("DETAIL KINERJA TARGET")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pertumbuhan Pendapatan" })).toBeInTheDocument();
    expect(screen.getByText("Target Nilai")).toBeInTheDocument();
    expect(screen.getByText("Aktual Terakhir")).toBeInTheDocument();
    expect(screen.getByText("Riwayat Observasi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Catat Aktual" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Catat Perkiraan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajukan Revisi" })).toBeInTheDocument();
  });

  // 9. Actual / Forecast validation & not auto VERIFIED
  it("enforces evidence for manual observation and defaults to PENDING_VERIFICATION", async () => {
    mockSearchParams = new URLSearchParams("target=tgt_revenue");

    render(<ExecutivePerformancePage />);

    const catatAktualBtn = await screen.findByRole("button", { name: "Catat Aktual" });
    fireEvent.click(catatAktualBtn);

    expect(await screen.findByRole("heading", { name: "Catat Aktual" })).toBeInTheDocument();
    expect(screen.getByText(/Status Verifikasi Awal:/i)).toBeInTheDocument();
    expect(screen.getAllByText("Menunggu Verifikasi").length).toBeGreaterThan(0);

    // If manual without evidence, it must block
    fireEvent.change(screen.getByLabelText(/Nilai Aktual \*/), { target: { value: "1000000" } });
    const submitBtn = screen.getByRole("button", { name: "Simpan Aktual" });
    const form = submitBtn.closest("form")!;
    fireEvent.submit(form);

    expect(await screen.findByText("Bukti pendukung wajib diisi untuk mode pencatatan manual.")).toBeInTheDocument();
  });

  // 10. Initiative UI Detail
  it("renders initiative readiness table and detail drawer without invented payload fields", async () => {
    const mockInitiativeFixture = {
      id: "init_res_1",
      name: "Akselerasi Penjualan Unit Residensial",
      description: "Program percepatan serah terima unit residensial.",
      relatedTargetName: "Pertumbuhan Pendapatan",
      workspace: "Sales & Marketing",
      ownerRole: "Head of Sales",
      lifecycleState: "ACTIVE" as const,
    };

    render(<ExecutiveInitiativesPage initiatives={[mockInitiativeFixture]} />);

    expect(await screen.findByRole("heading", { name: "Inisiatif Strategis" })).toBeInTheDocument();
    expect(screen.getByText("Akselerasi Penjualan Unit Residensial")).toBeInTheDocument();
    expect(screen.getByText("Kesiapan Data Pelaksanaan")).toBeInTheDocument();

    const detailBtn = screen.getAllByRole("button", { name: "Lihat Detail" })[0];
    fireEvent.click(detailBtn);

    expect(await screen.findByText("Informasi rinci arsitektur inisiatif strategis.")).toBeInTheDocument();
  });

  // 11. Review / Revisi functional tabs without overwriting active target
  it("renders functional Review & Revisi tabs and protects active target during revision", async () => {
    render(<ExecutiveReviewsPage />);

    expect(await screen.findByRole("heading", { name: "Review & Revisi" })).toBeInTheDocument();
    expect(await screen.findByText("Review Kinerja Eksekutif")).toBeInTheDocument();

    const revTab = screen.getByRole("tab", { name: "Revisi Target" });
    fireEvent.click(revTab);

    expect(screen.getByText("Pengajuan Revisi Target")).toBeInTheDocument();
    expect(
      screen.getByText(/Versi target yang sedang aktif tidak akan ditimpa langsung/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Alasan Revisi Target *")).toBeInTheDocument();
    expect(screen.queryByText(/Status: ACTIVE/)).not.toBeInTheDocument();
    expect(lifecycleLabel("ACTIVE")).toBe("Aktif");
  });

  // 12. Division Shared Work tabs remain readiness-only until governed cross-workspace projection exists
  it("switches division tabs without using a division key as Shared Work workspace scope", async () => {
    render(<ExecutiveDivisionDetailPage divisionKey="sales" />);

    expect(await screen.findByRole("heading", { name: "Sales & Marketing" })).toBeInTheDocument();
    expect(screen.getByText("Ringkasan Operasional Divisi")).toBeInTheDocument();

    // Click Kinerja
    const perfTab = screen.getByRole("tab", { name: "Kinerja" });
    fireEvent.click(perfTab);
    expect(screen.getByText("Kinerja Sales & Marketing")).toBeInTheDocument();

    for (const label of ["Proyek", "Tugas", "Persetujuan", "Temuan", "Laporan"]) {
      fireEvent.click(screen.getByRole("tab", { name: label }));
      expect(await screen.findByRole("heading", { name: label })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`Data ${label} Sales & Marketing belum terhubung ke tampilan Executive`))).toBeInTheDocument();
      expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
    }
  });

  // 13. UI Hygiene: No technical words and no raw IDs
  it("guards against raw IDs and technical language in user-facing UI", async () => {
    render(<ExecutiveDivisionsPage />);

    expect(await screen.findByRole("heading", { name: "Divisi" })).toBeInTheDocument();

    // No raw technical terms
    expect(screen.queryByText(/Backend/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/endpoint/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/public contract/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Butuh Kontrak/i)).not.toBeInTheDocument();
  });
});
