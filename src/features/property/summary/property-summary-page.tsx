"use client";

import { useState } from "react";
import { Button, DataTable, Metric, PageHeader, Section, Status, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyDetailDrawer, PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

const metrics = ["Proyek Aktif", "Progres Fisik", "Proyek Terlambat", "Milestone Tertunda", "Temuan Kritis", "Unit Siap"] as const;
const sourceStatuses = ["Project", "Progress", "Unit", "Contractor", "Finance", "Sales", "Legal", "Material"] as const;
type SourceStatus = "Tersedia" | "Sebagian Tersedia" | "Belum Terhubung" | "Gagal Memuat";
const sourceStatus: SourceStatus = "Belum Terhubung";

interface ProjectHealthRow { readonly recordId: string; readonly project: string; readonly plannedProgress: string; readonly actualProgress: string; readonly deviation: string; readonly nextMilestone: string; readonly targetEnd: string; readonly status: string; readonly owner: string; }
interface AttentionRow { readonly recordId: string; readonly project: string; readonly issue: string; readonly severity: string; readonly owner: string; readonly due: string; readonly status: string; }
interface UnitReadinessRow { readonly recordId: string; readonly unit: string; readonly construction: string; readonly technical: string; readonly commercial: string; readonly handover: string; }
interface ContractorSummaryRow { readonly recordId: string; readonly contractor: string; readonly project: string; readonly delivery: string; readonly legal: string; readonly payment: string; readonly status: string; }
interface FinanceRow { readonly recordId: string; readonly project: string; readonly budgetPlan: string; readonly committed: string; readonly actual: string; readonly variance: string; }

const projectHealthRows: readonly ProjectHealthRow[] = [];
const attentionRows: readonly AttentionRow[] = [];
const unitReadinessRows: readonly UnitReadinessRow[] = [];
const contractorSummaryRows: readonly ContractorSummaryRow[] = [];
const financeRows: readonly FinanceRow[] = [];

const projectHealthColumns: readonly DataTableColumn<ProjectHealthRow>[] = [
  { header: "Proyek", key: "project", render: (row) => row.project }, { header: "Progres Rencana", key: "plannedProgress", render: (row) => row.plannedProgress },
  { header: "Progres Aktual", key: "actualProgress", render: (row) => row.actualProgress }, { header: "Deviasi", key: "deviation", render: (row) => row.deviation },
  { header: "Milestone Berikutnya", key: "nextMilestone", render: (row) => row.nextMilestone }, { header: "Target Selesai", key: "targetEnd", render: (row) => row.targetEnd },
  { header: "Status", key: "status", render: (row) => row.status }, { header: "Owner", key: "owner", render: (row) => row.owner },
];
const attentionColumns: readonly DataTableColumn<AttentionRow>[] = [
  { header: "Proyek", key: "project", render: (row) => row.project }, { header: "Masalah", key: "issue", render: (row) => row.issue },
  { header: "Keparahan", key: "severity", render: (row) => row.severity }, { header: "Owner", key: "owner", render: (row) => row.owner },
  { header: "Tenggat", key: "due", render: (row) => row.due }, { header: "Status", key: "status", render: (row) => row.status },
];
const unitReadinessColumns: readonly DataTableColumn<UnitReadinessRow>[] = [
  { header: "Unit", key: "unit", render: (row) => row.unit }, { header: "Status Konstruksi", key: "construction", render: (row) => row.construction },
  { header: "Kesiapan Teknis", key: "technical", render: (row) => row.technical }, { header: "Status Komersial", key: "commercial", render: (row) => row.commercial },
  { header: "Serah Terima", key: "handover", render: (row) => row.handover },
];
const contractorColumns: readonly DataTableColumn<ContractorSummaryRow>[] = [
  { header: "Kontraktor", key: "contractor", render: (row) => row.contractor }, { header: "Proyek", key: "project", render: (row) => row.project },
  { header: "Pelaksanaan Teknis", key: "delivery", render: (row) => row.delivery }, { header: "Status Legal", key: "legal", render: (row) => row.legal },
  { header: "Pembayaran", key: "payment", render: (row) => row.payment }, { header: "Status", key: "status", render: (row) => row.status },
];
const financeColumns: readonly DataTableColumn<FinanceRow>[] = [
  { header: "Proyek", key: "project", render: (row) => row.project }, { header: "Rencana Anggaran", key: "budgetPlan", render: (row) => row.budgetPlan },
  { header: "Terikat", key: "committed", render: (row) => row.committed }, { header: "Aktual", key: "actual", render: (row) => row.actual },
  { header: "Deviasi", key: "variance", render: (row) => row.variance },
];

export function PropertySummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertySummary session={session} />}</PropertyLayout>;
}

