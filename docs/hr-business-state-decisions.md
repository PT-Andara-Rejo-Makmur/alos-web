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
