import { defineResource } from "@/features/business-records/resource";
import { hrApi } from "./api";

export const hrResources = {
  facility_requests: defineResource({
  "key": "facility_requests",
  "domain": "hr",
  "title": "Permintaan Fasilitas",
  "identifier": "facility_request_id",
  "createFields": [
    {
      "name": "facility_code",
      "label": "Facility Code",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "title",
      "label": "Title",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "description",
      "label": "Description",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "needed_on",
      "label": "Needed On",
      "required": false,
      "nullable": true,
      "type": "date"
    },
    {
      "name": "resolution_notes",
      "label": "Resolution Notes",
      "required": false,
      "nullable": true,
      "type": "text"
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
      "name": "description",
      "label": "Description",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "needed_on",
      "label": "Needed On",
      "required": false,
      "nullable": true,
      "type": "date"
    },
    {
      "name": "resolution_notes",
      "label": "Resolution Notes",
      "required": false,
      "nullable": true,
      "type": "text"
    }
  ],
  "columns": [
    {
      "name": "facility_code",
      "label": "Facility Code",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "title",
      "label": "Title",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "description",
      "label": "Description",
      "required": false,
      "nullable": true,
      "type": "text"
    },
    {
      "name": "needed_on",
      "label": "Needed On",
      "required": false,
      "nullable": true,
      "type": "date"
    },
    {
      "name": "resolution_notes",
      "label": "Resolution Notes",
      "required": false,
      "nullable": true,
      "type": "text"
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
      "name": "facility_request_id",
      "label": "Facility Request Id",
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
  "immutable": false
}, hrApi.facility_requests),
  inventory_items: defineResource({
  "key": "inventory_items",
  "domain": "hr",
  "title": "Inventaris Tercatat",
  "identifier": "inventory_item_id",
  "createFields": [
    {
      "name": "asset_code",
      "label": "Asset Code",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "name",
      "label": "Name",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "condition",
      "label": "Condition",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "GOOD",
        "NEEDS_MAINTENANCE",
        "UNKNOWN"
      ]
    },
    {
      "name": "recorded_on",
      "label": "Recorded On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "notes",
      "label": "Notes",
      "required": false,
      "nullable": true,
      "type": "text"
    }
  ],
  "updateFields": [],
  "columns": [
    {
      "name": "asset_code",
      "label": "Asset Code",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "name",
      "label": "Name",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "condition",
      "label": "Condition",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "GOOD",
        "NEEDS_MAINTENANCE",
        "UNKNOWN"
      ]
    },
    {
      "name": "recorded_on",
      "label": "Recorded On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "notes",
      "label": "Notes",
      "required": false,
      "nullable": true,
      "type": "text"
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
      "name": "inventory_item_id",
      "label": "Inventory Item Id",
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
}, hrApi.inventory_items),
  asset_handovers: defineResource({
  "key": "asset_handovers",
  "domain": "hr",
  "title": "Serah Terima Aset",
  "identifier": "asset_handover_id",
  "createFields": [
    {
      "name": "inventory_item_id",
      "label": "Inventory Item Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/inventory-items",
        "identifier": "inventory_item_id",
        "label": "name"
      }
    },
    {
      "name": "employee_id",
      "label": "Employee Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/employees",
        "identifier": "employee_id",
        "label": "full_name"
      }
    },
    {
      "name": "handover_on",
      "label": "Handover On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "event",
      "label": "Event",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "GIVEN",
        "RETURNED"
      ]
    },
    {
      "name": "notes",
      "label": "Notes",
      "required": true,
      "nullable": false,
      "type": "text"
    }
  ],
  "updateFields": [],
  "columns": [
    {
      "name": "inventory_item_id",
      "label": "Inventory Item Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/inventory-items",
        "identifier": "inventory_item_id",
        "label": "name"
      }
    },
    {
      "name": "employee_id",
      "label": "Employee Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/employees",
        "identifier": "employee_id",
        "label": "full_name"
      }
    },
    {
      "name": "handover_on",
      "label": "Handover On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "event",
      "label": "Event",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "GIVEN",
        "RETURNED"
      ]
    },
    {
      "name": "notes",
      "label": "Notes",
      "required": true,
      "nullable": false,
      "type": "text"
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
      "name": "asset_handover_id",
      "label": "Asset Handover Id",
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
}, hrApi.asset_handovers),
  maintenance_records: defineResource({
  "key": "maintenance_records",
  "domain": "hr",
  "title": "Riwayat Pemeliharaan",
  "identifier": "maintenance_record_id",
  "createFields": [
    {
      "name": "inventory_item_id",
      "label": "Inventory Item Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/inventory-items",
        "identifier": "inventory_item_id",
        "label": "name"
      }
    },
    {
      "name": "performed_on",
      "label": "Performed On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "summary",
      "label": "Summary",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "result",
      "label": "Result",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "INSPECTED",
        "REPAIR_COMPLETED",
        "UNRESOLVED"
      ]
    }
  ],
  "updateFields": [],
  "columns": [
    {
      "name": "inventory_item_id",
      "label": "Inventory Item Id",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/inventory-items",
        "identifier": "inventory_item_id",
        "label": "name"
      }
    },
    {
      "name": "performed_on",
      "label": "Performed On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "summary",
      "label": "Summary",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "result",
      "label": "Result",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "INSPECTED",
        "REPAIR_COMPLETED",
        "UNRESOLVED"
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
      "name": "maintenance_record_id",
      "label": "Maintenance Record Id",
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
}, hrApi.maintenance_records),
  service_assessments: defineResource({
  "key": "service_assessments",
  "domain": "hr",
  "title": "Penilaian Kesiapan Layanan",
  "identifier": "service_assessment_id",
  "createFields": [
    {
      "name": "facility_code",
      "label": "Facility Code",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "assessed_on",
      "label": "Assessed On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "readiness",
      "label": "Readiness",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "READY",
        "NOT_READY",
        "UNKNOWN"
      ]
    },
    {
      "name": "notes",
      "label": "Notes",
      "required": true,
      "nullable": false,
      "type": "text"
    }
  ],
  "updateFields": [],
  "columns": [
    {
      "name": "facility_code",
      "label": "Facility Code",
      "required": true,
      "nullable": false,
      "type": "text"
    },
    {
      "name": "assessed_on",
      "label": "Assessed On",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "readiness",
      "label": "Readiness",
      "required": true,
      "nullable": false,
      "type": "text",
      "options": [
        "READY",
        "NOT_READY",
        "UNKNOWN"
      ]
    },
    {
      "name": "notes",
      "label": "Notes",
      "required": true,
      "nullable": false,
      "type": "text"
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
      "name": "service_assessment_id",
      "label": "Service Assessment Id",
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
}, hrApi.service_assessments),

  employees: defineResource({
    "key": "employees",
    "domain": "hr",
    "title": "Karyawan",
    "identifier": "employee_id",
    "createFields": [
      {
        "name": "employee_number",
        "label": "ID Karyawan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "full_name",
        "label": "Nama Lengkap",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "join_date",
        "label": "Tanggal Bergabung",
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
        "name": "department_code",
        "label": "Divisi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "position_title",
        "label": "Posisi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "employee_number",
        "label": "ID Karyawan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "full_name",
        "label": "Nama Lengkap",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "join_date",
        "label": "Tanggal Bergabung",
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
        "name": "department_code",
        "label": "Divisi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "position_title",
        "label": "Posisi",
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
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "actor_id",
        "label": "Aktor Terasosiasi (Identity)",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "employee_number",
        "label": "ID Karyawan",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "full_name",
        "label": "Nama Lengkap",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "employment_status",
        "label": "Status Kepegawaian",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "join_date",
        "label": "Tanggal Bergabung",
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
        "name": "department_code",
        "label": "Divisi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "position_title",
        "label": "Posisi",
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
  }, hrApi.employees),
  attendances: defineResource({
    "key": "attendances",
    "domain": "hr",
    "title": "Kehadiran Tercatat",
    "identifier": "attendance_id",
    "createFields": [
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "attendance_date",
        "label": "Tanggal Kehadiran",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "check_in_at",
        "label": "Jam Masuk",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "check_out_at",
        "label": "Jam Keluar",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "source",
        "label": "Sumber Tercatat",
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
          "PRESENT",
          "ABSENT",
          "LATE",
          "EXCUSED"
        ]
      }
    ],
    "updateFields": [],
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
        "name": "attendance_id",
        "label": "Referensi Kehadiran Tercatat",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/attendances",
          "identifier": "attendance_id",
          "label": "attendance_id"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "attendance_date",
        "label": "Tanggal Kehadiran",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "check_in_at",
        "label": "Jam Masuk",
        "required": false,
        "nullable": true,
        "type": "datetime-local"
      },
      {
        "name": "check_out_at",
        "label": "Jam Keluar",
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
        "name": "source",
        "label": "Sumber Tercatat",
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
    "immutable": true
  }, hrApi.attendances),
  leave_requests: defineResource({
    "key": "leave_requests",
    "domain": "hr",
    "title": "Permintaan Cuti",
    "identifier": "leave_request_id",
    "createFields": [
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "leave_type",
        "label": "Jenis Cuti",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "end_date",
        "label": "Tanggal Selesai",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "reason",
        "label": "Alasan",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "leave_type",
        "label": "Jenis Cuti",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "end_date",
        "label": "Tanggal Selesai",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "reason",
        "label": "Alasan",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {"name": "decision_reason", "label": "Alasan Keputusan", "required": false, "nullable": true, "type": "text"},
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
        "name": "leave_request_id",
        "label": "Referensi Permintaan Cuti",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/leave-requests",
          "identifier": "leave_request_id",
          "label": "leave_request_id"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "leave_type",
        "label": "Jenis Cuti",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "end_date",
        "label": "Tanggal Selesai",
        "required": true,
        "nullable": false,
        "type": "date"
      },
      {
        "name": "reason",
        "label": "Alasan",
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
        "name": "approved_by",
        "label": "Pemberi Persetujuan",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "approved_at",
        "label": "Waktu Persetujuan",
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
  }, hrApi.leave_requests),
  recruitments: defineResource({
    "key": "recruitments",
    "domain": "hr",
    "title": "Rekrutmen",
    "identifier": "recruitment_id",
    "createFields": [
      {"name": "headcount", "label": "Jumlah Kebutuhan", "required": false, "nullable": true, "type": "integer"},
      {"name": "reason", "label": "Alasan Kebutuhan", "required": false, "nullable": true, "type": "text"},
      {"name": "requesting_workspace_id", "label": "Divisi Pengaju", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/workspaces", "identifier": "workspace.workspace_id", "label": "workspace.workspace_name"}},
      {
        "name": "position_title",
        "label": "Posisi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "department_code",
        "label": "Divisi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "employment_type",
        "label": "Jenis Kepegawaian",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "opened_at",
        "label": "Waktu Dibuka",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      }
    ],
    "updateFields": [
      {"name": "headcount", "label": "Jumlah Kebutuhan", "required": false, "nullable": true, "type": "integer"},
      {"name": "reason", "label": "Alasan Kebutuhan", "required": false, "nullable": true, "type": "text"},
      {"name": "requesting_workspace_id", "label": "Divisi Pengaju", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/workspaces", "identifier": "workspace.workspace_id", "label": "workspace.workspace_name"}},
      {
        "name": "position_title",
        "label": "Posisi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "department_code",
        "label": "Divisi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "employment_type",
        "label": "Jenis Kepegawaian",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {"name": "headcount", "label": "Jumlah Kebutuhan", "required": false, "nullable": true, "type": "integer"},
      {"name": "reason", "label": "Alasan Kebutuhan", "required": false, "nullable": true, "type": "text"},
      {"name": "requesting_workspace_id", "label": "Divisi Pengaju", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/workspaces", "identifier": "workspace.workspace_id", "label": "workspace.workspace_name"}},
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
        "name": "recruitment_id",
        "label": "Referensi Rekrutmen",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/recruitments",
          "identifier": "recruitment_id",
          "label": "position_title"
        }
      },
      {
        "name": "position_title",
        "label": "Posisi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "department_code",
        "label": "Divisi",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "employment_type",
        "label": "Jenis Kepegawaian",
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
        "name": "opened_at",
        "label": "Waktu Dibuka",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "closed_at",
        "label": "Waktu Ditutup",
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
  }, hrApi.recruitments),
  candidates: defineResource({
    "key": "candidates",
    "domain": "hr",
    "title": "Kandidat",
    "identifier": "candidate_id",
    "createFields": [
      {
        "name": "recruitment_id",
        "label": "Referensi Rekrutmen",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/recruitments",
          "identifier": "recruitment_id",
          "label": "position_title"
        }
      },
      {
        "name": "full_name",
        "label": "Nama Lengkap",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "phone",
        "label": "Telepon",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "source",
        "label": "Sumber Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "full_name",
        "label": "Nama Lengkap",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "phone",
        "label": "Telepon",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "source",
        "label": "Sumber Tercatat",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "columns": [
      {"name": "employee_id", "label": "Karyawan Hasil Penerimaan", "required": false, "nullable": true, "type": "text", "relation": {"path": "/api/v1/hr/employees", "identifier": "employee_id", "label": "full_name"}},
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
        "name": "candidate_id",
        "label": "Referensi Kandidat",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/candidates",
          "identifier": "candidate_id",
          "label": "full_name"
        }
      },
      {
        "name": "recruitment_id",
        "label": "Referensi Rekrutmen",
        "required": false,
        "nullable": true,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/recruitments",
          "identifier": "recruitment_id",
          "label": "position_title"
        }
      },
      {
        "name": "full_name",
        "label": "Nama Lengkap",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "phone",
        "label": "Telepon",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "source",
        "label": "Sumber Tercatat",
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
  }, hrApi.candidates),
  interviews: defineResource({
    "key": "interviews",
    "domain": "hr",
    "title": "Interview",
    "identifier": "interview_id",
    "createFields": [
      {
        "name": "candidate_id",
        "label": "Referensi Kandidat",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/candidates",
          "identifier": "candidate_id",
          "label": "full_name"
        }
      },
      {
        "name": "scheduled_at",
        "label": "Jadwal Interview",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "notes",
        "label": "Catatan",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "scheduled_at",
        "label": "Jadwal Interview",
        "required": true,
        "nullable": false,
        "type": "datetime-local"
      },
      {
        "name": "notes",
        "label": "Catatan",
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
        "name": "interview_id",
        "label": "Referensi Interview",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/interviews",
          "identifier": "interview_id",
          "label": "interview_id"
        }
      },
      {
        "name": "candidate_id",
        "label": "Referensi Kandidat",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/candidates",
          "identifier": "candidate_id",
          "label": "full_name"
        }
      },
      {
        "name": "interviewer_actor_id",
        "label": "Penulis Interview",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "scheduled_at",
        "label": "Jadwal Interview",
        "required": true,
        "nullable": false,
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
        "name": "notes",
        "label": "Catatan",
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
  }, hrApi.interviews),
  onboardings: defineResource({
  "key": "onboardings",
  "domain": "hr",
  "title": "Onboarding",
  "identifier": "onboarding_id",
  "createFields": [
    {
      "name": "employee_id",
      "label": "Referensi Karyawan",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/employees",
        "identifier": "employee_id",
        "label": "full_name"
      }
    },
    {
      "name": "start_date",
      "label": "Tanggal Mulai",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "target_completion_date",
      "label": "Target Selesai",
      "required": false,
      "nullable": true,
      "type": "date"
    },
    {
      "name": "facility_request_id",
      "label": "Kesiapan fasilitas kerja",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/facility-requests",
        "identifier": "facility_request_id",
        "label": "title"
      }
    }
  ],
  "updateFields": [
    {
      "name": "start_date",
      "label": "Tanggal Mulai",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "target_completion_date",
      "label": "Target Selesai",
      "required": false,
      "nullable": true,
      "type": "date"
    },
    {
      "name": "facility_request_id",
      "label": "Kesiapan fasilitas kerja",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/facility-requests",
        "identifier": "facility_request_id",
        "label": "title"
      }
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
      "name": "onboarding_id",
      "label": "Referensi Onboarding",
      "required": false,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/onboardings",
        "identifier": "onboarding_id",
        "label": "onboarding_id"
      }
    },
    {
      "name": "employee_id",
      "label": "Referensi Karyawan",
      "required": true,
      "nullable": false,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/employees",
        "identifier": "employee_id",
        "label": "full_name"
      }
    },
    {
      "name": "start_date",
      "label": "Tanggal Mulai",
      "required": true,
      "nullable": false,
      "type": "date"
    },
    {
      "name": "target_completion_date",
      "label": "Target Selesai",
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
    },
    {
      "name": "facility_request_id",
      "label": "Kesiapan fasilitas kerja",
      "required": false,
      "nullable": true,
      "type": "text",
      "relation": {
        "path": "/api/v1/hr/facility-requests",
        "identifier": "facility_request_id",
        "label": "title"
      }
    }
  ],
  "immutable": false
}, hrApi.onboardings),
  performance_reviews: defineResource({
    "key": "performance_reviews",
    "domain": "hr",
    "title": "Review Kinerja",
    "identifier": "performance_review_id",
    "createFields": [
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "review_period",
        "label": "Periode Review",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rating",
        "label": "Rating Explicit",
        "required": false,
        "nullable": true,
        "type": "decimal"
      },
      {
        "name": "summary",
        "label": "Ringkasan",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "review_period",
        "label": "Periode Review",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "rating",
        "label": "Rating Explicit",
        "required": false,
        "nullable": true,
        "type": "decimal"
      },
      {
        "name": "summary",
        "label": "Ringkasan",
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
        "name": "performance_review_id",
        "label": "Referensi Review Kinerja",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/performance-reviews",
          "identifier": "performance_review_id",
          "label": "performance_review_id"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "review_period",
        "label": "Periode Review",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "reviewer_actor_id",
        "label": "Penulis Review",
        "required": false,
        "nullable": true,
        "type": "text"
      },
      {
        "name": "rating",
        "label": "Rating Explicit",
        "required": false,
        "nullable": true,
        "type": "decimal"
      },
      {
        "name": "summary",
        "label": "Ringkasan",
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
  }, hrApi.performance_reviews),
  trainings: defineResource({
    "key": "trainings",
    "domain": "hr",
    "title": "Pelatihan",
    "identifier": "training_id",
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
        "nullable": true,
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
        "nullable": true,
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
        "name": "training_id",
        "label": "Referensi Pelatihan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/trainings",
          "identifier": "training_id",
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
        "nullable": true,
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
  }, hrApi.trainings),
  training_enrollments: defineResource({
    "key": "training_enrollments",
    "domain": "hr",
    "title": "Peserta Pelatihan",
    "identifier": "training_enrollment_id",
    "createFields": [
      {
        "name": "training_id",
        "label": "Referensi Pelatihan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/trainings",
          "identifier": "training_id",
          "label": "name"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      }
    ],
    "updateFields": [],
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
        "name": "training_enrollment_id",
        "label": "Referensi Peserta Pelatihan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/training-enrollments",
          "identifier": "training_enrollment_id",
          "label": "training_enrollment_id"
        }
      },
      {
        "name": "training_id",
        "label": "Referensi Pelatihan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/trainings",
          "identifier": "training_id",
          "label": "name"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
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
        "name": "completed_at",
        "label": "Waktu Selesai",
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
  }, hrApi.training_enrollments),
  successions: defineResource({
    "key": "successions",
    "domain": "hr",
    "title": "Rencana Suksesi",
    "identifier": "succession_id",
    "createFields": [
      {
        "name": "position_title",
        "label": "Posisi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "department_code",
        "label": "Divisi",
        "required": false,
        "nullable": true,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "position_title",
        "label": "Posisi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "department_code",
        "label": "Divisi",
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
        "name": "succession_id",
        "label": "Referensi Rencana Suksesi",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/successions",
          "identifier": "succession_id",
          "label": "position_title"
        }
      },
      {
        "name": "position_title",
        "label": "Posisi",
        "required": true,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "department_code",
        "label": "Divisi",
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
  }, hrApi.successions),
  succession_candidates: defineResource({
    "key": "succession_candidates",
    "domain": "hr",
    "title": "Kandidat Suksesi",
    "identifier": "succession_candidate_id",
    "createFields": [
      {
        "name": "succession_id",
        "label": "Referensi Rencana Suksesi",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/successions",
          "identifier": "succession_id",
          "label": "position_title"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "readiness",
        "label": "Kesiapan Explicit",
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
      }
    ],
    "updateFields": [
      {
        "name": "readiness",
        "label": "Kesiapan Explicit",
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
        "name": "succession_candidate_id",
        "label": "Referensi Kandidat Suksesi",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/succession-candidates",
          "identifier": "succession_candidate_id",
          "label": "succession_candidate_id"
        }
      },
      {
        "name": "succession_id",
        "label": "Referensi Rencana Suksesi",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/successions",
          "identifier": "succession_id",
          "label": "position_title"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "readiness",
        "label": "Kesiapan Explicit",
        "required": true,
        "nullable": true,
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
  }, hrApi.succession_candidates),
  grievances: defineResource({
    "key": "grievances",
    "domain": "hr",
    "title": "Keluhan Karyawan",
    "identifier": "grievance_id",
    "createFields": [
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "category",
        "label": "Kategori",
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
      }
    ],
    "updateFields": [
      {
        "name": "category",
        "label": "Kategori",
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
        "name": "grievance_id",
        "label": "Referensi Keluhan Karyawan",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/grievances",
          "identifier": "grievance_id",
          "label": "grievance_id"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
      },
      {
        "name": "category",
        "label": "Kategori",
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
        "name": "status",
        "label": "Status",
        "required": false,
        "nullable": false,
        "type": "text"
      },
      {
        "name": "assigned_to",
        "label": "Penulis Keluhan",
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
  }, hrApi.grievances),
  employment_contracts: defineResource({
    "key": "employment_contracts",
    "domain": "hr",
    "title": "Kontrak Kerja",
    "identifier": "employment_contract_id",
    "createFields": [
      { "name": "legal_review_required", "label": "Perlu Pemeriksaan Legal", "required": false, "nullable": false, "type": "boolean" },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
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
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": true,
        "nullable": false,
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
      { "name": "document_id", "label": "Dokumen Pendukung", "required": false, "nullable": true, "type": "text", "relation": { "path": "/api/v1/documents", "identifier": "document_id", "label": "title" } },
      { "name": "legal_review_required", "label": "Perlu Pemeriksaan Legal", "required": false, "nullable": false, "type": "boolean" },
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
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": true,
        "nullable": false,
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
      {"name": "legal_review_required", "label": "Perlu Pemeriksaan Legal", "required": false, "nullable": false, "type": "boolean"},
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
        "name": "employment_contract_id",
        "label": "Referensi Kontrak Kerja",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employment-contracts",
          "identifier": "employment_contract_id",
          "label": "employment_contract_id"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
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
        "name": "start_date",
        "label": "Tanggal Mulai",
        "required": true,
        "nullable": false,
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
  }, hrApi.employment_contracts),
  personnel_files: defineResource({
    "key": "personnel_files",
    "domain": "hr",
    "title": "Arsip Personalia",
    "identifier": "personnel_file_id",
    "createFields": [
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
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
        "name": "file_type",
        "label": "Jenis Arsip",
        "required": true,
        "nullable": false,
        "type": "text"
      }
    ],
    "updateFields": [
      {
        "name": "file_type",
        "label": "Jenis Arsip",
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
        "name": "personnel_file_id",
        "label": "Referensi Arsip Personalia",
        "required": false,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/personnel-files",
          "identifier": "personnel_file_id",
          "label": "personnel_file_id"
        }
      },
      {
        "name": "employee_id",
        "label": "Referensi Karyawan",
        "required": true,
        "nullable": false,
        "type": "text",
        "relation": {
          "path": "/api/v1/hr/employees",
          "identifier": "employee_id",
          "label": "full_name"
        }
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
        "name": "file_type",
        "label": "Jenis Arsip",
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
  }, hrApi.personnel_files),
};
