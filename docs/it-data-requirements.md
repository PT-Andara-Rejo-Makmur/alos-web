# IT Data Requirements

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


Sumber operasional canonical kini terhubung sesuai [mapping Legal, HR & GA dan IT](legal-hr-it-operations.md). Catatan SOURCE UNAVAILABLE berikut merekam desain awal; capability tanpa persistence/authority tetap unavailable.

Status keseluruhan: UI FINAL / SOURCE UNAVAILABLE. Setiap availability yang bertanda `NEEDS CONTRACT`, `NEEDS BACKEND`, atau `NEEDS DECISION` belum boleh dipresentasikan sebagai data operasional.

| Component ID | Menu | Purpose | Entity | Employee Source | Identity Source | Workspace Source | Role Source | Permission Source | Owner | Verification | Freshness | Classification | Authority | Destination | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| it.summary | Ringkasan | indikator operasional dan identitas | service, incident, account, access, leaver | HR | Identity/IT | Identity | Identity | Identity | IT | source-specific | current | INTERNAL/RESTRICTED | masing-masing source | `/summary` | NEEDS BACKEND |
| it.summary.identity | Ringkasan | akun menunggu, aktivasi, akses review, leaver | identity queue | HR | Identity | Identity | Identity | Identity | IT + HR | Backend | current | CONFIDENTIAL | HR/Identity governance | `/summary` | NEEDS CONTRACT |
| it.services | Layanan & Insiden | status layanan | service | — | IT service source | workspace | — | IT governance | IT | service review | current | INTERNAL | IT | `/services` | NEEDS BACKEND |
| it.incidents | Layanan & Insiden | insiden dan dampak | incident | — | service management | workspace | — | IT governance | IT | incident verification | current/history | INTERNAL | IT | `/services` | NEEDS CONTRACT |
| it.problem | Layanan & Insiden | problem/root cause | problem | — | service management | workspace | — | IT governance | IT | root-cause review | history | INTERNAL | IT governance | `/services` | NEEDS DECISION |
| it.systems | Sistem & Aplikasi | katalog sistem/aplikasi | system/application | — | IT inventory | organization/workspace | — | IT governance | IT | inventory verification | current | INTERNAL | IT | `/systems` | NEEDS BACKEND |
| it.infrastructure | Infrastruktur & Lingkungan | komponen dan lingkungan | infrastructure component | — | infrastructure source | workspace/environment | — | IT governance | IT | technical verification | current | RESTRICTED when sensitive | IT | `/infrastructure` | NEEDS BACKEND |
| it.alos-genesis | ALOS & GENESIS | kesiapan platform | platform component | — | platform source | organization/workspace | — | platform governance | IT | release/source verification | current | INTERNAL | platform owner | `/alos-genesis` | INTEGRATION PENDING |
| it.integrations | Integrasi & Connector | koneksi sistem | integration | — | integration registry | organization/workspace | — | security governance | IT | connection health source | current | RESTRICTED | IT/security | `/integrations` | NEEDS CONTRACT |
| it.account.pending | Akun Karyawan | akun menunggu pendaftaran | provisioning candidate | HR | Identity | Identity | Identity | Identity | IT + HR | employee linkage | event/effective | CONFIDENTIAL | HR/Identity | `/accounts` | NEEDS CONTRACT |
| it.accounts | Akun Karyawan | account state dan identity fields | account | HR | Identity | Identity | Identity | Identity | Identity | Backend | current/history | CONFIDENTIAL | Identity | `/accounts` | AVAILABLE projection / linkage pending |
| it.activation | Akun Karyawan | activation state | activation | HR | Identity | Identity | Identity | Identity | Identity | Backend | current/history | CONFIDENTIAL | Identity | `/accounts` | NEEDS CONTRACT |
| it.workspace-access | Akses & Identitas | workspace access | access membership | HR | Identity | Identity | Identity | Identity | Identity governance | approval/audit | effective-dated | CONFIDENTIAL | Identity/Backend | `/access` | NEEDS CONTRACT |
| it.access-request | Akses & Identitas | request/review/approval/provision flow | access request | HR | Identity | Identity | Identity | Identity | IT + workspace owner | approval/audit | event/history | CONFIDENTIAL | governance | `/access` | NEEDS CONTRACT |
| it.sessions | Sesi | authorized session metadata | session metadata | — | session service | actor/workspace context | — | Identity | Identity | Backend | current/history | RESTRICTED | Identity | `/accounts` | NEEDS CONTRACT |
| it.security | Keamanan & Kepatuhan | controls, events, reviews | security control/event | — | security source | organization/workspace | — | security governance | security/IT | governance review | period/history | RESTRICTED | security governance | `/security` | NEEDS DECISION |
| it.changes | Perubahan & Rilis | change/release readiness | change/release | — | change source | workspace | — | change governance | IT | approval/audit | scheduled/history | INTERNAL | IT governance | `/changes` | NEEDS CONTRACT |
| it.assets | Aset IT | asset assignment/state | IT asset | HR when employee-linked | asset source | workspace | — | IT/GA permissions | IT/GA | asset verification | current/history | INTERNAL | asset owner | `/assets` | NEEDS BACKEND |
| it.support | Dukungan & Permintaan | support queue | support request | employee when requester | support source | workspace | — | IT permissions | IT | request verification | current/history | INTERNAL | IT | `/support` | NEEDS CONTRACT |
| it.performance | Target & Kinerja | target, actual, forecast separation | target/KPI/actual | — | IT source | workspace | — | Strategy/IT | Strategy for target, IT for actual | source-specific | period | INTERNAL | Strategy/IT separately | `/performance` | INTEGRATION PENDING |
| it.joiner | Akses & Identitas | joiner readiness | joiner event | HR | Identity | Identity | Identity | Identity | HR + IT | HR event | effective-dated | CONFIDENTIAL | HR/Identity | `/access` | NEEDS CONTRACT |
| it.mover | Akses & Identitas | mover access review | employment/access change | HR | Identity | Identity | Identity | Identity | HR + IT | effective change + review | effective-dated | CONFIDENTIAL | HR/Identity | `/access` | NEEDS DECISION |
| it.leaver | Akses & Identitas | leaver revocation queue | offboarding/revocation | HR | Identity | Identity | Identity | Identity | HR + IT | offboarding + revocation verification | effective/history | CONFIDENTIAL | HR/Identity | `/access` | NEEDS CONTRACT |

