import type { ReactNode } from "react";

import styles from "./ui.module.css";

export interface ToolbarProps {
  readonly actions?: ReactNode;
  readonly bulkActions?: ReactNode;
  readonly filters?: ReactNode;
  readonly search?: ReactNode;
}

export function Toolbar({ actions, bulkActions, filters, search }: ToolbarProps) {
  return (
    <div aria-label="Toolbar" className={styles.toolbar} role="toolbar">
      {search ? <div className={styles.toolbarSearch}>{search}</div> : null}
      {filters ? <div className={styles.toolbarFilters}>{filters}</div> : null}
      {bulkActions ? <div className={styles.toolbarBulkActions}>{bulkActions}</div> : null}
      {actions ? <div className={styles.toolbarActions}>{actions}</div> : null}
    </div>
  );
}
