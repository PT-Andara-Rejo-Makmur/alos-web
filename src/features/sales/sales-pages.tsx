"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  DataTable,
  Drawer,
  EmptyState,
  FormField,
  Metric,
  PageHeader,
  Section,
  Status,
  Tabs,
  type TabItem,
} from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { activeSalesWorkspaceKey } from "./sales-model";
import { SalesLayout } from "./sales-layout";
import styles from "./sales.module.css";

const sources = [
  "Strategy",
  "Sales Pipeline",
  "Campaign",
  "Finance Verification",
  "Legal/KPR",
  "Property/Unit",
] as const;

const stages = ["Lead", "Qualified", "Survey", "Booking", "SPK", "KPR", "SP3K", "Akad", "Closing"] as const;
const summaryMetrics = ["Target Closing", "Closing Aktual", "Pipeline Aktif", "Conversion"] as const;
const secondaryIndicators = ["Waktu Respons", "Pembatalan", "Biaya per Lead"] as const;

export function SalesSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesSummary session={session} />}</SalesLayout>;
}

function SalesSummary({ session }: Readonly<{ session: SessionProjection }>) {
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal
    ? session.principal.active_workspace?.workspace
    : null;

  return (
    <div className={styles.page}>
      <PageHeader
        description="Sales Operating Control Center untuk membaca target, pipeline, dan kesiapan hasil penjualan."
        eyebrow="PUSAT PENJUALAN"
        title="Sales & Marketing"
        metadata={`Workspace aktif: ${activeWorkspace?.workspace_name ?? "—"}`}
      />

      <div aria-label="Konteks ringkasan Sales" className={styles.contextBar}>
        <ContextItem label="Periode" value="—" />
        <ContextItem label="Project" value="—" />
        <ContextItem label="Workspace" value={activeWorkspace?.workspace_name ?? "—"} />
        <ContextItem label="Status data" status value="Belum Terhubung" />
      </div>

      <div className={styles.sourceStrip}>
        {sources.map((source) => (
          <span className={styles.sourceItem} key={source}>
            <span>{source}</span>
            <Status label="Belum Terhubung" variant="neutral" />
          </span>
        ))}
        <Button onClick={() => setStatusOpen(true)} size="sm" variant="ghost">Lihat Status Data</Button>
      </div>

      <Section bordered title="Ringkasan Utama">
        <div className={styles.metrics}>
          {summaryMetrics.map((label) => (
            <Metric key={label} label={label} supportingText="Belum Terhubung" value="—" />
          ))}
        </div>
      </Section>

      <Section description="Nilai tetap tidak disimpulkan ketika sumber operasional belum tersedia." title="Indikator Operasional">
        <DataTable
          caption="Indikator operasional Sales"
          columns={[
            { header: "Indikator", key: "label", render: (item) => item },
            { header: "Nilai", key: "value", render: () => "—" },
            { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
          ]}
          getRowKey={(item) => item}
          rows={secondaryIndicators}
        />
      </Section>

      <Section description="Urutan tahap ditampilkan sebagai struktur Sales; jumlah dan konversi menunggu sumber resmi." title="Funnel Penjualan">
        <DataTable
          caption="Funnel Lead sampai Closing"
          columns={[
            { header: "Tahap", key: "stage", render: (stage) => stage },
            { header: "Jumlah", key: "count", render: () => "—" },
            { header: "Conversion", key: "conversion", render: () => "—" },
            { header: "Usia Rata-rata", key: "age", render: () => "—" },
            { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
          ]}
          getRowKey={(stage) => stage}
          rows={stages}
        />
      </Section>

      <Section title="Perlu Perhatian">
        <EmptyState
          description="Tindak lanjut, booking, dan closing yang memerlukan perhatian akan tampil setelah sumber resmi tersedia."
          title="Belum Terhubung"
        />
      </Section>

      <div className={styles.summaryGrid}>
        <Section title="Channel">
          <Alert message="Atribusi channel dan biaya per lead belum tersedia dari sumber Campaign." title="Data Channel Belum Terhubung" variant="neutral" />
        </Section>
        <Section title="Project/Product readiness">
          <Alert message="Project, unit, harga, dan ketersediaan tetap menjadi projection dari Property." title="Data Project/Product Belum Terhubung" variant="neutral" />
        </Section>
      </div>

      <Section title="Persetujuan & Temuan">
        <Alert message="Ringkasan persetujuan dan temuan yang relevan akan tampil setelah sumber Shared Work tersedia." title="Data Persetujuan dan Temuan Belum Terhubung" variant="neutral" />
      </Section>

      <Drawer
        description="Ketersediaan ditampilkan dari sumber yang terhubung; tidak ada nilai bisnis yang dibuat oleh dashboard."
        onClose={() => setStatusOpen(false)}
        open={statusOpen}
        title="Status Data"
      >
        <DataTable
          caption="Status sumber penjualan"
          columns={[
            { header: "Sumber", key: "source", render: (source) => source },
            { header: "Status", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
            { header: "Waktu Data", key: "updated", render: () => "—" },
            { header: "Verifikasi", key: "verification", render: () => "—" },
          ]}
          getRowKey={(source) => source}
          rows={sources}
        />
      </Drawer>
    </div>
  );
}

function ContextItem({ label, status = false, value }: Readonly<{ label: string; status?: boolean; value: string }>) {
  return (
    <div className={styles.contextItem}>
      <span className={styles.contextLabel}>{label}</span>
      {status ? <Status label={value} variant="neutral" /> : <span className={styles.contextValue}>{value}</span>}
    </div>
  );
}

interface SalesModuleReadinessProps {
  readonly title: string;
  readonly description: string;
  readonly tabs?: readonly TabItem[];
  readonly detail: string;
  readonly workspaceKey?: string;
}

/** Readiness-only shell for Sales modules whose contracts are not available yet. */
export function SalesModuleReadinessPage({ title, description, tabs, detail, workspaceKey }: SalesModuleReadinessProps) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesModuleReadinessContent session={session} title={title} description={description} tabs={tabs} detail={detail} />}</SalesLayout>;
}

function SalesModuleReadinessContent({ session, title, description, tabs, detail }: SalesModuleReadinessProps & { readonly session: SessionProjection }) {
  const [tab, setTab] = useState(tabs?.[0]?.id ?? "overview");
  const activeWorkspaceKey = activeSalesWorkspaceKey(session);
  return (
    <div className={styles.page}>
      <PageHeader
        description={description}
        eyebrow="SALES & MARKETING"
        metadata={`Workspace aktif: ${activeWorkspaceKey ?? "—"}`}
        title={title}
      />
      {tabs ? <Tabs ariaLabel={`Navigasi ${title}`} items={tabs} onValueChange={setTab} value={tab} /> : null}
      <Section title="Ketersediaan Data">
        <div className={styles.readinessRow}>
          <Status label="Belum Terhubung" variant="neutral" />
          <p>{detail} Data tidak dibuat atau disimpulkan oleh antarmuka.</p>
        </div>
      </Section>
      <Section title="Kesiapan Modul">
        <Alert message="Daftar, detail, dan tindakan pada modul ini akan tersedia setelah sumber data dan kewenangan terkait dihubungkan. Tidak ada catatan atau hasil yang dibuat secara simulasi." title="Modul sedang disiapkan" variant="neutral" />
      </Section>
    </div>
  );
}

interface PipelineRow {
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

const initialPipelineFilters: PipelineFilters = {
  channel: "all",
  leadAge: "all",
  owner: "all",
  period: "all",
  project: "all",
  stage: "all",
  status: "all",
};

const pipelineTabs: readonly TabItem[] = [
  { id: "daftar", label: "Daftar" },
  { id: "pipeline", label: "Pipeline" },
];

export function SalesPipelinePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesPipeline session={session} />}</SalesLayout>;
}

