"use client";

import { PageHeader, Section, Tabs } from "@/components/ui";
import { useState } from "react";

import { ItLayout } from "../it-layout";
import { ItSourceStateView, ItUnavailableAction } from "../shared/it-ui";
import styles from "../it.module.css";

export type ItModule = "services" | "systems" | "infrastructure" | "alos-genesis" | "integrations" | "access" | "security" | "changes" | "assets" | "support";

type ModuleConfig = { readonly title: string; readonly description: string; readonly columns: readonly string[]; readonly tabs: readonly string[]; readonly action?: string };

const configs: Record<ItModule, ModuleConfig> = {
  services: { title: "Layanan & Insiden", description: "Pantau layanan dan insiden IT tanpa menyimpulkan status dari ketiadaan data.", columns: ["Layanan", "Status Layanan", "Penanggung Jawab", "Pembaruan Terakhir", "Sumber"], tabs: ["Layanan", "Insiden", "Permintaan", "Riwayat"] },
  systems: { title: "Sistem & Aplikasi", description: "Daftar sistem dan aplikasi yang dapat diakses dari ruang kerja IT.", columns: ["Sistem / Aplikasi", "Penanggung Jawab", "Versi", "Status", "Sumber"], tabs: ["Semua", "Produksi", "Uji", "Riwayat"] },
  infrastructure: { title: "Infrastruktur & Lingkungan", description: "Kesiapan infrastruktur dan lingkungan menunggu sumber teknis resmi.", columns: ["Komponen", "Lingkungan", "Lokasi", "Status", "Sumber"], tabs: ["Komponen", "Lingkungan", "Insiden", "Riwayat"] },
  "alos-genesis": { title: "ALOS & GENESIS", description: "Pantau komponen platform dan kesiapan integrasi tanpa menampilkan rahasia sistem.", columns: ["Komponen", "Fungsi", "Versi", "Status", "Sumber"], tabs: ["ALOS", "GENESIS", "Kapasitas", "Riwayat"] },
  integrations: { title: "Integrasi & Connector", description: "Daftar koneksi sistem yang terdaftar; rahasia akses tidak pernah ditampilkan.", columns: ["Integrasi", "Arah", "Sistem Terkait", "Status", "Sumber"], tabs: ["Semua", "Aktif", "Perlu Perhatian", "Riwayat"] },
  access: { title: "Akses & Identitas", description: "Kelola kesiapan akses berdasarkan sumber identitas dan ruang kerja resmi.", columns: ["Karyawan", "Ruang Kerja", "Peran", "Status Akses", "Sumber"], tabs: ["Akun", "Ruang Kerja", "Peran", "Riwayat"] },
  security: { title: "Keamanan & Kepatuhan", description: "Status kontrol keamanan dan kepatuhan belum disimpulkan sebelum sumber resmi tersedia.", columns: ["Kontrol", "Area", "Status Pemeriksaan", "Penanggung Jawab", "Sumber"], tabs: ["Kontrol", "Kejadian", "Sesi", "Review", "Riwayat"] },
  changes: { title: "Perubahan & Rilis", description: "Catatan perubahan dan rilis ditampilkan setelah sumber change management terhubung.", columns: ["Perubahan", "Dampak", "Penanggung Jawab", "Jadwal", "Status"], tabs: ["Direncanakan", "Berjalan", "Selesai", "Riwayat"] },
  assets: { title: "Aset IT", description: "Katalog aset IT menunggu sumber aset resmi; kepemilikan dan kondisi tidak ditebak dari URL.", columns: ["Aset", "Jenis", "Penanggung Jawab", "Lokasi", "Status"], tabs: ["Semua", "Ditugaskan", "Perlu Perhatian", "Riwayat"] },
  support: { title: "Dukungan & Permintaan", description: "Permintaan dukungan IT dan prioritasnya akan tampil setelah sumber dukungan tersedia.", columns: ["Permintaan", "Kategori", "Prioritas", "Penanggung Jawab", "Status"], tabs: ["Terbuka", "Saya", "Selesai", "Riwayat"] },
};

export function ItModulePage({ module, workspaceKey }: Readonly<{ module: ItModule; workspaceKey?: string }>) {
  const config = configs[module];
  const [activeTab, setActiveTab] = useState(config.tabs[0]);
  const columns = columnsForTab(config, activeTab);
  return <ItLayout workspaceKey={workspaceKey}>{() => <div className={styles.page}>
    <PageHeader description={config.description} eyebrow="OPERASIONAL IT" title={config.title} />
    <Tabs ariaLabel={`Navigasi ${config.title}`} items={config.tabs.map((label) => ({ id: label, label }))} onValueChange={setActiveTab} value={activeTab} />
    <Section actions={config.action ? <ItUnavailableAction label={config.action} /> : undefined} description={`Tampilan ${activeTab}; status final menunggu sumber IT resmi.`} title={activeTab}>
      <ul aria-label={`Kolom ${activeTab}`} className={styles.moduleColumns}>{columns.map((column) => <li className={styles.moduleColumn} key={column}>{column}</li>)}</ul>
      <div style={{ marginTop: "var(--alos-space-3)" }}><ItSourceStateView description={`Sumber data ${activeTab.toLowerCase()} belum terhubung. Tidak ada data operasional yang dibuat oleh antarmuka.`} state="unavailable" title={activeTab} /></div>
    </Section>
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
  return config.columns;
}
