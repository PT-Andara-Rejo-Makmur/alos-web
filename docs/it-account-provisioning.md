# IT Account Provisioning

## Intended flow

HR employee → account request → identity review → primary workspace → canonical role → approval where required → Backend provisioning → activation → employee sets their own password.

The current Web form is readiness-only because the available Identity contract requires a direct password field and has no employee reference or activation flow. The Web does not render, generate, store, or submit a password, token, secret, or raw identity ID.

Employee, account, workspace access, and privileged access are separate concepts. An employee existing in HR does not imply an account; an account does not imply activation; approval does not imply provisioning; and a workspace membership does not imply privileged access.

Duplicate account atau email adalah conflict yang ditentukan oleh sumber Identity/Backend. Frontend tidak menentukan uniqueness, tidak menimpa akun yang sudah ada, dan tidak mengubah conflict menjadi keberhasilan.

Required contract additions: employee reference, activation ownership, invitation/password setup, account/access state, role privilege metadata, request/approval relation, and conflict semantics.

## Account governance readiness

Account state and activation state are separate. Suspend requires Account, Reason, Effective At, and Evidence; access revoke requires User, Access, Reason, Effective At, and optional Evidence. These forms remain disabled until governance and version/conflict semantics are canonical. There is no hard delete action.

Account detail exposes identity summary, workspace access with role context, session metadata, and combined history in four tabs. Session revocation remains Identity/Backend-owned. Joiner, Mover, and Leaver queues are readiness projections only; HR remains the employee/offboarding source and IT does not create or terminate employees.

## Final account registration alignment

The primary action is `Daftarkan Akun`. The flow is intentionally simple and has four sections: Karyawan, Identitas Akun, Workspace & Role, and Review. Required business fields are Employee Ref, Login Identifier, Primary Workspace, Role, and Effective Date. Expiration and Notes are optional. Password, activation token, reset token, actor ID, account ID, tenant ID, organization ID, and additional workspace access are never entered by the user.

The generated Identity contract currently has legacy roles and still requires a password for direct provisioning. The frontend therefore exposes the MVP-2 target vocabulary as readiness only: Direktur, Manajer / Kepala Divisi, Anggota Divisi, and Administrator IT. `DIVISION_LEAD` and `DIVISION_MEMBER` are not invented in the Web; they remain disabled until the canonical role catalog supports them. Existing legacy roles are read-only and are not silently remapped.

Primary Workspace is not inferred from the first or active membership. Until Identity exposes a primary marker, the list and detail render `—`. Additional workspace access is managed only after account creation from Detail Akun → Workspace & Akses through separate Tambah Workspace, Edit Akses, and Cabut Akses readiness actions.

Account detail has four tabs: Ringkasan, Workspace & Akses, Sesi, and Riwayat. Role is shown within each workspace membership; access history and administrative activity are combined under Riwayat. Activation is a separate source from account state, and the account page never claims activation, delivery, or reset success without an authoritative response.
