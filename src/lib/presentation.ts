import type { BusinessMetric } from "@/lib/contracts";

const statuses: Readonly<Record<string, string>> = {
  DRAFT: "Belum Dimulai", PENDING: "Menunggu", READY: "Perlu Diperiksa", HELD: "Ditahan", RECORDED: "Dicatat", ACHIEVED: "Tercapai",
  ACTIVE: "Aktif", OPEN: "Terbuka", NEW: "Baru", PLANNED: "Direncanakan",
  IN_PROGRESS: "Sedang Dikerjakan", RUNNING: "Sedang Dikerjakan", QUEUED: "Menunggu",
  UNDER_REVIEW: "Sedang Diperiksa", PENDING_REVIEW: "Perlu Diperiksa", NEEDS_REVIEW: "Perlu Diperiksa",
  PENDING_APPROVAL: "Menunggu Keputusan", SUBMITTED: "Diajukan", RETURNED: "Perlu Diperbaiki",
  APPROVED: "Disetujui", REJECTED: "Ditolak", ON_HOLD: "Ditahan", HOLD: "Ditahan", BLOCKED: "Terhambat",
  RENDAH: "Rendah", SEDANG: "Sedang", TINGGI: "Tinggi", KRITIS: "Kritis", IN_REVIEW: "Sedang Diperiksa", CONFIRMED: "Dikonfirmasi",
  COMPLETED: "Selesai", DONE: "Selesai", CLOSED: "Selesai", SUCCEEDED: "Selesai",
  CANCELLED: "Dibatalkan", CANCELED: "Dibatalkan", ARCHIVED: "Diarsipkan", SUPERSEDED: "Digantikan",
  OVERDUE: "Terlambat", REVIEW: "Perlu Diperiksa", DECISION: "Perlu Keputusan",
  EXECUTION: "Perlu Ditindaklanjuti", ACKNOWLEDGEMENT: "Untuk Diketahui", SKIPPED: "Tidak Diperlukan",
  LOW: "Rendah", NORMAL: "Normal", MEDIUM: "Sedang", HIGH: "Tinggi", CRITICAL: "Mendesak",
  CONNECTED: "Tersedia", CONNECTED_EMPTY: "Belum Ada Data", UNAVAILABLE: "Belum Tersedia",
  ERROR: "Belum Dapat Dimuat", FAILED: "Perlu Ditangani", VERIFIED: "Sudah Diperiksa",
  UNVERIFIED: "Belum Diperiksa", PENDING_VERIFICATION: "Menunggu Pemeriksaan",
  PUBLIC: "Publik", INTERNAL: "Internal", CONFIDENTIAL: "Rahasia", RESTRICTED: "Terbatas",
  QUALIFIED: "Memenuhi Kriteria", CONTACTED: "Sudah Dihubungi", SURVEY: "Survei", BOOKING: "Booking",
  CONVERTED: "Berhasil Dilanjutkan", LOST: "Tidak Dilanjutkan", WON: "Berhasil", FOLLOW_UP: "Tindak Lanjut",
  SCREENING: "Seleksi Awal", INTERVIEW: "Wawancara", OFFERED: "Penawaran Kerja", HIRED: "Diterima",
  APPLIED: "Melamar", SHORTLISTED: "Lolos Seleksi", WITHDRAWN: "Mengundurkan Diri",
  PERMANENT: "Tetap", CONTRACT: "Kontrak", INTERNSHIP: "Magang", FREELANCE: "Lepas",
  PAID: "Sudah Dibayar", UNPAID: "Belum Dibayar", PARTIALLY_PAID: "Dibayar Sebagian",
  RECONCILED: "Sudah Dicocokkan", UNRECONCILED: "Belum Dicocokkan", POSTED: "Sudah Dicatat",
  IMPLEMENTED: "Sudah Dilaksanakan", RELEASED: "Sudah Dirilis", DEPLOYED: "Sudah Dipasang",
  RESOLVED: "Sudah Ditangani", UNRESOLVED: "Perlu Diperiksa", RESOLVING: "Sedang Diperiksa",
  VALID: "Sesuai", INVALID: "Perlu Diperbaiki", EXPIRED: "Masa Berlaku Berakhir",
  SIGNED: "Sudah Ditandatangani", EFFECTIVE: "Berlaku", TERMINATED: "Berakhir",
  INACTIVE: "Tidak Aktif", PROBATION: "Masa Percobaan", LEAVE: "Cuti", RETIRED: "Purnatugas",
  ON_TRACK: "Sesuai Rencana", AT_RISK: "Perlu Perhatian", OFF_TRACK: "Di Bawah Target",
  NOT_STARTED: "Belum Dimulai", NEEDS_INFO: "Perlu Informasi", DENIED: "Tidak Diizinkan",
  ACKNOWLEDGED: "Sudah Diketahui", RETURN: "Kembalikan", COMPLETE: "Selesaikan",
  APPROVE: "Setujui", REJECT: "Tolak", SUBMIT: "Ajukan",
  CASH: "Tunai", CASH_INSTALLMENT: "Tunai Bertahap", KPR: "KPR", IDR: "Rupiah", COUNT: "Jumlah", PERCENT: "Persentase",
  RATIO: "Rasio", SCORE: "Skor", UNIT: "Unit", INDIVIDUAL: "Perorangan", COMPANY: "Perusahaan",
  IN: "Masuk", OUT: "Keluar", SENT: "Terkirim", RECEIVED: "Diterima", DUE: "Jatuh Tempo",
  PARTIAL: "Sebagian", FULL: "Seluruhnya", PUBLISHED: "Diterbitkan", ROLLED_BACK: "Dikembalikan ke Versi Sebelumnya",
  REGISTERED: "Terdaftar", INITIAL: "Awal", TESTED: "Sudah Diuji", VALIDATED: "Sudah Diperiksa", STABLE: "Stabil",
  PASS: "Sesuai", PASSED: "Lulus Pemeriksaan", FAIL: "Perlu Diperbaiki", INCONCLUSIVE: "Perlu Pemeriksaan Lanjutan",
  RECORDED_ISSUES: "Ada Masalah Tercatat", NO_RECORDED_ISSUES: "Tidak Ada Masalah Tercatat",
  PERMIT: "Perizinan", LAND_DOCUMENT: "Dokumen Pertanahan", CASE: "Perkara",
  GOOD: "Baik", NEEDS_MAINTENANCE: "Perlu Pemeliharaan", UNKNOWN: "Belum Diketahui", GIVEN: "Diserahkan",
  INSPECTED: "Sudah Diperiksa", REPAIR_COMPLETED: "Perbaikan Selesai", NOT_READY: "Belum Siap",
  PRESENT: "Hadir", ABSENT: "Tidak Hadir", LATE: "Terlambat", EXCUSED: "Izin",
  UP: "Beroperasi", DOWN: "Tidak Beroperasi", DEGRADED: "Kinerja Menurun",
  FINANCIAL: "Keuangan", OPERATIONAL: "Operasional", PROGRESS: "Kemajuan Pekerjaan",
  PROJECT: "Proyek", SCHEDULED: "Dijadwalkan", COLLECTING: "Mengumpulkan Dokumen", BANK_REVIEW: "Pemeriksaan Bank",
  SP3K_ISSUED: "SP3K Terbit", AKAD_COMPLETED: "Akad Selesai", AVAILABLE: "Tersedia", RESERVED: "Dipesan", SOLD: "Terjual",
  MATCHED: "Sudah Dicocokkan", UNMATCHED: "Belum Dicocokkan", REVIEWED: "Sudah Diperiksa", MITIGATING: "Sedang Ditangani",
  ENROLLED: "Terdaftar", INVESTIGATING: "Sedang Ditelusuri", REMEDIATING: "Sedang Diperbaiki",
  Lead: "Prospek", Qualified: "Memenuhi Kriteria", Survey: "Survei", Booking: "Booking", Akad: "Akad", Closing: "Closing",
  MATERIAL: "Keputusan Strategis", NON_MATERIAL: "Operasi Divisi",
  SOURCE_LINKED: "Terhubung ke Data", MANUAL_EVIDENCED: "Diisi Manual dengan Bukti",
  HIGHER_IS_BETTER: "Makin Tinggi Makin Baik", LOWER_IS_BETTER: "Makin Rendah Makin Baik",
  RANGE: "Rentang Nilai", EXACT: "Nilai Tepat", PERCENTAGE: "Persentase", BINARY: "Ya atau Tidak",
  MILESTONE: "Tonggak Pekerjaan", CUMULATIVE: "Akumulasi",
  TARGET: "Target", ACTUAL: "Aktual", FORECAST: "Perkiraan", ASSUMPTION: "Asumsi",
  MINUTE: "Menit", HOUR: "Jam", DAY: "Hari", BOOLEAN: "Ya atau Tidak", AMOUNT: "Nilai Uang",
  ANNUAL: "Tahunan", QUARTERLY: "Triwulan", MONTHLY: "Bulanan", CUSTOM: "Khusus",
  CONFLICT: "Perlu Klarifikasi", NOT_EVALUATED: "Belum Dinilai", PREVIEW: "Pratinjau",
  SP3K: "SP3K", SPK: "SPK",
  MANUAL: "Dicatat Manual", SYSTEM: "Sistem", ARA: "ARA", AUDIT: "Audit", USER_REPORT: "Laporan Pengguna",
  SUCCESS: "Berhasil", TIMEOUT: "Waktu Tunggu Berakhir", TIMED_OUT: "Waktu Tunggu Berakhir", CANCEL_REQUESTED: "Pembatalan Diminta",
  WIN_OPPORTUNITY: "Menangkan Peluang", CONFIRM_BOOKING: "Konfirmasi Booking", COMPLETE_CLOSING: "Selesaikan Closing",
  ACTIVATE_PRICING: "Aktifkan Harga", RESERVE_UNIT: "Pesan Unit", SELL_UNIT: "Jual Unit",
  APPROVE_CHANGE_ORDER: "Setujui Perubahan Pekerjaan", APPROVE_PAYMENT_CERTIFICATE: "Setujui Sertifikat Pembayaran",
  APPROVE_BUDGET: "Setujui Anggaran", ACTIVATE_BUDGET: "Aktifkan Anggaran", CLOSE_BUDGET: "Tutup Anggaran",
  AUTHORIZE_PAYABLE: "Izinkan Pembayaran Utang", INCOMPLETE: "Belum Lengkap", ACCEPTED: "Diterima",
  AUTHORIZED: "Diizinkan", SUSPENDED: "Dinonaktifkan Sementara", PROPOSED: "Diusulkan", NEEDS_INFORMATION: "Perlu Informasi",
  BLOCKED_BY_EVIDENCE: "Bukti Belum Memadai", NOT_RUN: "Belum Dijalankan", PASS_WITH_FINDINGS: "Lulus dengan Temuan",
  REVISION_RECOMMENDED: "Perlu Perbaikan", RISK_FOUND: "Risiko Ditemukan",
  DAILY: "Harian", WEEKLY: "Mingguan", DIVISION: "Divisi", PROPERTY_UNIT: "Unit Properti", CHANNEL: "Kanal",
  CAMPAIGN: "Kampanye", TEAM: "Tim", ROLE: "Jabatan", PROCESS: "Proses",
  ASSIGNED: "Ditugaskan",
  ENABLED: "Aktif", DISABLED: "Dinonaktifkan", ACTIVATED: "Aktif", REVOKED: "Dicabut",
};

