# Berkontribusi

## Alur kerja

1. Buat perubahan pada experience atau feature dengan scope terkecil.
2. Jangan menduplikasi contract lintas repository.
3. Pastikan semua request baru memakai `src/lib/api/`.
4. Tambahkan test deterministic tanpa menganggap mock sebagai source of truth.
5. Jalankan `pnpm lint`, `pnpm typecheck`, `pnpm test`, dan `pnpm build`.

## Aturan arsitektur

- Jangan memanggil GENESIS atau provider dari browser.
- Jangan menyimpan secret, permission policy, approval, atau canonical state di client.
- Jangan menampilkan raw technical payload pada Director experience.
- Jangan menambah state framework, UI framework, atau dependency besar tanpa ADR.
- Gunakan Bahasa Indonesia untuk dokumentasi Markdown dan English untuk identifier kode.

Pull request harus menjelaskan perubahan UX, contract yang dikonsumsi, empty/error state, test,
dan dampak terhadap authority boundary.
