# HR / GA Form Requirements

Status: **UI READINESS / NEEDS CONTRACT**. Form dapat ditampilkan sebagai struktur UX, tetapi submit disabled sampai sumber, permission, dan contract resmi tersedia. Entity relation dipilih dari sumber authoritative; user tidak mengetik internal ID.

| Form ID | Purpose | Required Fields | Optional Fields | Generated Fields | Source | Permission | Classification | Evidence | Verification | Approval | Lifecycle | Submit | Result Entity | Destination | Error | Conflict | Availability |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| hr.position.create | kebutuhan posisi | Nama Posisi, Divisi | Melapor Kepada, Jenis Peran, Jenis Kepegawaian, Headcount Need, Deskripsi, Persyaratan | identifier, audit | NEEDS CONTRACT | NEEDS DECISION | INTERNAL | optional | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Position | `/organization` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.vacancy.create | lowongan | Posisi, Divisi, Penanggung Jawab Rekrutmen, Headcount, Alasan | Hiring Manager, Jenis Kepegawaian, Target Isi, Persyaratan, Deskripsi, Rentang Kompensasi, Kebutuhan Persetujuan | identifier | NEEDS CONTRACT | NEEDS DECISION | INTERNAL | optional | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Vacancy | `/recruitment` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.candidate.create | kandidat | Nama, Kontak, Posisi, CV | Email, Sumber, Portfolio, Ketersediaan, Catatan | candidate ID | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | NEEDS CONTRACT | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Candidate | `/recruitment` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.interview.create | interview | Kandidat, Jenis Interview, Tanggal & Waktu, Interviewer | Lokasi/Media, Template Penilaian, Catatan | identifier | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | optional | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Interview | `/recruitment` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.offer.create | penawaran | Kandidat, posisi | tanggal, catatan | identifier | NEEDS CONTRACT | NEEDS DECISION | RESTRICTED | NEEDS CONTRACT | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Offer | `/recruitment` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.employee.create | employee record | Kandidat/Identitas Terpilih, Posisi, Divisi, Jenis Kepegawaian, Tanggal Mulai | Dokumen | employee ID | NEEDS CONTRACT | NEEDS DECISION | RESTRICTED | NEEDS CONTRACT | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Employee | `/employees` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.onboarding.update | onboarding | Karyawan, Tanggal Mulai | Posisi, Divisi, Pendamping, checklist | audit | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | optional | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Onboarding | `/onboarding` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.leave.request | cuti | Karyawan, Jenis Cuti, Mulai, Selesai | Alasan, Bukti Pendukung, Serah Terima | request ID | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | policy evidence | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Leave Request | `/attendance` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.performance.review | review | Karyawan, Periode, Peninjau | Sasaran, Hasil, Kompetensi, Umpan Balik, Rencana Pengembangan | review ID | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | optional | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Review | `/people-performance` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.compensation.change | perubahan benefit | Karyawan, jenis, tanggal berlaku | bukti, catatan | audit | NEEDS CONTRACT | NEEDS DECISION | RESTRICTED | NEEDS CONTRACT | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Compensation Change | `/compensation` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.employment.change | perubahan kerja | Karyawan, Jenis Perubahan, Tanggal Berlaku, Status Baru, Alasan | Status Lama, Bukti Pendukung | audit | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | optional | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Employment Change | `/employees` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.offboarding.start | offboarding | Karyawan, Alasan, Tanggal Kerja Terakhir, Manager | Knowledge Transfer, Asset Return, Access Revocation, Final Documents, Finance Settlement, Catatan | checklist ID | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | NEEDS CONTRACT | NEEDS DECISION | NEEDS DECISION | NEEDS DECISION | Disabled | Offboarding | `/offboarding` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |
| hr.document.extract | telaah dokumen | Dokumen sumber | catatan telaah | candidate fields | NEEDS CONTRACT | NEEDS DECISION | sesuai sumber | document | human review | NEEDS DECISION | Ilustrasi UX, bukan lifecycle canonical | Disabled | Candidate Review | `/compliance` | human-readable | NEEDS DECISION | SOURCE UNAVAILABLE |