const missingLabels = new Set<string>();

function reportMissingLabel(value: string): void {
  if (process.env.NODE_ENV !== "production" && !missingLabels.has(value)) {
    missingLabels.add(value);
    console.warn(`[presentation] Label belum tersedia untuk enum: ${value}`);
  }
}

/** Labels are presentation only; API values and permitted transitions remain unchanged. */
export function statusLabel(value: string): string {
  if (statuses[value]) return statuses[value];
  if (/^[A-Z][A-Z0-9_]+$/.test(value)) {
    reportMissingLabel(value);
    return "Status belum dikenali";
  }
  return value;
}

/** Severity describes impact, whereas priority describes urgency. */
export function severityLabel(value: string): string {
  return value === "CRITICAL" ? "Kritis" : statusLabel(value);
}

/** Keep diagnostic messages in their source objects, outside ordinary business copy. */
export function userMessage(value: string, fallback: string): string {
  const code = /\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/;
  const diagnostic = /\b(?:actor_id|workspace_id|process_id|task_id|source_id|evidence_id|correlation|correlation_id|run_id|tool_id|content_hash|scope_refs|canonical|runtime|provider)\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\b(?:sales|finance|property|hr|legal|it|shared_work|strategy|core)\.[a-z0-9_]+\.[a-z0-9_.]+\b/i;
  return code.test(value) || diagnostic.test(value) || /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/.test(value) ? fallback : value;
}

