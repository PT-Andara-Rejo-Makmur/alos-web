# Canonical Identity and Access Projection

ALOS Web owns presentation and interaction only. Authentication and authorization facts come from
the ALOS Backend through the same-origin session boundary.

## Browser boundary

- `/api/session/login` forwards credentials server-side, stores the opaque Backend token in an
  HttpOnly `SameSite=Lax` cookie, and never returns that token to browser JavaScript.
- `/api/session` resolves current identity using Backend `whoami`.
- `/api/backend/*` forwards protected calls with the cookie-held bearer token.
- deleting `/api/session` revokes the Backend session before clearing the cookie.
- `ALOS_SESSION_COOKIE_SECURE` may be set to `false` only for a local HTTP integration environment;
  production defaults to a Secure cookie.

Frontend transport types are imported from Contracts 1.7. The temporary legacy projection adapter
exists only for rolling deployment compatibility and must be removed after all environments serve
the canonical shape.

## Workspace resolution

The resolver fetches Backend-authorized memberships, renders only those workspaces, persists the
selected active workspace through `PUT /api/v1/auth/active-workspace`, and derives navigation from
workspace metadata. It does not use a global-role precedence rule and does not fabricate a fallback
workspace when Backend is unavailable.

## Readiness gaps

The central readiness matrix is fail-closed. Shared operational modules and domain modules without
a real Backend route remain `BLOCKED`; their visible navigation is roadmap information, not a claim
that an integration exists. Currently only the already integrated IT control-plane surfaces
(`research`, `evidence`, `decisions`, and `control-plane`) remain `READY`.

The authentication/workspace foundation is ready. Building the blocked business modules is outside
this stabilization and requires canonical Contracts plus Backend persistence/API work first.
