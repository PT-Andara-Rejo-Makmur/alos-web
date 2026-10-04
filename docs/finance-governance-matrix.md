# Finance Governance Matrix

| Area | Authority dan batas implementasi |
| --- | --- |
| Rekening/transaksi | Finance owner; immutable recorded transaction dan exact Decimal, bukan saldo bank live |
| Receivable/Payable/payment | Finance owner; reference, outstanding, duplicate/overpayment dan evidence diperiksa Backend |
| Budget | Requester berizin; independent owner lead dengan decision permission; action approval dan explicit execute |
| Rekonsiliasi/pajak | Canonical internal verification; tanpa fund transfer, DJP submission atau inferred compliance |
| Origin sertifikat | Property/Finance lewat process/reference yang diotorisasi, tanpa akses bebas ke workspace lain |
| Legal validity | Legal/human evidence; pembayaran atau approved document bukan legal signature |
| Target/KPI | Strategy + owner projection; verified actual tetap melalui lifecycle Strategy |
| Dokumen | Shared Work immutable version, classification dan review/approval |

Approval tidak langsung mengubah record bisnis. APPROVED hanya dapat dieksekusi
untuk subject/action/snapshot yang cocok. Backend mengunci record dan approval,
memvalidasi lifecycle, menandai consumption, menulis business state/audit dan
memvalidasi projection dalam satu transaksi. PENDING/RETURNED/REJECTED/HELD,
self-approval, keputusan stale dan replay ditolak.

Budget approve/activate/close memakai approval berbeda sesuai requested action.
Classification dan data scope berasal dari Principal/owner, bukan pilihan frontend.
Nominal, ambang materialitas dan policy perusahaan tidak dikarang. Final month close,
automatic settlement dan live bank/DJP connector tetap memerlukan authority/policy.

Requirements form/data yang lebih luas tetap merupakan kebutuhan bisnis; tidak
semuanya implementasi siap. Lihat [coverage owner](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/canonical-business-coverage.md)
dan [operasi bisnis](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/business-operations.md).
