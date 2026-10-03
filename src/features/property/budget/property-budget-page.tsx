"use client";

import { useState } from "react";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { statusLabel } from "@/lib/presentation";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "rab", label: "RAB Draft / Revisi" }, { id: "boq", label: "BOQ" }, { id: "actual", label: "Aktual Keuangan" }];
interface BudgetRow { readonly recordId: string; readonly project: string; readonly category: string; readonly planned: string; readonly revision: string; readonly actual: string; readonly status: string; }
const budgetRows: readonly BudgetRow[] = [];
const budgetColumns: readonly DataTableColumn<BudgetRow>[] = [
  { header: "Proyek", key: "project", render: (row) => row.project }, { header: "Kategori", key: "category", render: (row) => row.category },
  { header: "Rencana", key: "planned", render: (row) => row.planned }, { header: "Revisi", key: "revision", render: (row) => row.revision },
  { header: "Aktual Keuangan", key: "actual", render: (row) => row.actual }, { header: "Status", key: "status", render: (row) => statusLabel(row.status) },
];
const budgetFields: readonly PropertyFormField[] = [{ label: "RAB", name: "rab" }, { label: "Section", name: "section" }, { label: "Work Item", name: "work-item" }, { label: "Volume", name: "volume", type: "number" }, { label: "Unit", name: "unit" }, { label: "Harga Satuan", name: "unit-price", type: "number" }, { label: "Jumlah", name: "total", type: "number" }, { label: "Catatan Revisi", name: "notes", type: "textarea" }];

export function PropertyBudgetPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyBudget session={session} />}</PropertyLayout>; }

function PropertyBudget({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("rab");
  const [filters, setFilters] = useState({ project: "all", category: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const workspaceName = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_name : null;
  return <div className={styles.page}>
    <PageHeader description="RAB dan BOQ sebagai struktur perencanaan teknis; data aktual keuangan hanya ditampilkan." eyebrow="PROPERTY & TEKNIK" metadata={`Ruang Kerja: ${workspaceName ?? "—"}`} title="Anggaran & RAB" />
    <PropertySourceNote>Sumber anggaran belum tersedia. Property tidak menetapkan pembayaran, status dibayar, kas, penyelesaian bank, atau aktual keuangan.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan anggaran Property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Anggaran"><PropertyFilterBar ariaLabel="Filter anggaran Property"><PropertySelect label="Proyek" name="budget-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Kategori" name="budget-category" onChange={(value) => setFilters((current) => ({ ...current, category: value }))} options={[["all", "Semua kategori"]]} value={filters.category} /></PropertyFilterBar></Section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "RAB Draft / Revisi"}><DataTable caption="RAB, BOQ, dan aktual keuangan" columns={budgetColumns} emptyState={<PropertyUnavailableState description="Data anggaran belum tersedia." />} getRowKey={(row) => row.recordId} rows={budgetRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Buat RAB Draft</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Draft atau revisi RAB belum dapat disimpan karena fitur ini belum tersedia." fields={budgetFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Draft" title="Buat RAB Draft / Revisi" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Ekstraksi RAB / BOQ" />
  </div>;
}
