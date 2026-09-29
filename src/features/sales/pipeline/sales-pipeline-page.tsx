"use client";

import { useState } from "react";

import { Alert, Button, DataTable, PageHeader, Section, Status, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesDetailDrawer, SalesFilterBar, SalesSelect, SalesSourceNote, SalesUnavailableState } from "../shared/sales-ui";
import styles from "../sales.module.css";

const stages = ["Lead", "Qualified", "Survey", "Booking", "SPK", "KPR", "SP3K", "Akad", "Closing"] as const;
const pipelineTabs: readonly TabItem[] = [{ id: "daftar", label: "Daftar" }, { id: "pipeline", label: "Pipeline" }];

export interface PipelineRow {
  readonly recordId: string;
  readonly prospect: string;
  readonly projectUnit: string;
  readonly stage: string;
  readonly owner: string;
  readonly channel: string;
  readonly potentialValue: string;
  readonly lastActivity: string;
  readonly nextAction: string;
  readonly due: string;
  readonly pipelineAge: string;
  readonly status: string;
}

interface PipelineFilters {
  readonly period: string;
  readonly project: string;
  readonly owner: string;
  readonly channel: string;
  readonly stage: string;
  readonly status: string;
  readonly leadAge: string;
}

const initialFilters: PipelineFilters = { channel: "all", leadAge: "all", owner: "all", period: "all", project: "all", stage: "all", status: "all" };

export function SalesPipelinePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesPipeline session={session} />}</SalesLayout>;
}

function SalesPipeline({ session }: Readonly<{ session: SessionProjection }>) {
  const [filters, setFilters] = useState<PipelineFilters>(initialFilters);
  const [view, setView] = useState("daftar");
  const [selectedRow, setSelectedRow] = useState<PipelineRow | null>(null);
  const workspaceKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const pipelineRows: readonly PipelineRow[] = [];
  const updateFilter = (key: keyof PipelineFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div className={styles.page}>
      <PageHeader description="Daftar pipeline dan tahap tindak lanjut sesuai scope workspace Sales." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="Pipeline Penjualan" />
      <SalesSourceNote>Sales pipeline authoritative belum tersedia. Filter dan struktur tabel siap digunakan setelah contract/backend terhubung.</SalesSourceNote>
      <Section title="Filter Pipeline">
          <SalesFilterBar ariaLabel="Filter pipeline penjualan">
          <SalesSelect label="Periode" name="pipeline-period" onChange={(value) => updateFilter("period", value)} options={[["all", "Semua periode"], ["30d", "30 hari"], ["90d", "90 hari"], ["year", "Tahun berjalan"]]} value={filters.period} />
          <SalesSelect label="Project" name="pipeline-project" onChange={(value) => updateFilter("project", value)} options={[["all", "Semua project"]]} value={filters.project} />
          <SalesSelect label="Owner" name="pipeline-owner" onChange={(value) => updateFilter("owner", value)} options={[["all", "Semua owner"]]} value={filters.owner} />
          <SalesSelect label="Channel" name="pipeline-channel" onChange={(value) => updateFilter("channel", value)} options={[["all", "Semua channel"]]} value={filters.channel} />
          <SalesSelect label="Stage" name="pipeline-stage" onChange={(value) => updateFilter("stage", value)} options={[["all", "Semua stage"], ...stages.map((stage) => [stage, stage] as const)]} value={filters.stage} />
          <SalesSelect label="Status" name="pipeline-status" onChange={(value) => updateFilter("status", value)} options={[["all", "Semua status"], ["active", "Aktif"], ["pending", "Tertunda"], ["won", "Won"], ["lost", "Lost"]]} value={filters.status} />
          <SalesSelect label="Lead age" name="pipeline-lead-age" onChange={(value) => updateFilter("leadAge", value)} options={[["all", "Semua usia"], ["0-7", "0–7 hari"], ["8-30", "8–30 hari"], ["31+", "31+ hari"]]} value={filters.leadAge} />
        </SalesFilterBar>
      </Section>
      <Section description="Tahap dapat dipilih sebagai filter. Jumlah tidak diisi sebelum pipeline authoritative tersedia." title="Stage Summary">
        <DataTable caption="Ringkasan tahap pipeline" columns={stageColumns} getRowKey={(stage) => stage} rowAction={(stage) => <Button aria-label={`Filter stage ${stage}`} onClick={() => updateFilter("stage", stage)} size="sm" variant={filters.stage === stage ? "secondary" : "ghost"}>Pilih</Button>} rows={stages} />
      </Section>
      <Section actions={<Tabs ariaLabel="Tampilan pipeline" items={pipelineTabs} onValueChange={setView} value={view} />} description="Tabel menjadi sumber kerja utama; detail dibuka melalui quick view ketika baris authoritative tersedia." title={view === "daftar" ? "Daftar Pipeline" : "Pipeline"}>
        {view === "daftar" ? <DataTable caption="Daftar pipeline penjualan" columns={pipelineColumns} emptyState={<SalesUnavailableState description="Daftar pipeline akan tampil setelah sumber Sales Pipeline terhubung." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelectedRow(row)} size="sm" variant="secondary">Lihat cepat</Button>} rows={pipelineRows} /> : <div className={styles.pipelineViewState}><Alert message="Visual pipeline akan menggunakan stage dan data authoritative yang sama dengan Daftar Pipeline." title="Pipeline Belum Terhubung" variant="neutral" /><DataTable caption="Tahap pipeline penjualan" columns={stageColumns} getRowKey={(stage) => stage} rows={stages} /></div>}
      </Section>
      <Alert message="Sales dapat memantau dan menindaklanjuti pipeline. Booking fee, SPK validity, KPR approval, SP3K, akad, refund, dan official closing tetap read-only dari authority Finance, Legal, Property, atau outcome governed." title="Batas Authority Sales" variant="neutral" />
      <SalesDetailDrawer description="Quick view hanya menampilkan data pipeline authoritative yang dipilih." items={selectedRow ? pipelineDetailItems(selectedRow) : []} onClose={() => setSelectedRow(null)} open={selectedRow !== null} title="Quick View Pipeline" />
    </div>
  );
}

