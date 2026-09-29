# Sales Data Requirements

| Component ID | Purpose | Authority/source | Current availability |
| --- | --- | --- | --- |
| `sales.summary.headline` | Target, closing, pipeline, conversion | Strategy dan closing terverifikasi | UI FINAL / SOURCE UNAVAILABLE |
| `sales.pipeline.table` | Pipeline dan tindak lanjut | Sales pipeline authoritative | UI FINAL / SOURCE UNAVAILABLE |
| `sales.leads.table` | Prospek sesuai scope dan klasifikasi | Lead service | UI FINAL / SOURCE UNAVAILABLE |
| `sales.booking.table` | Booking dan status lintas domain | Sales, Finance, Legal, Property | UI FINAL / SOURCE UNAVAILABLE |
| `sales.campaign.table` | Atribusi channel dan CPL | Campaign service | UI FINAL / SOURCE UNAVAILABLE |
| `sales.performance` | Target dan aktual Sales | Strategy + official closing | UI FINAL / SOURCE UNAVAILABLE |
| `sales.activities.table` | Aktivitas, follow-up, dan survey | Sales activity service | UI FINAL / SOURCE UNAVAILABLE |
| `sales.kpr.journey` | Tahap KPR, SP3K, dan akad | Finance + Legal + Sales projection | UI FINAL / SOURCE UNAVAILABLE |
| `sales.shared-work` | Proyek, tugas, persetujuan, dokumen, laporan, temuan | Shared Work universal | UI READY / masing-masing sumber dapat NEEDS BACKEND |
| `sales.ara` | Pertanyaan dan advisory sesuai scope | GENESIS advisory via ALOS Backend | READINESS ONLY / NEEDS INTEGRATION |

Setiap data harus membawa scope, owner, period, verification, evidence, freshness, classification, dan destination detail sebelum menjadi runtime UI.

Ketiadaan sumber tidak boleh diterjemahkan menjadi nilai nol, risiko aman, atau closing aktual. Candidate closing tetap berbeda dari official closing.

## Deferred until dashboard phase complete

- Contracts required.
- Backend services/projections required.
- Cross-domain authority and governed outcome projections.
- GENESIS extraction integration.
