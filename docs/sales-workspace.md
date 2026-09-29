# Sales & Marketing Workspace

Ruang kerja Sales berada di `/workspace/[workspaceKey]` sesuai `workspace_key` pada active workspace yang diproyeksikan Backend. Akses hanya terbuka untuk workspace bertipe `BUSINESS` dengan `division_code` `SALES`; parameter URL, role lokal, dan penyimpanan browser tidak memberikan akses.

| Menu | Route | Ketersediaan |
| --- | --- | --- |
| Ringkasan | `/summary` | CONTROL CENTER STRUCTURE READY / sumber Sales belum terhubung |
| Pipeline Penjualan | `/pipeline` | TABLE/FILTER STRUCTURE READY / NEEDS CONTRACT dan NEEDS BACKEND |
| Prospek & Lead | `/leads` | READINESS ONLY / NEEDS CONTRACT dan NEEDS BACKEND |
| Aktivitas & Tindak Lanjut | `/activities` | READINESS ONLY / NEEDS CONTRACT dan NEEDS BACKEND |
| Booking & Closing | `/bookings` | READINESS ONLY / NEEDS CONTRACT dan NEEDS INTEGRATION Finance, Legal, dan Property |
| KPR & Akad | `/kpr` | READINESS ONLY / NEEDS CONTRACT dan NEEDS INTEGRATION Finance dan Legal |
| Campaign & Channel | `/campaigns` | READINESS ONLY / NEEDS CONTRACT dan NEEDS BACKEND |
| Target & Kinerja | `/performance` | READINESS ONLY / NEEDS INTEGRATION Strategy Sales |
| Proyek, Tugas, Persetujuan, Dokumen, Laporan, Temuan | route Shared Work | Shared Work universal |
| Tanya ARA | `/ara` | READINESS ONLY / NEEDS INTEGRATION |

Nilai yang belum authoritative ditampilkan sebagai `—`; tidak ada catatan, metrik, atau closing simulasi.

Ringkasan bersifat read-first dan tidak menyediakan form input utama. Pipeline menyediakan filter, stage summary, tabel daftar, dan quick view; belum ada baris bisnis karena source pipeline authoritative belum tersedia.

Sales tidak dapat menetapkan booking fee received, validitas SPK, KPR approved, SP3K issued, akad completed, refund paid, atau official closing. State tersebut tetap read-only dari authority Finance, Legal, Property, atau outcome governed.

`workspace_key` pada URL hanya menentukan tujuan navigasi. Halaman Sales membandingkannya dengan active workspace projection dari Backend dan menolak akses apabila keduanya tidak sama.

> NEEDS CONTRACT / NEEDS DECISION: `division_code` saat ini merupakan string pada contract identity, belum enum atau capability khusus Sales. Web fail-closed kecuali nilainya tepat `SALES`; Backend dan Contracts perlu menetapkan mapping Sales yang canonical sebelum integrasi domain diaktifkan.
