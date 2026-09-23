import Link from "next/link";
import type { ExecutiveBriefBlock } from "./types";
import styles from "./executive-dashboard.module.css";

interface ExecutiveBriefStripProps {
  readonly blocks: readonly ExecutiveBriefBlock[];
}

export function ExecutiveBriefStrip({ blocks }: ExecutiveBriefStripProps) {
  function getDotClass(state: ExecutiveBriefBlock["state"]): string {
    switch (state) {
      case "LIVE":
        return styles.dotLive;
      case "PARTIAL":
        return styles.dotPartial;
      case "NOT_CONNECTED":
      default:
        return styles.dotNotConnected;
    }
  }

  return (
    <section className={styles.briefStrip} aria-label="Brief Pagi 07.45">
      <div className={styles.briefHeader}>
        <div>
          <div className={styles.briefEyebrow}>Brief Pagi 07.45</div>
          <h2 className={styles.briefTitle}>Status Kesiapan Operasional</h2>
        </div>
      </div>

      <div className={styles.briefGrid} role="list">
        {blocks.map((block) => {
          const content = (
            <div className={styles.briefItem} role="listitem" key={block.key}>
              <div className={styles.briefItemTop}>
                <span
                  className={`${styles.statusDot} ${getDotClass(block.state)}`}
                  aria-hidden="true"
                />
                <span className={styles.briefItemLabel}>{block.label}</span>
              </div>
              <div className={styles.briefItemSummary}>{block.summary}</div>
            </div>
          );

          if (block.href) {
            return (
              <Link
                key={block.key}
                href={block.href}
                style={{ textDecoration: "none", color: "inherit" }}
                title={block.hint}
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={block.key} title={block.hint}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
