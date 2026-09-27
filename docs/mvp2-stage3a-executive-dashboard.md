# MVP-2 Stage 3A — Executive Command Center (Pusat Kendali Eksekutif)

Dokumen ini mencatat kondisi audit awal, spesifikasi data bisnis, arsitektur loading/progress, rancangan visual anti-AI-slop, dan pemetaan kanonis untuk **Pusat Kendali Eksekutif** PT Andara Rejo Makmur.

---

## 1. Tujuan Stage 3A

Tahap 3A memfinalisasi secara khusus antarmuka pengguna (UI) dan integrasi data untuk **Pusat Kendali Eksekutif** (`/workspace/executive`) sebagai langkah pertama MVP-2 Stage 3 (Finalisasi Seluruh Dashboard Divisi).
Tujuan utama:
- UI berstandar operasional enterprise nyata (bukan dashboard template AI/startup/crypto).
- Menghilangkan scaffolding Stage 1 (`BusinessDashboardFoundation`) dari tampilan produksi eksekutif dan mewujudkan kebutuhan datanya ke dalam komponen produksi.
- Seluruh teks tampilan menggunakan Bahasa Indonesia formal dan baku.
- Menghubungkan data authoritative Stage 2 yang sudah tersedia (`strategyApi` untuk target, rencana kerja, dan observasi nilai).
- Fail-closed dan source-honest untuk sumber domain operasional yang belum terhubung (menampilkan `—` dan `Belum Terhubung`, tanpa data sintetis atau estimasi sepihak).
- Loading dan progress UX berbasis jumlah request sumber data aktual (bukan timer atau persentase palsu).

---

## 2. Kondisi Sebelum Perubahan (Hasil Audit Awal)

### A. Routing & Halaman
- `src/app/workspace/executive/page.tsx`: Memanggil `ExecutiveDashboardPage`, melakukan pembatasan akses via `ProtectedDomainWorkspace` dengan role `EXECUTIVE`.
- `src/features/executive-dashboard/executive-dashboard-page.tsx`:
  - Hanya memanggil satu endpoint: `/api/v1/executive-dashboard`.
  - Jika 404, memanggil `createEmptyExecutiveSnapshot()`.
  - State loading hanya berupa teks statis sederhana: `"Memuat data eksekutif…"`.
  - Belum mengintegrasikan Stage 2 `strategyApi` untuk memuat target korporat.
- `src/features/executive-dashboard/executive-dashboard-home.tsx`:
  - Masih merender `<BusinessDashboardFoundation dashboard="executive" />` (scaffolding Stage 1).
  - Terdapat beberapa string Bahasa Inggris yang belum dilokalisasi (`CRITICAL`, `AT_RISK`, `Partial`).
  - Struktur belum mencakup 15 area hierarki bisnis kanonis (belum ada ringkasan domain Penjualan, Keuangan, Legal/KPR, SDM, IT).

### B. Status Backend & Contracts
- `alos-backend` belum memiliki endpoint `/api/v1/executive-dashboard` (404 diterima sebagai `NOT_CONNECTED`).
- Endpoint Stage 2 Strategy sudah authoritative: `/api/v1/strategy/plans`, `/api/v1/strategy/targets`, `/api/v1/strategy/authority`, dll.
- Tidak ada data sintetis yang diperbolehkan di runtime.

---

## 3. Information Architecture Final

Hierarki informasi desktop Pusat Kendali Eksekutif tersusun atas 15 blok terstruktur:

```
01. Header & Konteks Perusahaan
    (Breadcrumb, Judul, Deskripsi, Periode Aktif, RKAP Aktif, Waktu Pembaruan, Tombol Segarkan Data)
02. Status Data Perusahaan
    (Status ringkas sumber diperiksa: terkini, sebagian tersedia, belum terhubung; tautan status rincian)
03. Ringkasan Utama Perusahaan (Headlines)
    (Pendapatan, Penjualan / Closing, Kas & Likuiditas, Progres Proyek, Keputusan Menunggu, Risiko / Perhatian)
04. Pencapaian Target Perusahaan (Stage 2 Data)
    (Tabel target korporat: kode, periode, target, aktual, perkiraan, selisih, capaian %, status, verifikasi, sumber, aksi rincian)
05. Kinerja Penjualan & Komersial
    (Ringkasan alur penjualan / funnel komersial, target closing, status data penjualan)
06. Kondisi Keuangan
    (Posisi kas, arus kas masuk/keluar, kepatuhan anggaran, status data keuangan)
07. Proyek & Konstruksi
    (Portofolio proyek, progres rencana vs aktual, hold points, proyek perlu perhatian)
08. Legal, Perizinan & KPR
    (Status perizinan PBG/SLF, telaah kontrak, berkas KPR, status risiko hukum)
09. SDM & Organisasi
    (Jumlah karyawan aktif, kehadiran, rekrutmen, kepatuhan SoD, status data SDM)
10. Teknologi & ALOS
    (Status frontend/backend/GENESIS, insiden, kepatuhan anggaran token AI, kesiapan backup)
11. Peringatan Dini (Early Warning)
    (Daftar proyek kritis/berisiko, keputusan terlambat, divisi butuh perhatian)
12. Keputusan Menunggu (Decision Queue)
    (Daftar persetujuan dokumen & rilis GENESIS, prioritas urgensi, kewajiban peninjauan manusia)
13. Status Operasional Divisi
    (Status 6 divisi: Sehat, Perlu Perhatian, Kritis, atau Belum Terhubung)
14. Analisis GENESIS
    (Temuan dan risiko advisory agen pengawas tanpa gimmick AI futuristik)
15. Ritme Pelaporan & Tata Kelola
    (Jadwal brief harian, rapat koordinasi mingguan, tutup buku bulanan, evaluasi kuartalan)
```

---

## 4. Visual Design Rules (Anti "AI Slop")

1. **Warna & Palet**:
   - Berbasis token ALOS: dominan putih (`#ffffff`), abu-abu latar lembut (`#f8f9fa` / `#f3f4f6`), teks gelap kontras tinggi (`#111827` / `#1f2937`), dan border netral tipis (`#e5e7eb`).
   - Warna aksen hanya digunakan untuk status fungsional:
     - Hijau (`#16a34a` / `#059669`): Baik / Sesuai Target / Terverifikasi / Disetujui.
     - Amber/Kuning (`#d97706` / `#b45309`): Perhatian / Berisiko / Menunggu Verifikasi.
     - Merah (`#dc2626` / `#b91c1c`): Kritis / Terlambat / Konflik / Gagal.
     - Biru (`#2563eb`): Informasi / Proses / Selesai.
     - Abu-abu (`#6b7280` / `#9ca3af`): Belum Terhubung / Netral / Belum Dinilai.
   - Dilarang keras: gradient ungu/pink dekoratif, glow, neon borders, dark glassmorphism, background partikel atau blob melayang.
2. **Kepadatan & Sudut (Border Radius)**:
   - Kontrol kecil: 6–8px.
   - Panel & kartu: 8–12px.
   - Kontainer utama: maks 14px.
   - Bayangan (shadow) minimal, pemisah utama menggunakan border halus dan whitespace fungsional.
3. **Tipografi**:
   - Hierarki tegas: Judul Halaman (24–28px font tebal), Judul Bagian (16–18px semi-tebal), Metrik/Nilai (20–28px tegas), Label (12–14px reguler/sedang), Metadata (11–12px abu-abu).
   - Menghindari ALL CAPS berlebihan. Eyebrow uppercase hanya untuk kategori kecil yang jelas.

---

## 5. Aturan Bahasa & Pemetaan Presentasi (Bahasa Indonesia)

Seluruh teks visual yang tampil ke pengguna wajib Bahasa Indonesia:

| Nilai Internal / Enum | Teks Tampilan Pengguna |
|-----------------------|------------------------|
| `DRAFT` | Draf |
| `UNDER_REVIEW` | Dalam Peninjauan |
| `APPROVED` | Disetujui |
| `ACTIVE` | Aktif |
| `SUPERSEDED` | Digantikan |
| `ARCHIVED` | Diarsipkan |
| `ON_TRACK` | Sesuai Target |
| `AT_RISK` | Berisiko |
| `OFF_TRACK` | Tidak Sesuai Target |
| `ACHIEVED` | Tercapai |
| `NOT_EVALUATED` | Belum Dinilai |
| `NOT_CONNECTED` | Belum Terhubung |
| `LOADING` | Sedang Memuat |
| `PARTIAL` | Sebagian Tersedia |
| `LIVE` | Terkini |
| `STALE` | Perlu Diperbarui |
| `ERROR` | Gagal Memuat |
| `UNVERIFIED` | Belum Diverifikasi |
| `PENDING_VERIFICATION` | Menunggu Verifikasi |
| `VERIFIED` | Terverifikasi |
| `CONFLICT` | Data Tidak Sesuai |
| `REJECTED` | Ditolak |
| `OVERDUE` | Terlambat |
| `DUE_SOON` | Mendekati Tenggat |
| `NORMAL` | Normal |
| `CRITICAL` | Kritis |
| `ATTENTION` | Perlu Perhatian |
| `HEALTHY` | Sehat |