`Employee Source` selalu HR; IT tidak membuat employee master. `Identity Source` adalah sumber akun, access, role, permission, dan session ketika contract tersedia. Unknown memakai `—`; source unavailable `Belum Terhubung`; connected-empty `Belum ada data`; error memakai pesan manusiawi. Freshness, retention, evidence, classification policy, dan authority final tetap NEEDS DECISION/CONTRACT/BACKEND.

## Account and identity data

| Component ID | Menu | Purpose | Entity | Employee Source | Identity Source | Workspace Source | Role Source | Permission Source | Owner | Verification | Freshness | Classification | Authority | Destination | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| it.account.registration | Akun Karyawan | Daftarkan Akun | account registration | HR employee ref | Identity account | Identity workspace | canonical role catalog | identity.accounts.manage | IT + HR | source and conflict verification | effective-dated | CONFIDENTIAL | Identity/Backend | `/accounts` | CONNECTED |
| it.account.primary-workspace | Akun Karyawan | authoritative primary workspace | primary membership marker | HR relation | Identity | Identity | Identity | Identity | Identity | active membership validation | current/effective | CONFIDENTIAL | Identity | `/accounts` | CONNECTED |
| it.account.memberships | Workspace & Akses | add/edit/revoke membership | workspace membership | HR context | Identity | Identity | Identity | identity.memberships.manage | IT + workspace owner | audit and conflict verification | effective/history | CONFIDENTIAL | Identity/Authorization | `/accounts` | CONNECTED |
| it.account.activation-delivery | Akun Karyawan | employee activation challenge | activation event | HR relation | Identity | Identity | — | activation | Identity | employee-owned activation; delivery separate | event | CONFIDENTIAL | Identity | `/accounts` | CHALLENGE CREATED |
| it.account.audit | Riwayat | immutable account and access events | audit event | HR context | Identity audit | Identity | Identity | governance | IT/Identity | audit source | history | RESTRICTED | Identity governance | `/accounts` | CONNECTED |
| it.account.reset | Akun Karyawan | administrative reset request | reset request | HR context | Identity | — | — | reset permission | Identity | request/result audit | event | RESTRICTED | Identity | `/accounts` | NEEDS CONTRACT |
| it.session.revocation | Sesi | session metadata and revocation | session/revocation event | — | shared session/Identity | actor/workspace | — | identity.accounts.manage | Identity | Backend verification | current/history | RESTRICTED | Identity | `/accounts` | CONNECTED |
| it.settings-boundary | Pengaturan | separate global self-service from IT administration | profile/password/session/preferences | — | shared session/Identity | active workspace | — | source-specific | Settings + Identity | policy verification | current | RESTRICTED | global Settings/Identity | global settings | NEEDS DECISION |

The Web must not infer `Primary Workspace` from the first or active membership. Each role list carries one role per membership. Additional workspace access is a post-registration membership operation, not an account-create field.
