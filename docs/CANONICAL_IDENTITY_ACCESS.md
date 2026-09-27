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

UI workspace lama, termasuk selector dan navigation lama, telah dihapus sebagai bagian dari UI
Reset. Dokumen ini tidak menyatakan bahwa selector atau navigation tersebut masih aktif.

Canonical session dan `active workspace projection` tetap dipertahankan pada contract/data boundary
untuk rebuild berikutnya. Projection tersebut bukan alasan untuk menghidupkan kembali UI lama dan
tidak membuat frontend menjadi authority.
