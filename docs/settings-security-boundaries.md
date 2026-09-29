# Pengaturan Global — Security Boundaries

Settings adalah self-service untuk principal yang sedang terautentikasi. Route `/settings` tidak memvalidasi domain Executive, Sales, Property, Finance, Legal, HR/GA, atau IT. Tidak ada fallback berdasarkan URL, role string, nama workspace, localStorage, atau workspace key.

## Boundary yang diizinkan

- membaca projection identitas dari session BFF;
- melihat Email sebagai read-only;
- melihat workspace aktif dan membership yang diberikan oleh session;
- mengakhiri sesi browser saat ini melalui flow `DELETE /api/session` yang sama dengan AppShell;
- menampilkan readiness untuk data yang belum mempunyai source resmi.

## Boundary yang tidak diizinkan

Settings tidak boleh:

- mengubah role, permission, workspace membership, atau workspace utama;
- menambah, menghapus, atau mengedit akses workspace;
- mengelola akun teknis orang lain;
- mengubah Employee ID, Jabatan, Divisi, atau Status Kepegawaian;
- menampilkan salary, bank, tax, government ID, atau data HR sensitif tanpa source/authority;
- menampilkan password, hash, reset token, activation token, session token, cookie secret, atau credential;
- menganggap `actor.display_name` sebagai nama karyawan HR;
- menyimpan perubahan profil/notifikasi/preferensi ke localStorage sebagai persistence canonical.

IT tetap menjadi administrative authority untuk Akun Karyawan, membership, access, suspension, dan session administration orang lain. Settings tidak mengimpor feature atau mutation IT. HR / GA tetap memiliki employee identity dan employment state.

## Source dan error states

State yang digunakan harus saling eksklusif: `loading`, `unavailable`, `connected-empty`, `connected-data`, dan `error`. Mapping user-facing:

- 401: `Sesi Anda sudah berakhir.`
- 403: `Anda tidak memiliki kewenangan.`
- 409: `Data telah berubah.`
- 422: `Data tidak valid.`
- 500: `Perubahan belum dapat disimpan.`

Remote session registry, password change/reset, notification preference, dan UI preference belum memiliki source/contract sehingga action dinonaktifkan dan tidak boleh menampilkan fake success.

## Governance yang ditunda

- **NEEDS CONTRACT / NEEDS BACKEND**: self-service profile update, credential operations, remote session revoke, notification preference persistence, and UI preference persistence.
- **NEEDS DECISION**: mandatory security/compliance notification policy, supported auth methods, session metadata retention, and exact classification policy.
