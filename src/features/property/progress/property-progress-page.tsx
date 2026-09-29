"use client";

import { useState } from "react";
import { Button, DataTable, PageHeader, Section, Metric, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

interface ProgressRow { readonly recordId: string; readonly project: string; readonly package: string; readonly reportedDate: string; readonly progress: string; readonly evidence: string; readonly status: string; }
const progressRows: readonly ProgressRow[] = [];
const progressColumns: readonly DataTableColumn<ProgressRow>[] = [
  { header: "Proyek", key: "project", render: (row) => row.project }, { header: "Work Package", key: "package", render: (row) => row.package },
  { header: "Tanggal", key: "reportedDate", render: (row) => row.reportedDate }, { header: "Progres", key: "progress", render: (row) => row.progress },
  { header: "Evidence", key: "evidence", render: (row) => row.evidence }, { header: "Status", key: "status", render: (row) => row.status },
];
const progressFields: readonly PropertyFormField[] = [
  { label: "Proyek *", name: "project" }, { label: "Work Package *", name: "work-package" }, { label: "Periode / Tanggal *", name: "date", type: "date" },
  { label: "Rencana %", name: "planned-progress", type: "number" }, { label: "Aktual %", name: "actual-progress", type: "number" }, { label: "Kuantitas", name: "quantity", type: "number" },
  { label: "Unit", name: "unit" }, { label: "Evidence *", name: "evidence" }, { label: "Catatan", name: "notes", type: "textarea" },
];

export function PropertyProgressPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyProgress session={session} />}</PropertyLayout>; }

function PropertyProgress({ session }: Readonly<{ session: SessionProjection }>) {
  const [filters, setFilters] = useState({ project: "all", period: "all", status: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Progres fisik dan jadwal Property, dipisahkan dari Task operasional." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Progres & Jadwal" />
    <PropertySourceNote>Sumber progres belum terhubung. S-Curve tidak ditampilkan tanpa catatan progres yang tersedia.</PropertySourceNote>
    <div className={styles.metricGrid} aria-label="Ringkasan progres"><Metric label="Progres fisik" status="Belum Terhubung" value="—" /><Metric label="Deviasi jadwal" status="Belum Terhubung" value="—" /><Metric label="Milestone tercapai" status="Belum Terhubung" value="—" /><Metric label="Kesiapan evidence" status="Belum Terhubung" value="—" /></div>
    <Section title="Konteks & Filter"><PropertyFilterBar ariaLabel="Filter progres Property"><PropertySelect label="Proyek" name="progress-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Periode" name="progress-period" onChange={(value) => setFilters((current) => ({ ...current, period: value }))} options={[["all", "Semua periode"]]} value={filters.period} /><PropertySelect label="Status" name="progress-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title="S-Curve"><PropertyUnavailableState description="S-Curve belum dinilai karena observasi progres belum terhubung." title="Belum Dinilai" /></Section>
    <Section title="Jadwal & Milestone"><DataTable caption="Progres dan milestone Property" columns={progressColumns} emptyState={<PropertyUnavailableState description="Progres dan milestone belum tersedia." />} getRowKey={(row) => row.recordId} rows={progressRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Progres</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Entri progres belum dapat disimpan karena fitur ini belum tersedia." fields={progressFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Progres" title="Tambah Progres" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Ekstraksi Progres / Milestone" />
  </div>;
}
