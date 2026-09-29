"use client";

import { useEffect, useState } from "react";
import { DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { BusinessTarget } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import type { SessionProjection } from "@/features/session";

import { FinanceLayout } from "../finance-layout";
import { formatFinancePeriod, strategyTargetValue, type FinanceSourceState } from "../finance-model";
import { FinanceSourceStateView, FinanceSourceStrip, FinanceStatusDrawer } from "../shared/finance-ui";
import styles from "../finance.module.css";

const tabItems: readonly TabItem[] = ["Ringkasan", "Target", "KPI", "Kas", "Piutang", "Anggaran", "Pajak", "Riwayat"].map((label) => ({ id: label, label }));
interface TargetRow { readonly id: string; readonly name: string; readonly period: string; readonly target: string; readonly actual: string; readonly forecast: string; readonly status: string; }
const targetColumns: readonly DataTableColumn<TargetRow>[] = [{ header: "Target", key: "name", render: (row) => row.name }, { header: "Periode", key: "period", render: (row) => row.period }, { header: "Target", key: "target", render: (row) => row.target }, { header: "Aktual Finance", key: "actual", render: (row) => row.actual }, { header: "Perkiraan Finance", key: "forecast", render: (row) => row.forecast }, { header: "Status", key: "status", render: (row) => row.status }];

export function FinancePerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <FinancePerformance session={session} />}</FinanceLayout>; }

function FinancePerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const [targets, setTargets] = useState<readonly BusinessTarget[]>([]);
  const [strategyState, setStrategyState] = useState<FinanceSourceState>("loading");
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  useEffect(() => { let cancelled = false; void strategyApi.listTargets().then((nextTargets) => { if (cancelled) return; setTargets(nextTargets); setStrategyState(nextTargets.length === 0 ? "connected-empty" : "connected-data"); }).catch(() => { if (!cancelled) setStrategyState("error"); }); return () => { cancelled = true; }; }, []);
  const rows = targets.map((target) => ({ id: target.target_id, name: target.name, period: formatFinancePeriod(target.period), target: strategyTargetValue(target), actual: "—", forecast: "—", status: "Belum Dinilai" }));
  const sourceStatuses = { strategy: strategyState, cash_bank: "unavailable" as const, receipts: "unavailable" as const, payments: "unavailable" as const, sales: "unavailable" as const, property: "unavailable" as const, legal: "unavailable" as const, tax: "unavailable" as const };
  const selectedTab = tabItems.find((tab) => tab.id === activeTab) ?? tabItems[0];
  const strategySection = strategyState === "connected-data" ? <DataTable caption="Target Strategi untuk Finance" columns={targetColumns} getRowKey={(row) => row.id} rows={rows} /> : <FinanceSourceStateView description={strategyState === "error" ? "Data Strategi belum dapat dimuat." : strategyState === "connected-empty" ? "Belum ada target Strategi." : "Target Strategi sedang dimuat."} state={strategyState} />;
  const financeUnavailable = <FinanceSourceStateView description={`Data ${selectedTab?.label ?? "kinerja"} Finance belum tersedia.`} state="unavailable" />;
  let content = strategySection;
  if (selectedTab?.id !== "Ringkasan" && selectedTab?.id !== "Target") content = financeUnavailable;
  return <div className={styles.page}><PageHeader description="Bandingkan target Strategi dengan aktual dan perkiraan dari sumber Finance tanpa menyimpulkan nilai yang belum tersedia." eyebrow="KINERJA FINANCE" metadata={`Workspace aktif: ${activeWorkspace?.workspace_name ?? "—"}`} title={`Target & Kinerja${selectedTab ? ` — ${selectedTab.label}` : ""}`} /><FinanceSourceStrip onStatus={() => setStatusOpen(true)} statuses={sourceStatuses} /><Tabs ariaLabel="Navigasi kinerja Finance" items={tabItems} onValueChange={setActiveTab} value={activeTab} /><Section description={selectedTab?.id === "Ringkasan" || selectedTab?.id === "Target" ? "Target berasal dari Strategi; aktual dan perkiraan keuangan tetap menunggu sumber Finance." : `Tampilan ${selectedTab?.label ?? "kinerja"} Finance menunggu sumber resmi.`} title={selectedTab?.label ?? "Kinerja Finance"}>{content}</Section><Section title="Aktual dan Perkiraan Finance"><FinanceSourceStateView description="Aktual dan perkiraan Finance belum tersedia." state="unavailable" /></Section><FinanceStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} statuses={sourceStatuses} /></div>;
}
