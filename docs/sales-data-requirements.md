# Sales Data Requirements

## Current canonical integration (2026-10-02)

Status aktual: **PARTIAL** untuk seluruh kebutuhan Stage 3; capability internal yang didukung tercatat **CONNECTED** di [canonical coverage matrix](canonical-business-coverage.md). Table dan form historis di bawah tetap menyimpan kebutuhan asli, termasuk field yang belum mempunyai authority. Label historis NEEDS BACKEND / SOURCE UNAVAILABLE tidak menyatakan kondisi runtime terkini.

| Capability | Current status | Owner / source and boundary |
|---|---|---|
| Supported internal records / dedicated forms | CONNECTED | Sales/Marketing recorded CRM, pipeline, pricing, campaigns and attribution; material win/booking/closing/pricing actions use Shared Work approvals |
| Entire Stage 3 metric/form requirements | PARTIAL | Only accepted canonical fields and Backend-projected actions are active; historical wishlist fields are not invented |
| Production ARA/GENESIS / automatic extraction or reasoning | DEFERRED_TO_AI | Existing readiness only; no provider integration in this work |
| External/live sources and provider execution | DEFERRED_TO_CONNECTOR | UNAVAILABLE in UI until connected; recorded sources remain explicit |
| Unsupported final business policy / sensitive sources | UNAVAILABLE | Fail closed; see exact exceptions in canonical coverage matrix |

## Historical Stage 3 requirements


| Component ID | Purpose | Authority/source | Current availability |
| --- | --- | --- | --- |
| `sales.summary.headline` | Target, closing, pipeline, conversion | Strategy dan closing terverifikasi | UI FINAL / SOURCE UNAVAILABLE |
| `sales.pipeline.table` | Pipeline dan tindak lanjut | Sales pipeline authoritative | UI FINAL / SOURCE UNAVAILABLE |
| `sales.leads.table` | Prospek sesuai scope dan klasifikasi | Lead service | UI FINAL / SOURCE UNAVAILABLE |
| `sales.booking.table` | Booking dan status lintas domain | Sales, Finance, Legal, Property | UI FINAL / SOURCE UNAVAILABLE |
| `sales.campaign.table` | Atribusi channel dan CPL | Campaign service | UI FINAL / SOURCE UNAVAILABLE |
| `sales.performance` | Target dan aktual Sales | Strategy + official closing | UI FINAL / SOURCE UNAVAILABLE |
| `sales.activities.table` | Aktivitas, follow-up, dan survey | Sales activity service | UI FINAL / SOURCE UNAVAILABLE |
| `sales.kpr.journey` | Tahap KPR, SP3K, dan akad | Finance + Legal + Sales projection | UI FINAL / SOURCE UNAVAILABLE |
| `sales.shared-work` | Proyek, tugas, persetujuan, dokumen, laporan, temuan | Shared Work universal | UI READY / masing-masing sumber dapat NEEDS BACKEND |
| `sales.ara` | Pertanyaan dan advisory sesuai scope | GENESIS advisory via ALOS Backend | READINESS ONLY / NEEDS INTEGRATION |

Setiap data harus membawa scope, owner, period, verification, evidence, freshness, classification, dan destination detail sebelum menjadi runtime UI.

Ketiadaan sumber tidak boleh diterjemahkan menjadi nilai nol, risiko aman, atau closing aktual. Candidate closing tetap berbeda dari official closing.

## Deferred until dashboard phase complete

- Contracts required.
- Backend services/projections required.
- Cross-domain authority and governed outcome projections.
- GENESIS extraction integration.
