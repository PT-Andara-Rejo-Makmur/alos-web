# Arsitektur ALOS Web

ALOS Web adalah frontend dan API/BFF boundary, bukan authority. Arsitektur runtime aktual:

```text
Browser
  -> ALOS Web
     -> /api/session/*
     -> /api/backend/*
        -> ALOS Backend
           -> GENESIS / internal systems
```

## Runtime frontend saat ini

- `/login` menyediakan login.
- `/api/session/*` menangani login, pembacaan session, dan logout melalui boundary same-origin.
- `/workspace` memuat pilihan workspace yang diizinkan dan mengarahkan ke active workspace.
- `/workspace/[workspaceKey]/...` memuat dashboard divisi, Shared Work, ARA dan administrasi sesuai permission.
- `/api/backend/*` meneruskan request terautentikasi ke ALOS Backend.
- `src/lib/contracts/` menjadi contract facade frontend untuk sumber `alos-contracts`.
- Adapter feature memvalidasi projection API dan mempertahankan null/unknown, Decimal string,
  lifecycle dan pembatasan tindakan dari Backend.

ALOS Backend memegang authentication, authorization, canonical state, dan integrasi ke GENESIS
atau internal systems. Browser/Web tidak memanggil GENESIS secara langsung.

Session backend disimpan dalam cookie `HttpOnly`; secret dan authority tidak dipindahkan ke
browser. Error dan correlation ID diteruskan hanya sebagai metadata operasional, bukan sebagai
canonical state frontend.

## Workspace routing authority

- `workspace` adalah object authoritative dari Backend/session.
- `workspace.workspace_key` adalah identity URL pada boundary canonical
  `/workspace/[workspaceKey]/...`; key bukan role, permission, atau domain authority.
- `workspace_type` dan `division_code` dipetakan melalui `resolveWorkspaceDomain` untuk
  memilih domain feature. Workspace yang belum dikenali fail closed.
- `permission_refs` dan `scope_refs` menentukan action serta data scope; URL hanya divalidasi
  terhadap active workspace, tidak pernah menjadi authority.
- Route groups `(shared-work)`, `(assistant)`, `(domain)`, dan `(administration)` hanya
  mengorganisasi source tree dan tidak muncul pada public URL.
- Shared Work (`projects`, `tasks`, `approvals`, `documents`, `reports`, `findings`) dan ARA
  adalah feature universal yang menerima actual authoritative workspace key.
- Feature route hanya memvalidasi active workspace. Hanya workspace switcher eksplisit yang
  memanggil Backend untuk mengganti `active_workspace`, me-refresh session, lalu menavigasi ke
  canonical route.
