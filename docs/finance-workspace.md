# Finance & Pajak Workspace

Status: **UI FINAL / SOURCE UNAVAILABLE — INTEGRATION PENDING**.

Finance hanya valid ketika `resolveWorkspaceDomain(session, requestedWorkspaceKey)` menghasilkan domain `FINANCE`. Workspace object dari session adalah authority; `workspace_key` hanya identitas URL.

Route canonical:

- `/workspace/[workspaceKey]/summary`
- `/workspace/[workspaceKey]/liquidity`
- `/workspace/[workspaceKey]/receivables`
- `/workspace/[workspaceKey]/payables`
- `/workspace/[workspaceKey]/budget`
- `/workspace/[workspaceKey]/reconciliation`
- `/workspace/[workspaceKey]/tax`
- `/workspace/[workspaceKey]/performance`
- Shared Work: `/projects`, `/tasks`, `/approvals`, `/documents`, `/reports`, `/findings`
- ARA: `/ara`

Seluruh modul Finance memakai `FinanceLayout` dan satu `AppShell`. Ketika sumber finansial belum tersedia, UI menampilkan `Belum Terhubung`, `Belum ada data`, `Belum Dinilai`, `—`, atau pesan error yang sesuai. Tidak ada saldo, transaksi, pajak, pembayaran, rekonsiliasi, chart, atau keberhasilan simpan yang dibuat oleh frontend.

## Batas kewenangan

Finance menampilkan kas, penerimaan, piutang, pengeluaran, utang, pembayaran, settlement, rekonsiliasi, anggaran finansial, pajak, dan bukti finansial setelah sumber resmi tersedia. Sales, Property, Legal, Strategy, dan Shared Work tetap menjadi sumber masing-masing.

## Deferred until dashboard phase complete

- Contracts required
- Backend services/projections required
- Cross-domain authority and classification enforcement
- GENESIS extraction integration
