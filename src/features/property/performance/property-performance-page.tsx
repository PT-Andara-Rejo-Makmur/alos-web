"use client";

import { useState } from "react";
import { DataTable, Metric, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "summary", label: "Ringkasan" }, { id: "target", label: "Target" }, { id: "kpi", label: "KPI" }, { id: "project", label: "Per Proyek" }, { id: "contractor", label: "Per Kontraktor" }, { id: "history", label: "Riwayat" }];
const metrics = ["Target Progress", "Actual Progress", "Achievement", "Schedule Variance", "Quality", "Handover Readiness"] as const;
interface PerformanceRow { readonly recordId: string; readonly dimension: string; readonly target: string; readonly actual: string; readonly achievement: string; readonly source: string; }
const performanceRows: readonly PerformanceRow[] = [];
const performanceColumns: readonly DataTableColumn<PerformanceRow>[] = [
  { header: "Dimension", key: "dimension", render: (row) => row.dimension }, { header: "Target", key: "target", render: (row) => row.target },
  { header: "Actual", key: "actual", render: (row) => row.actual }, { header: "Achievement", key: "achievement", render: (row) => row.achievement },
  { header: "Source", key: "source", render: (row) => row.source },
];

export function PropertyPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyPerformance session={session} />}</PropertyLayout>; }

function PropertyPerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("summary");
  const [filters, setFilters] = useState({ period: "all", project: "all", contractor: "all" });
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Target dan performance Property berasal dari Strategy projection dan operational outcome authoritative." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Target & Kinerja" />
    <PropertySourceNote>Strategy target dan actual technical outcome belum terhubung. Property tidak menghitung achievement dari candidate atau data frontend.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan performance property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Kinerja"><PropertyFilterBar ariaLabel="Filter performance property"><PropertySelect label="Periode" name="performance-period" onChange={(value) => setFilters((current) => ({ ...current, period: value }))} options={[["all", "Semua periode"]]} value={filters.period} /><PropertySelect label="Project" name="performance-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Kontraktor" name="performance-contractor" onChange={(value) => setFilters((current) => ({ ...current, contractor: value }))} options={[["all", "Semua kontraktor"]]} value={filters.contractor} /></PropertyFilterBar></Section>
    <section aria-label="Metric performance Property" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "Ringkasan"}><PropertyUnavailableState description="Performance projection belum tersedia." /></Section>
    <Section description="Breakdown menunggu Strategy target dan governed technical outcome." title="Breakdown Kinerja"><DataTable caption="Breakdown performance Property" columns={performanceColumns} emptyState={<PropertyUnavailableState description="Breakdown performance belum tersedia." />} getRowKey={(row) => row.recordId} rows={performanceRows} /></Section>
  </div>;
}