---

## 6. Loading Architecture

- **Initial Load**:
  - Menampilkan skeleton layout lengkap (`ExecutiveDashboardSkeleton`) yang merepresentasikan bentuk asli halaman (header, status bar, strip metrik headline, tabel target, dan panel domain).
  - Animasi skeleton menggunakan opacity pulse halus (`55%` ke `85%`, durasi 1.5s).
  - Menghormati media query `@media (prefers-reduced-motion: reduce)`.
- **Loading Progress Nyata**:
  - Mengukur penyelesaian 3 request nyata:
    1. Konteks Sesi & Hak Akses Pengguna.
    2. Rencana Strategis & Target Perusahaan (Stage 2 Strategy API).
    3. Ringkasan Operasional Eksekutif (`/api/v1/executive-dashboard`).
  - Menampilkan progress nyata: e.g., `2 dari 3 sumber diperiksa (67%)` beserta daftar item yang selesai diperiksa.
- **Refresh State**:
  - Tombol [ Segarkan Data ] berubah status menjadi spinner kecil + `Memperbarui...`.
  - Data lama tetap ditampilkan di layar selama proses refresh (zero layout-wipe).
  - Setelah selesai, cap waktu diperbarui: `Data diperbarui 18.25 WIB`.
  - Jika terjadi kegagalan jaringan saat refresh, menampilkan banner peringatan halus dan tombol [ Coba Lagi ], dengan mempertahankan data terakhir.

---

## 7. Progress Semantics & Validasi Nilai

- Progress bar hanya digunakan untuk:
  - Pencapaian target (Target Achievement).
  - Progres fisik proyek / konstruksi.
  - Penyelesaian alur kerja (Workflow Completion).
  - Kelengkapan berkas dokumen.
- Tidak pernah digunakan untuk nilai kas absolut, rasio tanpa penyebut, atau jumlah risiko.
- Formula kalkulasi presentasi: `(actual / target) * 100`.
- Perlindungan denominator: jika `target <= 0`, `target === null`, atau `actual === null`, progress bar tidak ditampilkan dan nilai capaian menampilkan `—` (tidak pernah `NaN%` atau `Infinity%`).
- Animasi transisi lebar progress bar: `180ms ease-out`, dinonaktifkan jika `prefers-reduced-motion`.

---

## 8. State UX: Empty, Error, Stale, Partial

1. **Empty State**:
   - Dilarang menggunakan teks generik seperti "No data available".
   - Menggunakan bahasa bisnis: "Belum ada target perusahaan yang terdaftar untuk periode ini.", "Sumber data penjualan belum terhubung."
2. **Error State**:
   - 403: "Anda tidak memiliki akses untuk melihat data ini. Diperlukan kewenangan Direktur."
   - 409: "Data telah berubah sejak halaman ini dibuka. Muat ulang data sebelum melanjutkan."
   - 500 / Network Error: "Data perusahaan belum dapat dimuat. Silakan coba lagi beberapa saat. [ Coba Lagi ]".
3. **Stale State**:
   - Menampilkan label "Perlu Diperbarui" jika data lebih lama dari aturan kesegaran (`freshness_rule`).
4. **Partial State**:
   - Menampilkan "Sebagian Tersedia" jika beberapa sumber terhubung sementara yang lain belum terhubung.

---

## 9. Executive Data Requirement Registry & Source Map

Registry resmi didefinisikan pada `src/features/executive-dashboard/executive-data-requirements.ts`:

