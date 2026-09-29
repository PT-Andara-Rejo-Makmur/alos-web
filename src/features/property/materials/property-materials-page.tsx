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
  { header: "Material", key: "material", render: (row) => row.material }, { header: "Project", key: "project", render: (row) => row.project },
  { header: "Quantity", key: "quantity", render: (row) => row.quantity }, { header: "Need Date", key: "needDate", render: (row) => row.needDate },
  { header: "Technical State", key: "technicalState", render: (row) => row.technicalState }, { header: "Procurement State", key: "procurementState", render: (row) => row.procurementState },
];
const materialFields: readonly PropertyFormField[] = [{ label: "Project", name: "project" }, { label: "Material", name: "material" }, { label: "Kuantitas", name: "quantity", type: "number" }, { label: "Tanggal kebutuhan", name: "need-date", type: "date" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyMaterialsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyMaterials session={session} />}</PropertyLayout>; }

function PropertyMaterials({ session }: Readonly<{ session: SessionProjection }>) {
  const [filters, setFilters] = useState({ project: "all", state: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Material requirement dan technical availability; PO, commercial purchasing, dan payment bukan authority Property." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Material & Pengadaan" />
    <PropertySourceNote>Material source belum tersedia. Property tidak menyimpulkan status material dan tidak menerbitkan PO atau payment state.</PropertySourceNote>
    <Section title="Filter Material"><PropertyFilterBar ariaLabel="Filter material property"><PropertySelect label="Project" name="material-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="State" name="material-state" onChange={(value) => setFilters((current) => ({ ...current, state: value }))} options={[["all", "Semua state"]]} value={filters.state} /></PropertyFilterBar></Section>
    <Section title="Daftar Material"><DataTable caption="Daftar material dan requirement" columns={materialColumns} emptyState={<PropertyUnavailableState description="Material requirement belum tersedia." />} getRowKey={(row) => row.recordId} rows={materialRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Ajukan Material Request</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Material request mutation belum memiliki contract authoritative." fields={materialFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Request" title="Ajukan Material Request" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Material Requirement" />
  </div>;
}