const stageColumns: readonly DataTableColumn<(typeof stages)[number]>[] = [
  { header: "Stage", key: "stage", render: (stage) => stage },
  { header: "Jumlah", key: "count", render: () => "—" },
  { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
];

const pipelineColumns: readonly DataTableColumn<PipelineRow>[] = [
  { header: "Prospect", key: "prospect", render: (row) => row.prospect },
  { header: "Project/Unit", key: "projectUnit", render: (row) => row.projectUnit },
  { header: "Stage", key: "stage", render: (row) => row.stage },
  { header: "Owner", key: "owner", render: (row) => row.owner },
  { header: "Channel", key: "channel", render: (row) => row.channel },
  { header: "Potential Value", key: "potentialValue", render: (row) => row.potentialValue },
  { header: "Last Activity", key: "lastActivity", render: (row) => row.lastActivity },
  { header: "Next Action", key: "nextAction", render: (row) => row.nextAction },
  { header: "Due", key: "due", render: (row) => row.due },
  { header: "Pipeline Age", key: "pipelineAge", render: (row) => row.pipelineAge },
  { header: "Status", key: "status", render: (row) => row.status },
];

function pipelineDetailItems(row: PipelineRow) {
  return [
    { label: "Record", value: row.recordId },
    { label: "Prospect", value: row.prospect },
    { label: "Project/Unit", value: row.projectUnit },
    { label: "Stage", value: row.stage },
    { label: "Owner", value: row.owner },
    { label: "Next Action", value: row.nextAction },
    { label: "Due", value: row.due },
    { label: "Status", value: row.status },
  ];
}
