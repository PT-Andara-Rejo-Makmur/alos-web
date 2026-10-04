import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AnalyticsPeriod, BusinessAnalyticsProjection } from "@/lib/contracts";
import { isBusinessAnalyticsProjection } from "@/lib/business-projection";
import {
  BreakdownChart,
  BusinessAnalyticsPanel,
  ExecutiveAnalyticsPanel,
  ExecutiveCompactAnalytics,
  TrendChart,
} from "@/features/analytics/business-analytics";
import { authenticatedApiRequest } from "@/lib/api";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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
        label: "Jumlah Closing",
        unit: "COUNT",
        available: true,
        source: "Closing yang telah selesai",
        points: [],
      },
      {
        code: "closing_value",
        label: "Nilai Penjualan",
        unit: "AMOUNT",
        available: false,
        source: "Closing yang telah selesai",
        points: [],
      },
    ],
    breakdowns: [
      {
        code: "active_pipeline_by_stage",
        label: "Pipeline Aktif menurut Tahap",
        unit: "COUNT",
        available: true,
        source: "Peluang dengan status terbuka",
        items: [
          { code: "Lead", label: "Lead", value: 3 },
          { code: "Qualified", label: "Terkualifikasi", value: 0 },
          { code: "Survey", label: "Survei", value: 1 },
          { code: "Booking", label: "Booking", value: 2 },
        ],
      },
    ],
    comparisons: [],
  };
}

