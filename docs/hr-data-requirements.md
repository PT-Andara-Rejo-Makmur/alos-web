# HR / GA Data Requirements

Sumber operasional canonical kini terhubung sesuai [mapping Legal, HR & GA dan IT](legal-hr-it-operations.md). Catatan SOURCE UNAVAILABLE berikut merekam desain awal; capability tanpa persistence/authority tetap unavailable.

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

## Component-level coverage

| Component ID | Component / Tab | Primary Entity or Metric | Authority / Source | Classification | Destination | Availability |
|---|---|---|---|---|---|---|
| hr.summary.workforce | Workforce Summary | Division, Headcount, Open Position, Joiner, Leaver | HR | INTERNAL | `/summary` | SOURCE UNAVAILABLE |
| hr.summary.recruitment | Recruitment Attention | Position, Candidate, Stage, Next Action | HR | CONFIDENTIAL | `/summary` | SOURCE UNAVAILABLE |
| hr.summary.employment | Employment Attention | Probation, Contract, Onboarding, Documents, Offboarding | HR + source domains | CONFIDENTIAL | `/summary` | SOURCE UNAVAILABLE |
| hr.organization.structure | Struktur | Unit, Position, Person | HR | INTERNAL | `/organization` | SOURCE UNAVAILABLE |
| hr.organization.headcount | Headcount | Approved, Filled, Vacant, Capacity | HR/Strategy | INTERNAL | `/organization` | SOURCE UNAVAILABLE |
| hr.recruitment.vacancy | Posisi Terbuka | Vacancy and hiring need | HR | CONFIDENTIAL | `/recruitment` | SOURCE UNAVAILABLE |
| hr.recruitment.candidate | Kandidat | Candidate pipeline | HR | CONFIDENTIAL | `/recruitment` | SOURCE UNAVAILABLE |
| hr.recruitment.interview | Interview | Interview schedule and assessment | HR | CONFIDENTIAL | `/recruitment` | SOURCE UNAVAILABLE |
| hr.recruitment.offer | Offer | Offer readiness and approval | HR/Legal/Finance as applicable | RESTRICTED | `/recruitment` | SOURCE UNAVAILABLE |
| hr.onboarding.checklist | Onboarding | Documents, Equipment, Access, Orientation | HR + IT/GA | CONFIDENTIAL | `/onboarding` | SOURCE UNAVAILABLE |
| hr.onboarding.probation | Masa Percobaan | Start, Expected End, Reviewer, Result | HR, human reviewer | CONFIDENTIAL | `/onboarding` | SOURCE UNAVAILABLE |
| hr.employees.list | Karyawan | employment summary without sensitive PII | HR | CONFIDENTIAL | `/employees` | SOURCE UNAVAILABLE |
| hr.attendance.events | Kehadiran | attendance event and verification | HR source | CONFIDENTIAL | `/attendance` | SOURCE UNAVAILABLE |
| hr.leave.requests | Cuti | leave request and evidence | HR policy/source | CONFIDENTIAL | `/attendance` | SOURCE UNAVAILABLE |
| hr.performance.people | People Performance | review, goals, development, training | HR | CONFIDENTIAL | `/people-performance` | SOURCE UNAVAILABLE |
| hr.compensation.payroll-prep | Persiapan Payroll | entitlement and impacts, no payment state | HR prepares / Finance executes | RESTRICTED | `/compensation` | SOURCE UNAVAILABLE |
| hr.compliance.documents | Dokumen & Kepatuhan | requirements and verification | Shared Work Document + HR/Legal | CONFIDENTIAL | `/compliance` | SOURCE UNAVAILABLE |
| hr.offboarding.checklist | Offboarding | access, asset, documents, settlement readiness | HR + IT/GA/Finance/Legal | CONFIDENTIAL | `/offboarding` | SOURCE UNAVAILABLE |
| hr.ga.facilities | GA & Fasilitas | facility request and inventory readiness | GA | INTERNAL | `/ga` | SOURCE UNAVAILABLE |
| hr.performance.strategy | Target & Kinerja | Strategy target, HR actual/forecast | Strategy for target; HR for actual | INTERNAL | `/performance` | Strategy partial / HR unavailable |
| shared-work.dependencies | Shared Work | Project, Task, Approval, Document, Report, Finding | Shared Work | classification by source | shared routes | REUSED |
| ara.dependency | ARA | assistant context only | ARA/session | classification by source | `/ara` | REUSED |

Payroll, bank, tax, government identity, attendance detail, and health data need explicit minimization and access policy before integration.
