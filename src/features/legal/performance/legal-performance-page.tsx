"use client";

import { useEffect, useState } from "react";
import { DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { BusinessTarget } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import type { SessionProjection } from "@/features/session";
import type { LegalSourceState } from "../legal-model";
import { LegalLayout } from "../legal-layout";
import { LegalSourceStateView, LegalSourceStrip, LegalStatusDrawer } from "../shared/legal-ui";
import styles from "../legal.module.css";

type TargetRow = { readonly id: string; readonly name: string; readonly period: string; readonly target: string; readonly actual: string; readonly forecast: string };
const columns: readonly DataTableColumn<TargetRow>[] = [{ header: "Target", key: "name", render: (row) => row.name }, { header: "Periode", key: "period", render: (row) => row.period }, { header: "Target", key: "target", render: (row) => row.target }, { header: "Aktual Legal", key: "actual", render: (row) => row.actual }, { header: "Perkiraan Legal", key: "forecast", render: (row) => row.forecast }];
const tabs: readonly TabItem[] = ["Ringkasan", "Target", "KPI", "Kontrak", "Perizinan", "Risiko", "Riwayat"].map((label) => ({ id: label, label }));

export function LegalPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <LegalLayout workspaceKey={workspaceKey}>{(session) => <LegalPerformance session={session} />}</LegalLayout>; }

function LegalPerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const [targets, setTargets] = useState<readonly BusinessTarget[]>([]);
  const [sourceState, setSourceState] = useState<LegalSourceState>("loading");
  const [tab, setTab] = useState("Ringkasan");
  const [statusOpen, setStatusOpen] = useState(false);
  const workspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  useEffect(() => { let cancelled = false; void strategyApi.listTargets().then((next) => { if (cancelled) return; setTargets(next); setSourceState(next.length ? "connected-data" : "connected-empty"); }).catch(() => { if (!cancelled) setSourceState("error"); }); return () => { cancelled = true; }; }, []);
  const rows = targets.map((target) => ({ id: target.target_id, name: target.name, period: target.period.label || "—", target: target.observations?.find((observation) => observation.kind === "TARGET")?.value == null ? "—" : String(target.observations.find((observation) => observation.kind === "TARGET")?.value), actual: "—", forecast: "—" }));
  const content = tab === "Ringkasan" || tab === "Target" ? <>{sourceState === "connected-data" ? <DataTable caption="Target Strategi untuk Legal" columns={columns} rows={rows} /> : <LegalSourceStateView description={sourceState === "error" ? "Data Strategi belum dapat dimuat." : sourceState === "connected-empty" ? "Belum ada target Strategi." : "Target Strategi sedang dimuat."} state={sourceState} />}</> : <LegalSourceStateView description={`Data ${tab} Legal belum tersedia.`} state="unavailable" />;
  return <div className={styles.page}><PageHeader description="Bandingkan target Strategi dengan aktual dan perkiraan Legal tanpa menyimpulkan nilai yang belum tersedia." eyebrow="LEGAL & KINERJA" metadata={`Workspace aktif: ${workspace?.workspace_name ?? "—"}`} title={`Target & Kinerja${tab ? ` — ${tab}` : ""}`} /><LegalSourceStrip onStatus={() => setStatusOpen(true)} statuses={{ contracts: "unavailable", permits: "unavailable", project_assets: "unavailable", finance: "unavailable", sales: "unavailable", hr: "unavailable", documents: "unavailable", regulation: "unavailable" }} /><Tabs ariaLabel="Navigasi kinerja Legal" items={tabs} onValueChange={setTab} value={tab} /><Section description={tab === "Ringkasan" || tab === "Target" ? "Target berasal dari Strategi; aktual dan perkiraan Legal menunggu sumber resmi." : `Tampilan ${tab} Legal menunggu sumber resmi.`} title={tab}>{content}</Section><Section title="Aktual dan Perkiraan Legal"><LegalSourceStateView description="Aktual dan perkiraan Legal belum tersedia." state="unavailable" /></Section><LegalStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} /></div>;
}
