import type { ReactNode } from "react";

import styles from "./ui.module.css";

export interface EmptyStateProps {
  readonly action?: ReactNode;
  readonly description: ReactNode;
  readonly icon?: ReactNode;
  readonly title: ReactNode;
}

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {icon ? <span aria-hidden="true" className={styles.emptyStateIcon}>{icon}</span> : null}
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      <p className={styles.emptyStateDescription}>{description}</p>
      {action ? <div className={styles.emptyStateAction}>{action}</div> : null}
    </div>
  );
}
