"use client";

import { useEffect, useState } from "react";
import { Button, DataTable, Metric, PageHeader, Section, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { BusinessTarget } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { HrDataPage, type HrTab } from "./shared/hr-data-page";
import { HrLayout } from "./hr-layout";
import { HrExtractionDrawer, HrSourceStateView, HrSourceStrip, HrStatusDrawer, HrUnavailableFormDrawer, type HrFormField } from "./shared/hr-ui";
import styles from "./hr.module.css";

type HrRow = { readonly id: string; readonly first: string; readonly second: string; readonly third: string; readonly status: string };
const columns: readonly DataTableColumn<HrRow>[] = [
  { header: "Item", key: "first", render: (row) => row.first },
  { header: "Rincian", key: "second", render: (row) => row.second },
  { header: "Penanggung Jawab", key: "third", render: (row) => row.third },
  { header: "Status", key: "status", render: (row) => row.status },
];
function moduleColumns(headers: readonly string[]): readonly DataTableColumn<HrRow>[] {
  const keys: readonly (keyof HrRow)[] = ["first", "second", "third", "status"];
  return headers.map((header, index) => ({ header, key: keys[index], render: (row: HrRow) => row[keys[index]] }));
}
const emptyRows: readonly HrRow[] = [];

const formFields: Record<string, readonly HrFormField[]> = {
  organization: [{ label: "Jabatan *", name: "position", relation: true, required: true }, { label: "Unit Organisasi *", name: "organization", relation: true, required: true }, { label: "Atasan", name: "manager", relation: true }, { label: "Jumlah Kebutuhan", name: "headcount", type: "number" }],
  recruitment: [{ label: "Posisi *", name: "position", relation: true, required: true }, { label: "Nama Kandidat", name: "candidate" }, { label: "Sumber Kandidat", name: "source", select: true }, { label: "Catatan", name: "notes", type: "textarea" }],
  vacancy: [{ label: "Posisi *", name: "position", relation: true, required: true }, { label: "Ruang Lingkup", name: "scope", relation: true }, { label: "Tenggat", name: "deadline", type: "date" }, { label: "Deskripsi", name: "description", type: "textarea" }],
  interview: [{ label: "Kandidat *", name: "candidate", relation: true, required: true }, { label: "Jadwal *", name: "scheduled_at", type: "date", required: true }, { label: "Penilai", name: "reviewer", relation: true }, { label: "Catatan", name: "notes", type: "textarea" }],
  offer: [{ label: "Kandidat *", name: "candidate", relation: true, required: true }, { label: "Posisi *", name: "position", relation: true, required: true }, { label: "Tanggal Penawaran", name: "offer_date", type: "date" }, { label: "Catatan", name: "notes", type: "textarea" }],
  onboarding: [{ label: "Karyawan *", name: "employee", relation: true, required: true }, { label: "Tanggal Mulai *", name: "start_date", type: "date", required: true }, { label: "Pendamping", name: "buddy", relation: true }, { label: "Catatan", name: "notes", type: "textarea" }],
  employees: [{ label: "Karyawan *", name: "employee", relation: true, required: true }, { label: "Jenis Perubahan *", name: "change_type", select: true, required: true }, { label: "Tanggal Berlaku", name: "effective_date", type: "date" }, { label: "Alasan", name: "reason", type: "textarea" }],
  attendance: [{ label: "Karyawan *", name: "employee", relation: true, required: true }, { label: "Jenis Pengajuan *", name: "request_type", select: true, required: true }, { label: "Periode Mulai *", name: "starts_at", type: "date", required: true }, { label: "Periode Selesai", name: "ends_at", type: "date" }, { label: "Bukti Pendukung", name: "evidence", type: "textarea" }],
  peoplePerformance: [{ label: "Karyawan *", name: "employee", relation: true, required: true }, { label: "Periode *", name: "period", relation: true, required: true }, { label: "Peninjau", name: "reviewer", relation: true }, { label: "Catatan", name: "notes", type: "textarea" }],
  compensation: [{ label: "Karyawan *", name: "employee", relation: true, required: true }, { label: "Jenis Perubahan *", name: "change_type", select: true, required: true }, { label: "Tanggal Berlaku *", name: "effective_date", type: "date", required: true }, { label: "Bukti Pendukung", name: "evidence", type: "textarea" }],
  compliance: [{ label: "Karyawan / Objek *", name: "subject", relation: true, required: true }, { label: "Jenis Dokumen *", name: "document_type", select: true, required: true }, { label: "Tanggal Berlaku", name: "effective_date", type: "date" }, { label: "Dokumen Pendukung", name: "document", relation: true }, { label: "Catatan", name: "notes", type: "textarea" }],
  offboarding: [{ label: "Karyawan *", name: "employee", relation: true, required: true }, { label: "Jenis Perubahan *", name: "change_type", select: true, required: true }, { label: "Tanggal Efektif", name: "effective_date", type: "date" }, { label: "Catatan", name: "notes", type: "textarea" }],
  ga: [{ label: "Pemohon *", name: "requester", relation: true, required: true }, { label: "Jenis Fasilitas *", name: "facility_type", select: true, required: true }, { label: "Lokasi", name: "location", relation: true }, { label: "Kebutuhan", name: "need", type: "textarea" }],
};

const moduleConfig: Record<string, { readonly title: string; readonly eyebrow: string; readonly description: string; readonly tabs: readonly string[]; readonly action: string; readonly fields: string; readonly headers: readonly string[] }> = {
  organization: { title: "Organisasi & Tenaga Kerja", eyebrow: "PUSAT SDM", description: "Pantau struktur organisasi, kebutuhan tenaga kerja, dan penanggung jawab tanpa menyimpulkan data yang belum tersedia.", tabs: ["Struktur Organisasi", "Kebutuhan Tenaga Kerja", "Posisi", "Riwayat"], action: "Siapkan Posisi", fields: "organization", headers: ["Unit Organisasi", "Posisi", "Kebutuhan", "Status"] },
  recruitment: { title: "Rekrutmen & Kandidat", eyebrow: "TALENTA", description: "Kelola kesiapan proses rekrutmen dan kandidat tanpa menyimpulkan status keputusan yang belum tersedia.", tabs: ["Lowongan", "Kandidat", "Interview", "Penawaran", "Riwayat"], action: "Tambah Kandidat", fields: "recruitment", headers: ["Kandidat / Lowongan", "Posisi", "Tahap", "Status"] },
  onboarding: { title: "Onboarding & Masa Percobaan", eyebrow: "TALENTA", description: "Pantau kesiapan onboarding, checklist, dan masa percobaan dari sumber SDM resmi.", tabs: ["Berjalan", "Masa Percobaan", "Selesai", "Riwayat"], action: "Mulai Onboarding", fields: "onboarding", headers: ["Karyawan", "Tanggal Mulai", "Masa Percobaan", "Status"] },
  employees: { title: "Karyawan", eyebrow: "TALENTA", description: "Data karyawan ditampilkan sesuai kewenangan dan klasifikasi informasi yang berlaku.", tabs: ["Semua", "Aktif", "Cuti", "Kontrak", "Perubahan", "Riwayat"], action: "Catat Perubahan", fields: "employees", headers: ["Nama Karyawan", "Posisi", "Unit", "Status"] },
  attendance: { title: "Kehadiran & Cuti", eyebrow: "OPERASIONAL SDM", description: "Pantau kehadiran dan pengajuan cuti tanpa mengarang catatan atau saldo cuti.", tabs: ["Hari Ini", "Kehadiran", "Cuti", "Koreksi", "Riwayat"], action: "Ajukan Koreksi", fields: "attendance", headers: ["Karyawan", "Periode", "Jenis", "Status"] },
  peoplePerformance: { title: "Kinerja & Pengembangan", eyebrow: "OPERASIONAL SDM", description: "Ruang kerja review dan pengembangan karyawan; target korporat tetap berada di Target & Kinerja.", tabs: ["Review", "Sasaran Individu", "Kompetensi", "Pengembangan", "Pelatihan", "Riwayat"], action: "Siapkan Review", fields: "peoplePerformance", headers: ["Karyawan", "Periode", "Peninjau", "Status"] },
  compensation: { title: "Kompensasi & Benefit", eyebrow: "OPERASIONAL SDM", description: "Tampilkan kesiapan kompensasi dan benefit tanpa membuka informasi sensitif tanpa kewenangan.", tabs: ["Ringkasan", "Benefit", "Perubahan", "Riwayat"], action: "Ajukan Perubahan", fields: "compensation", headers: ["Karyawan", "Jenis Perubahan", "Periode", "Status"] },
  compliance: { title: "Dokumen & Kepatuhan", eyebrow: "OPERASIONAL SDM", description: "Pantau dokumen dan persyaratan kepatuhan SDM dengan klasifikasi yang sesuai.", tabs: ["Persyaratan", "Dokumen", "Mendekati Tenggat", "Riwayat"], action: "Tambah Persyaratan", fields: "compliance", headers: ["Persyaratan", "Dokumen", "Tenggat", "Status"] },
  offboarding: { title: "Perubahan & Offboarding", eyebrow: "OPERASIONAL SDM", description: "Pantau perubahan status dan kesiapan offboarding tanpa menyimpulkan akses atau penyelesaian akhir.", tabs: ["Berjalan", "Perubahan", "Checklist", "Selesai", "Riwayat"], action: "Mulai Offboarding", fields: "offboarding", headers: ["Karyawan", "Jenis Perubahan", "Tanggal", "Status"] },
  ga: { title: "GA & Fasilitas", eyebrow: "GA", description: "Pantau kesiapan fasilitas dan layanan umum pada ruang lingkup GA yang tersedia.", tabs: ["Fasilitas", "Permintaan", "Inventaris", "Pemeliharaan", "Riwayat"], action: "Ajukan Permintaan", fields: "ga", headers: ["Permintaan", "Fasilitas", "Lokasi", "Status"] },
};

export function HrModulePage({ module, workspaceKey }: Readonly<{ module: keyof typeof moduleConfig; workspaceKey?: string }>) {
  const config = moduleConfig[module];
  const tabs: readonly HrTab<HrRow>[] = config.tabs.map((label) => ({ id: label, label, title: `${config.title} — ${label}`, description: config.description, caption: `${label} ${config.title}`, columns: moduleColumns(config.headers), emptyDescription: `Data ${label.toLowerCase()} belum tersedia dari sumber SDM resmi.`, rows: emptyRows, state: "unavailable", actions: <div><HrAction label={actionFor(module, label, config.action)} fields={formFields[fieldsFor(module, label, config.fields)]} title={actionFor(module, label, config.action)} />{module === "compliance" ? <HrExtractionAction /> : null}</div> }));
  return <HrDataPage description={config.description} eyebrow={config.eyebrow} tabs={tabs} title={config.title} workspaceKey={workspaceKey} requireGa={module === "ga"} />;
}

function HrAction({ fields, label, title }: Readonly<{ fields: readonly HrFormField[]; label: string; title: string }>) {
  const [open, setOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)} size="sm" variant="secondary">{label}</Button><HrUnavailableFormDrawer description="Form ini menyiapkan struktur kerja. Pilihan sumber dan penyimpanan belum tersedia." fields={fields} onClose={() => setOpen(false)} open={open} title={title} /></>;
}
function actionFor(module: keyof typeof moduleConfig, tab: string, fallback: string): string {
  if (module === "recruitment") return tab === "Lowongan" ? "Siapkan Lowongan" : tab === "Interview" ? "Jadwalkan Interview" : tab === "Penawaran" ? "Siapkan Penawaran" : "Tambah Kandidat";
  if (module === "onboarding") return tab === "Masa Percobaan" ? "Catat Masa Percobaan" : fallback;
  if (module === "attendance") return tab === "Cuti" ? "Ajukan Cuti" : fallback;
  return fallback;
}
function fieldsFor(module: keyof typeof moduleConfig, tab: string, fallback: string): string {
  if (module === "recruitment") return tab === "Lowongan" ? "vacancy" : tab === "Interview" ? "interview" : tab === "Penawaran" ? "offer" : fallback;
  return fallback;
}
function HrExtractionAction() {
  const [open, setOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)} size="sm" variant="ghost">Ambil/Telaah dari Dokumen</Button><HrExtractionDrawer onClose={() => setOpen(false)} open={open} /></>;
}