## UI field alignment

The following fields are represented by readiness UI. Required markers are rendered by the form primitive; relation and controlled vocabulary fields remain disabled until an authoritative source exists.

| Form ID | Required UI fields | Optional UI fields | Sensitive / generated boundary |
|---|---|---|---|
| hr.position.create | Nama Posisi, Divisi | Melapor Kepada, Jenis Peran, Jenis Kepegawaian, Headcount Need, Deskripsi, Persyaratan | identifier generated; no raw internal ID |
| hr.vacancy.create | Posisi, Divisi, Penanggung Jawab Rekrutmen, Headcount, Alasan | Hiring Manager, Jenis Kepegawaian, Target Isi, Persyaratan, Deskripsi, Rentang Kompensasi, Kebutuhan Persetujuan | compensation range restricted |
| hr.candidate.create | Nama, Kontak, Posisi, CV | Email, Sumber, Portfolio, Ketersediaan, Catatan | no candidate_id, created_at, created_by |
| hr.interview.create | Kandidat, Jenis Interview, Tanggal & Waktu, Interviewer | Lokasi/Media, Template Penilaian, Catatan | no canonical Proceed/Hold/Reject enum |
| hr.offer.create | Kandidat, Posisi | Jenis Kepegawaian, Tanggal Mulai, Paket Kompensasi, Benefit, Referensi Kontrak, Catatan | restricted compensation; approval undecided |
| hr.employee.create | Kandidat/Identitas Terpilih, Posisi, Divisi, Jenis Kepegawaian, Tanggal Mulai | Dokumen | personal, bank, tax, health forms require later authority |
| hr.onboarding.update | Karyawan, Tanggal Mulai | Posisi, Divisi, Pendamping, checklist sources | access is IT-owned; equipment is GA/IT-owned |
| hr.leave.request | Karyawan, Jenis Cuti, Mulai, Selesai | Alasan, Bukti Pendukung, Serah Terima | balance is not calculated in frontend |
| hr.performance.review | Karyawan, Periode, Peninjau | Sasaran, Hasil, Kompetensi, Umpan Balik, Rencana Pengembangan | human review; no AI final rating |
| hr.compensation.change | Karyawan, Jenis Perubahan, Tanggal Berlaku | Bukti Pendukung, Catatan | no salary/payment state without authority |
| hr.employment.change | Karyawan, Jenis Perubahan, Tanggal Berlaku, Status Baru, Alasan | Status Lama, Bukti Pendukung | effective-dated; history is not overwritten |
| hr.offboarding.start | Karyawan, Alasan, Tanggal Kerja Terakhir, Manager | Knowledge Transfer, Asset Return, Access Revocation, Final Documents, Finance Settlement, Catatan | settlement Finance-owned; access IT-owned |
| hr.document.extract | Dokumen sumber | Catatan telaah | candidate is not authoritative; no fake candidate |

### Employee readiness sub-forms

These are separate readiness surfaces, not one giant edit form. They remain **NEEDS CONTRACT / NEEDS BACKEND** and do not expose sensitive values without authority.

| Form ID | Required UI fields | Optional UI fields | Availability / boundary |
|---|---|---|---|
| hr.employee.personal-data | Karyawan, Nama | Kontak | Disabled until employee source is available |
| hr.employee.employment-assignment | Karyawan, Posisi, Divisi, Tanggal Berlaku | Jenis Kepegawaian | Effective-dated; history is retained |
| hr.employee.compensation | Karyawan, Tanggal Berlaku | — | Restricted readiness; no salary value rendered |
| hr.employee.documents | Karyawan, Dokumen Pendukung | — | Shared Work Document authority; SOURCE UNAVAILABLE |
| hr.employee.emergency-contact | Karyawan, Nama Kontak, Hubungan, Kontak | — | Sensitive contact policy NEEDS DECISION |
| hr.employee.bank | Karyawan | — | Restricted readiness; Finance/source authority required |
| hr.employee.tax | Karyawan | — | Restricted readiness; policy and source NEEDS DECISION |
