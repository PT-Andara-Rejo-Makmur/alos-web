"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "all", label: "Semua" }, { id: "construction", label: "Construction State" }, { id: "technical", label: "Technical Readiness" }, { id: "commercial", label: "Sales / Commercial" }, { id: "handover", label: "Handover" }];
interface UnitRow { readonly recordId: string; readonly unit: string; readonly project: string; readonly constructionState: string; readonly technicalReadiness: string; readonly commercialProjection: string; readonly handover: string; }
const unitRows: readonly UnitRow[] = [];
const unitColumns: readonly DataTableColumn<UnitRow>[] = [
  { header: "Unit", key: "unit", render: (row) => row.unit }, { header: "Project", key: "project", render: (row) => row.project },
  { header: "Construction State", key: "constructionState", render: (row) => row.constructionState }, { header: "Technical Readiness", key: "technicalReadiness", render: (row) => row.technicalReadiness },
  { header: "Commercial Projection", key: "commercialProjection", render: (row) => row.commercialProjection }, { header: "Handover", key: "handover", render: (row) => row.handover },
];
const unitFields: readonly PropertyFormField[] = [{ label: "Unit", name: "unit" }, { label: "Technical readiness", name: "technical-readiness" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyUnitsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyUnits session={session} />}</PropertyLayout>; }

function PropertyUnits({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState({ project: "all", construction: "all", readiness: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Unit dipisahkan antara state konstruksi, technical readiness, projection commercial, dan handover." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Unit & Kesiapan" />
    <PropertySourceNote>Unit source belum tersedia. Property tidak menyimpulkan ketersediaan dari data teknis atau commercial.</PropertySourceNote>
    <Tabs ariaLabel="Dimensi unit property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Unit"><PropertyFilterBar ariaLabel="Filter unit property"><PropertySelect label="Project" name="unit-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Construction State" name="unit-construction" onChange={(value) => setFilters((current) => ({ ...current, construction: value }))} options={[["all", "Semua state"]]} value={filters.construction} /><PropertySelect label="Technical Readiness" name="unit-readiness" onChange={(value) => setFilters((current) => ({ ...current, readiness: value }))} options={[["all", "Semua readiness"]]} value={filters.readiness} /></PropertyFilterBar></Section>
    <Section description={`View aktif: ${tabs.find((item) => item.id === tab)?.label ?? "Semua"}. Commercial state tetap projection Sales read-only.`} title="Daftar Unit"><DataTable caption="Daftar unit dan readiness" columns={unitColumns} emptyState={<PropertyUnavailableState description="Unit dan readiness belum tersedia." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => router.push(`/workspace/${encodeURIComponent(activeKey ?? "")}/units/${encodeURIComponent(row.recordId)}`)} size="sm" variant="secondary">Lihat detail</Button>} rows={unitRows} /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Catat Unit Readiness</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Unit readiness mutation belum memiliki capability authoritative." fields={unitFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Readiness" title="Catat Unit Readiness" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Unit Readiness" />
  </div>;
}