function legalProjection(): BusinessAnalyticsProjection {
  return {
    domain: "legal",
    generated_at: "2026-10-03T00:00:00Z",
    period,
    series: [],
    breakdowns: [
      {
        code: "contracts_by_status",
        label: "Kontrak menurut Status",
        unit: "COUNT",
        available: true,
        source: "Status kontrak tercatat",
        items: [{ code: "ACTIVE", label: "Aktif", value: 4 }],
      },
      {
        code: "contract_expiry",
        label: "Masa Berlaku Kontrak",
        unit: "COUNT",
        available: true,
        source: "Status kontrak aktif",
        items: [{ code: "within_30_days", label: "Dalam 30 hari", value: 1 }],
      },
      {
        code: "risks_by_status",
        label: "Risiko menurut Status",
        unit: "COUNT",
        available: true,
        source: "Status risiko hukum tercatat",
        items: [
          { code: "OPEN", label: "Terbuka", value: 2 },
          { code: "MITIGATING", label: "Sedang Ditangani", value: 1 },
          { code: "REVIEWED", label: "Sudah Diperiksa", value: 1 },
          { code: "CLOSED", label: "Ditutup", value: 3 },
        ],
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
    expect(projection.breakdowns[0].items[1].value).toBe(0);
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

  it("shows insufficient data message when points < 2 and Belum tersedia when unavailable", () => {
    const singlePointSeries = {
      ...salesProjection().series[0],
      points: [{ period: "2026-05-01", value: 10 }],
    };
    const unavailableSeries = salesProjection().series[1];
    const emptySeries = salesProjection().series[0];
    render(
      <>
        <TrendChart series={singlePointSeries} period={period} generatedAt="2026-10-03T00:00:00Z" />
        <TrendChart series={unavailableSeries} period={period} generatedAt="2026-10-03T00:00:00Z" />
        <TrendChart series={emptySeries} period={period} generatedAt="2026-10-03T00:00:00Z" />
      </>,
    );
    expect(screen.getByText("Belum cukup data untuk menampilkan tren.")).toBeInTheDocument();
    expect(screen.getByText("Belum tersedia")).toBeInTheDocument();
    expect(screen.getByText("Belum ada catatan pada periode ini.")).toBeInTheDocument();
    expect(screen.queryByRole("application")).not.toBeInTheDocument();
  });

  it("displays Pipeline Aktif menurut Tahap and eliminates Sales Funnel copy", async () => {
    noResize();
    const request = vi.mocked(authenticatedApiRequest);
    request.mockResolvedValue(salesProjection() as never);

    render(<BusinessAnalyticsPanel domain="sales" />);
    expect(await screen.findByRole("heading", { name: "Pipeline Aktif menurut Tahap" })).toBeInTheDocument();
    expect(screen.queryByText(/Sales Funnel/i)).not.toBeInTheDocument();
  });

  it("displays Risiko menurut Status in legal analytics", async () => {
    noResize();
    const request = vi.mocked(authenticatedApiRequest);
    request.mockResolvedValue(legalProjection() as never);

    render(<BusinessAnalyticsPanel domain="legal" />);
    expect(await screen.findByRole("heading", { name: "Risiko menurut Status" })).toBeInTheDocument();
  });

  it("safely falls back to textual table when amount scale exceeds safe chart bounds", () => {
    noResize();
    const breakdown = {
      ...salesProjection().breakdowns[0],
      unit: "AMOUNT" as const,
      items: [{ code: "exposure", label: "Piutang terbuka", value: "98765432109876543210.05" }],
    };
    render(<BreakdownChart breakdown={breakdown} generatedAt="2026-10-03T00:00:00Z" />);
    expect(screen.getByText("Nilai tersedia dalam tabel karena skalanya tidak aman untuk divisualisasikan.")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Rp 98.765.432.109.876.543.210,05" })).toBeInTheDocument();
  });

  it("renders compact executive analytics with 3 key visuals and hides raw IDs", () => {
    noResize();
    const projectId = "project-raw-id-999";
    const targetId = "target-raw-id-888";
    const executiveProjection: BusinessAnalyticsProjection = {
      domain: "executive",
      generated_at: "2026-10-03T00:00:00Z",
      period,
      series: [
        {
          code: "closing_value",
          label: "Nilai Penjualan",
          unit: "AMOUNT",
          available: true,
          source: "Closing yang telah selesai",
          points: [
            { period: "2026-08-01", value: "500000000.00" },
            { period: "2026-09-01", value: "750000000.00" },
          ],
        },
      ],
      breakdowns: [],
      comparisons: [
        {
          code: "project_progress",
          label: "Progres Proyek",
          unit: "PERCENT",
          available: true,
          source: "Progres tugas pada proyek perusahaan",
          items: [{ code: projectId, label: "The Park Residence", value: 75, target_value: null, actual_value: null, forecast_value: null }],
        },
        {
          code: "strategy_target_actual_amount",
          label: "Target, aktual, dan perkiraan perusahaan",
          unit: "AMOUNT",
          available: true,
          source: "Observasi target strategi perusahaan",
          items: [{ code: targetId, label: "Target Pendapatan Q3", value: "1000000000.00", target_value: "1200000000.00", actual_value: "1000000000.00", forecast_value: "1150000000.00" }],
        },
      ],
    };

    render(<ExecutiveCompactAnalytics projection={executiveProjection} />);
    expect(screen.getByRole("heading", { name: "Nilai Penjualan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Progres Proyek" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Target vs Aktual" })).toBeInTheDocument();
    expect(screen.getAllByText("The Park Residence").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Target Pendapatan Q3").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(projectId)).not.toBeInTheDocument();
    expect(screen.queryByText(targetId)).not.toBeInTheDocument();
  });

  it("requests one executive company analytics projection only once", async () => {
    noResize();
    const projectId = "project-raw-id-should-not-render";
    const executiveProjection: BusinessAnalyticsProjection = {
      ...salesProjection(),
      domain: "executive",
      comparisons: [
        {
          code: "project_progress",
          label: "Progres Proyek",
          unit: "PERCENT",
          available: true,
          source: "Progres tugas pada maksimal 20 proyek perusahaan",
          items: [{ code: projectId, label: "The Park", value: 68, target_value: null, actual_value: null, forecast_value: null }],
        },
      ],
    };
    const request = vi.mocked(authenticatedApiRequest);
    request.mockResolvedValue(executiveProjection as never);

    render(<ExecutiveAnalyticsPanel />);
    expect(await screen.findByText("Kinerja Perusahaan")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Progres Proyek" })).toBeInTheDocument();
    expect(screen.getAllByText("The Park").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(projectId)).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatch(/^\/api\/v1\/business\/executive\/analytics\?/);
  });
});
