import { describe, expect, it } from "vitest";

import {
  buildProjectPortfolioUrl,
  divisionHealthLabel,
  formatPortfolioPercent,
  projectStatusLabel,
} from "@/features/projects/portfolio";

describe("portfolio helpers", () => {
  it("builds only active project filters", () => {
    const url = buildProjectPortfolioUrl({
      division_code: "IT",
      status: "AT_RISK",
      category: "",
      date_from: "2026-01-01",
      date_to: "",
      search: "ALOS",
      page: 2,
    });

    expect(url).toContain("division_code=IT");
    expect(url).toContain("status=AT_RISK");
    expect(url).toContain("date_from=2026-01-01");
    expect(url).toContain("search=ALOS");
    expect(url).toContain("page=2");
    expect(url).not.toContain("category=");
  });

  it("formats governed status values for the interface", () => {
    expect(projectStatusLabel("ON_TRACK")).toBe("On Track");
    expect(divisionHealthLabel("NOT_CONNECTED")).toBe("Belum terhubung");
    expect(formatPortfolioPercent(null)).toBe("—");
  });
});
