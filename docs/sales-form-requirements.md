# Sales Form Requirements

| Form ID | Purpose | Required fields | Authority | Availability |
| --- | --- | --- | --- | --- |
| `sales.lead.create` | Mencatat lead | Nama, kontak, sumber, owner | Permission Sales | NEEDS CONTRACT |
| `sales.activity.create` | Mencatat interaksi | Lead, jenis, waktu, hasil | Permission Sales | NEEDS CONTRACT |
| `sales.booking.submit` | Mengajukan booking | Lead, project, unit, tanggal | Permission Sales + Property | NEEDS CONTRACT |
| `sales.booking.cancel` | Mengajukan pembatalan | Booking, alasan, bukti pendukung | Permission Sales; keputusan/refund Finance | NEEDS CONTRACT / NEEDS INTEGRATION |
| `sales.campaign.create` | Mencatat campaign | Nama, tujuan, channel, periode, owner | Permission Marketing | NEEDS CONTRACT |
| `sales.kpr.document` | Menambahkan dokumen KPR sesuai izin | KPR, dokumen, klasifikasi | Permission Sales + document policy | NEEDS CONTRACT |
| `sales.observation.create` | Mencatat observasi manual jika diizinkan | Subjek, catatan, waktu | Permission authoritative | NEEDS CONTRACT |
| `sales.document.extraction` | Mengambil kandidat isian dari dokumen | Dokumen terklasifikasi, tujuan draft | Governed extraction + human review | NEEDS INTEGRATION |

Form tidak menampilkan field generated atau identity internal. Dokumen dapat menghasilkan kandidat yang harus ditinjau manusia; kandidat tidak pernah langsung authoritative.

Tidak ada form yang submit atau menyatakan berhasil sebelum capability Backend dan contract tersedia. Pilihan `Isi Manual` atau `Ambil dari Dokumen` akan memakai alur kandidat → tinjau manusia → draft → verifikasi → state authoritative setelah integrasi tersedia.
