# Property Form Requirements

Frontend menyediakan UX untuk:

- Technical Project Profile.
- Progress Entry.
- Milestone dan Work Package.
- Unit Readiness.
- Inspection.
- Material Request.
- RAB Draft/Revisi.
- Opname.
- Handover readiness.

Semua form saat ini `UI FINAL / SOURCE UNAVAILABLE`. Field yang terlihat hanya field bisnis yang dapat diisi user; tenant, organization, workspace internal, actor internal ID, generated field, raw permission refs, dan identity teknis internal tidak dijadikan input manual.

Submit disabled sampai canonical capability dan contract tersedia. Tidak ada endpoint speculative, fake success, atau state authoritative yang dibuat browser.

## Field matrix

- Technical Project Profile: Proyek, Lokasi, Tipe Proyek, Fase, Penanggung Jawab Teknis, Baseline Mulai, Baseline Selesai, Deskripsi. Identitas proyek tetap canonical Shared Work Project.
- Progress Entry: Proyek, Work Package, Periode/Tanggal, Rencana %, Aktual %, Kuantitas, Unit, Evidence, Catatan.
- Milestone: Nama, Proyek, Tanggal Rencana, Owner, Work Package, Dependency, Evidence requirement, Deskripsi.
- Unit Readiness: Unit, Status Teknis, Kesiapan Teknis, Status Inspeksi, Perkiraan Siap, Evidence, Catatan. Tidak ada field untuk mengubah status booking Sales.
- Inspection: Proyek, Unit/Work Package, Jenis Inspeksi, Tanggal, Inspector, Checklist, Hasil, Evidence, Catatan.
- Material Request: Proyek, Work Package, Material, Kuantitas, Unit, Tanggal Kebutuhan, Alasan, Spesifikasi, Evidence.
- RAB Draft/Revisi: RAB → Section → Work Item → Volume → Unit → Harga Satuan → Jumlah.
- Opname: Proyek, Kontraktor, Work Package, Periode, Kuantitas Terukur, Progress Klaim, Progress Terverifikasi, Evidence, Inspector, Status.
- Handover readiness: Proyek/Unit, Penyelesaian Teknis, Inspeksi Akhir, Penyelesaian Cacat, Kesiapan, Evidence, Referensi Dokumen BAST, Catatan.

Semua form tersebut memakai drawer UI dengan status mutation unavailable. Tidak ada form yang menyatakan pembayaran, status legal, status komersial, atau handover authoritative.

## Document extraction UX

Flow: `Document → Extraction → Candidate → Human Review → Draft → Verification → Approval bila material → Active`.

Review memakai panel kiri untuk source document dan panel kanan untuk candidate fields. Bila engine belum tersedia, panel kanan menampilkan `Belum ada kandidat ekstraksi` dan tidak menampilkan action review. Action `Terima`, `Edit`, `Abaikan`, dan `Simpan Draft` hanya boleh muncul setelah engine menghasilkan candidate nyata; confidence tidak ditampilkan tanpa engine source.

## Authority boundaries

Property boleh mengelola UX technical delivery bila capability tersedia. Property tidak boleh mengubah payment, paid status, cash, bank settlement, legal validity, commercial Sales state, corporate target, atau approval decision.

## Deferred until dashboard phase complete

- Form command contracts and validation.
- Backend persistence/projections and authorization.
- Cross-domain approval/authority integration.
- GENESIS extraction integration.
