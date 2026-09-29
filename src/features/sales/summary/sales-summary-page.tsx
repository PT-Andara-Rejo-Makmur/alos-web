"use client";

import { useState } from "react";

import { Alert, Button, DataTable, Drawer, EmptyState, Metric, PageHeader, Section, Status } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import styles from "../sales.module.css";

const sources = ["Strategy", "Sales Pipeline", "Campaign", "Finance Verification", "Legal/KPR", "Property/Unit"] as const;
const stages = ["Lead", "Qualified", "Survey", "Booking", "SPK", "KPR", "SP3K", "Akad", "Closing"] as const;
const summaryMetrics = ["Target Closing", "Closing Aktual", "Pipeline Aktif", "Conversion"] as const;
const secondaryIndicators = ["Waktu Respons", "Pembatalan", "Biaya per Lead"] as const;

export function SalesSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesSummary session={session} />}</SalesLayout>;
}

function SalesSummary({ session }: Readonly<{ session: SessionProjection }>) {
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;

  return (
    <div className={styles.page}>
      <PageHeader
        description="Sales Operating Control Center untuk membaca target, pipeline, dan kesiapan hasil penjualan."
        eyebrow="PUSAT PENJUALAN"
        metadata={`Workspace aktif: ${activeWorkspace?.workspace_name ?? "—"}`}
        title="Sales & Marketing"
      />
      <div aria-label="Konteks ringkasan Sales" className={styles.contextBar}>
        <ContextItem label="Periode" value="—" />
        <ContextItem label="Project" value="—" />
        <ContextItem label="Workspace" value={activeWorkspace?.workspace_name ?? "—"} />
        <ContextItem label="Status data" status value="Belum Terhubung" />
      </div>
      <div className={styles.sourceStrip}>
        {sources.map((source) => <span className={styles.sourceItem} key={source}><span>{source}</span><Status label="Belum Terhubung" variant="neutral" /></span>)}
        <Button onClick={() => setStatusOpen(true)} size="sm" variant="ghost">Lihat Status Data</Button>
      </div>
      <Section bordered title="Ringkasan Utama">
        <div className={styles.metrics}>{summaryMetrics.map((label) => <Metric key={label} label={label} supportingText="Belum Terhubung" value="—" />)}</div>
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
      <Section title="Perlu Perhatian"><EmptyState description="Tindak lanjut, booking, dan closing yang memerlukan perhatian akan tampil setelah sumber resmi tersedia." title="Belum Terhubung" /></Section>
      <div className={styles.summaryGrid}>
        <Section title="Channel"><Alert message="Atribusi channel dan biaya per lead belum tersedia dari sumber Campaign." title="Data Channel Belum Terhubung" variant="neutral" /></Section>
        <Section title="Project/Product readiness"><Alert message="Project, unit, harga, dan ketersediaan tetap menjadi projection dari Property." title="Data Project/Product Belum Terhubung" variant="neutral" /></Section>
      </div>
      <Section title="Persetujuan & Temuan"><Alert message="Ringkasan persetujuan dan temuan yang relevan akan tampil setelah sumber Shared Work tersedia." title="Data Persetujuan dan Temuan Belum Terhubung" variant="neutral" /></Section>
      <Drawer description="Ketersediaan ditampilkan dari sumber yang terhubung; tidak ada nilai bisnis yang dibuat oleh dashboard." onClose={() => setStatusOpen(false)} open={statusOpen} title="Status Data">
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
  return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span>{status ? <Status label={value} variant="neutral" /> : <span className={styles.contextValue}>{value}</span>}</div>;
}
