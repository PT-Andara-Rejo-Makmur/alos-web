import type { DivisionHealthItem } from "./types";
import styles from "./executive-dashboard.module.css";

interface DivisionHealthPanelProps {
  readonly divisions: readonly DivisionHealthItem[];
}

export function DivisionHealthPanel({ divisions }: DivisionHealthPanelProps) {
  function getHealthDotClass(health: DivisionHealthItem["health"]): string {
    switch (health) {
      case "HEALTHY":
        return styles.dotSuccess;
      case "ATTENTION":
        return styles.dotPartial;
      case "NOT_CONNECTED":
      default:
        return styles.dotNotConnected;
    }
  }

  return (
    <article className={styles.sectionCard} aria-label="Kesehatan Organisasi & Divisi">
      <div className={styles.cardEyebrow}>ORGANISASI</div>
      <h3 className={styles.cardTitle}>Kesehatan Divisi</h3>
      <p className={styles.cardSubtitle}>
        Status operasional dan integrasi data 6 divisi PT Andara Rejo Makmur.
      </p>

      <div className={styles.divisionGrid} role="list">
        {divisions.map((div) => (
          <div
            key={div.division_code}
            className={styles.divisionCard}
            role="listitem"
            data-testid={`division-health-${div.division_code}`}
          >
            <div className={styles.divisionLeft}>
              <span
                className={`${styles.statusDot} ${getHealthDotClass(div.health)}`}
                aria-hidden="true"
              />
              <div>
                <h4 className={styles.divisionName}>{div.division_name}</h4>
                <div style={{ fontSize: "0.725rem", color: "var(--workspace-muted, #7e848c)" }}>
                  {div.document_count} Dokumen · {div.pending_approvals} Pending
                </div>
              </div>
            </div>
            <div className={styles.divisionHealthText}>{div.healthLabel}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
