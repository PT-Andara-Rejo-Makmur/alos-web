# Executive Data Requirements

| Component ID | Menu | Entity / Metric | Scope | Source | Verification | Destination | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `exec.summary.strategy` | Ringkasan | Strategy plan dan target | COMPANY | Strategy API | Target observation | Kinerja | Tersedia |
| `exec.summary.revenue` | Ringkasan | Pendapatan | COMPANY | Finance authoritative source | Finance | Kinerja / Finance | Belum Terhubung |
| `exec.summary.sales` | Ringkasan | Penjualan / Closing | COMPANY | Sales authoritative source | Sales | Divisi Sales | Belum Terhubung |
| `exec.summary.liquidity` | Ringkasan | Kas & Likuiditas | COMPANY | Finance authoritative source | Finance | Divisi Finance | Belum Terhubung |
| `exec.summary.projects` | Ringkasan | Progres Proyek | COMPANY bila diberikan | Shared Work Project | Shared Work | Proyek | Belum Terhubung |
| `exec.summary.decisions` | Ringkasan | Persetujuan menunggu | Authority Backend | Shared Work Approval | Shared Work | Persetujuan | Belum Terhubung |
| `exec.summary.findings` | Ringkasan | Risiko / Temuan | Authority Backend | Shared Work Finding | Shared Work | Temuan | Belum Terhubung |
| `exec.domain.*` | Divisi | Kinerja domain | Workspace/division Backend | Domain source | Domain source | Detail Divisi | Belum Terhubung |
| `exec.genesis` | Ringkasan / Brief | Advisory | Principal scope | Governed GENESIS | Backend | Advisory detail | Belum Terhubung |
| `exec.ara` | Tanya ARA | Read context | Principal/workspace/classification | Governed ARA | Backend | Tanya ARA | Belum Terhubung |

Freshness, owner source, evidence, dan classification hanya ditampilkan ketika disediakan source authoritative. Tidak ada default permission, data, status, atau recommendation di frontend.