| ID Komponen | Entitas / Metrik | Pemilik (Owner) | Target Source | Actual Source | Forecast Source | Status Saat Ini | Drill-down Href |
|-------------|------------------|-----------------|---------------|---------------|-----------------|-----------------|-----------------|
| `exec.headline.revenue` | Pendapatan Korporat | FINANCE | Strategy API (`KPI-FN-01` / Plan) | ERP / Keuangan (Authoritative) | Financial Forecast | `NOT_CONNECTED` | `/workspace/finance` |
| `exec.headline.closing` | Penjualan / Closing Unit | SALES | Strategy API (`KPI-SM-01` / Plan) | CRM Penjualan (Verified Closing) | Sales Pipeline Forecast | `NOT_CONNECTED` | `/workspace/sales` |
| `exec.headline.liquidity` | Saldo Kas & Likuiditas | FINANCE | Financial Plan | Mutasi Bank / Rekonsiliasi | Cashflow Forecast | `NOT_CONNECTED` | `/workspace/finance` |
| `exec.headline.delivery` | Progres Proyek Agregat | PROPERTY | Baseline S-Curve | Opname Proyek / Geotag | Scheduled Completion | `PARTIAL` | `/workspace/executive/projects` |
| `exec.headline.decisions` | Antrean Keputusan Direktur | EXECUTIVE | SLA Persetujuan (0 pending overdue) | Workflow ALOS / Snapshot | — | `LIVE` / `PARTIAL` | `/workspace/executive/approvals` |
| `exec.headline.risk` | Peringatan Dini & Risiko | EXECUTIVE | Batasan Deviasi (0 kritis) | Early Warning Engine | — | `LIVE` / `PARTIAL` | `/workspace/executive/approvals` |
| `exec.corporate.targets` | Seluruh Target RKAP | STRATEGY | Strategy API (`/targets`) | Observations (`ACTUAL`) | Observations (`FORECAST`) | `LIVE` (Stage 2) | `/workspace/executive/strategy` |
| `exec.domain.sales` | Funnel & Pipeline Komersial | SALES | Target SPK / Akad | CRM Pipeline | Forecast Akad | `NOT_CONNECTED` | `/workspace/sales` |
| `exec.domain.finance` | Kas & Arus Kas | FINANCE | RKAP Keuangan | Buku Kas / Jurnal | Proyeksi Likuiditas | `NOT_CONNECTED` | `/workspace/finance` |
| `exec.domain.property` | Proyek & Konstruksi | PROPERTY | Master Schedule Proyek | Opname Konstruksi | Estimasi PHO | `PARTIAL` | `/workspace/executive/projects` |
| `exec.domain.legal` | Perizinan & KPR | LEGAL | Target Izin & Legalitas | Dokumen Legal Terdaftar | Estimasi Terbit | `NOT_CONNECTED` | `/workspace/legal` |
| `exec.domain.hr` | SDM & Kepatuhan Organisasi | HR | Target Formasi Karyawan | Absensi & Personalia | — | `NOT_CONNECTED` | `/workspace/hr` |
| `exec.domain.it` | Keandalan Platform ALOS & IT | IT | SLA Sistem (99.9%) | Observabilitas ALOS | — | `NOT_CONNECTED` | `/workspace/it` |
| `exec.division.health` | Status Kesehatan 6 Divisi | EXECUTIVE | Standar Operasional Divisi | Agregasi Metrik Divisi | — | `PARTIAL` | `/workspace/executive/divisions` |
| `exec.early.warnings` | Peringatan Dini Operasional | EXECUTIVE | Ambang Toleransi Deviasi | Snapshot Proyek & Approval | — | `LIVE` / `PARTIAL` | `/workspace/executive/approvals` |
| `exec.decision.queue` | Antrean Persetujuan Material | EXECUTIVE | SLA Tinjauan Direktur | Alur Persetujuan ALOS | — | `LIVE` / `PARTIAL` | `/workspace/executive/approvals` |
| `exec.genesis.advisory` | Temuan & Rekomendasi GENESIS | IT / GENESIS | Pedoman Tata Kelola | GENESIS Control Plane | — | `NOT_CONNECTED` | `/workspace/executive/ara` |
| `exec.governance.cadence` | Jadwal & Ritme Tata Kelola | EXECUTIVE | Kalender Kerja Perusahaan | Log Eksekusi Rapat & Review | — | `LIVE` | `/workspace/executive/reports` |

---

## 10. Daftar Komponen Baru & Pemetaan Arsitektur

