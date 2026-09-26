"use client";

import React, { type ReactNode } from "react";
import styles from "./work-ui.module.css";

interface WorkPageHeaderProps {
  readonly title: string;
  readonly subtitle: string;
  readonly workspaceLabel: string;
  readonly kicker?: string;
  readonly actions?: ReactNode;
}

export const WorkPageHeader: React.FC<WorkPageHeaderProps> = ({
  title,
  subtitle,
  workspaceLabel,
  kicker,
  actions,
}) => {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.headerTop}>
        <div className={styles.breadcrumb}>
          <span>ALOS</span>
          <span> / </span>
          <span>{workspaceLabel.toUpperCase()}</span>
          <span> / </span>
          <span>{kicker ? kicker.toUpperCase() : "PEKERJAAN"}</span>
        </div>
        {actions && <div className={styles.headerActions}>{actions}</div>}
      </div>
      <div className={styles.titleArea}>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>
      <p className={styles.pageSubtitle}>{subtitle}</p>
    </header>
  );
};
