"use client";

import { useState, type ReactNode } from "react";
import { DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { HrSourceState } from "../hr-model";
import { HrLayout } from "../hr-layout";
import { HrSourceStateView, HrSourceStrip, HrStatusDrawer } from "./hr-ui";
import styles from "../hr.module.css";

export interface HrTab<Row> { readonly id: string; readonly label: string; readonly title: string; readonly description: string; readonly caption: string; readonly columns: readonly DataTableColumn<Row>[]; readonly emptyDescription: string; readonly actions?: ReactNode; readonly children?: ReactNode; readonly rows?: readonly Row[]; readonly state?: HrSourceState; }
export function HrDataPage<Row>({ description, eyebrow = "SDM", tabs, title, workspaceKey, requireGa = false }: Readonly<{ description: string; eyebrow?: string; tabs: readonly HrTab<Row>[]; title: string; workspaceKey?: string; requireGa?: boolean }>) {
  return <HrLayout requireGa={requireGa} workspaceKey={workspaceKey}>{(session) => <HrDataContent description={description} eyebrow={eyebrow} session={session} tabs={tabs} title={title} />}</HrLayout>;
}
function HrDataContent<Row>({ description, eyebrow, session, tabs, title }: Readonly<{ description: string; eyebrow: string; session: import("@/features/session").SessionProjection; tabs: readonly HrTab<Row>[]; title: string }>) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [statusOpen, setStatusOpen] = useState(false);
  const current = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const workspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  if (!current) return null;
  return <div className={styles.page}><PageHeader description={current.description || description} eyebrow={eyebrow} metadata={`Workspace aktif: ${workspace?.workspace_name ?? "—"}`} title={current.title} /><div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Workspace" value={workspace?.workspace_name ?? "—"} /><ContextItem label="Status data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div><HrSourceStrip onStatus={() => setStatusOpen(true)} /><Tabs ariaLabel={`Navigasi ${title}`} items={tabs.map((tab): TabItem => ({ id: tab.id, label: tab.label }))} onValueChange={setActiveTab} value={current.id} />{current.children}<Section actions={current.actions} description={current.description} title={current.label}><DataTable caption={current.caption} columns={current.columns} emptyState={<HrSourceStateView description={current.emptyDescription} state={current.state ?? "unavailable"} />} rows={current.rows ?? []} /></Section><HrStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} /></div>;
}
function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }
