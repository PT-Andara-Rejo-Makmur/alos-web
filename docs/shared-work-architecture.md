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

## 8. Permission Object Vocabulary

| Modul | Read Permission | Create Permission | Update/Mutation Permission | Lifecycle/State Permission |
|---|---|---|---|---|
| **Proyek** | `project.read` | `project.create` | `project.update` | `project.archive` |
| **Tugas** | `task.read` | `task.create` | `task.update`, `task.assign` | `task.complete` |
| **Persetujuan** | `approval.read` | `approval.request` | `approval.review` | `approval.approve`, `approval.return`, `approval.reject`, `approval.hold` |
| **Dokumen** | `document.read` (`scope.documents.read`) | `document.create` (`scope.documents.write`) | `document.version.create` | `document.review`, `document.approve`, `document.retire` |
| **Laporan** | `report.read` | `report.create` | `report.review` | `report.publish`, `report.archive` |
| **Temuan** | `finding.read` | `finding.create` | `finding.assign`, `finding.update` | `finding.verify`, `finding.close` |

Permission object di atas adalah referensi capability consumer, bukan grant authority.
Frontend membaca `permission_refs`, `role_refs` dan `scope_refs` dari session aktif.
Backend dapat menerima permission work yang sesuai sebagai alternatif object permission,
tetapi tetap memeriksa owner visibility, membership, classification dan pemisahan actor.
Lihat policy pada `SharedWorkService` serta projection permissions canonical; tabel ini
tidak mengizinkan bypass human decision atau perubahan scope dari browser.

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
  - `ASSIGNED` $\rightarrow$ **Ditugaskan**
  - `IN_PROGRESS` $\rightarrow$ **Dalam Perbaikan**
  - `PENDING_VERIFICATION` $\rightarrow$ **Menunggu Verifikasi**
  - `VERIFIED` $\rightarrow$ **Terverifikasi**
  - `CLOSED` $\rightarrow$ **Ditutup**

Status Temuan mengikuti `FindingStatus` pada `shared-work.schema.json`; frontend
tidak menambah IN_REVIEW/CANCELLED/DUPLICATE sebagai lifecycle Temuan canonical.

---

## 11. Integrasi API Terkini

Semua resource berikut memiliki owner Backend, contracts, API, scope dan persistence.
Spesifikasi UX tidak menggantikan lifecycle/field canonical; Backend tetap authority.

| Fitur | API canonical | Owner dan batas |
| --- | --- | --- |
| Proyek | `/api/v1/projects` | SharedWorkService; tenant/workspace links dan membership owner |
| Tugas | `/api/v1/tasks` | SharedWorkService; assignment dan dependency, completion/progress diperiksa Backend |
| Persetujuan | `/api/v1/approvals` | Human decision independen, requested action/snapshot dan consumption |
| Dokumen | `/api/v1/documents` | Metadata/immutable version, upload job, private object store, review/approval |
| Laporan | `/api/v1/reports` | Submit/review/publish/archive dengan pemisahan actor/permission |
| Temuan | `/api/v1/findings` | Submit/verify/close; tugas korektif tertaut wajib COMPLETED sebelum verify/close |
| Anggota workspace | `/api/v1/workspace-members` | Projection membership aktif untuk assignment; bukan HR atau Identity authority kedua |

Read/mutation memakai permission object dan/atau work permission yang diterima
Backend. Workspace asing ditolak, bukan dianggap data kosong. Contract source ada
pada [Shared Work schemas](https://github.com/PT-Andara-Rejo-Makmur/alos-contracts/blob/development/schemas/shared-work/README.md).
Unknown/outage ditampilkan sesuai hasil API; daftar kosong hanya setelah scoped query berhasil.

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

Action create/assign/mutate hanya tersedia sesuai permission Backend. Assignment membaca
anggota workspace melalui `/api/v1/workspace-members`. Team visibility tetap mengikuti
projection/scope Backend; client tidak membentuk tim dari akun atau role lokal.

---

## 14. Penerimaan dan Batas yang Tersisa

Browser/API disposable membuktikan task dependency, isolation, approval pending/self/
stale/replay, metadata-only document, TXT/DOCX worker, immutable versions dan hash,
independent review, Reports publish/archive serta Findings verify/close.
Lihat [UAT development](https://github.com/PT-Andara-Rejo-Makmur/alos-infra/blob/development/docs/BUSINESS_UAT_2026-10-04.md). Fixture sintetis bukan data perusahaan atau approval produksi.

TEXT/DOCX didukung; PDF/OCR dan export laporan PDF/DOCX tidak dinyatakan tersedia.
Object-store/backup/restore produksi perlu konfigurasi dan proof environment tujuan.
Subject types dan material actions hanya yang didefinisikan contracts; nama UX atau
status presentasi tidak menambah enum, grant atau approval authority.
Angka yang belum diukur, team agregat tanpa projection dan AI extraction yang belum
terintegrasi tetap ditampilkan unknown/unavailable. Backend menolak unsupported action.
