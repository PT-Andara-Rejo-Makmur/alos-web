"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DataTable, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertyExtractionReviewDrawer, PropertyFilterBar, PropertySelect, PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [{ id: "inspection", label: "Inspeksi" }, { id: "action", label: "Menunggu Tindakan" }, { id: "history", label: "Riwayat" }];
interface InspectionRow { readonly recordId: string; readonly project: string; readonly type: string; readonly date: string; readonly result: string; readonly finding: string; readonly status: string; }
const inspectionRows: readonly InspectionRow[] = [];
const inspectionColumns: readonly DataTableColumn<InspectionRow>[] = [
  { header: "Proyek", key: "project", render: (row) => row.project }, { header: "Jenis Inspeksi", key: "type", render: (row) => row.type },
  { header: "Tanggal", key: "date", render: (row) => row.date }, { header: "Hasil", key: "result", render: (row) => row.result },
  { header: "Temuan", key: "finding", render: (row) => row.finding }, { header: "Status", key: "status", render: (row) => row.status },
];
const inspectionFields: readonly PropertyFormField[] = [{ label: "Proyek *", name: "project" }, { label: "Unit / Work Package *", name: "unit-work-package" }, { label: "Jenis Inspeksi *", name: "inspection-type" }, { label: "Tanggal *", name: "date", type: "date" }, { label: "Inspektur *", name: "inspector" }, { label: "Checklist", name: "checklist", type: "textarea" }, { label: "Hasil *", name: "result" }, { label: "Evidence *", name: "evidence" }, { label: "Catatan", name: "notes", type: "textarea" }];

export function PropertyQualityPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyQuality session={session} />}</PropertyLayout>; }

function PropertyQuality({ session }: Readonly<{ session: SessionProjection }>) {
  const router = useRouter();
  const [tab, setTab] = useState("inspection");
  const [filters, setFilters] = useState({ project: "all", result: "all", status: "all" });
  const [formOpen, setFormOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const base = activeKey ? `/workspace/${encodeURIComponent(activeKey)}` : "/workspace";
  return <div className={styles.page}>
    <PageHeader description="Inspeksi teknis dan kendali mutu Property dengan Temuan dan Tugas Shared Work." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Inspeksi & Kualitas" />
    <PropertySourceNote>Source mutu belum terhubung. Temuan menggunakan Shared Work Finding dan tindakan korektif menggunakan Shared Work Task.</PropertySourceNote>
    <Tabs ariaLabel="Tampilan mutu Property" items={tabs} onValueChange={setTab} value={tab} />
    <Section title="Filter Mutu"><PropertyFilterBar ariaLabel="Filter mutu Property"><PropertySelect label="Proyek" name="quality-project" onChange={(value) => setFilters((current) => ({ ...current, project: value }))} options={[["all", "Semua proyek"]]} value={filters.project} /><PropertySelect label="Hasil" name="quality-result" onChange={(value) => setFilters((current) => ({ ...current, result: value }))} options={[["all", "Semua hasil"]]} value={filters.result} /><PropertySelect label="Status" name="quality-status" onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[["all", "Semua status"]]} value={filters.status} /></PropertyFilterBar></Section>
    <Section title={tabs.find((item) => item.id === tab)?.label ?? "Inspeksi"}><DataTable caption="Inspeksi dan kualitas Property" columns={inspectionColumns} emptyState={<PropertyUnavailableState description="Inspeksi dan temuan mutu belum tersedia." />} getRowKey={(row) => row.recordId} rows={inspectionRows} rowAction={() => <Button disabled size="sm" variant="secondary">Buat Temuan</Button>} /></Section>
    <Section title="Alur Mutu"><div className={styles.flow} aria-label="Alur mutu">{["Inspeksi", "Temuan", "Tindakan Korektif", "Bukti", "Verifikasi", "Tutup"].map((step, index) => <div className={styles.flowStep} key={step}><span>{index + 1}</span>{step}</div>)}</div><PropertyUnavailableState description="Relasi inspeksi ke Temuan dan Tugas belum tersedia. Setelah source tersedia, tindakan akan tetap menggunakan Shared Work." /></Section>
    <div className={styles.actionBar}><Button onClick={() => setFormOpen(true)} variant="primary">Tambah Inspeksi</Button><Button disabled variant="secondary">Buat Temuan</Button><Button disabled variant="secondary">Buat Tindakan Korektif</Button><Button onClick={() => router.push(`${base}/findings`)} variant="ghost">Buka Temuan Shared Work</Button><Button onClick={() => router.push(`${base}/tasks`)} variant="ghost">Buka Tugas Shared Work</Button><Button onClick={() => setExtractionOpen(true)} variant="ghost">Ambil dari Dokumen</Button></div>
    <PropertyUnavailableFormDrawer description="Mutation inspeksi belum memiliki capability authoritative." fields={inspectionFields} onClose={() => setFormOpen(false)} open={formOpen} submitLabel="Simpan Inspeksi" title="Tambah Inspeksi" />
    <PropertyExtractionReviewDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} title="Ekstraksi Inspeksi" />
  </div>;
}
