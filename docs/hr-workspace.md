# HR / GA Workspace

Status: **UI FINAL / SOURCE UNAVAILABLE**. Frontend HR/GA menggunakan `workspace.workspace_key` hanya sebagai identitas URL. Domain berasal dari `resolveWorkspaceDomain()` dan metadata workspace authoritative. Mismatch workspace fail closed.

Route utama:

`/workspace/[workspaceKey]/summary`, `/organization`, `/recruitment`, `/onboarding`, `/employees`, `/attendance`, `/people-performance`, `/compensation`, `/compliance`, `/offboarding`, `/performance`, serta `/ga` hanya untuk scope GA. Detail karyawan, kandidat, onboarding, dan review memakai ID URL sebagai identifier saja, bukan authority.

`/performance` adalah Target & Kinerja berbasis sumber Strategi; `/people-performance` adalah review dan pengembangan karyawan. Projects, Tasks, Approvals, Documents, Reports, Findings tetap Shared Work universal. ARA tetap universal.

HR/GA tidak menampilkan data palsu. State sumber bersifat mutually exclusive: loading, Belum Terhubung, error, Belum ada data, atau data tersedia. Informasi pribadi, kompensasi, rekening, pajak, dan identitas pemerintah default tidak ditampilkan tanpa kewenangan.

Kondisi integrasi: NEEDS CONTRACT, NEEDS BACKEND, NEEDS DECISION. Lifecycle employment, recruitment, onboarding, attendance, leave, performance, compensation, compliance, offboarding, dan GA belum diputuskan oleh frontend.
