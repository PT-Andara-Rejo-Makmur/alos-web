# Legal Data Requirements

## Current canonical integration (2026-10-02)

Status aktual: **PARTIAL** untuk seluruh kebutuhan Stage 3; capability internal yang didukung tercatat **CONNECTED** di [canonical coverage matrix](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/canonical-business-coverage.md). Table dan form historis di bawah tetap menyimpan kebutuhan asli, termasuk field yang belum mempunyai authority. Label historis NEEDS BACKEND / SOURCE UNAVAILABLE tidak menyatakan kondisi runtime terkini.

| Capability | Current status | Owner / source and boundary |
|---|---|---|
| Supported internal records / dedicated forms | CONNECTED | 13 Legal canonical resources including distinct LegalReview and immutable ContractRevision → real Shared Work document version; assessment does not imply signature/execution |
| Entire Stage 3 metric/form requirements | PARTIAL | Only accepted canonical fields and Backend-projected actions are active; historical wishlist fields are not invented |
| Production ARA/GENESIS / automatic extraction or reasoning | DEFERRED_TO_AI | Existing readiness only; no provider integration in this work |
| External/live sources and provider execution | DEFERRED_TO_CONNECTOR | UNAVAILABLE in UI until connected; recorded sources remain explicit |
| Unsupported final business policy / sensitive sources | UNAVAILABLE | Fail closed; see exact exceptions in canonical coverage matrix |

## Historical Stage 3 requirements


Sumber operasional canonical kini terhubung sesuai [mapping Legal, HR & GA dan IT](legal-hr-it-operations.md). Catatan SOURCE UNAVAILABLE berikut merekam desain awal; capability tanpa persistence/authority tetap unavailable.

Status seluruh komponen: **NEEDS CONTRACT / NEEDS BACKEND**.

| Component ID | Menu | Tujuan | Entity/Metric | Scope | Periode | Owner | Target Source | Actual Source | Forecast Source | Data Source | Verification | Evidence | Freshness | Classification | Authority | Destination | Availability |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| legal.summary | Ringkasan | kontrol risiko dan kewajiban | risiko, kontrak, permit, tenggat | workspace | periodik | Legal | Strategi bila tersedia | Legal | Legal/Strategi bila disepakati | NEEDS BACKEND | Backend/governance | Shared Work Document | NEEDS DECISION | sesuai kebijakan | Legal | halaman detail | Belum Terhubung |
| legal.risks | Risiko & Kepatuhan | pantau risiko dan kewajiban | risk, requirement, finding | workspace/proyek | periodik | Legal | Strategi bila tersedia | Legal | NEEDS DECISION | NEEDS BACKEND | Legal review | evidence resmi | NEEDS DECISION | CONFIDENTIAL/RESTRICTED bila perlu | Legal/governance | detail risiko/Shared Work Finding | Belum Terhubung |
| legal.contracts | Kontrak & Perjanjian | daftar dan review kontrak | contract, version, obligation | workspace/proyek | berlaku | Legal | NEEDS DECISION | Legal | NEEDS DECISION | NEEDS CONTRACT | Legal | Shared Work Document | NEEDS DECISION | CONFIDENTIAL | Legal | `/contracts/[contractId]` | Belum Terhubung |
| legal.reviews | Review Legal | telaah permintaan legal | review, finding, decision | workspace | workflow | Legal | NEEDS DECISION | Legal | NEEDS DECISION | NEEDS BACKEND | reviewer/approver | dokumen pendukung | NEEDS DECISION | CONFIDENTIAL | Legal/governance | review detail | Belum Terhubung |
| legal.permits | Perizinan | pantau izin dan masa berlaku | permit, deadline | proyek/aset | berlaku | Legal | NEEDS DECISION | Legal | NEEDS DECISION | NEEDS CONTRACT | Legal | Shared Work Document | NEEDS DECISION | CONFIDENTIAL | Legal | `/permits/[permitId]` | Belum Terhubung |
| legal.assets | Legalitas Proyek & Aset | pantau status legal aset | asset, title, permit | proyek/aset | berlaku | Legal | NEEDS DECISION | Legal | NEEDS DECISION | NEEDS CONTRACT | Legal | dokumen legal | NEEDS DECISION | RESTRICTED bila perlu | Legal | `/assets/[assetId]` | Belum Terhubung |
| legal.cases | Sengketa & Klaim | pantau perkara dan klaim | case, claim, timeline | workspace/proyek | berjalan | Legal | NEEDS DECISION | Legal | NEEDS DECISION | NEEDS BACKEND | Legal/governance | dokumen perkara | NEEDS DECISION | RESTRICTED | Legal | `/cases/[caseId]` | Belum Terhubung |
| legal.obligations | Kewajiban & Tenggat | pantau kewajiban | obligation, deadline | workspace | periodik | Legal | NEEDS DECISION | Legal | NEEDS DECISION | NEEDS CONTRACT | Legal | bukti kewajiban | NEEDS DECISION | CONFIDENTIAL | Legal | detail kewajiban | Belum Terhubung |
| legal.performance | Target & Kinerja | tampilkan target Legal | target, KPI | workspace/period | periode target | Strategy | Strategy | Legal/Backend | Strategy bila tersedia | Strategy + NEEDS BACKEND | Strategy/governance | sesuai target | Strategy | INTERNAL | Strategy/Legal | kinerja | Sebagian Tersedia |

Target berasal dari Strategy bila tersedia. Aktual dan perkiraan Legal tidak boleh disimpulkan dari ketiadaan data atau dari target.
