# Struktur Folder

## Tingkat atas

- `src/`: seluruh source aplikasi.
- `public/`: asset statis yang aman dipublikasikan.
- `tests/`: unit, component, dan architecture tests.
- `docs/`: instalasi, operasi, UX, integrasi, serta struktur.
- `.github/`: CI, CODEOWNERS, dan template pull request.

## `src`

- `app/`: Next.js App Router untuk `/`, `/business`, `/ara`, `/genesis`, `/director`, dan
  `/giivepro`, termasuk global layout, style, dan not-found state.
- `experiences/`: boundary Business, ARA, GENESIS, Director, serta GIIVEPRO dan registry metadata
  untuk route composition.
- `features/`: capability UI reusable untuk agents, skills, research, reviews, approvals,
  releases, evidence, dan monitoring. Feature tidak memiliki business authority.
- `components/layout/`: shell, navigation, dan shared page composition.
- `components/feedback/`: disconnected, not-configured, loading, dan error presentation.
- `components/shared/`: primitive presentational yang tidak terikat domain.
- `hooks/`: reusable React hooks untuk state interaction ephemeral.
- `lib/api/`: satu-satunya HTTP request boundary menuju ALOS Backend.
- `lib/contracts/`: facade untuk generated TypeScript package dari `alos-contracts`.
- `lib/auth/`: authentication projection boundary tanpa token storage atau policy decision.
- `lib/correlation/`: pembacaan dan session-scoped troubleshooting correlation ID.
- `lib/streaming/`: pembentukan stream URL Backend-only.
- `types/`: type lokal khusus presentation; bukan salinan contract lintas service.

## `tests`

- Test API memastikan missing configuration aman dan correlation ID dipropagasikan.
- Test component memastikan explicit disconnected state dan Review UX tidak mengklaim approval.
- Architecture test memindai source agar tidak ada direct GENESIS/provider URL atau sensitive
  public environment variable.

## `public`, `docs`, dan `.github`

`public/` hanya berisi mark statis. `docs/` menjelaskan workflow aktual. `.github/workflows/`
menjalankan install frozen, lint, typecheck, test, serta production build pada setiap perubahan.
