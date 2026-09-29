"use client";

import { Button, Dialog as UiDialog, FormField, PageHeader, Section, Tabs } from "@/components/ui";
import { useState } from "react";

import { ItLayout } from "../it-layout";
import { ItSourceStateView, ItUnavailableAction } from "../shared/it-ui";
import styles from "../it.module.css";

export type ItModule = "services" | "systems" | "infrastructure" | "alos-genesis" | "integrations" | "access" | "security" | "changes" | "assets" | "support";

type ModuleConfig = {
  readonly title: string;
  readonly description: string;
  readonly tabs: readonly string[];
  readonly columnsByTab: Readonly<Record<string, readonly string[]>>;
  readonly action?: string;
};

const historyColumns = ["Objek", "Tanggal", "Perubahan", "Sumber", "Status"] as const;

const configs: Record<ItModule, ModuleConfig> = {
  services: {
    title: "Layanan & Insiden",
    description: "Pantau layanan, insiden, dan akar masalah tanpa menyimpulkan status dari ketiadaan data.",
    tabs: ["Layanan", "Insiden", "Problem / Root Cause", "Permintaan", "Riwayat"],
    columnsByTab: {
      Layanan: ["Nama Layanan", "Kategori", "Penanggung Jawab", "Sistem Terkait", "Lingkungan", "Status", "Availability", "Insiden Terakhir", "Pemeriksaan Terakhir", "Sumber"],
      Insiden: ["ID", "Judul", "Layanan Terdampak", "Severity", "Status", "Penanggung Jawab", "Mulai", "Durasi", "Dampak", "Root Cause", "Bukti"],
      "Problem / Root Cause": ["Problem", "Layanan Terdampak", "Insiden Terkait", "Penyebab", "Tindakan Korektif", "Penanggung Jawab", "Status"],
      Permintaan: ["Permintaan", "Pemohon", "Kategori", "Prioritas", "Penanggung Jawab", "Tenggat", "Status"],
      Riwayat: historyColumns,
    },
    action: "Catat Insiden",
  },
  systems: {
    title: "Sistem & Aplikasi",
    description: "Inventaris sistem dan aplikasi tanpa menampilkan rahasia atau kredensial.",
    tabs: ["Semua", "Produksi", "Staging / Uji", "Tidak Aktif", "Riwayat"],
    columnsByTab: {
      default: ["Nama Sistem", "Jenis", "Penanggung Jawab", "Lingkungan", "Versi", "Repository", "Service", "Status", "Health", "Dependency", "Deployment Terakhir", "Sumber"],
      Riwayat: historyColumns,
    },
  },
  infrastructure: {
    title: "Infrastruktur & Lingkungan",
    description: "Kapasitas dan kondisi infrastruktur menunggu sumber observability resmi; nilai teknis tidak dibuat oleh UI.",
    tabs: ["Ringkasan", "Compute", "Database", "Storage", "Network", "Backup", "Monitoring", "Riwayat"],
    columnsByTab: {
      default: ["Lingkungan", "Provider", "Resource", "Region / Lokasi", "Service", "Status", "Health", "Capacity", "Usage", "Status Backup", "Backup Terakhir", "Status Monitoring", "Penanggung Jawab", "Bukti", "Sumber"],
      Riwayat: historyColumns,
    },
  },
  "alos-genesis": {
    title: "ALOS & GENESIS",
    description: "Kesiapan platform, runtime, capability, dan provider tanpa menampilkan kredensial atau angka penggunaan buatan.",
    tabs: ["ALOS", "GENESIS", "Runtime", "Capability", "Provider", "Evaluasi", "Penggunaan", "Riwayat"],
    columnsByTab: {
      ALOS: ["Komponen", "Repository", "Versi", "Lingkungan", "Status", "Deployment Terakhir", "Health"],
      GENESIS: ["Komponen", "Fungsi", "Runtime", "Versi", "Status", "Pemeriksaan Terakhir", "Sumber"],
      Runtime: ["Runtime Engine", "Lingkungan", "Status", "Run Aktif", "Run Gagal", "Queue / Workload", "Health"],
      Capability: ["Capability", "Jenis", "Versi", "Lifecycle", "Penanggung Jawab", "Runtime", "Evaluasi Terakhir", "Status Rilis"],
      Provider: ["Provider", "Model", "Tujuan", "Status", "Status Kredensial", "Pemeriksaan Terakhir"],
      Evaluasi: ["Evaluasi", "Capability / Agent", "Versi", "Hasil", "Bukti", "Tanggal", "Status"],
      Penggunaan: ["Provider", "Model", "Requests", "Tokens", "Biaya", "Periode", "Sumber"],
      Riwayat: historyColumns,
    },
  },
  integrations: {
    title: "Integrasi & Connector",
    description: "Koneksi sistem dan jenis autentikasi dapat ditampilkan, tetapi nilai kredensial tidak pernah ditampilkan.",
    tabs: ["Semua", "Internal", "Eksternal", "Aktif", "Perlu Perhatian", "Riwayat"],
    columnsByTab: {
      default: ["Connector", "Kategori", "Sistem Sumber", "Tujuan", "Arah", "Penanggung Jawab", "Lingkungan", "Status", "Sinkronisasi Terakhir", "Berhasil Terakhir", "Error Terakhir", "Jenis Autentikasi", "Sumber"],
      Riwayat: historyColumns,
    },
  },
  access: {
    title: "Akses & Identitas",
    description: "Permintaan akses, membership, role, dan revokasi tetap terpisah dari pengelolaan data karyawan HR.",
    tabs: ["Permintaan Akses", "Keanggotaan Workspace", "Penetapan Peran", "Joiner", "Mover", "Leaver", "Sesi / Revokasi", "Audit"],
    columnsByTab: {
      "Permintaan Akses": ["Permintaan", "Pemohon", "Workspace / Sistem", "Akses Diminta", "Alasan", "Persetujuan", "Status"],
      "Keanggotaan Workspace": ["Workspace", "Akun", "Peran", "Cakupan", "Berlaku", "Status Akses"],
      "Penetapan Peran": ["Peran", "Akun", "Cakupan", "Persetujuan", "Sumber", "Status"],
      Joiner: ["Karyawan", "Akun", "Workspace", "Akses Awal", "Status"],
      Mover: ["Karyawan", "Perubahan Organisasi", "Akses Lama", "Akses Baru", "Status Review"],
      Leaver: ["Karyawan", "Hari Kerja Terakhir", "Akses Saat Ini", "Status Revokasi", "Penanggung Jawab"],
      "Sesi / Revokasi": ["Akun", "Sesi", "Dibuat", "Aktivitas Terakhir", "Status Revokasi"],
      Audit: historyColumns,
    },
    action: "Ajukan Akses",
  },
  security: {
    title: "Keamanan & Kepatuhan",
    description: "Status kontrol, kejadian, dan kerentanan tidak disimpulkan sebelum sumber resmi tersedia.",
    tabs: ["Kontrol", "Kejadian", "Kerentanan", "Sesi", "Review", "Audit", "Riwayat"],
    columnsByTab: {
      default: ["Kontrol", "Area", "Sistem", "Severity", "Status", "Penanggung Jawab", "Bukti", "Review Terakhir", "Sumber"],
      Riwayat: historyColumns,
    },
  },
  changes: {
    title: "Perubahan & Rilis",
    description: "Perubahan produksi tetap governed; UI tidak menetapkan state rilis secara mandiri.",
    tabs: ["Change", "Release", "Deployment", "Rollback", "Riwayat"],
    columnsByTab: {
      Change: ["Change ID", "Judul", "Sistem", "Lingkungan", "Risiko", "Penanggung Jawab", "Jadwal", "Status", "Persetujuan"],
      Release: ["Release", "Versi", "Komponen", "Lingkungan", "Status", "Disetujui Oleh", "Waktu Rilis"],
      Deployment: ["Komponen", "Versi", "Lingkungan", "Mulai", "Selesai", "Status", "Korelasi"],
      Rollback: ["Release", "Alasan", "Diminta Oleh", "Keputusan", "Status", "Mulai", "Selesai"],
      Riwayat: historyColumns,
    },
  },
  assets: {
    title: "Aset IT",
    description: "Katalog aset IT terpisah dari aset Legal dan menunggu sumber aset resmi.",
    tabs: ["Semua", "Ditugaskan", "Tersedia", "Perlu Perhatian", "Riwayat"],
    columnsByTab: {
      default: ["Aset", "Kode Aset", "Jenis", "Pengguna", "Workspace", "Lokasi", "Kondisi", "Status", "Tanggal Perolehan", "Garansi", "Penanggung Jawab", "Sumber"],
      Riwayat: historyColumns,
    },
  },
  support: {
    title: "Dukungan & Permintaan",
    description: "Permintaan dukungan akan tampil setelah sumber resmi tersedia; scope Tim belum diasumsikan oleh UI.",
    tabs: ["Terbuka", "Milik Saya", "Tim", "Selesai", "Riwayat"],
    columnsByTab: {
      default: ["Permintaan", "Pemohon", "Kategori", "Prioritas", "Penanggung Jawab", "SLA", "Dibuat", "Tenggat", "Status", "Sistem Terkait", "Aset Terkait"],
      Riwayat: historyColumns,
    },
  },
};

