# Canonical business workspaces

Sales/Marketing, Property, dan Finance menggunakan generated canonical contracts
dari alos-contracts melalui `src/lib/contracts`. Owner API adapters berada pada
`src/features/{sales,marketing,property,finance}/api.ts`. Tidak ada generic Domain
CRUD fetching pada halaman domain yang dihubungkan.

Presentation metadata `resources.ts` dibatasi key generated Create/Update types.
`business-records` hanya menangani transport, forms, pagination, dan rendering.
Backend mengendalikan scope, references, lifecycle actions, money, audit, serta
performance. Decimal input tetap string; lifecycle dan pipeline buttons berasal
allowed actions projection. Reference selectors membaca seluruh halaman source.

`BusinessDataPage` menggunakan existing PageHeader, Tabs, DataTable, dan Drawer.
Session/workspace change mereset records dan form; old responses diabaikan.
Success hanya sesudah Backend success. Failure mempertahankan form dan tidak
menghasilkan optimistic success. Authority buttons membutuhkan canonical active
workspace role DIVISION_LEAD/MEMBER dan owner domain write permission.

Source states: loading, CONNECTED, CONNECTED_EMPTY, UNAVAILABLE, ERROR terpisah.
Timestamp hanya authoritative source timestamp. Error/unavailable tidak menjadi
empty atau metric 0. Overview menampilkan counts Backend; bank saldo, revenue,
conversion, cashflow, tax compliance, budget variance tetap unknown jika belum
ada definisi/source authoritative. Performance memakai Strategy detail projection
termasuk NOT_EVALUATED, selected actual/forecast, verification, owner dan period.

KPR, contractor registry, materials/procurement, RAB/BOQ, technical unit readiness,
connector bank/social/tax, GENESIS/ARA tetap unavailable. Booking/closing final
dan approved change order/payment certificate tidak diklaim tanpa authority.
No new menu, database, Executive entity, atau direct GENESIS fetch.

Regression coverage: `tests/business-records.test.tsx`, Sales/Property/Finance
workspace tests, existing navigation/authority/workspace switching/architecture
guards. Infra smoke membuktikan Web BFF → Backend → persisted PostgreSQL commands
serta connection status Executive.
