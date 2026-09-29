"use client";

import { useState } from "react";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [
  { id: "work", label: "Pekerjaan" }, { id: "milestone", label: "Milestone" }, { id: "opname", label: "Opname" }, { id: "activity", label: "Aktivitas" },
];
interface ExecutionRow { readonly recordId: string; readonly project: string; readonly package: string; readonly contractor: string; readonly progress: string; readonly due: string; readonly status: string; }
const executionRows: readonly ExecutionRow[] = [];
const executionColumns: readonly DataTableColumn<ExecutionRow>[] = [
  { header: "Project", key: "project", render: (row) => row.project }, { header: "Work Package", key: "package", render: (row) => row.package },
  { header: "Kontraktor", key: "contractor", render: (row) => row.contractor }, { header: "Progress", key: "progress", render: (row) => row.progress },
  { header: "Due", key: "due", render: (row) => row.due }, { header: "Status", key: "status", render: (row) => row.status },
];
const workFields: readonly PropertyFormField[] = [{ label: "Project", name: "project" }, { label: "Work Package", name: "work-package" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyExecutionPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyExecution session={session} />}</PropertyLayout>; }

function PropertyExecution({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("work");
  const [filters, setFilters] = useState({ project: "all", contractor: "all", status: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Work Package, milestone, opname, dan aktivitas lapangan; Work Package bukan Task Shared Work." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Pekerjaan & Milestone" />
    <PropertySourceNote>Execution source belum tersedia. Tidak ada progress, schedule, atau status contractor yang dibuat frontend.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan execution property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Execution"><PropertyFilterBar ariaLabel="Filter execution property"><PropertySelect label="Project" name="execution-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Kontraktor" name="execution-contractor" onChange={(value) => setFilters((current) => ({ ...current, contractor: value }))} options={[["all", "Semua kontraktor"]]} value={filters.contractor} /><PropertySelect label="Status" name="execution-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "Pekerjaan"}><DataTable caption={`Property ${tabs.find((item) => item.id === tab)?.label ?? "Pekerjaan"}`} columns={executionColumns} emptyState={<PropertyUnavailableState description="Data execution belum terhubung." />} getRowKey={(row) => row.recordId} rows={executionRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Pekerjaan</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Work Package mutation belum memiliki contract authoritative." fields={workFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Draft" title="Tambah Work Package" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Work Package / Milestone" />
  </div>;
}
