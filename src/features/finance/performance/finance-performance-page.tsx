"use client";

import { useEffect, useState } from "react";
import { DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { BusinessTarget } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import type { SessionProjection } from "@/features/session";

import { FinanceLayout } from "../finance-layout";
import { FinanceSourceStrip, FinanceStatusDrawer, FinanceUnavailableState } from "../shared/finance-ui";
import styles from "../finance.module.css";

const tabs: readonly TabItem[] = ["Ringkasan", "Target", "KPI", "Kas", "Piutang", "Anggaran", "Pajak", "Riwayat"].map((label) => ({ id: label, label }));
interface TargetRow { readonly id: string; readonly name: string; readonly period: string; readonly target: string; readonly actual: string; readonly forecast: string; readonly status: string; }
const columns: readonly DataTableColumn<TargetRow>[] = [
  { header: "Target", key: "name", render: (row) => row.name }, { header: "Periode", key: "period", render: (row) => row.period }, { header: "Target", key: "target", render: (row) => row.target }, { header: "Aktual", key: "actual", render: (row) => row.actual }, { header: "Perkiraan", key: "forecast", render: (row) => row.forecast }, { header: "Status", key: "status", render: (row) => row.status },
];

export function FinancePerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <FinancePerformance session={session} />}</FinanceLayout>; }

function FinancePerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const [targets, setTargets] = useState<readonly BusinessTarget[]>([]);
  const [state, setState] = useState<"loading" | "unavailable" | "connected-empty" | "connected-data">("loading");
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  useEffect(() => { let cancelled = false; void strategyApi.listTargets().then((nextTargets) => { if (cancelled) return; setTargets(nextTargets); setState(nextTargets.length === 0 ? "connected-empty" : "connected-data"); }).catch(() => { if (!cancelled) setState("unavailable"); }); return () => { cancelled = true; }; }, []);
  const rows = targets.map((target) => ({ id: target.target_id, name: target.name, period: String(target.period), target: "—", actual: "—", forecast: "—", status: "Belum Dinilai" }));
  return <div className={styles.page}><PageHeader description="Bandingkan target Strategy dengan aktual dan perkiraan dari sumber Finance tanpa menyimpulkan nilai yang belum tersedia." eyebrow="KINERJA FINANCE" metadata={`Workspace aktif: ${activeWorkspace?.workspace_name ?? "—"}`} title="Target & Kinerja" /><FinanceSourceStrip onStatus={() => setStatusOpen(true)} /><Tabs ariaLabel="Navigasi kinerja Finance" items={tabs} /><Section description="Target berasal dari Strategy; aktual dan perkiraan keuangan tetap menunggu sumber Finance." title="Target Strategy">{state === "loading" ? <p aria-live="polite">Memuat target…</p> : state === "unavailable" ? <FinanceUnavailableState description="Target Strategy belum dapat dimuat." /> : state === "connected-empty" ? <FinanceUnavailableState description="Belum ada target Strategy." title="Belum ada data" /> : <DataTable caption="Target Strategy untuk Finance" columns={columns} getRowKey={(row) => row.id} rows={rows} />}</Section><Section title="Aktual dan Perkiraan Keuangan"><FinanceUnavailableState description="Aktual, perkiraan, kas, piutang, anggaran, dan pajak belum tersedia." /></Section><FinanceStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} /></div>;
}
