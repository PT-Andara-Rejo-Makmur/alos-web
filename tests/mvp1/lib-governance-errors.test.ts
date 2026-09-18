import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { normalizeGovernanceError, runtimeNextAction } from "@/features/mvp1/lib/governance-errors";

describe("Governance error normalization", () => {
  it("explains SoD failures with a next action and reference", () => {
    expect(normalizeGovernanceError(new ApiError(409, "maker cannot act as checker", "corr-1"))).toEqual({
      title: "Separation of Duties memblokir aksi",
      reason: "Maker tidak boleh menjadi Checker pada release yang sama.",
      nextAction: "Gunakan QA atau Checker independen.",
      severity: "critical",
      status: 409,
      correlationId: "corr-1",
    });
  });

  it("maps runtime blockers to a concrete control area", () => {
    expect(runtimeNextAction("BUDGET_POLICY", "daily output token budget cap reached")).toContain("Budget");
    expect(runtimeNextAction("TOOL_OR_INPUT_BLOCKED", "permission evidence.read missing")).toContain("Permissions");
    expect(runtimeNextAction("TOOL_OR_INPUT_BLOCKED", "kill switch is active")).toContain("Kill Switch");
  });

  it("explains why a requester cannot silently become Release Maker", () => {
    const error = new ApiError(409, "an independent IT Lead release maker is required for this Agent request", "ref-maker");
    expect(normalizeGovernanceError(error)).toMatchObject({
      title: "Release Maker belum tersedia",
      correlationId: "ref-maker",
    });
  });

  it("keeps authorization, validation, rate limit, and server failures distinct", () => {
    expect(normalizeGovernanceError(new ApiError(403, "workspace denied", null)).title).toBe("Aksi tidak diizinkan");
    expect(normalizeGovernanceError(new ApiError(422, "field required", null)).title).toBe("Form belum dapat diproses");
    expect(normalizeGovernanceError(new ApiError(429, "budget exhausted", null)).title).toBe("Batas penggunaan tercapai");
    expect(normalizeGovernanceError(new ApiError(500, "database unavailable SQL password=secret", "corr-500"))).toMatchObject({
      title: "Layanan Governance mengalami gangguan", reason: "Server tidak dapat menyelesaikan permintaan ini.", correlationId: "corr-500",
    });
  });
});


