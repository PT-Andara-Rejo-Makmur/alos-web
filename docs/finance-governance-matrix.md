# Finance Governance Matrix

| Area | Authority | Status frontend |
| --- | --- | --- |
| Kas dan rekening | Finance source resmi | Belum Terhubung |
| Penerimaan dan verifikasi | Finance governance | Form disabled |
| Payment dan settlement | Finance governance | Readiness only |
| Rekonsiliasi | Finance/human confirmation | Tidak membuat candidate |
| Pajak | Finance/Legal sesuai keputusan | Belum Dinilai |
| Anggaran finansial | Finance + Strategy boundary | Form disabled |
| RAB teknis | Property | Read-only dari Finance |
| Kontrak/legal | Legal | Read-only dari Finance |
| Target korporat | Strategy | Projection target saja |
| Bukti dokumen | Shared Work Document | Reuse universal |

Classification PUBLIC, INTERNAL, CONFIDENTIAL, dan RESTRICTED harus ditentukan oleh source resmi. Frontend tidak mengubah policy akses atau authority.

## Matriks tindakan

| Action | Requester | Reviewer | Approver | Materiality | Evidence | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Buat penerimaan | Finance authorized actor | Finance verification | NEEDS DECISION | NEEDS DECISION | Bukti penerimaan | Menunggu Verifikasi; bukan otomatis terverifikasi |
| Buat piutang | Finance authorized actor | Finance verification | NEEDS DECISION | NEEDS DECISION | Referensi/bukti sumber | Receivable draft/open |
| Ajukan permintaan pembayaran | Finance authorized actor | Finance reviewer | NEEDS DECISION | NEEDS DECISION | Invoice, dokumen, bukti | Payment request; Approved ≠ Paid |
| Catat tagihan/utang | Finance authorized actor | Finance reviewer | NEEDS DECISION | NEEDS DECISION | Invoice dan dokumen pendukung | Payable record |
| Jalankan pembayaran | Finance payment authority | Finance reviewer | NEEDS DECISION | NEEDS DECISION | Payment approval dan bukti | Payment execution; Payment ≠ Settlement |
| Selesaikan transaksi | Finance authority | Finance reviewer | NEEDS DECISION | NEEDS DECISION | Settlement evidence | Settlement; belum otomatis rekonsiliasi |
| Konfirmasi rekonsiliasi | Finance/human reviewer | Finance reviewer | NEEDS DECISION | NEEDS DECISION | Bank statement dan transaksi | Confirmed match; candidate bukan konfirmasi |
| Buat/revisi anggaran | Finance authorized actor | Finance reviewer | Strategy/Finance boundary | NEEDS DECISION | Budget/revision evidence | Versi anggaran baru; tidak overwrite versi aktif |
| Catat kewajiban pajak | Finance authorized actor | Finance/tax reviewer | Legal/Finance boundary | NEEDS DECISION | Dokumen pajak | Tax obligation; kepatuhan tetap Belum Dinilai bila source tidak ada |
| Telaah kandidat ekstraksi | Authorized reviewer | Human reviewer | Sesuai materialitas | NEEDS DECISION | Dokumen sumber | Candidate/draft, bukan state authoritative |

Otoritas, ambang materialitas, dan lifecycle final ditandai `NEEDS DECISION`, `NEEDS CONTRACT`, atau `NEEDS BACKEND` sampai sumber resminya tersedia. Finance tidak mengubah authority Sales, Property, Legal, Strategy, atau Shared Work.
