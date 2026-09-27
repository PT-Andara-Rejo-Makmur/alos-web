# ALOS Shared Work / Pekerjaan — Architecture & Authority Specification

**Status**: Canonical Architecture & Baseline Audit  
**Date**: 2026-09-28  
**Scope**: Universal Cross-Workspace Work Modules (`alos-web`, `alos-backend`, `alos-contracts`)  
**Target Branch**: `development`

---

## 1. Purpose

Modul **Shared Work (Pekerjaan)** adalah permukaan kerja universal yang digunakan secara lintas divisi di seluruh workspace ALOS (Executive, Sales & Marketing, Property & Teknik, Finance & Pajak, Legal, HR/GA, IT). 

Shared Work menyatukan enam instrumen kerja inti:
1. **Proyek** (`projects`): Entitas proyek, inisiatif, atau program kerja lintas fungsi.
2. **Tugas** (`tasks`): Unit pekerjaan eksekutabel yang ditugaskan kepada aktor atau tim.
3. **Persetujuan** (`approvals`): Permintaan tinjauan atau keputusan berwenang (generic approval surface).
4. **Dokumen** (`documents`): Dokumen kerja berkonteks bisnis dengan klasifikasi data dan versi immutable.
5. **Laporan** (`reports`): Definisi pelaporan terstruktur dan hasil penerbitan laporan berkala.
6. **Temuan** (`findings`): Masalah, ketidaksesuaian operasional/governance, dan tindak lanjut perbaikan.

### Prinsip Fondasi:
> **MENU SAMA ≠ DATA SAMA ≠ HAK AKSES SAMA**
> 
> Seluruh divisi mengakses konsep navigasi yang seragam di bawah menu `PEKERJAAN`. Namun, visibilitas data, agregasi, dan tindakan operasional sepenuhnya ditentukan oleh **otoritas Backend** (tenant, organization, workspace, membership, role, permission, scope, data_scope, resource, action). Frontend tidak pernah menjadi authority.

---

## 2. Architecture & Design Principles

Shared Work dibangun di atas fondasi:
- **ALOS App Shell**: Layout desktop & mobile terpadu dengan navigasi vertikal terikat viewport.
- **ALOS UI Primitives v1**: 15 komponen desain murni (`DataTable`, `PageHeader`, `Drawer`, `Dialog`, `Tabs`, `Toolbar`, `FormField`, `Button`, `IconButton`, `Status`, `Alert`, `LoadingState`, `EmptyState`, `Metric`, `Pagination`).
- **Table-First Visual Pattern**: Setiap modul adalah ruang kerja operasional (bukan sekadar dashboard KPI atau "card soup").
- **Source Honesty**:
  - Bila data belum tersedia di Backend $\rightarrow$ Tampilkan **"Belum Terhubung"**.
  - Bila nilai atribut belum ada (null/undefined) $\rightarrow$ Tampilkan tanda strip (**`—`**).
  - Bila status penilaian risiko/progres belum authoritative $\rightarrow$ Tampilkan **"Belum Dinilai"** (Dilarang menebak *Sehat*, *Aman*, atau *100%*).

---

## 3. Canonical Entities

Sesuai migrasi database Backend `migrations/versions/0013_shared_work.py` dan `src/alos/documents/models.py`:

