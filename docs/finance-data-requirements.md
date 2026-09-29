# Finance Data Requirements

Status: **NEEDS BACKEND / NEEDS CONTRACT**. Frontend saat ini hanya menyediakan UI dan state source-unavailable.

Sumber yang dibutuhkan: posisi kas/rekening, penerimaan, piutang, pengeluaran, utang, pembayaran, settlement, anggaran finansial, rekonsiliasi, pajak, bukti finansial, serta Strategy target projection.

Setiap sumber wajib membedakan loading, unavailable, error, connected-empty, dan connected-data. Nilai tidak diketahui adalah `—`; angka nol hanya untuk actual zero yang authoritative. Status pajak atau rekonsiliasi tidak boleh disimpulkan dari ketiadaan data.

Data sensitif seperti nomor rekening, nomor pajak, dan identitas pribadi harus mengikuti classification dan authority dari sumber resmi. Frontend tidak menginventarisasi rekening atau kewajiban pajak.

## Registry data Finance

Registry berikut adalah kontrak kebutuhan UI, bukan keputusan schema. Field yang belum memiliki sumber resmi tetap `NEEDS CONTRACT` / `NEEDS BACKEND`.

| Component ID | Menu | Purpose | Entity/Metric | Scope | Period | Owner | Target Source | Actual Source | Forecast Source | Data Source | Verification | Evidence | Freshness | Classification | Authority | Destination | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `finance.summary` | Ringkasan | Posisi keuangan operasional | Kas, penerimaan, pengeluaran, piutang, utang, anggaran | Workspace | Periode terpilih | Finance | Strategy target bila tersedia | Finance source | Finance forecast | NEEDS BACKEND | Source verification | Shared Work Document / bukti finansial | NEEDS DECISION | INTERNAL–RESTRICTED | Finance | `/workspace/[workspaceKey]/summary` | UI FINAL / SOURCE UNAVAILABLE |
| `finance.liquidity` | Kas & Likuiditas | Memantau posisi dan arus kas | Rekening, saldo buku, saldo tersedia, pending | Workspace | Periode / tanggal rekonsiliasi | Finance | NEEDS DECISION | Bank / Finance source | Finance forecast | NEEDS BACKEND | Rekonsiliasi resmi | Bank statement | NEEDS DECISION | CONFIDENTIAL | Finance | `/liquidity` | NEEDS CONTRACT |
| `finance.receivables` | Penerimaan & Piutang | Mencatat dan memantau penerimaan serta piutang | Receipt, receivable, aging, refund | Workspace / pihak / proyek | Periode dan jatuh tempo | Finance | Strategy bila relevan | Finance receipt / settlement | NEEDS DECISION | NEEDS BACKEND | Verifikasi penerimaan | Bukti penerimaan | NEEDS DECISION | CONFIDENTIAL | Finance; Sales hanya sumber intent | `/receivables` | NEEDS CONTRACT |
| `finance.payables` | Pengeluaran & Utang | Mengendalikan kewajiban dan pembayaran | Payment request, invoice, payable, payment | Workspace / proyek | Periode dan jatuh tempo | Finance | Budget financial | Finance payable / payment | Finance forecast | NEEDS BACKEND | Approval dan settlement | Invoice / bukti pembayaran | NEEDS DECISION | CONFIDENTIAL | Finance; Legal/Property read-only projection | `/payables` | NEEDS CONTRACT |
| `finance.budget` | Anggaran & Realisasi | Menampilkan rencana, komitmen, aktual, dan variansi finansial | Financial budget, allocation, commitment, actual, forecast | Workspace / divisi / proyek | Periode anggaran | Finance + Strategy boundary | Strategy RKAP | Finance actual | Finance forecast | NEEDS BACKEND | Budget approval | Budget document | NEEDS DECISION | INTERNAL–CONFIDENTIAL | Finance | `/budget` | NEEDS CONTRACT |
| `finance.reconciliation` | Rekonsiliasi | Menampilkan pencocokan transaksi | Transaction, match candidate, discrepancy | Workspace / rekening | Periode transaksi | Finance | Tidak berlaku | Finance / bank source | Tidak berlaku | NEEDS BACKEND | Human/backend confirmation | Bank statement dan bukti transaksi | NEEDS DECISION | CONFIDENTIAL | Finance | `/reconciliation` | NEEDS CONTRACT |
| `finance.tax` | Pajak & Kewajiban | Memantau kewajiban pajak dan dokumen | Tax obligation, tax document, payment, filing | Workspace / periode pajak | Periode pajak dan jatuh tempo resmi | Finance dengan batas Legal | Strategy bila ada target | Tax source resmi | NEEDS DECISION | NEEDS BACKEND | Verifikasi resmi | Dokumen pajak | NEEDS DECISION | CONFIDENTIAL–RESTRICTED | Finance/Legal boundary | `/tax` | NEEDS CONTRACT |
| `finance.performance` | Target & Kinerja | Membandingkan target Strategy dengan actual/forecast Finance | Target, actual, forecast, KPI | Workspace / periode | Periode target | Strategy untuk target; Finance untuk actual | Strategy target | Finance actual | Finance forecast | Strategy + NEEDS BACKEND | Source-specific verification | Strategy / Finance evidence | NEEDS DECISION | INTERNAL | Strategy + Finance boundary | `/performance` | PARTIAL / INTEGRATION PENDING |

### Aturan tampilan

- `loading`, `unavailable`, `error`, `connected-empty`, dan `connected-data` adalah state yang saling eksklusif.
- `—` berarti nilai belum diketahui; `0` atau `Rp0` hanya boleh berasal dari nilai nol yang benar-benar tersedia.
- Status finansial tidak boleh disimpulkan dari data kosong. Compliance pajak dan hasil rekonsiliasi memerlukan sumber resmi.
