# MVP-2 Stage 1 — Business & Executive Foundation

## 1. Tujuan Stage 1

Stage 1 mematangkan arsitektur informasi bisnis, Executive Command Center, Strategy & Performance, dashboard divisi, model presentasi frontend, data-requirement mapping, serta semantics lifecycle, authority, evidence, verification, metric, dan readiness. Stage ini tidak membuat integrasi baru.

## 2. System boundary

Alur authority tetap `ALOS Web → ALOS Backend → GENESIS`. ALOS Web hanya memproyeksikan data, readiness, dan keputusan yang diterima. Frontend tidak memiliki business authority, tidak menentukan hasil cross-check, tidak memanggil GENESIS/provider AI/bank/Meta/TikTok/GitHub/database/MCP/service eksternal secara langsung, serta tidak membuat endpoint, canonical contract, atau migration.

## 3. Audit kondisi awal

- `executive-dashboard`: sudah memiliki Decision Queue, Division Health, Early Warning, Project Distribution, dan konteks GENESIS/AI; struktur home masih delapan blok operasional dan belum memuat keseluruhan 14 area final.
- `sales-dashboard`, `property-dashboard`, `finance-dashboard`, `legal-dashboard`, `hr-dashboard`, dan `modules/it/overview`: sudah memiliki page guard, empty/readiness state, cadence, serta AI-support berlabel target capability. Model dan daftar area/KPI masih terfragmentasi.
- `modules/strategy`: sudah memakai `StrategySubmoduleRunner`, shared tabs, overview, objectives, KPI, initiatives, reviews, revisions, dan sources. Belum ada Renstra, RKAP/annual plan, serta target workspace.
- `workspace-routing`: allowlist dan normalisasi lowercase sudah fail-closed. Route Strategy baru ditambahkan pada arsitektur yang sama, bukan route paralel.
- `workspace-shell`: `ProtectedDomainWorkspace` memvalidasi session dan active workspace dari Backend. Mekanisme ini dipertahankan tanpa perubahan authority.
- Zero-fabrication sudah dominan: null menjadi `—` dan banyak source default `NOT_CONNECTED`. Stage 1 memusatkan aturan tersebut agar konsisten.

## 4. Business hierarchy

Satu-satunya hierarchy presentasi Stage 1:

`Strategic Horizon → Renstra → RKAP / Operating Plan → Corporate Objective → Corporate Target → Division Target → KPI → Initiative → Execution / Business Activity → Actual Performance → Performance Review → Corrective Action → Target Revision`

Hierarchy adalah relasi presentasi. Canonical identity dan validasi relasi tetap tanggung jawab Backend.

## 5. Information architecture

Executive Dashboard adalah monitoring surface. Executive Strategy adalah planning/governance surface. Dashboard divisi menampilkan monitoring operasional, definisi KPI, readiness, cadence, dan tautan Strategy kontekstual. Shared foundation berada di `src/features/business-foundation`; Strategy tetap di `src/modules/strategy`; RBAC tetap di workspace shell.

## 6. Entity/data dictionary

| Entity | Tujuan presentasi | Field penting |
|---|---|---|
| `BusinessPeriod` | Periode nilai/rencana | granularity, start, end |
| `BusinessScope` | Cakupan bisnis | type, ref, label |
| `BusinessSourceRef` | Provenance sumber | authoritative, readiness, observed_at |
| `BusinessEvidenceRef` | Referensi bukti | evidence_ref, captured_at, verification_state |
| `BusinessAuthorityRef` | Authority berbasis role/workspace | owner_role_ref, owner_workspace_ref, reviewer_role_refs, approver_role_ref |
| `MetricDefinition` | Definisi pengukuran | code, measurement_type, unit, scope |
| `MetricObservation` | Nilai satu semantics | kind, value, period, source, evidence, verification |
| `PerformanceMetric` | Proyeksi metric lengkap | target, actual, forecast, assumption, variance, achievement, state |
| `StrategicPlan` / `OperatingPlan` | Renstra dan RKAP | period, lifecycle, objective/target refs |
| `StrategicObjective` / `BusinessTarget` | Sasaran dan target | scope, owner role, lifecycle/performance |
| `TargetRelationship` | Cascading target | parent, child, relationship type |
| `KpiDefinition` / `Initiative` | KPI dan inisiatif | target refs, scope, lifecycle |
| `PerformanceReview` / `CorrectiveAction` | Review dan tindak lanjut | findings, evidence, due date |
| `TargetRevision` | Usulan perubahan target | proposed observation, reason, revision state |
| `StrategicSource` | Dokumen/sumber strategi | version, period, owner role, readiness |
| `ReportDefinition` / `ControlCadenceDefinition` | Reporting controls | frequency, due rule, evidence, status |
| `BusinessProcessStage` / `BusinessGate` | Tahap dan gate proses | sequence, role authority, verification |
| `CrossCheckRequirement` | Verifikasi lintas divisi | workspace refs, reviewer roles, verification |

