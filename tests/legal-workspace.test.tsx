import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import WorkspacePage from "@/app/workspace/page";
import WorkspaceKeyRoot from "@/app/workspace/[workspaceKey]/page";
import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import ReviewsRoute from "@/app/workspace/[workspaceKey]/(domain)/reviews/page";
import ContractDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/contracts/[contractId]/page";
import PermitDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/permits/[permitId]/page";
import CaseDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/cases/[caseId]/page";
import AssetDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/assets/[legalAssetId]/page";
import { hasLegalContext, activeLegalWorkspaceKey } from "@/features/legal/legal-model";
import { legalNavigation } from "@/features/legal/navigation";
import { LegalContractsPage, LegalPermitsPage, LegalReviewsPage, LegalRisksPage } from "@/features/legal";
import { LegalSourceStateView } from "@/features/legal/shared/legal-ui";
import { resolveWorkspaceDomain } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/kepatuhan-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
}));

function legalSession(workspaceKey = "kepatuhan-utama", divisionCode = "LEGAL", workspaceType: "BUSINESS" | "EXECUTIVE" = "BUSINESS") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_legal", active: true, display_name: "Legal Lead", organization_id: "org_1", tenant_id: "tenant_1" },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["WORKSPACE_LEAD"],
      scope_refs: [`workspace_${workspaceKey}`],
      workspace: { active: true, division_code: divisionCode, organization_id: "org_1", workspace_id: "ws_legal", workspace_key: workspaceKey, workspace_name: "Ruang Legal", workspace_type: workspaceType },
    },
    email: "legal@example.test",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };
  return { authenticated: true, principal };
}