function SalesPipeline({ session }: Readonly<{ session: SessionProjection }>) {
  const [filters, setFilters] = useState<PipelineFilters>(initialPipelineFilters);
  const [view, setView] = useState("daftar");
  const [selectedRow, setSelectedRow] = useState<PipelineRow | null>(null);
  const workspaceKey = activeSalesWorkspaceKey(session);
  const pipelineRows: readonly PipelineRow[] = [];
  const updateFilter = (key: keyof PipelineFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className={styles.page}>
      <PageHeader
        description="Daftar pipeline dan tahap tindak lanjut sesuai scope workspace Sales."
        eyebrow="SALES & MARKETING"
        title="Pipeline Penjualan"
        metadata={`Workspace aktif: ${workspaceKey ?? "—"}`}
      />

      <div className={styles.pipelineSourceNote}>
        <Status label="Belum Terhubung" variant="neutral" />
        <span>Sales pipeline authoritative belum tersedia. Filter dan struktur tabel siap digunakan setelah contract/backend terhubung.</span>
      </div>

      <Section title="Filter Pipeline">
        <div aria-label="Filter pipeline penjualan" className={styles.pipelineFilters} role="group">
          <PipelineFilter label="Periode" name="period" onChange={(value) => updateFilter("period", value)} options={[
            ["all", "Semua periode"], ["30d", "30 hari"], ["90d", "90 hari"], ["year", "Tahun berjalan"],
          ]} value={filters.period} />
          <PipelineFilter label="Project" name="project" onChange={(value) => updateFilter("project", value)} options={[["all", "Semua project"]]} value={filters.project} />
          <PipelineFilter label="Owner" name="owner" onChange={(value) => updateFilter("owner", value)} options={[["all", "Semua owner"]]} value={filters.owner} />
          <PipelineFilter label="Channel" name="channel" onChange={(value) => updateFilter("channel", value)} options={[["all", "Semua channel"]]} value={filters.channel} />
          <PipelineFilter label="Stage" name="stage" onChange={(value) => updateFilter("stage", value)} options={[["all", "Semua stage"], ...stages.map((stage) => [stage, stage] as const)]} value={filters.stage} />
          <PipelineFilter label="Status" name="status" onChange={(value) => updateFilter("status", value)} options={[["all", "Semua status"], ["active", "Aktif"], ["pending", "Tertunda"], ["won", "Won"], ["lost", "Lost"]]} value={filters.status} />
          <PipelineFilter label="Lead age" name="lead-age" onChange={(value) => updateFilter("leadAge", value)} options={[["all", "Semua usia"], ["0-7", "0–7 hari"], ["8-30", "8–30 hari"], ["31+", "31+ hari"]]} value={filters.leadAge} />
        </div>
      </Section>

      <Section description="Tahap dapat dipilih sebagai filter. Jumlah tidak diisi sebelum pipeline authoritative tersedia." title="Stage Summary">
        <DataTable
          caption="Ringkasan tahap pipeline"
          columns={[
            { header: "Stage", key: "stage", render: (stage) => stage },
            { header: "Jumlah", key: "count", render: () => "—" },
            { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
          ]}
          getRowKey={(stage) => stage}
          rowAction={(stage) => (
            <Button
              aria-label={`Filter stage ${stage}`}
              onClick={() => updateFilter("stage", stage)}
              size="sm"
              variant={filters.stage === stage ? "secondary" : "ghost"}
            >
              Pilih
            </Button>
          )}
          rows={stages}
        />
      </Section>

      <Section
        actions={<Tabs ariaLabel="Tampilan pipeline" items={pipelineTabs} onValueChange={setView} value={view} />}
        description="Tabel menjadi sumber kerja utama; detail dibuka melalui quick view ketika baris authoritative tersedia."
        title={view === "daftar" ? "Daftar Pipeline" : "Pipeline"}
      >
        {view === "daftar" ? (
          <DataTable
            caption="Daftar pipeline penjualan"
            columns={pipelineColumns}
            emptyState={<EmptyState description="Daftar pipeline akan tampil setelah sumber Sales Pipeline terhubung." title="Belum Terhubung" />}
            getRowKey={(row) => row.prospect}
            rowAction={(row) => <Button onClick={() => setSelectedRow(row)} size="sm" variant="secondary">Lihat cepat</Button>}
            rows={pipelineRows}
          />
        ) : (
          <div className={styles.pipelineViewState}>
            <Alert message="Visual pipeline akan menggunakan stage dan data authoritative yang sama dengan Daftar Pipeline." title="Pipeline Belum Terhubung" variant="neutral" />
            <DataTable
              caption="Tahap pipeline penjualan"
              columns={[
                { header: "Tahap", key: "stage", render: (stage) => stage },
                { header: "Jumlah", key: "count", render: () => "—" },
                { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
              ]}
              getRowKey={(stage) => stage}
              rows={stages}
            />
          </div>
        )}
      </Section>

      <Alert
        message="Sales dapat memantau dan menindaklanjuti pipeline. Booking fee, SPK validity, KPR approval, SP3K, akad, refund, dan official closing tetap read-only dari authority Finance, Legal, Property, atau outcome governed."
        title="Batas Authority Sales"
        variant="neutral"
      />

      <Drawer
        description="Quick view hanya menampilkan data pipeline authoritative yang dipilih."
        onClose={() => setSelectedRow(null)}
        open={selectedRow !== null}
        title="Quick View Pipeline"
      >
        {selectedRow ? <PipelineQuickView row={selectedRow} /> : null}
      </Drawer>
    </div>
  );
}

function PipelineFilter({
  label,
  name,
  onChange,
  options,
  value,
}: Readonly<{
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  value: string;
}>) {
  return (
    <FormField htmlFor={`sales-pipeline-${name}`} label={label}>
      <select id={`sales-pipeline-${name}`} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </FormField>
  );
}

const pipelineColumns = [
  { header: "Prospect", key: "prospect", render: (row: PipelineRow) => row.prospect },
  { header: "Project/Unit", key: "projectUnit", render: (row: PipelineRow) => row.projectUnit },
  { header: "Stage", key: "stage", render: (row: PipelineRow) => row.stage },
  { header: "Owner", key: "owner", render: (row: PipelineRow) => row.owner },
  { header: "Channel", key: "channel", render: (row: PipelineRow) => row.channel },
  { header: "Potential Value", key: "potentialValue", render: (row: PipelineRow) => row.potentialValue },
  { header: "Last Activity", key: "lastActivity", render: (row: PipelineRow) => row.lastActivity },
  { header: "Next Action", key: "nextAction", render: (row: PipelineRow) => row.nextAction },
  { header: "Due", key: "due", render: (row: PipelineRow) => row.due },
  { header: "Pipeline Age", key: "pipelineAge", render: (row: PipelineRow) => row.pipelineAge },
  { header: "Status", key: "status", render: (row: PipelineRow) => row.status },
] as const;

function PipelineQuickView({ row }: Readonly<{ row: PipelineRow }>) {
  return (
    <dl className={styles.quickViewList}>
      <QuickViewItem label="Prospect" value={row.prospect} />
      <QuickViewItem label="Project/Unit" value={row.projectUnit} />
      <QuickViewItem label="Stage" value={row.stage} />
      <QuickViewItem label="Owner" value={row.owner} />
      <QuickViewItem label="Next Action" value={row.nextAction} />
      <QuickViewItem label="Due" value={row.due} />
      <QuickViewItem label="Status" value={row.status} />
    </dl>
  );
}

function QuickViewItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return <><dt>{label}</dt><dd>{value}</dd></>;
}