function PropertySummary({ session }: Readonly<{ session: SessionProjection }>) {
  const [statusOpen, setStatusOpen] = useState(false);
  const activeWorkspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  return <div className={styles.page}>
    <PageHeader description="Project & Property Operating System untuk pengendalian teknis, progres, mutu, dan kesiapan." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeWorkspace?.workspace_key ?? "—"}`} title="Ringkasan Property" />
    <div className={styles.contextBar}><div className={styles.contextItem}><span className={styles.contextLabel}>Periode</span><span className={styles.contextValue}>—</span></div><div className={styles.contextItem}><span className={styles.contextLabel}>Proyek</span><span className={styles.contextValue}>Semua proyek</span></div><div className={styles.contextItem}><span className={styles.contextLabel}>Workspace</span><span className={styles.contextValue}>{activeWorkspace?.workspace_name ?? "—"}</span></div><div className={styles.contextItem}><span className={styles.contextLabel}>Status data</span><span className={styles.contextValue}>Belum Terhubung</span></div></div>
    <PropertySourceNote>Projection Property belum terhubung. Nilai teknis, jadwal, mutu, dan kesiapan tidak disimpulkan oleh frontend.</PropertySourceNote>
    <section aria-label="Status sumber data Property" className={styles.sourceStrip}>{sourceStatuses.map((source) => <div className={styles.sourceItem} key={source}><span>{source}</span><Status label={sourceStatus} variant="neutral" /></div>)}<Button onClick={() => setStatusOpen(true)} size="sm" variant="secondary">Lihat Status Data</Button></section>
    <section aria-label="Metric utama Property" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
    <Section description="Deviasi hanya akan dihitung setelah baseline dan aktual authoritative tersedia." title="Kondisi Proyek"><DataTable caption="Kondisi proyek" columns={projectHealthColumns} emptyState={<PropertyUnavailableState description="Kondisi proyek belum tersedia." />} getRowKey={(row) => row.recordId} rows={projectHealthRows} /></Section>
    <Section title="Perhatian Utama"><DataTable caption="Perhatian utama Property" columns={attentionColumns} emptyState={<PropertyUnavailableState description="Perhatian utama belum tersedia." />} getRowKey={(row) => row.recordId} rows={attentionRows} /></Section>
    <Section title="Kesiapan Unit"><DataTable caption="Kesiapan unit Property" columns={unitReadinessColumns} emptyState={<PropertyUnavailableState description="Kesiapan unit belum tersedia." />} getRowKey={(row) => row.recordId} rows={unitReadinessRows} /></Section>
    <Section title="Ringkasan Kontraktor"><DataTable caption="Ringkasan kontraktor Property" columns={contractorColumns} emptyState={<PropertyUnavailableState description="Ringkasan kontraktor belum tersedia." />} getRowKey={(row) => row.recordId} rows={contractorSummaryRows} /></Section>
    <Section title="Ringkasan Anggaran"><DataTable caption="Ringkasan anggaran Property" columns={financeColumns} emptyState={<PropertyUnavailableState description="Aktual keuangan adalah projection Finance read-only dan belum tersedia." />} getRowKey={(row) => row.recordId} rows={financeRows} /></Section>
    <Section title="Persetujuan & Temuan"><PropertyUnavailableState description="Approval governance dan Shared Work Finding belum tersedia pada source ini." /></Section>
    <PropertyDetailDrawer description="Status kesiapan source untuk ringkasan Property." items={sourceStatuses.map((source) => ({ label: source, value: sourceStatus }))} onClose={() => setStatusOpen(false)} open={statusOpen} title="Status Data Property" />
  </div>;
}
