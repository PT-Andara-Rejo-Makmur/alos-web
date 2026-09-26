import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DivisionsOverviewContent } from "@/features/projects/divisions-overview";
import type { DivisionsOverviewSnapshot } from "@/features/projects/portfolio";

const trend = [{ period: "2026-09", label: "Sep", value: 62.5 }];

describe("divisions overview dashboard", () => {
  it("renders persisted division health and issues", () => {
    const dashboard: DivisionsOverviewSnapshot = {
      generated_at: "2026-09-08T03:24:00Z",
      divisions: [{
        division_id: "00000000-0000-0000-0000-000000000001",
        division_code: "IT",
        division_name: "Information Technology",
        health: "ATTENTION",
        active_projects: 1,
        average_progress: 62.5,
        overdue_tasks: 2,
        pending_approvals: 1,
        open_issues: 1,
        critical_projects: 0,
        at_risk_projects: 1,
        trend,
      }],
      comparison: [],
      issues: [{
        issue_id: "00000000-0000-0000-0000-000000000002",
        division_code: "IT",
        division_name: "Information Technology",
        title: "Staging readiness",
        severity: "HIGH",
        owner_name: "Budi Santoso",
        status: "OPEN",
        due_date: "2026-09-20",
      }],
      attention: [],
    };

    const html = renderToStaticMarkup(createElement(DivisionsOverviewContent, { dashboard }));
    expect(html).toContain("IT");
    expect(html).toContain("62,5%");
    expect(html).toContain("Staging readiness");
  });
});
