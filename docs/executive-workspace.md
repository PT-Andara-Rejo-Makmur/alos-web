# Executive Workspace

Executive is a governed read/projection layer over canonical Strategy and Shared Work.
It owns no business database, entity lifecycle, KPI, approval system or AI summary.

## Actual menu and page audit

| Existing menu/page | Actual source and behavior |
| --- | --- |
| Ringkasan / Pusat Kendali Eksekutif (`summary`) | One GET `/api/v1/executive/overview`; renders canonical Strategy target details, Shared Work counts/previews and source lineage |
| Brief Eksekutif (`brief`) | Same overview; factual plan, approval, finding, project/task/report/document counts and unavailable domains; no LLM |
| Rencana & Target (`planning`) | Dedicated Strategy API for strategic/operating plans, objectives, company targets, assumptions, cascade, constraints and lifecycle |
| Kinerja (`performance`) | Dedicated Strategy API; Backend-selected observations, performance, verification, owner, period and lifecycle; target detail uses target/version |
| Review & Revisi (`reviews`) | Canonical target revision and history APIs; performance review narrative remains unavailable because no canonical review source exists |
| Verification (`performance` action/drawer) | Canonical Strategy observation verification and planning verification; permission gated |
| Assumptions, cascade, history | Existing planning/review/detail tabs and drawers; no added navigation menu |
| Inisiatif Strategis (`initiatives`) | Readiness only; no canonical initiative or project-to-strategy relationship is inferred |
| Divisi (`divisions`) | Dedicated Strategy targets where explicit scope permits; business-domain connection remains unavailable |
| Detail Divisi (`divisions/{sales,property,finance,legal,hr,it}`) | Strategy detail where explicit scope exists; division Shared Work tabs remain unavailable because no canonical division-to-workspace projection exists |
| Proyek, Tugas, Persetujuan, Laporan, Temuan, Dokumen | Existing canonical Shared Work list/detail APIs; active workspace visibility; default Executive is read-oriented |
| Tanya ARA and Analisis GENESIS | READINESS ONLY / Belum Terhubung; no new calls, prompt, summary or recommendation |

Routes use `/workspace/[workspaceKey]/...`, with workspaceKey from the authoritative
active session. `/workspace/executive` remains a compatibility redirect to the actual
active key. The existing navigation, CSS and responsive AppShell are retained.

## Data flow and visibility

Summary and brief use `useExecutiveOverview` in `executive-data.ts`. They do not fetch
separate Strategy lists or Shared Work endpoints to assemble a competing overview.
Dedicated Strategy screens retain `useExecutiveStrategyData` for detail and commands.
The unused ExecutiveStrategyData declaration was removed.

The Backend requires an active principal, EXECUTIVE, strategy.read and work.read.
IT_ADMIN alone grants no Executive access. Company Strategy authority remains with
Strategy. Shared Work remains within tenant, organization and existing active workspace
links; company context never opens every company workspace. A source shared into the
Executive workspace is visible there. Documents retain workspace ownership. Existing
Shared Work details have the same boundary as overview links.

Counts cover every matching record. Preview lists contain at most 50 canonical entities
per collection and link to existing list/detail routes. Sources carry authoritative
timestamps; loading the page never creates a source update timestamp. Unknown times
remain `—`. Workspace changes remount the overview consumer and abort its old request.

## Source states and honest metrics

| Canonical state | Rendering |
| --- | --- |
| Loading | Memuat; no numbers |
| CONNECTED | Terhubung, canonical data |
| CONNECTED_EMPTY | Terhubung · Belum ada data; successful empty state and known empty counts |
| UNAVAILABLE | Belum Terhubung, `—`, no invented zero |
| ERROR | Gagal Memuat, `—`; no empty-state substitution |

Strategy source failure leaves Shared Work renderable and vice versa. Whole-request
errors remain errors. Session expiry and denied authority have distinct messages.
Summary targets render Backend performance and selected TARGET/ACTUAL/FORECAST;
NOT_EVALUATED remains Belum Dinilai. Web does not calculate performance again.

Pendapatan, Penjualan / Closing, Kas & Likuiditas and Progres Proyek remain unavailable
until Sales/Finance/Property have dedicated canonical sources. Keputusan Menunggu
uses Backend PENDING approval count. Temuan Aktif replaces the over-specific risk label
and uses unresolved canonical finding count. Severity is rendered directly with existing
Shared Work badges, never inferred from text. RETURNED, REJECTED, HELD and HOLD retain
their meanings. No Segarkan Data button is introduced.

Domain status is deliberately UNAVAILABLE for Sales & Marketing, Property & Teknik,
Finance & Pajak, Legal, HR/GA and IT. Generic domain CRUD does not change this status.
Document extraction, initiative lifecycle, company risk scores, cross-workspace division
aggregation and GENESIS/ARA integration remain outside this closure.
