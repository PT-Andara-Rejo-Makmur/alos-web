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
- `/workspace` adalah temporary landing setelah status session diperiksa.
- `/api/backend/*` meneruskan request terautentikasi ke ALOS Backend.
- `src/lib/contracts/` menjadi contract facade frontend untuk sumber `alos-contracts`.
- Reusable data adapter boleh digunakan di bawah facade tersebut jika masih diperlukan oleh
  runtime foundation.

ALOS Backend memegang authentication, authorization, canonical state, dan integrasi ke GENESIS
atau internal systems. Browser/Web tidak memanggil GENESIS secara langsung.

Session backend disimpan dalam cookie `HttpOnly`; secret dan authority tidak dipindahkan ke
browser. Error dan correlation ID diteruskan hanya sebagai metadata operasional, bukan sebagai
canonical state frontend.
