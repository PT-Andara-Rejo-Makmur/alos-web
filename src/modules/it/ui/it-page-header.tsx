import React from "react";
import styles from "./it-ui.module.css";

export interface ItPageHeaderProps {
  readonly breadcrumb: string;
  readonly title: string;
  readonly description: string;
  readonly sourceContext?: string;
  readonly sourceState?: "LIVE" | "PARTIAL" | "NOT_CONNECTED";
}

export function ItPageHeader({
  breadcrumb,
  title,
  description,
  sourceContext = "Backend Projection · Read-only",
  sourceState,
}: ItPageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.headerMain}>
        <p className={styles.breadcrumb}>{breadcrumb}</p>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
      </div>

      <div className={styles.headerMeta}>
        <div className={styles.sourceBadge}>
          <span
            aria-hidden="true"
            className={styles.sourceDot}
            style={
              sourceState === "NOT_CONNECTED"
                ? { backgroundColor: "#8a928c" }
                : sourceState === "LIVE"
                  ? { backgroundColor: "#0b9952" }
                  : undefined
            }
          />
          <span>{sourceContext}</span>
        </div>
      </div>
    </header>
  );
}
