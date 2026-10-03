import { defineResource } from "@/features/business-records/resource";
import { propertyApi } from "./api";
export const propertyResources = {
    property_units: defineResource({
        "key": "property_units", "domain": "property", "title": "Unit", "identifier": "property_unit_id", "createFields": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "unit_code", "label": "Kode Unit", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "unit_name", "label": "Nama Unit", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "unit_type", "label": "Jenis Unit", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "area_land", "label": "Luas Tanah", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "area_building", "label": "Luas Bangunan", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "unit_code", "label": "Kode Unit", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "unit_name", "label": "Nama Unit", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "unit_type", "label": "Jenis Unit", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "area_land", "label": "Luas Tanah", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "area_building", "label": "Luas Bangunan", "required": false, "nullable": true, "type": "decimal"
            }
        ], "columns": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "unit_code", "label": "Kode Unit", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "unit_name", "label": "Nama Unit", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "unit_type", "label": "Jenis Unit", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "area_land", "label": "Luas Tanah", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "area_building", "label": "Luas Bangunan", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, propertyApi.property_units),
    project_milestones: defineResource({
        "key": "project_milestones", "domain": "property", "title": "Milestone", "identifier": "milestone_id", "createFields": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "planned_date", "label": "Tanggal Rencana", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "actual_date", "label": "Tanggal Aktual", "required": false, "nullable": true, "type": "date"
            }
        ], "updateFields": [
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "planned_date", "label": "Tanggal Rencana", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "actual_date", "label": "Tanggal Aktual", "required": false, "nullable": true, "type": "date"
            }
        ], "columns": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "planned_date", "label": "Tanggal Rencana", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "actual_date", "label": "Tanggal Aktual", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, propertyApi.project_milestones),
    construction_packages: defineResource({
        "key": "construction_packages", "domain": "property", "title": "Paket Konstruksi", "identifier": "construction_package_id", "createFields": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "package_code", "label": "Kode Paket", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "contractor_name", "label": "Nama Kontraktor Tercatat", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "package_code", "label": "Kode Paket", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "contractor_name", "label": "Nama Kontraktor Tercatat", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "package_code", "label": "Kode Paket", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "contractor_name", "label": "Nama Kontraktor Tercatat", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, propertyApi.construction_packages),
    construction_updates: defineResource({
        "key": "construction_updates", "domain": "property", "title": "Pembaruan Konstruksi", "identifier": "construction_update_id", "createFields": [
            {
                "name": "construction_package_id", "label": "Paket Konstruksi", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/property/construction-packages", "identifier": "construction_package_id", "label": "name"
                }
            },
            {
                "name": "update_date", "label": "Tanggal Pembaruan", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "progress_percent", "label": "Progres Fisik Tercatat (%)", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "summary", "label": "Ringkasan", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "construction_package_id", "label": "Paket Konstruksi", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/property/construction-packages", "identifier": "construction_package_id", "label": "name"
                }
            },
            {
                "name": "update_date", "label": "Tanggal Pembaruan", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "progress_percent", "label": "Progres Fisik Tercatat (%)", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "summary", "label": "Ringkasan", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": true
    }, propertyApi.construction_updates),
    quality_inspections: defineResource({
        "key": "quality_inspections", "domain": "property", "title": "Inspeksi Mutu", "identifier": "inspection_id", "createFields": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "inspection_type", "label": "Jenis Inspeksi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "inspection_date", "label": "Tanggal Inspeksi", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "result", "label": "Hasil Inspeksi", "required": true, "nullable": false, "type": "text", "options": ["PASS", "FAIL", "NEEDS_REVIEW"]
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "inspection_type", "label": "Jenis Inspeksi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "inspection_date", "label": "Tanggal Inspeksi", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "inspector_actor_id", "label": "Inspektur", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "result", "label": "Hasil Inspeksi", "required": true, "nullable": false, "type": "text", "options": ["PASS", "FAIL", "NEEDS_REVIEW"]
            },
            {
                "name": "notes", "label": "Catatan", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": true
    }, propertyApi.quality_inspections),
    quality_ncrs: defineResource({
        "key": "quality_ncrs", "domain": "property", "title": "Temuan Mutu / NCR", "identifier": "ncr_id", "createFields": [
            {
                "name": "inspection_id", "label": "Inspeksi", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/property/quality-inspections", "identifier": "inspection_id", "label": "inspection_type"
                }
            },
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "title", "label": "Judul", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "severity", "label": "Severity Tercatat", "required": true, "nullable": false, "type": "text", "options": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
            },
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "title", "label": "Judul", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "inspection_id", "label": "Inspeksi", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/property/quality-inspections", "identifier": "inspection_id", "label": "inspection_type"
                }
            },
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "title", "label": "Judul", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "severity", "label": "Severity Tercatat", "required": true, "nullable": false, "type": "text", "options": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, propertyApi.quality_ncrs),
    safety_incidents: defineResource({
        "key": "safety_incidents", "domain": "property", "title": "Insiden Keselamatan", "identifier": "safety_incident_id", "createFields": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "incident_date", "label": "Tanggal Insiden", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "severity", "label": "Severity Tercatat", "required": true, "nullable": false, "type": "text", "options": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": false, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "incident_date", "label": "Tanggal Insiden", "required": false, "nullable": false, "type": "date"
            },
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": false, "type": "text"
            }
        ], "columns": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "incident_date", "label": "Tanggal Insiden", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "severity", "label": "Severity Tercatat", "required": true, "nullable": false, "type": "text", "options": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, propertyApi.safety_incidents),
    change_orders: defineResource({
  "key": "change_orders",
  "domain": "property",
  "title": "Change Order",
  "identifier": "change_order_id",
  "createFields": [
    {
      "name": "project_id",
      "label": "Proyek Shared Work",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/projects",
        "identifier": "project_id",
        "label": "name",
        "array": true
      }
    },
    {
      "name": "change_number",
      "label": "Nomor Perubahan",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "description",
      "label": "Deskripsi",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "amount_delta",
      "label": "Perubahan Nominal Tercatat",
      "required": false,
      "nullable": true,
      "type": "decimal"
    },
    {
      "name": "schedule_impact_days",
      "label": "Dampak jadwal (hari)",
      "required": false,
      "nullable": true,
      "type": "integer"
    },
    {
      "name": "contract_change_required",
      "label": "Memerlukan perubahan kontrak",
      "required": false,
      "nullable": false,
      "type": "boolean"
    },
    {
      "name": "related_contract_id",
      "label": "Kontrak terkait",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "title"
      }
    },
    {
      "name": "document_id",
      "label": "Dokumen pendukung",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/documents",
        "identifier": "document_id",
        "label": "title",
        "array": true
      }
    }
  ],
  "updateFields": [
    {
      "name": "change_number",
      "label": "Nomor Perubahan",
      "required": false,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "description",
      "label": "Deskripsi",
      "required": false,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "amount_delta",
      "label": "Perubahan Nominal Tercatat",
      "required": false,
      "nullable": true,
      "type": "decimal"
    },
    {
      "name": "schedule_impact_days",
      "label": "Dampak jadwal (hari)",
      "required": false,
      "nullable": true,
      "type": "integer"
    },
    {
      "name": "contract_change_required",
      "label": "Memerlukan perubahan kontrak",
      "required": false,
      "nullable": false,
      "type": "boolean"
    },
    {
      "name": "related_contract_id",
      "label": "Kontrak terkait",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "title"
      }
    },
    {
      "name": "document_id",
      "label": "Dokumen pendukung",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/documents",
        "identifier": "document_id",
        "label": "title",
        "array": true
      }
    }
  ],
  "columns": [
    {
      "name": "project_id",
      "label": "Proyek Shared Work",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/projects",
        "identifier": "project_id",
        "label": "name",
        "array": true
      }
    },
    {
      "name": "change_number",
      "label": "Nomor Perubahan",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "description",
      "label": "Deskripsi",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "amount_delta",
      "label": "Perubahan Nominal Tercatat",
      "required": true,
      "nullable": true,
      "type": "decimal"
    },
    {
      "name": "status",
      "label": "Status",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "created_at",
      "label": "Dicatat Pada",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "updated_at",
      "label": "Pembaruan Sumber",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "schedule_impact_days",
      "label": "Dampak jadwal (hari)",
      "required": false,
      "nullable": true,
      "type": "integer"
    },
    {
      "name": "contract_change_required",
      "label": "Memerlukan perubahan kontrak",
      "required": false,
      "nullable": false,
      "type": "boolean"
    },
    {
      "name": "related_contract_id",
      "label": "Kontrak terkait",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/legal/contracts",
        "identifier": "contract_id",
        "label": "title"
      }
    },
    {
      "name": "document_id",
      "label": "Dokumen pendukung",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/documents",
        "identifier": "document_id",
        "label": "title",
        "array": true
      }
    }
  ],
  "immutable": false
}, propertyApi.change_orders),
    payment_certificates: defineResource({
  "key": "payment_certificates",
  "domain": "property",
  "title": "Payment Certificate",
  "identifier": "payment_certificate_id",
  "createFields": [
      {"name": "document_id", "label": "Dokumen Pendukung", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/documents", "identifier": "document_id", "label": "title"}},
    {
      "name": "project_id",
      "label": "Proyek Shared Work",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/projects",
        "identifier": "project_id",
        "label": "name",
        "array": true
      }
    },
    {
      "name": "certificate_number",
      "label": "Nomor Sertifikat",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "period",
      "label": "Periode (YYYY-MM)",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "amount",
      "label": "Nominal Tercatat",
      "required": false,
      "nullable": true,
      "type": "decimal"
    },
    {
      "name": "construction_update_id",
      "label": "Bukti kemajuan pekerjaan",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/property/construction-updates",
        "identifier": "construction_update_id",
        "label": "summary"
      }
    }
  ],
  "updateFields": [
      {"name": "document_id", "label": "Dokumen Pendukung", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/documents", "identifier": "document_id", "label": "title"}},
    {
      "name": "certificate_number",
      "label": "Nomor Sertifikat",
      "required": false,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "period",
      "label": "Periode (YYYY-MM)",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "construction_update_id",
      "label": "Bukti kemajuan pekerjaan",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/property/construction-updates",
        "identifier": "construction_update_id",
        "label": "summary"
      }
    }
  ],
  "columns": [
      {"name": "document_id", "label": "Dokumen Pendukung", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/documents", "identifier": "document_id", "label": "title"}},
    {
      "name": "project_id",
      "label": "Proyek Shared Work",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/projects",
        "identifier": "project_id",
        "label": "name",
        "array": true
      }
    },
    {
      "name": "certificate_number",
      "label": "Nomor Sertifikat",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "period",
      "label": "Periode (YYYY-MM)",
      "required": true,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "amount",
      "label": "Nominal Tercatat",
      "required": true,
      "nullable": true,
      "type": "decimal"
    },
    {
      "name": "status",
      "label": "Status",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "created_at",
      "label": "Dicatat Pada",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "updated_at",
      "label": "Pembaruan Sumber",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "construction_update_id",
      "label": "Bukti kemajuan pekerjaan",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/property/construction-updates",
        "identifier": "construction_update_id",
        "label": "summary"
      }
    }
  ],
  "immutable": false
}, propertyApi.payment_certificates),
    project_handovers: defineResource({
        "key": "project_handovers", "domain": "property", "title": "Serah Terima", "identifier": "handover_id", "createFields": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "handover_type", "label": "Jenis Serah Terima", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "handover_date", "label": "Tanggal Serah Terima", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "handover_type", "label": "Jenis Serah Terima", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "handover_date", "label": "Tanggal Serah Terima", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "project_id", "label": "Proyek Shared Work", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/projects", "identifier": "project_id", "label": "name", "array": true
                }
            },
            {
                "name": "handover_type", "label": "Jenis Serah Terima", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "handover_date", "label": "Tanggal Serah Terima", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "notes", "label": "Catatan", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, propertyApi.project_handovers),
    land_pipeline: defineResource({
        "key": "land_pipeline", "domain": "property", "title": "Pipeline Lahan", "identifier": "land_pipeline_id", "createFields": [
            {
                "name": "location", "label": "Lokasi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "area", "label": "Luas", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "owner_name", "label": "Nama Pemilik Tercatat", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "estimated_value", "label": "Estimasi Nilai Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "location", "label": "Lokasi", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "area", "label": "Luas", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "owner_name", "label": "Nama Pemilik Tercatat", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "estimated_value", "label": "Estimasi Nilai Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "columns": [
            {
                "name": "location", "label": "Lokasi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "area", "label": "Luas", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "owner_name", "label": "Nama Pemilik Tercatat", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "stage", "label": "Tahapan Pipeline", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "estimated_value", "label": "Estimasi Nilai Tercatat", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, propertyApi.land_pipeline),
};
