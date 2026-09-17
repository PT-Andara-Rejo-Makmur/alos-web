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

## Contract

Type lintas service harus dihasilkan oleh `alos-contracts`. Sampai package TypeScript tersedia,
`src/lib/contracts/` tetap menjadi facade kosong yang mendokumentasikan integration seam. Jangan
mengisi seam ini dengan salinan manual schema.
