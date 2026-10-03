import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import GaRoute from "@/app/workspace/[workspaceKey]/(domain)/ga/page";
import EmployeesRoute from "@/app/workspace/[workspaceKey]/(domain)/employees/page";
import ComplianceRoute from "@/app/workspace/[workspaceKey]/(domain)/compliance/page";
import RecruitmentRoute from "@/app/workspace/[workspaceKey]/(domain)/recruitment/page";
import CandidateDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/recruitment/[candidateId]/page";
import EmployeeDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/employees/[employeeId]/page";
import { hrResources } from "@/features/hr/resources";
import { hasGaScope, hasHrContext, activeHrWorkspaceKey } from "@/features/hr/hr-model";
import { HrSourceStateView } from "@/features/hr/shared/hr-ui";
import { hrNavigation } from "@/features/hr/navigation";
import { HrModulePage } from "@/features/hr/hr-pages";
import { resolveWorkspaceDomain } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({ useParams: () => ({ workspaceKey: "sdm-utama" }), usePathname: () => "/workspace/sdm-utama/summary", useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }) }));

function hrSession(workspaceKey = "sdm-utama", divisionCode = "HR") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_hr", active: true, display_name: "HR Lead", organization_id: "org_1", tenant_id: "tenant_1" },
    active_workspace: { active: true, data_scope: "WORKSPACE", permission_refs: [], role_refs: ["DIVISION_LEAD"], scope_refs: [`workspace_${workspaceKey}`], workspace: { active: true, division_code: divisionCode, organization_id: "org_1", workspace_id: "ws_hr", workspace_key: workspaceKey, workspace_name: "Ruang SDM", workspace_type: "BUSINESS" } },
    email: "hr@example.test", expires_at: "2026-10-01T00:00:00Z", issued_at: "2026-09-27T00:00:00Z", workspace_access: [],
  };
  return { authenticated: true, principal };
}

function params<T extends Record<string, string>>(value: T) { return { params: value }; }

