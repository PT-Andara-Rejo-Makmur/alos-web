# Compatibility layer UI MVP-1

Folder ini mempertahankan UI dan helper MVP-1 dari snapshot
`andara-alos-ai/alos@01416390287114a451a22e16ff14e493df43362f` selama reorganisasi bertahap.

- `components/` berisi UI yang dipertahankan tanpa rewrite besar.
- `lib/` berisi projection dan helper endpoint legacy yang masih diperlukan UI.
- `styles/` berisi stylesheet MVP-1.
- `migration-boundary.tsx` memastikan UI tidak memakai mock ketika Backend belum dikonfigurasi.

Semua request harus mengimpor `@/lib/api`. File di sini tidak boleh membuat base URL GENESIS,
memanggil provider, atau menetapkan state authoritative secara lokal. Type di `lib/` adalah
projection kompatibilitas endpoint MVP-1, bukan pengganti permanen untuk generated type
`alos-contracts`.
