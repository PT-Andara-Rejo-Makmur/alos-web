import { describe, expect, it, vi } from "vitest";
import type { PlanningAssumption } from "@/lib/contracts";
import type { StrategyRequest } from "@/modules/strategy/backend/strategy-api";
import { strategyApi } from "@/modules/strategy";

const original: PlanningAssumption = {
  assumption_id: "assumption.reviewed", version: 1, tenant_id: "tenant", organization_id: "org",
  owner_workspace_id: "workspace", category: "CONVERSION_RATIO", name: "Reviewed ratio", value: 0.3,
  unit: "RATIO", period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31" },
  scope: { type: "COMPANY", ref: null }, source_mode: "MANUAL_EVIDENCED", evidence_refs: ["evidence:ratio"],
  verification_state: "UNVERIFIED", owner_role_ref: "EXECUTIVE", lifecycle_state: "DRAFT",
};

describe("Strategy retained versions", () => {
  it("presents the latest assumption without mutating its retained history", async () => {
    const verified = { ...original, version: 2, verification_state: "VERIFIED" as const };
    const history = [verified, original];
    const request: StrategyRequest = async <T,>() => history as T;
    expect(await strategyApi.listAssumptions(undefined, request)).toEqual([verified]);
    expect(history).toEqual([verified, original]);
    expect(original.verification_state).toBe("UNVERIFIED");
  });

  it("sends an exact retained version when verifying an observation or archiving a plan", async () => {
    const calls = vi.fn();
    const request: StrategyRequest = async <T,>(path: string) => { calls(path); return {} as T; };
    await strategyApi.verifyObservation("target.versioned", "observation.original",
      { verification_state: "VERIFIED", reason: "Reviewed evidence" }, 1, request);
    expect(calls.mock.calls[0]?.[0]).toBe("/api/v1/strategy/targets/target.versioned/observations/observation.original/verification?version=1");
    await strategyApi.transitionPlan("plan.versioned", "archive", 1, request);
    expect(calls.mock.calls[1]?.[0]).toBe("/api/v1/strategy/plans/plan.versioned/archive?version=1");
  });
});
