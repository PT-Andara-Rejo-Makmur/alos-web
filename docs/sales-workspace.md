# Sales & Marketing Workspace

| Menu aktif | Sumber dan batas |
| --- | --- |
| Ringkasan / Pipeline | Overview dan opportunities canonical; browser tidak membuat conversion/revenue sendiri |
| Prospek & Lead | Customer/Lead, relasi unit dan qualification melalui owner Sales |
| Aktivitas & Tindak Lanjut | Site Visit, Follow-up dan Complaint yang tercatat |
| Booking & Closing | Booking/Closing; approval independen dan eksekusi eksplisit, relasi Property/Finance diperiksa Backend |
| KPR & Akad | Catatan pembiayaan/proses Backend; bukan koneksi bank atau bukti akad sah otomatis |
| Kampanye & Saluran | Campaign, Channel, Attribution, Content, Pricing/Collateral; tanpa metrik iklan live |
| Target & Kinerja | Projection Strategy dan indikator canonical dengan sumber/verification |

Navigation dimiliki `src/features/sales/navigation.ts`. Customer → Lead → QUALIFIED,
booking approval/pending/self/replay/stale decision dan Campaign reload telah diuji.
Sales tidak dapat memberi legal validity, menjalankan refund/bank transfer atau
membuat keputusan KPR hanya melalui perubahan state frontend.

Workspace memakai `/workspace/[workspaceKey]/...` dari session Backend. URL hanya
identity navigasi; tenant, organization, workspace, role, permission dan scope
ditentukan Backend. Shared Work, Perlu Tindakan dan ARA menggunakan workspace
yang sama. Desain final dan business feature tidak diubah oleh dokumentasi ini.

CONNECTED berarti sumber/command internal tersedia, bukan seluruh kebutuhan
bisnis atau connector eksternal siap. Empty hanya setelah query scoped berhasil;
unknown tetap null/— dan outage tetap error. Rincian field/lifecycle/authority ada
pada [coverage authoritative](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/canonical-business-coverage.md).
Kebutuhan form/data tetap disimpan sebagai requirements, bukan daftar fitur siap.

[Bukti UAT development](https://github.com/PT-Andara-Rejo-Makmur/alos-infra/blob/development/docs/BUSINESS_UAT_2026-10-04.md).
