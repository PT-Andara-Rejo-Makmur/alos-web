# Pengembangan

Route melakukan composition; logic reusable berada pada feature atau library. Experience hanya
mengubah audience, information hierarchy, dan projection—bukan authority.

Quality gate lokal:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm security
```

Test harus mencakup state belum dikonfigurasi, error Backend, contract projection, dan command
flow. Mock diperbolehkan sebagai test double, tetapi tidak sebagai runtime source of truth.

## Browser E2E

Pasang Chromium dengan `pnpm exec playwright install chromium`, lalu gunakan stack audit
disposable pada Web 13000/Backend 18000:

```powershell
$env:ALOS_E2E_WEB_URL = "http://127.0.0.1:13000"
$env:ALOS_E2E_BACKEND_URL = "http://127.0.0.1:18000"
$env:ALOS_E2E_ALLOW_TEST_REGISTRATION = "1"
pnpm test:e2e
```

Harness membuat identitas dan record sintetis; jangan arahkan ke database aplikasi operasional.
Port 3000/8000 hanya diterima pada CI dengan `CI=true` dan
`ALOS_E2E_DISPOSABLE_STACK=1`. Hasil ada di `playwright-report/` dan `test-results/`,
yang diabaikan Git. Workflow integration Infra menyediakan stack CI tersebut.
Uji dengan model/provider nyata memerlukan konfigurasi dan gate terpisah; E2E TEST tidak
menilai kualitas percakapan model nyata.
