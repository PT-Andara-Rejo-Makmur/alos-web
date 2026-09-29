# Legal Cross-Domain Matrix

Status: **NEEDS CONTRACT / NEEDS BACKEND / NEEDS DECISION**.

| Domain | Legal dapat melihat | Legal tidak mengubah | Sumber lintas domain | Mode saat ini |
|---|---|---|---|---|
| Strategy | target Legal bila tersedia | target korporasi | Strategy target | projection/readiness |
| Finance | ringkasan kewajiban atau status keuangan bila authorized | pembayaran, settlement, rekonsiliasi | Finance | read-only |
| Sales & Marketing | kontrak/booking reference bila tersedia | lead, booking intent, closing | Sales | read-only |
| Property & Teknik | proyek/aset, RAB reference, progress evidence bila tersedia | progress fisik, quantity, readiness teknis | Property | read-only |
| HR/GA | pihak atau dokumen yang diizinkan | employee authority dan benefit | HR/GA | read-only |
| Shared Work | Project, Task, Approval, Document, Report, Finding | authority entity Shared Work | Shared Work | reuse universal |
| ARA | konteks advisory | keputusan atau state legal | ARA | universal, advisory |

URL, nama workspace, dan ID route bukan authority. Detail yang belum mendapat projection resmi tetap menampilkan `Belum Terhubung`.

Guard authority: Legal tidak mengubah `Paid`, `Settlement`, atau `Reconciliation` Finance; physical progress atau technical quantity Property; booking atau pipeline Sales; maupun Project root, Document, Finding, Task, dan Approval Shared Work. Semua relasi tersebut hanya ditampilkan sebagai sumber lintas domain ketika tersedia.
