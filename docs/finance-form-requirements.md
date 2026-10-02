# Finance Form Requirements

## Current canonical integration (2026-10-02)

Status aktual: **PARTIAL** untuk seluruh kebutuhan Stage 3; capability internal yang didukung tercatat **CONNECTED** di [canonical coverage matrix](canonical-business-coverage.md). Table dan form historis di bawah tetap menyimpan kebutuhan asli, termasuk field yang belum mempunyai authority. Label historis NEEDS BACKEND / SOURCE UNAVAILABLE tidak menyatakan kondisi runtime terkini.

| Capability | Current status | Owner / source and boundary |
|---|---|---|
| Supported internal records / dedicated forms | CONNECTED | Finance recorded ledger, receivables/payables/payments, budgets, reconciliation/tax evidence; exact decimal and period invariants; governed budgets |
| Entire Stage 3 metric/form requirements | PARTIAL | Only accepted canonical fields and Backend-projected actions are active; historical wishlist fields are not invented |
| Production ARA/GENESIS / automatic extraction or reasoning | DEFERRED_TO_AI | Existing readiness only; no provider integration in this work |
| External/live sources and provider execution | DEFERRED_TO_CONNECTOR | UNAVAILABLE in UI until connected; recorded sources remain explicit |
| Unsupported final business policy / sensitive sources | UNAVAILABLE | Fail closed; see exact exceptions in canonical coverage matrix |

## Historical Stage 3 requirements


Status seluruh form: **UI FINAL / SOURCE UNAVAILABLE — NEEDS CONTRACT**. Field dapat ditampilkan sebagai persiapan UX, tetapi submit disabled sampai sumber penyimpanan resmi tersedia.

Form yang diperlukan:

- `finance.receipt.create`: tanggal, pihak, jenis penerimaan, referensi bisnis, proyek, jumlah, mata uang, metode pembayaran, rekening, mode sumber, bukti, deskripsi.
- `finance.receivable.create`: pihak, sumber, proyek, referensi, jumlah, jatuh tempo, penanggung jawab, bukti.
- `finance.payable.create`: jenis pembayaran, penerima, proyek, referensi kontrak/invoice, deskripsi, jumlah, mata uang, tanggal kebutuhan, anggaran, cost center, dokumen, bukti, rekening pembayaran.
- `finance.payment.request`, `finance.refund.request`, `finance.budget.create`, `finance.budget.revise`, `finance.reconciliation.confirm`, `finance.tax.obligation.create`, `finance.document.extract`.

Approved tidak sama dengan Paid; Payment tidak sama dengan Settlement; Settlement tidak sama dengan Reconciliation. UI dapat menampilkan label awal konseptual seperti Menunggu Verifikasi, tetapi itu bukan keputusan lifecycle canonical. Tidak ada form yang menampilkan internal ID atau melaporkan fake success.

## Form registry

