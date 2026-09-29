"use client";

import { useState } from "react";

import { Button, DataTable, PageHeader, Section, Status, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesActionBar, SalesDetailDrawer, SalesExtractionReviewDrawer, SalesFilterBar, SalesSelect, SalesSourceNote, SalesUnavailableFormDrawer, SalesUnavailableState, type SalesFormField } from "../shared/sales-ui";
import styles from "../sales.module.css";

const tabs: readonly TabItem[] = [
  { id: "new", label: "Booking Baru" }, { id: "verification", label: "Menunggu Verifikasi" }, { id: "processing", label: "Diproses" },
  { id: "closing", label: "Closing" }, { id: "cancelled", label: "Dibatalkan" }, { id: "all", label: "Semua" },
];
const journey = ["Lead", "Booking Request", "Finance Verification", "SPK / Legal", "KPR bila applicable", "Akad", "Governed Closing"] as const;

interface BookingRow {
  readonly recordId: string;
  readonly customer: string;
  readonly project: string;
  readonly unit: string;
  readonly bookingDate: string;
  readonly bookingAmount: string;
  readonly salesOwner: string;
  readonly financeVerification: string;
  readonly legalSpk: string;
  readonly propertyReadiness: string;
  readonly closingState: string;
  readonly status: string;
}

const bookingRows: readonly BookingRow[] = [];
const bookingFields: readonly SalesFormField[] = [
  { label: "Customer / Lead", name: "customer" }, { label: "Project", name: "project" }, { label: "Unit", name: "unit" },
  { label: "Tanggal booking", name: "booking-date", type: "date" }, { label: "Nominal pengajuan", name: "booking-amount", type: "number" }, { label: "Catatan", name: "notes", type: "textarea" },
];

export function SalesBookingsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesBookings session={session} />}</SalesLayout>;
}

function SalesBookings({ session }: Readonly<{ session: SessionProjection }>) {
  const [tab, setTab] = useState("new");
  const [filters, setFilters] = useState({ owner: "all", project: "all", status: "all" });
  const [form, setForm] = useState<"booking" | "cancellation" | null>(null);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const workspaceKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;

  return (
    <div className={styles.page}>
      <PageHeader description="Pengajuan booking dan perjalanan closing lintas domain dalam status read-only." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="Booking & Closing" />
      <SalesSourceNote>Booking source belum terhubung. Sales dapat menyiapkan alur pengajuan, tetapi verifikasi lintas domain tetap authoritative dan read-only.</SalesSourceNote>
      <SalesActionBar><Button onClick={() => setForm("booking")} variant="primary">Ajukan Booking</Button><Button onClick={() => setForm("cancellation")} variant="secondary">Ajukan Pembatalan</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></SalesActionBar>
      <Tabs ariaLabel="Filter booking" items={tabs} onValueChange={setTab} value={tab} />
      <Section title="Journey Booking & Closing">
        <ol className={styles.journey}>
          {journey.map((step, index) => <li key={step}><span className={styles.journeyIndex}>{index + 1}</span><span>{step}</span></li>)}
        </ol>
      </Section>
      <Section title="Filter Booking">
        <SalesFilterBar search={<input aria-label="Cari customer atau unit" placeholder="Cari customer atau unit" />}>
          <SalesSelect label="Project" name="booking-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua project"]]} value={filters.project} />
          <SalesSelect label="Owner" name="booking-owner" onChange={(value) => setFilters((current) => ({ ...current, owner: value }))} options={[["all", "Semua owner"]]} value={filters.owner} />
          <SalesSelect label="Status" name="booking-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} />
        </SalesFilterBar>
      </Section>
      <Section title="Daftar Booking">
        <DataTable caption="Daftar booking dan closing" columns={bookingColumns} emptyState={<SalesUnavailableState description="Booking akan tampil setelah source Sales/Property/Finance terhubung." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelectedBooking(row)} size="sm" variant="secondary">Lihat journey</Button>} rows={bookingRows} />
      </Section>
      <SalesDetailDrawer description="Cross-domain state ditampilkan read-only; Sales tidak dapat menetapkan hasil authority." items={selectedBooking ? bookingDetailItems(selectedBooking) : []} onClose={() => setSelectedBooking(null)} open={selectedBooking !== null} title="Journey Booking" />
      <SalesUnavailableFormDrawer description="Booking request belum memiliki contract mutation authoritative." fields={bookingFields} onClose={() => setForm(null)} open={form === "booking"} submitLabel="Ajukan Booking" title="Ajukan Booking" />
      <SalesUnavailableFormDrawer description="Cancellation request belum memiliki contract mutation authoritative." fields={[{ label: "Booking / Customer", name: "booking" }, { label: "Alasan pembatalan", name: "reason", type: "textarea" }, { label: "Bukti pendukung", name: "evidence" }]} onClose={() => setForm(null)} open={form === "cancellation"} submitLabel="Ajukan Pembatalan" title="Ajukan Pembatalan" />
      <SalesExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Booking" />
    </div>
  );
}

const bookingColumns: readonly DataTableColumn<BookingRow>[] = [
  { header: "Customer", key: "customer", render: (row) => row.customer }, { header: "Project", key: "project", render: (row) => row.project },
  { header: "Unit", key: "unit", render: (row) => row.unit }, { header: "Booking Date", key: "bookingDate", render: (row) => row.bookingDate },
  { header: "Booking Amount", key: "bookingAmount", render: (row) => row.bookingAmount }, { header: "Sales Owner", key: "salesOwner", render: (row) => row.salesOwner },
  { header: "Finance Verification", key: "financeVerification", render: (row) => <Status label={row.financeVerification} variant="neutral" /> },
  { header: "Legal/SPK", key: "legalSpk", render: (row) => <Status label={row.legalSpk} variant="neutral" /> },
  { header: "Property Readiness", key: "propertyReadiness", render: (row) => <Status label={row.propertyReadiness} variant="neutral" /> },
  { header: "Closing State", key: "closingState", render: (row) => <Status label={row.closingState} variant="neutral" /> }, { header: "Status", key: "status", render: (row) => row.status },
];

function bookingDetailItems(row: BookingRow) {
  return [
    { label: "Record", value: row.recordId }, { label: "Customer", value: row.customer }, { label: "Project / Unit", value: `${row.project} / ${row.unit}` },
    { label: "Booking Date", value: row.bookingDate }, { label: "Booking Amount", value: row.bookingAmount }, { label: "Finance", value: row.financeVerification },
    { label: "Legal/SPK", value: row.legalSpk }, { label: "Property", value: row.propertyReadiness }, { label: "Closing", value: row.closingState },
  ];
}
