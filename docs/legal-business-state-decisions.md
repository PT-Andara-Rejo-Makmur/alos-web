# Legal Business State Decisions

Status seluruh item: **NEEDS DECISION** dan/atau **NEEDS CONTRACT / NEEDS BACKEND**. Frontend tidak menetapkan lifecycle, validitas, kepatuhan, tanda tangan, atau kewenangan final.

## State dan lifecycle yang belum canonical

- Contract lifecycle dan Contract Amendment model
- Legal Review lifecycle
- Permit lifecycle
- Legal Risk lifecycle
- Compliance model
- Case/dispute lifecycle
- Obligation lifecycle
- Signature state dan signature verification model
- Legal readiness
- Land/asset legal state
- Contract versioning dan immutable history
- Evidence binding, verification, retention, dan audit
- Self-approval policy dan separation of duties

## Pertanyaan keputusan

- Apakah Contract entity terpisah dari Document?
- Bagaimana relasi Contract dengan Document Version?
- Apakah Clause disimpan sebagai data terstruktur?
- Bagaimana model Amendment dan hubungan ke versi asal?
- Bagaimana model verifikasi tanda tangan?
- Apakah Legal Opinion menjadi entity?
- Bagaimana lifecycle Permit dan perpanjangannya?
- Bagaimana model Compliance Requirement?
- Bagaimana model Case/Dispute dan klaim?
- Apakah risk scoring diperlukan dan siapa authority-nya?
- Bagaimana Project Legal Readiness ditentukan?
- Apa sumber resmi Legal Deadline?
- Bagaimana Regulatory Source dikelola?
- Berapa lama dokumen Legal disimpan dan siapa yang dapat mencarinya?
- Bagaimana perilaku akses/search untuk data `RESTRICTED`?
- Kapan status Review Legal berbeda dari Business Approval?
- Kapan status Approval berbeda dari Execution/Signature?

Status seperti `ACTIVE`, `APPROVED`, `DRAFT`, `EXPIRED`, atau `REJECTED` tidak dipetakan sebagai katalog Legal generik di frontend. Nilai yang belum memiliki sumber resmi ditampilkan `Belum Dinilai`.
