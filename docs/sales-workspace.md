# Sales & Marketing Workspace

Ruang kerja Sales berada di `/workspace/[workspaceKey]` sesuai `workspace_key` pada active workspace yang diproyeksikan Backend. Akses hanya terbuka untuk workspace bertipe `BUSINESS` dengan `division_code` `SALES`; parameter URL, role lokal, dan penyimpanan browser tidak memberikan akses.

| Menu | Route | Ketersediaan |
| --- | --- | --- |
| Ringkasan | `/summary` | UI FINAL / SOURCE UNAVAILABLE |
| Pipeline Penjualan | `/pipeline` | UI FINAL / SOURCE UNAVAILABLE |
| Prospek & Lead | `/leads` | UI FINAL / SOURCE UNAVAILABLE |
| Aktivitas & Tindak Lanjut | `/activities` | UI FINAL / SOURCE UNAVAILABLE |
| Booking & Closing | `/bookings` | UI FINAL / SOURCE UNAVAILABLE / NEEDS INTEGRATION Finance, Legal, dan Property |
| KPR & Akad | `/kpr` | UI FINAL / SOURCE UNAVAILABLE / NEEDS INTEGRATION Finance dan Legal |
| Campaign & Channel | `/campaigns` | UI FINAL / SOURCE UNAVAILABLE |
| Target & Kinerja | `/performance` | UI FINAL / SOURCE UNAVAILABLE / NEEDS INTEGRATION Strategy Sales |
| Proyek, Tugas, Persetujuan, Dokumen, Laporan, Temuan | route Shared Work | Shared Work universal |
| Tanya ARA | `/ara` | READINESS ONLY / NEEDS INTEGRATION |

Nilai yang belum authoritative ditampilkan sebagai `—`; tidak ada catatan, metrik, atau closing simulasi.

Ringkasan bersifat read-first dan tidak menyediakan form input utama. Pipeline menyediakan filter, stage summary, tabel daftar, dan quick view; belum ada baris bisnis karena source pipeline authoritative belum tersedia.

Sales tidak dapat menetapkan booking fee received, validitas SPK, KPR approved, SP3K issued, akad completed, refund paid, atau official closing. State tersebut tetap read-only dari authority Finance, Legal, Property, atau outcome governed.

Semua halaman domain Sales sudah memiliki struktur UI final: tabel, filter, tab, quick view/detail, state loading/unavailable/error yang dapat dikembangkan, serta form UX. Karena source authoritative belum tersedia, daftar tidak mengarang record dan mutation submit tetap disabled dengan pesan yang eksplisit.

## Deferred until dashboard phase complete

- Contracts required untuk projection dan capability mutation Sales.
- Backend services/projections required untuk data Sales dan freshness/scope.
- Cross-domain authority untuk Finance, Legal, Property, Strategy, dan governed closing.
- GENESIS extraction integration melalui jalur Backend yang ter-govern.

`workspace_key` pada URL hanya menentukan tujuan navigasi. Halaman Sales membandingkannya dengan active workspace projection dari Backend dan menolak akses apabila keduanya tidak sama.

> NEEDS CONTRACT / NEEDS DECISION: `division_code` saat ini merupakan string pada contract identity, belum enum atau capability khusus Sales. Web fail-closed kecuali nilainya tepat `SALES`; Backend dan Contracts perlu menetapkan mapping Sales yang canonical sebelum integrasi domain diaktifkan.
