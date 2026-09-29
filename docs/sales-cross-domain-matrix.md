# Sales Cross-domain Matrix

| Outcome | Authority | Sales visibility |
| --- | --- | --- |
| Booking fee received / refund | Finance | Read-only |
| SPK validity, legal review, akad completion | Legal | Read-only |
| Project, unit, price, availability | Property | Read-only projection |
| KPR approval, SP3K, disbursement | Finance / Legal | Read-only and follow-up when authorized |
| Official closing | Governed cross-domain outcome | Read-only; Sales cannot mark it directly |
| Candidate closing | Sales proposal / governed review | Read-only until Finance, Legal, dan Property menyelesaikan verifikasi yang relevan |
| Document extraction candidate | Governed extraction | Human review; bukan record bisnis authoritative |

Sales may propose booking and maintain relationship data when permissions and contracts are available. It cannot bypass Finance, Legal, or Property verification.

## Sales UI boundary

Booking request, cancellation request, follow-up, document completion, dan campaign maintenance hanya disediakan sebagai struktur UX. Selama capability canonical belum tersedia, submit disabled dan tidak menghasilkan success state. Sales tidak memiliki action frontend untuk menerima booking fee, membayar refund, memvalidasi SPK final, approve KPR, issue SP3K, menyelesaikan akad, atau menetapkan official closing.

## Deferred until dashboard phase complete

- Contracts required.
- Backend services/projections required.
- Cross-domain authority.
- GENESIS extraction integration.
