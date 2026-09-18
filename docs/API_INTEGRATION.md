# Integrasi API

## Alur tunggal

```text
alos-web -> src/lib/api -> ALOS Backend -> GENESIS/internal systems
```

Frontend tidak pernah memanggil GENESIS, MCP, atau model provider secara langsung. Semua request
harus memakai `apiRequest` agar base URL, JSON handling, structured error, dan correlation ID
berperilaku konsisten.

`NEXT_PUBLIC_ALOS_API_BASE_URL` adalah satu-satunya endpoint publik. Nilai kosong menghasilkan
explicit not-configured state dan tidak memicu fallback ke data palsu.

## Correlation ID

Client membaca header `x-correlation-id` dari response. Nilai terakhir boleh disimpan pada
`sessionStorage` untuk troubleshooting dan hilang bersama session browser. Correlation ID bukan
credential, bukan trace authority, dan tidak menggantikan audit Backend.

## Diagnostic baseline

Komponen status memanggil `GET /api/v1/system/integration` pada Backend. Backend kemudian memanggil endpoint internal GENESIS dan memvalidasi responsnya. Web tidak mengetahui atau menyimpan URL GENESIS. UI menampilkan status terhubung hanya setelah Backend mengembalikan payload `IntegrationDiagnostic` yang valid, serta menampilkan `correlation_id` untuk troubleshooting.

Kegagalan tetap berasal dari Backend sebagai structured error (`code`, `message`, `correlation_id`, `retryable`). Browser tidak membuat canonical state atau fallback response.

## Endpoint MVP-1

Compatibility UI menggunakan endpoint publik Backend untuk session, workspace, dokumen, source,
evidence, Agent, governance, release, portfolio, operational module, dan executive dashboard.
Path `/api/v1/genesis/...` adalah facade Backend untuk capability AI, bukan direct GENESIS URL.

Saat endpoint belum tersedia, UI menampilkan error/disconnected state. Client tidak melakukan
fallback ke mock, local storage authority, atau URL service internal.

## Contract

Type lintas service harus dihasilkan oleh `alos-contracts`. Sampai package TypeScript tersedia,
`src/lib/contracts/` menyediakan projection TypeScript sempit untuk diagnostic baseline yang ditandai
jelas sebagai sementara. Projection tersebut harus diganti oleh generated export saat package contract
tersedia; tidak boleh berkembang menjadi duplikasi permanen seluruh schema.
