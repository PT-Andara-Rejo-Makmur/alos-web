import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  BusinessDashboardFoundation,
  DASHBOARD_REQUIREMENTS,
  formatBusinessValue,
  isLifecycleState,
  isPerformanceState,
  resolveDataReadiness,
  type PerformanceMetric,
} from "@/features/business-foundation";
import { getStrategyRoute, isKnownStrategySubmodule } from "@/features/workspace-routing";
import { getStrategySubmodules } from "@/modules/strategy";

const NULL_SAFE_METRIC: PerformanceMetric = {
  metric_id: "presentation-ref",
  code: "KPI-TEST",
  name: "Null-safe metric",
  description: null,
  measurement_type: "HIGHER_IS_BETTER",
  unit: "COUNT",
  scope: null,
  period: null,
  target: null,
  actual: null,
  forecast: null,
  assumption: null,
  variance: null,
  achievement_percent: null,
  performance_state: "NOT_EVALUATED",
  owner_role_ref: null,
  owner_workspace_ref: null,
  reviewer_role_refs: [],
  approver_role_ref: null,
  source_refs: [],
  evidence_refs: [],
  last_updated_at: null,
  verified_at: null,
};

describe("MVP-2 Stage 1 business foundation", () => {
  it("mendukung seluruh route Executive Strategy final", () => {
    const routes = ["renstra", "annual-plan", "targets", "objectives", "kpis", "initiatives", "reviews", "revisions", "sources"];
    for (const route of routes) {
      expect(isKnownStrategySubmodule(route)).toBe(true);
      expect(getStrategyRoute("executive", route)).toBe(`/workspace/executive/strategy/${route}`);
    }
    expect(getStrategyRoute("executive")).toBe("/workspace/executive/strategy");
    expect(getStrategyRoute("finance", "annual-plan")).toBe("/workspace/finance/strategy");
  });

  it("membuat navigasi Strategy context-aware dan RKAP hanya untuk Executive", () => {
    const executive = getStrategySubmodules("executive").map((item) => item.label);
    const division = getStrategySubmodules("finance").map((item) => item.label);
    expect(executive).toContain("RKAP & Rencana Kerja");
    expect(executive).toContain("Target Perusahaan");
    expect(division).not.toContain("RKAP & Rencana Kerja");
    expect(division).toContain("Target Divisi");
  });

  it("menjaga metric presentation null-safe tanpa mengubah null menjadi nol", () => {
    expect(NULL_SAFE_METRIC.target).toBeNull();
    expect(NULL_SAFE_METRIC.actual).toBeNull();
    expect(NULL_SAFE_METRIC.forecast).toBeNull();
    expect(NULL_SAFE_METRIC.assumption).toBeNull();
    expect(formatBusinessValue(NULL_SAFE_METRIC.actual?.value)).toBe("—");
    expect(formatBusinessValue(null)).not.toBe("0");
  });

  it("memisahkan lifecycle dari performance state", () => {
    expect(isLifecycleState("ACTIVE")).toBe(true);
    expect(isLifecycleState("ON_TRACK")).toBe(false);
    expect(isPerformanceState("ON_TRACK")).toBe(true);
    expect(isPerformanceState("ACTIVE")).toBe(false);
  });

  it("tidak mempromosikan sumber non-authoritative menjadi LIVE/HEALTHY", () => {
    expect(resolveDataReadiness(null, new Date(), 60_000)).toBe("NOT_CONNECTED");
    expect(resolveDataReadiness({ source_ref: null, label: null, authoritative: false, readiness: "LIVE", observed_at: new Date().toISOString() }, new Date(), 60_000)).toBe("NOT_CONNECTED");
  });

  it("merepresentasikan verification dan empat semantics nilai pada dashboard", () => {
    render(<BusinessDashboardFoundation dashboard="sales" />);
    expect(screen.getAllByText("Target").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Actual").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Forecast").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Assumption").length).toBeGreaterThan(0);
    expect(screen.getAllByText("UNVERIFIED").length).toBe(6);
    expect(screen.getByText("KPI-SM-06")).toBeInTheDocument();
  });

  it("memetakan seluruh area dan enam KPI pada setiap dashboard divisi", () => {
    for (const key of ["sales", "property", "finance", "legal", "hr", "it"] as const) {
      expect(DASHBOARD_REQUIREMENTS[key].areas.length).toBeGreaterThanOrEqual(11);
      expect(DASHBOARD_REQUIREMENTS[key].metrics).toHaveLength(6);
    }
    expect(DASHBOARD_REQUIREMENTS.executive.areas).toHaveLength(14);
  });
});
