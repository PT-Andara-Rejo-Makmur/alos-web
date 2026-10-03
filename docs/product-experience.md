# Pengalaman Produk ALOS

Redesign antarmuka ALOS untuk PT Andara Rejo Makmur pada branch `development`. Prioritas halaman kerja adalah kondisi pekerjaan, tindakan berikutnya, penanggung jawab, status, serta bukti yang dapat diakses.

## Dasar implementasi

Sumber yang diperiksa sebelum implementasi:

| Repository | HEAD dasar |
| --- | --- |
| alos-web | `1a383ce469146350ffb0e81a90863d2f2ecb95b4` |
| alos-backend | `20a5eb1db19157525350764a5ea375aa5cee3d5f` |
| alos-contracts | `6e9e3e78afd95bcc4e4d6bb3bbf25618153d925a` |
| genesis-ai | `ff11f49ac6659d6054e1a0ac1c67bb12cf2ee0dc` |
| alos-infra | `06eb4adcec8d1e7a6be6d21f1142ec94e45af130` |

Audit mencakup proyeksi Business Summary dan Executive Business Performance, Work Queue, proses lintas-divisi, hubungan bisnis dan proyek, dokumen dan ingestion, pengukuran target, kewenangan ARA, peristiwa kemajuan, proposal tugas yang diperiksa manusia, kebutuhan tenaga kerja, dan permintaan kemampuan. Kode dan kontrak aktual menjadi acuan ketika dokumentasi lama berbeda.

`git fetch origin development` dilakukan kembali sebelum penyelesaian; HEAD lokal dan remote masih sama sebelum commit redesign. Backend, Contracts, GENESIS, dan Infra tetap bersih. Tidak ada perubahan dependency, framework UI, kontrak, atau alur keputusan pada repository tersebut.

Perbandingan AST resource enam divisi mengonfirmasi metadata operasi tetap sama setelah perubahan label tampilan. Pilihan hubungan tetap bersumber dari API resmi, dan payload menyimpan identitas kanonis. Kewenangan tindakan, snapshot, versi, pemisahan tugas pemeriksa, dan validasi ulang tetap mengikuti Backend.

## Sistem desain dan komponen

Warna forest green, warm neutral, charcoal, batas abu-abu lembut, dan aksen emas terbatas menggunakan token CSS bersama. Tipografi, kepadatan, radius, fokus keyboard, warna status, serta perilaku reduced motion konsisten. Foto perusahaan digunakan pada portal publik, login, dan pemilih ruang kerja.

Komponen tambahan:

| Komponen | Fungsi |
| --- | --- |
| `FormSection` | Kelompok isian berdasarkan kebutuhan bisnis |
| `EntitySelect` | Pencarian label manusia dengan nilai identitas resmi |
| `Stepper` dan `FormJourney` | Validasi langkah, mempertahankan isian, kembali, dan tinjau sebelum simpan |
| `RecordFormFields` dan `BusinessRecordForm` | Formulir resource dengan kelompok dan perjalanan bisnis |
| `RoleWorkSummary` | Ringkasan pekerjaan sesuai konteks kepala divisi atau anggota |
| `BusinessRecordContext` | Pihak terkait, asal catatan, dan tindak lanjut melalui pembacaan yang diizinkan |
| `ProcessInbox`, `ProcessTimeline`, dan presentasi proses | Antrean tindakan, detail, dan riwayat yang mudah dibaca |
| `AraAnswer` dan `AraProgress` | Jawaban terstruktur dan kemajuan dari peristiwa aktual |
| `TechnologyControl` | Status layanan dan catatan sistem, kemampuan, serta rilis untuk IT |
| `presentation` dan `business-projection` | Label status, format angka presisi, dan pemeriksaan bentuk proyeksi |

Tabel menyediakan label per kolom pada baris mobile. Dialog dan drawer panjang menggunakan tinggi viewport dan area tindakan yang mudah dijangkau. Wizard menjadi vertikal pada mobile; langkah tersembunyi tidak menghalangi validasi langkah aktif. Angka uang berbentuk string tetap mempertahankan presisi di atas batas integer JavaScript.