| Form ID | Purpose | Required Fields | Optional Fields | Generated Fields | Source | Permission | Classification | Evidence | Verification | Approval | Lifecycle | Submit | Result Entity | Destination | Error | Conflict | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `finance.receipt.create` | Mengajukan penerimaan | Tanggal, Pihak, Jenis, Jumlah, Mata Uang, Rekening, Mode Sumber, Bukti | Referensi Bisnis, Proyek, Metode Pembayaran, Deskripsi | Receipt ID, status | Finance source | `finance.receipt.create` bila canonical | CONFIDENTIAL | Bukti penerimaan | Finance verification | NEEDS DECISION | NEEDS DECISION | Disabled sampai source tersedia | Receipt | `/receivables` | Data belum dapat disimpan | NEEDS DECISION | UI FINAL / SOURCE UNAVAILABLE |
| `finance.receivable.create` | Menyiapkan piutang | Pihak, Sumber, Jumlah, Mata Uang, Tanggal Terbit, Jatuh Tempo | Referensi, Proyek, Penanggung Jawab, Bukti | Receivable ID, status | Finance source | NEEDS CONTRACT | CONFIDENTIAL | Bukti pendukung | Finance verification | NEEDS DECISION | NEEDS DECISION | Disabled | Receivable | `/receivables` | Data belum dapat disimpan | NEEDS DECISION | NEEDS CONTRACT |
| `finance.payable.create` | Mencatat tagihan/utang | Jenis, Penerima, Deskripsi, Jumlah, Mata Uang, Dokumen, Bukti | Proyek, Referensi Kontrak/Invoice, Tanggal Kebutuhan, Anggaran, Cost Center, Rekening | Payable ID, status | Finance source + invoice | NEEDS CONTRACT | CONFIDENTIAL | Invoice / bukti | Finance verification | NEEDS DECISION | NEEDS DECISION | Disabled | Payable / Invoice | `/payables` | Data belum dapat disimpan | Duplicate invoice rule NEEDS DECISION | NEEDS CONTRACT |
| `finance.payment.request` | Mengajukan permintaan bayar | Jenis Pembayaran, Penerima, Deskripsi, Jumlah, Mata Uang, Dokumen, Bukti | Proyek, Referensi, Anggaran, Cost Center, Tanggal Kebutuhan, Rekening | Request ID, status | Finance source | NEEDS CONTRACT | CONFIDENTIAL | Dokumen pembayaran | Approval/verification | NEEDS DECISION | NEEDS DECISION | Disabled | Payment Request | `/payables` | Data belum dapat disimpan | NEEDS DECISION | NEEDS CONTRACT |
| `finance.refund.request` | Mengajukan pengembalian | Pihak, Jumlah, Mata Uang, Alasan, Bukti | Referensi, Proyek, Rekening | Refund ID, status | Finance source | NEEDS CONTRACT | CONFIDENTIAL | Bukti refund | Finance verification | NEEDS DECISION | NEEDS DECISION | Disabled | Refund | `/receivables` | Data belum dapat disimpan | NEEDS DECISION | NEEDS CONTRACT |
| `finance.budget.create` | Menyusun anggaran finansial | RKAP/Rencana, Nama Anggaran, Periode, Ruang Lingkup, Penanggung Jawab, Jumlah, Mata Uang | Alokasi, Sumber, Bukti, Tingkat Kepentingan | Budget ID, version | Finance + Strategy boundary | NEEDS CONTRACT | INTERNAL–CONFIDENTIAL | Budget document | Budget verification | NEEDS DECISION | NEEDS DECISION | Disabled | Financial Budget | `/budget` | Data belum dapat disimpan | NEEDS DECISION | NEEDS CONTRACT |
| `finance.budget.revise` | Mengajukan revisi tanpa menimpa versi aktif | Budget source, alasan, perubahan, bukti | Catatan | Revision ID, new version | Finance budget source | NEEDS CONTRACT | INTERNAL–CONFIDENTIAL | Revision evidence | Budget verification | NEEDS DECISION | NEEDS DECISION | Disabled | Budget Revision | `/budget` | Data belum dapat disimpan | Active version conflict NEEDS DECISION | NEEDS CONTRACT |
| `finance.reconciliation.confirm` | Mengonfirmasi pencocokan | Transaksi/candidate resmi, hasil pencocokan, bukti bila diperlukan | Catatan, selisih | Confirmation ID, timestamp | Finance/bank source | NEEDS CONTRACT | CONFIDENTIAL | Bank statement | Human/backend confirmation | NEEDS DECISION | NEEDS DECISION | Disabled tanpa candidate resmi | Reconciliation Confirmation | `/reconciliation` | Candidate belum tersedia | NEEDS DECISION | NEEDS BACKEND |
| `finance.tax.obligation.create` | Menyiapkan kewajiban pajak | Jenis, Periode, Dasar Pajak, Jumlah Pajak, Jatuh Tempo resmi, Dokumen/Bukti | Transaksi Terkait, Penanggung Jawab | Tax Obligation ID, status | Tax source | NEEDS CONTRACT | CONFIDENTIAL–RESTRICTED | Dokumen pajak | Official tax verification | NEEDS DECISION | NEEDS DECISION | Disabled | Tax Obligation | `/tax` | Data belum dapat disimpan | Due date tidak dihitung frontend | NEEDS CONTRACT |
| `finance.document.extract` | Menelaah dokumen finansial | Dokumen sumber | Catatan telaah | Candidate fields, extraction ID | Extraction service | NEEDS CONTRACT | mengikuti dokumen | Dokumen sumber | Human review + source verification | Bila diperlukan | Conceptual only — NEEDS CONTRACT | Tidak aktif tanpa engine | Extraction Review | Kontekstual pada menu Finance | Kandidat belum tersedia | Candidate bukan authoritative state | NEEDS BACKEND |

Semua relasi (Proyek, Rekening, RKAP/Rencana, Kontrak, Dokumen, Anggaran) harus dipilih dari sumber resmi ketika tersedia. UI tidak meminta internal ID dan tidak melaporkan keberhasilan palsu.

**Catatan lifecycle:** nilai `NEEDS DECISION` dan `Conceptual only — NEEDS CONTRACT` di atas adalah penanda bahwa flow UX bukan lifecycle canonical. Keputusan final berada pada Contracts, Backend, dan business governance.