Semua adalah frontend presentation model, bukan canonical Backend contract atau authoritative business state. Reference tidak dibuat sebagai canonical ID baru.

## 7. Lifecycle

Lifecycle: `DRAFT`, `UNDER_REVIEW`, `APPROVED`, `ACTIVE`, `SUPERSEDED`, `ARCHIVED`. Lifecycle menjawab posisi objek dalam siklus tata kelola, bukan kualitas kinerjanya.

Revision state: `PROPOSED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `SUPERSEDED`.

## 8. Performance states

`NOT_EVALUATED`, `ON_TRACK`, `AT_RISK`, `OFF_TRACK`, `ACHIEVED`. Performance state disimpan terpisah dari lifecycle dan verification.

## 9. Metric semantics

`TARGET`, `ACTUAL`, `FORECAST`, dan `ASSUMPTION` selalu merupakan observation terpisah. Setiap observation membawa `period`, `unit`, `source`, `observed_at`, `verified_at`, dan `evidence_refs`. Null tidak dikonversi menjadi nol. Measurement type: `HIGHER_IS_BETTER`, `LOWER_IS_BETTER`, `RANGE`, `EXACT`, `PERCENTAGE`, `RATIO`, `BINARY`, `MILESTONE`, `CUMULATIVE`. Unit: `IDR`, `COUNT`, `PERCENT`, `RATIO`, `MINUTE`, `HOUR`, `DAY`, `SCORE`, `UNIT`, `BOOLEAN`.

## 10. Scope model

Scope: `COMPANY`, `DIVISION`, `PROJECT`, `PROPERTY_UNIT`, `CHANNEL`, `CAMPAIGN`, `TEAM`, `ROLE`, `PROCESS`, `SYSTEM`. Granularity periode: `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `ANNUAL`, `CUSTOM`.

## 11. Authority model

Authority hanya direpresentasikan dengan `owner_role_ref`, `owner_workspace_ref`, `reviewer_role_refs`, dan `approver_role_ref`. Personel adalah actor assignment terhadap role dan tidak di-hardcode. Frontend tidak memutuskan authorisasi; `ProtectedDomainWorkspace` mempertahankan proyeksi access yang diberikan Backend dan fail closed bila scope tidak cocok.

## 12. Evidence/provenance model

Source dan evidence terpisah. Source menjelaskan asal, authoritative flag, readiness, dan waktu observasi. Evidence menjelaskan referensi bukti, waktu capture, URI opsional, serta verification state. Tidak ada synthetic evidence.

## 13. Verification model

State: `UNVERIFIED`, `PENDING_VERIFICATION`, `VERIFIED`, `CONFLICT`, `REJECTED`. Frontend hanya menampilkan state. Verified Closing, legal file validity, rekonsiliasi, hold point, dan maker/checker/approver tidak dihitung atau diputuskan di client.

## 14. Executive Dashboard structure

Urutan final: Data Freshness & Company Status; Business Headline; Corporate Target Performance; Commercial & Sales Funnel; Financial Health; Project & Construction Delivery; Legal / Permit / KPR Health; Workforce & Organization Health; IT & ALOS Health; Division Health; Early Warning; Decision Queue; GENESIS Intelligence; Reporting & Governance Cadence. Komponen Decision Queue, Division Health, Early Warning, Project Distribution, dan GENESIS/AI existing dipertahankan. Tabel foundation membedakan Target, Actual, Forecast, Assumption, Verification, dan readiness.

## 15. Strategy structure

Executive: Overview, Renstra, RKAP & Rencana Kerja, Target Perusahaan, Sasaran, KPI, Inisiatif, Review Kinerja, Revisi Target, Sumber Strategis.

Divisi: Overview, Renstra, Target Divisi, Sasaran, KPI, Inisiatif, Review Kinerja, Revisi Target, Sumber Strategis. RKAP tetap corporate planning surface pada Executive. Semua route menggunakan `StrategySubmoduleRunner` dan `ProtectedDomainWorkspace` yang sama.

## 16. Dashboard requirement seluruh divisi

