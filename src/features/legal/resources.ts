import { defineResource } from "@/features/business-records/resource";
import { legalApi } from "./api";

export const legalResources = {
  legal_reviews: defineResource({
  "key": "legal_reviews",
  "domain": "legal",
  "title": "Review Legal",
  "identifier": "legal_review_id",
  "createFields": [
    {
      "name": "contract_id",
      "label": "Contract Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number"
      }
    },
    {
      "name": "title",
      "label": "Title",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "review_summary",
      "label": "Review Summary",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "assessment",
      "label": "Assessment",
      "required": false,
      "nullable": true,
      "type": "text",
      "options": [
        "RECORDED_ISSUES",
        "NO_RECORDED_ISSUES",
        "INCONCLUSIVE"
      ]
    }
  ],
  "updateFields": [
    {
      "name": "title",
      "label": "Title",
      "required": false,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "review_summary",
      "label": "Review Summary",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "assessment",
      "label": "Assessment",
      "required": false,
      "nullable": true,
      "type": "text",
      "options": [
        "RECORDED_ISSUES",
        "NO_RECORDED_ISSUES",
        "INCONCLUSIVE"
      ]
    }
  ],
  "columns": [
    {
      "name": "contract_id",
      "label": "Contract Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number"
      }
    },
    {
      "name": "title",
      "label": "Title",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "review_summary",
      "label": "Review Summary",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "assessment",
      "label": "Assessment",
      "required": false,
      "nullable": true,
      "type": "text",
      "options": [
        "RECORDED_ISSUES",
        "NO_RECORDED_ISSUES",
        "INCONCLUSIVE"
      ]
    },
    {
      "name": "status",
      "label": "Status",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "tenant_id",
      "label": "Tenant Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "organization_id",
      "label": "Organization Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "workspace_id",
      "label": "Workspace Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "legal_review_id",
      "label": "Legal Review Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "created_at",
      "label": "Created At",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "updated_at",
      "label": "Updated At",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "reviewed_by",
      "label": "Reviewed By",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "reviewed_at",
      "label": "Reviewed At",
      "type": "text",
      "required": false,
      "nullable": false
    }
  ],
  "immutable": false
}, legalApi.legal_reviews),
  contract_revisions: defineResource({
  "key": "contract_revisions",
  "domain": "legal",
  "title": "Referensi Revisi Kontrak",
  "identifier": "contract_revision_id",
  "createFields": [
    {
      "name": "contract_id",
      "label": "Contract Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number"
      }
    },
    {
      "name": "document_id",
      "label": "Document Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/documents",
        "identifier": "document_id",
        "label": "title",
        "array": true
      }
    },
    {
      "name": "document_version",
      "label": "Document Version",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/documents/{document_id}/versions",
        "identifier": "version",
        "label": "version",
        "dependsOn": "document_id"
      }
    },
    {
      "name": "revision_number",
      "label": "Revision Number",
      "required": true,
      "nullable": false,
      "type": "integer"
    },
    {
      "name": "summary",
      "label": "Summary",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "recorded_on",
      "label": "Recorded On",
      "required": true,
      "nullable": false,
      "type": "date"
    }
  ],
  "updateFields": [],
  "columns": [
    {
      "name": "contract_id",
      "label": "Contract Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number"
      }
    },
    {
      "name": "document_id",
      "label": "Document Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/documents",
        "identifier": "document_id",
        "label": "title",
        "array": true
      }
    },
    {
      "name": "document_version",
      "label": "Document Version",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/documents/{document_id}/versions",
        "identifier": "version",
        "label": "version",
        "dependsOn": "document_id"
      }
    },
    {
      "name": "revision_number",
      "label": "Revision Number",
      "required": true,
      "nullable": false,
      "type": "integer"
    },
    {
      "name": "summary",
      "label": "Summary",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "recorded_on",
      "label": "Recorded On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "status",
      "label": "Status",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "tenant_id",
      "label": "Tenant Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "organization_id",
      "label": "Organization Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "workspace_id",
      "label": "Workspace Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "contract_revision_id",
      "label": "Contract Revision Id",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "created_at",
      "label": "Created At",
      "type": "text",
      "required": false,
      "nullable": false
    },
    {
      "name": "updated_at",
      "label": "Updated At",
      "type": "text",
      "required": false,
      "nullable": false
    }
  ],
  "immutable": true
}, legalApi.contract_revisions),

  permits: defineResource({
    "key": "permits",
    "domain": "legal",
    "title": "Perizinan",
    "identifier": "permit_id",
    "createFields": [
      {
        "name": "permit_type",
        "label": "Jenis Izin",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "permit_number",
        "label": "Nomor Izin",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "subject",
        "label": "Subjek",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "issued_at",
        "label": "Tanggal Terbit Tercatat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": false,
        "nullable": true,
        "type": "date"
      }
    ],
    "updateFields": [
      {
        "name": "permit_type",
        "label": "Jenis Izin",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "permit_number",
        "label": "Nomor Izin",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "subject",
        "label": "Subjek",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "issued_at",
        "label": "Tanggal Terbit Tercatat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": false,
        "nullable": true,
        "type": "date"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "permit_id",
        "label": "Referensi Perizinan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/permits",
          "identifier": "permit_id",
          "label": "permit_id"
        }
      },
      {
        "name": "permit_type",
        "label": "Jenis Izin",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "permit_number",
        "label": "Nomor Izin",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "subject",
        "label": "Subjek",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "issued_at",
        "label": "Tanggal Terbit Tercatat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": false,
        "nullable": true,
        "type": "date"
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
        "label": "Dibuat",
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
  }, legalApi.permits),
  contracts: defineResource({
    "key": "contracts",
    "domain": "legal",
    "title": "Kontrak & Perjanjian",
    "identifier": "contract_id",
    "createFields": [
      {
        "name": "contract_number",
        "label": "Nomor Kontrak",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "contract_type",
        "label": "Jenis Kontrak",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "counterparty_name",
        "label": "Pihak Lawan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "end_date",
        "label": "Tanggal Selesai",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "document_id",
        "label": "Dokumen Shared Work",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/documents",
          "identifier": "document_id",
          "label": "title"
        }
      }
    ],
    "updateFields": [
      {
        "name": "contract_number",
        "label": "Nomor Kontrak",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "contract_type",
        "label": "Jenis Kontrak",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "counterparty_name",
        "label": "Pihak Lawan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "end_date",
        "label": "Tanggal Selesai",
        "required": false,
        "nullable": true,
        "type": "date"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "contract_id",
        "label": "Referensi Kontrak & Perjanjian",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/contracts",
          "identifier": "contract_id",
          "label": "contract_id"
        }
      },
      {
        "name": "contract_number",
        "label": "Nomor Kontrak",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "contract_type",
        "label": "Jenis Kontrak",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "counterparty_name",
        "label": "Pihak Lawan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "end_date",
        "label": "Tanggal Selesai",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "document_id",
        "label": "Dokumen Shared Work",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/documents",
          "identifier": "document_id",
          "label": "title"
        }
      },
      {
        "name": "created_at",
        "label": "Dibuat",
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
  }, legalApi.contracts),
  land_documents: defineResource({
    "key": "land_documents",
    "domain": "legal",
    "title": "Dokumen Legalitas Aset",
    "identifier": "land_document_id",
    "createFields": [
      {
        "name": "property_ref",
        "label": "Referensi Properti Internal",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "document_type",
        "label": "Jenis Dokumen",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "document_number",
        "label": "Nomor Dokumen",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "holder_name",
        "label": "Nama Pemegang",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "issued_at",
        "label": "Tanggal Terbit Tercatat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "document_id",
        "label": "Dokumen Shared Work",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/documents",
          "identifier": "document_id",
          "label": "title"
        }
      }
    ],
    "updateFields": [
      {
        "name": "document_type",
        "label": "Jenis Dokumen",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "document_number",
        "label": "Nomor Dokumen",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "holder_name",
        "label": "Nama Pemegang",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "issued_at",
        "label": "Tanggal Terbit Tercatat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": false,
        "nullable": true,
        "type": "date"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "land_document_id",
        "label": "Referensi Dokumen Legalitas Aset",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/land-documents",
          "identifier": "land_document_id",
          "label": "land_document_id"
        }
      },
      {
        "name": "property_ref",
        "label": "Referensi Properti Internal",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "document_type",
        "label": "Jenis Dokumen",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "document_number",
        "label": "Nomor Dokumen",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "holder_name",
        "label": "Nama Pemegang",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "issued_at",
        "label": "Tanggal Terbit Tercatat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": false,
        "nullable": true,
        "type": "date"
      },
      {
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "document_id",
        "label": "Dokumen Shared Work",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/documents",
          "identifier": "document_id",
          "label": "title"
        }
      },
      {
        "name": "created_at",
        "label": "Dibuat",
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
  }, legalApi.land_documents),
  due_diligences: defineResource({
    "key": "due_diligences",
    "domain": "legal",
    "title": "Due Diligence",
    "identifier": "due_diligence_id",
    "createFields": [
      {
        "options": [
          "CONTRACT",
          "PERMIT",
          "LAND_DOCUMENT",
          "CASE"
        ],
        "name": "subject_type",
        "label": "Jenis Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "subject_id",
        "label": "Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number",
        "dependsOn": "subject_type",
        "variants": {
          "CONTRACT": {
            "path": "/api/v1/legal/contracts",
            "identifier": "contract_id",
            "label": "contract_number"
          },
          "PERMIT": {
            "path": "/api/v1/legal/permits",
            "identifier": "permit_id",
            "label": "permit_number"
          },
          "LAND_DOCUMENT": {
            "path": "/api/v1/legal/land-documents",
            "identifier": "land_document_id",
            "label": "document_number"
          },
          "CASE": {
            "path": "/api/v1/legal/cases",
            "identifier": "case_id",
            "label": "title"
          }
        }
      }
      },
      {
        "name": "title",
        "label": "Judul",
        "required": true,
        "nullable": false,
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
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "due_diligence_id",
        "label": "Referensi Due Diligence",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/due-diligences",
          "identifier": "due_diligence_id",
          "label": "title"
        }
      },
      {
        "options": [
          "CONTRACT",
          "PERMIT",
          "LAND_DOCUMENT",
          "CASE"
        ],
        "name": "subject_type",
        "label": "Jenis Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "subject_id",
        "label": "Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number",
        "dependsOn": "subject_type",
        "variants": {
          "CONTRACT": {
            "path": "/api/v1/legal/contracts",
            "identifier": "contract_id",
            "label": "contract_number"
          },
          "PERMIT": {
            "path": "/api/v1/legal/permits",
            "identifier": "permit_id",
            "label": "permit_number"
          },
          "LAND_DOCUMENT": {
            "path": "/api/v1/legal/land-documents",
            "identifier": "land_document_id",
            "label": "document_number"
          },
          "CASE": {
            "path": "/api/v1/legal/cases",
            "identifier": "case_id",
            "label": "title"
          }
        }
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
        "label": "Dibuat",
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
  }, legalApi.due_diligences),
  due_diligence_items: defineResource({
    "key": "due_diligence_items",
    "domain": "legal",
    "title": "Item Due Diligence",
    "identifier": "due_diligence_item_id",
    "createFields": [
      {
        "name": "due_diligence_id",
        "label": "Referensi Due Diligence",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/due-diligences",
          "identifier": "due_diligence_id",
          "label": "title"
        }
      },
      {
        "name": "item_type",
        "label": "Jenis Item",
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
        "name": "finding",
        "label": "Temuan Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "item_type",
        "label": "Jenis Item",
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
        "name": "finding",
        "label": "Temuan Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "due_diligence_item_id",
        "label": "Referensi Item Due Diligence",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/due-diligence-items",
          "identifier": "due_diligence_item_id",
          "label": "due_diligence_item_id"
        }
      },
      {
        "name": "due_diligence_id",
        "label": "Referensi Due Diligence",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/due-diligences",
          "identifier": "due_diligence_id",
          "label": "title"
        }
      },
      {
        "name": "item_type",
        "label": "Jenis Item",
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
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "finding",
        "label": "Temuan Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dibuat",
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
  }, legalApi.due_diligence_items),
  cases: defineResource({
    "key": "cases",
    "domain": "legal",
    "title": "Sengketa",
    "identifier": "case_id",
    "createFields": [
      {
        "name": "case_number",
        "label": "Nomor Sengketa",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "case_type",
        "label": "Jenis Sengketa",
        "required": true,
        "nullable": false,
        "type": "text"
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
      }
    ],
    "updateFields": [
      {
        "name": "case_number",
        "label": "Nomor Sengketa",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "case_type",
        "label": "Jenis Sengketa",
        "required": true,
        "nullable": false,
        "type": "text"
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
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "case_id",
        "label": "Referensi Sengketa",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/cases",
          "identifier": "case_id",
          "label": "title"
        }
      },
      {
        "name": "case_number",
        "label": "Nomor Sengketa",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "case_type",
        "label": "Jenis Sengketa",
        "required": true,
        "nullable": false,
        "type": "text"
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
        "label": "Dibuat",
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
  }, legalApi.cases),
  claim_reviews: defineResource({
    "key": "claim_reviews",
    "domain": "legal",
    "title": "Review Klaim",
    "identifier": "claim_review_id",
    "createFields": [
      {
        "options": [
          "CONTRACT",
          "PERMIT",
          "LAND_DOCUMENT",
          "CASE"
        ],
        "name": "subject_type",
        "label": "Jenis Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "subject_id",
        "label": "Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number",
        "dependsOn": "subject_type",
        "variants": {
          "CONTRACT": {
            "path": "/api/v1/legal/contracts",
            "identifier": "contract_id",
            "label": "contract_number"
          },
          "PERMIT": {
            "path": "/api/v1/legal/permits",
            "identifier": "permit_id",
            "label": "permit_number"
          },
          "LAND_DOCUMENT": {
            "path": "/api/v1/legal/land-documents",
            "identifier": "land_document_id",
            "label": "document_number"
          },
          "CASE": {
            "path": "/api/v1/legal/cases",
            "identifier": "case_id",
            "label": "title"
          }
        }
      }
      },
      {
        "name": "claimant_name",
        "label": "Pengaju Klaim",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "claim_amount",
        "label": "Nominal Klaim",
        "required": false,
        "nullable": true,
        "type": "decimal"
      },
      {
        "name": "assessment",
        "label": "Catatan Telaah",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "claimant_name",
        "label": "Pengaju Klaim",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "claim_amount",
        "label": "Nominal Klaim",
        "required": false,
        "nullable": true,
        "type": "decimal"
      },
      {
        "name": "assessment",
        "label": "Catatan Telaah",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "claim_review_id",
        "label": "Referensi Review Klaim",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/claim-reviews",
          "identifier": "claim_review_id",
          "label": "claim_review_id"
        }
      },
      {
        "options": [
          "CONTRACT",
          "PERMIT",
          "LAND_DOCUMENT",
          "CASE"
        ],
        "name": "subject_type",
        "label": "Jenis Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "subject_id",
        "label": "Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number",
        "dependsOn": "subject_type",
        "variants": {
          "CONTRACT": {
            "path": "/api/v1/legal/contracts",
            "identifier": "contract_id",
            "label": "contract_number"
          },
          "PERMIT": {
            "path": "/api/v1/legal/permits",
            "identifier": "permit_id",
            "label": "permit_number"
          },
          "LAND_DOCUMENT": {
            "path": "/api/v1/legal/land-documents",
            "identifier": "land_document_id",
            "label": "document_number"
          },
          "CASE": {
            "path": "/api/v1/legal/cases",
            "identifier": "case_id",
            "label": "title"
          }
        }
      }
      },
      {
        "name": "claimant_name",
        "label": "Pengaju Klaim",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "claim_amount",
        "label": "Nominal Klaim",
        "required": false,
        "nullable": true,
        "type": "decimal"
      },
      {
        "name": "assessment",
        "label": "Catatan Telaah",
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
        "label": "Dibuat",
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
  }, legalApi.claim_reviews),
  expiries: defineResource({
    "key": "expiries",
    "domain": "legal",
    "title": "Kewajiban & Tenggat",
    "identifier": "expiry_id",
    "createFields": [
      {
        "options": [
          "CONTRACT",
          "PERMIT",
          "LAND_DOCUMENT",
          "CASE"
        ],
        "name": "subject_type",
        "label": "Jenis Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "subject_id",
        "label": "Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number",
        "dependsOn": "subject_type",
        "variants": {
          "CONTRACT": {
            "path": "/api/v1/legal/contracts",
            "identifier": "contract_id",
            "label": "contract_number"
          },
          "PERMIT": {
            "path": "/api/v1/legal/permits",
            "identifier": "permit_id",
            "label": "permit_number"
          },
          "LAND_DOCUMENT": {
            "path": "/api/v1/legal/land-documents",
            "identifier": "land_document_id",
            "label": "document_number"
          },
          "CASE": {
            "path": "/api/v1/legal/cases",
            "identifier": "case_id",
            "label": "title"
          }
        }
      }
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "reminder_days",
        "label": "Hari Pengingat",
        "required": false,
        "nullable": false,
        "type": "integer"
      }
    ],
    "updateFields": [
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "reminder_days",
        "label": "Hari Pengingat",
        "required": false,
        "nullable": false,
        "type": "integer"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "expiry_id",
        "label": "Referensi Expiry",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/expiries",
          "identifier": "expiry_id",
          "label": "expiry_id"
        }
      },
      {
        "options": [
          "CONTRACT",
          "PERMIT",
          "LAND_DOCUMENT",
          "CASE"
        ],
        "name": "subject_type",
        "label": "Jenis Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "subject_id",
        "label": "Referensi Internal",
        "required": true,
        "nullable": false,
        "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "contract_number",
        "dependsOn": "subject_type",
        "variants": {
          "CONTRACT": {
            "path": "/api/v1/legal/contracts",
            "identifier": "contract_id",
            "label": "contract_number"
          },
          "PERMIT": {
            "path": "/api/v1/legal/permits",
            "identifier": "permit_id",
            "label": "permit_number"
          },
          "LAND_DOCUMENT": {
            "path": "/api/v1/legal/land-documents",
            "identifier": "land_document_id",
            "label": "document_number"
          },
          "CASE": {
            "path": "/api/v1/legal/cases",
            "identifier": "case_id",
            "label": "title"
          }
        }
      }
      },
      {
        "name": "expires_at",
        "label": "Tanggal Tenggat",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "reminder_days",
        "label": "Hari Pengingat",
        "required": false,
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
        "label": "Dibuat",
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
  }, legalApi.expiries),
  privacy_requests: defineResource({
    "key": "privacy_requests",
    "domain": "legal",
    "title": "Permintaan Privasi",
    "identifier": "privacy_request_id",
    "createFields": [
      {
        "name": "request_type",
        "label": "Jenis Permintaan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "requester_ref",
        "label": "Referensi Pemohon",
        "required": false,
        "nullable": true,
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
        "name": "due_at",
        "label": "Tenggat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      }
    ],
    "updateFields": [
      {
        "name": "request_type",
        "label": "Jenis Permintaan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "requester_ref",
        "label": "Referensi Pemohon",
        "required": false,
        "nullable": true,
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
        "name": "due_at",
        "label": "Tenggat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "privacy_request_id",
        "label": "Referensi Permintaan Privasi",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/privacy-requests",
          "identifier": "privacy_request_id",
          "label": "privacy_request_id"
        }
      },
      {
        "name": "request_type",
        "label": "Jenis Permintaan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "requester_ref",
        "label": "Referensi Pemohon",
        "required": false,
        "nullable": true,
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
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "due_at",
        "label": "Tenggat",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "created_at",
        "label": "Dibuat",
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
  }, legalApi.privacy_requests),
  risks: defineResource({
    "key": "risks",
    "domain": "legal",
    "title": "Risiko",
    "identifier": "risk_id",
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
        "name": "likelihood",
        "label": "Kemungkinan Explicit",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "impact",
        "label": "Dampak Explicit",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rating",
        "label": "Rating Explicit",
        "required": true,
        "nullable": false,
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
        "name": "description",
        "label": "Deskripsi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "likelihood",
        "label": "Kemungkinan Explicit",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "impact",
        "label": "Dampak Explicit",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rating",
        "label": "Rating Explicit",
        "required": true,
        "nullable": false,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "risk_id",
        "label": "Referensi Risiko",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/risks",
          "identifier": "risk_id",
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
        "name": "likelihood",
        "label": "Kemungkinan Explicit",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "impact",
        "label": "Dampak Explicit",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rating",
        "label": "Rating Explicit",
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
        "name": "owner_actor_id",
        "label": "Penulis Rekaman",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dibuat",
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
  }, legalApi.risks),
  controls: defineResource({
    "key": "controls",
    "domain": "legal",
    "title": "Kontrol Internal",
    "identifier": "control_id",
    "createFields": [
      {
        "name": "control_code",
        "label": "Kode Kontrol",
        "required": true,
        "nullable": false,
        "type": "text"
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
        "name": "frequency",
        "label": "Frekuensi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "control_code",
        "label": "Kode Kontrol",
        "required": true,
        "nullable": false,
        "type": "text"
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
        "name": "frequency",
        "label": "Frekuensi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {
        "name": "tenant_id",
        "label": "Tenant",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "organization_id",
        "label": "Organisasi",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "workspace_id",
        "label": "Workspace",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "control_id",
        "label": "Referensi Kontrol Internal",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/legal/controls",
          "identifier": "control_id",
          "label": "title"
        }
      },
      {
        "name": "control_code",
        "label": "Kode Kontrol",
        "required": true,
        "nullable": false,
        "type": "text"
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
        "name": "frequency",
        "label": "Frekuensi",
        "required": false,
        "nullable": true,
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
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "created_at",
        "label": "Dibuat",
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
  }, legalApi.controls),
};
