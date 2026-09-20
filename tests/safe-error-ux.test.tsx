import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { classifySafeError, SafeErrorView } from "@/features/evidence";
import { ApiRequestError } from "@/lib/api";

afterEach(cleanup);

describe("Safe Error UX", () => {
  it("menangani BLOCKED_SOURCE secara aman dengan tindakan lanjutan", () => {
    const error = new ApiRequestError(
      "Egress forbidden: Domain not whitelisted",
      403,
      "corr_blocked_001",
      "SOURCE_BLOCKED_BY_POLICY",
    );

    const safeDetails = classifySafeError(error);
    expect(safeDetails.kind).toBe("BLOCKED_SOURCE");

    render(<SafeErrorView safeDetails={safeDetails} />);

    expect(screen.getByText("Sumber Data Diblokir")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sumber data ini diblokir oleh kebijakan keamanan dan tata kelola ALOS Backend.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gunakan sumber internal yang telah disetujui/),
    ).toBeInTheDocument();
    expect(screen.getByText("Ref: corr_blocked_001")).toBeInTheDocument();
  });

  it("menangani UNAVAILABLE_EVIDENCE secara aman", () => {
    const error = new ApiRequestError(
      "Evidence reference not found in database",
      404,
      "corr_unavail_evi_002",
      "EVIDENCE_NOT_FOUND",
    );

    const safeDetails = classifySafeError(error);
    expect(safeDetails.kind).toBe("UNAVAILABLE_EVIDENCE");

    render(<SafeErrorView safeDetails={safeDetails} />);

    expect(screen.getByText("Evidence Tidak Tersedia")).toBeInTheDocument();
    expect(
      screen.getByText(/Evidence atau artefak rujukan yang diminta tidak ditemukan/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Muat ulang konteks aktif atau lakukan pendaftaran ulang/),
    ).toBeInTheDocument();
  });

  it("menangani GENESIS_TIMEOUT secara aman tanpa membocorkan infrastruktur AI", () => {
    const error = new ApiRequestError(
      "GENESIS upstream request timed out after 30000ms at http://genesis-ai:8100/internal/v1/analyze",
      504,
      "corr_timeout_003",
      "GENESIS_TIMEOUT",
    );

    const safeDetails = classifySafeError(error);
    expect(safeDetails.kind).toBe("GENESIS_TIMEOUT");
    expect(safeDetails.isRetryable).toBe(true);

    render(<SafeErrorView safeDetails={safeDetails} />);

    expect(
      screen.getByText("Batas Waktu Layanan AI (GENESIS)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Layanan penalaran GENESIS mengalami timeout atau sedang tidak dapat dijangkau oleh Backend.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tunggu beberapa saat dan ulangi permintaan Anda/),
    ).toBeInTheDocument();

    // Verify no leaks of internal URL or ports in DOM
    expect(screen.queryByText(/genesis-ai:8100/)).not.toBeInTheDocument();
    expect(screen.queryByText(/internal\/v1\/analyze/)).not.toBeInTheDocument();
  });

  it("menangani DENIED_SCOPE secara aman", () => {
    const error = new ApiRequestError(
      "Actor lacks permission: scope.property.market required",
      403,
      "corr_denied_scope_004",
      "SCOPE_DENIED",
    );

    const safeDetails = classifySafeError(error);
    expect(safeDetails.kind).toBe("DENIED_SCOPE");

    render(<SafeErrorView safeDetails={safeDetails} />);

    expect(screen.getByText("Akses Scope Ditolak")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Principal Anda tidak memiliki scope atau wewenang yang diizinkan oleh Backend untuk konteks ini.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hubungi Pemilik Workspace atau Penanggung Jawab Divisi/),
    ).toBeInTheDocument();
    expect(screen.getByText("Ref: corr_denied_scope_004")).toBeInTheDocument();
  });

  it("menegaskan bahwa DOM tidak pernah menampilkan stack trace atau secret", () => {
    const dirtyError = {
      message: "SecretTokenException: token=xoxb-12345-abcdef failed",
      stack:
        "Error: failed\n    at internalQuery (http://backend-db:5432/core.ts:12:3)",
      status: 500,
      code: "INTERNAL_ERROR",
      correlation_id: "corr_safe_999",
    };

    render(<SafeErrorView error={dirtyError} />);

    expect(screen.getByText("Layanan Backend Tidak Tersedia")).toBeInTheDocument();
    expect(screen.getByText("Ref: corr_safe_999")).toBeInTheDocument();

    // Check DOM for leakages
    expect(screen.queryByText(/xoxb-12345/)).not.toBeInTheDocument();
    expect(screen.queryByText(/backend-db:5432/)).not.toBeInTheDocument();
    expect(screen.queryByText(/internalQuery/)).not.toBeInTheDocument();
    expect(screen.queryByText(/SecretTokenException/)).not.toBeInTheDocument();
  });
});
