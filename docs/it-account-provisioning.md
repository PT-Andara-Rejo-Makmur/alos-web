# IT Account Provisioning

IT Account Management reads account, workspace, role, and provisioning-candidate data from Backend.
Backend filters candidates to the caller's tenant and organization, active employment, current
employment dates, and employees without an actor link. HR fields remain read-only in the form.

The registration request contains employee ID, account email, initial workspace, one role, effective
date, optional expiration, and an optional note. Tenant, organization, actor, permissions, scopes,
data scope, and password are not client inputs. Backend provisions actor, account, membership,
employee link, and activation challenge atomically.

The account starts enabled with activation pending. The employee chooses a password through the
one-time activation flow. Challenge creation and message delivery are separate; the Web never claims
that an invitation was delivered. The UI reports success only after an authoritative Backend
response.

The active role vocabulary is `EXECUTIVE` (Direktur), `DIVISION_LEAD` (Manajer / Kepala Divisi),
`DIVISION_MEMBER` (Anggota Divisi), and `IT_ADMIN` (Administrator IT). One workspace membership has
one primary role. Backend derives permission, scope, and data scope from workspace, role, and server
policy.

Account detail shows HR identity facts, account and activation state, primary workspace, workspace
access, session metadata, and identity audit history. HR facts are read-only. Workspace membership
can be added, edited, and softly revoked through the existing identity routes. Account suspension
revokes sessions and does not change employment status. Reactivation does not restore old sessions
or revoked memberships.