export function ItModulePage({ module, workspaceKey }: Readonly<{ module: ItModule; workspaceKey?: string }>) {
  const config = configs[module];
  const [activeTab, setActiveTab] = useState(config.tabs[0]);
  const [accessRequestOpen, setAccessRequestOpen] = useState(false);
  const columns = columnsForTab(config, activeTab);
  return <ItLayout workspaceKey={workspaceKey}>{() => <div className={styles.page}>
    <PageHeader description={config.description} eyebrow="OPERASIONAL IT" title={config.title} />
    <Tabs ariaLabel={`Navigasi ${config.title}`} items={config.tabs.map((label) => ({ id: label, label }))} onValueChange={setActiveTab} value={activeTab} />
    <Section actions={module === "access" ? <Button onClick={() => setAccessRequestOpen(true)} variant="secondary">Ajukan Akses</Button> : config.action ? <ItUnavailableAction label={config.action} /> : undefined} description={`Tampilan ${activeTab}; status final menunggu sumber IT resmi.`} title={activeTab}>
      <ul aria-label={`Kolom ${activeTab}`} className={styles.moduleColumns}>{columns.map((column) => <li className={styles.moduleColumn} key={column}>{column}</li>)}</ul>
      <div style={{ marginTop: "var(--alos-space-3)" }}><ItSourceStateView description={`Sumber data ${activeTab.toLowerCase()} belum terhubung. Tidak ada data operasional yang dibuat oleh antarmuka.`} state="unavailable" title={activeTab} /></div>
    </Section>
    {module === "access" ? <IdentityFlowReadiness /> : null}
    {module === "access" ? <AccessRequestReadinessDialog onClose={() => setAccessRequestOpen(false)} open={accessRequestOpen} /> : null}
  </div>}</ItLayout>;
}

