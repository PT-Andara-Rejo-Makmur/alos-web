"use client";

import { useState } from "react";

import { DataTable, PageHeader, Section, Status, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesFilterBar, SalesSelect, SalesSourceNote, SalesUnavailableState } from "../shared/sales-ui";
import styles from "../sales.module.css";

const tabs: readonly TabItem[] = [
  { id: "summary", label: "Ringkasan" }, { id: "targets", label: "Target" }, { id: "kpi", label: "KPI" },
  { id: "owner", label: "Per Sales" }, { id: "project", label: "Per Project" }, { id: "channel", label: "Per Channel" }, { id: "history", label: "Riwayat" },
];
const performanceMetrics = ["Target Closing", "Actual Closing", "Achievement", "Pipeline Coverage", "Conversion", "Response Time", "Cancellation", "CPL"] as const;

interface PerformanceRow { readonly recordId: string; readonly dimension: string; readonly period: string; readonly target: string; readonly actual: string; readonly achievement: string; readonly status: string; }

const performanceRows: readonly PerformanceRow[] = [];

export function SalesPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesPerformance session={session} />}</SalesLayout>;
}

function SalesPerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("summary");
  const [filters, setFilters] = useState({ channel: "all", owner: "all", period: "all", project: "all" });
  const workspaceKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;

  return (
    <div className={styles.page}>
      <PageHeader description="Target dan kinerja Sales dari Strategy serta governed outcome resmi." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="Target & Kinerja" />
      <SalesSourceNote>Target berasal dari Strategy; Actual Closing berasal dari governed outcome. Tidak ada actual yang dihitung dari candidate closing.</SalesSourceNote>
      <Tabs ariaLabel="Tampilan target dan kinerja" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Filter Kinerja">
        <SalesFilterBar>
          <SalesSelect label="Periode" name="performance-period" onChange={(value) => setFilters((current) => ({ ...current, period: value }))} options={[["all", "Semua periode"]]} value={filters.period} />
          <SalesSelect label="Penanggung Jawab" name="performance-owner" onChange={(value) => setFilters((current) => ({ ...current, owner: value }))} options={[["all", "Semua penanggung jawab"]]} value={filters.owner} />
          <SalesSelect label="Proyek" name="performance-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} />
          <SalesSelect label="Saluran" name="performance-channel" onChange={(value) => setFilters((current) => ({ ...current, channel: value }))} options={[["all", "Semua saluran"]]} value={filters.channel} />
        </SalesFilterBar>
      </Section>
      <Section title={tab === "summary" ? "Kinerja Sales" : `${tabs.find((item) => item.id === tab)?.label ?? "Kinerja"} Sales`}>
        <div className={styles.metrics}>{performanceMetrics.map((metric) => <article className={styles.metricReadOnly} key={metric}><span>{metric}</span><strong>—</strong><Status label="Belum Terhubung" variant="neutral" /></article>)}</div>
      </Section>
      <Section description="Breakdown owner, project, channel, dan period menunggu projection Strategy dan governed outcome." title="Breakdown Kinerja">
        <DataTable caption="Breakdown target dan kinerja Sales" columns={performanceColumns} emptyState={<SalesUnavailableState description="Breakdown kinerja akan tampil setelah sumber Strategy dan outcome terhubung." />} getRowKey={(row) => row.recordId} rows={performanceRows} />
      </Section>
    </div>
  );
}

const performanceColumns: readonly DataTableColumn<PerformanceRow>[] = [
  { header: "Dimension", key: "dimension", render: (row) => row.dimension }, { header: "Periode", key: "period", render: (row) => row.period },
  { header: "Target Closing", key: "target", render: (row) => row.target }, { header: "Actual Closing", key: "actual", render: (row) => row.actual },
  { header: "Achievement", key: "achievement", render: (row) => row.achievement }, { header: "Status", key: "status", render: (row) => row.status },
];
