import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import WorkspacePage from "@/app/workspace/page";
import WorkspaceKeyRoot from "@/app/workspace/[workspaceKey]/page";
import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import GaRoute from "@/app/workspace/[workspaceKey]/(domain)/ga/page";
import EmployeesRoute from "@/app/workspace/[workspaceKey]/(domain)/employees/page";
import ComplianceRoute from "@/app/workspace/[workspaceKey]/(domain)/compliance/page";
import RecruitmentRoute from "@/app/workspace/[workspaceKey]/(domain)/recruitment/page";
import CandidateDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/recruitment/[candidateId]/page";
import EmployeeDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/employees/[employeeId]/page";
import { columnsFor, createHrRow } from "@/features/hr/hr-pages";
import { hasGaScope, hasHrContext, activeHrWorkspaceKey } from "@/features/hr/hr-model";
import { HrSourceStateView } from "@/features/hr/shared/hr-ui";
import { hrNavigation } from "@/features/hr/navigation";
import { resolveWorkspaceDomain } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/workspace/sdm-utama/summary", useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }) }));

function hrSession(workspaceKey = "sdm-utama", divisionCode = "HR") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_hr", active: true, display_name: "HR Lead", organization_id: "org_1", tenant_id: "tenant_1" },
    active_workspace: { active: true, data_scope: "WORKSPACE", permission_refs: [], role_refs: ["WORKSPACE_LEAD"], scope_refs: [`workspace_${workspaceKey}`], workspace: { active: true, division_code: divisionCode, organization_id: "org_1", workspace_id: "ws_hr", workspace_key: workspaceKey, workspace_name: "Ruang SDM", workspace_type: "BUSINESS" } },
    email: "hr@example.test", expires_at: "2026-10-01T00:00:00Z", issued_at: "2026-09-27T00:00:00Z", workspace_access: [],
  };
  return { authenticated: true, principal };
}

function params<T extends Record<string, string>>(value: T) { return { params: value }; }

