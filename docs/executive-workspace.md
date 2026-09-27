# Executive Workspace

Executive Workspace adalah pusat pengendalian perusahaan di `/workspace/executive`. Route dasar mengarahkan pengguna ke `/workspace/executive/summary`.

## Authority dan batasan

Setiap halaman Executive memeriksa session HttpOnly melalui ALOS Web/BFF. Halaman hanya dibuka ketika active workspace Backend bertipe `EXECUTIVE`; URL, nama pengguna, dan penyimpanan browser tidak menjadi authority. Executive tidak memperoleh akses data berklasifikasi melalui frontend.

Browser → ALOS Web/BFF → ALOS Backend → GENESIS/internal systems. GENESIS bersifat advisory dan tidak menjadi authority.

## Navigasi dan route

| Menu | Route | Ketersediaan |
| --- | --- | --- |
| Ringkasan | `/workspace/executive/summary` | Strategy tersedia; domain lain mengikuti source readiness |
| Brief Eksekutif | `/workspace/executive/brief` | Readiness |
| Rencana & Target | `/workspace/executive/planning` | Strategy plan, target, dan asumsi |
| Kinerja | `/workspace/executive/performance` | Strategy target dan observasi |
| Inisiatif Strategis | `/workspace/executive/initiatives` | Butuh endpoint public |
| Review & Revisi | `/workspace/executive/reviews` | Revisi target/readiness sesuai contract |
| Divisi | `/workspace/executive/divisions` | Kesiapan data per divisi |
| Detail Divisi | `/workspace/executive/divisions/[divisionKey]` | Tautan ke Shared Work universal |
| Proyek, Tugas, Persetujuan, Dokumen, Laporan, Temuan | `/workspace/executive/{module}` | Reuse `src/features/shared-work/` |
| Tanya ARA | `/workspace/executive/ara` | Readiness tanpa percakapan simulasi |

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
