# Property Cross-domain Matrix

| State/outcome | Authority | Property UI |
| --- | --- | --- |
| Project technical delivery | Property | Property-owned |
| Physical progress and milestone | Property | Property-owned |
| Technical quality and inspection | Property | Property-owned |
| Contractor technical delivery | Property | Property-owned |
| Unit technical readiness | Property | Property-owned |
| Handover readiness | Property, governed where required | Projection/readiness |
| Payment, paid status, cash, settlement | Finance | Read-only |
| Legal validity, permits, title, contract validity | Legal | Read-only |
| Lead, booking commercial relationship, official selling outcome | Sales | Read-only |
| Corporate target | Strategy | Read-only |
| Approval decision | Backend governance/authorized approver | Read-only |
| Project identity | Shared Work Project | Referenced, not duplicated |
| Finding | Shared Work Finding | Referenced |
| Corrective Action | Shared Work Task | Referenced |

Property dan Sales tidak membuat dua source unit availability. Technical readiness dan commercial projection tetap dipisahkan; status gabungan resmi menunggu Backend projection.

Frontend form/action Property tidak memiliki authority untuk cross-domain state. Jika capability belum canonical, action disabled/unavailable.

## Deferred until dashboard phase complete

- Canonical projection contracts.
- Backend cross-domain query and command boundaries.
- Approval/evidence governance.
- GENESIS extraction integration.
