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
- Data Classification:
  - `PUBLIC` $\rightarrow$ **Publik**
  - `INTERNAL` $\rightarrow$ **Internal**
  - `CONFIDENTIAL` $\rightarrow$ **Rahasia**
  - `RESTRICTED` $\rightarrow$ **Sangat Terbatas**

### Laporan
- Target presentation:
  - `DRAFT` $\rightarrow$ **Draf**
  - `IN_REVIEW` $\rightarrow$ **Dalam Review**
  - `APPROVED` $\rightarrow$ **Disetujui**
  - `PUBLISHED` $\rightarrow$ **Diterbitkan**
  - `ARCHIVED` $\rightarrow$ **Diarsipkan**
- Frequency presentation:
  - `DAILY` $\rightarrow$ **Harian**
  - `WEEKLY` $\rightarrow$ **Mingguan**
  - `MONTHLY` $\rightarrow$ **Bulanan**
  - `QUARTERLY` $\rightarrow$ **Kuartalan**
  - `ON_DEMAND` $\rightarrow$ **Sesuai Permintaan**

### Temuan
- Severity presentation:
  - `LOW` $\rightarrow$ **Rendah**
  - `MEDIUM` $\rightarrow$ **Sedang**
  - `HIGH` $\rightarrow$ **Tinggi**
  - `CRITICAL` $\rightarrow$ **Kritis**
- Status presentation:
  - `OPEN` $\rightarrow$ **Terbuka**
  - `IN_REVIEW` $\rightarrow$ **Dalam Peninjauan**
  - `ASSIGNED` $\rightarrow$ **Ditugaskan**
  - `IN_PROGRESS` $\rightarrow$ **Dalam Perbaikan**
  - `PENDING_VERIFICATION` $\rightarrow$ **Menunggu Verifikasi**
  - `VERIFIED` $\rightarrow$ **Terverifikasi**
  - `CLOSED` $\rightarrow$ **Ditutup**
  - `CANCELLED` $\rightarrow$ **Dibatalkan**
  - `DUPLICATE` $\rightarrow$ **Duplikat**

---

## 11. API Gap Analysis (Hasil Audit Realitas)

| Fitur | Database (0013 / 0005) | Backend Service | Contracts Schema | Public API Route | Backend Permission | Status Kesiapan |
|---|---|---|---|---|---|---|
| **Proyek** | `core.projects`, `core.project_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Tugas** | `core.tasks`, `core.task_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Persetujuan** | `core.work_approvals`, `core.work_approval_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Dokumen** | `core.documents`, `core.document_versions` | `DocumentRegistry` (in-memory) | **Belum Ada** | **Belum Ada** | `scope.documents.*` | *Service Siap, Public Route Belum Terhubung* |
| **Laporan** | `core.work_reports`, `core.work_report_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |
| **Temuan** | `core.work_findings`, `core.work_finding_workspaces` | **Belum Ada** | **Belum Ada** | **Belum Ada** | **Belum Ada** | *DB Siap, API Belum Terhubung* |

> **Konsekuensi Frontend**: Sesuai mandat, frontend **TIDAK MEMBUAT MOCK RUNTIME** atau rute palsu. Ketika backend mengembalikan status 404/501 (karena route belum didaftarkan di backend), antarmuka menampilkan status **"Belum Terhubung"** secara elegan dan informatif.

---

## 12. UI Patterns & Guidelines

- **Page Header**:
  - Eyebrow: `PEKERJAAN`
  - Title: Judul Modul (mis. `Persetujuan`, `Dokumen`, `Laporan`, `Temuan`)
  - Description: Teks penjelas ringkas
  - Actions: Tombol aksi utama (hanya dimunculkan jika aktor memiliki hak authoritative terkait).
- **Tabs / View**: Filter kategori primer yang beroperasi di atas data terotentikasi.
- **Toolbar**:
  - Kolom pencarian kontekstual (lebar 280–360px).
  - Filter horizontal ringkas.
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

# Proyek
/workspace/[workspaceKey]/projects
/workspace/[workspaceKey]/projects/[projectId]

# Tugas
/workspace/[workspaceKey]/tasks
/workspace/[workspaceKey]/tasks/[taskId]

# Persetujuan
/workspace/[workspaceKey]/approvals
/workspace/[workspaceKey]/approvals/[approvalId]

# Dokumen
/workspace/[workspaceKey]/documents
/workspace/[workspaceKey]/documents/[documentId]

# Laporan
/workspace/[workspaceKey]/reports
/workspace/[workspaceKey]/reports/[reportId]

