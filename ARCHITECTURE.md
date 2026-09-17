# Arsitektur ALOS Web

## Prinsip utama

ALOS Web adalah human interaction layer, bukan authority. Browser menampilkan projection dari
Backend dan mengirim command. Backend melakukan authentication, authorization, tenant/scope
enforcement, decision recording, release transition, audit, dan integrasi internal ke GENESIS.

```text
Experience route -> feature UI -> src/lib/api -> ALOS Backend
                                             -> correlation metadata
```

Tidak ada jalur browser ke GENESIS, MCP connector, ModelGateway, atau provider model.

## Batas lapisan

- `app/` melakukan route composition dan metadata.
- `experiences/` menentukan audience, bahasa, serta composition boundary.
- `features/` memiliki UI capability reusable lintas experience.
- `components/` hanya berisi primitive/layout bersama.
- `lib/api/` adalah satu-satunya network boundary.
- `lib/contracts/` akan mengekspor generated contract dari `alos-contracts`.

## State

Server response adalah canonical state. Local React state hanya digunakan untuk interaction
ephemeral seperti loading, expanded panel, dan input yang belum dikirim. Baseline tidak memakai
global state framework atau persistent client cache.

## Review dan decision

Satu ReviewPackage menghasilkan dua projection: detail untuk IT/GENESIS dan executive untuk
Director. AI recommendation selalu diberi label assurance. Decision button mengirim command dan
menunggu response Backend; tidak ada optimistic authoritative transition.

## Security boundary

Environment dengan prefix `NEXT_PUBLIC_` dapat dibaca browser dan tidak boleh memuat secret.
Visibility atau disabled state di UI bukan security control. Backend wajib melakukan enforcement
deny-by-default untuk setiap request.
