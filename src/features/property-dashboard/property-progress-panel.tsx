"use client";

import type { PortfolioTrendPoint } from "@/features/projects/portfolio";
import styles from "./property-dashboard.module.css";

interface PropertyProgressPanelProps {
  readonly progress?: readonly PortfolioTrendPoint[];
}

export function PropertyProgressPanel({ progress = [] }: PropertyProgressPanelProps) {
  const points = progress.filter((point) => point.value !== null);
  const hasData = points.length > 0;

  // Coordinate calculations for SVG viewBox 0 0 540 180
  const width = 540;
  const height = 180;
  const paddingX = 40;
  const paddingY = 24;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Grid tick lines at 0, 25, 50, 75, 100%
  const gridTicks = [0, 25, 50, 75, 100];

  const calculatedPoints = points.map((point, index) => {
    const x = paddingX + (index / Math.max(1, points.length - 1)) * chartW;
    const y = height - paddingY - ((point.value ?? 0) / 100) * chartH;
    return { x, y, label: point.label, value: point.value };
  });

  const pathD = calculatedPoints
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");

  return (
    <article aria-label="Progress vs Baseline Portofolio" className={styles.panelCard}>
      <div className={styles.panelHeader}>
        <p className={styles.panelEyebrow}>PROJECT PORTFOLIO</p>
        <h2 className={styles.panelTitle}>Progress vs Baseline</h2>
        <p className={styles.panelSubtitle}>
          Contoh visual - production dari portfolio endpoint
        </p>
      </div>

      <div className={styles.chartWrap}>
        <svg
          aria-label="Grafik progres portofolio terhadap baseline"
          className={styles.chartSvg}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Horizontal Grid Lines */}
          {gridTicks.map((tick) => {
            const y = height - paddingY - (tick / 100) * chartH;
            return (
              <line
                className={styles.gridLine}
                key={tick}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
              />
            );
          })}

          {/* Progress Trend Line */}
          {hasData && pathD ? (
            <>
              <path className={styles.chartLine} d={pathD} />
              {calculatedPoints.map((pt, i) => (
                <g key={i}>
                  <circle className={styles.chartDot} cx={pt.x} cy={pt.y} r={4.5} />
                  <text className={styles.chartLabel} x={pt.x} y={height - 6}>
                    {pt.label}
                  </text>
                </g>
              ))}
            </>
          ) : (
            <text
              className={styles.chartLabel}
              textAnchor="middle"
              x={width / 2}
              y={height / 2}
            >
              Belum ada data progres tersedia
            </text>
          )}
        </svg>
      </div>
    </article>
  );
}