- Sales: Performance Headline, Commercial Funnel delapan tahap, Lead Quality, Response & Follow-up, Channel Attribution, Campaign Performance, KPR/Akad Pipeline, Cancellation, cadence, readiness, AI Support; KPI-SM-01..06.
- Property: Project Portfolio, S-Curve, Budget vs RAB, milestones, 7 Hold Points, K3, defect/retention, geotag evidence, opname, material/delivery risk, cadence, readiness, AI Support; KPI-PR-01..06.
- Finance: cash, wallets, cashflow, budget, receivables, payables, reconciliation, KPR disbursement, tax, close, approval, cadence, readiness, AI Support; KPI-FN-01..06. Tidak ada koneksi bank Stage 1.
- Legal: land status, certificates, permits, contract review, KPR/notary, expiry, PDP, disputes, legal risk, cadence, readiness, AI Support; KPI-LG-01..06.
- HR: headcount, attendance, timesheet, payroll, recruitment, training, performance, SoD, retention, personnel administration, cadence, readiness, AI Support; KPI-HR-01..06.
- IT: systems, integrations, database, environments, repositories, CI/CD, releases, monitoring, security, incidents, backup/DR, AI cost, GENESIS runtime, cadence, readiness; KPI-IT-01..06. Tidak ada koneksi GitHub, database eksternal, atau observability baru.

## 17. Reporting cadence

Cadence reusable adalah `DAILY`, `WEEKLY`, `MONTHLY`. `ControlCadenceDefinition` membawa control_id, name, frequency, owner/reviewer role ref, due_rule, required_evidence, status, dan last_submission_at. Tidak ada scheduler atau workflow Backend pada Stage 1.

## 18. Cross-division presentation

Disiapkan untuk Sales ↔ Finance ↔ Legal, Property ↔ Finance, serta Finance maker/checker/approver. Default tanpa hasil authoritative adalah `UNVERIFIED`; UI tidak menyimpulkan hasil.

## 19. Data readiness semantics

- `LIVE`: hanya sumber authoritative dan masih fresh.
- `PARTIAL`: hanya sebagian data tersedia.
- `STALE`: data tersedia tetapi melewati freshness rule.
- `ERROR`: sumber seharusnya tersedia tetapi gagal.
- `NOT_CONNECTED`: integration source belum tersedia.
- `LOADING`: request authoritative sedang berlangsung.

Null numeric tampil `—`; tidak pernah menjadi `0`. `NOT_CONNECTED` tidak dipetakan menjadi `LIVE` atau `HEALTHY`.

## 20. Mapping file/component

| Concern | Implementasi |
|---|---|
| Enums dan presentation models | `src/features/business-foundation/enums.ts`, `types.ts` |
| Formatting metric | `performance.ts` |
| Lifecycle/performance guard | `lifecycle.ts` |
| Verification | `verification.ts` |
| Freshness/readiness | `data-readiness.ts` |
| Area dan KPI requirements | `data-requirements.ts` |
| Shared dashboard surface | `business-dashboard-foundation.tsx` |
| Strategy routing/tabs | `src/modules/strategy/shared/strategy-submodule-runner.tsx`, `strategy-tabs.tsx`, `strategy-constants.ts` |
| Renstra/RKAP/Target | `src/modules/strategy/planning/planning-workspaces.tsx` |
| Canonical route allowlist | `src/features/workspace-routing/routes.ts` |
| RBAC | `src/features/workspace-shell/protected-domain-workspace.tsx` (dipertahankan) |

## 21. Stage 1 Definition of Done

- Model foundation lengkap, null-safe, dan berkomentar non-canonical/non-authoritative.
- Route Executive Strategy lengkap dan division tabs context-aware.
- Executive dan seluruh dashboard divisi memuat requirement map tanpa fabricated operational value.
- Target/actual/forecast/assumption, lifecycle/performance, verification, source/evidence, authority, cadence, dan readiness terpisah.
- Existing RBAC/fail-closed tetap digunakan.
- Lint, typecheck, test, dan production build lulus.

## 22. Sengaja tidak diimplementasikan sampai Stage berikutnya

Backend endpoint/contract baru, database migration, GENESIS runtime change, AI/provider direct call, bank feed, Meta/TikTok/WhatsApp/Telegram/GitHub connector, MCP/Hermes/n8n, observability source, scheduler, automated verification, automated approval, authoritative cross-check, mock API, dan penyimpanan API key tidak termasuk Stage 1.

## 23. Data requirement menuju Stage 2

Backend perlu menyediakan canonical IDs, actor-role assignments, authoritative timestamps, freshness policy per source, observation terpisah untuk empat semantics nilai, evidence lineage, verification outcomes, lifecycle transitions, cadence submissions, dan cross-workspace reconciliation. Sampai tersedia, presentation tetap `NOT_CONNECTED`/`UNVERIFIED` dan value `null`.