describe("HR / GA workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, counts: {}, last_updated_at: null, source: { source: "hr", status: "CONNECTED_EMPTY", authoritative: true, last_updated_at: null } } as never);
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("uses resolver authority, actual key, and fail-closes mismatch", () => {
    expect(hasHrContext(hrSession())).toBe(true);
    expect(activeHrWorkspaceKey(hrSession("sdm & people"))).toBe("sdm & people");
    expect(hasHrContext(hrSession("sales-space", "SALES"))).toBe(false);
    expect(resolveWorkspaceDomain(hrSession(), "sdm-lain")).toMatchObject({ valid: false, failureReason: "key_mismatch" });
  });

  it("treats Backend-recognized HR metadata as one HR & GA domain", () => {
    expect(hasGaScope(hrSession("sdm-utama", "HR"))).toBe(true);
    expect(hasGaScope(hrSession("hr-ga-utama", "HR_GA"))).toBe(true);
    expect(hasGaScope(hrSession("hrga-utama", "HRGA"))).toBe(true);
    expect(hasGaScope(hrSession("sales-utama", "SALES"))).toBe(false);
  });

  it("builds the combined HR & GA menu with encoded actual workspace key", () => {
    const navigation = hrNavigation("sdm & utama", hasGaScope(hrSession("sdm & utama", "HR")));
    const labels = navigation.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toHaveLength(19);
    expect(labels).toContain("GA & Fasilitas");
    expect(labels).not.toContain("Kompensasi & Benefit");
    expect(navigation.flatMap((section) => section.items.map((item) => item.href))).toContain("/workspace/sdm%20%26%20utama/summary");
    expect(navigation.flatMap((section) => section.items.map((item) => item.href)).some((href) => href.startsWith("/workspace/hr/"))).toBe(false);
    expect(navigation.map((section) => section.label)).not.toContain("GA");
    expect(navigation.find((section) => section.label === "OPERASIONAL SDM")?.items.map((item) => item.label)).toContain("GA & Fasilitas");
  });

  it("shows an honest unavailable state on the Compensation deep link", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<HrModulePage module="compensation" workspaceKey="sdm-utama" />);
    expect(await screen.findByRole("heading", { name: "Fitur belum tersedia" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kompensasi & Benefit", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke Ringkasan HR & GA" })).toHaveAttribute("href", "/workspace/sdm-utama/summary");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("reads canonical HR overview using the actual workspace key", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<SummaryRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: "HR & GA" })).toBeInTheDocument();
    await waitFor(() => expect(api.authenticatedApiRequest).toHaveBeenCalledWith("/api/v1/hr/overview", expect.any(Object)));
    expect(await screen.findByText("Turnover")).toBeInTheDocument();
    expect(screen.getAllByText("Belum tersedia").length).toBeGreaterThan(0);
  });

  it("does not render HR content for a workspace key mismatch", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm-utama"));
    render(<EmployeesRoute {...params({ workspaceKey: "sdm-lain" })} />);
    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Karyawan/ })).not.toBeInTheDocument();
  });

  it("keeps Target & Kinerja separate from employee review", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<PerformanceRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: "Target & Kinerja" })).toBeInTheDocument();
    expect(screen.queryByText("Review Kinerja Karyawan")).not.toBeInTheDocument();
  });

  it("allows GA consistently for the canonical combined HR & GA domain", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm-utama", "HR"));
    render(<GaRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: /GA & Fasilitas/ })).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("hr-ga-utama", "HR_GA"));
    render(<GaRoute {...params({ workspaceKey: "hr-ga-utama" })} />);
    expect(await screen.findByRole("heading", { name: /GA & Fasilitas/ })).toBeInTheDocument();
  });

  it("reads employee data and detail without payroll or identity mutation", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<EmployeesRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("tab", { name: "Karyawan" })).toBeInTheDocument();
    await waitFor(() => expect(api.authenticatedApiRequest).toHaveBeenCalledWith("/api/v1/hr/employees?limit=100&offset=0", expect.any(Object)));
    cleanup();
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ employee_id: "employee-1", full_name: "Recorded person", actor_id: null } as never);
    render(<EmployeeDetailRoute {...params({ workspaceKey: "sdm-utama", employeeId: "employee-1" })} />);
    expect(await screen.findByText("Recorded person")).toBeInTheDocument();
    expect(screen.queryByText(/Gaji|Nomor Rekening|NPWP|KTP/)).not.toBeInTheDocument();
  });

  it("references canonical HR documents while signing remains unavailable", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<ComplianceRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("tab", { name: "Kontrak Kerja" })).toBeInTheDocument();
    expect(screen.getByText("Penandatanganan Digital Kontrak Kerja")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ambil/Telaah dari Dokumen" })).not.toBeInTheDocument();
    expect(hrResources.employment_contracts.createFields.find((field) => field.name === "document_id")?.relation?.path).toBe("/api/v1/documents");
  });

  it("reads grievances through the scoped HR owner and claims no compliance", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<ComplianceRoute {...params({ workspaceKey: "sdm-utama" })} />);
    (await screen.findByRole("tab", { name: "Keluhan Karyawan" })).click();
    await waitFor(() => expect(api.authenticatedApiRequest).toHaveBeenCalledWith("/api/v1/hr/grievances?limit=100&offset=0", expect.any(Object)));
    expect(screen.getByText("Kepatuhan Regulasi Otomatis")).toBeInTheDocument();
    expect(screen.queryByText("Compliant")).not.toBeInTheDocument();
  });

  it("reads recruitment, candidate and interview records without inventing final decisions", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<RecruitmentRoute {...params({ workspaceKey: "sdm-utama" })} />);
    (await screen.findByRole("tab", { name: "Kandidat" })).click();
    await waitFor(() => expect(api.authenticatedApiRequest).toHaveBeenCalledWith("/api/v1/hr/candidates?limit=100&offset=0", expect.any(Object)));
    expect(screen.getByRole("tab", { name: "Interview" })).toBeInTheDocument();
    expect(screen.queryByText("Keputusan Hiring atau Rejection Final")).not.toBeInTheDocument();
    cleanup();
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ candidate_id: "candidate-1", full_name: "Recorded candidate" } as never);
    render(<CandidateDetailRoute {...params({ workspaceKey: "sdm-utama", candidateId: "candidate-1" })} />);
    expect(await screen.findByText("Recorded candidate")).toBeInTheDocument();
  });

  it("renders mutually exclusive source states and no extraction candidate", () => {
    const { rerender } = render(<HrSourceStateView description="Belum terhubung" state="unavailable" />);
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThan(0);
    rerender(<HrSourceStateView description="Belum ada data" state="connected-empty" />);
    expect(screen.getAllByText("Belum ada data").length).toBeGreaterThan(0);
    expect(screen.queryByText("Belum Terhubung")).not.toBeInTheDocument();
    rerender(<HrSourceStateView description="Gagal membaca sumber" state="error" />);
    expect(screen.getByText("Data belum dapat dimuat")).toBeInTheDocument();
    rerender(<HrSourceStateView description="Memuat sumber" state="loading" />);
    expect(screen.getByText("Memuat data")).toBeInTheDocument();
    rerender(<HrSourceStateView description="Sumber siap" state="connected-data"><span>Data terhubung</span></HrSourceStateView>);
    expect(screen.getByText("Data terhubung")).toBeInTheDocument();
  });

  it("preserves canonical employee fields in the presentation and request metadata", () => {
    const columns = hrResources.employees.columns.map((field) => field.name);
    expect(columns).toEqual(expect.arrayContaining(["employee_number", "full_name", "join_date", "end_date", "employment_status", "actor_id"]));
    expect(hrResources.employees.createFields.map((field) => field.name)).not.toContain("actor_id");
    expect(hrResources.attendances.immutable).toBe(true);
    expect(hrResources.attendances.updateFields).toEqual([]);
  });

  it("keeps HR authority and unsupported storage explicit", () => {
    const source = readFileSync(resolve("src/features/hr/hr-pages.tsx"), "utf8");
    expect(source).toContain("Kompensasi & Benefit");
    expect(source).toContain("GA & Fasilitas");
    expect(source).toContain("Perubahan & Offboarding");
    expect(source).not.toContain('unavailable: ["Workflow Offboarding"');
    expect(source).toContain("Revokasi Akses dari HR");
    const protectedFields = ["actor_id", "approved_by", "approved_at", "owner_actor_id", "reviewer_actor_id"];
    for (const resource of Object.values(hrResources)) for (const field of resource.createFields) expect(protectedFields).not.toContain(field.name);
  });

  it("does not create HR duplicate Shared Work or ARA features", () => {
    const source = readFileSync(resolve("src/features/hr/index.ts"), "utf8");
    expect(source).not.toMatch(/hr-(projects|tasks|approvals|documents|reports|findings|ara)/i);
    const navigation = readFileSync(resolve("src/features/hr/navigation.ts"), "utf8");
    expect(navigation).not.toContain("/workspace/hr/");
    expect(navigation).toContain("/projects");
    expect(navigation).toContain("/tasks");
    expect(navigation).toContain("/approvals");
    expect(navigation).toContain("/documents");
    expect(navigation).toContain("/reports");
    expect(navigation).toContain("/findings");
    expect(navigation).toContain("/ara");
  });

  it("keeps responsive and accessible HR structure in shared primitives", () => {
    const css = readFileSync(resolve("src/features/hr/hr.module.css"), "utf8");
    const ui = readFileSync(resolve("src/features/hr/shared/hr-ui.tsx"), "utf8");
    expect(css).toContain("@media (max-width: 760px)");
    expect(css).toContain(".formGrid { grid-template-columns: 1fr; }");
    expect(ui).toContain("<Drawer");
    expect(readFileSync(resolve("src/features/business-records/record-panel.tsx"), "utf8")).toContain("<FormField");
  });
});
