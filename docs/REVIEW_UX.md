# Review UX

ReviewPackage yang sama memiliki dua projection berdasarkan kebutuhan pembaca.

## IT / GENESIS detailed view

Menampilkan purpose, capability, scope, permission, skills, tools, delegation, model policy,
cost, automated QA, business/technical/security/evidence/cost-risk AI review, findings, risks,
limitations, dan recommendation. Informasi dapat ditelusuri ke evidence dan correlation ID.

AI recommendation diberi label recommendation atau assurance; tidak ada istilah
`APPROVED_BY_AI`.

## Director executive view

Menampilkan apa yang akan diaktifkan, alasan, business impact, allowed/prohibited authority,
risk, QA summary, AI review summary, IT recommendation, cost cap, rollback availability, serta
requested decision. Technical payload dan raw JSON tidak menjadi information hierarchy utama.

## Decision command

`APPROVE`, `RETURN`, `REJECT`, dan `HOLD` hanya aktif ketika Backend menyatakan action tersedia.
Klik mengirim command ke Backend, menampilkan pending state, lalu mengganti projection hanya dari
response canonical. Tidak ada optimistic approval atau client-side state transition.
