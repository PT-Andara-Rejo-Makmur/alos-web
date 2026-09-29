"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DataTable, PageHeader, Section, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyDetailDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

interface ContractorRow { readonly recordId: string; readonly name: string; readonly project: string; readonly package: string; readonly delivery: string; readonly legalStatus: string; readonly paymentStatus: string; readonly status: string; }
const contractorRows: readonly ContractorRow[] = [];
const contractorColumns: readonly DataTableColumn<ContractorRow>[] = [
  { header: "Kontraktor", key: "name", render: (row) => row.name }, { header: "Proyek", key: "project", render: (row) => row.project },
  { header: "Work Package", key: "package", render: (row) => row.package }, { header: "Pelaksanaan Teknis", key: "delivery", render: (row) => row.delivery },
  { header: "Status Legal", key: "legalStatus", render: (row) => row.legalStatus }, { header: "Pembayaran", key: "paymentStatus", render: (row) => row.paymentStatus },
  { header: "Status", key: "status", render: (row) => row.status },
];
const contractorFields: readonly PropertyFormField[] = [{ label: "Kontraktor", name: "contractor" }, { label: "Proyek", name: "project" }, { label: "Work Package", name: "work-package" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyContractorsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyContractors session={session} />}</PropertyLayout>; }

function PropertyContractors({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [selected, setSelected] = useState<ContractorRow | null>(null);
  const [filters, setFilters] = useState({ project: "all", status: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const openDetail = () => { if (selected && activeKey) router.push(`/workspace/${encodeURIComponent(activeKey)}/contractors/${encodeURIComponent(selected.recordId)}`); };
  return <div className={styles.page}>
    <PageHeader description="Pelaksanaan teknis kontraktor dengan status Legal dan Finance sebagai projection read-only." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Kontraktor" />
    <PropertySourceNote>Source kontraktor belum tersedia. Property hanya authority untuk pelaksanaan teknis; status legal dan pembayaran tidak dapat diubah.</PropertySourceNote>
    <Section title="Filter Kontraktor"><PropertyFilterBar ariaLabel="Filter kontraktor Property"><PropertySelect label="Proyek" name="contractor-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Status" name="contractor-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title="Daftar Kontraktor"><DataTable caption="Daftar kontraktor Property" columns={contractorColumns} emptyState={<PropertyUnavailableState description="Projection kontraktor belum tersedia." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelected(row)} size="sm" variant="secondary">Lihat cepat</Button>} rows={contractorRows} /></Section>
    <PropertyDetailDrawer description="Tampilan cepat kontraktor; detail lengkap tersedia pada route canonical Property." items={selected ? [{ label: "Kontraktor", value: selected.name }, { label: "Proyek", value: selected.project }, { label: "Pelaksanaan Teknis", value: selected.delivery }, { label: "Status Legal", value: selected.legalStatus }, { label: "Pembayaran", value: selected.paymentStatus }] : []} onClose={() => setSelected(null)} open={selected !== null} title="Tampilan Cepat Kontraktor">{selected ? <Button onClick={openDetail} variant="primary">Buka Detail Kontraktor</Button> : null}</PropertyDetailDrawer>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Catatan Kontraktor</Button></div>
    <PropertyUnavailableFormDrawer description="Catatan teknis kontraktor belum memiliki capability authoritative." fields={contractorFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Catatan" title="Tambah Catatan Kontraktor" />
  </div>;
}
