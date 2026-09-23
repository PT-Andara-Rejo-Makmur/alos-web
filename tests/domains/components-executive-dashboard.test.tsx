import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ExecutiveHomeDashboard,
  formatJakartaDate,
  formatJakartaTime,
} from "@/features/executive-dashboard/workspace-dashboard";
import type { ExecutiveDashboardSnapshot } from "@/features/executive-dashboard/legacy-projection";

const snapshot: ExecutiveDashboardSnapshot = {
  generated_at: "2026-09-08T03:24:00Z",
  profile: {
    display_name: "Arief Budiman",
    organization_name: "PT Andara Rejo Makmur",
    role_label: "Direktur Utama",
  },
  metrics: [
    {
      key: "active_projects",
      label: "Total Proyek Aktif",
      value: null,
      unit: "COUNT",
      tone: "SUCCESS",
      state: "NOT_CONNECTED",
      context: "Sumber proyek belum terhubung",
    },
    {
      key: "average_progress",
      label: "Progress Rata-rata",
      value: null,
      unit: "PERCENT",
      tone: "WARNING",
      state: "NOT_CONNECTED",
      context: "Milestone belum terhubung",
    },
    {
      key: "overdue_tasks",
      label: "Task Overdue",
      value: null,
      unit: "COUNT",
      tone: "DANGER",
      state: "NOT_CONNECTED",
      context: "Task belum terhubung",
    },
    {
      key: "pending_approvals",
      label: "Approval Pending",
      value: 1,
      unit: "COUNT",
      tone: "INFO",
      state: "LIVE",
      context: "Data live",
    },
  ],
  performance: {
    title: "Rasio keputusan yang disetujui",
    context: "Berdasarkan review terdaftar.",
    points: [
      { period: "2026-08", label: "Agu", value: 50, decision_count: 2 },
      { period: "2026-09", label: "Sep", value: 75, decision_count: 4 },
    ],
  },
  project_distribution: {
    available: false,
    total: 0,
    context: "Distribusi akan aktif setelah sumber proyek kanonis terhubung.",
    items: [
      { key: "COMPLETED", label: "Selesai", count: 0, tone: "BLUE" },
      { key: "ON_TRACK", label: "On Track", count: 0, tone: "GREEN" },
      { key: "AT_RISK", label: "At Risk", count: 0, tone: "AMBER" },
      { key: "CRITICAL", label: "Critical", count: 0, tone: "RED" },
    ],
  },
  divisions: [
    {
      division_code: "PROPERTY",
      division_name: "Property",
      health: "ATTENTION",
      document_count: 4,
      pending_approvals: 1,
      active_genesis_workflows: 2,
    },
  ],
  attention_projects: [],
  pending_approvals: [
    {
      approval_id: "a62a8cb5-c732-4dc1-af8b-c6bdaed2f990",
      kind: "DOCUMENT",
      title: "Analisis Genesis",
      requested_by: "Arief Budiman",
      workspace_name: "Executive",
      submitted_at: "2026-09-08T02:00:00Z",
      age_days: 0,
      urgency: "NORMAL",
    },
  ],
};

describe("ExecutiveHomeDashboard", () => {
  it("renders live governance data and explicit unavailable business sources", () => {
    const html = renderToStaticMarkup(<ExecutiveHomeDashboard dashboard={snapshot} />);

    expect(html).toContain("Kinerja Perusahaan");
    expect(html).toContain("Approval Pending");
    expect(html).toContain("Analisis Genesis");
    expect(html).toContain("Ringkasan Per Divisi");
    expect(html).toContain("Sumber proyek belum terhubung");
    expect(html).not.toContain(">12<");
  });

  it("formats the topbar clock explicitly in Western Indonesian Time", () => {
    const instant = new Date("2026-09-09T03:04:00Z");

    expect(formatJakartaDate(instant)).toBe("Rabu, 09 September 2026");
    expect(formatJakartaTime(instant)).toBe("10.04 WIB");
  });
});