## Portal, login, dan ruang kerja

`/` menjadi portal perusahaan dengan identitas ALOS, cara kerja, enam area perusahaan, pengantar ARA, dan CTA masuk. Aset hunian dan logo yang sudah tersedia digunakan kembali.

Login mempertahankan arah visual perusahaan, menyederhanakan bahasa, dan menghapus penjelasan implementasi sesi dari halaman bisnis. Pesan aktivasi yang aman tetap dipertahankan. Kegagalan kredensial berbeda dari sesi yang berakhir ketika melakukan pekerjaan.

`/workspace` menggunakan ruang kerja aktif yang benar-benar diberikan oleh sesi. Satu pilihan yang valid menuju ringkasan langsung; beberapa pilihan membuka chooser dengan nama dan peran manusia. Pilihan kosong atau metadata domain yang tidak dikenali berhenti dengan penjelasan akses. Pemilihan dan pergantian ruang kerja tetap memakai endpoint Backend.

Sidebar, topbar, breadcrumb, switcher, profil, dan navigasi mobile menggunakan satu shell. Menu domain dan deep link tetap tersedia. Perlu Tindakan mendapat prioritas visual; tidak ada angka notifikasi atau tindakan tertunda yang dibuat oleh browser.

## Halaman dan rute yang diperbarui

Pola rute tetap `/workspace/{workspaceKey}/...`. Resolver tetap menentukan domain dari sesi resmi.

| Area | Rute utama |
| --- | --- |
| Portal dan identitas | `/`, `/login`, `/workspace` |
| Executive | `summary`, `brief`, `planning`, `performance`, `divisions`, `divisions/{divisionKey}` |
| Pekerjaan bersama | `projects`, `projects/{projectId}`, `tasks`, `approvals`, `documents`, `reports`, `findings` dan detailnya |
| Proses | `processes`, `processes/{processId}` |
| Sales | `summary`, `pipeline`, `leads`, `activities`, `bookings`, `kpr` dan detail terkait |
| Property | `summary`, `portfolio`, `progress`, `execution`, `units`, `quality` dan detail terkait |
| Finance | `summary`, `payables`, `reconciliation`, serta formulir dan catatan keuangan bersama |
| Legal | `summary`, `contracts`, `reviews`, `obligations`, `permits`, `assets`, `cases`, `risks` |
| HR & GA | `summary`, `organization`, `recruitment`, `onboarding`, `employees`, `attendance`, `compliance`, `offboarding`, `ga` |
| IT | `summary`, `alos-genesis`, halaman modul, rilis, aset, dan pengelolaan akun |
| ARA | `ara` dan bagian Minta Kemampuan Baru |

Sebagian perubahan rute tersebut diwarisi dari komponen bersama; tidak dibuat pohon rute duplikat untuk instrumen kerja setiap divisi.

## Executive dan strategi

Ringkasan Executive memprioritaskan keputusan, perhatian, pemberitahuan, indikator utama, kondisi enam divisi, proyek, dan target perusahaan. Pekerjaan operasional pendukung tersedia di bagian yang dapat dibuka. Informasi koneksi sumber menjadi konteks tambahan.

Brief menampilkan pengajuan keputusan utama, perhatian, kinerja, target perusahaan yang tersedia, proyek, dan risiko dari sumber resmi. Tidak dibuat agenda, tenggat, jumlah temuan, atau penanggung jawab yang tidak diberikan sumber.

Detail divisi menggunakan Business Performance dan hanya menampilkan target dengan scope divisi yang cocok secara eksplisit. Kondisi memuat, sumber gagal, dan daftar target kosong berbeda. Nama target atau label divisi tidak dipakai untuk menebak kepemilikan data.

