# ALOS Web

ALOS Web adalah frontend clean baseline untuk ALOS. Browser berinteraksi dengan Web melalui
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
- UI final Stage 3 untuk Executive, Sales, Property, Finance, Legal, HR & GA, dan IT;
- Shared Work universal dan ARA universal dalam keadaan source-honest;
- `/api/backend/*` sebagai API/BFF boundary untuk request yang sudah terautentikasi.

Root `/` mengarahkan pengguna ke `/workspace`. Frontend tidak memanggil GENESIS secara langsung,
tidak menyimpan secret, dan tidak membuat authority baru.

## Status UI Stage 3

Tree dashboard lama telah dihapus pada fase UI Reset. Penggantinya sekarang tersedia melalui
AppShell dan navigation canonical berdasarkan active workspace projection. UI tidak membuat data
bisnis, jawaban ARA, atau status keberhasilan ketika source atau mutation Backend belum tersedia.
Canonical contracts dan integrasi domain Backend lanjutan tetap menjadi pekerjaan Stage 4.

## Contract boundary

`src/lib/contracts/` adalah facade contract frontend. Sumber contract canonical berasal dari
`alos-contracts`; frontend tidak menggandakan schema atau menetapkan authority sendiri.

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Dokumentasi baseline: [Architecture](ARCHITECTURE.md), [API integration](docs/API_INTEGRATION.md),
[Canonical identity access](docs/CANONICAL_IDENTITY_ACCESS.md), [Development](docs/DEVELOPMENT.md),
[Installation](docs/INSTALLATION.md), dan [Running](docs/RUNNING.md).
