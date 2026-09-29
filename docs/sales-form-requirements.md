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

Frontend saat ini menyediakan UI final untuk Lead, Activity, Booking Request, Cancellation Request, Campaign, KPR Document, serta review extraction. Form tidak menampilkan field generated atau identity internal. Semua tombol simpan tetap disabled/unavailable sampai capability dan contract authoritative tersedia; tidak ada submit endpoint spekulatif dan tidak ada success palsu.

Dokumen mengikuti alur `Document → Extraction → Candidate Fields → Human Review → Draft → Verification → Authoritative State`. Panel kiri menampilkan source, panel kanan menampilkan candidate fields. Setiap field memiliki status `Perlu Diperiksa` dan action Accept/Edit/Ignore sebagai struktur UX; action tersebut disabled selama integration belum tersedia.

Tidak ada form yang submit atau menyatakan berhasil sebelum capability Backend dan contract tersedia. Pilihan `Isi Manual` atau `Ambil dari Dokumen` akan memakai alur kandidat → tinjau manusia → draft → verifikasi → state authoritative setelah integrasi tersedia.

## Deferred until dashboard phase complete

- Contracts required untuk form command dan validation.
- Backend services/projections required untuk persistence dan status.
- Cross-domain authority untuk booking, KPR, legal, dan closing.
- GENESIS extraction integration.