Formulir perencanaan dipecah menjadi editor rencana, target, sasaran, asumsi, cascade, dan ekstraksi dokumen. Renstra/RKAP dan target memakai perjalanan bertahap dengan penanggung jawab dari konteks resmi. Target tetap menyimpan metadata dan observasi TARGET melalui operasi terpisah. Kegagalan penyimpanan observasi mempertahankan identitas target agar percobaan ulang tidak membuat target duplikat. Observasi manual tetap menunggu pemeriksaan. Binding aktual Closing Sales mempertahankan operasi yang sudah ada dengan bahasa sumber yang mudah dibaca.

## Enam divisi

| Divisi | Perubahan pengalaman |
| --- | --- |
| Sales & Marketing | Indikator Business Summary, pekerjaan sesuai peran, pipeline empat kolom dari daftar yang sama, formulir Booking, dan perjalanan KPR/SP3K/Akad berdasarkan catatan aktual |
| Property & Teknik | Proyek dan indikator resmi, formulir Perubahan Pekerjaan dan Sertifikat Pembayaran, hubungan pekerjaan, dokumen, serta akses pengajuan pemeriksaan |
| Finance & Pajak | Piutang/utang dan indikator resmi, formulir utang dan pembayaran bertahap, asal catatan dan hubungan bisnis; kas yang belum diukur tetap Belum tersedia |
| Legal | Label bisnis, pihak terkait yang dapat dicari, kelompok formulir perjanjian, hubungan dokumen dan pemeriksaan; kemampuan yang belum didukung ditempatkan setelah catatan kerja |
| HR & GA | Kebutuhan tenaga kerja, pelamar, onboarding, kontrak kerja, dan tindak lanjut karyawan menggunakan isian bisnis dan proses resmi; keputusan penerimaan tetap eksplisit oleh manusia |
| IT | Ringkasan kerja, kontrol ALOS & GENESIS, keterhubungan layanan/model yang benar-benar diberikan proyeksi, catatan sistem, kemampuan, dan formulir rilis |

Pipeline menunjukkan jumlah pada halaman yang sedang dibaca, bukan jumlah global yang belum diberikan API. Hubungan lintas-divisi memberi asal dan tindak lanjut tanpa memberikan hak baca tambahan. Pembacaan rincian pihak terkait dibatasi dan tetap gagal tertutup bila tidak diizinkan.

## Pekerjaan, proses, dan dokumen

Proyek menyediakan pencarian, status, penanggung jawab, prioritas, tenggat, kemajuan, dan risiko dari proyeksi resmi. Formulir proyek mencakup identitas, tanggung jawab, rencana, dan tinjau. Detail menjadi hub tugas, milestone, catatan bisnis, dokumen, proses/keputusan, temuan, laporan, dan aktivitas. Milestone memakai proyeksi proyek yang diizinkan.

Tugas memiliki filter pekerjaan saya, semua, terlambat, diblokir, perlu pemeriksaan, dan selesai. Persetujuan, laporan, dan temuan mempertahankan lifecycle dan tindakan khusus yang diizinkan. Pilihan pihak yang ditugaskan berasal dari anggota yang dapat ditugaskan; tidak digunakan sebagai pemilihan pemeriksa bisnis.

Perlu Tindakan menyatukan pengajuan, tugas, persetujuan, temuan, dan pemberitahuan resmi. Filter mencakup pemeriksaan, keputusan, perbaikan, untuk diketahui, dan terlambat. Detail menjelaskan fakta, alasan keterlibatan, penanggung jawab, tenggat, alur, dan riwayat. Packet memakai daftar fakta yang diizinkan untuk ditampilkan. Identitas proses, kebijakan, dan digest tetap berada dalam payload, bukan permukaan bisnis.

Minta Arahan Direktur menjadi tindakan sekunder dengan alasan yang wajib diisi. Penolakan Backend mempertahankan dialog dan isian. Pengiriman hasil pemeriksaan memakai tindakan kanonis serta snapshot yang diterima, tanpa membuat rute keputusan sendiri.

Tambah Dokumen menggunakan File, Informasi, Akses, dan Tinjau. Drag & drop dan pemilih file hanya menerima TXT/DOCX hingga 10 MB, sesuai ingestion aktual. Upload mengirim berkas asli, identitas dokumen, dan versi melalui batas API yang sudah ada. Metadata sebelum berkas tetap didukung. Percobaan ulang upload mempertahankan dokumen yang telah dibuat.

