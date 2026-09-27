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

Runtime frontend saat ini hanya mencakup:

- login melalui `/login`;
- pemeriksaan dan pengelolaan session melalui `/api/session/*`;
- `/workspace` sebagai temporary landing setelah pemeriksaan session;
- `/api/backend/*` sebagai API/BFF boundary untuk request yang sudah terautentikasi.

Root `/` mengarahkan pengguna ke `/workspace`. Frontend tidak memanggil GENESIS secara langsung,
tidak menyimpan secret, dan tidak membuat authority baru.

## UI reset

Dashboard Executive, Sales, Property, Finance, Legal, HR, IT, Strategy UI, Shared Work, ARA, dan
GENESIS UI lama telah dihapus sebagai bagian dari UI Reset. UI baru akan dibangun setelah Visual
Design System ditetapkan.

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
