import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AraRoute from "@/app/workspace/[workspaceKey]/(assistant)/ara/page";
import {
  buildAraThreadKey,
  extractAraContext,
  isThreadWithinBoundary,
  type AraThreadIdentity,
} from "@/features/ara";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import type { SessionProjection } from "@/features/session";
import * as api from "@/lib/api";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/property/ara",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
}));

function makeSession(
  workspaceKey: string,
  divisionCode: string,
  workspaceName: string,
  workspaceType: "BUSINESS" | "EXECUTIVE" | "IT_OPERATIONS" = "BUSINESS",
  permissionRefs: string[] = ["task.view", "project.view"],
): SessionProjection {
  const principal: AuthenticatedPrincipalProjection = {
    actor: {
      actor_id: `actor_${workspaceKey}`,
      active: true,
      display_name: `User ${workspaceName}`,
      organization_id: "org_andara",
      tenant_id: "tenant_andara",
    },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: permissionRefs,
      role_refs: ["DIVISION_MEMBER"],
      scope_refs: [`scope_${workspaceKey}`],
      workspace: {
        active: true,
        division_code: divisionCode,
        organization_id: "org_andara",
        workspace_id: `ws_${workspaceKey}`,
        workspace_key: workspaceKey,
        workspace_name: workspaceName,
        workspace_type: workspaceType,
      },
    },
    email: `${workspaceKey}@andara.co.id`,
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };

  return { authenticated: true, principal };
}

