"use client";

import { useState } from "react";

import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesActionBar, SalesDetailDrawer, SalesExtractionReviewDrawer, SalesFilterBar, SalesSelect, SalesSourceNote, SalesUnavailableFormDrawer, SalesUnavailableState, type SalesFormField } from "../shared/sales-ui";
import styles from "../sales.module.css";

const tabs: readonly TabItem[] = [
  { id: "today", label: "Hari Ini" }, { id: "overdue", label: "Terlambat" }, { id: "upcoming", label: "Mendatang" },
  { id: "done", label: "Selesai" }, { id: "all", label: "Semua Aktivitas" },
];

interface ActivityRow {
  readonly recordId: string;
  readonly leadCustomer: string;
  readonly activityType: string;
  readonly schedule: string;
  readonly owner: string;
  readonly result: string;
  readonly nextAction: string;
  readonly due: string;
  readonly status: string;
}

const activityRows: readonly ActivityRow[] = [];
const activityFields: readonly SalesFormField[] = [
  { label: "Lead / Customer", name: "lead-customer" }, { label: "Jenis aktivitas", name: "activity-type" },
  { label: "Jadwal", name: "schedule", type: "date" }, { label: "Owner", name: "owner" }, { label: "Catatan", name: "notes", type: "textarea" },
];

export function SalesActivitiesPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesActivities session={session} />}</SalesLayout>;
}

function SalesActivities({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("today");
  const [filters, setFilters] = useState({ owner: "all", status: "all", type: "all" });
  const [form, setForm] = useState<"activity" | "follow-up" | null>(null);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRow | null>(null);
  const workspaceKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;

  return (
    <div className={styles.page}>
      <PageHeader description="Aktivitas, survey, hasil, dan tindak lanjut operasional penjualan." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="Aktivitas & Tindak Lanjut" />
      <SalesSourceNote>Activity source authoritative belum tersedia. Tidak ada record aktivitas yang dibuat oleh frontend.</SalesSourceNote>
      <SalesActionBar><Button onClick={() => setForm("activity")} variant="primary">Tambah Aktivitas</Button><Button onClick={() => setForm("follow-up")} variant="secondary">Jadwalkan Follow-up</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></SalesActionBar>
      <Tabs ariaLabel="Filter aktivitas" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Filter Aktivitas">
        <SalesFilterBar search={<input aria-label="Cari lead atau customer" placeholder="Cari lead atau customer" />}>
          <SalesSelect label="Owner" name="activity-owner" onChange={(value) => setFilters((current) => ({ ...current, owner: value }))} options={[["all", "Semua owner"]]} value={filters.owner} />
          <SalesSelect label="Jenis aktivitas" name="activity-type" onChange={(value) => setFilters((current) => ({ ...current, type: value }))} options={[["all", "Semua jenis"], ["call", "Call"], ["whatsapp", "WhatsApp"], ["meeting", "Meeting"], ["survey", "Survey"], ["follow-up", "Follow-up"], ["notes", "Notes"]]} value={filters.type} />
          <SalesSelect label="Status" name="activity-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} />
        </SalesFilterBar>
      </Section>
      <Section title="Daftar Aktivitas">
        <DataTable caption="Daftar aktivitas dan tindak lanjut" columns={activityColumns} emptyState={<SalesUnavailableState description="Aktivitas akan tampil setelah source activity terhubung." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelectedActivity(row)} size="sm" variant="secondary">Lihat detail</Button>} rows={activityRows} />
      </Section>
      <SalesDetailDrawer items={selectedActivity ? activityDetailItems(selectedActivity) : []} onClose={() => setSelectedActivity(null)} open={selectedActivity !== null} title="Detail Aktivitas" />
      <SalesUnavailableFormDrawer description="Activity mutation belum memiliki contract authoritative." fields={activityFields} onClose={() => setForm(null)} open={form === "activity"} submitLabel="Catat Aktivitas" title="Tambah Aktivitas" />
      <SalesUnavailableFormDrawer description="Follow-up mutation belum memiliki contract authoritative." fields={activityFields} onClose={() => setForm(null)} open={form === "follow-up"} submitLabel="Jadwalkan" title="Jadwalkan Follow-up" />
      <SalesExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Aktivitas" />
    </div>
  );
}

const activityColumns: readonly DataTableColumn<ActivityRow>[] = [
  { header: "Lead/Customer", key: "leadCustomer", render: (row) => row.leadCustomer },
  { header: "Jenis Aktivitas", key: "activityType", render: (row) => row.activityType },
  { header: "Jadwal", key: "schedule", render: (row) => row.schedule },
  { header: "Owner", key: "owner", render: (row) => row.owner },
  { header: "Hasil", key: "result", render: (row) => row.result },
  { header: "Next Action", key: "nextAction", render: (row) => row.nextAction },
  { header: "Due", key: "due", render: (row) => row.due },
  { header: "Status", key: "status", render: (row) => row.status },
];

function activityDetailItems(row: ActivityRow) {
  return [
    { label: "Record", value: row.recordId }, { label: "Lead/Customer", value: row.leadCustomer }, { label: "Jenis", value: row.activityType },
    { label: "Jadwal", value: row.schedule }, { label: "Owner", value: row.owner }, { label: "Hasil", value: row.result },
    { label: "Next Action", value: row.nextAction }, { label: "Due", value: row.due },
  ];
}
