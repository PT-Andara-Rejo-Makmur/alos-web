# Property Workspace

Property menggunakan canonical workspace boundary `/workspace/[workspaceKey]`. Workspace object dari Backend/session adalah authority; `workspace_key` hanya identity URL; domain diturunkan melalui `resolveWorkspaceDomain()` dari metadata authoritative.

## Status frontend

| Menu | Route | Status |
| --- | --- | --- |
| Ringkasan | `/summary` | UI FINAL / SOURCE UNAVAILABLE |
| Portofolio Proyek | `/portfolio` | UI FINAL / SOURCE UNAVAILABLE |
| Progres & Jadwal | `/progress` | UI FINAL / SOURCE UNAVAILABLE |
| Pekerjaan & Milestone | `/execution` | UI FINAL / SOURCE UNAVAILABLE |
| Unit & Kesiapan | `/units` | UI FINAL / SOURCE UNAVAILABLE |
| Inspeksi & Kualitas | `/quality` | UI FINAL / SOURCE UNAVAILABLE |
| Kontraktor | `/contractors` | UI FINAL / SOURCE UNAVAILABLE |
| Anggaran & RAB | `/budget` | UI FINAL / SOURCE UNAVAILABLE |
| Material & Pengadaan | `/materials` | UI FINAL / SOURCE UNAVAILABLE |
| Target & Kinerja | `/performance` | UI FINAL / SOURCE UNAVAILABLE |
| Proyek, Tugas, Persetujuan, Dokumen, Laporan, Temuan | Shared Work routes | Universal / SOURCE DEPENDENT |
| Tanya ARA | `/ara` | Universal / INTEGRATION PENDING |

PropertyLayout hanya menerima workspace dengan domain `PROPERTY`, active workspace yang aktif, dan requested key yang sama dengan active key. URL, role frontend, localStorage, dan literal key tidak memberikan authority.

Portfolio mereferensikan canonical Shared Work Project. Tombol `Buka Proyek` menuju `/workspace/{workspaceKey}/projects/{projectId}`; tidak ada entity Project kedua di `src/features/property`.

Cross-domain state Finance, Legal, Sales, Strategy, dan approval ditampilkan sebagai projection read-only. Property frontend tidak memanggil endpoint domain speculative dan tidak mengarang record.

## Deferred until dashboard phase complete

- Property projection dan command contracts.
- Backend services/projections serta freshness/scope metadata.
- Cross-domain authority integration.
- GENESIS extraction integration melalui Backend.
