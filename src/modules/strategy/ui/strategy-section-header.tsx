import type { ReactNode } from "react";
import styles from "./strategy-ui.module.css";

interface StrategySectionHeaderProps {
  readonly id?: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
}

export function StrategySectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  action,
}: StrategySectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        {eyebrow ? <div className={styles.sectionEyebrow}>{eyebrow}</div> : null}
        <h2 className={styles.sectionTitle} id={id}>
          {title}
        </h2>
        {subtitle ? <p className={styles.sectionSubtitle}>{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
