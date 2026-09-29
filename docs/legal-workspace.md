# Legal Workspace

Status: **UI FINAL / SOURCE UNAVAILABLE — INTEGRATION PENDING**.

Legal menggunakan boundary canonical `/workspace/[workspaceKey]/...`. `workspace` dari session adalah authority; `workspace_key` hanya identitas URL. Domain Legal hanya valid apabila `resolveWorkspaceDomain(session, requestedWorkspaceKey)` menghasilkan `valid: true` dan `domain: LEGAL`. URL, nama ruang kerja, role, dan local storage tidak menentukan authority.

Route Legal:

- `/summary`, `/risks`, `/contracts`, `/reviews`, `/permits`, `/assets`, `/cases`, `/obligations`, `/performance`
- detail `/contracts/[contractId]`, `/permits/[permitId]`, `/cases/[caseId]`, `/assets/[legalAssetId]`
- Shared Work tetap universal: `/projects`, `/tasks`, `/approvals`, `/documents`, `/reports`, `/findings`
- ARA tetap universal: `/ara`

Sidebar Legal berisi 16 menu: Ringkasan; Risiko & Kepatuhan; Kontrak & Perjanjian; Review Legal; Perizinan; Legalitas Proyek & Aset; Sengketa & Klaim; Kewajiban & Tenggat; Target & Kinerja; enam menu Shared Work; dan Tanya ARA.

Tanpa sumber resmi, halaman menampilkan status `Belum Terhubung`, `Belum Dinilai`, `Belum ada data`, atau `Data belum dapat dimuat` sesuai keadaan. Tidak ada angka, perkara, kontrak, kepatuhan, atau hasil review yang dibuat di frontend.

Legalitas kontrak, perizinan, aset, perkara, dan kewajiban hanya dapat berubah melalui proses resmi yang akan ditentukan Contracts/Backend dan governance. Form dan ekstraksi saat ini adalah struktur UX dengan penyimpanan dinonaktifkan.
