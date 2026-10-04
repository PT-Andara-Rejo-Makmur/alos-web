# Indeks Dokumentasi alos-web

Mulai dari [README repository](../README.md). Panduan runtime mengikuti source
dan contracts terkini; requirements/compatibility bukan klaim seluruh fitur siap.
Bukti tes bertanggal hanya berlaku untuk source dan environment yang dicatat.
Status lintas repository dipusatkan pada [readiness produksi](https://github.com/PT-Andara-Rejo-Makmur/alos-infra/blob/development/docs/PRODUCTION_READINESS_2026-10-04.md).

Authority tetap Web → Backend → GENESIS, dengan Backend sebagai pemilik data,
akses dan keputusan. Secret, dump, log privat dan artifacts lokal tidak masuk Git.

## Mulai dan boundary

- [Integrasi API](API_INTEGRATION.md)
- [Canonical business workspaces](canonical-business-workspaces.md)
- [Canonical Identity and Access Projection](CANONICAL_IDENTITY_ACCESS.md)
- [Dependency security](DEPENDENCY_SECURITY.md)
- [Pengembangan](DEVELOPMENT.md)
- [Instalasi](INSTALLATION.md)
- [Legal, HR & GA, IT — canonical workspace](legal-hr-it-operations.md)
- [Pengalaman Produk ALOS](product-experience.md)
- [Menjalankan Aplikasi](RUNNING.md)
- [ALOS Shared Work / Pekerjaan — Architecture & Authority Specification](shared-work-architecture.md)

## Workspace dan kebutuhan bisnis

- [Executive Data Requirements Registry](executive-data-requirements.md)
- [Executive Form Requirements Registry](executive-form-requirements.md)
- [Executive Workspace](executive-workspace.md)
- [Finance Business State Decisions](finance-business-state-decisions.md)
- [Finance Cross-Domain Matrix](finance-cross-domain-matrix.md)
- [Finance Data Requirements](finance-data-requirements.md)
- [Finance Form Requirements](finance-form-requirements.md)
- [Finance Governance Matrix](finance-governance-matrix.md)
- [Finance & Pajak Workspace](finance-workspace.md)
- [HR / GA Business State Decisions](hr-business-state-decisions.md)
- [HR / GA Cross-Domain Matrix](hr-cross-domain-matrix.md)
- [HR / GA Data Classification](hr-data-classification.md)
- [HR / GA Data Requirements](hr-data-requirements.md)
- [HR / GA Form Requirements](hr-form-requirements.md)
- [HR / GA Governance Matrix](hr-governance-matrix.md)
- [HR / GA Workspace](hr-workspace.md)
- [IT Access Governance](it-access-governance.md)
- [IT Account Provisioning](it-account-provisioning.md)
- [IT Business State Decisions](it-business-state-decisions.md)
- [IT Cross-Domain Matrix](it-cross-domain-matrix.md)
- [IT Data Requirements](it-data-requirements.md)
- [IT Form Requirements](it-form-requirements.md)
- [IT Governance Matrix](it-governance-matrix.md)
- [IT Security Boundaries](it-security-boundaries.md)
- [IT Workspace](it-workspace.md)
- [Legal Business State Decisions](legal-business-state-decisions.md)
- [Legal Cross-Domain Matrix](legal-cross-domain-matrix.md)
- [Legal Data Requirements](legal-data-requirements.md)
- [Legal Form Requirements](legal-form-requirements.md)
- [Legal Governance Matrix](legal-governance-matrix.md)
- [Legal Workspace](legal-workspace.md)
- [Property Business State Decisions](property-business-state-decisions.md)
- [Property Cross-domain Matrix](property-cross-domain-matrix.md)
- [Property Data Requirements](property-data-requirements.md)
- [Property Form Requirements](property-form-requirements.md)
- [Property Workspace](property-workspace.md)
- [Sales Cross-domain Matrix](sales-cross-domain-matrix.md)
- [Sales Data Requirements](sales-data-requirements.md)
- [Sales Form Requirements](sales-form-requirements.md)
- [Sales & Marketing Workspace](sales-workspace.md)


## Pemeriksaan sebelum commit

Dari sibling checkout Infra, jalankan `python scripts/verify-documentation.py`.
Pemeriksaan memvalidasi link file kelima repository serta casing Linux tanpa jaringan.