```
   ┌────────────────────────────────────────────────────────┐
   │                     core.projects                      │
   │  - project_id (PK)                                     │
   │  - tenant_id, organization_id                          │
   │  - code (unique per org), name, description            │
   │  - status (server_default: PLANNED)                    │
   │  - owner_actor_id, start_date, target_end_date         │
   │  - created_at, updated_at                              │
   └───────────────┬──────────────────────┬─────────────────┘
                   │ 1..*                 │ 1..*
                   ▼                      ▼
      ┌─────────────────────────┐   ┌───────────────────────────┐
      │ core.project_workspaces │   │        core.tasks         │
      │ - project_id (FK)       │   │ - task_id (PK)            │
      │ - workspace_id (FK)     │   │ - project_id (FK, opt)    │
      └─────────────────────────┘   │ - title, description      │
                                    │ - status (OPEN)           │
                                    │ - priority (NORMAL)       │
                                    │ - owner_actor_id          │
                                    │ - created_by, due_at      │
                                    └─────────────┬─────────────┘
                                                  │ 1..*
                                                  ▼
                                    ┌───────────────────────────┐
                                    │   core.task_workspaces    │
                                    │ - task_id, workspace_id   │
                                    └───────────────────────────┘

   ┌────────────────────────────────────────────────────────┐
   │                  core.work_approvals                   │
   │ - approval_id (PK), tenant_id, organization_id         │
   │ - subject_type, subject_id                             │
   │ - requested_by, approver_actor_id                      │
   │ - status (PENDING), decision, reason                   │
   │ - requested_at, decided_at                             │
   └───────────────┬────────────────────────────────────────┘
                   ▼
      ┌─────────────────────────────────┐
      │ core.work_approval_workspaces   │
      │ - approval_id, workspace_id     │
      └─────────────────────────────────┘

   ┌────────────────────────────────────────────────────────┐
   │                   core.work_reports                    │
   │ - report_id (PK), tenant_id, organization_id           │
   │ - title, report_type, status (DRAFT)                   │
   │ - owner_actor_id, created_at, updated_at               │
   └───────────────┬────────────────────────────────────────┘
                   ▼
      ┌─────────────────────────────────┐
      │   core.work_report_workspaces   │
      │ - report_id, workspace_id       │
      └─────────────────────────────────┘

   ┌────────────────────────────────────────────────────────┐
   │                   core.work_findings                   │
   │ - finding_id (PK), tenant_id, organization_id          │
   │ - title, description                                   │
   │ - severity (MEDIUM), status (OPEN), source_type        │
   │ - owner_actor_id, created_at, updated_at               │
   └───────────────┬────────────────────────────────────────┘
                   ▼
      ┌─────────────────────────────────┐
      │   core.work_finding_workspaces  │
      │ - finding_id, workspace_id      │
      └─────────────────────────────────┘

   ┌────────────────────────────────────────────────────────┐
   │                  Document Authority                    │
   │ - DocumentMetadata:                                    │
   │   document_id, tenant_id, org_id, workspace_id         │
   │   title, category, data_classification, status         │
   │   owner_actor_id, created_at                           │
   │ - DocumentVersion (immutable):                         │
   │   version, source_id, source_version, storage_uri      │
   │   content_hash (sha256:...), created_by, created_at    │
   └────────────────────────────────────────────────────────┘
```

---

## 4. Repository Ownership

| Layer | Repository | Tanggung Jawab Otoritatif |
|---|---|---|
| **Contracts** | `alos-contracts` | Skema JSON Schema, enum canonical, data classification vocabulary, RBAC vocabulary. |
| **Backend** | `alos-backend` | Relational tables (`core.*`), ORM persistence, domain services, authorization policies, scope filtering, mutation endpoints, audit trail. |
| **Frontend** | `alos-web` | App Shell, navigasi `PEKERJAAN`, rendering UI primitives, table views, detail drawers/pages, presentation formatting, handling "Belum Terhubung" bila API belum siap. |
| **Cognitive Engine** | `genesis-ai` | Reasoning asistif, analisis anomali, rekomendasi draf tugas/temuan. **Bukan authority** (tidak bisa approve, close, publish, atau bypass security). |

---

## 5. Modules Specification

### 5.1 Proyek (`projects`)
- **Tujuan**: Mengelola proyek konstruksi, properti, sistem IT, peluncuran produk/cluster, inisiatif hukum/pajak/HR.
- **Tampilan Utama**: `DataTable` dengan kolom Kode, Nama Proyek, Pemilik, Workspace, Periode, Status.
- **Tabs**: Semua, Proyek Saya, Berjalan, Berisiko, Selesai, Diarsipkan (hanya aktif sesuai ketersediaan data authoritative).
- **Detail**:
  - *Quick View (Drawer)*: Ringkasan 2-kolom, status, pemilik, tanggal, relasi ringkas.
  - *Full Detail (Page)*: Tabs Ringkasan, Rencana, Tugas, Dokumen, Persetujuan, Temuan, Bukti, Aktivitas.

