# ALOS Web

ALOS Web adalah dashboard dan frontend ALOS. Browser berinteraksi dengan Web melalui
boundary yang terdefinisi; ALOS Backend tetap menjadi authority untuk session dan data.

## Boundary runtime

```text
Browser
  -> ALOS Web
     -> /api/session/*
     -> /api/backend/*
        -> ALOS Backend
           -> GENESIS / internal systems
```

Runtime frontend saat ini mencakup:

- login melalui `/login`;
- pemeriksaan dan pengelolaan session melalui `/api/session/*`;
- `/workspace` sebagai landing setelah pemeriksaan session;
- AppShell canonical dan route publik `/workspace/[workspaceKey]/...` untuk tujuh domain;
- dashboard Executive, Sales, Property, Finance, Legal, HR & GA, dan IT;
- Shared Work universal dan ARA universal dalam keadaan source-honest;
- `/api/backend/*` sebagai API/BFF boundary untuk request yang sudah terautentikasi.

Root `/` mengarahkan pengguna ke `/workspace`. Frontend tidak memanggil GENESIS secara langsung,
tidak menyimpan secret, dan tidak membuat authority baru.

## Status implementasi

Navigasi mengikuti active workspace dari Backend. Workspace bisnis dan Shared Work memakai
API canonical, termasuk approval, dokumen berversi dan worker. Desain final pengguna dipertahankan.
Source yang belum tersedia, error dan nilai yang belum diketahui ditampilkan secara eksplisit.
Implementasi internal yang terhubung tidak membuktikan connector eksternal atau kesiapan produksi.
Lihat [cakupan bisnis authoritative](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/canonical-business-coverage.md)
dan [bukti UAT development](https://github.com/PT-Andara-Rejo-Makmur/alos-infra/blob/development/docs/BUSINESS_UAT_2026-10-04.md).

## Contract boundary

`src/lib/contracts/` adalah facade contract frontend. Sumber contract canonical berasal dari
`alos-contracts`; frontend tidak menggandakan schema atau menetapkan authority sendiri.

## Business analytics

Grafik analytics memakai Recharts karena library ini menyediakan chart React responsif dengan
dukungan aksesibilitas yang sesuai stack Web saat ini. Komponen hanya memvisualisasikan projection
analytics Backend; nilai bisnis tidak dihitung ulang dari daftar record di browser.

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm security
```

Mulai dari [indeks dokumentasi](docs/README.md), [instalasi](docs/INSTALLATION.md),
[menjalankan Web](docs/RUNNING.md), dan [integrasi API](docs/API_INTEGRATION.md).
Browser E2E hanya dijalankan pada stack disposable dengan opt-in; lihat [pengembangan](docs/DEVELOPMENT.md).
