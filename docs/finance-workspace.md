# Finance & Pajak Workspace

| Menu aktif | Sumber dan batas |
| --- | --- |
| Ringkasan / Kas & Likuiditas | Bank Account/Transaction tercatat; recorded movement bukan saldo bank authoritative |
| Penerimaan & Piutang | Receivable dan payment history dengan pemeriksaan nilai/outstanding |
| Pengeluaran & Utang | Payable dan payment evidence; bukan perintah transfer bank |
| Anggaran & Realisasi | Budget/Lines dengan action-scoped approval; actual yang tidak tersedia tetap unknown |
| Rekonsiliasi | Reconciliation/Items dan periode yang diperiksa Backend |
| Pajak & Kewajiban | Tax Obligation/Document; bukan pengiriman DJP atau penilaian kepatuhan otomatis |
| Target & Kinerja | Strategy dan indikator yang disediakan owner |

Navigation dimiliki `src/features/finance/navigation.ts`. Semua nominal memakai
Decimal string; browser tidak menjumlah ulang daftar sebagai angka perusahaan.
Transaksi immutable dan period/row locks mengikuti Backend. Bank integration,
automatic settlement dan final month-close policy belum dinyatakan siap.
Lihat [governance Finance](finance-governance-matrix.md).

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
