# Integrasi API

## Boundary browser

```text
Browser -> /api/session/*  -> ALOS Backend
Browser -> /api/backend/*  -> ALOS Backend -> GENESIS / internal systems
```

`/api/session/*` adalah same-origin boundary untuk login, pembacaan session, dan logout.
`/api/backend/*` adalah proxy terautentikasi untuk request frontend yang membutuhkan Backend.

Browser dan Web tidak memanggil GENESIS secara langsung. ALOS Backend tetap menjadi authority
untuk authentication, authorization, canonical state, dan integrasi internal.

## Session

Login diteruskan ke Backend melalui `/api/session/login`. Token Backend disimpan oleh Web dalam
cookie `HttpOnly` dan tidak dikembalikan ke JavaScript browser. Pembacaan session menggunakan
`/api/session`; logout menggunakan `DELETE /api/session`.

## Correlation ID

Boundary meneruskan atau membuat `x-correlation-id` untuk membantu troubleshooting. Correlation ID
boleh disimpan sebagai metadata sementara, tetapi bukan credential, bukan canonical state, dan
tidak menggantikan audit Backend.

## Error dan fallback

Error berasal dari Backend atau boundary Web sebagai structured error. Jika Backend tidak tersedia,
Web menampilkan error; Web tidak membuat fake runtime response, mock data, atau authority lokal.

## Contract boundary

`src/lib/contracts/` adalah facade frontend dengan `alos-contracts` sebagai sumber contract
canonical. Frontend tidak menggandakan schema dan tidak menemukan authority baru.
