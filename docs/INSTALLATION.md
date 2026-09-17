# Instalasi

## Prasyarat

Gunakan Node.js 22 dan pnpm. ALOS Backend tidak wajib untuk memasang dependency atau menjalankan
quality gate.

## Windows PowerShell

```powershell
corepack enable
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
```

## Linux/macOS

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Environment publik tidak boleh berisi credential. Isi `NEXT_PUBLIC_ALOS_API_BASE_URL` hanya
dengan URL publik ALOS Backend.
