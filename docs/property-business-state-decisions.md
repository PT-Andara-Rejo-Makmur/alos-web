# Property Business State Decisions

Dokumen ini mencatat state yang belum memiliki canonical source yang siap dipakai frontend. UI hanya menyediakan struktur dan source-honest state; dokumen ini bukan pengganti Contracts atau Backend authority.

| Area | Decision status | Catatan |
| --- | --- | --- |
| Unit lifecycle | NEEDS DECISION | Definisi state konstruksi, technical readiness, commercial projection, dan handover harus dipisahkan. |
| Progress lifecycle | NEEDS DECISION | Perlu definisi observation, evidence, verification, period, dan koreksi. |
| Inspection lifecycle | NEEDS DECISION | Perlu definisi inspection result, finding relation, severity, dan closure authority. |
| Milestone lifecycle | NEEDS DECISION | Perlu definisi planned/forecast/actual, dependency, dan exception. |
| Work Package model | NEEDS DECISION | Harus tetap berbeda dari Shared Work Task. |
| RAB/BOQ relation | NEEDS DECISION | Perlu definisi baseline, revision, item, quantity, dan approval material. |
| Opname lifecycle | NEEDS DECISION | Perlu definisi draft, verification, approval, dan evidence. |
| Contractor relation | NEEDS DECISION | Perlu definisi project/package relation dan technical delivery projection. |
| Material Request lifecycle | NEEDS DECISION | Perlu definisi requirement, reservation, procurement projection, dan payment boundary. |
| Handover lifecycle | NEEDS DECISION | Perlu definisi readiness, evidence, Legal/Finance dependency, dan approval. |

UI yang tersedia saat ini adalah struktur readiness, bukan keputusan lifecycle: field form, tab detail, alur quality, dan review ekstraksi tidak menetapkan state authoritative. Candidate ekstraksi tidak menjadi draft atau active tanpa human review dan verification dari service yang canonical.

## Deferred until dashboard phase complete

- Contracts decision dan schema.
- Backend service/projection implementation.
- Cross-domain governance.
- GENESIS extraction integration.
