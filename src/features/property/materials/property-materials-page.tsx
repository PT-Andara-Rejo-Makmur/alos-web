"use client";

import { useState } from "react";
import { Button, DataTable, PageHeader, Section, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

interface MaterialRow { readonly recordId: string; readonly project: string; readonly material: string; readonly quantity: string; readonly needDate: string; readonly technicalState: string; readonly procurementState: string; }
const materialRows: readonly MaterialRow[] = [];
const materialColumns: readonly DataTableColumn<MaterialRow>[] = [
  { header: "Material", key: "material", render: (row) => row.material }, { header: "Proyek", key: "project", render: (row) => row.project },
  { header: "Kuantitas", key: "quantity", render: (row) => row.quantity }, { header: "Tanggal Kebutuhan", key: "needDate", render: (row) => row.needDate },
  { header: "Status Teknis", key: "technicalState", render: (row) => row.technicalState }, { header: "Status Pengadaan", key: "procurementState", render: (row) => row.procurementState },
];
const materialFields: readonly PropertyFormField[] = [{ label: "Proyek *", name: "project" }, { label: "Work Package *", name: "work-package" }, { label: "Material *", name: "material" }, { label: "Kuantitas *", name: "quantity", type: "number" }, { label: "Unit *", name: "unit" }, { label: "Tanggal Kebutuhan *", name: "need-date", type: "date" }, { label: "Alasan *", name: "reason", type: "textarea" }, { label: "Spesifikasi", name: "specification", type: "textarea" }, { label: "Evidence", name: "evidence" }];

export function PropertyMaterialsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyMaterials session={session} />}</PropertyLayout>; }

function PropertyMaterials({ session }: Readonly<{ session: SessionProjection }>) {
  const [filters, setFilters] = useState({ project: "all", state: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Kebutuhan material teknis; PO, pembelian komersial, dan pembayaran bukan authority Property." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Material & Pengadaan" />
    <PropertySourceNote>Source material belum tersedia. Property tidak menetapkan status pengadaan atau pembayaran.</PropertySourceNote>
    <Section title="Filter Material"><PropertyFilterBar ariaLabel="Filter material Property"><PropertySelect label="Proyek" name="material-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Status" name="material-state" onChange={(value) => setFilters((current) => ({ ...current, state: value }))} options={[["all", "Semua status"]]} value={filters.state} /></PropertyFilterBar></Section>
    <Section title="Daftar Material"><DataTable caption="Daftar kebutuhan material" columns={materialColumns} emptyState={<PropertyUnavailableState description="Kebutuhan material belum tersedia." />} getRowKey={(row) => row.recordId} rows={materialRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Ajukan Permintaan Material</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Mutation permintaan material belum memiliki contract authoritative." fields={materialFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Permintaan" title="Ajukan Permintaan Material" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Ekstraksi Kebutuhan Material" />
  </div>;
}
