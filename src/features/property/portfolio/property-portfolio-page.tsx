"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyDetailDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [
  { id: "all", label: "Semua" }, { id: "active", label: "Aktif" }, { id: "planning", label: "Perencanaan" },
  { id: "risk", label: "Berisiko" }, { id: "held", label: "Ditahan" }, { id: "completed", label: "Selesai" },
];
interface PortfolioRow { readonly recordId: string; readonly code: string; readonly project: string; readonly owner: string; readonly start: string; readonly targetEnd: string; readonly plannedProgress: string; readonly actualProgress: string; readonly deviation: string; readonly risk: string; readonly milestone: string; readonly status: string; }
const portfolioRows: readonly PortfolioRow[] = [];
const portfolioColumns: readonly DataTableColumn<PortfolioRow>[] = [
  { header: "Kode", key: "code", render: (row) => row.code }, { header: "Proyek", key: "project", render: (row) => row.project },
  { header: "Penanggung Jawab", key: "owner", render: (row) => row.owner }, { header: "Mulai", key: "start", render: (row) => row.start },
  { header: "Target Selesai", key: "targetEnd", render: (row) => row.targetEnd }, { header: "Progres Rencana", key: "plannedProgress", render: (row) => row.plannedProgress },
  { header: "Progres Aktual", key: "actualProgress", render: (row) => row.actualProgress }, { header: "Deviasi", key: "deviation", render: (row) => row.deviation },
  { header: "Risiko", key: "risk", render: (row) => row.risk }, { header: "Milestone", key: "milestone", render: (row) => row.milestone },
  { header: "Status", key: "status", render: (row) => row.status },
];
const profileFields: readonly PropertyFormField[] = [
  { label: "Proyek", name: "project" }, { label: "Lokasi", name: "location" }, { label: "Tipe Proyek", name: "project-type" },
  { label: "Fase", name: "phase" }, { label: "Penanggung Jawab Teknis", name: "technical-owner" }, { label: "Baseline Mulai", name: "baseline-start", type: "date" },
  { label: "Baseline Selesai", name: "baseline-end", type: "date" }, { label: "Deskripsi", name: "description", type: "textarea" },
];

export function PropertyPortfolioPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyPortfolio session={session} />}</PropertyLayout>;
}

function PropertyPortfolio({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<PortfolioRow | null>(null);
  const [filters, setFilters] = useState({ project: "all", phase: "all", health: "all" });
  const [profileOpen, setProfileOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const openProject = () => { if (selected && activeKey) router.push(`/workspace/${encodeURIComponent(activeKey)}/projects/${encodeURIComponent(selected.recordId)}`); };
  return (
    <div className={styles.page}>
      <PageHeader description="Pantau kondisi teknis seluruh proyek yang dapat Anda akses." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Portofolio Proyek" />
      <PropertySourceNote>Data proyek menggunakan sumber proyek yang sama di seluruh ALOS. Data kondisi teknis portofolio belum tersedia.</PropertySourceNote>
      <div className={styles.actionBar}><Button onClick={() => setProfileOpen(true)} variant="primary">Profil Teknis Proyek</Button></div>
      <Tabs ariaLabel="Filter portfolio project" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Filter Portofolio"><PropertyFilterBar ariaLabel="Filter portofolio proyek" search={<input aria-label="Cari proyek" placeholder="Cari proyek" />}><PropertySelect label="Proyek" name="portfolio-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Fase" name="portfolio-phase" onChange={(value) => setFilters((current) => ({ ...current, phase: value }))} options={[["all", "Semua fase"]]} value={filters.phase} /><PropertySelect label="Status" name="portfolio-health" onChange={(value) => setFilters((current) => ({ ...current, health: value }))} options={[["all", "Semua status"]]} value={filters.health} /></PropertyFilterBar></Section>
      <Section description="Tampilan cepat teknis dapat membuka detail proyek." title="Daftar Portofolio"><DataTable caption="Daftar portofolio proyek" columns={portfolioColumns} emptyState={<PropertyUnavailableState description="Portofolio proyek belum tersedia." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelected(row)} size="sm" variant="secondary">Lihat cepat</Button>} rows={portfolioRows} /></Section>
      <PropertyDetailDrawer description="Informasi teknis Property; detail proyek menggunakan data proyek yang sama di seluruh ALOS." items={selected ? [{ label: "Nama", value: selected.project }, { label: "Kode", value: selected.code }, { label: "Penanggung Jawab", value: selected.owner }, { label: "Status", value: selected.status }, { label: "Periode", value: `${selected.start} — ${selected.targetEnd}` }, { label: "Progres", value: selected.actualProgress }, { label: "Deviasi", value: selected.deviation }, { label: "Milestone Saat Ini", value: selected.milestone }, { label: "Unit", value: "—" }, { label: "Kontraktor", value: "—" }, { label: "Temuan", value: "—" }, { label: "Persetujuan", value: "—" }] : []} onClose={() => setSelected(null)} open={selected !== null} title="Tampilan Cepat Proyek">{selected ? <Button onClick={openProject} variant="primary">Buka Proyek</Button> : null}</PropertyDetailDrawer>
      <PropertyUnavailableFormDrawer description="Profil teknis belum dapat disimpan karena fitur ini belum tersedia." fields={profileFields} onClose={() => setProfileOpen(false)} open={profileOpen} submitLabel="Simpan Profil Teknis" title="Profil Teknis Proyek" />
    </div>
  );
}
