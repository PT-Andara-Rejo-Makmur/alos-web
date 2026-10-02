# Executive Data Requirements Registry

## Current canonical integration (2026-10-02)

Status aktual: **PARTIAL** untuk seluruh kebutuhan Stage 3; capability internal yang didukung tercatat **CONNECTED** di [canonical coverage matrix](canonical-business-coverage.md). Table dan form historis di bawah tetap menyimpan kebutuhan asli, termasuk field yang belum mempunyai authority. Label historis NEEDS BACKEND / SOURCE UNAVAILABLE tidak menyatakan kondisi runtime terkini.

| Capability | Current status | Owner / source and boundary |
|---|---|---|
| Supported internal records / dedicated forms | CONNECTED | Strategy, Shared Work and Sales/Marketing, Property, Finance, HR, Legal, IT owner overview sources; read projection with explicit scope and partial-failure behavior |
| Entire Stage 3 metric/form requirements | PARTIAL | Only accepted canonical fields and Backend-projected actions are active; historical wishlist fields are not invented |
| Production ARA/GENESIS / automatic extraction or reasoning | DEFERRED_TO_AI | Existing readiness only; no provider integration in this work |
| External/live sources and provider execution | DEFERRED_TO_CONNECTOR | UNAVAILABLE in UI until connected; recorded sources remain explicit |
| Unsupported final business policy / sensitive sources | UNAVAILABLE | Fail closed; see exact exceptions in canonical coverage matrix |

## Historical Stage 3 requirements


Status implementasi aktual dan audit menu ada pada [Executive Workspace](executive-workspace.md).
Tabel kebutuhan di bawah mencatat tujuan data; label readiness lama bukan bukti koneksi runtime.
Ringkasan dan Brief kini memakai satu Executive overview authoritative, sementara detail divisi
Shared Work, initiative, extraction dan GENESIS/ARA tetap belum tersedia sesuai audit aktual.

Registry ini mendokumentasikan spesifikasi kebutuhan data resmi untuk seluruh komponen pada Ruang Kerja Eksekutif (Executive Workspace) ALOS.
Setiap komponen didefinisikan dengan 17 atribut canonical:

1. **Component ID**: Identifier unik komponen UI
2. **Menu**: Menu navigasi utama eksekutif
3. **Business Purpose**: Tujuan bisnis dan kegunaan manajerial
4. **Entity / Metric**: Entitas atau metrik bisnis yang disajikan
5. **Scope**: Ruang lingkup data (COMPANY / DIVISION / WORKSPACE)
6. **Period**: Granularitas dan jangka waktu data (ANNUAL / QUARTERLY / MONTHLY)
7. **Owner**: Peran penanggung jawab canonical data
8. **Target Source**: Sumber data target perencanaan
9. **Actual Source**: Sumber data aktual pencapaian
10. **Forecast Source**: Sumber data perkiraan / proyeksi
11. **Data Source**: Sistem atau API penyedia data authoritative
12. **Verification**: Mekanisme dan status verifikasi data
13. **Evidence**: Ketentuan bukti pendukung (wajib / opsional / rujukan)
14. **Freshness**: Kebaruan data (real-time / batch harian / per siklus)
15. **Authority**: Hak akses / permission yang dipersyaratkan
16. **Detail Destination**: Rute navigasi halaman atau drawer detail
17. **Current Availability**: Status ketersediaan saat ini (Tersedia / Siap Terhubung / Belum Terhubung)

---

## Tabel Matriks Kebutuhan Data

