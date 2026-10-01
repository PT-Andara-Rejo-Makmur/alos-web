import { defineResource } from "@/features/business-records/resource";
import type { SalesOpportunityPipelineRequest } from "@/lib/contracts";
import { salesApi } from "./api";
export const salesResources = {
    customers: defineResource({
        "key": "customers", "domain": "sales", "title": "Customer", "identifier": "customer_id", "createFields": [
            {
                "name": "customer_code", "label": "Kode Customer", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "customer_type", "label": "Jenis Customer", "required": false, "nullable": false, "type": "text", "options": ["INDIVIDUAL", "COMPANY"]
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "email", "label": "Email", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "phone", "label": "Telepon", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "customer_code", "label": "Kode Customer", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "customer_type", "label": "Jenis Customer", "required": false, "nullable": false, "type": "text", "options": ["INDIVIDUAL", "COMPANY"]
            },
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "email", "label": "Email", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "phone", "label": "Telepon", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "customer_code", "label": "Kode Customer", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "customer_type", "label": "Jenis Customer", "required": true, "nullable": false, "type": "text", "options": ["INDIVIDUAL", "COMPANY"]
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "email", "label": "Email", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "phone", "label": "Telepon", "required": true, "nullable": true, "type": "text"
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
    }, salesApi.customers),
    leads: defineResource({
        "key": "leads", "domain": "sales", "title": "Prospek & Lead", "identifier": "lead_id", "createFields": [
            {
                "name": "customer_id", "label": "Customer", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "source", "label": "Sumber Lead", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "interest", "label": "Minat", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "source", "label": "Sumber Lead", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "interest", "label": "Minat", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "source", "label": "Sumber Lead", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "interest", "label": "Minat", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "owner_actor_id", "label": "Pemilik Lead", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, salesApi.leads),
    opportunities: defineResource({
        pipeline: (identity, stage) => salesApi.advancePipeline(identity, {
            stage: stage as SalesOpportunityPipelineRequest["stage"]
        }), "key": "opportunities", "domain": "sales", "title": "Peluang Penjualan", "identifier": "opportunity_id", "createFields": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "lead_id", "label": "Lead", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/leads", "identifier": "lead_id", "label": "interest"
                }
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "stage", "label": "Tahapan Pipeline", "required": false, "nullable": false, "type": "text", "options": ["Lead"]
            },
            {
                "name": "estimated_value", "label": "Estimasi Nilai Tercatat", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "probability", "label": "Probabilitas Tercatat (%)", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "estimated_value", "label": "Estimasi Nilai Tercatat", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "probability", "label": "Probabilitas Tercatat (%)", "required": false, "nullable": true, "type": "decimal"
            }
        ], "columns": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "lead_id", "label": "Lead", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/leads", "identifier": "lead_id", "label": "interest"
                }
            },
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "stage", "label": "Tahapan Pipeline", "required": true, "nullable": false, "type": "text", "options": ["Lead", "Qualified", "Survey", "Booking", "SPK", "KPR", "SP3K", "Akad", "Closing"]
            },
            {
                "name": "estimated_value", "label": "Estimasi Nilai Tercatat", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "probability", "label": "Probabilitas Tercatat (%)", "required": true, "nullable": true, "type": "decimal"
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
    }, salesApi.opportunities),
    site_visits: defineResource({
        "key": "site_visits", "domain": "sales", "title": "Kunjungan Lokasi", "identifier": "site_visit_id", "createFields": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "scheduled_at", "label": "Jadwal", "required": true, "nullable": false, "type": "datetime-local"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "scheduled_at", "label": "Jadwal", "required": false, "nullable": false, "type": "datetime-local"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "scheduled_at", "label": "Jadwal", "required": true, "nullable": false, "type": "datetime-local"
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
    }, salesApi.site_visits),
    bookings: defineResource({
        "key": "bookings", "domain": "sales", "title": "Booking", "identifier": "booking_id", "createFields": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "booking_date", "label": "Tanggal Booking", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "booking_date", "label": "Tanggal Booking", "required": false, "nullable": false, "type": "date"
            }
        ], "columns": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "booking_date", "label": "Tanggal Booking", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": true, "type": "decimal"
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
    }, salesApi.bookings),
    closings: defineResource({
        "key": "closings", "domain": "sales", "title": "Catatan Closing", "identifier": "closing_id", "createFields": [
            {
                "name": "booking_id", "label": "Booking", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/bookings", "identifier": "booking_id", "label": "booking_date"
                }
            },
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "closing_date", "label": "Tanggal Closing", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "closing_date", "label": "Tanggal Closing", "required": false, "nullable": true, "type": "date"
            }
        ], "columns": [
            {
                "name": "booking_id", "label": "Booking", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/bookings", "identifier": "booking_id", "label": "booking_date"
                }
            },
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "closing_date", "label": "Tanggal Closing", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": true, "type": "decimal"
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
    }, salesApi.closings),
    customer_followups: defineResource({
        "key": "customer_followups", "domain": "sales", "title": "Follow-up", "identifier": "followup_id", "createFields": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "opportunity_id", "label": "Peluang", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/opportunities", "identifier": "opportunity_id", "label": "name"
                }
            },
            {
                "name": "followup_type", "label": "Jenis Follow-up", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "scheduled_at", "label": "Jadwal", "required": false, "nullable": true, "type": "datetime-local"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "followup_type", "label": "Jenis Follow-up", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "scheduled_at", "label": "Jadwal", "required": false, "nullable": true, "type": "datetime-local"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "opportunity_id", "label": "Peluang", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/opportunities", "identifier": "opportunity_id", "label": "name"
                }
            },
            {
                "name": "followup_type", "label": "Jenis Follow-up", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "scheduled_at", "label": "Jadwal", "required": true, "nullable": true, "type": "datetime-local"
            },
            {
                "name": "completed_at", "label": "Waktu Selesai", "required": true, "nullable": true, "type": "datetime-local"
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
    }, salesApi.customer_followups),
    customer_complaints: defineResource({
        "key": "customer_complaints", "domain": "sales", "title": "Keluhan Customer", "identifier": "complaint_id", "createFields": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "category", "label": "Kategori", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": false, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "category", "label": "Kategori", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": false, "type": "text"
            }
        ], "columns": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "category", "label": "Kategori", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "assigned_to", "label": "Penanggung Jawab", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, salesApi.customer_complaints),
    pricings: defineResource({
        "key": "pricings", "domain": "sales", "title": "Daftar Harga", "identifier": "pricing_id", "createFields": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "effective_from", "label": "Berlaku Mulai", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "effective_to", "label": "Berlaku Sampai", "required": false, "nullable": true, "type": "date"
            }
        ], "updateFields": [
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "effective_from", "label": "Berlaku Mulai", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "effective_to", "label": "Berlaku Sampai", "required": false, "nullable": true, "type": "date"
            }
        ], "columns": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "effective_from", "label": "Berlaku Mulai", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "effective_to", "label": "Berlaku Sampai", "required": true, "nullable": true, "type": "date"
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
    }, salesApi.pricings),
    pricing_items: defineResource({
        "key": "pricing_items", "domain": "sales", "title": "Rincian Harga", "identifier": "pricing_item_id", "createFields": [
            {
                "name": "pricing_id", "label": "Daftar Harga", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/pricings", "identifier": "pricing_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "price", "label": "Harga", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "currency", "label": "Mata Uang", "required": false, "nullable": false, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "price", "label": "Harga", "required": false, "nullable": false, "type": "decimal"
            }
        ], "columns": [
            {
                "name": "pricing_id", "label": "Daftar Harga", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/pricings", "identifier": "pricing_id", "label": "name"
                }
            },
            {
                "name": "property_unit_id", "label": "Unit Property", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/sales/property-units", "identifier": "property_unit_id", "label": "unit_code"
                }
            },
            {
                "name": "price", "label": "Harga", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "currency", "label": "Mata Uang", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, salesApi.pricing_items),
    collaterals: defineResource({
        "key": "collaterals", "domain": "sales", "title": "Materi Penjualan", "identifier": "collateral_id", "createFields": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "collateral_type", "label": "Jenis Materi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "campaign_id", "label": "Campaign", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/campaigns", "identifier": "campaign_id", "label": "name"
                }
            },
            {
                "name": "document_id", "label": "Dokumen Shared Work", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/documents", "identifier": "document_id", "label": "title", "array": true
                }
            }
        ], "updateFields": [
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "collateral_type", "label": "Jenis Materi", "required": false, "nullable": false, "type": "text"
            }
        ], "columns": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "collateral_type", "label": "Jenis Materi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "campaign_id", "label": "Campaign", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/campaigns", "identifier": "campaign_id", "label": "name"
                }
            },
            {
                "name": "document_id", "label": "Dokumen Shared Work", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/documents", "identifier": "document_id", "label": "title", "array": true
                }
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
    }, salesApi.collaterals),
};