export function HrSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <HrLayout workspaceKey={workspaceKey}>{(session) => <HrSummary session={session} />}</HrLayout>; }
function HrSummary({ session }: Readonly<{ session: SessionProjection }>) {
  const [statusOpen, setStatusOpen] = useState(false);
  const workspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  const ga = workspace?.division_code?.toUpperCase() === "HR_GA" || workspace?.division_code?.toUpperCase() === "HRGA";
  const metrics = ["Karyawan Aktif", "Posisi Terbuka", "Kandidat Aktif", "Onboarding Berjalan", "Kontrak Mendekati Tenggat", "Cuti Menunggu"];
  const secondary = ["Masa Percobaan", "Dokumen Tidak Lengkap", "Review Kinerja Menunggu", "Offboarding Berjalan"];
  const base = workspace ? `/workspace/${encodeURIComponent(workspace.workspace_key)}` : "/workspace";
  return <div className={styles.page}><PageHeader description="Ringkasan tenaga kerja, talenta, kehadiran, pengembangan, dan kesiapan operasional SDM." eyebrow={ga ? "HR / GA" : "HR"} metadata={`Workspace aktif: ${workspace?.workspace_name ?? "—"}`} title={ga ? "HR / GA" : "HR"} /><div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Workspace" value={workspace?.workspace_name ?? "—"} /><ContextItem label="Status Data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div><HrSourceStrip onStatus={() => setStatusOpen(true)} /><section aria-label="Indikator utama SDM" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section><Section title="Indikator Operasional"><DataTable caption="Indikator operasional SDM" columns={columns} rows={secondary.map((item) => ({ id: item, first: item, second: "—", third: "—", status: "Belum Terhubung" }))} /></Section><div className={styles.summaryGrid}><Readiness title="Kondisi Tenaga Kerja" description="Data struktur dan tenaga kerja belum tersedia." /><Readiness title="Perhatian Talenta" description="Data rekrutmen dan onboarding belum tersedia." /><Readiness title="Dokumen & Kepatuhan" description="Data dokumen kepatuhan SDM belum tersedia." /><Section actions={<a href={`${base}/approvals`}>Lihat Semua Persetujuan</a>} title="Persetujuan SDM"><HrSourceStateView description="Persetujuan SDM belum tersedia." state="unavailable" /></Section></div><HrStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} /></div>;
}
function Readiness({ description, title }: Readonly<{ description: string; title: string }>) { return <Section title={title}><HrSourceStateView description={description} state="unavailable" /></Section>; }
function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }

