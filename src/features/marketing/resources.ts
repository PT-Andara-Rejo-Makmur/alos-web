import { defineResource } from "@/features/business-records/resource";
import { marketingApi } from "./api";
export const marketingResources = {
    campaigns: defineResource({
        "key": "campaigns", "domain": "marketing", "title": "Campaign", "identifier": "campaign_id", "createFields": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "campaign_type", "label": "Jenis Campaign", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "start_date", "label": "Tanggal Mulai", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "end_date", "label": "Tanggal Selesai", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "budget", "label": "Anggaran Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "campaign_type", "label": "Jenis Campaign", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "start_date", "label": "Tanggal Mulai", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "end_date", "label": "Tanggal Selesai", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "budget", "label": "Anggaran Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "columns": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "campaign_type", "label": "Jenis Campaign", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "start_date", "label": "Tanggal Mulai", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "end_date", "label": "Tanggal Selesai", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "budget", "label": "Anggaran Tercatat", "required": true, "nullable": true, "type": "decimal"
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
    }, marketingApi.campaigns),
    channels: defineResource({
        "key": "channels", "domain": "marketing", "title": "Channel", "identifier": "channel_id", "createFields": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "channel_type", "label": "Jenis Channel", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "channel_type", "label": "Jenis Channel", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "channel_type", "label": "Jenis Channel", "required": true, "nullable": true, "type": "text"
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
    }, marketingApi.channels),
    attributions: defineResource({
        "key": "attributions", "domain": "marketing", "title": "Attribution Tercatat", "identifier": "attribution_id", "createFields": [
            {
                "name": "customer_id", "label": "Customer", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "lead_id", "label": "Lead", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/leads", "identifier": "lead_id", "label": "interest"
                }
            },
            {
                "name": "campaign_id", "label": "Campaign", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/campaigns", "identifier": "campaign_id", "label": "name"
                }
            },
            {
                "name": "channel_id", "label": "Channel", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/channels", "identifier": "channel_id", "label": "name"
                }
            },
            {
                "name": "touch_type", "label": "Jenis Kontak", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "occurred_at", "label": "Waktu Kejadian", "required": true, "nullable": false, "type": "datetime-local"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "customer_id", "label": "Customer", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/customers", "identifier": "customer_id", "label": "name"
                }
            },
            {
                "name": "lead_id", "label": "Lead", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/sales/leads", "identifier": "lead_id", "label": "interest"
                }
            },
            {
                "name": "campaign_id", "label": "Campaign", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/campaigns", "identifier": "campaign_id", "label": "name"
                }
            },
            {
                "name": "channel_id", "label": "Channel", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/channels", "identifier": "channel_id", "label": "name"
                }
            },
            {
                "name": "touch_type", "label": "Jenis Kontak", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "occurred_at", "label": "Waktu Kejadian", "required": true, "nullable": false, "type": "datetime-local"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": true
    }, marketingApi.attributions),
    contents: defineResource({
        "key": "contents", "domain": "marketing", "title": "Konten", "identifier": "content_id", "createFields": [
            {
                "name": "campaign_id", "label": "Campaign", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/campaigns", "identifier": "campaign_id", "label": "name"
                }
            },
            {
                "name": "title", "label": "Judul", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "content_type", "label": "Jenis Konten", "required": true, "nullable": false, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "title", "label": "Judul", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "content_type", "label": "Jenis Konten", "required": false, "nullable": false, "type": "text"
            }
        ], "columns": [
            {
                "name": "campaign_id", "label": "Campaign", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/marketing/campaigns", "identifier": "campaign_id", "label": "name"
                }
            },
            {
                "name": "title", "label": "Judul", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "content_type", "label": "Jenis Konten", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "published_at", "label": "Waktu Publikasi", "required": true, "nullable": true, "type": "datetime-local"
            },
            {
                "name": "created_at", "label": "Dicatat Pada", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Pembaruan Sumber", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, marketingApi.contents),
};
