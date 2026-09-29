# IT Security Boundaries

- Browser code calls same-origin BFF paths only.
- Backend authentication and authorization remain authoritative.
- HttpOnly session cookies contain the opaque Backend session boundary; browser code never receives or forwards a token.
- Passwords, activation tokens, refresh tokens, cookies, API keys, and secrets are never rendered.
- Account and access tables omit internal actor, tenant, organization, and scope identifiers from user-facing detail.
- Device/browser/session metadata is visible only when an authorized session source provides it; token material is never a session field.
- Classification values (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`) are source/governance values, not frontend defaults.
- 401, 403, 404, 409, 422, and 500 states remain distinct in the user experience.
- No frontend route, role label, workspace key, local storage value, or URL segment grants authority.

## Settings and reset boundary

Global self-service owns Profil, Ganti Kata Sandi, Sesi milik sendiri, Notifikasi, and Preferensi. IT administration owns account registration, workspace membership, role assignment, activation support, suspension, revocation, session administration, and reset requests only when the Identity source authorizes them. IT does not see or choose a password and does not receive reset or activation tokens.

The current IT UI keeps Edit Akun, Kirim Ulang Aktivasi, Reset Akses, and Cabut Sesi in readiness/disabled state until their respective source and permission semantics exist. A disabled action is not a successful operation. Audit events for Account Created, Account Edited, Activation Resent, Workspace Added, Workspace Role Changed, Workspace Access Edited, Workspace Revoked, Account Suspended, Account Reactivated, Password Reset Requested, and Session Revoked remain NEEDS CONTRACT / NEEDS BACKEND.

IT_ADMIN is an identity administration role, not a business superuser. Finance, HR/GA, Legal, Sales, Property, and Executive membership must be independently provided by the Backend-authorized workspace membership source.
