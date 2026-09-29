"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, Metric, PageHeader, Section, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { FinanceLayout } from "../finance-layout";
import { FinanceSourceStrip, FinanceStatusDrawer, FinanceUnavailableState } from "../shared/finance-ui";
import styles from "../finance.module.css";

const metrics = ["Kas Tersedia", "Penerimaan", "Pengeluaran", "Piutang", "Utang / Kewajiban", "Anggaran vs Realisasi"] as const;
const secondary = ["Pembayaran Menunggu", "Jatuh Tempo", "Belum Direkonsiliasi", "Kewajiban Pajak"] as const;
interface SummaryRow { readonly id: string; readonly item: string; readonly value: string; readonly status: string; }
const summaryColumns: readonly DataTableColumn<SummaryRow>[] = [
  { header: "Indikator", key: "item", render: (row) => row.item },
  { header: "Nilai", key: "value", render: (row) => row.value },
  { header: "Status Data", key: "status", render: (row) => row.status },
];

export function FinanceSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <FinanceSummary session={session} />}</FinanceLayout>;
}

function FinanceSummary({ session }: Readonly<{ session: SessionProjection }>) {
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  return <div className={styles.page}>
    <PageHeader description="Ringkasan kas, transaksi, kewajiban, anggaran, dan posisi keuangan operasional perusahaan." eyebrow="FINANCE & PAJAK" metadata={`Workspace aktif: ${activeWorkspace?.workspace_name ?? "—"}`} title="Finance & Pajak" />
    <div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Workspace" value={activeWorkspace?.workspace_name ?? "—"} /><ContextItem label="Status Data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div>
    <FinanceSourceStrip onStatus={() => setStatusOpen(true)} />
    <section aria-label="Indikator utama Finance" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
    <Section description="Target, aktual, dan perkiraan tidak disatukan sebelum masing-masing sumber tersedia." title="Indikator Operasional"><DataTable caption="Indikator operasional Finance" columns={summaryColumns} getRowKey={(row) => row.id} rows={secondary.map((item) => ({ id: item, item, value: "—", status: "Belum Terhubung" }))} /></Section>
    <Section title="Posisi Kas"><FinanceUnavailableState description="Posisi kas dan arus kas belum tersedia dari sumber keuangan." /></Section>
    <div className={styles.summaryGrid}><Section title="Ringkasan Piutang"><FinanceUnavailableState description="Penerimaan dan piutang belum tersedia." /></Section><Section title="Ringkasan Utang"><FinanceUnavailableState description="Pengeluaran dan utang belum tersedia." /></Section><Section title="Anggaran"><FinanceUnavailableState description="Anggaran finansial belum tersedia." /></Section><Section title="Pajak"><FinanceUnavailableState description="Kewajiban pajak belum tersedia." /></Section></div>
    <Section actions={<Link href={activeWorkspace ? `/workspace/${encodeURIComponent(activeWorkspace.workspace_key)}/approvals` : "/workspace"}>Lihat Semua Persetujuan</Link>} title="Persetujuan Penting"><FinanceUnavailableState description="Persetujuan penting belum tersedia dari sumber keuangan." /></Section>
    <FinanceStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} />
  </div>;
}

function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }
