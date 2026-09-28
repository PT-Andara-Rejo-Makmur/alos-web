import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { navigationForSession } from "@/app/navigation";
import { SalesReadinessPage, SalesSharedWorkPage } from "@/features/sales";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/penjualan-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

function salesSession(workspaceKey = "penjualan-utama") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: {
      actor_id: "actor_sales",
      active: true,
      display_name: "Rani Penjualan",
      organization_id: "org_andara",
      tenant_id: "tenant_andara",
    },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["WORKSPACE_MEMBER"],
      scope_refs: ["workspace_penjualan"],
      workspace: {
        active: true,
        division_code: "SALES",
        organization_id: "org_andara",
        workspace_id: "workspace_penjualan",
        workspace_key: workspaceKey,
        workspace_name: "Pusat Penjualan",
        workspace_type: "BUSINESS",
      },
    },
    email: "rani@andara.co.id",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };

  return { authenticated: true, principal };
}

describe("Sales workspace", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("membangun menu Sales dari active workspace Backend tanpa Beranda generik", () => {
    const session = salesSession();
    const sections = navigationForSession(false, "penjualan-utama", false, session);

    expect(sections.map((section) => section.label)).toEqual([
      "PUSAT PENJUALAN",
      "PELANGGAN & AKTIVITAS",
      "MARKETING & KINERJA",
      "PEKERJAAN",
      "ARA",
    ]);
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).toEqual([
      "Ringkasan", "Pipeline Penjualan", "Prospek & Lead", "Aktivitas & Tindak Lanjut",
      "Booking & Closing", "KPR & Akad", "Campaign & Channel", "Target & Kinerja",
      "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA",
    ]);
    expect(sections.flatMap((section) => section.items).map((item) => item.href)).toContain(
      "/workspace/penjualan-utama/kpr",
    );
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).not.toContain("Beranda");
  });

  it("menolak URL workspace yang tidak sama dengan projection aktif", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(salesSession());

    render(
      <SalesReadinessPage
        description="Uji akses"
        detail="Sumber data belum tersedia."
        title="Pipeline Penjualan"
        workspaceKey="workspace-lain"
      />,
    );

    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    expect(screen.queryByText("Pipeline Penjualan")).not.toBeInTheDocument();
  });

  it("menampilkan readiness jujur tanpa nilai bisnis rekaan", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(salesSession());

    render(
      <SalesReadinessPage
        description="Uji tampilan"
        detail="Pipeline belum terhubung."
        title="Pipeline Penjualan"
        workspaceKey="penjualan-utama"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Pipeline Penjualan" })).toBeInTheDocument();
    });
    expect(screen.getByText("Belum Terhubung")).toBeInTheDocument();
    expect(screen.queryByText(/Rp\s*0|0%|Aman/i)).not.toBeInTheDocument();
  });

  it("Sales Shared Work Documents renders inside a single AppShell", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession("penjualan-utama"));
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(
      new api.ApiError(404, "Not Found", "corr_404"),
    );

    render(
      <SalesSharedWorkPage
        module="documents"
        workspaceKey="penjualan-utama"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dokumen" })).toBeInTheDocument();
    });

    // Semantic queries: single shell check
    expect(screen.getAllByRole("link", { name: "ALOS" })).toHaveLength(1);
    expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Buka navigasi" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Pilih workspace" })).toHaveLength(1);

    // Source honesty: unavailable message present, empty state absent
    expect(screen.getByText("Data Dokumen Belum Terhubung")).toBeInTheDocument();
    expect(
      screen.getByText("Data dokumen belum terhubung. Daftar dokumen akan ditampilkan setelah sumber data tersedia."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Belum ada dokumen yang dapat Anda akses.")).not.toBeInTheDocument();
  });

  it.each([
    ["projects", "Proyek"],
    ["tasks", "Tugas"],
    ["approvals", "Persetujuan"],
    ["reports", "Laporan"],
    ["findings", "Temuan"],
  ] as const)(
    "Sales Shared Work %s renders inside a single AppShell",
    async (module, heading) => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(salesSession("penjualan-utama"));
      vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(
        new api.ApiError(404, "Not Found", `corr_404_${module}`),
      );

      render(
        <SalesSharedWorkPage
          module={module}
          workspaceKey="penjualan-utama"
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      });

      expect(screen.getAllByRole("link", { name: "ALOS" })).toHaveLength(1);
      expect(screen.getAllByLabelText("Navigasi utama")).toHaveLength(1);
      expect(screen.getAllByRole("navigation", { name: "Menu aplikasi" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Buka navigasi" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Pilih workspace" })).toHaveLength(1);
    },
  );
});
