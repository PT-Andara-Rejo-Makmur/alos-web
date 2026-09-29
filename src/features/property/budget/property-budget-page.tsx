"use client";

import { useState } from "react";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "rab", label: "RAB" }, { id: "boq", label: "BOQ" }, { id: "actual", label: "Finance Actual" }];
interface BudgetRow { readonly recordId: string; readonly project: string; readonly category: string; readonly planned: string; readonly revision: string; readonly actual: string; readonly status: string; }
const budgetRows: readonly BudgetRow[] = [];
const budgetColumns: readonly DataTableColumn<BudgetRow>[] = [
  { header: "Project", key: "project", render: (row) => row.project }, { header: "Category", key: "category", render: (row) => row.category },
  { header: "Planned", key: "planned", render: (row) => row.planned }, { header: "Revision", key: "revision", render: (row) => row.revision },
  { header: "Finance Actual", key: "actual", render: (row) => row.actual }, { header: "Status", key: "status", render: (row) => row.status },
];
const budgetFields: readonly PropertyFormField[] = [{ label: "Project", name: "project" }, { label: "RAB / BOQ item", name: "item" }, { label: "Nilai draft", name: "amount", type: "number" }, { label: "Catatan revisi", name: "notes", type: "textarea" }];

export function PropertyBudgetPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyBudget session={session} />}</PropertyLayout>; }

function PropertyBudget({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("rab");
  const [filters, setFilters] = useState({ project: "all", category: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="RAB dan BOQ sebagai struktur technical planning; Finance actual selalu read-only projection." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Anggaran & RAB" />
    <PropertySourceNote>Budget source belum tersedia. Property tidak menetapkan payment, paid status, cash, bank settlement, atau financial actual.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan budget property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Budget"><PropertyFilterBar ariaLabel="Filter budget property"><PropertySelect label="Project" name="budget-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Category" name="budget-category" onChange={(value) => setFilters((current) => ({ ...current, category: value }))} options={[["all", "Semua category"]]} value={filters.category} /></PropertyFilterBar></Section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "RAB"}><DataTable caption="RAB, BOQ, dan Finance actual" columns={budgetColumns} emptyState={<PropertyUnavailableState description="Budget projection belum tersedia." />} getRowKey={(row) => row.recordId} rows={budgetRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Buat RAB Draft</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="RAB draft mutation belum memiliki contract authoritative." fields={budgetFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Draft" title="Buat RAB Draft" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction RAB / BOQ" />
  </div>;
}
