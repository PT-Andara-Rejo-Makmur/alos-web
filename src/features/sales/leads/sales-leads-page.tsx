"use client";

import { useState } from "react";

import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesDetailDrawer, SalesExtractionReviewDrawer, SalesFilterBar, SalesSelect, SalesActionBar, SalesSourceNote, SalesUnavailableFormDrawer, SalesUnavailableState, type SalesFormField } from "../shared/sales-ui";
import styles from "../sales.module.css";

const tabs: readonly TabItem[] = [
  { id: "all", label: "Semua" }, { id: "mine", label: "Milik Saya" }, { id: "new", label: "Baru" },
  { id: "follow-up", label: "Perlu Follow-up" }, { id: "qualified", label: "Qualified" }, { id: "inactive", label: "Tidak Aktif" },
];

interface LeadRow {
  readonly recordId: string;
  readonly name: string;
  readonly contact: string;
  readonly source: string;
  readonly projectInterest: string;
  readonly owner: string;
  readonly status: string;
  readonly lastActivity: string;
  readonly nextFollowUp: string;
  readonly created: string;
}

const leadRows: readonly LeadRow[] = [];
const leadFormFields: readonly SalesFormField[] = [
  { label: "Nama prospek", name: "name" }, { label: "Kontak", name: "contact" }, { label: "Sumber lead", name: "source" },
  { label: "Minat Proyek", name: "project-interest" }, { label: "Penanggung Jawab", name: "owner" }, { label: "Catatan", name: "notes", type: "textarea" },
];

export function SalesLeadsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesLeads session={session} />}</SalesLayout>;
}

function SalesLeads({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ owner: "all", project: "all", source: "all", status: "all" });
  const [form, setForm] = useState<"add" | "edit" | "activity" | "follow-up" | null>(null);
  const [editingLead, setEditingLead] = useState<LeadRow | null>(null);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const workspaceKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;

  return (
    <div className={styles.page}>
      <PageHeader description="Daftar prospek dan follow-up sesuai scope workspace Sales." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="Prospek & Lead" />
      <SalesSourceNote>Lead authoritative belum tersedia. Struktur daftar, filter, quick view, dan form siap dipakai setelah contract/backend terhubung.</SalesSourceNote>
      <SalesActionBar>
        <Button onClick={() => setForm("add")} variant="primary">Tambah Lead</Button>
        <Button onClick={() => setForm("activity")} variant="secondary">Tambah Aktivitas</Button>
        <Button onClick={() => setForm("follow-up")} variant="secondary">Jadwalkan Follow-up</Button>
        <Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button>
      </SalesActionBar>
      <Tabs ariaLabel="Filter status lead" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Filter Prospek">
        <SalesFilterBar search={<input aria-label="Cari prospek" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau kontak" value={search} />}>
          <SalesSelect label="Status" name="lead-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} />
          <SalesSelect label="Penanggung Jawab" name="lead-owner" onChange={(value) => setFilters((current) => ({ ...current, owner: value }))} options={[["all", "Semua penanggung jawab"]]} value={filters.owner} />
          <SalesSelect label="Sumber / Channel" name="lead-source" onChange={(value) => setFilters((current) => ({ ...current, source: value }))} options={[["all", "Semua sumber"]]} value={filters.source} />
          <SalesSelect label="Proyek" name="lead-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} />
        </SalesFilterBar>
      </Section>
      <Section description="Rekaman memakai ID konseptual dari sumber; nama prospek bukan identitas final." title="Daftar Prospek">
        <DataTable caption="Daftar prospek dan lead" columns={leadColumns} emptyState={<SalesUnavailableState description="Daftar prospek akan tampil setelah sumber Lead terhubung." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelectedLead(row)} size="sm" variant="secondary">Lihat detail</Button>} rows={leadRows} />
      </Section>
      <SalesDetailDrawer description="Profil, kontak, aktivitas terakhir, next action, dan related documents." items={selectedLead ? leadDetailItems(selectedLead) : []} onClose={() => setSelectedLead(null)} open={selectedLead !== null} title="Detail Prospek">
        {selectedLead ? <Button onClick={() => { setEditingLead(selectedLead); setSelectedLead(null); setForm("edit"); }} variant="secondary">Edit Lead</Button> : null}
      </SalesDetailDrawer>
      <SalesUnavailableFormDrawer description={editingLead ? `Perubahan untuk ${editingLead.name} belum memiliki capability mutation authoritative.` : "Lead belum memiliki capability mutation authoritative."} fields={leadFormFields} onClose={() => { setEditingLead(null); setForm(null); }} open={form === "add" || (form === "edit" && editingLead !== null)} submitLabel={form === "edit" ? "Simpan Perubahan" : "Simpan Lead"} title={form === "edit" ? "Edit Lead" : "Tambah Lead"} />
      <SalesUnavailableFormDrawer description="Aktivitas dan jadwal follow-up belum memiliki contract authoritative." fields={[{ label: "Lead / Customer", name: "lead" }, { label: "Jenis aktivitas", name: "activity-type" }, { label: "Jadwal", name: "schedule", type: "date" }, { label: "Catatan", name: "notes", type: "textarea" }]} onClose={() => setForm(null)} open={form === "activity" || form === "follow-up"} submitLabel={form === "activity" ? "Catat Aktivitas" : "Jadwalkan"} title={form === "activity" ? "Tambah Aktivitas" : "Jadwalkan Follow-up"} />
      <SalesExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Lead" />
    </div>
  );
}

const leadColumns: readonly DataTableColumn<LeadRow>[] = [
  { header: "Nama/Prospek", key: "name", render: (row) => row.name },
  { header: "Kontak", key: "contact", render: (row) => row.contact },
  { header: "Sumber", key: "source", render: (row) => row.source },
  { header: "Minat Proyek", key: "projectInterest", render: (row) => row.projectInterest },
  { header: "Penanggung Jawab", key: "owner", render: (row) => row.owner },
  { header: "Status", key: "status", render: (row) => row.status },
  { header: "Aktivitas Terakhir", key: "lastActivity", render: (row) => row.lastActivity },
  { header: "Next Follow-up", key: "nextFollowUp", render: (row) => row.nextFollowUp },
  { header: "Created", key: "created", render: (row) => row.created },
];

function leadDetailItems(row: LeadRow) {
  return [
    { label: "Rekaman", value: row.recordId }, { label: "Profil", value: row.name }, { label: "Kontak", value: row.contact },
    { label: "Sumber lead", value: row.source }, { label: "Minat", value: row.projectInterest }, { label: "Penanggung Jawab", value: row.owner },
    { label: "Aktivitas Terakhir", value: row.lastActivity }, { label: "Tindakan Berikutnya", value: row.nextFollowUp }, { label: "Dokumen Terkait", value: "—" },
  ];
}
