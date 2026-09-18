# CROSS_REPO_BLOCKER — MVP2 H1 Frontend

`alos-web` hanya memanggil ALOS Backend. Factory contract sudah diadopsi; dependency
Registry summary, Research request, dan browser authentication boundary masih terbuka.

## RESOLVED — Factory contract

- Owner: `alos-contracts`, `alos-backend`, dan `alos-web`
- Tersedia: `POST /api/v1/genesis/factory/analyze`
- Request: business requirement saja; identity, scope, dan permission dibentuk Backend.
- Response: keputusan `REUSE` dengan existing capability reference, atau `CREATE` dengan
  canonical `CapabilityDraft`/`AgentDraft` berstatus `DRAFT`.
- Frontend mengonsumsi canonical `FactoryAnalyzeResponse` melalui
  `src/features/factory/backend-adapter.ts` dan hanya menampilkan registry state `DRAFT`
  yang benar-benar dikembalikan Backend.

## P0 — Browser authentication handoff

- Owner: `alos-web` deployment/auth integration dan `alos-backend`
- Backend Factory API mewajibkan bearer principal.
- `alos-web` tidak menyimpan token atau membuat principal lokal. Deployment boundary harus
  menyediakan sesi Backend atau bearer credential yang terautentikasi sebelum Factory bisa
  digunakan end-to-end dari browser.

## P1 — Registry summary

- Owner: `alos-contracts` dan `alos-backend`
- Dibutuhkan: read-only Agent/Capability summary untuk IT yang memuat purpose, type, version,
  scope, risk, tools, lifecycle, dan readiness.
- Frontend tidak membuat fallback registry state.

## P1 — Research request

- Owner: `alos-contracts` dan `alos-backend`
- Dibutuhkan: `POST /api/v1/research/requests` untuk mode INTERNAL/EXTERNAL dan satu dari empat
  domain R&D.
- Backend tetap memiliki permission, source policy, external egress, evidence, audit, dan
  governance.
- Frontend seam: `src/features/research/backend-adapter.ts`.

## Generated TypeScript

Canonical Factory types sudah dihasilkan di `alos-contracts/generated/typescript` dan dikonsumsi
secara type-only melalui `src/lib/contracts`. Package publication masih dibutuhkan agar
`alos-web` dapat dibangun sebagai checkout standalone tanpa sibling repository.
