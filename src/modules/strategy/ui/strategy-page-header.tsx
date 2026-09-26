import type { ReactNode } from "react";
import type { StrategySourceState } from "../shared/types";
import styles from "./strategy-ui.module.css";

interface StrategyPageHeaderProps {
  readonly breadcrumb?: string;
  readonly title: string;
  readonly description?: string;
  readonly subtitle?: string;
  readonly workspaceLabel?: string;
  readonly sourceState?: StrategySourceState;
  readonly action?: ReactNode;
  readonly actions?: ReactNode;
}

export function StrategyPageHeader({
  breadcrumb,
  title,
  description,
  subtitle,
  workspaceLabel,
  action,
  actions,
}: StrategyPageHeaderProps) {
  const resolvedBreadcrumb = breadcrumb ?? (workspaceLabel ? `ALOS / ${workspaceLabel.toUpperCase()} / STRATEGI` : "ALOS / STRATEGI");
  const resolvedDescription = description ?? subtitle ?? "";
  const resolvedAction = action ?? actions;
  return (
    <header className={styles.pageHeader}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.breadcrumb}>{resolvedBreadcrumb}</div>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>{title}</h1>
          </div>
        </div>
        {resolvedAction ? <div>{resolvedAction}</div> : null}
      </div>
      <p className={styles.pageSubtitle}>{resolvedDescription}</p>
    </header>
  );
}
