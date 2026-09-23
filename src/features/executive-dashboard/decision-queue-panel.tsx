import Link from "next/link";
import type { DecisionQueueItem } from "./types";
import styles from "./executive-dashboard.module.css";

interface DecisionQueuePanelProps {
  readonly items: readonly DecisionQueueItem[];
}

export function DecisionQueuePanel({ items }: DecisionQueuePanelProps) {
  return (
    <article className={styles.sectionCard} aria-label="Antrean Keputusan">
      <div className={styles.cardEyebrow}>KEPUTUSAN MATERIAL</div>
      <h3 className={styles.cardTitle}>Antrean Keputusan</h3>
      <p className={styles.cardSubtitle}>
        Item pending yang memerlukan persetujuan Direktur Utama sebelum eksekusi.
      </p>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          Tidak ada antrean keputusan yang menunggu persetujuan Direktur saat ini.
        </div>
      ) : (
        <div className={styles.queueList} role="list">
          {items.map((item) => {
            const isOverdue = item.urgency === "OVERDUE";
            const isDueSoon = item.urgency === "DUE_SOON";

            const cardClass = [
              styles.queueCard,
              isOverdue ? styles.queueCardOverdue : "",
              isDueSoon ? styles.queueCardDueSoon : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={item.approval_id}
                className={cardClass}
                role="listitem"
                data-testid={`decision-item-${item.approval_id}`}
              >
                <div className={styles.queueInfo}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className={styles.queueBadge}>{item.kindLabel}</span>
                    {item.urgency !== "NORMAL" && (
                      <span
                        style={{
                          fontSize: "0.675rem",
                          fontWeight: 700,
                          color: isOverdue ? "var(--alos-danger, #d95c5c)" : "var(--alos-warning, #e5a63b)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {item.urgencyLabel}
                      </span>
                    )}
                  </div>
                  <h4 className={styles.queueItemTitle}>{item.title}</h4>
                  <p className={styles.queueMeta}>
                    Diajukan oleh <strong>{item.requested_by}</strong> · {item.workspace_name} ·{" "}
                    {item.ageLabel}
                  </p>
                </div>
                <div className={styles.queueAction}>
                  <Link href={item.href} className={styles.detailButton}>
                    Lihat Detail &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.queueFootnote}>
        Seluruh persetujuan material membutuhkan tinjauan manusia; ALOS tidak melakukan auto-approve sepihak.
      </div>
    </article>
  );
}
