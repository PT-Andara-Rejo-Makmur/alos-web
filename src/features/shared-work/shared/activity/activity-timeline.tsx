import type { ActivityItem } from "../types";
import styles from "./activity.module.css";

interface ActivityTimelineProps {
  readonly items?: readonly ActivityItem[];
}

function formatIndonesianDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const day = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const time = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return `${day} · ${time}`;
  } catch {
    return isoString;
  }
}

export function ActivityTimeline({ items = [] }: ActivityTimelineProps) {
  if (items.length === 0) {
    return <p className={styles.emptyTimeline}>Belum ada catatan aktivitas.</p>;
  }

  return (
    <div aria-label="Riwayat Aktivitas" className={styles.timeline} role="feed">
      {items.map((item) => (
        <article className={styles.timelineItem} key={item.id}>
          <div aria-hidden="true" className={styles.timelineDot} />
          <div className={styles.timelineHeader}>
            <time className={styles.timelineDate} dateTime={item.occurredAt}>
              {formatIndonesianDateTime(item.occurredAt)}
            </time>
          </div>
          <p className={styles.timelineAction}>{item.actionText}</p>
          <p className={styles.timelineActor}>oleh {item.actorName}</p>
          {item.detailText ? (
            <p className={styles.timelineActor}>{item.detailText}</p>
          ) : null}
          {item.correlationId ? (
            <details className={styles.technicalDetail}>
              <summary>Detail teknis</summary>
              <code>Korelasi: {item.correlationId}</code>
            </details>
          ) : null}
        </article>
      ))}
    </div>
  );
}
