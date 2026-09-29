# IT Workspace

Status: UI FINAL / SOURCE UNAVAILABLE untuk data operasional yang belum disediakan.

Authority IT hanya berasal dari `resolveWorkspaceDomain(session, requestedWorkspaceKey)` dengan domain `IT` dan workspace aktif yang sama. URL, nama workspace, role string, dan local storage bukan authority. `/accounts` adalah surface canonical “Akun Karyawan”; tidak ada route admin IT kedua.

Route canonical: `/workspace/[workspaceKey]/summary`, `/services`, `/systems`, `/infrastructure`, `/alos-genesis`, `/integrations`, `/accounts`, `/access`, `/security`, `/changes`, `/assets`, `/support`, `/performance`, serta Shared Work dan ARA universal. Semua menu memakai workspace key aktif yang sudah divalidasi.

Sidebar final terdiri dari: Pusat IT; Platform & Sistem; Akses & Identitas; Perubahan; Operasional; Kinerja; Pekerjaan; ARA. Shared Work tetap memiliki Project, Task, Approval, Document, Report, dan Finding yang universal.

Penyediaan akun mengikuti readiness flow: karyawan dari HR → telaah identitas → ruang kerja → role canonical → review → penyediaan Backend → aktivasi → karyawan mengatur kata sandi sendiri. Sumber karyawan dan kontrak alur aktivasi belum tersedia, sehingga form tidak meminta kata sandi dan tombol penyimpanan dinonaktifkan.

Ringkasan identitas menampilkan Akun Menunggu Pendaftaran, Aktivasi Menunggu, Permintaan Akses, Akses Perlu Review, dan Leaver Menunggu Revokasi sebagai `—`/`Belum Terhubung` sampai sumbernya tersedia. Nama akun tidak diperlakukan sebagai nama karyawan; employee fields berasal dari HR.

Detail Akun Karyawan memiliki Ringkasan, Workspace & Akses, Role, Sesi, Riwayat Akses, dan Aktivitas Administratif. Status Akun tidak sama dengan Status Aktivasi. Suspend dan pencabutan akses hanya readiness dengan User/Account, Reason, Effective At, dan Evidence; tidak ada direct mutation tanpa governance.

Access Request, Joiner, Mover, Leaver, dan antrian revokasi memakai source-aware presentation. `Approved` tidak sama dengan `Provisioned`, dan akses tambahan tidak diberikan otomatis. Sesi hanya menampilkan metadata yang diizinkan; token, cookie secret, dan kredensial tidak pernah ditampilkan.

IT tidak memiliki authority atas employee master, role bisnis, payroll, legal validity, project root, atau data ARA. Token, refresh token, cookie, password, dan secret tidak pernah ditampilkan.