export function HrPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <HrLayout workspaceKey={workspaceKey}>{(session) => <HrPerformance session={session} />}</HrLayout>; }
function HrPerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const tabs: readonly TabItem[] = ["Ringkasan", "Target", "KPI", "Riwayat"].map((label) => ({ id: label, label }));
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const [targets, setTargets] = useState<readonly BusinessTarget[]>([]);
  const [strategyState, setStrategyState] = useState<"loading" | "error" | "connected-empty" | "connected-data">("loading");
  const workspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  useEffect(() => { let cancelled = false; void strategyApi.listTargets().then((nextTargets) => { if (cancelled) return; setTargets(nextTargets); setStrategyState(nextTargets.length === 0 ? "connected-empty" : "connected-data"); }).catch(() => { if (!cancelled) setStrategyState("error"); }); return () => { cancelled = true; }; }, []);
  const strategyRows = targets.filter((target) => target.observations?.some((observation) => observation.kind === "TARGET")).map((target) => ({ id: target.target_id, first: target.name, second: formatHrPeriod(target.period), third: targetValue(target), status: "Belum Dinilai" }));
  const targetContent = strategyState === "connected-data" ? <DataTable caption="Target Strategi untuk SDM" columns={columns} rows={strategyRows} /> : <HrSourceStateView description={strategyState === "error" ? "Data Strategi belum dapat dimuat." : strategyState === "connected-empty" ? "Belum ada target Strategi." : "Target Strategi sedang dimuat."} state={strategyState} />;
  return <div className={styles.page}><PageHeader description="Target dan kinerja SDM menggunakan target Strategi bila tersedia; aktual HR dan perkiraan tetap terpisah." eyebrow="KINERJA" metadata={`Workspace aktif: ${workspace?.workspace_name ?? "—"}`} title={`Target & Kinerja${activeTab === "Ringkasan" ? "" : ` — ${activeTab}`}`} /><HrSourceStrip sources={["strategy", "employees", "performance"]} statuses={{ strategy: strategyState, employees: "unavailable", performance: "unavailable" }} /><Tabs ariaLabel="Navigasi target dan kinerja SDM" items={tabs} onValueChange={setActiveTab} value={activeTab} /><Section description="Target berasal dari Strategi. Aktual HR dan perkiraan HR tetap — sampai sumber HR tersedia." title={activeTab}>{activeTab === "Ringkasan" || activeTab === "Target" ? targetContent : <HrSourceStateView description={`Data ${activeTab} SDM belum tersedia.`} state="unavailable" />}</Section><Section title="Aktual dan Perkiraan SDM"><HrSourceStateView description="Data aktual dan perkiraan SDM belum tersedia." state="unavailable" /></Section></div>;
}

function formatHrPeriod(period: BusinessTarget["period"] | null | undefined): string {
  if (!period) return "—";
  if (period.label?.trim()) return period.label;
  const startsAt = new Date(period.starts_at);
  const endsAt = new Date(period.ends_at);
  if (Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf())) return "Belum Dinilai";
  const formatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
  return `${formatter.format(startsAt)} – ${formatter.format(endsAt)}`;
}
function targetValue(target: BusinessTarget): string {
  const observation = target.observations?.find((candidate) => candidate.kind === "TARGET");
  if (observation?.value === null || observation?.value === undefined) return "—";
  if (typeof observation.value === "number") return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(observation.value);
  if (typeof observation.value === "boolean") return observation.value ? "Ya" : "Tidak";
  return String(observation.value);
}
