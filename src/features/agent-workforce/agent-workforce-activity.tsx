import type { AgentWorkforceRunSummary } from "./types";
import { formatRunTimestamp } from "./agent-workforce-projection";
import styles from "./agent-workforce.module.css";

interface AgentWorkforceActivityProps {
  readonly summary: AgentWorkforceRunSummary;
}

export function AgentWorkforceActivity({ summary }: AgentWorkforceActivityProps) {
  const hasRuns = summary.totalCount > 0;

  return (
    <article className={styles.activityCard} aria-labelledby="activity-title">
      <div>
        <span className={styles.activityEyebrow}>AKTIVITAS TERBARU</span>
        <h3 id="activity-title" className={styles.activityTitle}>
          Scoped Runs
        </h3>
      </div>

      <div className={styles.activityTable}>
        <div className={styles.activityRow}>
          <span className={styles.activityKey}>Run terbaru</span>
          <span className={styles.activityVal}>
            {formatRunTimestamp(summary.latestRunAt)}
          </span>
        </div>

        <div className={styles.activityRow}>
          <span className={styles.activityKey}>Succeeded</span>
          <span
            className={
              hasRuns && summary.succeededCount > 0
                ? styles.activityValSucceeded
                : styles.activityVal
            }
          >
            {hasRuns ? summary.succeededCount : "—"}
          </span>
        </div>

        <div className={styles.activityRow}>
          <span className={styles.activityKey} title="Diblokir oleh kontrol tata kelola ALOS">
            Blocked
          </span>
          <span
            className={
              hasRuns && summary.blockedCount > 0
                ? styles.activityValBlocked
                : styles.activityVal
            }
          >
            {hasRuns ? `${summary.blockedCount} (kontrol)` : "—"}
          </span>
        </div>

        <div className={styles.activityRow}>
          <span className={styles.activityKey}>Failed</span>
          <span
            className={
              hasRuns && summary.failedCount > 0
                ? styles.activityValFailed
                : styles.activityVal
            }
          >
            {hasRuns ? summary.failedCount : "—"}
          </span>
        </div>
      </div>

      <p className={styles.activityFootnote}>
        Nilai hanya dari workspace run projection.
      </p>
    </article>
  );
}
