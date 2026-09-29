# IT Data Requirements

Status keseluruhan: UI FINAL / SOURCE UNAVAILABLE; NEEDS CONTRACT dan NEEDS BACKEND untuk sumber berikut.

| Component ID | Menu | Entity/Metric | Scope | Period | Owner | Source | Verification | Classification | Authority | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| it.summary | Ringkasan | layanan, insiden, akun, akses, aset, dukungan | workspace | current | IT | IT services + Identity | Backend | INTERNAL/RESTRICTED sesuai source | IT untuk operasi teknis | NEEDS BACKEND |
| it.services | Layanan & Insiden | service/incident | workspace | current/history | IT | service management | Backend | INTERNAL | IT | NEEDS CONTRACT |
| it.systems | Sistem & Aplikasi | application inventory | organization/workspace | current | IT | CMDB/source system | Backend | INTERNAL | IT | NEEDS BACKEND |
| it.infrastructure | Infrastruktur & Lingkungan | component/environment | workspace | current | IT | infrastructure source | Backend | RESTRICTED bila sensitif | IT | NEEDS BACKEND |
| it.identity | Akun Karyawan | employee reference, account, workspace access | organization/workspace | effective-dated | HR + IT | HR + Identity | Backend | CONFIDENTIAL | Identity governance | NEEDS CONTRACT |
| it.security | Keamanan & Kepatuhan | control/event/review | organization | period | IT/security governance | security source | Backend/governance | RESTRICTED | security governance | NEEDS DECISION |
| it.changes | Perubahan & Rilis | change/release | workspace | scheduled/history | IT | change management | approval/audit | INTERNAL | IT governance | NEEDS CONTRACT |
| it.assets | Aset IT | asset assignment/state | workspace | current/history | IT/GA | asset source | Backend | INTERNAL | IT/GA ownership | NEEDS BACKEND |
| it.support | Dukungan & Permintaan | support request | workspace | current/history | IT | support source | Backend | INTERNAL | IT | NEEDS CONTRACT |
| it.performance | Target & Kinerja | Strategy target, IT actual, forecast | workspace | period | Strategy + IT | Strategy + IT | source-specific | INTERNAL | Strategy for target, IT for actual | INTEGRATION PENDING |
| it.sessions | Sesi | device/browser/created/last activity/status | actor | current/history | Identity | session service | Backend | RESTRICTED | Identity | NEEDS CONTRACT |

Freshness, evidence, reconciliation, retention, and classification policy remain source/governance decisions. Unknown values render `—`, unavailable sources `Belum Terhubung`, connected empty `Belum ada data`, and errors as human-readable error state.