describe("Universal ARA (Asisten Ruang Kerja)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("Universal Route & Shared Feature Across Workspaces", () => {
    it("renders Universal ARA for Sales workspace", async () => {
      const session = makeSession("penjualan-utama", "SALES", "Pusat Penjualan");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "penjualan-utama" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.getByText("Ruang kerja aktif: Pusat Penjualan")).toBeInTheDocument();
      expect(screen.getAllByText("Pusat Penjualan").length).toBeGreaterThanOrEqual(1);
    });

    it("renders Universal ARA for Property workspace", async () => {
      const session = makeSession("property", "PROPERTY", "Pusat Properti");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "property" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.getByText("Ruang kerja aktif: Pusat Properti")).toBeInTheDocument();
      expect(screen.getAllByText("Pusat Properti").length).toBeGreaterThanOrEqual(1);
    });

    it("renders Universal ARA for Finance workspace", async () => {
      const session = makeSession("keuangan", "FINANCE", "Pusat Keuangan");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "keuangan" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.getByText("Ruang kerja aktif: Pusat Keuangan")).toBeInTheDocument();
      expect(screen.getAllByText("Pusat Keuangan").length).toBeGreaterThanOrEqual(1);
    });

    it("renders Universal ARA for IT workspace", async () => {
      const session = makeSession("it-ops", "IT", "Operasional IT", "IT_OPERATIONS");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "it-ops" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.getByText("Ruang kerja aktif: Operasional IT")).toBeInTheDocument();
      expect(screen.getAllByText("Operasional IT").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Readiness State & No Fake Chat / Fake Answers", () => {
    it("displays honest unintegrated readiness status", async () => {
      const session = makeSession("property", "PROPERTY", "Pusat Properti");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "property" }} />);

      await waitFor(() => {
        expect(screen.getByText("ARA belum terhubung.")).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          "Integrasi ARA belum tersedia. Tidak ada percakapan atau jawaban yang dibuat secara simulasi.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "ARA hanya dapat membaca data sesuai ruang kerja, hak akses, ruang lingkup, dan klasifikasi yang berlaku.",
        ),
      ).toBeInTheDocument();
    });

    it("does not render fake chat inputs, assistant bubbles, or simulated responses", async () => {
      const session = makeSession("property", "PROPERTY", "Pusat Properti");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "property" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.queryByPlaceholderText(/Ketik pesan|Tanya apa saja/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.queryByText(/Halo! Ada yang bisa saya bantu/i)).not.toBeInTheDocument();
    });
  });

  describe("Context Derivation & No Raw Permission Leak", () => {
    it("extracts authoritative context from session projection", () => {
      const session = makeSession("keuangan", "FINANCE", "Pusat Keuangan", "BUSINESS", [
        "finance.report.view",
        "restricted.access",
      ]);
      const context = extractAraContext(session, "keuangan");

      expect(context).not.toBeNull();
      expect(context?.actor.actorId).toBe("actor_keuangan");
      expect(context?.activeWorkspace.workspaceKey).toBe("keuangan");
      expect(context?.maxClassification).toBe("RESTRICTED");
      expect(context?.classificationLabel).toBe("Sangat Rahasia (Restricted)");
    });

    it("does not leak raw permission strings to the rendered UI", async () => {
      const rawSecretPermission = "internal.secret.permission.leak_test";
      const session = makeSession("property", "PROPERTY", "Pusat Properti", "BUSINESS", [
        rawSecretPermission,
      ]);
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "property" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.queryByText(rawSecretPermission)).not.toBeInTheDocument();
    });

    it("does not infer RESTRICTED classification from Executive workspace or role", () => {
      const session = makeSession("pusat-kendali", "", "Pusat Kendali", "EXECUTIVE", [
        "strategy.company.manage",
      ]);
      const context = extractAraContext(session, "pusat-kendali");

      expect(context?.maxClassification).toBe("INTERNAL");
      expect(context?.classificationLabel).toBe("Internal Perusahaan");
    });
  });

  describe("Fail Closed on Mismatch or Unauthenticated", () => {
    it("fails closed when requested workspace does not match active workspace in session", async () => {
      const session = makeSession("property", "PROPERTY", "Pusat Properti");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

      render(<AraRoute params={{ workspaceKey: "penjualan-utama" }} />);

      expect(
        await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Tanya ARA" })).not.toBeInTheDocument();
    });

    it("fails closed when session is unauthenticated", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: false,
        principal: null,
      });

      render(<AraRoute params={{ workspaceKey: "property" }} />);

      expect(
        await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Tanya ARA" })).not.toBeInTheDocument();
    });
  });

  describe("Thread Boundary & Isolation Model", () => {
    it("builds deterministic thread key containing actor, workspace, classification, and scope", () => {
      const identity: AraThreadIdentity = {
        actorId: "actor_123",
        classification: "INTERNAL",
        organizationId: "org_andara",
        scopeRefs: ["scope_finance", "scope_general"],
        tenantId: "tenant_andara",
        threadId: "th_abc456",
        workspaceId: "ws_keuangan",
        workspaceKey: "keuangan",
      };

      const key = buildAraThreadKey(identity);
      expect(key).toBe("ara:tenant_andara:org_andara:keuangan:actor_123:INTERNAL:scope_finance,scope_general:th_abc456");
    });

    it("validates whether thread is within authoritative boundary", () => {
      const session = makeSession("property", "PROPERTY", "Pusat Properti");
      const context = extractAraContext(session, "property");
      expect(context).not.toBeNull();

      const validThread: AraThreadIdentity = {
        actorId: context!.actor.actorId,
        classification: "INTERNAL",
        organizationId: context!.organizationId,
        scopeRefs: ["scope_property"],
        tenantId: context!.tenantId,
        threadId: "th_prop_1",
        workspaceId: context!.activeWorkspace.workspaceId,
        workspaceKey: "property",
      };

      const invalidThreadDiffActor: AraThreadIdentity = {
        ...validThread,
        actorId: "actor_other",
      };

      const invalidThreadDiffWorkspace: AraThreadIdentity = {
        ...validThread,
        workspaceId: "ws_other",
        workspaceKey: "sales",
      };

      const invalidThreadDiffTenant: AraThreadIdentity = {
        ...validThread,
        tenantId: "tenant_other",
      };

      const invalidThreadDiffOrganization: AraThreadIdentity = {
        ...validThread,
        organizationId: "org_other",
      };

      const invalidThreadOutsideScope: AraThreadIdentity = {
        ...validThread,
        scopeRefs: ["scope_other"],
      };

      const invalidThreadHigherClassification: AraThreadIdentity = {
        ...validThread,
        classification: "RESTRICTED",
      };

      expect(isThreadWithinBoundary(validThread, context!)).toBe(true);
      expect(isThreadWithinBoundary(invalidThreadDiffActor, context!)).toBe(false);
      expect(isThreadWithinBoundary(invalidThreadDiffWorkspace, context!)).toBe(false);
      expect(isThreadWithinBoundary(invalidThreadDiffTenant, context!)).toBe(false);
      expect(isThreadWithinBoundary(invalidThreadDiffOrganization, context!)).toBe(false);
      expect(isThreadWithinBoundary(invalidThreadOutsideScope, context!)).toBe(false);
      expect(isThreadWithinBoundary(invalidThreadHigherClassification, context!)).toBe(false);
    });
  });

  describe("Executive & Sales Migration to Universal ARA", () => {
    it("renders Universal ARA on executive route with authoritative Executive context", async () => {
      const execSession = makeSession("pusat-kendali", "", "Pusat Kendali", "EXECUTIVE", [
        "strategy.company.manage",
        "restricted.access",
      ]);
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(execSession);

      render(<AraRoute params={{ workspaceKey: "pusat-kendali" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.getByText("Ruang kerja aktif: Pusat Kendali")).toBeInTheDocument();
      expect(screen.getAllByText("Pusat Kendali").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Sangat Rahasia (Restricted)")).toBeInTheDocument();
      // Executive navigation is rendered
      expect(screen.getByRole("link", { name: "Brief Eksekutif" })).toHaveAttribute(
        "href",
        "/workspace/pusat-kendali/brief",
      );
      expect(screen.getByRole("link", { name: "Tanya ARA" })).toHaveAttribute(
        "href",
        "/workspace/pusat-kendali/ara",
      );
    });

    it("fails closed when a non-executive session attempts to access Executive ARA route", async () => {
      const salesSession = makeSession("penjualan-utama", "SALES", "Pusat Penjualan");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession);

      render(<AraRoute params={{ workspaceKey: "executive" }} />);

      expect(
        await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Tanya ARA" })).not.toBeInTheDocument();
    });

    it("renders Universal ARA on Sales route with authoritative Sales context", async () => {
      const salesSession = makeSession("penjualan-utama", "SALES", "Pusat Penjualan");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession);

      render(<AraRoute params={{ workspaceKey: "penjualan-utama" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.getByText("Ruang kerja aktif: Pusat Penjualan")).toBeInTheDocument();
      expect(screen.getAllByText("Pusat Penjualan").length).toBeGreaterThanOrEqual(1);
      // Sales navigation is rendered
      expect(screen.getByRole("link", { name: "Pipeline Penjualan" })).toHaveAttribute(
        "href",
        "/workspace/penjualan-utama/pipeline",
      );
      expect(screen.getByRole("link", { name: "Tanya ARA" })).toHaveAttribute(
        "href",
        "/workspace/penjualan-utama/ara",
      );
    });

    it("confirms identical core UI across Executive and Sales with distinct workspace context", async () => {
      // 1. Render Sales
      const salesSession = makeSession("penjualan-utama", "SALES", "Pusat Penjualan");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession);

      const { unmount } = render(<AraRoute params={{ workspaceKey: "penjualan-utama" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      expect(screen.getByText("ARA belum terhubung.")).toBeInTheDocument();
      expect(screen.getByText("Thread Terisolasi Berdasarkan Ruang Kerja")).toBeInTheDocument();
      expect(screen.getByText("Ruang kerja aktif: Pusat Penjualan")).toBeInTheDocument();

      unmount();

      // 2. Render Executive
      const execSession = makeSession("pusat-kendali", "", "Pusat Kendali", "EXECUTIVE");
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(execSession);

      render(<AraRoute params={{ workspaceKey: "pusat-kendali" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Tanya ARA" })).toBeInTheDocument();
      });
      // Exact same core UI elements
      expect(screen.getByText("ARA belum terhubung.")).toBeInTheDocument();
      expect(screen.getByText("Thread Terisolasi Berdasarkan Ruang Kerja")).toBeInTheDocument();
      // But distinct authoritative workspace context
      expect(screen.getByText("Ruang kerja aktif: Pusat Kendali")).toBeInTheDocument();
    });
  });
});
