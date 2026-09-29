import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  ExecutiveBriefPage,
  ExecutiveDivisionDetailPage,
  ExecutiveDivisionsPage,
  ExecutiveInitiativesPage,
  ExecutivePlanningPage,
  ExecutiveReviewsPage,
  generateCanonicalId,
  valueForObservation,
} from "@/features/executive";
import type {
  AuthenticatedPrincipalProjection,
  BusinessTarget,
  MetricObservation,
  StrategyPlan,
} from "@/lib/contracts";
import * as api from "@/lib/api";
import { strategyApi } from "@/modules/strategy";

const push = vi.fn();
const replace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/executive",
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
    permission_refs: ["strategy.company.manage"],
    role_refs: ["EXECUTIVE"],
    scope_refs: ["org_1"],
    workspace: {
      active: true,
      division_code: null,
      organization_id: "org_1",
      workspace_id: "workspace_exec",
      workspace_key: "executive",
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
  authorized_actions: ["EDIT"],
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
  ],
};

function authenticatedSession(principal = executivePrincipal) {
  return { authenticated: true, principal };
}

describe("Executive Source Honesty & Authority Mandatory Scenarios (23 Controls + Hygiene)", () => {
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

  // 1. Production Executive has no runtime dummy initiative
  it("Scenario 1: Production Executive has no runtime dummy initiative and shows honest empty state", async () => {
    render(<ExecutiveInitiativesPage />);

    expect(await screen.findByRole("heading", { name: "Inisiatif Strategis" })).toBeInTheDocument();
    expect(screen.queryByText("Akselerasi Penjualan Unit Residensial")).not.toBeInTheDocument();
    expect(screen.getByText("Belum ada inisiatif yang dapat ditampilkan.")).toBeInTheDocument();
    expect(screen.getByText(/Data inisiatif strategis belum terhubung/)).toBeInTheDocument();
  });

  // 2. Extraction without source produces no fake candidates
  it("Scenario 2: Extraction without source produces no fake candidates", async () => {
    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    const extTab = await screen.findByRole("tab", { name: "Ekstraksi Dokumen" });
    fireEvent.click(extTab);

    // Initial state has no preloaded fake candidates
    expect(screen.getByText("Ekstraksi Dokumen Strategi")).toBeInTheDocument();
    expect(screen.queryByText("Target Pendapatan Bersih")).not.toBeInTheDocument();
  });

  // 3. Extraction does not fake success
  it("Scenario 3: Extraction does not fake success and states unavailability honestly", async () => {
    render(<ExecutivePlanningPage />);

    const extTab = await screen.findByRole("tab", { name: "Ekstraksi Dokumen" });
    fireEvent.click(extTab);

    const processBtn = await screen.findByRole("button", { name: "Proses Ekstraksi" });
    expect(processBtn).toBeDisabled();
    expect(await screen.findByText("Ekstraksi dokumen belum tersedia.")).toBeInTheDocument();
  });

  // 4. Brief does not write "Nihil" if Finding source is unavailable
  it("Scenario 4: Brief does not write 'Nihil' when Finding source is unavailable", async () => {
    render(<ExecutiveBriefPage />);

    expect(await screen.findByRole("heading", { name: "Brief Eksekutif" })).toBeInTheDocument();
    expect(screen.queryByText(/Nihil/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/Data temuan belum tersedia/)).toBeInTheDocument();
  });

  it("does not infer risk or safety when the Strategy source cannot be loaded", async () => {
    vi.spyOn(strategyApi, "listPlans").mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<ExecutiveBriefPage />);

    expect(await screen.findByText("Kondisi perusahaan belum dapat disimpulkan karena data strategi belum tersedia.")).toBeInTheDocument();
    expect(screen.getByText("Risiko dan peringatan belum dapat disimpulkan karena data strategi belum tersedia.")).toBeInTheDocument();
    expect(screen.queryByText(/Tidak ada target korporasi yang terindikasi berisiko/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/aman/i)).not.toBeInTheDocument();
  });

  // 5. Brief does not create fake agendas/deadlines
  it("Scenario 5: Brief does not create fake agendas or deadlines", async () => {
    render(<ExecutiveBriefPage />);

    expect(await screen.findByText("F. Agenda & Tenggat")).toBeInTheDocument();
    expect(screen.getByText("Agenda dan tenggat belum terhubung.")).toBeInTheDocument();
    expect(screen.queryByText("Pelaporan Triwulan")).not.toBeInTheDocument();
  });

  // 6. Review Kinerja does not create fake review comments
  it("Scenario 6: Review Kinerja does not create fake review comments", async () => {
    render(<ExecutiveReviewsPage />);

    expect(await screen.findByRole("heading", { name: "Review & Revisi" })).toBeInTheDocument();
    expect(await screen.findByText("Review kinerja belum tersedia.")).toBeInTheDocument();
    expect(screen.queryByText(/Capaian target melampaui proyeksi/i)).not.toBeInTheDocument();
  });

  // 7. AT_RISK does not automatically create Finding count
  it("Scenario 7: AT_RISK target does not automatically fabricate finding count", async () => {
    const atRiskTarget: BusinessTarget & { readonly observations: readonly MetricObservation[] } = {
      ...mockTarget,
      target_id: "tgt_at_risk",
      name: "Target Berisiko",
      performance_state: "AT_RISK",
    };
    vi.spyOn(strategyApi, "listTargets").mockResolvedValue([atRiskTarget]);

    render(<ExecutiveBriefPage />);

    const targetsFound = await screen.findAllByText("Target Berisiko");
    expect(targetsFound.length).toBeGreaterThan(0);
    // Finding count is NOT synthetically incremented to 1 or any fake number
    expect(screen.queryByText(/Nihil/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Temuan Terbuka/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/1 Temuan/i)).not.toBeInTheDocument();
  });

  // 8. Unknown performance is not transformed to ON_TRACK
  it("Scenario 8: Unknown or undefined performance state renders 'Belum Dinilai', not ON_TRACK", async () => {
    const unknownTarget: BusinessTarget & { readonly observations: readonly MetricObservation[] } = {
      ...mockTarget,
      target_id: "tgt_unknown",
      name: "Target Tanpa Status",
      performance_state: null as unknown as BusinessTarget["performance_state"],
    };
    vi.spyOn(strategyApi, "listTargets").mockResolvedValueOnce([unknownTarget]);

    render(<ExecutiveBriefPage />);

    expect(await screen.findByText("Target Tanpa Status")).toBeInTheDocument();
    expect(screen.getAllByText("Belum Dinilai").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sesuai Rencana")).not.toBeInTheDocument();
  });

  // 9. Division target without scope.ref does not appear on any division
  it("Scenario 9: Division target without scope.ref fails closed and does not appear on any division", async () => {
    const missingRefTarget: BusinessTarget & { readonly observations: readonly MetricObservation[] } = {
      ...mockTarget,
      target_id: "tgt_no_ref",
      name: "Target Divisi Anomali",
      scope: { type: "DIVISION", ref: null, label: null },
    };
    vi.spyOn(strategyApi, "listTargets").mockResolvedValue([missingRefTarget]);

    render(<ExecutiveDivisionDetailPage divisionKey="sales" />);

    expect(await screen.findByRole("heading", { name: "Sales & Marketing" })).toBeInTheDocument();
    const perfTab = screen.getByRole("tab", { name: "Kinerja" });
    fireEvent.click(perfTab);

    // Target without valid scope.ref must NOT leak into sales
    expect(screen.queryByText("Target Divisi Anomali")).not.toBeInTheDocument();
    expect(await screen.findByText("Belum ada data target yang dialokasikan khusus untuk divisi ini.")).toBeInTheDocument();
  });

  it("does not present a source failure as an empty division target list", async () => {
    vi.spyOn(strategyApi, "listPlans").mockRejectedValueOnce(new Error("Request failed"));

    render(<ExecutiveDivisionDetailPage divisionKey="sales" />);

    expect(await screen.findByRole("heading", { name: "Sales & Marketing" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Kinerja" }));

    expect(await screen.findByText("Kinerja belum dapat disimpulkan karena data strategi belum tersedia.")).toBeInTheDocument();
    expect(screen.queryByText("Belum ada data target yang dialokasikan khusus untuk divisi ini.")).not.toBeInTheDocument();
  });

  it("shows only the loading state while division performance data is loading", async () => {
    vi.spyOn(strategyApi, "listPlans").mockImplementation(() => new Promise(() => {}));
    vi.spyOn(strategyApi, "listTargets").mockImplementation(() => new Promise(() => {}));

    render(<ExecutiveDivisionDetailPage divisionKey="sales" />);

    expect(await screen.findByRole("heading", { name: "Sales & Marketing" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Kinerja" }));

    expect(screen.getByRole("status", { name: "Memuat kinerja Sales & Marketing" })).toBeInTheDocument();
    expect(screen.queryByText("Belum ada data target yang dialokasikan khusus untuk divisi ini.")).not.toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Belum Terhubung" })).not.toBeInTheDocument();
  });

  // 10. Division owner is not hardcoded
  it("Scenario 10: Division owner is not hardcoded and shows honest fallback", async () => {
    render(<ExecutiveDivisionsPage />);

    expect(await screen.findByRole("heading", { name: "Divisi" })).toBeInTheDocument();
    expect(screen.queryByText("Kepala Divisi Sales & Marketing")).not.toBeInTheDocument();
    expect(screen.queryByText("Kepala Divisi Property & Teknik")).not.toBeInTheDocument();
  });

  // 11. WORKSPACE_LEAD does not leak as fabricated label
  it("Scenario 11: WORKSPACE_LEAD does not leak as a fabricated label", async () => {
    render(<ExecutiveDivisionsPage />);

    expect(await screen.findByRole("heading", { name: "Divisi" })).toBeInTheDocument();
    expect(screen.queryByText(/WORKSPACE_LEAD/i)).not.toBeInTheDocument();
  });

  // 12. Null observation value displays "—"
  it("Scenario 12: Null or undefined observation value displays '—'", () => {
    const formattedNull = valueForObservation(null);
    const formattedUndefined = valueForObservation({ value: undefined, unit: "COUNT" } as unknown as MetricObservation);
    expect(formattedNull).toBe("—");
    expect(formattedUndefined).toBe("—");
  });

  // 13. Numeric zero observation displays "0" / "Rp 0"
  it("Scenario 13: Numeric zero observation displays 'Rp 0' or '0', never '—'", () => {
    const formattedZeroIdr = valueForObservation({ value: 0, unit: "IDR" } as MetricObservation);
    const formattedZeroCount = valueForObservation({ value: 0, unit: "COUNT" } as MetricObservation);
    expect(formattedZeroIdr).toMatch(/Rp\s*0/);
    expect(formattedZeroCount).toBe("0");
    expect(formattedZeroIdr).not.toBe("—");
  });

  // 14. No Date.now canonical business IDs
  it("Scenario 14: Canonical business IDs follow RFC 4122 v4 UUID format and do not use Date.now", () => {
    const id = generateCanonicalId("plan");
    const uuidRegex = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;
    expect(id).toMatch(uuidRegex);
    expect(id).toMatch(/^plan-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    // Ensure it's not a numeric timestamp from Date.now()
    expect(Number.isNaN(Number(id.replace("plan-", "")))).toBe(true);
  });

  // 15. No workspace_exec hardcoded as form default
  it("Scenario 15: Forms initialize owner workspace to empty, avoiding hardcoded workspace_exec", async () => {
    render(<ExecutivePlanningPage />);

    const createBtn = await screen.findByRole("button", { name: "Buat Renstra" });
    fireEvent.click(createBtn);

    const wsInput = screen.getByLabelText("Ruang Kerja Penanggung Jawab *") as HTMLInputElement;
    expect(wsInput.value).toBe("");
  });

  // 16. No EXECUTIVE hardcoded as form owner default
  it("Scenario 16: Forms initialize owner role to empty, avoiding hardcoded EXECUTIVE", async () => {
    render(<ExecutivePlanningPage />);

    const createBtn = await screen.findByRole("button", { name: "Buat Renstra" });
    fireEvent.click(createBtn);

    const roleInput = screen.getByLabelText("Peran Penanggung Jawab *") as HTMLInputElement;
    expect(roleInput.value).toBe("");
  });

  // 17. Assumption form has period fields
  it("Scenario 17: Assumption form includes Periode Mulai, Periode Selesai, and Granularitas", async () => {
    render(<ExecutivePlanningPage />);

    const asmTab = await screen.findByRole("tab", { name: "Asumsi" });
    fireEvent.click(asmTab);

    const addBtn = await screen.findByRole("button", { name: "Tambah Asumsi" });
    fireEvent.click(addBtn);

    expect(screen.getByLabelText("Periode Mulai *")).toBeInTheDocument();
    expect(screen.getByLabelText("Periode Selesai *")).toBeInTheDocument();
    expect(screen.getByLabelText("Granularitas *")).toBeInTheDocument();
  });

  // 18. Cascade does not send hidden ratio 0.5
  it("Scenario 18: Cascade form does not send hidden ratio 0.5 and requires ratio input", async () => {
    const previewSpy = vi.spyOn(strategyApi, "previewCascade").mockResolvedValueOnce({
      cascade_run_id: "cas_run_2",
      status: "VALID",
      root_target_ref: { id: "tgt_revenue", version: 1 },
      derived_targets: [],
      calculation_trace: [],
      assumptions_used: [],
      constraint_results: [],
      blocking_conditions: [],
      input_hash: "h1",
      result_hash: "h2",
    });

    render(<ExecutivePlanningPage />);

    const casTab = await screen.findByRole("tab", { name: "Cascade" });
    fireEvent.click(casTab);

    // Enter custom ratio 0.75
    const ratioInput = screen.getByLabelText(/Nilai Rasio \/ Persentase/);
    fireEvent.change(ratioInput, { target: { value: "0.75" } });

    const previewBtn = screen.getByRole("button", { name: "Jalankan Pratinjau Cascade" });
    fireEvent.click(previewBtn);

    expect(previewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rules: expect.arrayContaining([
          expect.objectContaining({
            parameters: expect.objectContaining({
              ratio: 0.75,
            }),
          }),
        ]),
      }),
    );
  });

  // 19. Cascade accept is permission-aware
  it("Scenario 19: Cascade accept is permission-aware and hidden if unauthorized", async () => {
    // Principal lacks CREATE_COMPANY_PLAN
    vi.spyOn(strategyApi, "getAuthority").mockResolvedValueOnce({
      authorized_actions: [],
    });

    render(<ExecutivePlanningPage />);

    const casTab = await screen.findByRole("tab", { name: "Cascade" });
    fireEvent.click(casTab);

    expect(screen.queryByRole("button", { name: "Jalankan Pratinjau Cascade" })).not.toBeInTheDocument();
    expect(await screen.findByText("Anda belum memiliki kewenangan untuk melakukan tindakan ini.")).toBeInTheDocument();
  });

  // 20. No raw permission codes in UI
  it("Scenario 20: No raw permission codes leak into user-facing UI", async () => {
    render(<ExecutivePlanningPage />);

    expect(await screen.findByRole("heading", { name: "Rencana & Target" })).toBeInTheDocument();
    expect(screen.queryByText(/CREATE_COMPANY_PLAN/)).not.toBeInTheDocument();
    expect(screen.queryByText(/strategy\.company\.manage/)).not.toBeInTheDocument();
  });

  // 21. No raw Backend/API/contract language in user UI
  it("Scenario 21: No raw technical jargon (Backend, API endpoint, canonical) in user-facing UI", async () => {
    render(<ExecutiveReviewsPage />);

    expect(await screen.findByRole("heading", { name: "Review & Revisi" })).toBeInTheDocument();
    expect(screen.queryByText(/\bBackend\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bendpoint\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bcanonical\b/i)).not.toBeInTheDocument();
  });

  // 22. No no-op primary action buttons
  it("Scenario 22: Primary actions without functional backing do not render active no-op buttons", async () => {
    render(<ExecutiveBriefPage />);

    expect(await screen.findByRole("heading", { name: "Brief Eksekutif" })).toBeInTheDocument();
    // Directive creation is not an active button pretending to work
    expect(screen.queryByRole("button", { name: "Tambah Arahan" })).not.toBeInTheDocument();
    expect(screen.getByText("Pembuatan arahan akan tersedia setelah tindakan tugas dapat digunakan.")).toBeInTheDocument();
  });

  // 23. Docs do not claim unavailable features as Live/Tersedia
  it("Scenario 23: Documentation registries do not claim unavailable endpoints as LIVE or Tersedia", () => {
    const dataReqPath = path.resolve(__dirname, "../docs/executive-data-requirements.md");
    const workspaceDocPath = path.resolve(__dirname, "../docs/executive-workspace.md");

    const dataReqContent = fs.readFileSync(dataReqPath, "utf-8");
    const workspaceContent = fs.readFileSync(workspaceDocPath, "utf-8");

    expect(dataReqContent).toMatch(/exec\.planning\.extraction.*(UI READY \/ NEEDS BACKEND|NOT CONNECTED)/);
    expect(dataReqContent).toMatch(/exec\.initiatives\.table.*(UI READY \/ NEEDS BACKEND|NEEDS BACKEND)/);
    expect(dataReqContent).toMatch(/exec\.ara\.dialog.*NOT CONNECTED/);
    expect(workspaceContent).toMatch(/Tanya ARA.*READINESS ONLY/);
  });

  // Architecture Hygiene Guard: Static codebase audit
  it("Architecture Hygiene Guard: Zero Date.now(), zero hardcoded workspace_exec, zero mockCandidates in executive source files", () => {
    const executiveDir = path.resolve(__dirname, "../src/features/executive");
    const files = fs.readdirSync(executiveDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(executiveDir, file), "utf-8");
      expect(content).not.toContain("Date.now()");
      expect(content).not.toContain("mockCandidates");
      expect(content).not.toContain("readinessInitiatives");
      // Hardcoded workspace_exec as form default
      expect(content).not.toMatch(/useState\(["']workspace_exec["']\)/);
      // Hardcoded EXECUTIVE as form default
      expect(content).not.toMatch(/useState\(["']EXECUTIVE["']\)/);
    }
  });
});
