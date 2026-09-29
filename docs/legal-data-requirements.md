# Legal Data Requirements

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
