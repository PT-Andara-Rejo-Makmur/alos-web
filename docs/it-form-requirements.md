# IT Form Requirements

## Current canonical integration (2026-10-02)

Status aktual: **PARTIAL** untuk seluruh kebutuhan Stage 3; capability internal yang didukung tercatat **CONNECTED** di [canonical coverage matrix](canonical-business-coverage.md). Table dan form historis di bawah tetap menyimpan kebutuhan asli, termasuk field yang belum mempunyai authority. Label historis NEEDS BACKEND / SOURCE UNAVAILABLE tidak menyatakan kondisi runtime terkini.

| Capability | Current status | Owner / source and boundary |
|---|---|---|
| Supported internal records / dedicated forms | CONNECTED | 16 IT operational registry/history resources; account/access administration uses canonical Identity APIs; production releases retain existing governance authority |
| Entire Stage 3 metric/form requirements | PARTIAL | Only accepted canonical fields and Backend-projected actions are active; historical wishlist fields are not invented |
| Production ARA/GENESIS / automatic extraction or reasoning | DEFERRED_TO_AI | Existing readiness only; no provider integration in this work |
| External/live sources and provider execution | DEFERRED_TO_CONNECTOR | UNAVAILABLE in UI until connected; recorded sources remain explicit |
| Unsupported final business policy / sensitive sources | UNAVAILABLE | Fail closed; see exact exceptions in canonical coverage matrix |

## Historical Stage 3 requirements


Status: UI FINAL / SOURCE UNAVAILABLE. Setiap tindakan tetap readiness sampai sumber identitas, permission, verifikasi, konflik, dan riwayat audit tersedia. Frontend tidak menentukan lifecycle atau role authority.

