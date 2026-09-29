"use client";

import { Button, Dialog as UiDialog, FormField, PageHeader, Section, Tabs } from "@/components/ui";
import { useState } from "react";

import { ItLayout } from "../it-layout";
import { ItSourceStateView, ItUnavailableAction } from "../shared/it-ui";
import styles from "../it.module.css";

export type ItModule = "services" | "systems" | "infrastructure" | "alos-genesis" | "integrations" | "access" | "security" | "changes" | "assets" | "support";

type ModuleConfig = { readonly title: string; readonly description: string; readonly columns: readonly string[]; readonly tabs: readonly string[]; readonly action?: string };

const configs: Record<ItModule, ModuleConfig> = {
  services: { title: "Layanan & Insiden", description: "Pantau layanan dan insiden IT tanpa menyimpulkan status dari ketiadaan data.", columns: ["Layanan", "Status Layanan", "Penanggung Jawab", "Pembaruan Terakhir", "Sumber"], tabs: ["Layanan", "Insiden", "Problem / Root Cause", "Permintaan", "Riwayat"], action: "Catat Insiden" },
  systems: { title: "Sistem & Aplikasi", description: "Daftar sistem dan aplikasi yang dapat diakses dari ruang kerja IT.", columns: ["Sistem / Aplikasi", "Penanggung Jawab", "Versi", "Status", "Sumber"], tabs: ["Semua", "Produksi", "Uji", "Riwayat"] },
  infrastructure: { title: "Infrastruktur & Lingkungan", description: "Kesiapan infrastruktur dan lingkungan menunggu sumber teknis resmi.", columns: ["Komponen", "Lingkungan", "Lokasi", "Status", "Sumber"], tabs: ["Komponen", "Lingkungan", "Insiden", "Riwayat"] },
  "alos-genesis": { title: "ALOS & GENESIS", description: "Pantau komponen platform dan kesiapan integrasi tanpa menampilkan rahasia sistem.", columns: ["Komponen", "Fungsi", "Versi", "Status", "Sumber"], tabs: ["ALOS", "GENESIS", "Kapasitas", "Riwayat"] },
  integrations: { title: "Integrasi & Connector", description: "Daftar koneksi sistem yang terdaftar; rahasia akses tidak pernah ditampilkan.", columns: ["Integrasi", "Arah", "Sistem Terkait", "Status", "Sumber"], tabs: ["Semua", "Aktif", "Perlu Perhatian", "Riwayat"] },
  access: { title: "Akses & Identitas", description: "Kelola kesiapan akses berdasarkan sumber identitas dan ruang kerja resmi.", columns: ["Karyawan", "Ruang Kerja", "Peran", "Status Akses", "Sumber"], tabs: ["Akun", "Ruang Kerja", "Peran", "Riwayat"], action: "Ajukan Akses" },
  security: { title: "Keamanan & Kepatuhan", description: "Status kontrol keamanan dan kepatuhan belum disimpulkan sebelum sumber resmi tersedia.", columns: ["Kontrol", "Area", "Status Pemeriksaan", "Penanggung Jawab", "Sumber"], tabs: ["Kontrol", "Kejadian", "Sesi", "Review", "Riwayat"] },
  changes: { title: "Perubahan & Rilis", description: "Catatan perubahan dan rilis ditampilkan setelah sumber change management terhubung.", columns: ["Perubahan", "Dampak", "Penanggung Jawab", "Jadwal", "Status"], tabs: ["Direncanakan", "Berjalan", "Selesai", "Riwayat"] },
  assets: { title: "Aset IT", description: "Katalog aset IT menunggu sumber aset resmi; kepemilikan dan kondisi tidak ditebak dari URL.", columns: ["Aset", "Jenis", "Penanggung Jawab", "Lokasi", "Status"], tabs: ["Semua", "Ditugaskan", "Perlu Perhatian", "Riwayat"] },
  support: { title: "Dukungan & Permintaan", description: "Permintaan dukungan IT dan prioritasnya akan tampil setelah sumber dukungan tersedia.", columns: ["Permintaan", "Kategori", "Prioritas", "Penanggung Jawab", "Status"], tabs: ["Terbuka", "Saya", "Selesai", "Riwayat"] },
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
  if (tab === "Riwayat") return ["Objek", "Tanggal", "Perubahan", "Sumber", "Status"];
  if (tab === "Insiden") return ["Insiden", "Dampak", "Penanggung Jawab", "Dibuka", "Status"];
  if (tab === "Permintaan") return ["Permintaan", "Pemohon", "Kategori", "Tenggat", "Status"];
  if (tab === "Ruang Kerja") return ["Ruang Kerja", "Akun", "Peran", "Berlaku", "Status Akses"];
  if (tab === "Peran") return ["Peran", "Cakupan", "Persetujuan", "Sumber", "Status"];
  if (tab === "Kejadian") return ["Kejadian", "Waktu", "Dampak", "Penanganan", "Status"];
  if (tab === "Sesi") return ["Perangkat", "Peramban", "Dibuat", "Aktivitas Terakhir", "Status"];
  if (tab === "Problem / Root Cause") return ["Problem", "Layanan Terdampak", "Penyebab", "Penanggung Jawab", "Status"];
  return config.columns;
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
