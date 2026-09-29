"use client";

import { useState } from "react";
import { DataTable, Metric, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "summary", label: "Ringkasan" }, { id: "target", label: "Target" }, { id: "kpi", label: "KPI" }, { id: "project", label: "Per Proyek" }, { id: "contractor", label: "Per Kontraktor" }, { id: "history", label: "Riwayat" }];
const metrics = ["Target Progres", "Progres Aktual", "Capaian", "Deviasi Jadwal", "Mutu", "Kesiapan Serah Terima"] as const;
interface PerformanceRow { readonly recordId: string; readonly dimension: string; readonly target: string; readonly actual: string; readonly achievement: string; readonly source: string; }
const performanceRows: readonly PerformanceRow[] = [];
const performanceColumns: readonly DataTableColumn<PerformanceRow>[] = [
  { header: "Dimensi", key: "dimension", render: (row) => row.dimension }, { header: "Target", key: "target", render: (row) => row.target },
  { header: "Aktual", key: "actual", render: (row) => row.actual }, { header: "Capaian", key: "achievement", render: (row) => row.achievement },
  { header: "Sumber", key: "source", render: (row) => row.source },
];

export function PropertyPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyPerformance session={session} />}</PropertyLayout>; }

function PropertyPerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("summary");
  const [filters, setFilters] = useState({ period: "all", project: "all", contractor: "all" });
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Target dan kinerja Property berasal dari data Strategy dan hasil operasional yang telah ditetapkan." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Target & Kinerja" />
    <PropertySourceNote>Target Strategy dan hasil teknis aktual belum terhubung. Capaian tidak dihitung dari kandidat atau data sementara di halaman ini.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan kinerja Property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Kinerja"><PropertyFilterBar ariaLabel="Filter kinerja Property"><PropertySelect label="Periode" name="performance-period" onChange={(value) => setFilters((current) => ({ ...current, period: value }))} options={[["all", "Semua periode"]]} value={filters.period} /><PropertySelect label="Proyek" name="performance-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Kontraktor" name="performance-contractor" onChange={(value) => setFilters((current) => ({ ...current, contractor: value }))} options={[["all", "Semua kontraktor"]]} value={filters.contractor} /></PropertyFilterBar></Section>
    <section aria-label="Metric performance Property" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "Ringkasan"}><PropertyUnavailableState description="Data kinerja belum tersedia." /></Section>
    <Section description="Rincian menunggu target Strategy dan hasil teknis yang telah ditetapkan." title="Rincian Kinerja"><DataTable caption="Rincian kinerja Property" columns={performanceColumns} emptyState={<PropertyUnavailableState description="Rincian kinerja belum tersedia." />} getRowKey={(row) => row.recordId} rows={performanceRows} /></Section>
  </div>;
}
