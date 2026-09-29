# IT Workspace

Status: UI FINAL / SOURCE UNAVAILABLE untuk data operasional yang belum disediakan.

Authority IT hanya berasal dari `resolveWorkspaceDomain(session, requestedWorkspaceKey)` dengan domain `IT` dan workspace aktif yang sama. URL, nama workspace, role string, dan local storage bukan authority. `/accounts` adalah surface canonical “Akun Karyawan”; tidak ada route admin IT kedua.

Route canonical: `/workspace/[workspaceKey]/summary`, `/services`, `/systems`, `/infrastructure`, `/alos-genesis`, `/integrations`, `/accounts`, `/access`, `/security`, `/changes`, `/assets`, `/support`, `/performance`, serta Shared Work dan ARA universal. Semua menu memakai workspace key aktif yang sudah divalidasi.

Sidebar final terdiri dari: Pusat IT; Platform & Sistem; Akses & Identitas; Perubahan; Operasional; Kinerja; Pekerjaan; ARA. Shared Work tetap memiliki Project, Task, Approval, Document, Report, dan Finding yang universal.

Penyediaan akun membaca kandidat karyawan dari Backend, lalu mengirim employee ID, email akun, workspace, satu role, tanggal berlaku, expiration opsional, dan catatan opsional. Backend membuat akun dan challenge aktivasi secara atomik. Karyawan memilih kata sandinya saat aktivasi; Web tidak mengklaim pesan aktivasi telah dikirim.

Ringkasan identitas menampilkan Akun Menunggu Pendaftaran, Aktivasi Menunggu, Permintaan Akses, Akses Perlu Review, dan Leaver Menunggu Revokasi sebagai `—`/`Belum Terhubung` sampai sumbernya tersedia. Nama akun tidak diperlakukan sebagai nama karyawan; employee fields berasal dari HR.

Detail Akun Karyawan memiliki empat tab: Ringkasan, Workspace & Akses, Sesi, dan Riwayat. Role ditampilkan di dalam konteks setiap workspace; riwayat akses dan aktivitas administratif berasal dari audit Backend. Status akun tidak sama dengan status aktivasi. Suspend, reactivate, membership changes, dan session revocation menggunakan route Backend yang berwenang.

Access Request, Joiner, Mover, Leaver, dan antrian revokasi memakai source-aware presentation. `Approved` tidak sama dengan `Provisioned`, dan akses tambahan tidak diberikan otomatis. Sesi hanya menampilkan metadata yang diizinkan; token, cookie secret, dan kredensial tidak pernah ditampilkan.

IT tidak memiliki authority atas employee master, role bisnis, payroll, legal validity, project root, atau data ARA. Token, refresh token, cookie, password, dan secret tidak pernah ditampilkan.

## Akun Karyawan dan Akses & Identitas

Tindakan utama pada Akun Karyawan adalah **Daftarkan Akun**. Form memuat Karyawan, Identitas Akun, Workspace & Role, Tanggal Aktif, Tanggal Berakhir, dan Catatan. Karyawan, Nama, ID Karyawan, Jabatan, dan Divisi hanya berasal dari HR; Backend memfilter kandidat sebelum mengirimkannya ke Web.

Role aktif adalah `EXECUTIVE` (Direktur), `DIVISION_LEAD` (Manajer / Kepala Divisi), `DIVISION_MEMBER` (Anggota Divisi), dan `IT_ADMIN` (Administrator IT). Role selalu berada dalam konteks workspace dan IT_ADMIN bukan superuser bisnis.

Daftar akun memisahkan Nama, ID Karyawan, Jabatan, Workspace Utama, Role Utama, Email, Status Akun, Status Aktivasi, Login Terakhir, dan Aksi. Workspace utama berasal dari referensi Backend dan tidak ditebak dari membership pertama atau workspace aktif.

Workspace tambahan dikelola setelah akun tersedia melalui Tambah Workspace, Edit Akses, dan Cabut Akses. Role, masa berlaku, konflik duplikasi, dan audit ditentukan serta disimpan Backend. Revoke bukan hard delete dan tidak membuat ulang akun.

Settings dan AI Workspace tetap berada di luar halaman Identity. IT tidak melihat password atau token.

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