# Temuan
/workspace/[workspaceKey]/findings
/workspace/[workspaceKey]/findings/[findingId]
```

Route list lama `/workspace/{projects|tasks|approvals|documents|reports|findings}` hanya dipertahankan
sebagai compatibility redirect ke active workspace. Route canonical dan seluruh detail selalu
memakai `/workspace/[workspaceKey]/...`.

Action create Proyek/Tugas hanya terlihat bila permission authoritative tersedia. Selama mutation
belum tersedia, action tersebut disabled dan tidak membuat row atau success state lokal. Scope tab
Tim tetap `Belum Terhubung` sampai Backend menyediakan team boundary canonical.

---

## 14. Implementation Sequence

1. **FASE A — Audit**: Audit realitas database, services, contracts, public routes, dan permissions (*Selesai*).
2. **FASE B — Gap Analysis & Architecture**: Dokumentasi menyeluruh dan identifikasi kebutuhan (*Selesai*).
3. **FASE C — Shared Work Foundation**: Pembangunan modul reusable di `src/features/shared-work/shared/` (*Selesai*).
4. **FASE D1 — Proyek**: Implementasi modul Proyek secara lengkap, visual review approval, tab scroller removal, centering empty state (*Selesai & Disetujui*).
5. **FASE D2 — Tugas**: Implementasi modul Tugas universal lintas workspace, filter status & prioritas, TaskDrawer, full detail view, fail-closed authority (*Selesai & Disetujui*).
6. **FASE D3 — Persetujuan**: Universal approval surface, pemisahan peran Pengusul $\rightarrow$ Reviewer $\rightarrow$ Approver, decision drawer & detail view, fail-closed actions (*Selesai*).
7. **FASE D4 — Dokumen**: Business context documents, klasifikasi data (`PUBLIC` s/d `RESTRICTED`), versi immutable (tanpa "Edit Versi"), detail view (*Selesai*).
8. **FASE D5 — Laporan**: Pemisahan tegas Hasil Laporan dan Definisi Laporan, frequency badge, tidak ada fake export PDF/DOCX, detail view (*Selesai*).
9. **FASE D6 — Temuan**: Pelacakan deviasi/masalah operasional, severity mapping, relasi corrective action ke Tugas, tidak ada otoritas otomatis GENESIS (*Selesai*).
10. **STOP**: Tunggu review menyeluruh dari pengguna.

---

## 15. Known Gaps & NEEDS DECISION

### Gaps Aktual (Audit 4 Modul Terkini):
- **Persetujuan**: Database `core.work_approvals` siap di `0013` dengan kolom `approval_id`, `subject_type`, `subject_id`, `requested_by`, `approver_actor_id`, `status` (server_default="PENDING"), `decision`, `reason`. Belum ada mutation endpoint di backend. Frontend menyajikan alur SoD secara read-only jujur tanpa tombol no-op.
- **Dokumen**: Backend memiliki model `DocumentMetadata` dan `DocumentVersion` di `0005` & `persistence/models.py`. Public REST route `/api/v1/documents` belum didaftarkan. UI menyajikan versi immutable dan proteksi klasifikasi fail-closed.
- **Laporan**: Database `core.work_reports` di `0013` memiliki `report_id`, `title`, `report_type`, `status` (server_default="DRAFT"), `owner_actor_id`. Pemisahan hasil laporan dan definisi laporan diimplementasikan di frontend. Export engine (PDF/DOCX) belum ada dan tidak dibuat tiruan tombolnya.
- **Temuan**: Database `core.work_findings` di `0013` memiliki `finding_id`, `title`, `description`, `severity`, `status`, `source_type`. Relasi corrective action dipetakan ke Tugas. Belum ada API backend publik.

### Item NEEDS DECISION:
1. **Persetujuan Canonical Subject Types**:
   - Nilai subjek yang diakomodasi: `PROJECT`, `TASK`, `DOCUMENT`, `REPORT`, `FINDING`, serta domain material (`PAYMENT`, `CONTRACT`, dsb.). Belum ada validasi CHECK constraint di DB.
2. **Dokumen Storage Adapter & File Upload API**:
   - Menunggu backend mengimplementasikan adapter storage S3/MinIO atau local file system untuk attachment.
3. **Laporan Template Definition & Aggregation Engine**:
   - Menunggu service backend untuk query generator lintas workspace.
4. **Temuan Workflow Transitions & GENESIS Candidate Integration**:
   - Menunggu validasi flow human-in-the-loop untuk promosi kandidat temuan AI menjadi temuan resmi.

