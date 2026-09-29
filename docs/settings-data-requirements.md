# Pengaturan Global — Data Requirements

Status seluruh komponen: **UI FINAL / SOURCE UNAVAILABLE** sampai source dan kontrak resminya tersedia. Settings membaca principal melalui session BFF; frontend tidak membuat source baru, tidak menebak data HR, dan tidak menyimpan preference canonical di browser.

| Component ID | Menu | Purpose | Entity | Source | Owner | Permission | Classification | Verification | Freshness | Destination | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `settings.profile.identity` | Profil | Menampilkan identitas sesi | Actor / Principal | Session BFF | Identity / Backend | Authenticated self | INTERNAL | Session projection | Saat session dimuat | `/settings/profile` | UI tersedia; source terbatas |
| `settings.profile.hr` | Profil | Menampilkan konteks kepegawaian | Employee projection | HR | HR / GA | Source policy | INTERNAL/CONFIDENTIAL sesuai source | HR source | NEEDS BACKEND | `/settings/profile` | Belum Terhubung |
| `settings.security.auth-method` | Keamanan | Menampilkan metode autentikasi | Auth method | Auth source | Identity / Backend | Authenticated self | CONFIDENTIAL | NEEDS CONTRACT | NEEDS BACKEND | `/settings/security` | Belum Terhubung |
| `settings.security.password-change` | Keamanan | Menyiapkan perubahan kata sandi | Credential change | Auth source | Identity / Backend | Canonical capability | RESTRICTED | Backend verification | NEEDS BACKEND | `/settings/security` | Disabled; NEEDS CONTRACT |
| `settings.sessions.current` | Sesi & Perangkat | Menampilkan metadata sesi saat ini | Current session | Session BFF | Identity / Backend | Authenticated self | CONFIDENTIAL | Session boundary | `issued_at` / `expires_at` | `/settings/sessions` | Terbatas pada source saat ini |
| `settings.sessions.registry` | Sesi & Perangkat | Menampilkan dan mencabut sesi lain | Session registry | Backend session service | Identity / Backend | Canonical self-session capability | CONFIDENTIAL | NEEDS CONTRACT | NEEDS BACKEND | `/settings/sessions` | Belum Terhubung |
| `settings.notifications.preferences` | Notifikasi | Menampilkan preference channel | Notification preference | Notification service | Backend / product governance | Authenticated self | INTERNAL | NEEDS CONTRACT | NEEDS BACKEND | `/settings/notifications` | Belum Terhubung |
| `settings.preferences.ui` | Preferensi | Menampilkan bahasa, zona waktu, dan tampilan | User preference | Preference service | Backend / product governance | Authenticated self | INTERNAL | NEEDS CONTRACT | NEEDS BACKEND | `/settings/preferences` | Belum tersedia |

## Aturan source

- `loading` hanya berarti source sedang dimuat.
- `unavailable` berarti source atau layanan belum terhubung dan tampil sebagai `Belum Terhubung`.
- `connected-empty` hanya digunakan jika source berhasil dan benar-benar mengembalikan data kosong.
- `connected-data` berarti data tersedia.
- `error` tampil sebagai `Data belum dapat dimuat`, bukan `Belum Terhubung`.

## Deferred

**NEEDS CONTRACT / NEEDS BACKEND**: profile update, avatar, phone, stored timezone/language, password change/reset, session registry/revoke, notifications, and UI preferences.

**NEEDS DECISION**: mandatory security/compliance notification policy, auth-method projection, retention of remote session metadata, and classification policy for profile data.
