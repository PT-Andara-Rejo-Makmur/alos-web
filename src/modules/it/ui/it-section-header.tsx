import React from "react";
import styles from "./it-ui.module.css";

export interface ItSectionHeaderProps {
  readonly id?: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: React.ReactNode;
}

export function ItSectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  action,
}: ItSectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionHeadingGroup}>
        {eyebrow && <span className={styles.sectionEyebrow}>{eyebrow}</span>}
        <h2 className={styles.sectionTitle} id={id}>{title}</h2>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.sectionAction}>{action}</div>}
    </div>
  );
}
