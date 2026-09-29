"use client";

import { useState } from "react";
import { Alert, Button, DataTable, Drawer, EmptyState, Metric, PageHeader, Section, Status, Tabs, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { activeSalesWorkspaceKey } from "./sales-model";
import { SalesLayout } from "./sales-layout";
import styles from "./sales.module.css";

const sources = ["Strategy", "Sales Pipeline", "Campaign", "Finance Verification", "Legal/KPR", "Property/Unit"] as const;
const stages = ["Lead", "Qualified", "Survey", "Booking", "SPK", "KPR", "SP3K", "Akad", "Closing"] as const;

export function SalesSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{() => <SalesSummary />}</SalesLayout>;
}
function SalesSummary() {
  const [statusOpen, setStatusOpen] = useState(false);
  return <div className={styles.page}><PageHeader eyebrow="PUSAT PENJUALAN" title="Sales & Marketing" description="Ringkasan target, pipeline, aktivitas, dan hasil penjualan." />
    <div className={styles.sourceStrip}>{sources.map((source) => <span className={styles.sourceItem} key={source}><span>{source}</span><Status label="Belum Terhubung" variant="neutral" /></span>)}<Button onClick={() => setStatusOpen(true)} size="sm" variant="ghost">Lihat Status Data</Button></div>
    <Section bordered title="Ringkasan Utama"><div className={styles.metrics}>{["Target Closing", "Closing Aktual", "Pipeline Aktif", "Conversion"].map((label) => <Metric key={label} label={label} value="—" supportingText="Belum Terhubung" />)}</div></Section>
    <Section title="Indikator Operasional" description="Indikator ditampilkan setelah sumber resmi tersedia; nilai yang belum tersedia tidak disimpulkan sebagai nol.">
      <DataTable caption="Indikator operasional Sales" columns={[{ header: "Indikator", key: "label", render: (item) => item.label }, { header: "Nilai", key: "value", render: () => "—" }, { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> }]} getRowKey={(item) => item.label} rows={[{ label: "Waktu Respons" }, { label: "Pembatalan" }, { label: "Biaya per Lead" }]} />
    </Section>
    <Section title="Alur Pipeline" description="Tahap berikut adalah struktur tampilan hingga sumber pipeline resmi tersedia."><DataTable caption="Tahap pipeline penjualan" columns={[{ header: "Tahap", key: "stage", render: (stage) => stage }, { header: "Jumlah", key: "count", render: () => "—" }, { header: "Conversion", key: "conversion", render: () => "—" }, { header: "Usia Rata-rata", key: "age", render: () => "—" }, { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> }]} getRowKey={(stage) => stage} rows={stages} /></Section>
    <Section title="Perlu Perhatian"><EmptyState title="Belum Terhubung" description="Tindak lanjut, booking, dan closing yang memerlukan perhatian akan ditampilkan setelah sumber resmi tersedia." /></Section>
    <Section title="Channel dan Produk"><Alert message="Kinerja channel serta status proyek dan produk akan tampil setelah sumber marketing dan Property tersedia." title="Data Channel Belum Terhubung" variant="neutral" /></Section>
    <Section title="Persetujuan dan Temuan"><Alert message="Ringkasan persetujuan dan temuan yang relevan akan tampil setelah sumber Shared Work tersedia." title="Data Persetujuan dan Temuan Belum Terhubung" variant="neutral" /></Section>
    <Drawer open={statusOpen} onClose={() => setStatusOpen(false)} title="Status Data" description="Ketersediaan hanya ditampilkan dari sumber yang telah terhubung."><DataTable caption="Status sumber penjualan" columns={[{ header: "Sumber", key: "source", render: (source) => source }, { header: "Status", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> }, { header: "Waktu Data", key: "updated", render: () => "—" }, { header: "Verifikasi", key: "verification", render: () => "—" }]} getRowKey={(source) => source} rows={sources} /></Drawer>
  </div>;
}

interface SalesReadinessProps {
  readonly title: string;
  readonly description: string;
  readonly tabs?: readonly TabItem[];
  readonly detail: string;
  readonly workspaceKey?: string;
}
export function SalesReadinessPage({ title, description, tabs, detail, workspaceKey }: SalesReadinessProps) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesReadinessContent session={session} title={title} description={description} tabs={tabs} detail={detail} />}</SalesLayout>;
}
function SalesReadinessContent({ session, title, description, tabs, detail }: SalesReadinessProps & { readonly session: SessionProjection }) {
  const [tab, setTab] = useState(tabs?.[0]?.id ?? "overview");
  const workspaceKey = activeSalesWorkspaceKey(session);
  return <div className={styles.page}><PageHeader eyebrow="SALES & MARKETING" title={title} description={description} metadata={workspaceKey ? `Ruang kerja aktif: ${workspaceKey}` : undefined} />
    {tabs ? <Tabs ariaLabel={`Navigasi ${title}`} items={tabs} onValueChange={setTab} value={tab} /> : null}
    <Section title="Ketersediaan Data"><div className={styles.readinessRow}><Status label="Belum Terhubung" variant="neutral" /><p>{detail} Data tidak dibuat atau disimpulkan oleh antarmuka.</p></div></Section>
    <Section title="Kesiapan Modul"><Alert message="Daftar, detail, dan tindakan pada modul ini akan tersedia setelah sumber data dan kewenangan terkait dihubungkan. Tidak ada catatan atau hasil yang dibuat secara simulasi." title="Modul sedang disiapkan" variant="neutral" /></Section>
  </div>;
}