### 5.2 Tugas (`tasks`)
- **Tujuan**: Unit kerja eksekutabel individu dan tim.
- **Tampilan Utama**: `DataTable` (Daftar adalah default utama; Papan/Kalender hanya jika data dan filter mencukupi).
- **Kolom**: Tugas, Proyek, Pemilik, Prioritas, Status, Tenggat, Workspace.
- **Dependensi**: Relasi sederhana `blocked_by` (tidak ada workflow engine rumit di frontend).

### 5.3 Persetujuan (`approvals`)
- **Tujuan**: Generic approval surface untuk tinjauan dokumen, anggaran, perubahan proyek, dan operasional.
- **Pemisahan Peran (Separation of Duties)**: Pengusul $\rightarrow$ Reviewer $\rightarrow$ Approver.
- **Keputusan**: Setujui, Kembalikan, Tolak, Tahan (hanya aktif jika user memegang permission Backend yang sah).

### 5.4 Dokumen (`documents`)
- **Tujuan**: Dokumen kerja berkonteks bisnis nyata (bukan file browser).
- **Versi**: Immutable (tidak ada aksi "Edit Versi", melainkan "Buat Versi Baru").
- **Klasifikasi Data**: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`.

### 5.5 Laporan (`reports`)
- **Pemisahan**:
  1. *Definisi Laporan*: Nama, Jenis, Frekuensi, Lingkup, Pemilik, Review Required.
  2. *Hasil Laporan*: Nama Laporan, Periode, Lingkup, Pemilik, Status, Tanggal Terbit.

### 5.6 Temuan (`findings`)
- **Tujuan**: Masalah, deviasi operasional, ketidaksesuaian governance, dan tindak lanjut perbaikan (*corrective action*).
- **Severity**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- **Relasi**: Finding $\rightarrow$ Task (Corrective Action) $\rightarrow$ Evidence $\rightarrow$ Verification $\rightarrow$ Close.

---

## 6. Relationship Model

Shared Work mengintegrasikan relasi antar-entitas secara organik:
- **Proyek** mengelompokkan Tugas, Dokumen, Persetujuan, Laporan, Temuan, dan Bukti.
- **Temuan** menghasilkan Tugas perbaikan (*Corrective Action*) dan didukung oleh Bukti (*Evidence*).
- **Persetujuan** merujuk pada objek target (`subject_type`, `subject_id`) seperti Dokumen, Rencana, atau Pengeluaran.
- **Source Honesty pada Hubungan**:
  - Bila jumlah tugas atau dokumen terkait belum dihitung secara authoritative oleh Backend, UI menampilkan tanda strip (**`—`**) atau **"Belum Terhubung"**, **bukan angka 0**.

---

## 7. Authorization & Scoping Model

Otoritas kepemilikan dan akses data:
1. **Tenant ID & Organization ID**: Ruang lingkup multi-tenant yang wajib menyertai setiap record.
2. **Workspace ID**: Proyek dan instrumen Shared Work berasosiasi dengan satu atau lebih workspace (`core.project_workspaces`, `core.task_workspaces`, dll).
3. **Data Scope**:
   - `COMPANY`: Akses lintas perusahaan (hanya jika diberikan hak khusus).
   - `ORGANIZATIONAL_UNIT`: Akses satu unit bisnis/divisi.
   - `WORKSPACE`: Akses terbatas pada ruang kerja aktif user.
   - `PROJECT`: Akses dibatasi pada proyek tempat user terdaftar.
   - `OWN_ASSIGNED`: Akses hanya untuk tugas/item yang ditugaskan ke aktor bersangkutan.
4. **Prinsip Fail-Closed**:
   - Error 401: Sesi berakhir $\rightarrow$ Arahkan ke Login.
   - Error 403: Tindakan ditolak $\rightarrow$ Tampilkan pesan ramah tanpa membocorkan data.
   - Error 404: Objek tidak ditemukan atau tidak diizinkan diakses $\rightarrow$ Jangan membocorkan apakah objek tersebut sebenarnya eksis.

---

## 8. Permission Matrix (Target Vocabulary)

| Modul | Read Permission | Create Permission | Update/Mutation Permission | Lifecycle/State Permission |
|---|---|---|---|---|
| **Proyek** | `project.read` | `project.create` | `project.update` | `project.archive` |
| **Tugas** | `task.read` | `task.create` | `task.update`, `task.assign` | `task.complete` |
| **Persetujuan** | `approval.read` | `approval.request` | `approval.review` | `approval.approve`, `approval.return`, `approval.reject`, `approval.hold` |
| **Dokumen** | `document.read` (`scope.documents.read`) | `document.create` (`scope.documents.write`) | `document.version.create` | `document.review`, `document.approve`, `document.retire` |
| **Laporan** | `report.read` | `report.create` | `report.review` | `report.publish`, `report.archive` |
| **Temuan** | `finding.read` | `finding.create` | `finding.assign`, `finding.update` | `finding.verify`, `finding.close` |

*Catatan: Seluruh permission di atas adalah target vocabulary terencana. Implementasi saat ini di Frontend membaca `permission_refs`, `role_refs`, dan `scope_refs` dari session aktif secara adaptif dan fail-closed.*

---

## 9. Data Classification

Sesuai `src/alos/documents/models.py`:

| Klasifikasi | Penyajian UI | Penanganan Akses |
|---|---|---|
| `PUBLIC` | Publik | Dapat diakses seluruh anggota terotentikasi. |
| `INTERNAL` | Internal | Khusus anggota internal workspace/organisasi. |
| `CONFIDENTIAL` | Rahasia | Terbatas pada peran atau penugasan spesifik. |
| `RESTRICTED` | Sangat Terbatas | Hanya anggota dengan hak eksplisit (IT_ADMIN/Executive tidak otomatis dapat membuka data bisnis terlarang). |

---

## 10. Canonical Lifecycles

### Proyek
- Database default: `PLANNED`
- Presentation mapping:
  - `PLANNED` $\rightarrow$ **Direncanakan** (status: info/neutral)
  - `ACTIVE` $\rightarrow$ **Berjalan** (status: success)
  - `ON_HOLD` $\rightarrow$ **Ditahan** (status: warning)
  - `COMPLETED` $\rightarrow$ **Selesai** (status: success)
  - `CANCELLED` $\rightarrow$ **Dibatalkan** (status: danger)
  - `ARCHIVED` $\rightarrow$ **Diarsipkan** (status: neutral)

### Tugas
- Database default: `OPEN`
- Target presentation:
  - `OPEN` $\rightarrow$ **Belum Dimulai**
  - `IN_PROGRESS` $\rightarrow$ **Dalam Proses**
  - `BLOCKED` $\rightarrow$ **Terhambat**
  - `UNDER_REVIEW` $\rightarrow$ **Menunggu Review**
  - `COMPLETED` $\rightarrow$ **Selesai**
  - `CANCELLED` $\rightarrow$ **Dibatalkan**

### Persetujuan
- Database default: `PENDING`
- Target presentation:
  - `PENDING` $\rightarrow$ **Menunggu Keputusan**
  - `APPROVED` $\rightarrow$ **Disetujui**
  - `RETURNED` $\rightarrow$ **Dikembalikan**
  - `REJECTED` $\rightarrow$ **Ditolak**
  - `HELD` $\rightarrow$ **Ditahan**

### Dokumen
- Backend authoritative enum (`DocumentMetadata`):
  - `DRAFT` $\rightarrow$ **Draf**
  - `IN_REVIEW` $\rightarrow$ **Dalam Review**
  - `APPROVED` $\rightarrow$ **Disetujui**
  - `REJECTED` $\rightarrow$ **Ditolak**
  - `RETIRED` $\rightarrow$ **Tidak Berlaku**

---

## 11. API Gap Analysis (Hasil Audit Realitas)

| Fitur | Database (0013) | Backend Service | Contracts Schema | Public API Route | Backend Permission | Status Kesiapan |
|---|---|---|---|---|---|---|
| **Proyek** | `core.projects`, `core.project_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Tugas** | `core.tasks`, `core.task_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Persetujuan** | `core.work_approvals`, `core.work_approval_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Dokumen** | `core.documents`, `core.document_versions` | `DocumentRegistry` (in-memory) | **Belum Ada** | **Belum Ada** | `scope.documents.*` | *Service Siap, Public Route Belum Terhubung* |
| **Laporan** | `core.work_reports`, `core.work_report_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Temuan** | `core.work_findings`, `core.work_finding_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |

> **Konsekuensi Frontend**: Sesuai mandat, frontend **TIDAK MEMBUAT MOCK RUNTIME** atau rute palsu. Frontend menampilkan UI riil terhubung ke endpoint `/api/v1/projects` (melalui proxy `/api/backend/api/v1/projects`), dan ketika backend mengembalikan status 404/501 (karena route belum didaftarkan di backend), antarmuka menampilkan status **"Belum Terhubung"** secara elegan dan informatif.

---

## 12. UI Patterns & Guidelines

- **Page Header**:
  - Eyebrow: `PEKERJAAN`
  - Title: Judul Modul (mis. `Proyek`)
  - Description: Teks penjelas ringkas
  - Actions: Tombol aksi utama (mis. `Tambah Proyek`), hanya dimunculkan jika aktor memiliki hak `create`.
- **Tabs / View**: Filter kategori primer yang beroperasi di atas data terotentikasi.
- **Toolbar**:
  - Kolom pencarian kontekstual (lebar 280–360px).
  - Filter horizontal ringkas (Status, Workspace, Pemilik, Periode).
- **Tabel Data**:
  - Memanfaatkan primitive `DataTable`.
  - Tinggi baris 48–52px yang rapi dan terukur.
  - Sticky header pada daftar panjang, horizontal scroll untuk layar sempit.
  - Klik baris membuka **Quick View Drawer**.
