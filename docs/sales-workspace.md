# Sales & Marketing Workspace

Ruang kerja Sales berada di `/workspace/[workspaceKey]` sesuai `workspace_key` pada active workspace yang diproyeksikan Backend. Akses hanya terbuka untuk workspace bertipe `BUSINESS` dengan `division_code` `SALES`; parameter URL, role lokal, dan penyimpanan browser tidak memberikan akses.

| Menu | Route | Ketersediaan |
| --- | --- | --- |
| Ringkasan | `/summary` | UI READY / sumber Sales belum terhubung |
| Pipeline Penjualan | `/pipeline` | UI READY / NEEDS CONTRACT dan NEEDS BACKEND |
| Prospek & Lead | `/leads` | UI READY / NEEDS CONTRACT dan NEEDS BACKEND |
| Aktivitas & Tindak Lanjut | `/activities` | UI READY / NEEDS CONTRACT dan NEEDS BACKEND |
| Booking & Closing | `/bookings` | UI READY / NEEDS CONTRACT dan NEEDS INTEGRATION Finance, Legal, dan Property |
| KPR & Akad | `/kpr` | UI READY / NEEDS CONTRACT dan NEEDS INTEGRATION Finance dan Legal |
| Campaign & Channel | `/campaigns` | UI READY / NEEDS CONTRACT dan NEEDS BACKEND |
| Target & Kinerja | `/performance` | UI READY / NEEDS INTEGRATION Strategy Sales |
| Proyek, Tugas, Persetujuan, Dokumen, Laporan, Temuan | route Shared Work | Shared Work universal |
| Tanya ARA | `/ara` | READINESS ONLY / NEEDS INTEGRATION |

Nilai yang belum authoritative ditampilkan sebagai `—`; tidak ada catatan, metrik, atau closing simulasi.

`workspace_key` pada URL hanya menentukan tujuan navigasi. Halaman Sales membandingkannya dengan active workspace projection dari Backend dan menolak akses apabila keduanya tidak sama.

> NEEDS CONTRACT / NEEDS DECISION: `division_code` saat ini merupakan string pada contract identity, belum enum atau capability khusus Sales. Web fail-closed kecuali nilainya tepat `SALES`; Backend dan Contracts perlu menetapkan mapping Sales yang canonical sebelum integrasi domain diaktifkan.
