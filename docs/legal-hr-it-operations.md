# Legal, HR & GA, IT — canonical workspace

Halaman operasional memakai dedicated API `/api/v1/legal`, `/api/v1/hr`, dan
`/api/v1/it` serta migration-owned PostgreSQL. `resources.ts` setiap domain
memetakan seluruh accepted create/update fields dan persisted projection columns.
Detail record membaca ID melalui API scoped; ID URL tidak memberi authority.
Backend menentukan `allowed_transitions`. Web tidak menentukan decision authority.

| Workspace | Halaman | Sumber canonical |
| --- | --- | --- |
| Legal | Ringkasan | Legal overview |
| Legal | Risiko & Kepatuhan | risks, controls |
| Legal | Kontrak & Perjanjian | contracts |
| Legal | Review Legal | due_diligences, due_diligence_items, claim_reviews |
| Legal | Perizinan | permits |
| Legal | Legalitas Proyek & Aset | land_documents |
| Legal | Sengketa & Klaim | cases, claim_reviews |
| Legal | Kewajiban & Tenggat | expiries, privacy_requests |
| HR | Ringkasan | HR overview |
| HR | Organisasi & Tenaga Kerja, Karyawan | employees |
| HR | Rekrutmen & Kandidat | recruitments, candidates, interviews |
| HR | Onboarding & Masa Percobaan | onboardings |
| HR | Kehadiran & Cuti | immutable attendances, leave_requests |
| HR | Kinerja & Pengembangan | performance_reviews, trainings, training_enrollments, successions, succession_candidates |
| HR | Dokumen & Kepatuhan | employment_contracts, personnel_files, grievances |
| HR | Perubahan & Offboarding | employee records; governed offboarding workflow unavailable |
| IT | Ringkasan | IT overview |
| IT | Layanan & Insiden | incidents, recorded service_monitors |
| IT | Sistem & Aplikasi, ALOS & GENESIS | systems inventory; GENESIS connection unavailable |
| IT | Infrastruktur & Lingkungan | databases, environments, backup_policies, backup_runs, restore_tests, dr_plans |
| IT | Integrasi & Connector | integrations inventory; live connector unavailable |
| IT | Akun Karyawan, Akses & Identitas | existing Identity API and AccountManagementPage |
| IT | Keamanan & Kepatuhan | security_findings, backup_policies, restore_tests, dr_plans |
| IT | Perubahan & Rilis | repositories, cicd_pipelines, ci_runs, releases, technical_debts |
| Semua | Target & Kinerja | existing canonical StrategyPerformancePage |
| Semua | Projects, Tasks, Approvals, Documents, Reports, Findings | existing Shared Work |

Kompensasi/Benefit/payroll, GA/Fasilitas, governed offboarding, IT assets/support,
live monitoring, external connectors, ARA/GENESIS integration dan infrastructure
execution tetap Belum Tersedia. Signing/legal judgment, hiring/leave approval dan
production approve/release/rollback tidak memperoleh command material baru.
Production release tetap melalui Governance existing.

Loading, connected, connected-empty, unavailable dan error tetap terpisah.
Error tidak berubah menjadi empty; unavailable tidak berubah menjadi angka nol.
Ringkasan hanya memakai raw count dari overview. Tidak ada compliance/turnover/
attendance/performance average/security/uptime/MTTR/backup success score buatan.
Tidak ada tombol Segarkan Data atau form readiness yang membuang input diam-diam.

HR tidak membuat atau mencabut account/membership. document_id Legal/HR memakai
Shared Work reference selector dan visibility validation Backend. Reference HR/IT
memakai selector canonical dengan scope aktif. Recorded history memakai input
status/timestamp eksplisit dan tidak menyediakan PATCH/transition.

Dokumen workspace/data-requirements lama mempertahankan catatan desain awal.
Mapping operasional dalam dokumen ini menggantikan klaim blanket SOURCE UNAVAILABLE
untuk resource yang kini terhubung; capability tanpa sumber tetap unavailable.
Lifecycle dan bukti persistence ada di
[owner Backend](../../alos-backend/docs/legal-hr-it-operations.md).
