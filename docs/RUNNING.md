# Menjalankan Aplikasi

Jalankan development server:

```bash
pnpm dev
```

Buka `http://localhost:3000`. Backend harus berjalan agar login dan data bisnis tersedia.
Tetapkan `ALOS_BACKEND_INTERNAL_URL` pada environment server Web sesuai `.env.example`.
Untuk Compose lengkap, ikuti
[local development Infra](https://github.com/PT-Andara-Rejo-Makmur/alos-infra/blob/development/docs/LOCAL_DEVELOPMENT.md).
Runtime frontend:

```text
/          -> /workspace
/login     -> login
/workspace -> pilihan/active workspace dari session Backend
/workspace/[workspaceKey]/... -> dashboard divisi, Shared Work, ARA dan administrasi
```

`/workspace` memeriksa session melalui `/api/session`. Actor dengan beberapa workspace memilih
workspace secara eksplisit. Jika session tidak tersedia, pengguna masuk melalui `/login`;
error Backend menyediakan retry. URL tidak memberikan permission atau mengganti workspace aktif.

Untuk mode production:

```bash
pnpm build
pnpm start
```

Mode tersebut menjalankan build production secara lokal, bukan deployment production.
`NEXT_PUBLIC_*` dibundel saat build; perubahan public Backend URL memerlukan rebuild.
Kredensial GENESIS/provider tetap berada di server masing-masing dan tidak masuk ke Web.
