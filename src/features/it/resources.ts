import { defineResource } from "@/features/business-records/resource";
import { itApi } from "./api";

export const itResources = {
  systems: defineResource({
    "key": "systems",
    "domain": "it",
    "title": "Sistem & Aplikasi",
    "identifier": "system_id",
    "createFields": [
      {
        "name": "system_code",
        "label": "Kode Sistem",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "criticality",
        "label": "Kekritisan",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      }
    ],
    "updateFields": [
      {
        "name": "system_code",
        "label": "Kode Sistem",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "criticality",
        "label": "Kekritisan",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "system_code",
        "label": "Kode Sistem",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "criticality",
        "label": "Kekritisan",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.systems),
  integrations: defineResource({
    "key": "integrations",
    "domain": "it",
    "title": "Inventaris Integrasi",
    "identifier": "integration_id",
    "createFields": [
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "integration_type",
        "label": "Jenis Integrasi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "endpoint_ref",
        "label": "Referensi Endpoint Tanpa Kredensial",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "integration_type",
        "label": "Jenis Integrasi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "endpoint_ref",
        "label": "Referensi Endpoint Tanpa Kredensial",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "integration_id",
        "label": "Referensi Inventaris Integrasi",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/integrations",
          "identifier": "integration_id",
          "label": "name"
        }
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "integration_type",
        "label": "Jenis Integrasi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "endpoint_ref",
        "label": "Referensi Endpoint Tanpa Kredensial",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.integrations),
  databases: defineResource({
    "key": "databases",
    "domain": "it",
    "title": "Database",
    "identifier": "database_id",
    "createFields": [
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "engine",
        "label": "Mesin Database",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment",
        "label": "Lingkungan Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "classification",
        "label": "Klasifikasi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "engine",
        "label": "Mesin Database",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment",
        "label": "Lingkungan Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "classification",
        "label": "Klasifikasi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "database_id",
        "label": "Referensi Database",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/databases",
          "identifier": "database_id",
          "label": "name"
        }
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "engine",
        "label": "Mesin Database",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment",
        "label": "Lingkungan Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "classification",
        "label": "Klasifikasi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.databases),
  environments: defineResource({
    "key": "environments",
    "domain": "it",
    "title": "Lingkungan",
    "identifier": "environment_id",
    "createFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment_type",
        "label": "Jenis Lingkungan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "base_url",
        "label": "URL Tanpa Kredensial",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment_type",
        "label": "Jenis Lingkungan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "base_url",
        "label": "URL Tanpa Kredensial",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment_id",
        "label": "Referensi Lingkungan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/environments",
          "identifier": "environment_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment_type",
        "label": "Jenis Lingkungan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "base_url",
        "label": "URL Tanpa Kredensial",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.environments),
  repositories: defineResource({
    "key": "repositories",
    "domain": "it",
    "title": "Repository",
    "identifier": "repository_id",
    "createFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "provider",
        "label": "Penyedia",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "external_url",
        "label": "URL Repository",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "default_branch",
        "label": "Branch Utama",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "provider",
        "label": "Penyedia",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "external_url",
        "label": "URL Repository",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "default_branch",
        "label": "Branch Utama",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "repository_id",
        "label": "Referensi Repository",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/repositories",
          "identifier": "repository_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "provider",
        "label": "Penyedia",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "external_url",
        "label": "URL Repository",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "default_branch",
        "label": "Branch Utama",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.repositories),
  cicd_pipelines: defineResource({
    "key": "cicd_pipelines",
    "domain": "it",
    "title": "Pipeline CI/CD",
    "identifier": "pipeline_id",
    "createFields": [
      {
        "name": "repository_id",
        "label": "Referensi Repository",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/repositories",
          "identifier": "repository_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "provider",
        "label": "Penyedia",
        "required": true,
        "nullable": false,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "provider",
        "label": "Penyedia",
        "required": true,
        "nullable": false,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "pipeline_id",
        "label": "Referensi Pipeline",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/cicd-pipelines",
          "identifier": "pipeline_id",
          "label": "name"
        }
      },
      {
        "name": "repository_id",
        "label": "Referensi Repository",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/repositories",
          "identifier": "repository_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "provider",
        "label": "Penyedia",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.cicd_pipelines),
  ci_runs: defineResource({
    "key": "ci_runs",
    "domain": "it",
    "title": "Riwayat CI",
    "identifier": "ci_run_id",
    "createFields": [
      {
        "name": "pipeline_id",
        "label": "Referensi Pipeline",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/cicd-pipelines",
          "identifier": "pipeline_id",
          "label": "name"
        }
      },
      {
        "name": "external_run_id",
        "label": "ID Eksekusi Sumber",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "commit_sha",
        "label": "Commit SHA",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "started_at",
        "label": "Waktu Mulai Tercatat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "finished_at",
        "label": "Waktu Selesai Tercatat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "recorded_status",
        "label": "Status Hasil Tercatat",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "SUCCEEDED",
          "FAILED",
          "CANCELLED"
        ]
      }
    ],
    "updateFields": [],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "ci_run_id",
        "label": "Referensi Riwayat CI",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/ci-runs",
          "identifier": "ci_run_id",
          "label": "ci_run_id"
        }
      },
      {
        "name": "pipeline_id",
        "label": "Referensi Pipeline",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/cicd-pipelines",
          "identifier": "pipeline_id",
          "label": "name"
        }
      },
      {
        "name": "external_run_id",
        "label": "ID Eksekusi Sumber",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "commit_sha",
        "label": "Commit SHA",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "started_at",
        "label": "Waktu Mulai Tercatat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "finished_at",
        "label": "Waktu Selesai Tercatat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": true
  }, itApi.ci_runs),
  releases: defineResource({
    "key": "releases",
    "domain": "it",
    "title": "Catatan Rilis",
    "identifier": "it_release_id",
    "createFields": [
      {"name": "ci_run_id", "label": "Hasil CI", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/it/ci-runs", "identifier": "ci_run_id", "label": "ci_run_id"}},
      {"name": "deployment_reference", "label": "Bukti Deployment", "required": false, "nullable": true, "type": "text"},
      {"name": "verification_notes", "label": "Hasil Verifikasi", "required": false, "nullable": true, "type": "text"},
      {
        "name": "repository_id",
        "label": "Referensi Repository",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/repositories",
          "identifier": "repository_id",
          "label": "name"
        }
      },
      {
        "name": "version",
        "label": "Versi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment_id",
        "label": "Referensi Lingkungan",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/environments",
          "identifier": "environment_id",
          "label": "name"
        }
      }
    ],
    "updateFields": [
      {"name": "ci_run_id", "label": "Hasil CI", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/it/ci-runs", "identifier": "ci_run_id", "label": "ci_run_id"}},
      {"name": "deployment_reference", "label": "Bukti Deployment", "required": false, "nullable": true, "type": "text"},
      {"name": "verification_notes", "label": "Hasil Verifikasi", "required": false, "nullable": true, "type": "text"},
      {
        "name": "version",
        "label": "Versi",
        "required": true,
        "nullable": false,
        "type": "text"
      }
    ],
    "columns": [
      {"name": "ci_run_id", "label": "Hasil CI", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/it/ci-runs", "identifier": "ci_run_id", "label": "ci_run_id"}},
      {"name": "deployment_reference", "label": "Bukti Deployment", "required": false, "nullable": true, "type": "text"},
      {"name": "verification_notes", "label": "Hasil Verifikasi", "required": false, "nullable": true, "type": "text"},
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "it_release_id",
        "label": "Referensi It Release",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/releases",
          "identifier": "it_release_id",
          "label": "version"
        }
      },
      {
        "name": "repository_id",
        "label": "Referensi Repository",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/repositories",
          "identifier": "repository_id",
          "label": "name"
        }
      },
      {
        "name": "version",
        "label": "Versi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "environment_id",
        "label": "Referensi Lingkungan",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/environments",
          "identifier": "environment_id",
          "label": "name"
        }
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "released_at",
        "label": "Waktu Rilis Tercatat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.releases),
  technical_debts: defineResource({
    "key": "technical_debts",
    "domain": "it",
    "title": "Utang Teknis",
    "identifier": "technical_debt_id",
    "createFields": [
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "priority",
        "label": "Prioritas",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      }
    ],
    "updateFields": [
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "priority",
        "label": "Prioritas",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "technical_debt_id",
        "label": "Referensi Utang Teknis",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/technical-debts",
          "identifier": "technical_debt_id",
          "label": "title"
        }
      },
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "priority",
        "label": "Prioritas",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "owner_actor_id",
        "label": "Penulis Rekaman",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.technical_debts),
  service_monitors: defineResource({
    "key": "service_monitors",
    "domain": "it",
    "title": "Pemantauan Tercatat",
    "identifier": "service_monitor_id",
    "createFields": [
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "check_type",
        "label": "Jenis Pemeriksaan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "target",
        "label": "Target Pemeriksaan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "last_checked_at",
        "label": "Waktu Pemeriksaan Sumber",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "recorded_status",
        "label": "Status Hasil Tercatat",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "UNKNOWN",
          "UP",
          "DOWN",
          "DEGRADED"
        ]
      }
    ],
    "updateFields": [],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "service_monitor_id",
        "label": "Referensi Pemantauan Tercatat",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/service-monitors",
          "identifier": "service_monitor_id",
          "label": "name"
        }
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "check_type",
        "label": "Jenis Pemeriksaan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "target",
        "label": "Target Pemeriksaan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "last_checked_at",
        "label": "Waktu Pemeriksaan Sumber",
        "required": true,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": true
  }, itApi.service_monitors),
  incidents: defineResource({
    "key": "incidents",
    "domain": "it",
    "title": "Insiden",
    "identifier": "incident_id",
    "createFields": [
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "severity",
        "label": "Severity",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "severity",
        "label": "Severity",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "incident_id",
        "label": "Referensi Insiden",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/incidents",
          "identifier": "incident_id",
          "label": "title"
        }
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "severity",
        "label": "Severity",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "owner_actor_id",
        "label": "Penulis Rekaman",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.incidents),
  security_findings: defineResource({
    "key": "security_findings",
    "domain": "it",
    "title": "Temuan Keamanan",
    "identifier": "security_finding_id",
    "createFields": [
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "severity",
        "label": "Severity",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "severity",
        "label": "Severity",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "security_finding_id",
        "label": "Referensi Temuan Keamanan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/security-findings",
          "identifier": "security_finding_id",
          "label": "title"
        }
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "severity",
        "label": "Severity",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ]
      },
      {
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "owner_actor_id",
        "label": "Penulis Rekaman",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.security_findings),
  backup_policies: defineResource({
    "key": "backup_policies",
    "domain": "it",
    "title": "Kebijakan Backup",
    "identifier": "backup_policy_id",
    "createFields": [
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "frequency",
        "label": "Frekuensi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "retention_days",
        "label": "Hari Retensi",
        "required": true,
        "nullable": false,
        "type": "integer"
      }
    ],
    "updateFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "frequency",
        "label": "Frekuensi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "retention_days",
        "label": "Hari Retensi",
        "required": true,
        "nullable": false,
        "type": "integer"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "backup_policy_id",
        "label": "Referensi Backup Policy",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/backup-policies",
          "identifier": "backup_policy_id",
          "label": "name"
        }
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "frequency",
        "label": "Frekuensi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "retention_days",
        "label": "Hari Retensi",
        "required": true,
        "nullable": false,
        "type": "integer"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.backup_policies),
  backup_runs: defineResource({
    "key": "backup_runs",
    "domain": "it",
    "title": "Riwayat Backup",
    "identifier": "backup_run_id",
    "createFields": [
      {
        "name": "backup_policy_id",
        "label": "Referensi Backup Policy",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/backup-policies",
          "identifier": "backup_policy_id",
          "label": "name"
        }
      },
      {
        "name": "started_at",
        "label": "Waktu Mulai Tercatat",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "finished_at",
        "label": "Waktu Selesai Tercatat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "artifact_ref",
        "label": "Referensi Artefak",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "recorded_status",
        "label": "Status Hasil Tercatat",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "SUCCEEDED",
          "FAILED",
          "CANCELLED"
        ]
      }
    ],
    "updateFields": [],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "backup_run_id",
        "label": "Referensi Riwayat Backup",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/backup-runs",
          "identifier": "backup_run_id",
          "label": "backup_run_id"
        }
      },
      {
        "name": "backup_policy_id",
        "label": "Referensi Backup Policy",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/backup-policies",
          "identifier": "backup_policy_id",
          "label": "name"
        }
      },
      {
        "name": "started_at",
        "label": "Waktu Mulai Tercatat",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "finished_at",
        "label": "Waktu Selesai Tercatat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "artifact_ref",
        "label": "Referensi Artefak",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": true
  }, itApi.backup_runs),
  restore_tests: defineResource({
    "key": "restore_tests",
    "domain": "it",
    "title": "Bukti Uji Restore",
    "identifier": "restore_test_id",
    "createFields": [
      {
        "name": "backup_run_id",
        "label": "Referensi Riwayat Backup",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/backup-runs",
          "identifier": "backup_run_id",
          "label": "backup_run_id"
        }
      },
      {
        "name": "tested_at",
        "label": "Waktu Uji Tercatat",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "result",
        "label": "Hasil",
        "required": true,
        "nullable": false,
        "type": "text",
        "options": [
          "PASSED",
          "FAILED",
          "INCONCLUSIVE"
        ]
      },
      {
        "name": "notes",
        "label": "Catatan",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "restore_test_id",
        "label": "Referensi Bukti Uji Restore",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/restore-tests",
          "identifier": "restore_test_id",
          "label": "restore_test_id"
        }
      },
      {
        "name": "backup_run_id",
        "label": "Referensi Riwayat Backup",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/backup-runs",
          "identifier": "backup_run_id",
          "label": "backup_run_id"
        }
      },
      {
        "name": "tested_at",
        "label": "Waktu Uji Tercatat",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "result",
        "label": "Hasil",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "notes",
        "label": "Catatan",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": true
  }, itApi.restore_tests),
  dr_plans: defineResource({
    "key": "dr_plans",
    "domain": "it",
    "title": "Rencana Pemulihan",
    "identifier": "dr_plan_id",
    "createFields": [
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rto_minutes",
        "label": "RTO Menit Tercatat",
        "required": false,
        "nullable": true,
        "type": "integer"
      },
      {
        "name": "rpo_minutes",
        "label": "RPO Menit Tercatat",
        "required": false,
        "nullable": true,
        "type": "integer"
      }
    ],
    "updateFields": [
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rto_minutes",
        "label": "RTO Menit Tercatat",
        "required": false,
        "nullable": true,
        "type": "integer"
      },
      {
        "name": "rpo_minutes",
        "label": "RPO Menit Tercatat",
        "required": false,
        "nullable": true,
        "type": "integer"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Perusahaan",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Ruang Kerja",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "dr_plan_id",
        "label": "Referensi Rencana Pemulihan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/dr-plans",
          "identifier": "dr_plan_id",
          "label": "name"
        }
      },
      {
        "name": "system_id",
        "label": "Referensi Sistem & Aplikasi",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/it/systems",
          "identifier": "system_id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Nama",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rto_minutes",
        "label": "RTO Menit Tercatat",
        "required": false,
        "nullable": true,
        "type": "integer"
      },
      {
        "name": "rpo_minutes",
        "label": "RPO Menit Tercatat",
        "required": false,
        "nullable": true,
        "type": "integer"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dicatat",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "updated_at",
        "label": "Diperbarui",
        "required": false,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "immutable": false
  }, itApi.dr_plans),
};
