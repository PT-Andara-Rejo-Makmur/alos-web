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
  { header: "Proyek", key: "project", render: (row) => row.project }, { header: "Work Package", key: "package", render: (row) => row.package },
  { header: "Kontraktor", key: "contractor", render: (row) => row.contractor }, { header: "Progres", key: "progress", render: (row) => row.progress },
  { header: "Tenggat", key: "due", render: (row) => row.due }, { header: "Status", key: "status", render: (row) => row.status },
];
const workFields: readonly PropertyFormField[] = [{ label: "Proyek *", name: "project" }, { label: "Work Package *", name: "work-package" }, { label: "Catatan", name: "notes", type: "textarea" }];
const milestoneFields: readonly PropertyFormField[] = [{ label: "Nama *", name: "name" }, { label: "Proyek *", name: "project" }, { label: "Tanggal Rencana *", name: "planned-date", type: "date" }, { label: "Owner *", name: "owner" }, { label: "Work Package", name: "work-package" }, { label: "Dependency", name: "dependency" }, { label: "Persyaratan Evidence", name: "evidence-requirement" }, { label: "Deskripsi", name: "description", type: "textarea" }];
const opnameFields: readonly PropertyFormField[] = [{ label: "Proyek", name: "project" }, { label: "Kontraktor", name: "contractor" }, { label: "Work Package", name: "work-package" }, { label: "Periode", name: "period" }, { label: "Kuantitas Terukur", name: "measured-quantity", type: "number" }, { label: "Progres Klaim", name: "claimed-progress", type: "number" }, { label: "Progres Terverifikasi", name: "verified-progress", type: "number" }, { label: "Evidence", name: "evidence" }, { label: "Inspektur", name: "inspector" }, { label: "Status", name: "status" }];

export function PropertyExecutionPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyExecution session={session} />}</PropertyLayout>; }

function PropertyExecution({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("work");
  const [filters, setFilters] = useState({ project: "all", contractor: "all", status: "all" });
  const [form, setForm] = useState<"work" | "milestone" | "opname" | null>(null);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Work Package, milestone, opname, dan aktivitas lapangan; Work Package bukan Task Shared Work." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Pekerjaan & Milestone" />
    <PropertySourceNote>Data pelaksanaan belum tersedia. Tidak ada progres, jadwal, atau status kontraktor yang dibuat di halaman ini.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan pelaksanaan Property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Pelaksanaan"><PropertyFilterBar ariaLabel="Filter pelaksanaan Property"><PropertySelect label="Proyek" name="execution-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Kontraktor" name="execution-contractor" onChange={(value) => setFilters((current) => ({ ...current, contractor: value }))} options={[["all", "Semua kontraktor"]]} value={filters.contractor} /><PropertySelect label="Status" name="execution-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "Pekerjaan"}><DataTable caption={`Property ${tabs.find((item) => item.id === tab)?.label ?? "Pekerjaan"}`} columns={executionColumns} emptyState={<PropertyUnavailableState description="Data pelaksanaan belum terhubung." />} getRowKey={(row) => row.recordId} rows={executionRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setForm("work")} variant="primary">Tambah Pekerjaan</Button><Button onClick={() => setForm("milestone")} variant="secondary">Tambah Milestone</Button><Button onClick={() => setForm("opname")} variant="secondary">Catat Opname</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Work Package belum dapat disimpan karena fitur ini belum tersedia." fields={workFields} onClose={() => setForm(null)} open={form === "work"} submitLabel="Simpan Draft" title="Tambah Work Package" />
    <PropertyUnavailableFormDrawer description="Milestone belum dapat disimpan karena fitur ini belum tersedia." fields={milestoneFields} onClose={() => setForm(null)} open={form === "milestone"} submitLabel="Simpan Milestone" title="Tambah Milestone" />
    <PropertyUnavailableFormDrawer description="Opname belum dapat disimpan karena fitur ini belum tersedia." fields={opnameFields} onClose={() => setForm(null)} open={form === "opname"} submitLabel="Simpan Opname" title="Catat Opname" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Ekstraksi Work Package / Milestone" />
  </div>;
}
