# Legal Form Requirements

## Current canonical integration (2026-10-02)

Status aktual: **PARTIAL** untuk seluruh kebutuhan Stage 3; capability internal yang didukung tercatat **CONNECTED** di [canonical coverage matrix](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/canonical-business-coverage.md). Table dan form historis di bawah tetap menyimpan kebutuhan asli, termasuk field yang belum mempunyai authority. Label historis NEEDS BACKEND / SOURCE UNAVAILABLE tidak menyatakan kondisi runtime terkini.

| Capability | Current status | Owner / source and boundary |
|---|---|---|
| Supported internal records / dedicated forms | CONNECTED | 13 Legal canonical resources including distinct LegalReview and immutable ContractRevision → real Shared Work document version; assessment does not imply signature/execution |
| Entire Stage 3 metric/form requirements | PARTIAL | Only accepted canonical fields and Backend-projected actions are active; historical wishlist fields are not invented |
| Production ARA/GENESIS / automatic extraction or reasoning | DEFERRED_TO_AI | Existing readiness only; no provider integration in this work |
| External/live sources and provider execution | DEFERRED_TO_CONNECTOR | UNAVAILABLE in UI until connected; recorded sources remain explicit |
| Unsupported final business policy / sensitive sources | UNAVAILABLE | Fail closed; see exact exceptions in canonical coverage matrix |

## Historical Stage 3 requirements


Status seluruh form: **UI FINAL / SOURCE UNAVAILABLE**. Submit tetap **Disabled** sampai permission, Contracts/Backend, evidence, verification, dan governance tersedia. Lifecycle di bawah adalah `NEEDS DECISION`; alur ekstraksi adalah ilustrasi UX, bukan lifecycle canonical.

| Form ID | Purpose | Required Fields | Optional Fields | Generated Fields | Source | Permission | Classification | Evidence | Verification | Approval | Lifecycle | Submit | Result Entity | Destination | Error | Conflict | Availability |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| legal.contract.create | catat draf kontrak | pihak, tipe, judul, tanggal | proyek, nilai, catatan | ID, versi, audit | Legal | NEEDS CONTRACT | source policy | dokumen pendukung | Legal | governance | NEEDS DECISION | Disabled | Contract | `/contracts` | pesan manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.contract.review | telaah kontrak | kontrak, ruang lingkup, kesimpulan | isu, rekomendasi, bukti | ID review, audit | Legal | NEEDS CONTRACT | source policy | dokumen sumber | peninjau | governance | NEEDS DECISION | Disabled | Legal Review | `/reviews` | pesan manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.contract.amend | ajukan perubahan kontrak | kontrak asal, dokumen perubahan, alasan | tanggal berlaku, ringkasan, bukti | ID amendment, versi baru | Legal | NEEDS CONTRACT | source policy | dokumen perubahan | Legal | governance | NEEDS DECISION | Disabled | Contract Amendment | `/contracts` | pesan manusiawi | tidak menimpa versi asal | Belum Terhubung |
| legal.permit.create | catat perizinan | nama izin, pihak berwenang, jenis | proyek/aset, tanggal berlaku, klasifikasi | ID, audit | Legal | NEEDS CONTRACT | source policy | dokumen izin | Legal | governance bila perlu | NEEDS DECISION | Disabled | Permit | `/permits` | pesan manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.permit.update | ajukan pembaruan izin | perizinan asal, perubahan, alasan | tanggal berlaku, dokumen, bukti | ID update, audit | Legal | NEEDS CONTRACT | source policy | dokumen pendukung | Legal | governance | NEEDS DECISION | Disabled | Permit Update | `/permits` | pesan manusiawi | tidak mengubah validitas diam-diam | Belum Terhubung |
| legal.risk.create | catat risiko legal | judul, kategori, penanggung jawab | objek, dampak, kemungkinan, severity, mitigasi, tenggat, bukti | ID, audit | Legal | NEEDS CONTRACT | source policy | bukti risiko | Legal | governance | NEEDS DECISION | Disabled | Legal Risk | `/risks` | pesan manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.case.create | catat perkara/klaim | judul, pihak, ringkasan | proyek, tenggat, nilai klaim | ID, timeline, audit | Legal | NEEDS CONTRACT | RESTRICTED bila ditetapkan sumber | dokumen perkara | Legal | governance | NEEDS DECISION | Disabled | Case | `/cases` | pesan manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.obligation.create | catat kewajiban | jenis, sumber, tenggat | owner, proyek/aset, catatan | ID, pengingat | Legal | NEEDS CONTRACT | source policy | bukti kewajiban | Legal | governance | NEEDS DECISION | Disabled | Obligation | `/obligations` | pesan manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.review.create | meminta review Legal | subjek, versi dokumen, ruang lingkup review, penilaian, kesimpulan | isu, rekomendasi, bukti, peninjau | ID review, audit | Legal/authorized requester | NEEDS CONTRACT | source policy | dokumen pendukung | peninjau | approver bila material | NEEDS DECISION | Disabled | Legal Review | `/reviews` | pesan manusiawi | NEEDS DECISION | Belum Terhubung |
| legal.document.extract | membaca dokumen | dokumen sumber | tipe objek | kandidat field | layanan ekstraksi | NEEDS CONTRACT | mengikuti sumber | dokumen sumber | manusia/backend | sesuai objek | NEEDS DECISION | Disabled | Candidate Draft | detail terkait | pesan manusiawi | kandidat bukan state resmi | Belum Terhubung |

Entity references seperti Workspace, Project, Document, Contract, Permit, Owner, dan Counterparty dipilih dari sumber resmi saat tersedia; user tidak mengetik internal ID. Classification dan materiality menggunakan selector readiness disabled ketika vocabulary belum tersedia.

Flow `Dokumen → Ekstraksi → Kandidat → Telaah Manusia → Draf → Verifikasi → Persetujuan bila diperlukan → Aktif` adalah ilustrasi UX, bukan lifecycle canonical.
