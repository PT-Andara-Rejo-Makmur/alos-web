# ALOS Web

`alos-web` adalah unified human/product experience untuk ALOS Business Workspace, ARA Human
AI Workspace, GENESIS IT Control Plane, Director Decision Workspace, dan GIIVEPRO. Frontend
adalah projection dan command surface; ALOS Backend tetap menjadi sumber kebenaran.

## Peran produk

- **Business** membantu tim menjalankan pekerjaan operasional perusahaan.
- **ARA** menyediakan workspace kolaborasi manusia dan AI untuk pengguna bisnis.
- **GENESIS** menyediakan control-plane UI yang detail bagi IT.
- **Director** menyajikan konteks keputusan secara ringkas dan tidak menampilkan raw JSON.
- **GIIVEPRO** menyediakan tenant-facing product experience di atas authority ALOS yang sama.

Frontend tidak memutus permission, approval, release, atau canonical state. Browser tidak
memanggil GENESIS maupun model provider secara langsung dan tidak menyimpan secret.

## Arsitektur

```text
Browser / alos-web
        |
        | HTTPS + typed public contract
        v
   ALOS Backend (authority)
        |
        +----> GENESIS internal API
        +----> ToolExecutor / persistence / audit
```

Seluruh request aplikasi melewati `src/lib/api/`. Base URL Backend berasal dari
`NEXT_PUBLIC_ALOS_API_BASE_URL`. Correlation ID dari response disimpan hanya sebagai metadata
troubleshooting pada session browser, bukan authoritative state.

## Stack

- Next.js App Router
- React
- TypeScript strict
- pnpm
- ESLint
- Vitest dan Testing Library

Tidak ada Redux, Zustand, provider SDK, atau framework state-management besar pada baseline.

## Prasyarat

- Node.js 22 LTS atau versi yang kompatibel dengan package manifest
- pnpm 11.19 atau versi kompatibel dengan field `packageManager`
- ALOS Backend opsional untuk menjalankan shell; tanpa Backend UI menampilkan status
  `Belum dikonfigurasi`

## Instalasi Windows PowerShell

```powershell
corepack enable
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

## Instalasi Linux/macOS

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Buka `http://localhost:3000`. Jangan mengisi environment publik dengan credential atau secret.

## Environment

```dotenv
NEXT_PUBLIC_ALOS_API_BASE_URL=http://localhost:8000
```

Kosongkan nilainya ketika Backend belum tersedia. Hanya URL publik Backend yang boleh memakai
prefix `NEXT_PUBLIC_`.

## Perintah pengembangan

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Build production dapat dijalankan dengan `pnpm start` setelah `pnpm build` selesai.

## Route

- `/`: landing shell dan status koneksi.
- `/business`: operasi bisnis.
- `/business/[module]`: projection MVP-1 untuk divisi, proyek, task, approval, dokumen, report,
  finding, Genesis shortcut, dan settings.
- `/ara`: Human AI Workspace.
- `/genesis`: IT Control Plane.
- `/director`: executive decision workspace.
- `/giivepro`: tenant/product experience.

Route awal tidak berisi fake business data. Shell utama memeriksa
`GET /api/v1/system/integration` hanya melalui Backend dan menampilkan correlation ID untuk
troubleshooting ketika sukses. Setiap pengalaman menjelaskan status integrasi serta boundary
authority yang berlaku.

UI MVP-1 yang dipertahankan beserta status dependency Backend dijelaskan pada
[Migrasi Frontend MVP-1](docs/MVP1_FRONTEND_MIGRATION.md).

## Integrasi contract

Contract lintas service harus berasal dari generated TypeScript package `alos-contracts`.
Selama package tersebut belum dipublikasikan, `src/lib/contracts/` menjadi integration boundary
dengan projection sempit sementara untuk diagnostic baseline. Boundary ini tidak mendefinisikan
ulang `AgentRunResult`, `ReviewPackage`, `ReleaseState`, atau `Decision`. View model review bersifat
projection-only dan berada di feature UI.

## Keamanan frontend

- Seluruh network request menuju ALOS Backend melalui satu client.
- Tidak ada direct GENESIS URL atau model-provider SDK.
- Permission dan action availability dari Backend tidak dianggap sebagai pengganti enforcement.
- Decision command selalu menunggu response Backend sebelum UI diperbarui.
- Tidak ada token atau authoritative business state yang dipersistenkan oleh baseline.
- Error yang ditampilkan aman dan correlation ID dapat disalin untuk troubleshooting.

## Struktur dan dokumentasi

Lihat [Arsitektur](ARCHITECTURE.md), [Struktur Folder](docs/FOLDER_STRUCTURE.md),
[Experiences](docs/EXPERIENCES.md), [Integrasi API](docs/API_INTEGRATION.md), dan
[Review UX](docs/REVIEW_UX.md), serta [Migrasi Frontend MVP-1](docs/MVP1_FRONTEND_MIGRATION.md).

## Workflow perubahan

1. Pastikan kebutuhan ditempatkan pada experience dan feature yang tepat.
2. Gunakan contract generated; jangan membuat salinan type lintas service.
3. Tambahkan request hanya melalui `src/lib/api/`.
4. Tambahkan test untuk state kosong, error, permission projection, dan command flow.
5. Jalankan lint, typecheck, test, serta production build sebelum pull request.