Status ingestion berasal dari Backend; polling berhenti pada status selesai/gagal/dibatalkan atau saat komponen dilepas. Detail memperbarui versi yang tersedia setelah ingestion selesai. Riwayat versi tetap immutable, tindakan pemeriksaan tetap mengikuti kewenangan dan pemisahan tugas.

## ARA dan permintaan kemampuan

Desktop memakai riwayat percakapan, percakapan utama, dan konteks; mobile menjadi satu kolom. Header bisnis tidak menampilkan identitas run, correlation, batas klasifikasi, atau konfigurasi model. Jawaban menyediakan kesimpulan, temuan, saran, sumber, dan batas informasi bila tersedia. Sumber dikelompokkan dari lineage resmi tanpa tautan buatan model atau hash pada tampilan utama.

Kemajuan ARA berasal dari peristiwa aktual. Peristiwa masa depan tidak ditandai selesai; polling berhenti pada hasil terminal atau pergantian konteks. Proposal tugas tetap `NEEDS_REVIEW` dan `executed=false` sampai pengguna memeriksa serta Backend memvalidasi kembali operasi. Tinjau mengharuskan judul dan alasan pemeriksaan.

Minta Kemampuan Baru menggunakan kebutuhan, tujuan, dan konteks tambahan. Analisis, pemeriksaan teknis, dan proses perusahaan mempertahankan governance yang ada. Hasil REUSE hanya disebut siap digunakan ketika registry dan release sama-sama aktif. Draf bantuan tidak dipresentasikan sebagai kemampuan yang telah dirilis.

## Cakupan pengujian perjalanan

Browser menggunakan respons API fixture yang mengikuti kontrak, termasuk ketika menguji hasil production build. Pengujian komponen memeriksa payload, penolakan, dan batas kewenangan. Cakupan ini bukan transaksi langsung dengan Backend, provider AI, atau data perusahaan nyata.

| Perjalanan | Bukti yang diperiksa |
| --- | --- |
| Portal menuju login | Klik CTA pada hasil production build |
| Login dengan satu ruang kerja | Form login menuju summary langsung |
| Login dengan beberapa ruang kerja | Form login menuju chooser |
| Pergantian ruang kerja | Switcher mengirim pilihan Backend dan menuju summary yang sesuai |
| Membuka Perlu Tindakan | Browser enam ukuran dan filter komponen |
| Pemeriksaan proses | Payload COMPLETE, alasan, snapshot, dan hasil Backend |
| Mengembalikan proses | Payload RETURN dan snapshot yang sama |
| Minta Arahan Direktur | Alasan, endpoint, penolakan 403, dan isian tetap tersedia |
| Detail proyek | Browser enam ukuran, tab hub, milestone resmi |
| Membuat proyek | Wizard, tinjau, fokus, dan payload create khusus |
| Membuat tugas | Pilihan hubungan dan payload metadata resmi |
| Upload dokumen | Format, ukuran, berkas asli, identitas/versi, ingestion dan penghentian polling |
| Pemeriksaan dokumen | Permission khusus, versi immutable, dan pemisahan tugas |
| Sales Booking | Formulir pada enam ukuran dan pengajuan pemeriksaan BOOKING |
| KPR dan Akad | Formulir dan konteks pembayaran/bank/dokumen yang tersedia |
| Perubahan pekerjaan | Formulir enam ukuran dan pengajuan CHANGE_ORDER |
| Sertifikat pembayaran | Formulir enam ukuran dan pengajuan PAYMENT_CERTIFICATE |
| Utang Finance | Formulir enam ukuran, tinjau, dan sumber yang belum tersedia |
| Kontrak Legal | Formulir enam ukuran, pemilihan subjek, dan penggantian konteks |
| Kebutuhan tenaga kerja | Formulir enam ukuran dan pengajuan RECRUITMENT tanpa selector pemeriksa |
| Kandidat | Penerimaan eksplisit, payload hire, dan pembacaan hasil resmi |
| Onboarding | Formulir enam ukuran dan pengajuan ONBOARDING |
| Offboarding | Halaman enam ukuran dan pengajuan OFFBOARDING |
| Kontrak kerja | Pengajuan EMPLOYMENT_CONTRACT dan referensi dokumen resmi |
| Keputusan Executive | Pengajuan keputusan resmi, COMPLETE, dan scope target perusahaan |
| Rencana perusahaan | Validasi langkah, kembali, nilai tetap tersimpan, fokus tinjau, dan kewenangan |
| Target strategi | Metadata terpisah dari observasi TARGET dan pemeriksaan bukti |
| Pertanyaan ARA | Thread, request minimal, history, source lineage, dan pembatalan run |
| Kemajuan ARA | Hanya peristiwa yang diterima, polling berhenti saat selesai |
| Proposal ARA | Tinjau manusia, alasan wajib, revalidasi Backend dan tautan hasil tugas |
| Permintaan kemampuan | Payload kebutuhan/tujuan/konteks dan kesiapan governance |
| Sumber rusak atau tidak tersedia | Pesan kegagalan, tanpa angka nol/hasil kosong buatan |