export function roleLabel(value: string | readonly string[]): string {
  const roles = typeof value === "string" ? [value] : value;
  const labels: Readonly<Record<string, string>> = { EXECUTIVE: "Direktur", DIVISION_LEAD: "Kepala Divisi", DIVISION_MEMBER: "Anggota Divisi", IT_ADMIN: "Administrator IT" };
  return roles.filter(Boolean).map(role => {
    if (labels[role]) return labels[role];
    if (!/^[A-Z][A-Z0-9_]+$/.test(role) && !/[_.:]/.test(role)) return role;
    reportMissingLabel(role);
    return "Peran belum dikenali";
  }).filter((role, index, rows) => rows.indexOf(role) === index).join(" · ") || "Peran belum tersedia";
}

export const domainLabels: Readonly<Record<string, string>> = { sales: "Sales & Marketing", property: "Property & Teknik", finance: "Finance & Pajak", legal: "Legal", hr: "HR & GA", it: "IT & Teknologi" };

export function businessMetricValue(metric: BusinessMetric): string {
  if (!metric.available || metric.value === null) return "Belum tersedia";
  const value = String(metric.value);
  // Keep monetary decimal strings exact, including amounts beyond Number precision.
  if (metric.unit === "AMOUNT" && /^-?\d+(\.\d+)?$/.test(value)) {
    const [whole, fraction] = value.split(".");
    return `Rp ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${fraction ? `,${fraction}` : ""}`;
  }
  return metric.unit === "PERCENT" ? `${value}%` : value;
}

