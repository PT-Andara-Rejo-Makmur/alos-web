import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Status } from "@/components/ui";
import { ProjectStatusBadge } from "@/features/shared-work/shared/status/project-status";
import { FindingSeverityBadge } from "@/features/shared-work/shared/status/work-status";
import { TaskPriorityBadge, TaskStatusBadge } from "@/features/shared-work/tasks/task-status";
import { ProcessInbox } from "@/features/shared-work/processes/process-inbox";
import { ProcessItem } from "@/features/shared-work/processes/process-queue";
import { processTypeLabel } from "@/features/shared-work/processes/process-presentation";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { RecordPanel } from "@/features/business-records/record-panel";
import { RecordFormFields } from "@/features/business-records/record-form-fields";
import { recordFieldValue, type Field } from "@/features/business-records/resource";
import { itResources } from "@/features/it/resources";
import { ExecutiveSummaryPage } from "@/features/executive/executive-summary";
import { CascadeSection } from "@/features/executive/executive-cascade";
import { AraAnswer } from "@/features/ara/ara-answer";
import { AraProgress } from "@/features/ara/ara-progress";
import { roleLabel, statusLabel } from "@/lib/presentation";
import { strategyApi } from "@/modules/strategy";
import * as api from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import type { BusinessTarget, MetricObservation } from "@/lib/contracts";
import { emptyWorkFixture, executiveOverviewFixture } from "./executive-overview-fixture";
import { performanceFixture, processFixture } from "./helpers/business-projections";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/direksi/summary", useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ workspaceKey: "direksi" }), useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const stamp = "2026-10-03T08:00:00Z";
const session: SessionProjection = { authenticated: true, principal: {
  actor: { actor_id: "actor-director", display_name: "Direktur Andara", active: true, tenant_id: "tenant_1", organization_id: "org_1" },
  active_workspace: { active: true, role_refs: ["EXECUTIVE"], permission_refs: [], scope_refs: ["org_1"], data_scope: "COMPANY",
    workspace: { workspace_id: "workspace_exec", workspace_key: "direksi", workspace_name: "Pusat Kendali Direksi", workspace_type: "EXECUTIVE", division_code: null, organization_id: "org_1", active: true } },
  workspace_access: [], email: "director@example.test", issued_at: stamp, expires_at: "2027-01-01T00:00:00Z",
} };
const target: BusinessTarget = {
  target_id: "hidden-target-id", version: 1, tenant_id: "tenant_1", organization_id: "org_1", owner_workspace_id: "workspace_exec",
  code: "OMZET-2026", name: "Omzet Perusahaan", plan_ref: { id: "hidden-plan-id", version: 1 }, objective_ref: null,
  metric_code: "revenue", scope: { type: "COMPANY", ref: null, label: "Perusahaan" },
  period: { granularity: "ANNUAL", starts_at: "2026-01-01", ends_at: "2026-12-31", label: "2026" },
  measurement_type: "HIGHER_IS_BETTER", unit: "IDR", owner_role_ref: "DIVISION_LEAD", materiality: "MATERIAL",
  lifecycle_state: "ACTIVE", evidence_refs: [], source_refs: [], created_by: "actor-director", created_at: stamp, updated_at: stamp,
};
const actual: MetricObservation = {
  observation_id: "hidden-observation-id", tenant_id: "tenant_1", organization_id: "org_1", target_id: target.target_id,
  target_version: 1, kind: "ACTUAL", unit: "IDR", value: "1000", period: target.period, observed_at: stamp,
  source_mode: "MANUAL_EVIDENCED", verification_state: "PENDING_VERIFICATION", evidence_refs: [],
};
const severity: Field = { name: "severity", label: "Tingkat Temuan", type: "text", required: true, nullable: false, options: ["LOW", "CRITICAL"] };

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("business presentation on active surfaces", () => {
  it.each([["ACTIVE", "Aktif"], ["ON_HOLD", "Ditahan"]])("renders Project %s as %s", (value, label) => {
    const { container } = render(<ProjectStatusBadge status={value} />);
    expect(screen.getByRole("status")).toHaveAccessibleName(label);
    expect(container.textContent).not.toContain(value);
  });

  it("renders Task review status and distinguishes urgency from severity", () => {
    render(<><TaskStatusBadge status="UNDER_REVIEW" /><TaskPriorityBadge priority="CRITICAL" /><FindingSeverityBadge severity="CRITICAL" /></>);
    expect(screen.getByRole("status", { name: "Sedang Diperiksa" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Mendesak" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Kritis" })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/UNDER_REVIEW|CRITICAL/);
  });

  it("renders division roles while preserving a supplied human title", () => {
    expect(roleLabel(["DIVISION_LEAD", "DIVISION_MEMBER"])).toBe("Kepala Divisi · Anggota Divisi");
    expect(roleLabel("Head of Sales")).toBe("Head of Sales");
  });

  it.each([["PAYMENT_CERTIFICATE", "Sertifikat Pembayaran"], ["CHANGE_ORDER", "Perubahan Pekerjaan"], ["EMPLOYMENT_CONTRACT", "Kontrak Kerja"]])("labels process type %s", (value, label) => {
    expect(processTypeLabel(value)).toBe(label);
  });

  it("uses human process categories and acknowledgement labels in the action inbox", () => {
    const process = { ...processFixture, steps: [{ ...processFixture.steps[0], kind: "ACKNOWLEDGEMENT" as const, role: "DIVISION_LEAD" as const }] };
    render(<ProcessInbox queue={{ processes: [process], tasks: [], approvals: [], findings: [], notifications: [] }} workspaceKey="direksi" />);
    expect(screen.getByText("Sertifikat Pembayaran")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Untuk Diketahui" })).toBeInTheDocument();
    expect(screen.getByText(/Kepala Divisi/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/PAYMENT_CERTIFICATE|ACKNOWLEDGEMENT|DIVISION_LEAD|hidden-correlation|process_1/);
  });

  it("presents a Backend authority rejection without losing diagnostic detail", async () => {
    const error = new api.ApiRequestError("AUTHORITY_BOUNDARY_CONFLICT", 403, "correlation-diagnostic", "AUTHORITY_BOUNDARY_CONFLICT");
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(error);
    render(<ProcessItem initial={processFixture} workspaceKey="direksi" />);
    fireEvent.change(screen.getByLabelText(/Hasil pemeriksaan atau alasan/), { target: { value: "Periksa dokumen" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Hasil Pemeriksaan" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Anda tidak memiliki kewenangan untuk melakukan tindakan ini.");
    expect(document.body.textContent).not.toMatch(/AUTHORITY_BOUNDARY_CONFLICT|correlation-diagnostic/);
    expect(error.code).toBe("AUTHORITY_BOUNDARY_CONFLICT");
    expect(error.correlationId).toBe("correlation-diagnostic");
  });

  it("renders lifecycle, verification and roles in the division performance table", async () => {
    vi.spyOn(strategyApi, "listTargetDetails").mockResolvedValue([{ target, observations: [actual], selected_observations: { target: null, actual, forecast: null }, relationships: [], revisions: [] }]);
    render(<StrategyPerformance domain="finance" />);
    const table = await screen.findByRole("table", { name: "Target dan Kinerja finance" });
    expect(table).toHaveTextContent("Aktif");
    expect(table).toHaveTextContent("Menunggu Pemeriksaan");
    expect(table).toHaveTextContent("Kepala Divisi");
    expect(table.textContent).not.toMatch(/ACTIVE|PENDING_VERIFICATION|DIVISION_LEAD|hidden-/);
  });

  it("uses readable Strategy options without changing their canonical values", () => {
    vi.spyOn(strategyApi, "listObjectives").mockResolvedValue([]);
    render(<CascadeSection targets={[target]} assumptions={[]} session={session} onChanged={vi.fn()} />);
    expect(screen.getByRole("option", { name: "Makin Tinggi Makin Baik" })).toHaveValue("HIGHER_IS_BETTER");
    expect(screen.getByRole("option", { name: "Makin Rendah Makin Baik" })).toHaveValue("LOWER_IS_BETTER");
    expect(screen.getByRole("option", { name: "Keputusan Strategis" })).toHaveValue("MATERIAL");
    expect(screen.getByRole("option", { name: "Operasi Divisi" })).toHaveValue("NON_MATERIAL");
    expect(screen.getByRole("option", { name: "Direktur" })).toHaveValue("EXECUTIVE");
    expect(document.body.textContent).not.toMatch(/HIGHER_IS_BETTER|LOWER_IS_BETTER|MATERIAL|hidden-plan-id/);
  });

  it("renders actual Executive summary projects with human status and names", async () => {
    const work = { ...emptyWorkFixture(), projects: ["ACTIVE", "ON_HOLD"].map((status, index) => ({
      project_id: `hidden-project-${index}`, tenant_id: "tenant_1", organization_id: "org_1", workspace_ids: ["workspace_exec"],
      code: `PR-${index}`, name: `Proyek ${index + 1}`, status: status as "ACTIVE" | "ON_HOLD", owner_name: "Budi Santoso", created_at: stamp, updated_at: stamp,
    })) };
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue(performanceFixture);
    vi.spyOn(strategyApi, "getExecutiveOverview").mockResolvedValue(executiveOverviewFixture({ work }));
    render(<ExecutiveSummaryPage workspaceKey="direksi" />);
    const table = await screen.findByRole("table", { name: "Proyek perusahaan" });
    expect(table).toHaveTextContent("Aktif");
    expect(table).toHaveTextContent("Ditahan");
    expect(table).toHaveTextContent("Budi Santoso");
    expect(document.body.textContent).not.toMatch(/ACTIVE|ON_HOLD|CONNECTED_EMPTY|MATERIAL|DIVISION_LEAD|hidden-project/);
  });

  it.each([["DEPLOYED", "Sudah Dipasang"], ["ROLLED_BACK", "Dikembalikan ke Versi Sebelumnya"], ["FAILED", "Perlu Ditangani"]])("keeps IT details and presents release %s readably", async (status, label) => {
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [{ it_release_id: "release-internal", version: "2026.10", status, deployment_reference: "Deployment CI #42 · Repository alos-web", created_at: stamp, updated_at: stamp }], total: 1, source: { source: "it", status: "CONNECTED", authoritative: true, last_updated_at: stamp } });
    render(<RecordPanel resource={itResources.releases} session={session} />);
    fireEvent.click(await screen.findByRole("button", { name: "Lihat detail" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Deployment CI #42 · Repository alos-web");
    expect(dialog).toHaveTextContent(label);
    expect(dialog.textContent).not.toContain(status);
  });

  it.each(["OWNER_ROLE_INVALID", "task_id=11111111-1111-4111-8111-111111111111", "source_not_found"])("hides diagnostic details in a 400 error: %s", detail => {
    const error = new api.ApiRequestError(detail, 400, "trace-reference");
    expect(api.apiMessage(error)).toBe("Permintaan belum dapat diproses. Periksa isian dan akses ruang kerja Anda.");
    expect(error.detail).toBe(detail);
    expect(api.apiMessage(new api.ApiRequestError("Periksa tanggal akhir rencana.", 400))).toBe("Periksa tanggal akhir rencana.");
  });

  it("explains an unfinished corrective action without exposing diagnostics or bypassing denial", () => {
    const code = "FINDING_CORRECTIVE_ACTION_INCOMPLETE";
    const error = new api.ApiRequestError("internal task diagnostic", 409, "trace-reference", code);
    expect(api.apiMessage(error)).toBe("Selesaikan tugas tindakan korektif yang tertaut sebelum memverifikasi atau menutup temuan.");
    expect(api.apiMessage(new api.ApiRequestError("internal task diagnostic", 403, null, code))).toBe("Anda tidak memiliki kewenangan untuk melakukan tindakan ini.");
  });

  it("uses impact labels in record tables and form options without replacing business codes", () => {
    expect(recordFieldValue(severity, "CRITICAL")).toBe("Kritis");
    expect(recordFieldValue({ ...severity, name: "name", options: undefined }, "PT ARM")).toBe("PT ARM");
    expect(recordFieldValue({ ...severity, name: "reference", options: undefined }, "CI-42")).toBe("CI-42");
    expect(recordFieldValue({ ...severity, name: "reference", options: undefined }, "COUNT")).toBe("COUNT");
    const change = vi.fn();
    render(<RecordFormFields fields={[severity]} mode="create" values={{ severity: "LOW" }} options={{}} change={change} busy={false} loading={false} relationErrors={[]} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "CRITICAL" } });
    expect(change).toHaveBeenCalledWith("severity", "CRITICAL");
    expect(screen.getByRole("option", { name: "Kritis" })).toHaveValue("CRITICAL");
  });

  it("keeps diagnostic IDs and tool names out of ARA limitations and progress", () => {
    render(<><AraAnswer threadId="hidden-thread" runId="hidden-run" response={{ response_type: "ANSWER", answer: "Periksa dokumen pembayaran.", sources: [], failed_sources: [], limitations: ["AUTHORITY_BOUNDARY_CONFLICT", "tool_id=finance.payables.list", "run_id=hidden-run", "Bukti pembayaran belum lengkap."] }} /><AraProgress events={[]} label="Memahami permintaan" /></>);
    expect(screen.getByText("Bukti pembayaran belum lengkap.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Memeriksa informasi");
    expect(document.body.textContent).not.toMatch(/AUTHORITY_BOUNDARY_CONFLICT|finance.payables.list|run_id|hidden-run/);
  });
});

describe("unknown enum visibility", () => {
  it("signals a missing mapping once in development while displaying safe copy", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<><Status label="NEW_PRESENTATION_STATUS" /><Status label="NEW_PRESENTATION_STATUS" /></>);
    expect(screen.getAllByRole("status", { name: "Status belum dikenali" })).toHaveLength(2);
    expect(warn).toHaveBeenCalledExactlyOnceWith("[presentation] Label belum tersedia untuk enum: NEW_PRESENTATION_STATUS");
    expect(document.body.textContent).not.toContain("NEW_PRESENTATION_STATUS");
  });

  it("does not report or leak unknown enum values in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(statusLabel("NEW_PRODUCTION_STATUS")).toBe("Status belum dikenali");
    expect(warn).not.toHaveBeenCalled();
  });

  it("reports typed unknown fields while preserving free-form uppercase text", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(recordFieldValue({ ...severity, name: "status", options: undefined }, "NEW_RECORD_STATUS")).toBe("Status belum dikenali");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("NEW_RECORD_STATUS"));
    expect(recordFieldValue({ ...severity, name: "title", options: undefined }, "NEW_RECORD_STATUS")).toBe("NEW_RECORD_STATUS");
    expect(roleLabel("NEW_CANONICAL_ROLE")).toBe("Peran belum dikenali");
  });
});
