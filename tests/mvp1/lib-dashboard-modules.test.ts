import { describe, expect, it } from "vitest";

import { dashboardModules, isDashboardModuleKey } from "@/features/mvp1/lib/dashboard-modules";

describe("dashboard module routing", () => {
  it("keeps the operational modules explicitly allowlisted", () => {
    expect(Object.keys(dashboardModules)).toEqual([
      "divisions", "projects", "tasks", "approvals", "documents", "reports", "findings", "genesis", "settings",
    ]);
  });

  it("rejects unknown dashboard module routes", () => {
    expect(isDashboardModuleKey("projects")).toBe(true);
    expect(isDashboardModuleKey("not-a-module")).toBe(false);
  });
});


