import type { ReactNode } from "react";

import styles from "./ui.module.css";

export interface PageHeaderProps {
  readonly actions?: ReactNode;
  readonly description?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly metadata?: ReactNode;
  readonly title: ReactNode;
}

export function PageHeader({ actions, description, eyebrow, metadata, title }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderCopy}>
        {eyebrow ? <p className={styles.pageHeaderEyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.pageHeaderTitle}>{title}</h1>
        {description ? <p className={styles.pageHeaderDescription}>{description}</p> : null}
        {metadata ? <div className={styles.pageHeaderMetadata}>{metadata}</div> : null}
      </div>
      {actions ? <div className={styles.pageHeaderActions}>{actions}</div> : null}
    </header>
  );
}
