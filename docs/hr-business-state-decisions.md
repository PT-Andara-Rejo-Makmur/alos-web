# HR / GA Business State Decisions

Semua item berikut **NEEDS DECISION / NEEDS CONTRACT** dan tidak boleh diputuskan oleh frontend:

- employee lifecycle dan employment state
- organization/position/vacancy lifecycle
- recruitment candidate/interview/offer lifecycle
- onboarding dan probation lifecycle
- attendance correction dan leave lifecycle
- people performance review dan development lifecycle
- compensation/benefit change lifecycle
- compliance requirement dan document validity
- offboarding, clearance, handover, dan final status
- GA facility request, inventory, maintenance, dan asset handover
- payroll ownership dan batas Finance
- manager/owner authority dan self-approval
- privacy, retention, masking, search, export, dan audit policy
- classification PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED policy
- AI/extraction candidate acceptance, human review, dan official record

Pertanyaan yang harus dijawab oleh governance/backend: apakah employee terpisah dari identity actor; bagaimana versioning employment; sumber attendance dan cuti; siapa pemilik payroll; bagaimana review dikunci; bagaimana termination memengaruhi IT access; bagaimana benefit dibatasi; bagaimana employee document retention; dan bagaimana data GA direlasikan ke Shared Work.

## Master decision register

Status seluruh item di bawah ini tetap **NEEDS DECISION / NEEDS CONTRACT / NEEDS BACKEND**. Frontend hanya menyediakan struktur readiness dan tidak menetapkan model canonical.

### Authority and entity questions

- Apakah ALOS HRIS authoritative atau hanya projection dari sistem sumber?
- Bagaimana definisi Employee entity?
- Apakah Person dan Employee merupakan entity yang berbeda?
- Bagaimana Position model dan hubungannya dengan organisasi serta kebutuhan headcount?
- Bagaimana konversi Candidate menjadi Employee?
- Bagaimana hierarchy organisasi dan relasi manager ditetapkan?
- Siapa pemilik perhitungan payroll?
- Payroll dihitung oleh ALOS atau external source?
- Apa sumber attendance dan leave entitlement?
- Bagaimana compensation history dan versioning disimpan?
- Bagaimana integrasi employee access dengan IT/Identity?
- Bagaimana performance rating ditetapkan dan dikunci?
- Bagaimana disciplinary case model dan aksesnya?
- Bagaimana retention, masking, search, export, dan audit data HR?
- Apa ownership GA untuk fasilitas, aset, dan permintaan layanan?

### Lifecycle register

Lifecycle berikut belum canonical dan tidak boleh disimpulkan dari status UI:

- Employee lifecycle
- Candidate lifecycle
- Vacancy lifecycle
- Recruitment lifecycle dan recruitment stage
- Onboarding lifecycle
- Probation lifecycle
- Attendance state dan correction lifecycle
- Leave lifecycle
- Performance Review lifecycle
- Compensation lifecycle dan versioning
- Payroll lifecycle
- Employment Change lifecycle
- Offboarding lifecycle

### Authority boundaries

- AI/extraction candidate bukan keputusan hire, reject, promote, terminate, atau rating final.
- Employment document ada bukan berarti valid secara Legal.
- HR menyiapkan entitlement payroll; Finance memiliki pembayaran, settlement, dan rekonsiliasi.
- HR meminta atau menampilkan kesiapan akses; IT/Identity menjalankan provisioning dan revocation.
- Perubahan employment dan compensation harus effective-dated/versioned serta tidak menimpa history.
- Shared Work tetap memiliki Project, Task, Approval, Document, Report, dan Finding.

### Error and conflict readiness

- unavailable, connected-empty, connected-data, loading, dan error adalah state yang berbeda.
- Conflict atau HTTP 409 tidak boleh dianggap berhasil; frontend hanya menampilkan readiness/error manusiawi sampai aturan retry, merge, dan verifikasi ditetapkan.
- Conflict resolution, optimistic concurrency, dan version conflict tetap **NEEDS CONTRACT / NEEDS BACKEND**.

## Freeze guard invariants

Register ini menjadi invariant regression untuk frontend readiness. Semua keputusan authoritative tetap berada pada source domain dan governance.

- Headcount, payroll, attendance, dan HR Case yang belum bersumber tidak boleh diubah menjadi `0`, `Rp0`, `Hadir`, atau `Tidak Ada Kasus`.
- Candidate extraction bukan keputusan employment; AI tidak boleh hire, reject, promote, terminate, atau menetapkan rating akhir.
- Protected attributes (race/ethnicity, religion, health, political belief, sexual orientation, family status) bukan input ranking atau keputusan employment.
- Employment document tersedia bukan berarti kontrak sah secara Legal.
- Payroll preparation HR bukan payment execution; `Paid`, `Settled`, dan `Reconciled` adalah state Finance-owned.
- Joiner/Mover/Leaver HR bukan provisioning atau revocation teknis; Provision, Revoke, System Access, dan Admin Permission adalah IT/Identity-owned.
- Checklist onboarding tetap readiness sampai sumber authoritative tersedia; hasil probation memerlukan human review.
- Koreksi attendance merupakan record terpisah dan tidak menimpa event asli; leave balance dan approval policy bukan konstanta frontend.
- Promotion, termination, dan final performance rating tidak ditentukan AI.
- Employment change effective-dated; compensation change versioned; history employment, compensation, dan offboarding tidak ditimpa.
- Frontend tidak menetapkan classification PUBLIC, INTERNAL, CONFIDENTIAL, atau RESTRICTED tanpa source/governance.
- Search dan readiness tidak boleh membocorkan salary, bank, tax, government ID, atau restricted HR Case.
- Entity relation memakai sumber pilihan resmi; user tidak memasukkan raw internal ID.
- HTTP 409/version conflict bukan success dan tidak boleh menimpa data yang lebih baru.