| Component ID | Menu | Business Purpose | Entity / Metric | Scope | Period | Owner | Target Source | Actual Source | Forecast Source | Data Source | Verification | Evidence | Freshness | Authority | Detail Destination | Current Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `exec.summary.kpi_strip` | Ringkasan | Pemantauan cepat 6 indikator vital kesehatan bisnis | Pendapatan, Penjualan, Kas & Likuiditas, Progres Proyek, Keputusan, Risiko | COMPANY | ANNUAL | EXECUTIVE | Strategy API / RKAP | Modul Keuangan & Operasional | Proyeksi AI / Strategy | Finance, Sales, Work API | Terverifikasi Audit / Konsolidasi | Wajib untuk Keuangan; Opsional untuk Operasional | Harian | EXECUTIVE | `/workspace/executive/performance` | LIVE (Strategy Targets) / NOT CONNECTED (Financial & Ops) |
| `exec.summary.plan_meta` | Ringkasan | Penegasan landasan rencana strategis aktif perusahaan | Strategy Plan Aktif | COMPANY | ANNUAL / MULTI_YEAR | EXECUTIVE | Strategy API (`/plans`) | — | — | Strategy Service | Terverifikasi SK Direksi | Wajib (SK Pengesahan) | Per Siklus Rencana | EXECUTIVE | `/workspace/executive/planning` | LIVE |
| `exec.summary.target_table` | Ringkasan | Tinjauan performa target strategis korporasi | BusinessTarget (Corporate Scope) | COMPANY | ANNUAL | EXECUTIVE | Strategy API (`/targets`) | Observasi AKTUAL | Observasi FORECAST | Strategy Service | Status Verifikasi Observasi | Wajib bila manual; Rujukan bila terhubung | Real-time saat observasi | EXECUTIVE | `/workspace/executive/performance?target=[id]` | LIVE |
| `exec.summary.domain_grid` | Ringkasan | Pemantauan status kesehatan per domain bisnis | Domain Health rollup (Sales, Finance, Property, Legal, HR, IT) | COMPANY | MONTHLY | DIVISION_LEAD | Target RKAP Domain | Pelaporan Domain Terkait | Proyeksi Domain | Domain Modules API | Verifikasi Lead Domain | Sesuai SOP Domain | Mingguan | EXECUTIVE | `/workspace/executive/divisions/[key]` | NOT CONNECTED |
| `exec.summary.findings_box` | Ringkasan | Deteksi dini temuan dan kendala material | WorkFinding (Critical & High) | COMPANY | REAL_TIME | DIVISION_LEAD | Standar Kepatuhan | Laporan Lapangan / Audit | — | Shared Work Findings API | Verifikasi Lead Kepatuhan | Wajib (Dokumen Temuan) | Real-time | EXECUTIVE | `/workspace/executive/findings` | LIVE |
| `exec.summary.decisions_box`| Ringkasan | Percepatan eksekusi keputusan penting | WorkApproval (Executive tier) | COMPANY | REAL_TIME | EXECUTIVE | SOP Kewenangan | Pengajuan Tim Kerja | — | Shared Work Approvals API | Validasi Otoritas Pemohon | Wajib (Lampiran Pengajuan) | Real-time | EXECUTIVE | `/workspace/executive/approvals` | LIVE |
| `exec.summary.division_table` | Ringkasan | Evaluasi kesiapan dan rollup performa divisi | Division Status Rollup | DIVISION | MONTHLY | DIVISION_LEAD | Cascade RKAP Divisi | Laporan Bulanan Divisi | Proyeksi Divisi | Strategy & Work API | Verifikasi Kepala Divisi | Laporan Manajerial | Bulanan | EXECUTIVE | `/workspace/executive/divisions/[key]` | NOT CONNECTED |
| `exec.brief.condition` | Brief | Kondisi umum kelangsungan bisnis 1–3 menit | Status Rencana Aktif & Kesehatan Sasaran | COMPANY | ANNUAL | EXECUTIVE | Rencana Aktif Strategy | Rollup Target On-Track vs At-Risk | — | Strategy API | Ditentukan oleh authority Backend | Tervalidasi Rencana | Harian | EXECUTIVE | `/workspace/executive/summary` | LIVE |
| `exec.brief.highlights` | Brief | Ringkasan 3 sasaran paling krusial | Top 3 Corporate Targets | COMPANY | ANNUAL | EXECUTIVE | Target Strategy | Observasi Aktual | Observasi Perkiraan | Strategy API | Status Verifikasi Target | Rujukan Sumber | Harian | EXECUTIVE | `/workspace/executive/performance` | LIVE |
| `exec.brief.decisions` | Brief | Keputusan yang membutuhkan tanda tangan hari ini | Pending Executive Approvals | COMPANY | DAILY | EXECUTIVE | Kebijakan Otorisasi | Pengajuan Persetujuan Masuk | — | Approvals Service | Validasi Otoritas Pemohon | Wajib Bukti Lampiran | Real-time | EXECUTIVE | `/workspace/executive/approvals` | LIVE |
| `exec.brief.risks` | Brief | Peringatan risiko yang memerlukan intervensi direksi | Critical Risk & Off-Track Targets | COMPANY | REAL_TIME | RISK_OFFICER | Standar Toleransi Risiko | Audit Temuan & Deviasi Kinerja | — | Findings & Strategy API | Ditentukan oleh authority Backend | Berita Acara Temuan | Real-time | EXECUTIVE | `/workspace/executive/findings` | LIVE (Targets) / READINESS ONLY (Findings) |
| `exec.brief.progress` | Brief | Pemantauan tonggak capaian proyek strategis | Milestone Strategic Projects | COMPANY | WEEKLY | PROJECT_OWNER | Baseline Jadwal Proyek | Realisasi Lapangan | Proyeksi Penyelesaian | Shared Work Projects API | Verifikasi PMO | Laporan Progres Proyek | Mingguan | EXECUTIVE | `/workspace/executive/projects` | LIVE |
| `exec.brief.deadlines` | Brief | Kalender tenggat kepatuhan dan pelaporan | Compliance & Reporting Deadlines | COMPANY | MONTHLY | CORPORATE_SECRETARY | Regulasi & Jadwal RUPS/Audit | Realisasi Pelaporan | — | Calendar & Strategy API | Ditentukan oleh authority Backend | Dokumen Regulasi | Mingguan | EXECUTIVE | `/workspace/executive/brief` | READINESS ONLY / NEEDS BACKEND |
| `exec.brief.directives` | Brief | Penerbitan arahan pimpinan ke jajaran eksekutif | Strategic Directives / Tasks | COMPANY | AD_HOC | EXECUTIVE | Keputusan Direksi | — | — | Shared Work Tasks API | Validasi Otoritas Direksi | Opsional (Disposisi) | Real-time | `CREATE_COMPANY_PLAN` | `/workspace/executive/tasks` | READINESS ONLY / NEEDS BACKEND |
| `exec.brief.genesis` | Brief | Rekomendasi terarah berbasis kecerdasan GENESIS | GENESIS Advisory Insights | COMPANY | REAL_TIME | AI_CONTROL_PLANE | Parameter Model Strategi | Agregasi Data Lintas Modul | Simulasi Prediktif | GENESIS Advisory Engine | Governed Guardrails | Log Rujukan Parameter | Per Analisis | EXECUTIVE | `/workspace/executive/brief` | NOT CONNECTED |
| `exec.planning.renstra` | Rencana & Target | Rencana Strategis 5 tahunan korporasi | StrategyPlan (`STRATEGIC_PLAN`) | COMPANY | MULTI_YEAR | EXECUTIVE | Rapat Pemegang Saham | — | — | Strategy API (`/plans`) | Ditentukan oleh authority Backend | Wajib Akta / SK | Tahunan | `CREATE_COMPANY_PLAN` | Modal Formulir Renstra | LIVE |
| `exec.planning.rkap` | Rencana & Target | Rencana Kerja & Anggaran tahunan korporasi | StrategyPlan (`OPERATING_PLAN`) | COMPANY | ANNUAL | EXECUTIVE | Renstra Induk | — | — | Strategy API (`/plans`) | Ditentukan oleh authority Backend | Wajib Dokumen RKAP | Tahunan | `CREATE_COMPANY_PLAN` | Modal Formulir RKAP | LIVE |
| `exec.planning.objectives` | Rencana & Target | Sasaran strategis turunan rencana induk | StrategicObjective | COMPANY / DIVISION | ANNUAL | EXECUTIVE | Strategy Plan Terkait | — | — | Strategy API (`/objectives`)| Ditentukan oleh authority Backend | Matriks Sasaran | Per Siklus Rencana | `CREATE_COMPANY_PLAN` | Modal Formulir Sasaran | LIVE |
| `exec.planning.targets` | Rencana & Target | Definisi indikator target terukur perusahaan | BusinessTarget | COMPANY | ANNUAL | EXECUTIVE | Sasaran Strategis | — | — | Strategy API (`/targets`) | Ditentukan oleh authority Backend | Form Penetapan KPI | Per Siklus Rencana | `CREATE_COMPANY_PLAN` | Modal Formulir Target | LIVE |
| `exec.planning.target_val` | Rencana & Target | Observasi penetapan angka target (TARGET) | MetricObservation (`kind: TARGET`) | COMPANY | ANNUAL | EXECUTIVE | Keputusan Target | — | — | Strategy API (`/observations`)| Ditentukan oleh authority Backend | Bukti Dokumen Target | Per Penetapan | `CREATE_COMPANY_PLAN` | Langkah 2 Form Target | LIVE |
| `exec.planning.assumptions` | Rencana & Target | Parameter makro dan asumsi operasional | PlanningAssumption | COMPANY | ANNUAL | EXECUTIVE | Riset Pasar / Bank Indonesia | — | Proyeksi Makro | Strategy API (`/assumptions`)| Ditentukan oleh authority Backend | Rujukan Laporan Riset | Per Siklus Rencana | `CREATE_COMPANY_PLAN` | Modal Formulir Asumsi | LIVE |
| `exec.planning.cascade` | Rencana & Target | Simulasi dan penurunan target ke unit operasional | CascadePreview & Derived Targets | DIVISION | ANNUAL | EXECUTIVE | Target Induk & Aturan Split | — | Hasil Kalkulasi Rumus | Strategy API (`/cascade/preview`)| Evaluasi Constraints | Log Perhitungan | Real-time saat kalkulasi | `CREATE_COMPANY_PLAN` | Alur Cascade Interaktif | LIVE |
| `exec.planning.extraction` | Rencana & Target | Digitalisasi data strategi dari dokumen SK/Peraturan | Extracted Candidates | COMPANY | AD_HOC | EXECUTIVE | Dokumen PDF/Arsip ALOS | Ekstraksi NLP | — | Governed Extraction Engine | Ditentukan oleh authority Backend | Referensi Versi Immutable | Per Dokumen | `CREATE_COMPANY_PLAN` | Layar Telaah Kandidat 2 Kolom | UI READY / NEEDS BACKEND |
| `exec.performance.company` | Kinerja | Tabel komprehensif performa sasaran perusahaan | Target Performance Rollup | COMPANY | ANNUAL | EXECUTIVE | Observasi TARGET | Observasi AKTUAL | Observasi FORECAST | Strategy API (`/targets`) | Status Verifikasi Observasi | Wajib untuk Manual | Real-time | EXECUTIVE | `/workspace/executive/performance?target=[id]` | LIVE |
| `exec.performance.detail` | Kinerja | Evaluasi mendalam satu target spesifik | Target Detail, Observations & History | COMPANY | ANNUAL | EXECUTIVE | Target Metadata | Riwayat Observasi | Riwayat Proyeksi | Strategy API (`/targets/{id}`) | Riwayat Verifikasi | Wajib per Pengamatan Manual | Real-time | EXECUTIVE | Drawer Catat Aktual / Perkiraan | LIVE |
| `exec.performance.record` | Kinerja | Pencatatan capaian aktual atau perkiraan baru | MetricObservation (`ACTUAL`/`FORECAST`)| COMPANY / DIVISION | PERIODE BERJALAN | EXECUTIVE / AUDITOR | Target Terkait | Input Lapangan / Laporan | Input Estimasi Analis | Strategy API (`/observations`)| Menunggu Verifikasi | Wajib Bukti untuk Manual; Sumber untuk Tertaut | Real-time saat simpan | `CREATE_COMPANY_PLAN` | Drawer Catat Aktual / Perkiraan | LIVE |
| `exec.initiatives.table` | Inisiatif Strategis| Portofolio program kerja strategis pemenuhan target | StrategicInitiative | COMPANY | ANNUAL | EXECUTIVE | Sasaran Terkait | Progres Proyek Lapangan | — | Initiatives Contract & Work API | Ditentukan oleh authority Backend | SK Penugasan Program | Mingguan | EXECUTIVE | Drawer Detail Inisiatif | UI READY / NEEDS BACKEND |
| `exec.reviews.table` | Review & Revisi | Risalah telaah berkala kinerja manajemen | PerformanceReview | COMPANY | QUARTERLY | EXECUTIVE | Target Disepakati | Capaian Aktual Triwulan | Deviasi & Outlook | Strategy Review Service | Ditentukan oleh authority Backend | Notulen & Dokumen Bukti | Triwulanan | EXECUTIVE | Tab Review Kinerja | UI READY / NEEDS CONTRACT |
| `exec.reviews.corrective` | Review & Revisi | Penugasan perbaikan deviasi kinerja ke tim operasional | Corrective Tasks & Projects | COMPANY / DIVISION | AD_HOC | EXECUTIVE | Temuan Kesenjangan Kinerja | Eksekusi Shared Work | — | Shared Work API | Ditentukan oleh authority Backend | Laporan Penyelesaian | Real-time | EXECUTIVE | Tautan ke Shared Work | LIVE |
| `exec.reviews.revision` | Review & Revisi | Penyesuaian resmi angka target tanpa menimpa versi aktif | TargetRevision (`revisions`) | COMPANY | AD_HOC | EXECUTIVE | Target Aktif Berjalan | — | Proyeksi Revisi Baru | Strategy API (`/revisions`) | Ditentukan oleh authority Backend | Wajib Dokumen Justifikasi Revisi | Sesuai Pengajuan | `CREATE_COMPANY_PLAN` | Formulir Pengajuan Revisi | LIVE |
| `exec.division.detail` | Divisi | Kinerja komprehensif direktorat / divisi spesifik | Division Profile & Performance | DIVISION | MONTHLY | DIVISION_LEAD | Target Cascade Divisi | Aktual Laporan Divisi | Proyeksi Divisi | Strategy API (Division Scope)| Ditentukan oleh authority Backend | Dokumen Laporan Divisi | Bulanan | EXECUTIVE | `/workspace/executive/divisions/[key]` | LIVE (Strategy Scope) / READINESS ONLY (Integration) |
| `exec.division.projects` | Divisi | Daftar proyek yang dijalankan divisi terpilih | WorkProject (Division Scoped) | DIVISION | AD_HOC | PROJECT_OWNER | Rencana Kerja Divisi | Milestone Lapangan | — | Shared Work Projects API | Ditentukan oleh authority Backend | Dokumen Deliverables | Real-time | EXECUTIVE | Drawer Proyek Shared Work | LIVE |
| `exec.division.tasks` | Divisi | Tugas operasional yang sedang berjalan di divisi | WorkTask (Division Scoped) | DIVISION | AD_HOC | TASK_ASSIGNEE | Penugasan Kerja | Status Pekerjaan Harian | — | Shared Work Tasks API | Ditentukan oleh authority Backend | Lampiran Hasil Kerja | Real-time | EXECUTIVE | Drawer Tugas Shared Work | LIVE |
| `exec.division.approvals` | Divisi | Persetujuan anggaran dan administrasi divisi | WorkApproval (Division Scoped) | DIVISION | AD_HOC | APPROVER | Anggaran Divisi | Pengajuan Biaya / Dokumen | — | Shared Work Approvals API | Ditentukan oleh authority Backend | Lampiran Kebutuhan Biaya | Real-time | EXECUTIVE | Drawer Persetujuan Shared Work | LIVE |
| `exec.division.findings` | Divisi | Kendala operasional dan temuan audit divisi | WorkFinding (Division Scoped) | DIVISION | AD_HOC | AUDITOR / LEAD | SOP Mutu Divisi | Laporan Anomali Lapangan | — | Shared Work Findings API | Ditentukan oleh authority Backend | Foto / Dokumen Kendala | Real-time | EXECUTIVE | Drawer Temuan Shared Work | LIVE |
| `exec.division.reports` | Divisi | Laporan manajerial berkala divisi | WorkReport (Division Scoped) | DIVISION | PERIODIC | REPORT_AUTHOR | Jadwal Pelaporan Divisi | Kompilasi Data Laporan | — | Shared Work Reports API | Ditentukan oleh authority Backend | File Laporan Final | Per Jadwal | EXECUTIVE | Drawer Laporan Shared Work | LIVE |
| `exec.ara.dialog` | Tanya ARA | Asisten penalaran data dan analisis kebijakan | ARA Conversation & Context | PRINCIPAL_SCOPE | REAL_TIME | PRINCIPAL | Seluruh Rujukan Terotorisasi | Fakta Data ALOS | Proyeksi Pertanyaan | ARA Intelligence Plane | Validasi Guardrail Keamanan | Log Rujukan Jawaban | Real-time | PRINCIPAL | `/workspace/executive/ara` | NOT CONNECTED |

---

## Prinsip Kepatuhan Sumber Data

1. **Source Honesty**:
   - Jika modul atau endpoint backend belum terhubung, antarmuka wajib menampilkan status `"Belum Terhubung"` atau `"Belum Tersedia"` dan nilai `"—"`. Dilarang menampilkan data tiruan atau angka acak.
2. **Ketiadaan Tanggal Palsu**:
   - Waktu pembaruan (`updated_at`) harus bersumber dari entitas data resmi. Dilarang menggunakan frasa umum seperti `"Mengikuti data halaman"`.
3. **Pemisahan Target dan Nilai Observasi**:
   - Metadata target (`BusinessTarget`) tidak menyimpan nilai numerik target secara sembunyi-sembunyi. Nilai target selalu tersimpan sebagai entitas `MetricObservation` dengan `kind = "TARGET"`.
