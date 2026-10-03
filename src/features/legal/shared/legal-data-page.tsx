"use client";

import { useState, type ReactNode } from "react";
import { DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { LegalSourceState } from "../legal-model";
import { LegalLayout } from "../legal-layout";
import { LegalSourceStateView, LegalSourceStrip, LegalStatusDrawer } from "./legal-ui";
import styles from "../legal.module.css";

export interface LegalTab<Row> { readonly id: string; readonly label: string; readonly title: string; readonly description: string; readonly caption: string; readonly columns: readonly DataTableColumn<Row>[]; readonly emptyDescription: string; readonly actions?: ReactNode; readonly children?: ReactNode; readonly rows?: readonly Row[]; readonly state?: LegalSourceState; }

export function LegalDataPage<Row>({ description, tabs, title, workspaceKey }: Readonly<{ description: string; tabs: readonly LegalTab<Row>[]; title: string; workspaceKey?: string }>) {
  return <LegalLayout workspaceKey={workspaceKey}>{(session) => <LegalDataContent description={description} session={session} tabs={tabs} title={title} />}</LegalLayout>;
}

function LegalDataContent<Row>({ description, session, tabs, title }: Readonly<{ description: string; session: SessionProjection; tabs: readonly LegalTab<Row>[]; title: string }>) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  const current = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  if (!current) return null;
  const state = current.state ?? "unavailable";
  return <div className={styles.page}><PageHeader description={current.description || description} eyebrow="LEGAL" metadata={`Ruang Kerja: ${activeWorkspace?.workspace_name ?? "—"}`} title={current.title} /><div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Ruang Kerja" value={activeWorkspace?.workspace_name ?? "—"} /><ContextItem label="Status Data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div><LegalSourceStrip onStatus={() => setStatusOpen(true)} /><Tabs ariaLabel={`Navigasi ${title}`} items={tabs.map((tab): TabItem => ({ id: tab.id, label: tab.label }))} onValueChange={setActiveTab} value={current.id} />{current.children}<Section actions={current.actions} description={current.description} title={current.label}><DataTable caption={current.caption} columns={current.columns} emptyState={<LegalSourceStateView description={current.emptyDescription} state={state} />} rows={current.rows ?? []} /></Section><LegalStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} /></div>;
}

function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }
