import { describe, expect, it } from "vitest";

import { canOpenGovernance, getDashboardProfile } from "@/features/mvp1/lib/dashboard-access";

describe("dashboard role profiles", () => {
  it("gives director precedence when an account has multiple roles", () => {
    const profile = getDashboardProfile(["IT_LEAD", "DIRECTOR"], ["IT"]);

    expect(profile.persona).toBe("director");
    expect(profile.homeLabel).toBe("Executive Dashboard");
    expect(profile.divisionLabel).toBe("IT");
  });

  it("presents the legacy QA role as Wakil IT without changing its permission code", () => {
    const profile = getDashboardProfile(["QA_SECURITY"], []);

    expect(profile.persona).toBe("deputy_it");
    expect(profile.roleLabel).toBe("Wakil IT");
    expect(profile.governanceVisible).toBe(true);
  });

  it("keeps a standard member out of governance navigation", () => {
    const profile = getDashboardProfile([], ["PROPERTY"]);

    expect(profile.persona).toBe("member");
    expect(profile.homeLabel).toBe("My Work");
    expect(profile.divisionLabel).toBe("Property");
    expect(canOpenGovernance([])).toBe(false);
  });
});


