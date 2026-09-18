# Migrasi Frontend MVP-1

Audit dilakukan terhadap `andara-alos-ai/alos` branch `develop` pada pinned commit
`01416390287114a451a22e16ff14e493df43362f`. Source memiliki 68 file frontend dan 24 file test.
Source tidak diubah dan tidak dipakai dari branch `main`.

## Feature yang dimigrasikan

- Genesis chat, conversation history, context picker, Agent candidate, run projection, dan upload.
- Document Center, review/checklist, follow-up, document analysis, dan workspace selector.
- Agent Registry, Agent builder, hierarchy, lifecycle, dan runtime projection.
- Governance Control Plane, permission, model policy, budget, runtime, audit, serta remediation UX.
- Release request, lima taxonomy test, review, kill switch, rollback, dan lifecycle history.
- Source Registry, verification, vault configuration, dan evidence citation view.
- Portfolio divisi/proyek, operational task/finding/report/approval, dan executive dashboard.
- Seluruh 24 test MVP-1 yang relevan, dipindahkan ke `tests/mvp1/`.

Implementasi UI asli dipertahankan di `src/features/mvp1/`. Experience baru melakukan composition
tanpa menyalin ulang business state:

- Business: executive, portfolio, document, task, approval, finding, dan report projection.
- ARA: Genesis chat/workspace untuk kolaborasi human-AI.
- GENESIS: governance, Agent, source/evidence, monitoring, dan release assurance UI untuk IT.
- Director: executive projection dan ReviewPackage executive projection.

## Adaptasi arsitektur

Client relatif monolith diganti dengan `src/lib/api/`. Semua request sekarang membutuhkan
`NEXT_PUBLIC_ALOS_API_BASE_URL`, menambahkan correlation handling, dan hanya membentuk URL ALOS
Backend. Endpoint bernama `/api/v1/genesis/...` tetap endpoint publik Backend; nama path tersebut
tidak memberi browser URL atau credential GENESIS.

UI tidak memakai mock ketika Backend belum dikonfigurasi. `Mvp1MigrationBoundary` menampilkan
status eksplisit beserta dependency endpoint. State permission, approval, release, dan business
record hanya dianggap final setelah response Backend.

Type pada `src/features/mvp1/lib/` adalah compatibility projection endpoint legacy. Type tersebut
belum menjadi shared contract baru. `alos-contracts/generated/typescript` saat ini belum menerbitkan
type, sehingga projection akan diganti bertahap setelah generator/package tersedia.

## Dependency API Backend

Kelompok endpoint MVP-1 yang masih diperlukan:

- identity/session: `/api/v1/whoami`, auth login/logout;
- workspace/document/source: workspaces, documents, uploads, source registry, evidence;
- AI projection: Genesis conversation, context option, active Agent, analysis, follow-up;
- registry/governance: Agent, permission policy, tool, model policy, budget, audit;
- release: request, test evidence, review, decision, kill switch, rollback, activation;
- business: executive dashboard, divisions, portfolio, projects, tasks, findings, approvals,
  reports, notifications, dan integration status.

Backend bootstrap saat ini belum menyediakan seluruh endpoint tersebut. Karena itu UI terkait
bersifat migrated-but-disconnected, bukan fake production feature.

## Sementara belum didukung

- GIIVEPRO tidak memiliki implementasi khusus pada MVP-1 dan tetap memakai shell baseline.
- Generated TypeScript contract belum tersedia.
- Login/session cookie lintas origin dan seluruh endpoint domain perlu direkonsiliasi dengan
  public OpenAPI Backend sebelum aktivasi production.
- Asset bitmap branding MVP-1 tidak dimigrasikan; UI memakai layout/CSS yang tetap berfungsi
  tanpa menjadikan asset lama sebagai dependency tersembunyi.

## Deprecated

- Relative monolith fetch yang mengandalkan aplikasi berada pada origin yang sama.
- Route legacy `/governance`, `/agents`, `/releases`, dan root module pages. Navigasi dipetakan ke
  `/genesis` atau `/business/[module]`.
- Local DTO lintas service sebagai source of truth permanen.
- Semua direct browser integration ke GENESIS/provider, walaupun source MVP-1 tidak memilikinya.
