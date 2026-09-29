# IT Access Governance

Access is granted only by Backend-authorized workspace and role projections. Additional workspace access requires an explicit request and governed approval; the feature route never switches the active workspace and the UI never infers access from the URL.

Existing `identity.accounts.manage` and `identity.memberships.manage` may be used only where the Backend already authorizes the operation. No new permission string is invented. Privileged roles require canonical metadata and approval; until available, the action is unavailable.

`IT_ADMIN` bukan superuser bisnis. Role tersebut tidak otomatis memberi akses ke data atau tindakan terbatas Finance, HR, Legal, atau Executive.

Joiner, mover, leaver, suspension, expiry, and revocation semantics are NEEDS DECISION / NEEDS CONTRACT. A 409 access conflict is an unresolved conflict, not a successful mutation and never overwrites newer access state.
