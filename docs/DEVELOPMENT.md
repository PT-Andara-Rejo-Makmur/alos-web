# Pengembangan

Route melakukan composition; logic reusable berada pada feature atau library. Experience hanya
mengubah audience, information hierarchy, dan projection—bukan authority.

Quality gate lokal:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Test harus mencakup state belum dikonfigurasi, error Backend, contract projection, dan command
flow. Mock diperbolehkan sebagai test double, tetapi tidak sebagai runtime source of truth.
