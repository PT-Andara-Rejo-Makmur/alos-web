"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "all", label: "Semua" }, { id: "construction", label: "Status Konstruksi" }, { id: "technical", label: "Kesiapan Teknis" }, { id: "commercial", label: "Status Komersial" }, { id: "handover", label: "Serah Terima" }];
interface UnitRow { readonly recordId: string; readonly unit: string; readonly project: string; readonly constructionState: string; readonly technicalReadiness: string; readonly commercialProjection: string; readonly handover: string; }
const unitRows: readonly UnitRow[] = [];
const unitColumns: readonly DataTableColumn<UnitRow>[] = [
  { header: "Unit", key: "unit", render: (row) => row.unit }, { header: "Proyek", key: "project", render: (row) => row.project },
  { header: "Status Konstruksi", key: "constructionState", render: (row) => row.constructionState }, { header: "Kesiapan Teknis", key: "technicalReadiness", render: (row) => row.technicalReadiness },
  { header: "Status Komersial", key: "commercialProjection", render: (row) => row.commercialProjection }, { header: "Serah Terima", key: "handover", render: (row) => row.handover },
];
const unitFields: readonly PropertyFormField[] = [{ label: "Unit *", name: "unit" }, { label: "Status Teknis *", name: "technical-status" }, { label: "Kesiapan Teknis *", name: "technical-readiness" }, { label: "Status Inspeksi", name: "inspection-status" }, { label: "Perkiraan Siap", name: "estimated-ready", type: "date" }, { label: "Bukti *", name: "evidence" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyUnitsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyUnits session={session} />}</PropertyLayout>; }

function PropertyUnits({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState({ project: "all", construction: "all", readiness: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Unit dipisahkan antara status konstruksi, kesiapan teknis, status komersial, dan serah terima." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Unit & Kesiapan" />
    <PropertySourceNote>Data unit belum tersedia. Property tidak menyimpulkan ketersediaan dari data teknis atau komersial.</PropertySourceNote>
    <Tabs ariaLabel="Dimensi unit property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Unit"><PropertyFilterBar ariaLabel="Filter unit Property"><PropertySelect label="Proyek" name="unit-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Status Konstruksi" name="unit-construction" onChange={(value) => setFilters((current) => ({ ...current, construction: value }))} options={[["all", "Semua status"]]} value={filters.construction} /><PropertySelect label="Kesiapan Teknis" name="unit-readiness" onChange={(value) => setFilters((current) => ({ ...current, readiness: value }))} options={[["all", "Semua kesiapan"]]} value={filters.readiness} /></PropertyFilterBar></Section>
    <Section description={`Tampilan aktif: ${tabs.find((item) => item.id === tab)?.label ?? "Semua"}. Status komersial berasal dari proses Sales dan hanya dapat dilihat dari halaman ini.`} title="Daftar Unit"><DataTable caption="Daftar unit dan kesiapan" columns={unitColumns} emptyState={<PropertyUnavailableState description="Data unit dan kesiapan belum tersedia." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => router.push(`/workspace/${encodeURIComponent(activeKey ?? "")}/units/${encodeURIComponent(row.recordId)}`)} size="sm" variant="secondary">Lihat detail</Button>} rows={unitRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Catat Kesiapan Unit</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Kesiapan unit belum dapat disimpan karena fitur ini belum tersedia." fields={unitFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Kesiapan" title="Catat Kesiapan Unit" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Ekstraksi Kesiapan Unit" />
  </div>;
}
