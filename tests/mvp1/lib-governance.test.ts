import { describe, expect, it } from "vitest";

import { apiErrorDetail, canChangeBudget, remainingBudget, type Budget, type Usage } from "@/features/mvp1/lib/governance";

const budget: Budget = {
  workspace_id: "workspace-1",
  daily_request_limit: 2,
  daily_output_token_limit: 2400,
  daily_cost_cap_usd: "0.25",
};

const usage: Usage = {
  workspace_id: "workspace-1",
  request_count: 1,
  input_tokens: 42,
  output_tokens: 1200,
  estimated_cost_usd: "0.10",
};

describe("Governance Dashboard helpers", () => {
  it("extracts only a string API error detail", () => {
    expect(apiErrorDetail({ detail: "safe message" })).toBe("safe message");
    expect(apiErrorDetail({ detail: { internal: "ignored" } })).toBeUndefined();
    expect(apiErrorDetail(null)).toBeUndefined();
  });

  it("allows budget changes only for Director or IT Lead", () => {
    expect(canChangeBudget(["DIRECTOR"])).toBe(true);
    expect(canChangeBudget(["IT_LEAD"])).toBe(true);
    expect(canChangeBudget(["DIVISION_OWNER"])).toBe(false);
  });

  it("never reports a negative daily remainder", () => {
    expect(remainingBudget(budget, usage)).toEqual({ requests: 1, tokens: 1200, cost: "0.1500" });
    expect(
      remainingBudget(budget, {
        ...usage,
        request_count: 9,
        output_tokens: 9999,
        estimated_cost_usd: "1",
      }),
    ).toEqual({ requests: 0, tokens: 0, cost: "0.0000" });
  });
});


