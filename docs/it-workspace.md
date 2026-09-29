# IT Workspace

Status: UI FINAL / SOURCE UNAVAILABLE untuk data operasional yang belum disediakan.

Authority IT hanya berasal dari `resolveWorkspaceDomain(session, requestedWorkspaceKey)` dengan domain `IT` dan workspace aktif yang sama. URL, nama workspace, role string, dan local storage bukan authority. `/accounts` adalah surface canonical “Akun Karyawan”; tidak ada route admin IT kedua.

Route canonical: `/workspace/[workspaceKey]/summary`, `/services`, `/systems`, `/infrastructure`, `/alos-genesis`, `/integrations`, `/accounts`, `/access`, `/security`, `/changes`, `/assets`, `/support`, `/performance`, serta Shared Work dan ARA universal. Semua menu memakai workspace key aktif yang sudah divalidasi.

Sidebar final terdiri dari: Pusat IT; Platform & Sistem; Akses & Identitas; Perubahan; Operasional; Kinerja; Pekerjaan; ARA. Shared Work tetap memiliki Project, Task, Approval, Document, Report, dan Finding yang universal.

Penyediaan akun mengikuti readiness flow: karyawan dari HR → telaah identitas → ruang kerja → role canonical → review → penyediaan Backend → aktivasi → karyawan mengatur kata sandi sendiri. Sumber karyawan dan kontrak alur aktivasi belum tersedia, sehingga form tidak meminta kata sandi dan tombol penyimpanan dinonaktifkan.

Ringkasan identitas menampilkan Akun Menunggu Pendaftaran, Aktivasi Menunggu, Permintaan Akses, Akses Perlu Review, dan Leaver Menunggu Revokasi sebagai `—`/`Belum Terhubung` sampai sumbernya tersedia. Nama akun tidak diperlakukan sebagai nama karyawan; employee fields berasal dari HR.

Detail Akun Karyawan memiliki empat tab: Ringkasan, Workspace & Akses, Sesi, dan Riwayat. Role ditampilkan di dalam konteks setiap workspace; riwayat akses dan aktivitas administratif tetap berada pada tab Riwayat. Status Akun tidak sama dengan Status Aktivasi. Suspend dan pencabutan akses hanya readiness dengan User/Account, Reason, Effective At, dan Evidence; tidak ada direct mutation tanpa governance.

Access Request, Joiner, Mover, Leaver, dan antrian revokasi memakai source-aware presentation. `Approved` tidak sama dengan `Provisioned`, dan akses tambahan tidak diberikan otomatis. Sesi hanya menampilkan metadata yang diizinkan; token, cookie secret, dan kredensial tidak pernah ditampilkan.

IT tidak memiliki authority atas employee master, role bisnis, payroll, legal validity, project root, atau data ARA. Token, refresh token, cookie, password, dan secret tidak pernah ditampilkan.

## Akun Karyawan dan Akses & Identitas — final alignment

Tindakan utama pada Akun Karyawan adalah **Daftarkan Akun**. Form readiness memiliki empat bagian: Karyawan, Identitas Akun, Workspace & Role, dan Review. Karyawan, Nama, ID Karyawan, Jabatan, dan Divisi hanya berasal dari HR; ketika sumber belum terhubung, selector dan field tersebut tidak dapat diisi. `display_name` Identity tetap ditampilkan sebagai Nama Akun, bukan sebagai nama karyawan.

Role target MVP-2 adalah Direktur, Manajer / Kepala Divisi, Anggota Divisi, dan Administrator IT. Contract saat ini belum menyediakan seluruh vocabulary tersebut, sehingga pilihan yang belum didukung dinonaktifkan. Role legacy dibaca tanpa pemetaan diam-diam. Role selalu berada dalam konteks workspace dan IT_ADMIN tidak menjadi superuser bisnis.

Daftar akun memisahkan Nama, ID Karyawan, Jabatan, Workspace Utama, Role Utama, Email, Status Akun, Status Aktivasi, Login Terakhir, dan Aksi. Primary workspace tidak ditebak dari membership pertama/aktif. Field Nama, ID Karyawan, Jabatan, dan Divisi tetap `—` sampai linkage HR tersedia; Nama Akun adalah identity display name yang terpisah.

Workspace tambahan dikelola setelah akun tersedia melalui Tambah Workspace, Edit Akses, dan Cabut Akses. Semua readiness action tetap disabled sampai sumber resmi mendukung effective dates, duplicate conflict, permission, dan audit. Revoke bukan hard delete dan tidak membuat ulang akun.

Pengaturan global tetap memiliki boundary sendiri: Profil, Ganti Kata Sandi, Sesi milik sendiri, Notifikasi, dan Preferensi. IT hanya menyediakan readiness untuk pendaftaran, activation support, reset request, suspension, revocation, dan session administration; IT tidak melihat password atau token.

Vocabulary audit yang diharapkan dari sumber audit identitas:

- Account Created
- Account Edited
- Activation Resent
- Account Activated
- Workspace Added
- Workspace Role Changed
- Workspace Access Edited
- Workspace Revoked
- Account Suspended
- Account Reactivated
- Password Reset Requested
- Session Revoked

Frontend hanya menyiapkan kolom Waktu, Aktivitas, Objek, Workspace, Pelaksana, Hasil, dan Sumber. Frontend tidak membuat kebenaran audit dan tidak mengisi baris sebelum sumber audit tersedia.
