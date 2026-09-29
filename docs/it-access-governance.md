# IT Access Governance

Backend authorizes every account and workspace membership change. IT routes do not infer access from
the URL, do not change the active workspace, and do not receive business-domain permissions solely
from the `IT_ADMIN` role. `EXECUTIVE` alone also grants no identity administration permission.

An account can be enabled or suspended independently of employee status and activation state.
Suspension blocks login and revokes current sessions. Reactivation does not restore prior sessions
or revoked memberships. Identity actions are recorded in the append-only audit store with the
administrator, target actor, authority boundary, workspace when applicable, correlation ID, time, and
outcome.

Each actor has at most one membership per workspace, and each membership carries exactly one role.
The active roles are `EXECUTIVE`, `DIVISION_LEAD`, `DIVISION_MEMBER`, and `IT_ADMIN`. Backend derives
permissions, scopes, and data scope from workspace, role, and server policy. Client-selected
authority metadata is rejected.

Membership dates are authoritative. Access requires an unrevoked membership whose effective time
has arrived and whose optional expiration remains in the future, an active workspace, and an active
account. Membership revocation is soft. Removing the primary workspace membership clears the
primary reference and any matching session workspace selection.

The account detail view exposes safe session metadata and audit event summaries. Session projections
never contain raw bearer tokens, token hashes, or password hashes. Session revocation is scoped to
the target actor in the caller's tenant and organization.

The IT workspace continues to use its existing account registration, membership, suspend/reactivate,
session, and audit surfaces; identity changes do not restructure the dashboard or other domain
areas. `IT_ADMIN` alone does not grant Finance, HR, Legal, or Executive data access.
