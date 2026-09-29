# Legal Form Requirements

Status form: **UI READINESS / SUBMIT UNAVAILABLE** sampai permission, contract, dan penyimpanan resmi tersedia. Teks ini adalah kebutuhan UX, bukan keputusan lifecycle.

| Form ID | Purpose | Required Fields | Optional Fields | Generated Fields | Source | Permission | Classification | Evidence | Verification | Approval | Lifecycle | Submit | Result Entity | Destination | Error | Conflict | Availability |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| legal.contract.create | draf kontrak | pihak, tipe, judul, tanggal | proyek, nilai, catatan | ID, versi, audit | Legal | NEEDS CONTRACT | CONFIDENTIAL | dokumen pendukung | Legal | governance | NEEDS DECISION | disabled | contract | `/contracts` | manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.permit.create | catat perizinan | nama izin, pihak berwenang, status sumber | proyek/aset, tanggal berlaku | ID, audit | Legal | NEEDS CONTRACT | CONFIDENTIAL | dokumen izin | Legal | governance bila diperlukan | NEEDS DECISION | disabled | permit | `/permits` | manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.case.create | catat perkara/klaim | judul, pihak, ringkasan | proyek, tenggat, nilai klaim | ID, timeline | Legal | NEEDS CONTRACT | RESTRICTED | dokumen perkara | Legal | governance | NEEDS DECISION | disabled | case | `/cases` | manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.obligation.create | catat kewajiban | jenis, sumber, tenggat | owner, proyek/aset, catatan | ID, reminder | Legal | NEEDS CONTRACT | CONFIDENTIAL | bukti kewajiban | Legal | governance | disabled | obligation | `/obligations` | manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.review.create | meminta review | objek, tujuan, prioritas | tenggat, dokumen | ID, audit | Legal/authorized requester | NEEDS CONTRACT | CONFIDENTIAL | dokumen pendukung | reviewer | approver bila material | NEEDS DECISION | disabled | review | `/reviews` | manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.document.extract | membaca dokumen | dokumen sumber | tipe objek | candidate fields | layanan ekstraksi | NEEDS CONTRACT | mengikuti sumber | dokumen | manusia/backend | sesuai objek | Ilustrasi UX, bukan lifecycle canonical | disabled | candidate draft | detail terkait | manusiawi | candidate bukan hasil resmi | Belum Terhubung |

User tidak mengisi tenant, organization, workspace ID, internal ID, atau status final melalui teks bebas. Identitas entity dipilih dari sumber resmi saat picker tersedia.

Flow ekstraksi `Dokumen → Ekstraksi → Kandidat → Telaah Manusia → Draf → Verifikasi → Persetujuan bila diperlukan → Aktif` hanyalah ilustrasi UX sampai Contracts/Backend/governance menetapkan lifecycle.
