# Finance Form Requirements

Status seluruh form: **UI FINAL / SOURCE UNAVAILABLE — NEEDS CONTRACT**. Field dapat ditampilkan sebagai persiapan UX, tetapi submit disabled sampai sumber penyimpanan resmi tersedia.

Form yang diperlukan:

- `finance.receipt.create`: tanggal, pihak, jenis penerimaan, referensi bisnis, proyek, jumlah, mata uang, metode pembayaran, rekening, mode sumber, bukti, deskripsi.
- `finance.receivable.create`: pihak, sumber, proyek, referensi, jumlah, jatuh tempo, penanggung jawab, bukti.
- `finance.payable.create`: jenis pembayaran, penerima, proyek, referensi kontrak/invoice, deskripsi, jumlah, mata uang, tanggal kebutuhan, anggaran, cost center, dokumen, bukti, rekening pembayaran.
- `finance.payment.request`, `finance.refund.request`, `finance.budget.create`, `finance.budget.revise`, `finance.reconciliation.confirm`, `finance.tax.obligation.create`, `finance.document.extract`.

Approved tidak sama dengan Paid; Payment tidak sama dengan Settlement; Settlement tidak sama dengan Reconciliation. Manual receipt dimulai sebagai Menunggu Verifikasi. Tidak ada form yang menampilkan internal ID atau melaporkan fake success.
