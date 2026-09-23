"use client";

import type { ProjectPortfolioSnapshot } from "@/features/mvp1/lib/portfolio";
import { sortMilestonesDeterministically } from "./property-dashboard-projection";
import styles from "./property-dashboard.module.css";

interface PropertyMilestonePanelProps {
  readonly milestones?: ProjectPortfolioSnapshot["milestones"];
}

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(`${dateStr}T00:00:00Z`);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function PropertyMilestonePanel({ milestones = [] }: PropertyMilestonePanelProps) {
  const sorted = sortMilestonesDeterministically(milestones).slice(0, 4);

  return (
    <article aria-label="Milestone Terdekat" className={styles.panelCard}>
      <div className={styles.panelHeader}>
        <p className={styles.panelEyebrow}>MILESTONES</p>
        <h2 className={styles.panelTitle}>Milestone Terdekat</h2>
      </div>

      <div className={styles.milestoneList}>
        {sorted.length > 0 ? (
          sorted.map((item) => {
            const dotClass =
              item.status === "ON_TRACK"
                ? styles.dotGreen
                : item.status === "AT_RISK"
                  ? styles.dotAmber
                  : item.status === "CRITICAL"
                    ? styles.dotRed
                    : styles.dotBlue;

            return (
              <div className={styles.milestoneItem} key={item.milestone_id}>
                <span aria-hidden="true" className={`${styles.dot} ${dotClass}`} />
                <time className={styles.milestoneDate} dateTime={item.due_date}>
                  {formatShortDate(item.due_date)}
                </time>
                <div className={styles.milestoneDetails}>
                  <strong className={styles.milestoneProject}>{item.project_name}</strong>
                  <span className={styles.milestoneName}>{item.title}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: "0.8rem", color: "#8a928c", margin: "12px 0" }}>
            Belum ada milestone tercatat dalam portofolio aktif.
          </p>
        )}
      </div>
    </article>
  );
}