describe("Legal workspace", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("uses canonical Legal authority and the actual workspace key", () => {
    const session = legalSession("legal & compliance");
    expect(hasLegalContext(session)).toBe(true);
    expect(activeLegalWorkspaceKey(session)).toBe("legal & compliance");
    expect(hasLegalContext(legalSession("sales-space", "SALES"))).toBe(false);
    expect(resolveWorkspaceDomain(session, "legal-lain")).toMatchObject({ valid: false, failureReason: "key_mismatch" });
  });

  it("builds the exact 16-menu Legal sidebar without a static Legal authority", () => {
    const sections = legalNavigation("legal & compliance");
    const hrefs = sections.flatMap((section) => section.items.map((item) => item.href));
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).toEqual([
      "Ringkasan", "Risiko & Kepatuhan", "Kontrak & Perjanjian", "Review Legal", "Perizinan", "Legalitas Proyek & Aset",
      "Sengketa & Klaim", "Kewajiban & Tenggat", "Target & Kinerja", "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA",
    ]);
    expect(hrefs).toContain("/workspace/legal%20%26%20compliance/summary");
    expect(hrefs.some((href) => href.startsWith("/workspace/legal/"))).toBe(false);
    expect(hrefs.filter((href) => href.endsWith("/projects"))).toHaveLength(1);
    expect(hrefs.filter((href) => href.endsWith("/ara"))).toHaveLength(1);
  });

  it("routes Legal root and summary to the canonical actual workspace key", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession("kepatuhan & utama"));
    render(<WorkspacePage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/kepatuhan%20%26%20utama/summary"));

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<WorkspaceKeyRoot params={{ workspaceKey: "kepatuhan-utama" }} />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/kepatuhan-utama/summary"));

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<SummaryRoute params={{ workspaceKey: "kepatuhan-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Legal" })).toBeInTheDocument();
  });

  it("dispatches Legal performance and reviews while preserving Executive and unsupported review collisions", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([] as never);
    render(<PerformanceRoute params={{ workspaceKey: "kepatuhan-utama" }} />);
    expect(await screen.findByRole("heading", { name: /Target & Kinerja/ })).toBeInTheDocument();
    expect(screen.getByText("Strategi")).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<ReviewsRoute params={{ workspaceKey: "kepatuhan-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Review Legal" })).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession("pusat-kendali", "EXECUTIVE", "EXECUTIVE"));
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([] as never);
    render(<ReviewsRoute params={{ workspaceKey: "pusat-kendali" }} />);
    expect(await screen.findByRole("heading", { name: "Review & Revisi" })).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession("sales-utama", "SALES"));
    render(<ReviewsRoute params={{ workspaceKey: "sales-utama" }} />);
    expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession("kepatuhan-utama"));
    render(<ReviewsRoute params={{ workspaceKey: "kepatuhan-lain" }} />);
    expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
  });

  it("keeps Legal detail routes authoritative and source-unavailable", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<ContractDetailRoute params={{ workspaceKey: "kepatuhan-utama", contractId: "contract-1" }} />);
    expect(await screen.findByRole("heading", { name: "Detail Kontrak" })).toBeInTheDocument();
    expect(screen.getByText(/sumber legal belum terhubung/)).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<PermitDetailRoute params={{ workspaceKey: "kepatuhan-utama", permitId: "permit-1" }} />);
    expect(await screen.findByRole("heading", { name: "Detail Perizinan" })).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<CaseDetailRoute params={{ workspaceKey: "kepatuhan-utama", caseId: "case-1" }} />);
    expect(await screen.findByRole("heading", { name: "Detail Kasus" })).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<AssetDetailRoute params={{ workspaceKey: "kepatuhan-utama", legalAssetId: "asset-1" }} />);
    expect(await screen.findByRole("heading", { name: "Detail Legalitas Proyek & Aset" })).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession("sales-utama", "SALES"));
    render(<ContractDetailRoute params={{ workspaceKey: "sales-utama", contractId: "contract-1" }} />);
    expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
  });

  it("fails closed for a mismatched Legal workspace route", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession("kepatuhan-utama"));
    render(<LegalContractsPage workspaceKey="kepatuhan-lain" />);
    expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kontrak & Perjanjian" })).not.toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession("sales-utama", "SALES"));
    render(<LegalRisksPage workspaceKey="sales-utama" />);
    expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
  });

  it("keeps source states mutually exclusive and Legal tabs functional", async () => {
    const cases = [["loading", "Memuat data"], ["unavailable", "Belum Terhubung"], ["error", "Data belum dapat dimuat"], ["connected-empty", "Belum ada data"]] as const;
    for (const [state, label] of cases) {
      const view = render(<LegalSourceStateView description="Status sumber" state={state} />);
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
      view.unmount();
    }
    const connected = render(<LegalSourceStateView description="Status sumber" state="connected-data"><span>Data resmi</span></LegalSourceStateView>);
    expect(screen.getByText("Data resmi")).toBeInTheDocument();
    connected.unmount();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalRisksPage workspaceKey="kepatuhan-utama" />);
    await screen.findByRole("heading", { name: "Risiko & Kepatuhan" });
    screen.getByRole("tab", { name: "Kepatuhan" }).click();
    expect(await screen.findByText("Kepatuhan Legal belum tersedia.")).toBeInTheDocument();
  });

  it("does not introduce fake Legal data or duplicate universal ownership", () => {
    const featureTree = readFileSync(resolve("src/features/legal/index.ts"), "utf8");
    const source = readFileSync(resolve("src/features/legal/shared/legal-ui.tsx"), "utf8");
    expect(featureTree).not.toMatch(/legal-(projects|tasks|approvals|documents|reports|findings|ara)/);
    expect(source).toContain("Belum ada kandidat ekstraksi.");
    expect(source).not.toMatch(/mock|fake|candidate.*value.*—/i);
    expect(readFileSync(resolve("src/features/legal/legal-model.ts"), "utf8")).not.toContain("legalStateLabel");
    expect(readFileSync(resolve("docs/legal-business-state-decisions.md"), "utf8")).toContain("Signature state");
    expect(readFileSync(resolve("src/app/navigation.ts"), "utf8")).not.toContain("/workspace/legal/");
  });

  it("keeps readiness forms controlled and extraction non-authoritative", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalContractsPage workspaceKey="kepatuhan-utama" />);
    await screen.findByRole("heading", { name: "Kontrak & Perjanjian" });
    screen.getByRole("button", { name: "Tambah Kontrak" }).click();
    const dialog = await screen.findByRole("dialog", { name: "Tambah Kontrak" });
    expect(within(dialog).getByRole("combobox", { name: "Jenis" })).toBeDisabled();
    expect(within(dialog).getByRole("combobox", { name: "Materialitas" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Simpan Kontrak" })).toBeDisabled();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalContractsPage workspaceKey="kepatuhan-utama" />);
    await screen.findByRole("heading", { name: "Kontrak & Perjanjian" });
    screen.getByRole("button", { name: "Ajukan Perubahan" }).click();
    expect(await screen.findByRole("dialog", { name: "Ajukan Perubahan Kontrak" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan Perubahan" })).toBeDisabled();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalReviewsPage workspaceKey="kepatuhan-utama" />);
    await screen.findByRole("heading", { name: "Review Legal" });
    screen.getByRole("button", { name: "Tambah Review" }).click();
    expect(await screen.findByRole("dialog", { name: "Tambah Review Legal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan Review" })).toBeDisabled();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalPermitsPage workspaceKey="kepatuhan-utama" />);
    await screen.findByRole("heading", { name: "Perizinan" });
    screen.getByRole("button", { name: "Ajukan Pembaruan" }).click();
    expect(await screen.findByRole("dialog", { name: "Ajukan Pembaruan Perizinan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan Pembaruan" })).toBeDisabled();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalRisksPage workspaceKey="kepatuhan-utama" />);
    await screen.findByRole("heading", { name: "Risiko & Kepatuhan" });
    screen.getByRole("button", { name: "Tambah Risiko" }).click();
    const riskDialog = await screen.findByRole("dialog", { name: "Tambah Risiko Legal" });
    expect(within(riskDialog).getByRole("combobox", { name: "Severity" })).toBeDisabled();
    expect(within(riskDialog).getByRole("button", { name: "Simpan Risiko" })).toBeDisabled();
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalContractsPage workspaceKey="kepatuhan-utama" />);
    await screen.findByRole("heading", { name: "Kontrak & Perjanjian" });
    screen.getByRole("button", { name: "Telaah Dokumen" }).click();
    expect(await screen.findByText("Belum ada kandidat ekstraksi.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Terima" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Abaikan" })).not.toBeInTheDocument();
  });
});
