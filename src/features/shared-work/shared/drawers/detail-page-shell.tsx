"use client";

import type { ReactNode } from "react";

import { PageHeader, Tabs, type TabItem } from "@/components/ui";

import styles from "./drawer-layout.module.css";

interface DetailPageShellProps {
  readonly actions?: ReactNode;
  readonly activeTab?: string;
  readonly description?: ReactNode;
  readonly eyebrow?: string;
  readonly headerMetadata?: ReactNode;
  readonly onTabChange?: (tabId: string) => void;
  readonly tabs: readonly TabItem[];
  readonly title: ReactNode;
}

export function DetailPageShell({
  actions,
  activeTab,
  description,
  eyebrow = "PEKERJAAN",
  headerMetadata,
  onTabChange,
  tabs,
  title,
}: DetailPageShellProps) {
  return (
    <section aria-label="Detail Dokumen Kerja" className={styles.detailShell}>
      <PageHeader
        actions={actions}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />

      {headerMetadata ? (
        <div className={styles.detailHeaderMeta}>{headerMetadata}</div>
      ) : null}

      <div className={styles.detailTabContent}>
        <Tabs
          items={tabs}
          onValueChange={onTabChange}
          value={activeTab}
        />
      </div>
    </section>
  );
}
