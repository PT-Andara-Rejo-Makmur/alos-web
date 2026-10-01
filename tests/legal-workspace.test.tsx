import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import WorkspacePage from "@/app/workspace/page";
import WorkspaceKeyRoot from "@/app/workspace/[workspaceKey]/page";
import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import ReviewsRoute from "@/app/workspace/[workspaceKey]/(domain)/reviews/page";
import ContractDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/contracts/[contractId]/page";
import { hasLegalContext, activeLegalWorkspaceKey } from "@/features/legal/legal-model";
import { legalNavigation } from "@/features/legal/navigation";
import { LegalContractsPage, LegalRisksPage } from "@/features/legal";
import { resolveWorkspaceDomain } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/kepatuhan-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
}));

function legalSession(workspaceKey = "kepatuhan-utama", divisionCode = "LEGAL", workspaceType: "BUSINESS" | "EXECUTIVE" | "IT_OPERATIONS" = "BUSINESS") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_legal", active: true, display_name: "Legal Lead", organization_id: "org_1", tenant_id: "tenant_1" },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["DIVISION_LEAD"],
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, counts: {}, last_updated_at: null, source: { source: "legal", status: "CONNECTED_EMPTY", authoritative: true, last_updated_at: null } } as never);
  });
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

  it("reads Legal performance from Strategy and reviews from Legal", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([] as never);
    render(<PerformanceRoute params={{ workspaceKey: "kepatuhan-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Target & Kinerja" })).toBeInTheDocument();
    cleanup();
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], total: 0, source: { source: "legal", status: "CONNECTED_EMPTY", authoritative: true, last_updated_at: null } } as never);
    render(<ReviewsRoute params={{ workspaceKey: "kepatuhan-utama" }} />);
    expect(await screen.findByRole("tab", { name: "Due Diligence" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Item Due Diligence" })).toBeInTheDocument();
    expect(screen.getByText("Keputusan Legal Material")).toBeInTheDocument();
  });

  it("reads scoped Legal details and retains access checks", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    const read = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ contract_id: "contract-1", contract_number: "Recorded contract", status: "Legacy-Exact", allowed_transitions: [] } as never);
    render(<ContractDetailRoute params={{ workspaceKey: "kepatuhan-utama", contractId: "contract-1" }} />);
    expect(await screen.findByText("Recorded contract")).toBeInTheDocument();
    expect(screen.getByText("Legacy-Exact")).toBeInTheDocument();
    expect(read).toHaveBeenCalledWith("/api/v1/legal/contracts/contract-1", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    cleanup();
    render(<ContractDetailRoute params={{ workspaceKey: "kepatuhan-lain", contractId: "contract-1" }} />);
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

  it("connects risk and control tabs without a synthetic compliance score", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalRisksPage workspaceKey="kepatuhan-utama" />);
    expect(await screen.findByRole("tab", { name: "Risiko" })).toBeInTheDocument();
    screen.getByRole("tab", { name: "Kontrol Internal" }).click();
    await waitFor(() => expect(api.authenticatedApiRequest).toHaveBeenCalledWith("/api/v1/legal/controls?limit=100&offset=0", expect.any(Object)));
    expect(screen.getByText("Skor Kepatuhan Resmi")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Segarkan Data/ })).not.toBeInTheDocument();
  });

  it("does not introduce fake Legal data or duplicate universal ownership", () => {
    const featureTree = readFileSync(resolve("src/features/legal/index.ts"), "utf8");
    const source = readFileSync(resolve("src/features/legal/shared/legal-ui.tsx"), "utf8");
    expect(featureTree).not.toMatch(/legal-(projects|tasks|approvals|documents|reports|findings|ara)/);
    expect(source).not.toContain("LegalExtractionDrawer");
    expect(source).not.toMatch(/mock|fake|candidate.*value.*—/i);
    expect(readFileSync(resolve("src/features/legal/legal-model.ts"), "utf8")).not.toContain("legalStateLabel");
    expect(readFileSync(resolve("docs/legal-business-state-decisions.md"), "utf8")).toContain("Signature state");
    expect(readFileSync(resolve("src/app/navigation.ts"), "utf8")).not.toContain("/workspace/legal/");
  });

  it("locks Legal source-honesty and cross-domain authority boundaries", () => {
    const decisions = readFileSync(resolve("docs/legal-business-state-decisions.md"), "utf8");
    const crossDomain = readFileSync(resolve("docs/legal-cross-domain-matrix.md"), "utf8");
    expect(decisions).toContain("Dokumen tersedia tidak berarti Legal valid.");
    expect(decisions).toContain("Dokumen `APPROVED` tidak berarti Kontrak `ACTIVE`.");
    expect(decisions).toContain("PDF bertanda tangan yang diunggah tidak berarti tanda tangan terverifikasi.");
    expect(decisions).toContain("Permit yang belum dinilai tidak berarti aktif.");
    expect(decisions).toContain("Compliance yang belum dinilai tidak berarti patuh.");
    expect(decisions).toContain("Risk yang belum dinilai tidak berarti aman.");
    expect(decisions).toContain("Tidak adanya Finding tidak berarti patuh.");
    expect(decisions).toContain("Tenggat yang kosong tidak boleh dihitung atau dibuat oleh frontend.");
    expect(decisions).toContain("Amendment membuat versi/perubahan baru dan tidak menimpa versi asal.");
    expect(decisions).toContain("Review Legal berbeda dari Business Approval; Business Approval berbeda dari Signature/Execution.");
    expect(crossDomain).toContain("Legal tidak mengubah `Paid`, `Settlement`, atau `Reconciliation` Finance");
    expect(crossDomain).toContain("physical progress atau technical quantity Property");
    expect(crossDomain).toContain("booking atau pipeline Sales");
    expect(crossDomain).toContain("Project root, Document, Finding, Task, dan Approval Shared Work");
  });

  it("keeps unavailable signing and ARA explicit without editable unsupported fields", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(legalSession());
    render(<LegalContractsPage workspaceKey="kepatuhan-utama" />);
    expect(await screen.findByText("Signing dan Eksekusi Legal Final")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Telaah Dokumen" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Materialitas")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah Kontrak & Perjanjian" })).not.toBeInTheDocument();
  });


});
