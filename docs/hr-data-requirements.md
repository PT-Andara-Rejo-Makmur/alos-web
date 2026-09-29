# HR / GA Data Requirements

Status: **NEEDS CONTRACT / NEEDS BACKEND**. Tabel berikut adalah registry kebutuhan, bukan klaim source sudah tersedia.

| Component ID | Menu | Purpose | Entity/Metric | Scope | Period | Owner | Target Source | Actual Source | Forecast Source | Data Source | Verification | Evidence | Freshness | Classification | Authority | Destination | Availability |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| hr.summary | Ringkasan | kontrol SDM | workforce, talent, attendance | workspace | period | HR | Strategy bila tersedia | HR source | NEEDS DECISION | NEEDS BACKEND | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS DECISION | INTERNAL/CONFIDENTIAL | HR governance | `/summary` | SOURCE UNAVAILABLE |
| hr.organization | Organisasi & Tenaga Kerja | struktur dan kebutuhan | organization, position | workspace | current | HR | Strategy/HR | HR source | NEEDS DECISION | NEEDS BACKEND | NEEDS CONTRACT | optional | NEEDS DECISION | INTERNAL | HR governance | `/organization` | SOURCE UNAVAILABLE |
| hr.recruitment | Rekrutmen & Kandidat | pipeline talent | vacancy, candidate | workspace | period | HR | workforce plan | HR source | NEEDS DECISION | NEEDS BACKEND | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | HR governance | `/recruitment` | SOURCE UNAVAILABLE |
| hr.employees | Karyawan | daftar dan status kerja | employee | workspace | current | HR | organization plan | HR source | NEEDS DECISION | NEEDS BACKEND | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL/RESTRICTED | HR governance | `/employees` | SOURCE UNAVAILABLE |
| hr.attendance | Kehadiran & Cuti | kehadiran dan leave | attendance, leave | workspace | period | HR | policy | HR source | NEEDS DECISION | NEEDS BACKEND | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS DECISION | CONFIDENTIAL | HR governance | `/attendance` | SOURCE UNAVAILABLE |
| hr.performance | Target & Kinerja | target HR | target, KPI | workspace | period | Strategy/HR | Strategy | HR source | NEEDS CONTRACT | Strategy + HR | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS DECISION | INTERNAL | governance | `/performance` | SOURCE UNAVAILABLE |
| hr.compensation | Kompensasi & Benefit | readiness compensation | compensation, benefit | restricted | period | HR/Finance | Strategy | HR/Finance | NEEDS DECISION | NEEDS BACKEND | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS DECISION | RESTRICTED | authorized governance | `/compensation` | SOURCE UNAVAILABLE |
| hr.compliance | Dokumen & Kepatuhan | dokumen SDM | requirement, document | workspace | current | HR/Legal | policy | HR/Legal | NEEDS DECISION | Shared Work Document | NEEDS CONTRACT | document | NEEDS DECISION | CONFIDENTIAL | HR/Legal | `/compliance` | SOURCE UNAVAILABLE |
| hr.ga | GA & Fasilitas | fasilitas | facility request, inventory | GA scope | period | GA | Strategy bila ada | GA source | NEEDS DECISION | NEEDS BACKEND | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS DECISION | INTERNAL | GA governance | `/ga` | NEEDS CONTRACT |

Payroll, bank, tax, government identity, attendance detail, and health data need explicit minimization and access policy before integration.
