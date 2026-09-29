"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "inspection", label: "Inspeksi" }, { id: "action", label: "Menunggu Tindakan" }, { id: "history", label: "Riwayat" }];
interface InspectionRow { readonly recordId: string; readonly project: string; readonly type: string; readonly date: string; readonly result: string; readonly finding: string; readonly status: string; }
const inspectionRows: readonly InspectionRow[] = [];
const inspectionColumns: readonly DataTableColumn<InspectionRow>[] = [
  { header: "Project", key: "project", render: (row) => row.project }, { header: "Jenis Inspeksi", key: "type", render: (row) => row.type },
  { header: "Tanggal", key: "date", render: (row) => row.date }, { header: "Result", key: "result", render: (row) => row.result },
  { header: "Finding", key: "finding", render: (row) => row.finding }, { header: "Status", key: "status", render: (row) => row.status },
];
const inspectionFields: readonly PropertyFormField[] = [{ label: "Project", name: "project" }, { label: "Jenis inspeksi", name: "inspection-type" }, { label: "Tanggal", name: "date", type: "date" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyQualityPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyQuality session={session} />}</PropertyLayout>; }

function PropertyQuality({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [tab, setTab] = useState("inspection");
  const [filters, setFilters] = useState({ project: "all", result: "all", status: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const base = activeKey ? `/workspace/${encodeURIComponent(activeKey)}` : "/workspace";
  return <div className={styles.page}>
    <PageHeader description="Inspeksi teknis dan quality control Property dengan Finding dan corrective action universal." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Inspeksi & Kualitas" />
    <PropertySourceNote>Quality source belum terhubung. Finding menggunakan Shared Work Finding dan corrective action menggunakan Shared Work Task.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan quality property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Quality"><PropertyFilterBar ariaLabel="Filter quality property"><PropertySelect label="Project" name="quality-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Result" name="quality-result" onChange={(value) => setFilters((current) => ({ ...current, result: value }))} options={[["all", "Semua result"]]} value={filters.result} /><PropertySelect label="Status" name="quality-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "Inspeksi"}><DataTable caption="Inspeksi dan kualitas Property" columns={inspectionColumns} emptyState={<PropertyUnavailableState description="Inspeksi dan quality finding belum tersedia." />} getRowKey={(row) => row.recordId} rows={inspectionRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Inspeksi</Button><Button onClick={() => router.push(`${base}/findings`)} variant="secondary">Buka Temuan</Button><Button onClick={() => router.push(`${base}/tasks`)} variant="secondary">Buka Corrective Action</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Inspection mutation belum memiliki capability authoritative." fields={inspectionFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Inspeksi" title="Tambah Inspeksi" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Inspection" />
  </div>;
}
