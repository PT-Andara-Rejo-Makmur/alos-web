# Property Data Requirements

## Current canonical integration (2026-10-02)

Status aktual: **PARTIAL** untuk seluruh kebutuhan Stage 3; capability internal yang didukung tercatat **CONNECTED** di [canonical coverage matrix](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/canonical-business-coverage.md). Table dan form historis di bawah tetap menyimpan kebutuhan asli, termasuk field yang belum mempunyai authority. Label historis NEEDS BACKEND / SOURCE UNAVAILABLE tidak menyatakan kondisi runtime terkini.

| Capability | Current status | Owner / source and boundary |
|---|---|---|
| Supported internal records / dedicated forms | CONNECTED | Property unit/project/construction/quality/safety/change/payment/handover/land records; reserve/sell/approve use action-scoped approvals |
| Entire Stage 3 metric/form requirements | PARTIAL | Only accepted canonical fields and Backend-projected actions are active; historical wishlist fields are not invented |
| Production ARA/GENESIS / automatic extraction or reasoning | DEFERRED_TO_AI | Existing readiness only; no provider integration in this work |
| External/live sources and provider execution | DEFERRED_TO_CONNECTOR | UNAVAILABLE in UI until connected; recorded sources remain explicit |
| Unsupported final business policy / sensitive sources | UNAVAILABLE | Fail closed; see exact exceptions in canonical coverage matrix |

## Historical Stage 3 requirements


| Area | Authority/source | Frontend status |
| --- | --- | --- |
| Project portfolio | Shared Work Project + Property technical projection | UI FINAL / SOURCE UNAVAILABLE |
| Physical progress | Property construction/progress projection | UI FINAL / SOURCE UNAVAILABLE |
| Schedule/milestone | Property milestone projection | UI FINAL / SOURCE UNAVAILABLE |
| Work package/execution | Property construction package projection | UI FINAL / SOURCE UNAVAILABLE |
| Unit technical readiness | Property unit projection | UI FINAL / SOURCE UNAVAILABLE |
| Inspection/quality | Property inspection + Shared Work Finding/Task | UI FINAL / SOURCE UNAVAILABLE |
| Contractor delivery | Property technical delivery projection | UI FINAL / SOURCE UNAVAILABLE |
| Legal contractor state | Legal projection | Read-only / SOURCE UNAVAILABLE |
| Payment/financial actual | Finance projection | Read-only / SOURCE UNAVAILABLE |
| RAB/BOQ | Property technical planning projection | UI FINAL / SOURCE UNAVAILABLE |
| Material requirement | Property material requirement projection | UI FINAL / SOURCE UNAVAILABLE |
| Target/performance | Strategy target + governed technical outcomes | UI FINAL / SOURCE UNAVAILABLE |
| Sales/commercial unit state | Sales projection | Read-only / SOURCE UNAVAILABLE |

Null atau unavailable tidak diterjemahkan menjadi angka nol, `Tepat Waktu`, `Aman`, `Available`, atau status operasional lain. UI menggunakan `—`, `Belum Terhubung`, `Belum Dinilai`, atau `Belum ada data` sesuai source state.

Source state harus mutually exclusive: `loading`, `unavailable`, `error`, `connected-empty`, atau `connected-data`. Ringkasan tidak menghitung deviasi, readiness, target, actual, atau status lintas domain jika baseline/source authoritative belum tersedia. Financial, Legal, dan Sales pada Summary, Unit, dan Kontraktor selalu read-only projection.

Portfolio dan detail teknis memakai canonical Shared Work Project sebagai identity. Unit memisahkan Status Konstruksi, Kesiapan Teknis, Status Komersial, dan Serah Terima; Status Komersial berasal dari Sales. Contractor memisahkan Pelaksanaan Teknis, Status Legal, dan Pembayaran. S-Curve hanya boleh dirender bila observasi progres authoritative tersedia.

## Required projection properties

Projection masa depan harus membawa workspace scope, canonical record identity, source, freshness, period, classification, verification, evidence, dan permission/capability context. Candidate extraction bukan authoritative state.

## Deferred until dashboard phase complete

- Contracts required.
- Backend services/projections required.
- Governance untuk verified progress, quality, material, dan handover.
- GENESIS extraction integration.
