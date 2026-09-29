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
  { header: "Project", key: "project", render: (row) => row.project }, { header: "Work Package", key: "package", render: (row) => row.package },
  { header: "Tanggal", key: "reportedDate", render: (row) => row.reportedDate }, { header: "Progress", key: "progress", render: (row) => row.progress },
  { header: "Evidence", key: "evidence", render: (row) => row.evidence }, { header: "Status", key: "status", render: (row) => row.status },
];
const progressFields: readonly PropertyFormField[] = [
  { label: "Project", name: "project" }, { label: "Work Package", name: "work-package" }, { label: "Tanggal progres", name: "date", type: "date" },
  { label: "Progress / catatan", name: "progress", type: "textarea" },
];

export function PropertyProgressPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyProgress session={session} />}</PropertyLayout>; }

function PropertyProgress({ session }: Readonly<{ session: SessionProjection }>) {
  const [filters, setFilters] = useState({ project: "all", period: "all", status: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Progress fisik dan jadwal Property, dipisahkan dari Task operasional." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Progres & Jadwal" />
    <PropertySourceNote>Progress source belum terhubung. S-Curve tidak digambar tanpa observation authoritative.</PropertySourceNote>
    <div className={styles.metricGrid} aria-label="Ringkasan progress"><Metric label="Progress fisik" status="Belum Terhubung" value="—" /><Metric label="Schedule variance" status="Belum Terhubung" value="—" /><Metric label="Milestone tercapai" status="Belum Terhubung" value="—" /><Metric label="Evidence readiness" status="Belum Terhubung" value="—" /></div>
    <Section title="Context & Filter"><PropertyFilterBar ariaLabel="Filter progress property"><PropertySelect label="Project" name="progress-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Periode" name="progress-period" onChange={(value) => setFilters((current) => ({ ...current, period: value }))} options={[["all", "Semua periode"]]} value={filters.period} /><PropertySelect label="Status" name="progress-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title="S-Curve"><PropertyUnavailableState description="S-Curve belum dinilai karena progress observations belum terhubung." title="Belum Dinilai" /></Section>
    <Section title="Schedule & Milestone"><DataTable caption="Progress dan milestone Property" columns={progressColumns} emptyState={<PropertyUnavailableState description="Progress dan milestone belum tersedia." />} getRowKey={(row) => row.recordId} rows={progressRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Progres</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Progress entry belum memiliki capability mutation authoritative." fields={progressFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Progres" title="Tambah Progress" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Progress / Milestone" />
  </div>;
}