## Bukti verifikasi

Hasil command, jumlah pemeriksaan, dan batas pengujian dicatat dalam `product-experience-validation.json`. Log lengkap, hasil browser, dan screenshot tersedia pada direktori `.codex/validation` di workspace induk. Command validasi repository tetap menggunakan toolchain yang sudah tersedia.

Browser diperiksa pada 1440, 1280, 1024, 768, 430, dan 390 px. Pemeriksaan meliputi overflow halaman, batas dialog, navigasi mobile, wizard, tabel, riwayat/konteks ARA, dan pemilih ruang kerja. Sampel screenshot Executive desktop, ARA mobile, formulir dokumen, formulir utang, proyek mobile, serta tinjau rencana diperiksa secara visual.

Pengujian aksesibilitas otomatis memakai axe untuk WCAG A/AA pada desktop dan mobile, ditambah pengujian fokus dialog, Escape, tab keyboard, dan fokus langkah wizard. Status memiliki label teks, dan fokus terlihat. Hasil otomatis merupakan bukti dalam cakupan yang diuji, bukan sertifikasi aksesibilitas seluruh produk.

## Batas kemampuan yang dipertahankan

- Pengujian browser memakai fixture, tanpa validasi transaksi langsung Backend atau jawaban provider AI nyata.
- Checklist lintas-divisi hanya dapat menampilkan fakta yang tersedia dalam proyeksi; langkah HR/IT/GA yang belum diberikan Backend tidak dibuat oleh browser.
- Kas authoritative, beberapa pengukuran agregat, probation, tanda tangan digital, integrasi eksternal, dan definisi KPI tertentu tetap ditampilkan sebagai belum tersedia bila sumber belum mendukungnya.
- Rincian tugas, penanggung jawab, dan proyek semua divisi tidak ditebak dari akses ruang kerja Executive; dibatasi pada proyeksi yang benar-benar diizinkan.
- Sumber jawaban ARA menggunakan label domain dan jumlah lineage bila proyeksi tidak memberikan judul sumber manusia. Tidak dibuat judul atau link tambahan.
- Kebutuhan provider, persetujuan penggunaan, dan deployment kemampuan tetap ditentukan governance Backend/GENESIS yang sudah ada.
- Perubahan ini diterbitkan ke branch pengembangan; tidak melakukan deployment produksi.


Hasil command lokal: lint exit 0; typecheck exit 0; Vitest 549 lulus, 0 gagal pada 42 berkas; production build exit 0; git diff --check exit 0. Pemeriksaan browser berjumlah 268 pemeriksaan pada halaman dan dialog, termasuk perjalanan pada hasil production build, dengan 0 kegagalan, 0 overflow, dan 0 kesalahan JavaScript.
