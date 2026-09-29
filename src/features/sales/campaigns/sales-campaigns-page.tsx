"use client";

import { useState } from "react";

import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesActionBar, SalesDetailDrawer, SalesExtractionReviewDrawer, SalesFilterBar, SalesSelect, SalesSourceNote, SalesUnavailableFormDrawer, SalesUnavailableState, type SalesFormField } from "../shared/sales-ui";
import styles from "../sales.module.css";

const tabs: readonly TabItem[] = [
  { id: "campaign", label: "Kampanye" }, { id: "channel", label: "Saluran" }, { id: "attribution", label: "Atribusi" }, { id: "content", label: "Konten & Materi Promosi" },
];

interface CampaignRow {
  readonly recordId: string;
  readonly name: string;
  readonly type: string;
  readonly period: string;
  readonly channel: string;
  readonly budget: string;
  readonly spend: string;
  readonly leads: string;
  readonly qualified: string;
  readonly booking: string;
  readonly closing: string;
  readonly cpl: string;
  readonly status: string;
}

interface ChannelRow {
  readonly recordId: string;
  readonly channel: string;
  readonly leads: string;
  readonly qualified: string;
  readonly booking: string;
  readonly closing: string;
  readonly conversion: string;
  readonly cpl: string;
}

const campaignRows: readonly CampaignRow[] = [];
const channelRows: readonly ChannelRow[] = [];
const campaignFields: readonly SalesFormField[] = [
  { label: "Nama kampanye", name: "name" }, { label: "Jenis", name: "type" }, { label: "Periode mulai", name: "start", type: "date" },
  { label: "Periode selesai", name: "end", type: "date" }, { label: "Saluran", name: "channel" }, { label: "Anggaran", name: "budget", type: "number" }, { label: "Ringkasan", name: "brief", type: "textarea" },
];

export function SalesCampaignsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesCampaigns session={session} />}</SalesLayout>;
}

function SalesCampaigns({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("campaign");
  const [filters, setFilters] = useState({ channel: "all", period: "all", status: "all" });
  const [form, setForm] = useState<"add" | "edit" | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRow | null>(null);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const workspaceKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;

  return (
    <div className={styles.page}>
      <PageHeader description="Kampanye, saluran, dan atribusi sesuai data pemasaran resmi." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="Kampanye & Saluran" />
      <SalesSourceNote>Sumber kampanye belum terhubung. Pengeluaran, lead, CPL, dan konversi tidak disimpulkan sebagai nol.</SalesSourceNote>
      <SalesActionBar><Button onClick={() => setForm("add")} variant="primary">Tambah Kampanye</Button><Button disabled={selectedCampaign === null} onClick={() => setForm("edit")} variant="secondary">Edit Kampanye</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></SalesActionBar>
      <Tabs ariaLabel="Tampilan kampanye dan saluran" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Filter Marketing">
        <SalesFilterBar search={<input aria-label="Cari kampanye atau saluran" placeholder="Cari kampanye atau saluran" />}>
          <SalesSelect label="Periode" name="campaign-period" onChange={(value) => setFilters((current) => ({ ...current, period: value }))} options={[["all", "Semua periode"]]} value={filters.period} />
          <SalesSelect label="Saluran" name="campaign-channel" onChange={(value) => setFilters((current) => ({ ...current, channel: value }))} options={[["all", "Semua saluran"]]} value={filters.channel} />
          <SalesSelect label="Status" name="campaign-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} />
        </SalesFilterBar>
      </Section>
      {tab === "campaign" || tab === "content" ? <Section title={tab === "content" ? "Konten & Materi Promosi" : "Daftar Kampanye"}><DataTable caption="Daftar kampanye" columns={campaignColumns} emptyState={<SalesUnavailableState description="Kampanye akan tampil setelah sumber pemasaran terhubung." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelectedCampaign(row)} size="sm" variant="secondary">Lihat cepat</Button>} rows={campaignRows} /></Section> : <Section title={tab === "channel" ? "Daftar Saluran" : "Atribusi Saluran"}><DataTable caption="Daftar saluran dan atribusi" columns={channelColumns} emptyState={<SalesUnavailableState description="Saluran dan atribusi akan tampil setelah sumber pemasaran terhubung." />} getRowKey={(row) => row.recordId} rows={channelRows} /></Section>}
      <SalesDetailDrawer description="Tinjauan cepat kampanye hanya menampilkan data pemasaran authoritative." items={selectedCampaign ? campaignDetailItems(selectedCampaign) : []} onClose={() => setSelectedCampaign(null)} open={selectedCampaign !== null} title="Tinjauan Cepat Kampanye">
        {selectedCampaign ? <Button onClick={() => setForm("edit")} variant="secondary">Edit Kampanye</Button> : null}
      </SalesDetailDrawer>
      <SalesUnavailableFormDrawer description="Mutation kampanye belum memiliki kontrak authoritative." fields={campaignFields} onClose={() => setForm(null)} open={form !== null} submitLabel={form === "edit" ? "Simpan Perubahan" : "Simpan Kampanye"} title={form === "edit" ? "Edit Kampanye" : "Tambah Kampanye"} />
      <SalesExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Ekstraksi Ringkasan Kampanye" />
    </div>
  );
}

const campaignColumns: readonly DataTableColumn<CampaignRow>[] = [
  { header: "Nama", key: "name", render: (row) => row.name }, { header: "Jenis", key: "type", render: (row) => row.type }, { header: "Periode", key: "period", render: (row) => row.period },
  { header: "Saluran", key: "channel", render: (row) => row.channel }, { header: "Anggaran", key: "budget", render: (row) => row.budget }, { header: "Pengeluaran", key: "spend", render: (row) => row.spend },
  { header: "Lead", key: "leads", render: (row) => row.leads }, { header: "Terkualifikasi", key: "qualified", render: (row) => row.qualified }, { header: "Booking", key: "booking", render: (row) => row.booking },
  { header: "Closing", key: "closing", render: (row) => row.closing }, { header: "CPL", key: "cpl", render: (row) => row.cpl }, { header: "Status", key: "status", render: (row) => row.status },
];

const channelColumns: readonly DataTableColumn<ChannelRow>[] = [
  { header: "Saluran", key: "channel", render: (row) => row.channel }, { header: "Lead", key: "leads", render: (row) => row.leads }, { header: "Terkualifikasi", key: "qualified", render: (row) => row.qualified },
  { header: "Booking", key: "booking", render: (row) => row.booking }, { header: "Closing", key: "closing", render: (row) => row.closing }, { header: "Konversi", key: "conversion", render: (row) => row.conversion }, { header: "CPL", key: "cpl", render: (row) => row.cpl },
];

function campaignDetailItems(row: CampaignRow) {
  return [
    { label: "Rekaman", value: row.recordId }, { label: "Nama", value: row.name }, { label: "Jenis", value: row.type }, { label: "Periode", value: row.period },
    { label: "Saluran", value: row.channel }, { label: "Anggaran", value: row.budget }, { label: "Pengeluaran", value: row.spend }, { label: "CPL", value: row.cpl }, { label: "Status", value: row.status },
  ];
}
