import type { ExecutiveDashboardSnapshot } from "./types";
import styles from "./executive-dashboard.module.css";

interface ProjectDistributionPanelProps {
  readonly distribution: ExecutiveDashboardSnapshot["project_distribution"];
}

const TONE_COLORS: Record<string, string> = {
  BLUE: "var(--alos-info, #4d8fd8)",
  GREEN: "var(--alos-success, #36b37e)",
  AMBER: "var(--alos-warning, #e5a63b)",
  RED: "var(--alos-danger, #d95c5c)",
};

export function ProjectDistributionPanel({ distribution }: ProjectDistributionPanelProps) {
  const isAvailable = distribution.available && distribution.total > 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = distribution.items.map((item) => {
    const fraction = distribution.total > 0 ? item.count / distribution.total : 0;
    const strokeDash = fraction * circumference;
    const offset = currentOffset;
    currentOffset += strokeDash;

    return {
      ...item,
      color: TONE_COLORS[item.tone] || "#7e848c",
      strokeDasharray: `${strokeDash.toFixed(2)} ${(circumference - strokeDash).toFixed(2)}`,
      strokeDashoffset: (-offset).toFixed(2),
    };
  });

  return (
    <article className={styles.sectionCard} aria-label="Distribusi Portofolio Proyek">
      <div className={styles.cardEyebrow}>PORTOFOLIO</div>
      <h3 className={styles.cardTitle}>Distribusi Proyek</h3>
      <p className={styles.cardSubtitle}>
        Status kesehatan proyek berdasarkan monitoring berkala.
      </p>

      <div className={styles.donutContainer}>
        <div className={styles.donutSvgWrap}>
          <svg
            viewBox="0 0 100 100"
            style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
            role="img"
            aria-label={`Donut chart distribusi proyek, total ${distribution.total}`}
          >
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#eeeae1"
              strokeWidth="12"
            />

            {/* Colored Segments */}
            {isAvailable &&
              segments.map((seg) => (
                <circle
                  key={seg.key}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                />
              ))}
          </svg>
          <div className={styles.donutCenterText} data-testid="donut-total">
            {isAvailable ? distribution.total : "—"}
          </div>
        </div>

        <div className={styles.donutLegend}>
          {distribution.items.map((item) => (
            <div key={item.key} className={styles.donutLegendItem}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: TONE_COLORS[item.tone] || "#7e848c",
                }}
                aria-hidden="true"
              />
              <span>
                {item.label}: <strong>{item.count}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartFootnote}>{distribution.context}</div>
    </article>
  );
}
