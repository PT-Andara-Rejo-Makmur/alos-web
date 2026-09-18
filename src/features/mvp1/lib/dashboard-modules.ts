export type DashboardMetricTone = "neutral" | "success" | "warning" | "danger" | "info" | "violet";

export type DashboardMetric = {
  label: string;
  hint: string;
  icon: "folder" | "chart" | "alert" | "file" | "calendar" | "check" | "clock" | "shield" | "document" | "report";
  tone: DashboardMetricTone;
};

export type DashboardModule = {
  title: string;
  description: string;
  searchPlaceholder: string;
  metrics: readonly DashboardMetric[];
  primaryPanel: string;
  secondaryPanel: string;
  emptyMessage: string;
};

export const dashboardModules = {
  divisions: {
    title: "Divisions Overview",
    description: "Ringkasan kesehatan dan prioritas setiap divisi perusahaan.",
    searchPlaceholder: "Cari divisi, KPI, atau isu…",
    metrics: [
      { label: "Divisi terhubung", hint: "Belum ada struktur divisi", icon: "folder", tone: "neutral" },
      { label: "Divisi sehat", hint: "Menunggu indikator", icon: "check", tone: "success" },
      { label: "Perlu perhatian", hint: "Menunggu indikator", icon: "alert", tone: "warning" },
      { label: "Isu terbuka", hint: "Belum ada temuan", icon: "file", tone: "info" },
    ],
    primaryPanel: "Perbandingan Kinerja Divisi",
    secondaryPanel: "Divisi yang Perlu Perhatian",
    emptyMessage: "Hubungkan struktur divisi, owner, dan KPI terlebih dahulu agar kesehatan organisasi dapat ditampilkan.",
  },
  projects: {
    title: "Portfolio Proyek",
    description: "Pantau keseluruhan kinerja proyek perusahaan secara terkontrol.",
    searchPlaceholder: "Cari proyek, PIC, atau milestone…",
    metrics: [
      { label: "Total proyek", hint: "Belum ada proyek terdaftar", icon: "folder", tone: "neutral" },
      { label: "On track", hint: "Menunggu status proyek", icon: "check", tone: "info" },
      { label: "At risk", hint: "Menunggu status proyek", icon: "alert", tone: "warning" },
      { label: "Kritis", hint: "Menunggu status proyek", icon: "alert", tone: "danger" },
    ],
    primaryPanel: "Progress Portofolio Proyek",
    secondaryPanel: "Milestone Terdekat",
    emptyMessage: "Daftarkan proyek, PIC, milestone, dan status risikonya agar portofolio dapat dipantau di sini.",
  },
  tasks: {
    title: "Tasks",
    description: "Kelola dan pantau seluruh tugas perusahaan secara efektif.",
    searchPlaceholder: "Cari tugas, PIC, atau proyek…",
    metrics: [
      { label: "Total tugas", hint: "Belum ada tugas terdaftar", icon: "check", tone: "neutral" },
      { label: "Jatuh tempo hari ini", hint: "Belum ada tenggat", icon: "calendar", tone: "warning" },
      { label: "Overdue", hint: "Belum ada tugas terlambat", icon: "alert", tone: "danger" },
      { label: "Selesai", hint: "Belum ada tugas selesai", icon: "check", tone: "info" },
    ],
    primaryPanel: "Task Board",
    secondaryPanel: "Tugas Prioritas Tinggi",
    emptyMessage: "Buat tugas dari proyek atau proses divisi yang telah disetujui untuk mengisi board ini.",
  },
  approvals: {
    title: "Approvals Center",
    description: "Kelola dan tindak lanjuti permintaan persetujuan secara terpusat.",
    searchPlaceholder: "Cari ID atau deskripsi approval…",
    metrics: [
      { label: "Pending approval", hint: "Belum ada permintaan", icon: "file", tone: "warning" },
      { label: "Urgent", hint: "Belum ada permintaan urgent", icon: "alert", tone: "danger" },
      { label: "Disetujui hari ini", hint: "Belum ada keputusan", icon: "check", tone: "success" },
      { label: "Ditolak", hint: "Belum ada keputusan", icon: "file", tone: "info" },
    ],
    primaryPanel: "Tren Approval",
    secondaryPanel: "Approval Prioritas",
    emptyMessage: "Approval akan muncul setelah alur persetujuan, maker, dan approver divisi dikonfigurasi.",
  },
  documents: {
    title: "Documents",
    description: "Kelola dan akses dokumen perusahaan dengan mudah serta terstruktur.",
    searchPlaceholder: "Cari dokumen, kategori, atau kata kunci…",
    metrics: [
      { label: "Total dokumen", hint: "Belum ada dokumen terdaftar", icon: "document", tone: "success" },
      { label: "Butuh review", hint: "Belum ada dokumen review", icon: "alert", tone: "warning" },
      { label: "Terbaru", hint: "Belum ada dokumen baru", icon: "clock", tone: "info" },
      { label: "Kedaluwarsa", hint: "Belum ada dokumen kedaluwarsa", icon: "alert", tone: "danger" },
    ],
    primaryPanel: "Distribusi Dokumen per Kategori",
    secondaryPanel: "Dokumen Penting",
    emptyMessage: "Dokumen hanya akan tampil setelah pemilik, klasifikasi, akses, dan kebijakan retensi terdaftar.",
  },
  reports: {
    title: "Reports Center",
    description: "Pusat laporan perusahaan untuk memantau kinerja, progres, dan insight bisnis.",
    searchPlaceholder: "Cari laporan, divisi, atau periode…",
    metrics: [
      { label: "Laporan harian", hint: "Belum ada laporan", icon: "report", tone: "success" },
      { label: "Laporan mingguan", hint: "Belum ada laporan", icon: "calendar", tone: "warning" },
      { label: "Laporan bulanan", hint: "Belum ada laporan", icon: "calendar", tone: "info" },
      { label: "Draft laporan", hint: "Belum ada draft", icon: "file", tone: "violet" },
    ],
    primaryPanel: "Tren Generasi Laporan",
    secondaryPanel: "Laporan Terbaru",
    emptyMessage: "Laporan akan tersedia sesudah sumber data, template, owner, dan hak akses laporan ditetapkan.",
  },
  findings: {
    title: "Findings & Issue Monitoring",
    description: "Pantau temuan audit, risiko, dan isu untuk perbaikan berkelanjutan.",
    searchPlaceholder: "Cari temuan, owner, atau ID…",
    metrics: [
      { label: "Temuan kritis", hint: "Belum ada temuan", icon: "alert", tone: "danger" },
      { label: "Risiko tinggi", hint: "Belum ada risiko", icon: "alert", tone: "warning" },
      { label: "Diselesaikan", hint: "Belum ada penyelesaian", icon: "check", tone: "success" },
      { label: "Isu terbuka", hint: "Belum ada isu", icon: "file", tone: "info" },
    ],
    primaryPanel: "Temuan Berdasarkan Tingkat Severitas",
    secondaryPanel: "Temuan Prioritas",
    emptyMessage: "Temuan akan tampil setelah sumber audit, owner tindak lanjut, dan klasifikasi risiko tersedia.",
  },
  genesis: {
    title: "GENESIS",
    description: "Your AI Executive Assistant untuk mengubah kebutuhan menjadi DRAFT yang tetap melewati governance manusia.",
    searchPlaceholder: "Ask GENESIS anything about your business…",
    metrics: [],
    primaryPanel: "Percakapan dengan GENESIS",
    secondaryPanel: "Agen Aktif",
    emptyMessage: "Mulai dengan kebutuhan bisnis yang jelas. GENESIS hanya membuat DRAFT dan tidak dapat menjalankan atau mengubah sistem tanpa proses review.",
  },
  settings: {
    title: "Settings & Administration",
    description: "Kelola pengaturan akun, sistem, dan preferensi platform ALOS.",
    searchPlaceholder: "Cari pengaturan atau kebijakan…",
    metrics: [],
    primaryPanel: "Profile Settings",
    secondaryPanel: "Your Role & Access",
    emptyMessage: "Pengaturan yang tersedia mengikuti peran Anda. Data profil dan organisasi belum disiapkan pada staging ini.",
  },
} as const satisfies Record<string, DashboardModule>;

export type DashboardModuleKey = keyof typeof dashboardModules;

export function isDashboardModuleKey(value: string): value is DashboardModuleKey {
  return value in dashboardModules;
}