- **Drawer vs Detail Page**:
  - *Drawer*: Quick overview (status, tanggal, pemilik, ringkasan relasi).
  - *Detail Page*: Halaman lengkap untuk tabulasi relasi detail, timeline aktivitas, dan bukti.

---

## 13. Route Map

```
/workspace
/workspace/executive
/workspace/[workspaceKey]/projects
/workspace/[workspaceKey]/projects/[projectId]
/workspace/[workspaceKey]/tasks
/workspace/[workspaceKey]/approvals
/workspace/[workspaceKey]/documents
/workspace/[workspaceKey]/reports
/workspace/[workspaceKey]/findings
```

*Catatan: Tersedia juga alias fallback `/workspace/projects` yang secara otomatis mengidentifikasi active workspace pengguna dan merender halaman proyek yang relevan.*

---

## 14. Data Requirements & Schemas for Backend Completion

Untuk melengkapi integrasi Backend di masa depan, dibutuhkan:
1. **Pydantic Models** di `alos-backend/src/alos/projects/models.py`:
   - `ProjectProjection`: id, code, name, description, status, owner, workspace_ids, start_date, target_end_date, created_at, updated_at.
   - `ProjectCreateRequest`, `ProjectUpdateRequest`.
2. **Contracts Schema** di `alos-contracts/schemas/work/project-projection.schema.json`.
3. **Public API Routes** di `alos-backend/src/alos/api/public/work_routes.py`:
   - `GET /api/v1/projects`
   - `POST /api/v1/projects`
   - `GET /api/v1/projects/{project_id}`
   - `PATCH /api/v1/projects/{project_id}`

---

## 15. Evidence & Audit History Pattern

- **Bukti (Evidence)**: Tidak dibuat sebagai menu tersendiri di sidebar, melainkan komponen pendukung di dalam detail objek (proyek, tugas, temuan, persetujuan).
- **Aktivitas (Audit Trail)**:
  - Ditampilkan dalam format timeline vertikal yang ramah manusia (`Hari, Tanggal · Waktu`, Aktor, Deskripsi perubahan).
  - ID teknis korelasi (`correlation_id`) disembunyikan dalam expandable "Detail teknis".

---

## 16. GENESIS & ARA Boundaries

- **GENESIS (AI Engine)**:
  - Berfungsi menyusun analisis prediktif, draf temuan (*candidate findings*), dan rekomendasi tugas.
  - **Dilarang keras**: Mengesahkan keputusan, menyetujui anggaran, menutup temuan, atau mengubah hak akses.
