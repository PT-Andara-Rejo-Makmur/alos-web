# Pengaturan Global

Status: **UI FINAL / SOURCE UNAVAILABLE — INTEGRATION PENDING**.

Pengaturan adalah surface global untuk pengguna yang sedang terautentikasi. Pengaturan tidak berada di bawah workspace atau domain bisnis dan tidak menggunakan `resolveWorkspaceDomain()` sebagai authority.

## Route

- `/settings` mengarahkan ke `/settings/profile`.
- `/settings/profile`
- `/settings/security`
- `/settings/sessions`
- `/settings/notifications`
- `/settings/preferences`

Authority utama adalah principal dari session BFF saat ini. Workspace aktif hanya ditampilkan sebagai konteks sesi. Workspace switcher tetap menggunakan alur `selectActiveWorkspace()` yang sama, lalu mempertahankan pathname Pengaturan; pergantian workspace tidak mengubah surface global menjadi route domain.

Settings memakai satu `AppShell` dan global user navigation di bawah navigasi domain. Link Pengaturan tidak ditambahkan ke sidebar Executive, Sales, Property, Finance, Legal, HR/GA, atau IT, sehingga menu domain yang sudah dibekukan tidak berubah. Mobile memakai `AppSidebar` yang sama.

Global navigation saat ini hanya menampilkan **Pengaturan**. AI Workspace belum tersedia dan tidak memakai `/workspace` sebagai placeholder; link AI baru boleh ditambahkan setelah route `/ai` tersedia.

## Menu

- AKUN: Profil, Keamanan, Sesi & Perangkat
- PREFERENSI: Notifikasi, Preferensi

## Profil

Session saat ini dapat menampilkan Nama Tampilan, Email, Status Akun, Workspace Aktif, dan workspace yang tersedia pada principal. Nama Tampilan bukan nama karyawan authoritative HR. Employee ID, Jabatan, Divisi, Status Kepegawaian, Foto Profil, Nomor Telepon, Zona Waktu tersimpan, dan Bahasa tersimpan tetap `Belum Terhubung` atau `Belum tersedia` sampai source resminya tersedia.

Email login bersifat read-only. Profil tidak melakukan fake persistence, tidak menulis local storage, dan tombol penyimpanan dinonaktifkan dengan pesan `Penyimpanan profil belum tersedia.`. Perubahan data kepegawaian dikelola melalui HR / GA.

## Keamanan, sesi, dan preferensi

Perubahan kata sandi, metode autentikasi, registry sesi jarak jauh, pencabutan sesi jarak jauh, notifikasi, dan preferensi tampilan masih readiness-only. Karena metode autentikasi belum dapat diverifikasi, seluruh field kata sandi dinonaktifkan dan tetap kosong. Sesi saat ini hanya menampilkan metadata yang ada dari session (`issued_at`, `expires_at`, dan status). Logout sesi saat ini memakai boundary `DELETE /api/session` yang sudah digunakan AppShell; kegagalan tidak dianggap logout berhasil dan tidak mengarahkan pengguna keluar.

Password, hash, reset token, activation token, session token, cookie secret, dan kredensial tidak pernah ditampilkan atau disimpan oleh UI. Notification dan preference tidak disimpan ke localStorage sebagai authority.

## Boundary

Settings adalah self-service untuk pengguna sendiri. Settings tidak dapat mengubah role, permission, workspace membership, employee master, status kepegawaian, account orang lain, atau sesi orang lain. Pengelolaan akun teknis orang lain tetap menjadi tanggung jawab IT. Data HR tetap milik HR / GA, sementara data workspace dan akses tetap berasal dari session/Backend.

Status source memakai state yang saling eksklusif: `loading`, `unavailable`, `connected-empty`, `connected-data`, atau `error`. Pesan user-facing memakai Bahasa Indonesia: `Memuat`, `Belum Terhubung`, `Belum ada data`, `Tersedia`, atau `Data belum dapat dimuat`.

## Status integrasi

- **UI FINAL / SOURCE UNAVAILABLE**: struktur halaman, source state, boundary, responsive layout, dan disabled actions.
- **NEEDS CONTRACT / NEEDS BACKEND**: update profile, phone/avatar, stored timezone/language, password change/reset, remote session registry/revoke, notification preferences, dan UI preferences.
- **NEEDS DECISION**: kebijakan notifikasi wajib dan detail metode autentikasi yang dapat digunakan per account.
