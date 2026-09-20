import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AraContextPanel,
  backendAraContextAdapter,
  type AraActiveContextProjection,
  type AraContextAdapter,
} from "@/experiences/ara";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("ARA Context UX", () => {
  it("merender state LOADING dengan indikator visual yang jelas", () => {
    // Adapter that never resolves during render to stay in loading
    const pendingAdapter: AraContextAdapter = {
      loadContext: () => new Promise(() => {}),
    };

    render(<AraContextPanel adapter={pendingAdapter} />);

    expect(screen.getByTestId("ara-context-loading")).toBeInTheDocument();
    expect(
      screen.getByText("Memuat Konteks Aktif dari Backend…"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mengambil wewenang dan batasan konteks dari ALOS Backend…"),
    ).toBeInTheDocument();
  });

  it("merender state ACTIVE summary berdasarkan data authoritative Backend", () => {
    const activeProjection: AraActiveContextProjection = {
      state: "ACTIVE",
      contextId: "ctx_prod_001",
      workspaceId: "workspace-properti-utama",
      tenantId: "tenant-andara-rejo",
      actorId: "actor-lead-analyst",
      dataClassification: "INTERNAL",
      scopeRefs: ["scope.property.research", "scope.market.analysis"],
      correlationId: "corr_ara_active_123",
      evidenceRefs: [
        {
          evidence_id: "evi_001",
          source_id: "SOP-PERUSAHAAN-2026",
          uri: "https://docs.andara.internal/sop-001",
          captured_at: "2026-09-19T10:00:00Z",
          content_hash: "hash_sop_123",
          source_type: "INTERNAL",
          freshness: "CURRENT",
          validation_status: "VALID",
          data_classification: "INTERNAL",
          excerpt: "SOP resmi perusahaan mengenai tata kelola pengembangan lahan.",
        },
      ],
    };

    render(<AraContextPanel initialProjection={activeProjection} />);

    expect(screen.getByTestId("ara-context-active")).toBeInTheDocument();
    expect(screen.getByText("Konteks Aktif Terverifikasi Server")).toBeInTheDocument();
    expect(screen.getByText("workspace-properti-utama")).toBeInTheDocument();
    expect(screen.getByText("tenant-andara-rejo")).toBeInTheDocument();
    expect(screen.getByText("scope.property.research")).toBeInTheDocument();
    expect(screen.getByText("scope.market.analysis")).toBeInTheDocument();
    expect(screen.getByText("corr_ara_active_123")).toBeInTheDocument();
    expect(screen.getByText("SOP-PERUSAHAAN-2026")).toBeInTheDocument();
  });

  it("merender state DENIED ketika Backend menolak otorisasi konteks", () => {
    const deniedProjection: AraActiveContextProjection = {
      state: "DENIED",
      contextId: "ctx_denied_002",
      workspaceId: "workspace-rahasia",
      tenantId: "tenant-andara-rejo",
      denialReason: "Principal tidak memiliki hak akses untuk division scope ini.",
      correlationId: "corr_ara_denied_456",
    };

    render(<AraContextPanel initialProjection={deniedProjection} />);

    expect(screen.getByTestId("ara-context-denied")).toBeInTheDocument();
    expect(screen.getByText("Akses Konteks Ditolak oleh Backend")).toBeInTheDocument();
    expect(
      screen.getByText("Principal tidak memiliki hak akses untuk division scope ini."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ref: corr_ara_denied_456")).toBeInTheDocument();
    // Verify no claim of ACTIVE state
    expect(screen.queryByText("Konteks Aktif Terverifikasi Server")).not.toBeInTheDocument();
  });

  it("merender state NEEDS_INFO ketika Backend meminta informasi tambahan", () => {
    const needsInfoProjection: AraActiveContextProjection = {
      state: "NEEDS_INFO",
      contextId: "ctx_needs_info_003",
      workspaceId: "workspace-properti-utama",
      needsInfoReason:
        "Backend memerlukan konfirmasi scope proyek sebelum mengaktifkan konteks.",
      correlationId: "corr_ara_needs_info_789",
    };

    render(<AraContextPanel initialProjection={needsInfoProjection} />);

    expect(screen.getByTestId("ara-context-needs-info")).toBeInTheDocument();
    expect(screen.getByText("Informasi Tambahan Diperlukan")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Backend memerlukan konfirmasi scope proyek sebelum mengaktifkan konteks.",
      ),
    ).toBeInTheDocument();
  });

  it("merender state UNAVAILABLE secara jujur tanpa mengklaim authorized", () => {
    const unavailableProjection: AraActiveContextProjection = {
      state: "UNAVAILABLE",
      correlationId: "corr_ara_unavail_000",
    };

    render(<AraContextPanel initialProjection={unavailableProjection} />);

    expect(screen.getByTestId("ara-context-unavailable")).toBeInTheDocument();
    expect(screen.getByText("Konteks Backend Tidak Tersedia")).toBeInTheDocument();
    expect(screen.getByText("UNAVAILABLE")).toBeInTheDocument();
    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();
  });

  it("menegaskan bahwa local state tidak dapat mengklaim ACTIVE tanpa data Backend", async () => {
    // Adapter that fails
    const failingAdapter: AraContextAdapter = {
      loadContext: () => Promise.reject(new Error("Network disconnect")),
    };

    render(<AraContextPanel adapter={failingAdapter} />);

    // Must resolve to UNAVAILABLE, never silently claim ACTIVE or AUTHORIZED
    const unavailableHeading = await screen.findByText(
      "Konteks Backend Tidak Tersedia",
    );
    expect(unavailableHeading).toBeInTheDocument();
    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();
  });

  it("tidak membuat konteks ACTIVE ketika endpoint projection Backend tidak tersedia", async () => {
    vi.stubEnv("NEXT_PUBLIC_ALOS_API_BASE_URL", "http://backend.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "NOT_FOUND",
            message: "Context projection endpoint is unavailable",
            correlation_id: "corr_context_missing",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    const result = await backendAraContextAdapter.loadContext();

    expect(result.state).toBe("UNAVAILABLE");
    expect(result.contextId).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "http://backend.test/api/v1/genesis/context-options",
      expect.any(Object),
    );
  });
});