- **ARA (Assistant)**:
  - Menyajikan pencarian cerdas berbasis izin pengguna.
  - ARA tidak pernah melihat data di luar scope pengguna yang bertanya.

---

## 17. Testing Requirements

Pengujian frontend Shared Work wajib mencakup:
- [x] Shared implementation tunggal lintas seluruh workspace (tidak ada duplikasi kode per divisi).
- [x] Sidebar `PEKERJAAN` yang bersih tanpa submenu atau filter internal.
- [x] Otoritas Backend: Tindakan create/mutate disembunyikan jika izin tidak ada di session.
- [x] Source honesty: Menampilkan "Belum Terhubung" dan status "—", tidak menampilkan angka 0 atau persentase palsu.
- [x] Error handling yang ramah pengguna dalam Bahasa Indonesia (401, 403, 404, 409).
- [x] Aksesibilitas: Keyboard navigation, ARIA roles, focus management pada drawer.

---

## 18. Implementation Sequence

1. **FASE A — Audit**: Audit realitas database, services, contracts, public routes, dan permissions (*Selesai*).
2. **FASE B — Gap Analysis & Architecture**: Dokumentasi menyeluruh dan identifikasi kebutuhan (*Selesai*).
3. **FASE C — Shared Work Foundation**: Pembangunan modul reusable di `src/features/shared-work/shared/` (*Sedang Berjalan*).
4. **FASE D1 — Proyek**: Implementasi modul Proyek secara lengkap hingga lolos quality gates (*Sedang Berjalan*).
5. **STOP**: Evaluasi hasil FASE D1 sebelum melangkah ke Tugas, Persetujuan, Dokumen, Laporan, dan Temuan.

---

## 19. Known Gaps & NEEDS DECISION

### Gaps:
- Modul database `core.projects`, `core.tasks`, `core.work_approvals`, `core.work_reports`, `core.work_findings` ada di migrasi `0013`, namun belum memiliki ORM models di `src/alos/persistence/models.py`.
- Belum ada public router FastAPI untuk CRUD Shared Work di `alos-backend`.
- `alos-contracts` belum memuat JSON Schema untuk Shared Work.

### Item NEEDS DECISION:
1. **Task Lifecycle Canonical Values**:
   - *Option A*: `["OPEN", "IN_PROGRESS", "BLOCKED", "UNDER_REVIEW", "COMPLETED", "CANCELLED"]`
   - *Option B*: Minimalis `["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]`
   - *Dampak*: Mempengaruhi kelengkapan tab dan filter status di modul Tugas.
2. **Approval Subject Types**:
   - *Option A*: String bebas (`subject_type: str`)
   - *Option B*: Strict canonical enum `["DOCUMENT", "BUDGET", "PROJECT_CHANGE", "STRATEGY_TARGET", "RELEASE"]`
   - *Dampak*: Menentukan interoperabilitas modul Persetujuan dengan dokumen dan strategi.
3. **Data Scope Evaluation & Role Granularity**:
   - *Option A*: Evaluasi otomatis berbasis keanggotaan workspace (`core.project_workspaces`).
   - *Option B*: Evaluasi granular berbasis ACL per proyek.
   - *Dampak*: Kompleksitas query SQL dan latency listing proyek.

---

## 20. Definition of Done (Proyek Stage)

Tahap FASE D1 (Proyek) dinyatakan **PASS** apabila:
1. Seluruh arsitektur Shared Work terpusat di `src/features/shared-work/`.
2. Sidebar menampilkan menu `PEKERJAAN` dengan 6 instrumen standar.
3. Halaman Proyek (`/workspace/[workspaceKey]/projects`) menampilkan tabel, filter, quick-view drawer, dan detail shell yang jujur terhadap ketersediaan backend.
4. Tidak ada mock data palsu pada runtime produksi.
5. Pesan error dan status disajikan dalam Bahasa Indonesia yang beradab.
6. Lolos seluruh pengujian:
   - `pnpm lint` $\rightarrow$ 0 error, 0 warning.
   - `pnpm typecheck` $\rightarrow$ 0 type error.
   - `pnpm test` $\rightarrow$ 100% lulus.
   - `pnpm build` $\rightarrow$ Berhasil build Next.js.
