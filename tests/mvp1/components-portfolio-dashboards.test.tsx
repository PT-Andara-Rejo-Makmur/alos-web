import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DivisionsOverviewContent, ProjectPortfolioContent } from "@/features/mvp1/components/portfolio-dashboards";
import type { DivisionsOverviewSnapshot, ProjectPortfolioSnapshot } from "@/features/mvp1/lib/portfolio";

const trend = [{ period: "2026-09", label: "Sep", value: 62.5 }];

describe("portfolio dashboards", () => {
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

  it("renders project records, milestones, and risk summary", () => {
    const dashboard: ProjectPortfolioSnapshot = {
      generated_at: "2026-09-08T03:24:00Z",
      metrics: { total: 1, on_track: 0, at_risk: 1, critical: 0, completed: 0 },
      progress: trend,
      distribution: [{ status: "AT_RISK", label: "At Risk", count: 1 }],
      projects: [{
        project_id: "00000000-0000-0000-0000-000000000003",
        workspace_id: "00000000-0000-0000-0000-000000000001",
        code: "ALOS-PLATFORM",
        name: "ALOS Platform",
        division_code: "IT",
        division_name: "Information Technology",
        workspace_name: "Technology",
        category: "Technology",
        owner_name: "Budi Santoso",
        progress_percent: 62.5,
        deadline: "2026-12-31",
        status: "AT_RISK",
        budget_planned: 100000000,
        budget_spent: 62500000,
        currency: "IDR",
        overdue_tasks: 2,
      }],
      milestones: [{
        milestone_id: "00000000-0000-0000-0000-000000000004",
        project_id: "00000000-0000-0000-0000-000000000003",
        project_name: "ALOS Platform",
        title: "Release staging",
        due_date: "2026-09-30",
        status: "AT_RISK",
      }],
      risk_summary: [{ status: "AT_RISK", count: 1, description: "Perlu mitigasi." }],
      filter_options: { divisions: ["IT"], categories: ["Technology"], statuses: ["AT_RISK"] },
      pagination: { page: 1, page_size: 20, total_items: 1, total_pages: 1 },
    };

    const html = renderToStaticMarkup(createElement(ProjectPortfolioContent, {
      dashboard,
      filters: {
        division_code: "",
        status: "",
        category: "",
        date_from: "",
        date_to: "",
        search: "",
        page: 1,
      },
      loading: false,
      onFiltersChange: () => undefined,
    }));
    expect(html).toContain("ALOS Platform");
    expect(html).toContain("Release staging");
    expect(html).toContain("Perlu mitigasi");
  });
});


