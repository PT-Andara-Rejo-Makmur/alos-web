"use client";

import { useState } from "react";

import { Button, DataTable, PageHeader, Section, Status, type DataTableColumn } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { SalesLayout } from "../sales-layout";
import { SalesActionBar, SalesDetailDrawer, SalesExtractionReviewDrawer, SalesFilterBar, SalesSelect, SalesSourceNote, SalesUnavailableFormDrawer, SalesUnavailableState, type SalesFormField } from "../shared/sales-ui";
import styles from "../sales.module.css";

const journey = ["Pengajuan", "Dokumen", "Verifikasi", "Bank", "Approval", "SP3K", "Akad", "Selesai"] as const;

interface KprRow {
  readonly recordId: string;
  readonly customer: string;
  readonly projectUnit: string;
  readonly bank: string;
  readonly stage: string;
  readonly documentStatus: string;
  readonly financeStatus: string;
  readonly legalStatus: string;
  readonly sp3k: string;
  readonly akad: string;
  readonly owner: string;
  readonly nextAction: string;
}

const kprRows: readonly KprRow[] = [];
const documentFields: readonly SalesFormField[] = [
  { label: "Pelanggan / KPR", name: "customer" }, { label: "Proyek / Unit", name: "project-unit" }, { label: "Jenis dokumen", name: "document-type" },
  { label: "File / Referensi", name: "file-reference" }, { label: "Catatan", name: "notes", type: "textarea" },
];

export function SalesKprPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <SalesKpr session={session} />}</SalesLayout>;
}

function SalesKpr({ session }: Readonly<{ session: SessionProjection }>) {
  const [formOpen, setFormOpen] = useState(false);
  const [filters, setFilters] = useState({ bank: "all", stage: "all", status: "all" });
  const [extractionOpen, setExtractionOpen] = useState(false);
  const [selectedKpr, setSelectedKpr] = useState<KprRow | null>(null);
  const workspaceKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;

  return (
    <div className={styles.page}>
      <PageHeader description="Perjalanan KPR dan akad dengan state Finance/Legal sebagai projection read-only." eyebrow="SALES & MARKETING" metadata={`Workspace aktif: ${workspaceKey ?? "—"}`} title="KPR & Akad" />
      <SalesSourceNote>KPR, SP3K, dan akad source belum terhubung. Sales dapat melihat dan follow-up ketika projection tersedia, tetapi tidak menetapkan state authoritative.</SalesSourceNote>
      <SalesActionBar><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Dokumen KPR</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></SalesActionBar>
      <Section title="Journey KPR & Akad">
        <ol className={styles.journey}>{journey.map((step, index) => <li key={step}><span className={styles.journeyIndex}>{index + 1}</span><span>{step}</span></li>)}</ol>
      </Section>
      <Section title="Filter KPR">
        <SalesFilterBar search={<input aria-label="Cari customer atau unit KPR" placeholder="Cari customer atau unit" />}>
          <SalesSelect label="Bank" name="kpr-bank" onChange={(value) => setFilters((current) => ({ ...current, bank: value }))} options={[["all", "Semua bank"]]} value={filters.bank} />
          <SalesSelect label="Stage" name="kpr-stage" onChange={(value) => setFilters((current) => ({ ...current, stage: value }))} options={[["all", "Semua stage"], ...journey.map((stage) => [stage, stage] as const)]} value={filters.stage} />
          <SalesSelect label="Status" name="kpr-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} />
        </SalesFilterBar>
      </Section>
      <Section title="Daftar KPR & Akad">
        <DataTable caption="Daftar KPR dan akad" columns={kprColumns} emptyState={<SalesUnavailableState description="Data KPR akan tampil setelah projection Finance/Legal terhubung." />} getRowKey={(row) => row.recordId} rowAction={(row) => <Button onClick={() => setSelectedKpr(row)} size="sm" variant="secondary">Lihat journey</Button>} rows={kprRows} />
      </Section>
      <SalesDetailDrawer description="Finance Status, Legal Status, SP3K, dan Akad ditampilkan read-only." items={selectedKpr ? kprDetailItems(selectedKpr) : []} onClose={() => setSelectedKpr(null)} open={selectedKpr !== null} title="Detail KPR & Akad" />
      <SalesUnavailableFormDrawer description="Dokumen KPR belum memiliki capability mutation authoritative." fields={documentFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Dokumen" title="Tambah Dokumen KPR" />
      <SalesExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Extraction Dokumen KPR" />
    </div>
  );
}

const kprColumns: readonly DataTableColumn<KprRow>[] = [
  { header: "Pelanggan", key: "customer", render: (row) => row.customer }, { header: "Proyek / Unit", key: "projectUnit", render: (row) => row.projectUnit },
  { header: "Bank", key: "bank", render: (row) => row.bank }, { header: "Stage", key: "stage", render: (row) => row.stage },
  { header: "Document Status", key: "documentStatus", render: (row) => <Status label={row.documentStatus} variant="neutral" /> },
  { header: "Finance Status", key: "financeStatus", render: (row) => <Status label={row.financeStatus} variant="neutral" /> },
  { header: "Legal Status", key: "legalStatus", render: (row) => <Status label={row.legalStatus} variant="neutral" /> },
  { header: "SP3K", key: "sp3k", render: (row) => <Status label={row.sp3k} variant="neutral" /> }, { header: "Akad", key: "akad", render: (row) => <Status label={row.akad} variant="neutral" /> },
  { header: "Penanggung Jawab", key: "owner", render: (row) => row.owner }, { header: "Tindakan Berikutnya", key: "nextAction", render: (row) => row.nextAction },
];

function kprDetailItems(row: KprRow) {
  return [
    { label: "Rekaman", value: row.recordId }, { label: "Pelanggan", value: row.customer }, { label: "Proyek / Unit", value: row.projectUnit },
    { label: "Bank", value: row.bank }, { label: "Stage", value: row.stage }, { label: "Document", value: row.documentStatus },
    { label: "Finance", value: row.financeStatus }, { label: "Legal", value: row.legalStatus }, { label: "SP3K", value: row.sp3k }, { label: "Akad", value: row.akad },
    { label: "Tindakan Berikutnya", value: row.nextAction },
  ];
}
