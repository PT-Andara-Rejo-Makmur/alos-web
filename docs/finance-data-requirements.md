# Finance Data Requirements

Status: **NEEDS BACKEND / NEEDS CONTRACT**. Frontend saat ini hanya menyediakan UI dan state source-unavailable.

Sumber yang dibutuhkan: posisi kas/rekening, penerimaan, piutang, pengeluaran, utang, pembayaran, settlement, anggaran finansial, rekonsiliasi, pajak, bukti finansial, serta Strategy target projection.

Setiap sumber wajib membedakan loading, unavailable, error, connected-empty, dan connected-data. Nilai tidak diketahui adalah `—`; angka nol hanya untuk actual zero yang authoritative. Status pajak atau rekonsiliasi tidak boleh disimpulkan dari ketiadaan data.

Data sensitif seperti nomor rekening, nomor pajak, dan identitas pribadi harus mengikuti classification dan authority dari sumber resmi. Frontend tidak menginventarisasi rekening atau kewajiban pajak.