Struktur komponen dalam `src/features/executive-dashboard/`:
- `executive-dashboard-page.tsx`: Komponen halaman utama dengan state machine terintegrasi (skeleton loading, multi-source loading progress, error handling, refresh orchestration).
- `executive-dashboard-home.tsx`: Layout orkestrasi 15 blok enterprise Pusat Kendali Eksekutif.
- `executive-data-requirements.ts`: Registry metadata formal seluruh metrik dan komponen eksekutif.
- `use-executive-overview.ts`: Hook data composition yang menggabungkan Stage 2 Strategy API (`listPlans`, `listTargets`) dengan operational snapshot.
- `executive-dashboard-projection.ts`: Fungsi proyeksi murni tanpa inferensi wewenang.
- `types.ts`: Deklarasi tipe data, status kesiapan sumber, dan view model.
- `components/`:
  - `executive-page-header.tsx`: Header enterprise dengan breadcrumb, judul, deskripsi, periode aktif, dan tombol Segarkan Data.
  - `executive-data-status.tsx`: Baris status tipis yang merangkum kesehatan koneksi seluruh sumber data.
  - `executive-headline-strip.tsx`: 6 kartu ringkasan bisnis utama dengan target, aktual, perkiraan, dan status.
  - `executive-target-performance.tsx`: Tabel target perusahaan Stage 2 dengan pemisahan Target/Aktual/Perkiraan/Selisih/Progress.
  - `executive-domain-summary.tsx`: 6 panel ringkasan domain (Penjualan, Keuangan, Proyek, Legal, SDM, IT).
  - `executive-attention.tsx`: Panel peringatan dini terurut berdasarkan keparahan (Kritis, Berisiko, dll).
  - `executive-decision-queue.tsx`: Panel antrean keputusan material untuk Direktur dengan footnote human-review wajib.
  - `executive-division-health.tsx`: Tabel status operasional 6 divisi tanpa skor palsu.
  - `executive-genesis-analysis.tsx`: Panel analisis advisory GENESIS yang tenang dan source-honest.
  - `executive-governance-cadence.tsx`: Panel ritme pelaporan dan tata kelola perusahaan.
  - `executive-dashboard-skeleton.tsx`: Skeleton loading terstruktur dengan animasi opacity pulse lembut.
  - `executive-progress.tsx`: Komponen visual progress bar terstandarisasi dan aman dari denominator nol/negatif.
  - `executive-detail-drawer.tsx`: Drawer rincian data (target, bukti, status sumber) dengan dukungan aksesibilitas keyboard dan focus trap.

---

## 11. Responsive Behavior & Aksesibilitas

- **Desktop (>= 1200px)**: Grid 6-headline terdistribusi, tabel dengan kolom lengkap, panel domain 2 atau 3 kolom seimbang.
- **Tablet (768px - 1199px)**: Headline 2-3 kolom, tabel target dengan horizontal scroll container yang mulus, panel domain 2 kolom.
- **Mobile (< 768px)**: Headline ditumpuk (1 kolom), tabel target menyajikan tampilan kartu terpadat atau scroll container bersahabat sentuhan, drawer mengambil lebar penuh (full sheet), tombol aksi memenuhi ukuran sentuh minimum 44x44px.
- **Aksesibilitas**:
  - Struktur heading semantik (`h1` untuk judul halaman, `h2` untuk bagian utama, `h3` untuk sub-panel).
  - `th` dengan `scope="col"` pada semua tabel.
  - Status tidak hanya bergantung pada warna (selalu disertai teks dan ikon/titik semantik).
  - `aria-live="polite"` untuk notifikasi pembaruan data dan status pemuatan.
  - Dukungan penuh `prefers-reduced-motion`.

---

## 12. Dependency Menuju Dashboard Divisi Berikutnya

Pusat Kendali Eksekutif Stage 3A ini menetapkan standar arsitektur UI, loading/progress UX, data requirement registry, dan pemetaan status Bahasa Indonesia yang akan diwarisi oleh:
1. Sales & Commercial Dashboard (`/workspace/sales`).
2. Property & Construction Dashboard (`/workspace/property`).
3. Finance & Accounting Dashboard (`/workspace/finance`).
4. Legal & Compliance Dashboard (`/workspace/legal`).
5. HR & People Dashboard (`/workspace/hr`).
6. IT & GENESIS Operations Dashboard (`/workspace/it`).

Pekerjaan pada dashboard divisi berikutnya tidak boleh dimulai sebelum Definition of Done Stage 3A terpenuhi sepenuhnya.
