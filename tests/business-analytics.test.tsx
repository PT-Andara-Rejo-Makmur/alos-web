import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AnalyticsPeriod, BusinessAnalyticsProjection } from "@/lib/contracts";
import { isBusinessAnalyticsProjection } from "@/lib/business-projection";
import { BreakdownChart, ExecutiveAnalyticsPanel, TrendChart } from "@/features/analytics/business-analytics";
import { authenticatedApiRequest } from "@/lib/api";

const period: AnalyticsPeriod = {
  from: "2026-01-01",
  to: "2026-12-31",
  granularity: "MONTH",
};

function salesProjection(): BusinessAnalyticsProjection {
  return {
    domain: "sales",
    generated_at: "2026-10-03T00:00:00Z",
    period,
    series: [
      {
        code: "closing_count",
        label: "Jumlah Closing selesai",
        unit: "COUNT",
        available: true,
        source: "Closing yang telah selesai",
        points: [],
      },
      {
        code: "closing_value",
        label: "Nilai Closing",
        unit: "AMOUNT",
        available: false,
        source: "Closing yang telah selesai",
        points: [],
      },
    ],
    breakdowns: [
      {
        code: "sales_funnel",
        label: "Sales Funnel",
        unit: "COUNT",
        available: true,
        source: "Peluang dengan status terbuka",
        items: [{ code: "Qualified", label: "Terkualifikasi", value: 0 }],
      },
    ],
    comparisons: [],
  };
}

function noResize() {
  vi.stubGlobal("ResizeObserver", class {
    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback([{ target, contentRect: { width: 720, height: 320 } } as ResizeObserverEntry], this as never);
    }
    unobserve() {}
    disconnect() {}
  });
}

describe("business analytics projection", () => {
  it("keeps an authoritative zero distinct from an unavailable series", () => {
    const projection = salesProjection();
    expect(isBusinessAnalyticsProjection(projection, "sales")).toBe(true);
    expect(projection.breakdowns[0].items[0].value).toBe(0);
    expect(projection.series[1].available).toBe(false);

    const malformed = {
      ...projection,
      series: [{ ...projection.series[1], points: [{ period: "2026-10-01", value: "100.00" }] }],
    };
    expect(isBusinessAnalyticsProjection(malformed, "sales")).toBe(false);

    const impossibleDate = {
      ...projection,
      period: { ...period, from: "2026-02-30" },
    };
    expect(isBusinessAnalyticsProjection(impossibleDate, "sales")).toBe(false);
  });

  it("shows no trend for an empty source and no fabricated data for an unavailable source", () => {
    const projection = salesProjection();
    render(
      <>
        <TrendChart series={projection.series[0]} period={period} generatedAt={projection.generated_at} />
        <TrendChart series={projection.series[1]} period={period} generatedAt={projection.generated_at} />
      </>,
    );
    expect(screen.getByText("Belum ada catatan pada periode ini.")).toBeInTheDocument();
    expect(screen.getByText("Belum tersedia")).toBeInTheDocument();
    expect(screen.queryByRole("application")).not.toBeInTheDocument();
  });

  it("keeps canonical zero visible in the textual breakdown fallback", () => {
    noResize();
    const projection = salesProjection();
    const breakdown = projection.breakdowns[0];
    render(<BreakdownChart breakdown={breakdown} generatedAt={projection.generated_at} />);
    fireEvent.click(screen.getByText("Lihat data dalam tabel"));
    expect(screen.getByRole("cell", { name: "0" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Terkualifikasi" })).toBeInTheDocument();
  });

  it("preserves exact monetary precision in the textual fallback", () => {
    noResize();
    const breakdown = {
      ...salesProjection().breakdowns[0],
      unit: "AMOUNT" as const,
      items: [{ code: "exposure", label: "Piutang terbuka", value: "98765432109876543210.05" }],
    };
    const { container } = render(<BreakdownChart breakdown={breakdown} generatedAt="2026-10-03T00:00:00Z" />);
    fireEvent.click(container.querySelector("summary")!);
    expect(screen.getByRole("cell", { name: "Rp 98.765.432.109.876.543.210,05" })).toBeInTheDocument();
  });

  it("requests one executive company analytics projection and does not expose record IDs", async () => {
    noResize();
    const projectId = "project-raw-id-should-not-render";
    const executiveProjection: BusinessAnalyticsProjection = {
      ...salesProjection(),
      domain: "executive",
      comparisons: [
        {
          code: "project_progress",
          label: "Progres proyek",
          unit: "PERCENT",
          available: true,
          source: "Progres dari tugas aktif pada proyek yang dapat diakses",
          items: [{ code: projectId, label: "The Park", value: 68, target_value: null, actual_value: null, forecast_value: null }],
        },
        {
          code: "strategy_target_actual_count",
          label: "Target, aktual, dan perkiraan perusahaan",
          unit: "COUNT",
          available: true,
          source: "Observasi target strategi perusahaan yang dipilih",
          items: [{ code: "target-id", label: "Closing perusahaan", value: 2, target_value: 3, actual_value: 2, forecast_value: 4 }],
        },
      ],
    };
    const request = vi.mocked(authenticatedApiRequest);
    request.mockResolvedValue(executiveProjection as never);

    render(<ExecutiveAnalyticsPanel />);
    expect(await screen.findByText("Kinerja Perusahaan")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Progres proyek" })).toBeInTheDocument();
    expect(screen.getByText("The Park")).toBeInTheDocument();
    expect(screen.queryByText(projectId)).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatch(/^\/api\/v1\/business\/executive\/analytics\?/);
  });
});
