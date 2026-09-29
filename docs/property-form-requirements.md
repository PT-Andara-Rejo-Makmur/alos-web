# Property Form Requirements

Frontend menyediakan UX untuk:

- Technical Project Profile.
- Progress Entry.
- Milestone dan Work Package.
- Unit Readiness.
- Inspection.
- Material Request.
- RAB Draft/Revisi.
- Opname.
- Handover readiness.

Semua form saat ini `UI FINAL / SOURCE UNAVAILABLE`. Field yang terlihat hanya field bisnis yang dapat diisi user; tenant, organization, workspace internal, actor internal ID, generated field, raw permission refs, dan identity teknis internal tidak dijadikan input manual.

Submit disabled sampai canonical capability dan contract tersedia. Tidak ada endpoint speculative, fake success, atau state authoritative yang dibuat browser.

## Document extraction UX

Flow: `Document → Extraction → Candidate → Human Review → Draft → Verification → Approval bila material → Active`.

Review memakai panel kiri untuk source document dan panel kanan untuk candidate fields. Action `Terima`, `Edit`, dan `Abaikan` tersedia sebagai struktur UX tetapi disabled selama integration belum tersedia. Candidate ambiguous memakai status `Perlu Diperiksa`; confidence tidak ditampilkan tanpa engine source.

## Authority boundaries

Property boleh mengelola UX technical delivery bila capability tersedia. Property tidak boleh mengubah payment, paid status, cash, bank settlement, legal validity, commercial Sales state, corporate target, atau approval decision.

## Deferred until dashboard phase complete

- Form command contracts and validation.
- Backend persistence/projections and authorization.
- Cross-domain approval/authority integration.
- GENESIS extraction integration.
