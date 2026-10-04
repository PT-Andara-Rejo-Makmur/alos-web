# Property Workspace

| Menu aktif | Sumber dan batas |
| --- | --- |
| Ringkasan / Portofolio Proyek | Overview owner dan Shared Work Project existing, bukan Project authority kedua |
| Progres & Jadwal | Construction updates dan milestone dengan input/evidence yang tercatat |
| Pekerjaan & Milestone | Package, Update, Change Order, Certificate dan Handover melalui owner API |
| Unit & Kesiapan | Property Unit; luas/penilaian yang belum ada tetap null, perubahan material mengikuti approval |
| Inspeksi & Kualitas | Inspection, NCR dan Safety Incident; severity tidak diinfer dari teks |
| Target & Kinerja | Strategy projection dan indikator yang tersedia |

Navigation dimiliki `src/features/property/navigation.ts`. Contractor registry,
Material/Procurement dan RAB/BOQ belum memiliki capability canonical lengkap dan
tidak ada pada menu aktif. Route legacy yang tersisa tidak dinyatakan siap.
Ekstraksi AI/technical readiness tidak dibuat dari data sintetis. Relasi sertifikat,
Change Order dan tugas korektif tetap mengikuti owner serta human approval.

Workspace memakai `/workspace/[workspaceKey]/...` dari session Backend. URL hanya
identity navigasi; tenant, organization, workspace, role, permission dan scope
ditentukan Backend. Shared Work, Perlu Tindakan dan ARA menggunakan workspace
yang sama. Desain final dan business feature tidak diubah oleh dokumentasi ini.

CONNECTED berarti sumber/command internal tersedia, bukan seluruh kebutuhan
bisnis atau connector eksternal siap. Empty hanya setelah query scoped berhasil;
unknown tetap null/— dan outage tetap error. Rincian field/lifecycle/authority ada
pada [coverage authoritative](https://github.com/PT-Andara-Rejo-Makmur/alos-backend/blob/development/docs/canonical-business-coverage.md).
Kebutuhan form/data tetap disimpan sebagai requirements, bukan daftar fitur siap.

[Bukti UAT development](https://github.com/PT-Andara-Rejo-Makmur/alos-infra/blob/development/docs/BUSINESS_UAT_2026-10-04.md).
