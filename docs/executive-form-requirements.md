# Executive Form Requirements

| Form ID | Menu | Required fields | Permission / lifecycle | Current availability |
| --- | --- | --- | --- | --- |
| `exec.plan.create` | Rencana & Target | Nama, periode, scope, owner workspace, owner role, materiality, source, evidence | `CREATE_COMPANY_PLAN`; DRAFT → review → approval → active | Strategy API tersedia; form menunggu ID/version semantics yang dipublikasikan untuk Web |
| `exec.objective.create` | Rencana & Target | Plan, kode, nama, scope, owner role | Backend validation | Endpoint tersedia; form belum ditampilkan tanpa authority projection action |
| `exec.target.create` | Rencana & Target | Kode, nama, plan, metric code, scope, periode, measurement, unit, owner, materiality | Backend validation | Endpoint tersedia; nilai target dicatat sebagai observation TARGET |
| `exec.observation.create` | Kinerja | Target, nilai, unit, periode, waktu, source mode, evidence/source ref | Evidence wajib untuk `MANUAL_EVIDENCED`; tidak langsung VERIFIED | Endpoint tersedia; action belum dipublikasikan dalam authority projection Web |
| `exec.assumption.create` | Rencana & Target | Kategori, nama, nilai, unit, periode, scope, owner, source mode | Backend validation | Endpoint tersedia; action belum dipublikasikan dalam authority projection Web |
| `exec.cascade.preview` | Rencana & Target | Target asal, aturan, asumsi, constraints | Preview → accept; tidak otomatis membuat target | API tersedia |
| `exec.initiative.create` | Inisiatif Strategis | Nama, workspace, target, owner role | Contract/endpoint public | Butuh endpoint public |
| `exec.review.create` | Review & Revisi | Periode, target, komentar, evidence | Approval bila material | Butuh PerformanceReview canonical |
| `exec.target.revision` | Review & Revisi | Alasan revisi | Version draft → review → approval → active | Endpoint tersedia; type/action Web belum dipublikasikan |
| `exec.direction.create` | Brief | Judul, workspace/divisi, prioritas; deskripsi/evidence opsional | `task.create`; Shared Work Task | Tidak ditampilkan tanpa mutation task yang tersedia |
| `exec.extraction.review` | Rencana & Target | Document version immutable, field candidate, source/evidence | Candidate → review → draft | Butuh governed extraction endpoint |

Frontend melakukan validasi pengalaman pengguna saja. Backend tetap memvalidasi authority, conflict, lifecycle, classification, evidence, dan immutable version.
