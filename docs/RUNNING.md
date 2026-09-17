# Menjalankan Aplikasi

Jalankan development server:

```bash
pnpm dev
```

Buka `http://localhost:3000`. Jika Backend belum dikonfigurasi, shell dan seluruh route tetap
render serta menampilkan status `Backend belum dikonfigurasi`.

Untuk mode production:

```bash
pnpm build
pnpm start
```

Default port Next.js adalah 3000. Gunakan environment deployment untuk mengubah port atau base
URL Backend.