| Form ID | Purpose | Required Fields | Optional Fields | Generated Fields | Source | Permission | Classification | Evidence | Verification | Approval | Lifecycle | Submit | Result Entity | Destination | Error | Conflict | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| it.account.create | Daftarkan akun untuk karyawan HR | Employee Ref, Login Identifier, Primary Workspace, Role, Effective Date | Expiration, Notes | actor/account/membership IDs, activation reference | HR + Identity | identity.accounts.manage | CONFIDENTIAL | HR employee reference bila tersedia | Identity/Backend | NEEDS DECISION | NEEDS CONTRACT / NEEDS BACKEND | Disabled | Account | `/accounts` | 401/403/409/422/500 | 409 bukan sukses; jangan overwrite | NEEDS CONTRACT |
| it.access.request | Ajukan akses workspace atau sistem | User, Workspace/System, Requested Role/Access, Reason | Duration, Evidence | request/access IDs, audit event | HR + Identity + Workspace | NEEDS CONTRACT | CONFIDENTIAL | request evidence | reviewer + Identity/Backend | NEEDS DECISION | NEEDS CONTRACT | Disabled | Access Request | `/access` | 401/403/404/409/422/500 | approval tidak berarti provisioned | NEEDS CONTRACT |
| it.account.edit | Ubah atribut administratif akun | Account | Login Identifier, Effective Date, Expiration, Administrative State, Display Name bila canonical | version/audit event | Identity | identity.accounts.manage | CONFIDENTIAL | optional evidence | Identity/Backend | NEEDS DECISION | NEEDS CONTRACT | Disabled | Account revision | `/accounts` | 401/403/404/409/422/500 | conflict harus ditinjau | NEEDS CONTRACT |
| it.workspace.add | Tambah membership workspace setelah akun ada | Account, Workspace, Role, Effective Date | Expiration, Reason / Notes | membership ID, audit event | Identity + Workspace | identity.memberships.manage | CONFIDENTIAL | optional reason/evidence | Identity/Authorization | NEEDS DECISION | NEEDS CONTRACT | Disabled | Workspace Membership | `/accounts` | 401/403/404/409/422/500 | duplicate membership = conflict | NEEDS CONTRACT |
| it.workspace.update | Ubah role atau tanggal membership | Account, Workspace, Role, Effective Date | Expiration, Reason / Notes | membership revision, audit event | Identity + Workspace | identity.memberships.manage | CONFIDENTIAL | optional reason/evidence | Identity/Authorization | NEEDS DECISION | NEEDS CONTRACT | Disabled | Membership revision | `/accounts` | 401/403/404/409/422/500 | jangan memilih role pertama dari banyak role | NEEDS CONTRACT |
| it.workspace.revoke | Cabut akses workspace tanpa hard delete | Account, Workspace, Reason | Effective At, Evidence | revocation event | Identity + Workspace | identity.memberships.manage | CONFIDENTIAL | reason/evidence bila diwajibkan | Identity/Authorization | NEEDS DECISION | NEEDS CONTRACT | Disabled | Revoked Membership | `/accounts` | 401/403/404/409/422/500 | membership tetap dapat diaudit | NEEDS CONTRACT |
| it.access.revoke | Nama form kompatibilitas untuk pencabutan akses | Account, Workspace, Reason | Effective At, Evidence | revocation event | Identity + Workspace | identity.memberships.manage bila tersedia | CONFIDENTIAL | reason/evidence bila diwajibkan | Identity/Authorization | NEEDS DECISION | NEEDS CONTRACT | Disabled | Revoked Membership | `/accounts` | 401/403/404/409/422/500 | gunakan semantics `it.workspace.revoke`; bukan hard delete | NEEDS CONTRACT |
| it.account.suspend | Ajukan penangguhan akun | Account, Reason, Effective At | Evidence | suspension event | Identity | identity.accounts.manage | CONFIDENTIAL | optional evidence | Identity/Backend | NEEDS DECISION | NEEDS CONTRACT | Disabled | Account State | `/accounts` | 401/403/404/409/422/500 | tidak sama dengan employee terminated | NEEDS CONTRACT |
| it.account.reactivate | Ajukan pengaktifan kembali akun | Account, Reason / authority according to source | Effective At, Evidence | reactivation event | Identity | identity.accounts.manage | CONFIDENTIAL | evidence bila diwajibkan | Identity/Backend | NEEDS DECISION | NEEDS CONTRACT | Disabled | Account State | `/accounts` | 401/403/404/409/422/500 | tidak otomatis memulihkan membership | NEEDS CONTRACT |
| it.activation.resend | Minta pengiriman ulang aktivasi | Account | Reason, Evidence | activation delivery event | Identity | identity.activation.manage bila tersedia | CONFIDENTIAL | delivery evidence | Identity/Backend | NEEDS DECISION | NEEDS CONTRACT | Disabled | Activation Event | `/accounts` | 401/403/404/409/422/500 | tidak boleh mengklaim terkirim tanpa response resmi | NEEDS CONTRACT |
| it.access.reset | Ajukan reset akses administratif | Account, Reason | Effective At, Evidence | reset request/audit event | Identity | identity.access.reset bila tersedia | RESTRICTED | reason/evidence | Identity/Backend | NEEDS DECISION | NEEDS CONTRACT | Disabled | Access Reset Request | `/accounts` | 401/403/404/409/422/500 | bukan pengaturan kata sandi oleh IT | NEEDS CONTRACT |
| it.session.revoke | Minta pencabutan sesi | Account, Session, Reason | Effective At, Evidence | session revocation event | Session/Identity | identity.sessions.manage bila tersedia | RESTRICTED | reason/evidence | Identity/Backend | NEEDS DECISION | NEEDS CONTRACT | Disabled | Session State | `/accounts` | 401/403/404/409/422/500 | token tidak pernah tampil | NEEDS CONTRACT |

## Identity Role Vocabulary

Vocabulary aktif hanya `EXECUTIVE` (Direktur), `DIVISION_LEAD` (Manajer / Kepala Divisi), `DIVISION_MEMBER` (Anggota Divisi), dan `IT_ADMIN` (Administrator IT). Setiap workspace membership memilih tepat satu role. Backend menentukan permission, scope, dan data scope.

`Account Type` bukan field canonical pendaftaran. Additional Workspace juga bukan bagian dari `it.account.create`; dikelola melalui `it.workspace.add` setelah akun tersedia.

User tidak memasukkan password/kata sandi, activation token, reset token, actor ID, account ID, tenant ID, organization ID, permission, scope, atau generated ID. Workspace dan role hanya dipilih dari sumber resmi. Tidak ada action yang boleh melaporkan sukses tanpa response authoritative.
