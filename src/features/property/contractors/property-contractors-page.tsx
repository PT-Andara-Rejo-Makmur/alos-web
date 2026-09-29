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
  { header: "Kontraktor", key: "name", render: (row) => row.name }, { header: "Project", key: "project", render: (row) => row.project },
  { header: "Work Package", key: "package", render: (row) => row.package }, { header: "Technical Delivery", key: "delivery", render: (row) => row.delivery },
  { header: "Legal Status", key: "legalStatus", render: (row) => row.legalStatus }, { header: "Payment", key: "paymentStatus", render: (row) => row.paymentStatus },
  { header: "Status", key: "status", render: (row) => row.status },
];
const contractorFields: readonly PropertyFormField[] = [{ label: "Kontraktor", name: "contractor" }, { label: "Project", name: "project" }, { label: "Work Package", name: "work-package" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyContractorsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyContractors session={session} />}</PropertyLayout>; }

function PropertyContractors({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [selected, setSelected] = useState<ContractorRow | null>(null);
  const [filters, setFilters] = useState({ project: "all", status: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const openDetail = () => { if (selected && activeKey) router.push(`/workspace/${encodeURIComponent(activeKey)}/contractors/${encodeURIComponent(selected.recordId)}`); };
  return <div className={styles.page}>
    <PageHeader description="Contractor technical delivery dengan Legal dan Finance state sebagai read-only projection." eyebrow="PROPERTY OPERATIONS" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Kontraktor" />
    <PropertySourceNote>Contractor source belum tersedia. Property hanya authority untuk technical delivery; Legal Status dan Payment bukan state yang dapat diubah.</PropertySourceNote>
    <Section title="Filter Kontraktor"><PropertyFilterBar ariaLabel="Filter contractor property"><PropertySelect label="Project" name="contractor-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} /><PropertySelect label="Status" name="contractor-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title="Daftar Kontraktor"><DataTable caption="Daftar contractor Property" columns={contractorColumns} emptyState={<PropertyUnavailableState description="Contractor projection belum tersedia." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelected(row)} size="sm" variant="secondary">Lihat cepat</Button>} rows={contractorRows} /></Section>
    <PropertyDetailDrawer description="Quick view contractor; detail lengkap tersedia pada route canonical Property." items={selected ? [{ label: "Kontraktor", value: selected.name }, { label: "Project", value: selected.project }, { label: "Technical Delivery", value: selected.delivery }, { label: "Legal Status", value: selected.legalStatus }, { label: "Payment", value: selected.paymentStatus }] : []} onClose={() => setSelected(null)} open={selected !== null} title="Quick View Kontraktor">{selected ? <Button onClick={openDetail} variant="primary">Buka Detail Kontraktor</Button> : null}</PropertyDetailDrawer>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Contractor Note</Button></div>
    <PropertyUnavailableFormDrawer description="Contractor technical note mutation belum memiliki capability authoritative." fields={contractorFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Note" title="Tambah Contractor Note" />
  </div>;
}