describe("HR / GA workspace", () => {
  beforeEach(() => vi.clearAllMocks());
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
    expect(navigation.flatMap((section) => section.items.map((item) => item.href))).toContain("/workspace/sdm%20%26%20utama/summary");
    expect(navigation.flatMap((section) => section.items.map((item) => item.href)).some((href) => href.startsWith("/workspace/hr/"))).toBe(false);
    expect(navigation.map((section) => section.label)).not.toContain("GA");
    expect(navigation.find((section) => section.label === "OPERASIONAL SDM")?.items.map((item) => item.label)).toContain("GA & Fasilitas");
    expect(labels).toContain("Kompensasi & Benefit");
  });

  it("root and summary dispatch HR to canonical summary using actual key", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm-utama"));
    render(<WorkspacePage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/sdm-utama/summary"));
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm utama"));
    render(<WorkspaceKeyRoot {...params({ workspaceKey: "sdm utama" })} />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/sdm%20utama/summary"));
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm-utama"));
    render(<SummaryRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: "HR" })).toBeInTheDocument();
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

  it("keeps HR data and detail source-honest with disabled readiness actions", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<EmployeesRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: /Karyawan/ })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /salary|gaji/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /bank|rekening/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /tax|pajak/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /government|KTP|identitas pemerintah/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Segarkan|Refresh/i })).not.toBeInTheDocument();
    screen.getByRole("tab", { name: "Semua" }).click();
    (await screen.findByRole("button", { name: "Catat Perubahan" })).click();
    const dialog = await screen.findByRole("dialog", { name: "Catat Perubahan" });
    expect(within(dialog).getByRole("button", { name: "Simpan" })).toBeDisabled();
    expect(within(dialog).getByText("Penyimpanan belum tersedia. Perubahan tidak dilaporkan sebagai berhasil.")).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<EmployeeDetailRoute {...params({ workspaceKey: "sdm-utama", employeeId: "employee-1" })} />);
    expect(await screen.findByRole("heading", { name: "Detail Karyawan" })).toBeInTheDocument();
    expect(screen.getByText(/ID pada URL tidak menentukan akses/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Data Pribadi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bank" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Pajak" })).toBeDisabled();
    expect(screen.queryByText(/Gaji|Nomor Rekening|NPWP|KTP/)).not.toBeInTheDocument();
  });

  it("offers document review only as unavailable extraction readiness", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<ComplianceRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: /Dokumen & Kepatuhan/ })).toBeInTheDocument();
    screen.getByRole("button", { name: "Ambil/Telaah dari Dokumen" }).click();
    expect(await screen.findByText("Belum ada kandidat ekstraksi.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Terima" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("keeps restricted HR case unavailable and document validity outside HR authority", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<ComplianceRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: /Dokumen & Kepatuhan/ })).toBeInTheDocument();
    screen.getByRole("tab", { name: "HR Case" }).click();
    expect(await screen.findByText("Data HR case tidak tersedia tanpa kewenangan yang sesuai.")).toBeInTheDocument();
    expect(screen.queryByText(/Lengkap|Valid|Compliant/)).not.toBeInTheDocument();
  });

  it("keeps recruitment tabs and candidate detail contextual", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<RecruitmentRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: /Rekrutmen & Kandidat/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Posisi" })).toBeInTheDocument();
    screen.getByRole("tab", { name: "Kandidat" }).click();
    expect(await screen.findByRole("columnheader", { name: "Aktivitas Terakhir" })).toBeInTheDocument();
    screen.getByRole("button", { name: "Ambil/Telaah dari Dokumen" }).click();
    expect(await screen.findByText("Belum ada kandidat ekstraksi.")).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<CandidateDetailRoute {...params({ workspaceKey: "sdm-utama", candidateId: "candidate-1" })} />);
    expect(await screen.findByRole("heading", { name: "Detail Kandidat" })).toBeInTheDocument();
    screen.getByRole("tab", { name: "CV & Dokumen" }).click();
    expect(await screen.findByText(/CV dan dokumen kandidat belum tersedia/)).toBeInTheDocument();
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

  it("preserves distinct values for every HR table column beyond five columns", () => {
    const headers = ["Nama", "ID Karyawan", "Posisi", "Divisi", "Manajer", "Jenis Kepegawaian", "Tanggal Bergabung", "Status Kepegawaian", "Akhir Kontrak", "Status"];
    const row = createHrRow("employee-1", headers, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);
    const columns = columnsFor(headers);
    expect(columns).toHaveLength(10);
    expect(columns.map((column) => column.key)).toHaveLength(10);
    expect(columns[4]?.render(row, 4)).toBe("E");
    expect(columns[5]?.render(row, 5)).toBe("F");
    expect(columns[8]?.render(row, 8)).toBe("I");
    expect(columns[9]?.render(row, 9)).toBe("J");
  });

  it("keeps HR authority boundaries and privacy source-honest", () => {
    const source = readFileSync(resolve("src/features/hr/hr-pages.tsx"), "utf8");
    const detailSource = readFileSync(resolve("src/features/hr/shared/hr-detail-page.tsx"), "utf8");
    const forms = readFileSync(resolve("docs/hr-form-requirements.md"), "utf8");
    const decisions = readFileSync(resolve("docs/hr-business-state-decisions.md"), "utf8");
    expect(source).not.toContain("Rp0");
    expect(source).not.toMatch(/AI.*(hire|reject|promote|terminate)/i);
    expect(source).not.toMatch(/Proceed|Hold|Reject/);
    expect(detailSource).toContain("Informasi kompensasi memerlukan kewenangan khusus");
    expect(detailSource).toContain("Data rekening dibatasi");
    expect(detailSource).toContain("Data pajak dibatasi");
    expect(forms.match(/\| hr\.offer\.create \|[^\n]+/i)?.[0]).toContain("| Kandidat, Posisi |");
    expect(forms.match(/\| hr\.offer\.create \|[^\n]+/i)?.[0]).toContain("Jenis Kepegawaian, Tanggal Mulai yang Diusulkan, Paket Kompensasi, Benefit, Referensi Kontrak, Catatan");
    expect(forms.match(/\| hr\.offer\.create \|[^\n]+/i)?.[0]).not.toContain("tanggal, catatan");
    expect(decisions).toContain("Siapa pemilik perhitungan payroll?");
    expect(decisions).toContain("bukan keputusan hire, reject, promote, terminate");
    expect(decisions).toContain("Finance memiliki pembayaran, settlement, dan rekonsiliasi");
    expect(decisions).toContain("IT/Identity menjalankan provisioning dan revocation");
    expect(decisions).toContain("classification PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED policy");
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
    expect(ui).toContain("<FormField");
  });
});
