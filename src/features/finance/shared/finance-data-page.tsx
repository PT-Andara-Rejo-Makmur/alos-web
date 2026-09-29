"use client";

import { useState, type ReactNode } from "react";
import { DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { FinanceLayout } from "../finance-layout";
import { FinanceSourceStrip, FinanceStatusDrawer, FinanceUnavailableState } from "./finance-ui";
import styles from "../finance.module.css";

export interface FinanceDataPageProps<Row> {
  readonly description: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly tabs: readonly TabItem[];
  readonly columns: readonly DataTableColumn<Row>[];
  readonly caption: string;
  readonly emptyDescription: string;
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly rows?: readonly Row[];
  readonly workspaceKey?: string;
}

export function FinanceDataPage<Row>({ actions, caption, children, columns, description, emptyDescription, eyebrow = "PUSAT KEUANGAN", rows = [], tabs, title, workspaceKey }: FinanceDataPageProps<Row>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <FinanceDataContent actions={actions} caption={caption} columns={columns} description={description} emptyDescription={emptyDescription} eyebrow={eyebrow} rows={rows} session={session} tabs={tabs} title={title}>{children}</FinanceDataContent>}</FinanceLayout>;
}

function FinanceDataContent<Row>({ actions, caption, children, columns, description, emptyDescription, eyebrow, rows = [], session, tabs, title }: Omit<FinanceDataPageProps<Row>, "workspaceKey"> & { session: SessionProjection }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  return <div className={styles.page}>
    <PageHeader description={description} eyebrow={eyebrow} metadata={`Workspace aktif: ${activeWorkspace?.workspace_name ?? "—"}`} title={title} />
    <div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Workspace" value={activeWorkspace?.workspace_name ?? "—"} /><ContextItem label="Status data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div>
    <FinanceSourceStrip onStatus={() => setStatusOpen(true)} />
    {children}
    <Tabs ariaLabel={`Navigasi ${title}`} items={tabs} />
    <Section actions={actions} description="Daftar akan menampilkan data setelah sumber resmi tersedia." title="Daftar Data"><DataTable caption={caption} columns={columns} emptyState={<FinanceUnavailableState description={emptyDescription} />} rows={rows} /></Section>
    <FinanceStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} />
  </div>;
}

function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }
