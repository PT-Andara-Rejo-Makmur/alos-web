# Executive Workspace

Executive Workspace adalah pusat pengendalian perusahaan pada boundary canonical `/workspace/[workspaceKey]`. Route dasar mengarahkan workspace Executive aktif ke `/workspace/[workspaceKey]/summary`.

## Authority dan batasan

Setiap halaman Executive memeriksa session HttpOnly melalui ALOS Web/BFF. Halaman hanya dibuka ketika active workspace Backend bertipe `EXECUTIVE`; URL, nama pengguna, dan penyimpanan browser tidak menjadi authority. Executive tidak memperoleh akses data berklasifikasi melalui frontend.

Browser → ALOS Web/BFF → ALOS Backend → GENESIS/internal systems. GENESIS bersifat advisory dan tidak menjadi authority.

## Navigasi dan route

| Menu | Route | Ketersediaan |
| --- | --- | --- |
| Ringkasan | `/workspace/[workspaceKey]/summary` | UI READY (Strategy Plan/Target; domain lain READINESS ONLY / NOT CONNECTED) |
| Brief Eksekutif | `/workspace/[workspaceKey]/brief` | READINESS ONLY (Agenda/Tenggat & Temuan NOT CONNECTED) |
| Rencana & Target | `/workspace/[workspaceKey]/planning` | UI READY (Strategy Plan, Target, Asumsi, Cascade; Ekstraksi Dokumen UI READY / NEEDS BACKEND) |
| Kinerja | `/workspace/[workspaceKey]/performance` | UI READY (Target & Observasi Aktif/Forecast) |
| Inisiatif Strategis | `/workspace/[workspaceKey]/initiatives` | UI READY / NEEDS BACKEND (data kosong jujur tanpa dummy) |
| Review & Revisi | `/workspace/[workspaceKey]/reviews` | UI READY (Revisi Target); Review Kinerja UI READY / NEEDS CONTRACT |
| Divisi | `/workspace/[workspaceKey]/divisions` | UI READY (Fail-closed scoping) |
| Detail Divisi | `/workspace/[workspaceKey]/divisions/[divisionKey]` | UI READY (Shared Work lintas ruang kerja READINESS ONLY) |
| Proyek, Tugas, Persetujuan, Dokumen, Laporan, Temuan | `/workspace/[workspaceKey]/{module}` | UI READY / NEEDS BACKEND (Universal Shared Work — UI siap, koneksi backend belum aktif) |
| Tanya ARA | `/workspace/[workspaceKey]/ara` | NOT CONNECTED / READINESS ONLY (Tanpa percakapan simulasi) |

`[workspaceKey]` berasal dari `active_workspace.workspace.workspace_key` pada session Executive yang authoritative. `/workspace/executive` hanya compatibility alias yang memuat session lalu mengarahkan ke key aktual; alias tersebut bukan workspace authority dan bukan route tree kedua.

Detail Divisi mempertahankan tab Proyek, Tugas, Persetujuan, Temuan, dan Laporan sebagai readiness only. Detail tersebut belum memiliki governed cross-workspace Shared Work projection, sehingga tidak menampilkan Shared Work dari active workspace Executive dan tidak menebak workspace berdasarkan `divisionKey`.

Sidebar desktop tetap 248px saat terbuka dan 72px saat ringkas. Toggle berada di header sidebar. Mobile menggunakan drawer.

## Audit implementasi

| Area | Kondisi aktual | Gap |
| --- | --- | --- |
| Executive lama | Ringkasan Strategy tersedia | Dipecah menjadi halaman berdasarkan fungsi bisnis |
| Strategy | Plan, objective, target, observation, assumption, cascade, lifecycle tersedia pada Backend | Initiative dan performance review belum memiliki endpoint public yang digunakan Web |
| Shared Work | Proyek, tugas, persetujuan, dokumen, laporan, temuan universal tersedia | Top-level memakai workspace aktif; tab Shared Work pada Detail Divisi readiness only sampai projection lintas ruang kerja tersedia |
| Contracts | Strategy contract mencakup plan/target/observation/assumption/cascade | Initiative belum diekspor facade Web |
| GENESIS/ARA | Tidak ada surface public yang dapat dipakai Executive | Readiness tanpa hasil atau rekomendasi buatan |
| Document extraction | Belum ada governed extraction endpoint untuk Web | UX dinyatakan belum terhubung |

## Source honesty

Nilai kosong ditampilkan sebagai `—`. Sumber tidak terhubung ditampilkan sebagai `Belum Terhubung`; tidak diganti menjadi nol, aman, atau status kinerja lain. Ringkasan hanya menggunakan target `scope.type = COMPANY`. Performance state dan verification state berasal dari Backend.

## Detail destination

Target menuju Kinerja. Domain menuju detail Divisi. Proyek, tugas, persetujuan, dokumen, laporan, dan temuan menuju route Shared Work universal. Ringkasan tidak menyimpan nilai bisnis atau mengambil keputusan.
