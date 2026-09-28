# Executive Workspace

Executive Workspace adalah pusat pengendalian perusahaan di `/workspace/executive`. Route dasar mengarahkan pengguna ke `/workspace/executive/summary`.

## Authority dan batasan

Setiap halaman Executive memeriksa session HttpOnly melalui ALOS Web/BFF. Halaman hanya dibuka ketika active workspace Backend bertipe `EXECUTIVE`; URL, nama pengguna, dan penyimpanan browser tidak menjadi authority. Executive tidak memperoleh akses data berklasifikasi melalui frontend.

Browser → ALOS Web/BFF → ALOS Backend → GENESIS/internal systems. GENESIS bersifat advisory dan tidak menjadi authority.

## Navigasi dan route

| Menu | Route | Ketersediaan |
| --- | --- | --- |
| Ringkasan | `/workspace/executive/summary` | UI READY (Strategy Plan/Target; domain lain READINESS ONLY / NOT CONNECTED) |
| Brief Eksekutif | `/workspace/executive/brief` | READINESS ONLY (Agenda/Tenggat & Temuan NOT CONNECTED) |
| Rencana & Target | `/workspace/executive/planning` | UI READY (Strategy Plan, Target, Asumsi, Cascade; Ekstraksi Dokumen UI READY / NEEDS BACKEND) |
| Kinerja | `/workspace/executive/performance` | UI READY (Target & Observasi Aktif/Forecast) |
| Inisiatif Strategis | `/workspace/executive/initiatives` | UI READY / NEEDS BACKEND (data kosong jujur tanpa dummy) |
| Review & Revisi | `/workspace/executive/reviews` | UI READY (Revisi Target); Review Kinerja UI READY / NEEDS CONTRACT |
| Divisi | `/workspace/executive/divisions` | UI READY (Fail-closed scoping) |
| Detail Divisi | `/workspace/executive/divisions/[divisionKey]` | UI READY (Tautan ke Shared Work universal) |
| Proyek, Tugas, Persetujuan, Dokumen, Laporan, Temuan | `/workspace/executive/{module}` | UI READY / NEEDS BACKEND (Universal Shared Work — UI siap, koneksi backend belum aktif) |
| Tanya ARA | `/workspace/executive/ara` | NOT CONNECTED / READINESS ONLY (Tanpa percakapan simulasi) |

Sidebar desktop tetap 248px saat terbuka dan 72px saat ringkas. Toggle berada di header sidebar. Mobile menggunakan drawer.

## Audit implementasi

| Area | Kondisi aktual | Gap |
| --- | --- | --- |
| Executive lama | Ringkasan Strategy tersedia | Dipecah menjadi halaman berdasarkan fungsi bisnis |
| Strategy | Plan, objective, target, observation, assumption, cascade, lifecycle tersedia pada Backend | Initiative dan performance review belum memiliki endpoint public yang digunakan Web |
| Shared Work | Proyek, tugas, persetujuan, dokumen, laporan, temuan universal tersedia | Ringkasan hanya menautkan saat aggregate executive belum tersedia |
| Contracts | Strategy contract mencakup plan/target/observation/assumption/cascade | Initiative belum diekspor facade Web |
| GENESIS/ARA | Tidak ada surface public yang dapat dipakai Executive | Readiness tanpa hasil atau rekomendasi buatan |
| Document extraction | Belum ada governed extraction endpoint untuk Web | UX dinyatakan belum terhubung |

## Source honesty

Nilai kosong ditampilkan sebagai `—`. Sumber tidak terhubung ditampilkan sebagai `Belum Terhubung`; tidak diganti menjadi nol, aman, atau status kinerja lain. Ringkasan hanya menggunakan target `scope.type = COMPANY`. Performance state dan verification state berasal dari Backend.

## Detail destination

Target menuju Kinerja. Domain menuju detail Divisi. Proyek, tugas, persetujuan, dokumen, laporan, dan temuan menuju route Shared Work universal. Ringkasan tidak menyimpan nilai bisnis atau mengambil keputusan.
