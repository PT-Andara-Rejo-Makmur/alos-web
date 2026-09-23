import type { ExecutiveDashboardSnapshot } from "./types";
import styles from "./executive-dashboard.module.css";

interface AttentionPanelProps {
  readonly projects: ExecutiveDashboardSnapshot["attention_projects"];
}

export function AttentionPanel({ projects }: AttentionPanelProps) {
  function getStatusStyle(status: string) {
    switch (status) {
      case "CRITICAL":
        return {
          background: "#fde8e8",
          color: "var(--alos-danger, #d95c5c)",
          border: "1px solid #f8b4b4",
        };
      case "AT_RISK":
        return {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        };
      case "ON_TRACK":
      default:
        return {
          background: "#def7ec",
          color: "var(--alos-success, #36b37e)",
          border: "1px solid #bcf0da",
        };
    }
  }

  return (
    <section className={styles.attentionSection} aria-label="Proyek yang Membutuhkan Perhatian">
      <div className={styles.cardEyebrow}>EARLY WARNING</div>
      <h3 className={styles.cardTitle}>Proyek Perlu Perhatian</h3>
      <p className={styles.cardSubtitle}>
        Daftar proyek dengan deviasi jadwal atau kendala material yang terpantau.
      </p>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          Tidak ada proyek yang memerlukan intervensi khusus saat ini.
        </div>
      ) : (
        <div className={styles.attentionList} role="list">
          {projects.map((proj) => {
            const badgeStyle = getStatusStyle(proj.status);
            return (
              <div
                key={proj.project_id}
                className={styles.attentionItem}
                role="listitem"
                data-testid={`attention-project-${proj.project_id}`}
              >
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--workspace-ink, #1c1d1f)" }}>
                    {proj.name}
                  </strong>
                  <div style={{ fontSize: "0.775rem", color: "var(--workspace-muted, #7e848c)" }}>
                    Kemajuan saat ini: {proj.progress_percent}%
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      ...badgeStyle,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {proj.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
