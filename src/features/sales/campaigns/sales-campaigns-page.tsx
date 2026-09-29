"use client";

import { useState } from "react";

import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesActionBar, SalesDetailDrawer, SalesExtractionReviewDrawer, SalesFilterBar, SalesSelect, SalesSourceNote, SalesUnavailableFormDrawer, SalesUnavailableState, type SalesFormField } from "../shared/sales-ui";
import styles from "../sales.module.css";

const tabs: readonly TabItem[] = [
  { id: "campaign", label: "Campaign" }, { id: "channel", label: "Channel" }, { id: "attribution", label: "Attribution" }, { id: "content", label: "Content/Collateral" },
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
  { label: "Nama campaign", name: "name" }, { label: "Jenis", name: "type" }, { label: "Periode mulai", name: "start", type: "date" },
  { label: "Periode selesai", name: "end", type: "date" }, { label: "Channel", name: "channel" }, { label: "Budget", name: "budget", type: "number" }, { label: "Brief", name: "brief", type: "textarea" },
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
      <PageHeader description="Campaign, channel, dan attribution sesuai data marketing resmi." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="Campaign & Channel" />
      <SalesSourceNote>Campaign source belum terhubung. Spend, leads, CPL, dan conversion tidak disimpulkan sebagai nol.</SalesSourceNote>
      <SalesActionBar><Button onClick={() => setForm("add")} variant="primary">Tambah Campaign</Button><Button disabled={selectedCampaign === null} onClick={() => setForm("edit")} variant="secondary">Edit Campaign</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></SalesActionBar>
      <Tabs ariaLabel="Tampilan campaign dan channel" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Filter Marketing">
        <SalesFilterBar search={<input aria-label="Cari campaign atau channel" placeholder="Cari campaign atau channel" />}>
          <SalesSelect label="Periode" name="campaign-period" onChange={(value) => setFilters((current) => ({ ...current, period: value }))} options={[["all", "Semua periode"]]} value={filters.period} />
          <SalesSelect label="Channel" name="campaign-channel" onChange={(value) => setFilters((current) => ({ ...current, channel: value }))} options={[["all", "Semua channel"]]} value={filters.channel} />
          <SalesSelect label="Status" name="campaign-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} />
        </SalesFilterBar>
      </Section>
      {tab === "campaign" || tab === "content" ? <Section title={tab === "content" ? "Content / Collateral" : "Daftar Campaign"}><DataTable caption="Daftar campaign" columns={campaignColumns} emptyState={<SalesUnavailableState description="Campaign akan tampil setelah source marketing terhubung." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelectedCampaign(row)} size="sm" variant="secondary">Lihat cepat</Button>} rows={campaignRows} /></Section> : <Section title={tab === "channel" ? "Daftar Channel" : "Attribution Channel"}><DataTable caption="Daftar channel dan attribution" columns={channelColumns} emptyState={<SalesUnavailableState description="Channel dan attribution akan tampil setelah source marketing terhubung." />} getRowKey={(row) => row.recordId} rows={channelRows} /></Section>}
      <SalesDetailDrawer description="Quick view campaign hanya menampilkan data marketing authoritative." items={selectedCampaign ? campaignDetailItems(selectedCampaign) : []} onClose={() => setSelectedCampaign(null)} open={selectedCampaign !== null} title="Quick View Campaign">
        {selectedCampaign ? <Button onClick={() => setForm("edit")} variant="secondary">Edit Campaign</Button> : null}
      </SalesDetailDrawer>
      <SalesUnavailableFormDrawer description="Campaign mutation belum memiliki contract authoritative." fields={campaignFields} onClose={() => setForm(null)} open={form !== null} submitLabel={form === "edit" ? "Simpan Perubahan" : "Simpan Campaign"} title={form === "edit" ? "Edit Campaign" : "Tambah Campaign"} />
      <SalesExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Campaign Brief" />
    </div>
  );
}

const campaignColumns: readonly DataTableColumn<CampaignRow>[] = [
  { header: "Nama", key: "name", render: (row) => row.name }, { header: "Jenis", key: "type", render: (row) => row.type }, { header: "Periode", key: "period", render: (row) => row.period },
  { header: "Channel", key: "channel", render: (row) => row.channel }, { header: "Budget", key: "budget", render: (row) => row.budget }, { header: "Spend", key: "spend", render: (row) => row.spend },
  { header: "Leads", key: "leads", render: (row) => row.leads }, { header: "Qualified", key: "qualified", render: (row) => row.qualified }, { header: "Booking", key: "booking", render: (row) => row.booking },
  { header: "Closing", key: "closing", render: (row) => row.closing }, { header: "CPL", key: "cpl", render: (row) => row.cpl }, { header: "Status", key: "status", render: (row) => row.status },
];

const channelColumns: readonly DataTableColumn<ChannelRow>[] = [
  { header: "Channel", key: "channel", render: (row) => row.channel }, { header: "Leads", key: "leads", render: (row) => row.leads }, { header: "Qualified", key: "qualified", render: (row) => row.qualified },
  { header: "Booking", key: "booking", render: (row) => row.booking }, { header: "Closing", key: "closing", render: (row) => row.closing }, { header: "Conversion", key: "conversion", render: (row) => row.conversion }, { header: "CPL", key: "cpl", render: (row) => row.cpl },
];

function campaignDetailItems(row: CampaignRow) {
  return [
    { label: "Record", value: row.recordId }, { label: "Nama", value: row.name }, { label: "Jenis", value: row.type }, { label: "Periode", value: row.period },
    { label: "Channel", value: row.channel }, { label: "Budget", value: row.budget }, { label: "Spend", value: row.spend }, { label: "CPL", value: row.cpl }, { label: "Status", value: row.status },
  ];
}
