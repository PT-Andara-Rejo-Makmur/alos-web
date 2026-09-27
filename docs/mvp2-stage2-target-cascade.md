# MVP-2 Stage 2 — Web Strategy Integration

Dokumen authority lengkap berada pada `alos-backend/docs/mvp2-stage2-target-cascade.md`. Web mempertahankan boundary `ALOS Web → ALOS Backend Strategy Domain`; tidak ada perhitungan target authoritative, inference verification, direct GENESIS call, provider AI, atau connector eksternal.

## Mapping

- `src/lib/contracts/index.ts`: facade ke generated strategy types `alos-contracts` 1.10.0.
- `src/modules/strategy/backend/strategy-api.ts`: adapter untuk endpoint canonical authority, plan create/read/update, objective, target detail/observations, assumptions, cascade preview/accept, dan lifecycle commands.
- `src/modules/strategy/planning/planning-workspaces.tsx`: Renstra, RKAP, company/division target Backend state.
- `src/modules/strategy/planning/cascade-preview.tsx`: derived target, trace, assumptions, constraint result, blocking condition, dan accept-as-DRAFT.
- `StrategySubmoduleRunner`: tetap menjadi satu-satunya route composition dan mempertahankan `ProtectedDomainWorkspace`/RBAC.

## Failure dan authority semantics

Nilai observation tetap dipisahkan menjadi `TARGET`, `ACTUAL`, `FORECAST`, dan `ASSUMPTION`. Observation yang hilang ditampilkan `—`, tidak pernah nol. Verification ditampilkan persis dari response. Tombol pembuatan plan hanya muncul dari collection capability Backend; edit hanya muncul pada action `EDIT`, sedangkan lifecycle hanya muncul dari `SUBMIT`, `APPROVE`, atau `ACTIVATE` yang dikirim Backend. HTTP 403/409 menutup aksi dan menampilkan kegagalan tanpa mengasumsikan mutation berhasil. Cascade `FAIL`, `UNKNOWN`, `INVALID`, atau `INCOMPLETE` tidak dapat diterima.

## Scope dan Stage 3

Backend memfilter visibility tenant/organization/workspace. Division hanya menerima assigned target pada scope yang diotorisasi dan tidak dapat memutasi company target melalui UI. Stage 3 dapat menambahkan source-linked observations, connector ingestion, evidence workflow, dan advisory GENESIS melalui Backend; semuanya sengaja tidak termasuk Stage 2.