export function readableValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Belum tersedia";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "string") {
    if (statuses[value]) return statuses[value];
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value) && !Number.isNaN(Date.parse(value))) return new Date(value).toLocaleDateString("id-ID", {day:"numeric",month:"short",year:"numeric"});
    return value;
  }
  if (typeof value === "number") return String(value);
  return "Lihat informasi terkait";
}

export function activityLabel(event: string): string {
  const operation = event.toLowerCase().split(/[._]/).at(-1) ?? "";
  const labels: Readonly<Record<string, string>> = {
    create: "Catatan dibuat", created: "Catatan dibuat", update: "Catatan diperbarui", updated: "Catatan diperbarui",
    submit: "Pengajuan dikirim", submitted: "Pengajuan dikirim", approve: "Pengajuan disetujui", approved: "Pengajuan disetujui",
    reject: "Pengajuan ditolak", rejected: "Pengajuan ditolak", return: "Pengajuan dikembalikan", returned: "Pengajuan dikembalikan",
    hold: "Pengajuan ditahan", held: "Pengajuan ditahan", assign: "Penanggung jawab ditetapkan", assigned: "Penanggung jawab ditetapkan",
    complete: "Pekerjaan diselesaikan", completed: "Pekerjaan diselesaikan", archive: "Catatan diarsipkan", archived: "Catatan diarsipkan",
    publish: "Laporan diterbitkan", published: "Laporan diterbitkan", link: "Catatan pendukung dihubungkan", linked: "Catatan pendukung dihubungkan",
    verify: "Bukti diperiksa", verified: "Bukti diperiksa", comment: "Komentar ditambahkan", cancel: "Pengajuan dibatalkan", cancelled: "Pengajuan dibatalkan",
  };
  return labels[operation] ?? "Aktivitas pekerjaan dicatat";
}