function columnsForTab(config: ModuleConfig, tab: string): readonly string[] {
  return config.columnsByTab[tab] ?? config.columnsByTab.default ?? [];
}

function IdentityFlowReadiness() {
  const queues = [
    ["JOINER", "Karyawan HR", "Kandidat penyediaan akun", "Ruang kerja dan role"],
    ["MOVER", "Perubahan divisi HR", "Review akses lama", "Permintaan akses baru"],
    ["LEAVER", "Offboarding HR", "Kebutuhan pencabutan", "Verifikasi pencabutan"],
  ] as const;
  return <><Section title="Siklus Joiner / Mover / Leaver"><div className={styles.flowGrid}>{queues.map(([name, trigger, firstStep, nextStep]) => <div className={styles.flowCard} key={name}><strong>{name}</strong><span>{trigger}</span><span>{firstStep}</span><span>{nextStep}</span><ItSourceStateView description="Belum ada sumber proses yang terhubung." state="unavailable" title="Status" /></div>)}</div></Section><Section title="Antrian Revokasi Leaver"><ul aria-label="Kolom antrian revokasi leaver" className={styles.moduleColumns}>{["Karyawan", "Hari Kerja Terakhir", "Akses Saat Ini", "Sistem", "Aset Ditugaskan", "Status Revokasi", "Penanggung Jawab"].map((column) => <li className={styles.moduleColumn} key={column}>{column}</li>)}</ul><ItSourceStateView description="Data offboarding dan akses leaver belum tersedia." state="unavailable" title="Antrian Revokasi" /></Section></>;
}

function AccessRequestReadinessDialog({ onClose, open }: Readonly<{ onClose: () => void; open: boolean }>) {
  return <UiDialog description="Permintaan akses memerlukan review dan persetujuan resmi. Approved tidak berarti provisioned." footer={<><Button onClick={onClose} variant="secondary">Tutup</Button><Button disabled type="button">Permintaan belum tersedia</Button></>} onClose={onClose} open={open} size="lg" title="Ajukan Akses">
    <form onSubmit={(event) => event.preventDefault()}><div className={styles.formGrid}>
      <FormField htmlFor="access-request-user" label="User" required><select className={styles.formControl} disabled id="access-request-user"><option>Pilihan user belum tersedia.</option></select></FormField>
      <FormField htmlFor="access-request-scope" label="Workspace / Sistem" required><select className={styles.formControl} disabled id="access-request-scope"><option>Pilihan workspace atau sistem belum tersedia.</option></select></FormField>
      <FormField htmlFor="access-request-role" label="Role / Akses yang Diminta" required><select className={styles.formControl} disabled id="access-request-role"><option>Pilihan role atau akses belum tersedia.</option></select></FormField>
      <div className={styles.formFull}><FormField htmlFor="access-request-reason" label="Alasan" required><textarea className={styles.formControl} id="access-request-reason" placeholder="Jelaskan kebutuhan akses" required rows={3} /></FormField></div>
      <FormField htmlFor="access-request-duration" label="Durasi"><input className={styles.formControl} id="access-request-duration" placeholder="Contoh: sampai tanggal tertentu" /></FormField>
      <FormField htmlFor="access-request-evidence" label="Bukti Pendukung"><input className={styles.formControl} id="access-request-evidence" placeholder="Nomor arsip atau tautan referensi" /></FormField>
    </div><p className={styles.formHint}>Request, review, approval, provisioning, dan verification belum memiliki lifecycle canonical.</p></form>
  </UiDialog>;
}
