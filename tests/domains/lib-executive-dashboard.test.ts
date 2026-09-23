import { describe, expect, it } from "vitest";

import {
  approvalAgeLabel,
  approvalKindLabel,
  executiveFirstName,
  executiveGreeting,
  formatExecutiveMetric,
} from "@/features/executive-dashboard/legacy-projection";

describe("executive dashboard presentation", () => {
  it("formats live and unavailable metrics without inventing data", () => {
    expect(formatExecutiveMetric({
      key: "pending_approvals",
      label: "Approval Pending",
      value: 7,
      unit: "COUNT",
      tone: "INFO",
      state: "LIVE",
      context: "Data live",
    })).toBe("7");
    expect(formatExecutiveMetric({
      key: "average_progress",
      label: "Progress Rata-rata",
      value: null,
      unit: "PERCENT",
      tone: "WARNING",
      state: "NOT_CONNECTED",
      context: "Belum terhubung",
    })).toBe("—");
  });

  it("builds natural Indonesian identity labels", () => {
    expect(executiveGreeting(new Date(2026, 8, 8, 12))).toBe("Selamat siang");
    expect(executiveGreeting(new Date(2026, 8, 8, 19))).toBe("Selamat malam");
    expect(executiveFirstName("Arief Budiman")).toBe("Arief");
    expect(approvalKindLabel("AGENT_RELEASE")).toBe("Release Agent");
    expect(approvalAgeLabel(0)).toBe("Hari ini");
    expect(approvalAgeLabel(4)).toBe("4 hari");
  });
});
