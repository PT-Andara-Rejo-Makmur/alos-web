import React from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./it-ui.module.css";

export interface ItEmptyStateProps {
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
}

export function ItEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: ItEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {Icon && (
        <div className={styles.emptyIcon}>
          <Icon aria-hidden={true} size={24} strokeWidth={1.5} />
        </div>
      )}
      <p className={styles.emptyTitle}>{title}</p>
      {description && <p className={styles.emptyDescription}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
