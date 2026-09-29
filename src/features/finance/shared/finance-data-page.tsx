"use client";

import { useState, type ReactNode } from "react";
import { DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { FinanceLayout } from "../finance-layout";
import type { FinanceSourceState } from "../finance-model";
import { FinanceSourceStrip, FinanceSourceStateView, FinanceStatusDrawer } from "./finance-ui";
import styles from "../finance.module.css";

export interface FinanceTab<Row> {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly caption: string;
  readonly columns: readonly DataTableColumn<Row>[];
  readonly emptyDescription: string;
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly rows?: readonly Row[];
  readonly state?: FinanceSourceState;
}

export interface FinanceDataPageProps<Row> {
  readonly description: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly tabs: readonly FinanceTab<Row>[];
  readonly workspaceKey?: string;
}

export function FinanceDataPage<Row>({ description, eyebrow = "PUSAT KEUANGAN", tabs, title, workspaceKey }: FinanceDataPageProps<Row>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <FinanceDataContent description={description} eyebrow={eyebrow} session={session} tabs={tabs} title={title} />}</FinanceLayout>;
}

function FinanceDataContent<Row>({ description, eyebrow, session, tabs, title }: Readonly<{ description: string; eyebrow: string; session: SessionProjection; tabs: readonly FinanceTab<Row>[]; title: string }>) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  if (!currentTab) return null;
  const tabItems: readonly TabItem[] = tabs.map((tab) => ({ id: tab.id, label: tab.label }));
  const state = currentTab.state ?? "unavailable";
  return <div className={styles.page}>
    <PageHeader description={currentTab.description || description} eyebrow={eyebrow} metadata={`Workspace aktif: ${activeWorkspace?.workspace_name ?? "—"}`} title={currentTab.title} />
    <div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Workspace" value={activeWorkspace?.workspace_name ?? "—"} /><ContextItem label="Status data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div>
    <FinanceSourceStrip onStatus={() => setStatusOpen(true)} />
    <Tabs ariaLabel={`Navigasi ${title}`} items={tabItems} onValueChange={setActiveTab} value={currentTab.id} />
    {currentTab.children}
    <Section actions={currentTab.actions} description={currentTab.description} title={currentTab.label}><DataTable caption={currentTab.caption} columns={currentTab.columns} emptyState={<FinanceSourceStateView description={currentTab.emptyDescription} state={state} />} rows={currentTab.rows ?? []} /></Section>
    <FinanceStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} />
  </div>;
}

function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }
