# Menjalankan Aplikasi

Jalankan development server:

```bash
pnpm dev
```

Buka `http://localhost:3000`. Runtime frontend saat ini:

```text
/          -> /workspace
/login     -> login
/workspace -> temporary clean landing
```

Pada landing terautentikasi, teks yang ditampilkan adalah:

> Antarmuka ALOS sedang dibangun ulang.

`/workspace` memeriksa session melalui `/api/session`. Jika session tidak tersedia, pengguna dapat
masuk kembali melalui `/login`; jika request gagal, halaman menyediakan retry. Tidak ada klaim
bahwa seluruh route lama tetap render.

Untuk mode production:

```bash
pnpm build
pnpm start
```
