import type { ExecutiveDashboardSnapshot } from "./types";
import styles from "./executive-dashboard.module.css";

interface CompanyPerformancePanelProps {
  readonly performance: ExecutiveDashboardSnapshot["performance"];
}

export function CompanyPerformancePanel({ performance }: CompanyPerformancePanelProps) {
  const points = performance.points;
  const width = 400;
  const height = 150;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const validPoints = points.filter((p) => p.value !== null);
  const hasData = validPoints.length > 0;

  const coords = points.map((p, index) => {
    const x = paddingX + (index / Math.max(1, points.length - 1)) * plotWidth;
    const val = p.value ?? 0;
    const y = height - paddingY - (val / 100) * plotHeight;
    return { ...p, x, y };
  });

  const linePath = coords
    .filter((p) => p.value !== null)
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <article className={styles.sectionCard} aria-label="Tren Kinerja Perusahaan">
      <div className={styles.cardEyebrow}>KINERJA</div>
      <h3 className={styles.cardTitle}>Tren Kinerja</h3>
      <p className={styles.cardSubtitle}>{performance.title}</p>

      <div className={styles.chartContainer}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={styles.chartSvg}
          role="img"
          aria-label={`Grafik Tren Kinerja: ${performance.title}`}
        >
          {/* Horizontal grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#eeeae1"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + plotHeight / 2}
            x2={width - paddingX}
            y2={paddingY + plotHeight / 2}
            stroke="#eeeae1"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e1ddd4"
          />

          {/* Line Chart */}
          {hasData && (
            <>
              <path
                d={linePath}
                fill="none"
                stroke="var(--alos-gold, #d1a357)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {coords
                .filter((p) => p.value !== null)
                .map((p) => (
                  <circle
                    key={p.period}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#ffffff"
                    stroke="var(--alos-gold-dark, #9e6e2e)"
                    strokeWidth="2"
                  />
                ))}
            </>
          )}

          {/* X Axis Labels */}
          {coords.map((p) => (
            <text
              key={p.period}
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fill="var(--workspace-muted, #7e848c)"
              fontWeight="500"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>

      <div className={styles.chartFootnote}>{performance.context}</div>
    </article>
  );
}
