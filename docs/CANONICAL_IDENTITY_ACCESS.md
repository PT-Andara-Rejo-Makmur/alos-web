# Canonical Identity and Access Projection

ALOS Web owns the browser interaction boundary only. Authentication and authorization facts come
from ALOS Backend through the same-origin session boundary.

## Session boundary

- `/api/session/login` forwards credentials server-side and stores the opaque Backend token in an
  `HttpOnly`, `SameSite=Lax` cookie.
- `/api/session` resolves the current identity from Backend.
- `/api/backend/*` forwards protected calls with the cookie-held bearer token.
- `DELETE /api/session` revokes the Backend session when possible and clears the cookie.

The token is never exposed to browser JavaScript. Production uses a secure cookie by default;
`ALOS_SESSION_COOKIE_SECURE=false` is reserved for local HTTP integration environments.

## Workspace projection

Selector dan navigation dari tree UI lama telah dihapus sebagai bagian dari UI Reset. AppShell,
workspace switcher, dan navigation canonical yang sekarang tersedia adalah implementasi pengganti;
semuanya dibangun dari `active workspace projection` Backend dan route publik
`/workspace/[workspaceKey]/...`.

Perpindahan workspace mempertahankan root modul Shared Work bila aman, tetapi tidak membawa ID
resource lintas workspace. Landing default setiap domain adalah `/summary`. Workspace key di URL
tidak pernah menjadi sumber authority dan selalu divalidasi terhadap session projection.

Role tidak sama dengan classification grant. ARA default ke `INTERNAL`; `RESTRICTED` hanya dapat
digunakan ketika exact authoritative permission yang sudah tersedia diproyeksikan Backend.
`CONFIDENTIAL` ceiling dan vocabulary grant canonical masih **NEEDS CONTRACT — ARA Classification
Ceiling**. Boundary konsep thread memeriksa tenant, organisasi, actor, workspace, scope, dan
classification secara fail-closed.
