import { defineResource } from "@/features/business-records/resource";
import { financeApi } from "./api";
export const financeResources = {
    bank_accounts: defineResource({
        "key": "bank_accounts", "domain": "finance", "title": "Rekening Bank Internal", "identifier": "bank_account_id", "createFields": [
            {
                "name": "account_name", "label": "Nama Rekening", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "bank_name", "label": "Nama Bank", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "account_number_masked", "label": "Nomor Rekening Tersamarkan", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "currency", "label": "Mata Uang", "required": false, "nullable": false, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "account_name", "label": "Nama Rekening", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "bank_name", "label": "Nama Bank", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "account_number_masked", "label": "Nomor Rekening Tersamarkan", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "account_name", "label": "Nama Rekening", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "bank_name", "label": "Nama Bank", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "account_number_masked", "label": "Nomor Rekening Tersamarkan", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "currency", "label": "Mata Uang", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.bank_accounts),
    bank_transactions: defineResource({
        "key": "bank_transactions", "domain": "finance", "title": "Transaksi Bank Tercatat", "identifier": "transaction_id", "createFields": [
            {
                "name": "bank_account_id", "label": "Rekening Bank", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/bank-accounts", "identifier": "bank_account_id", "label": "account_name"
                }
            },
            {
                "name": "transaction_date", "label": "Tanggal Transaksi", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "reference", "label": "Referensi", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "direction", "label": "Arah Transaksi", "required": true, "nullable": false, "type": "text", "options": ["IN", "OUT"]
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "currency", "label": "Mata Uang", "required": false, "nullable": false, "type": "text"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "bank_account_id", "label": "Rekening Bank", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/bank-accounts", "identifier": "bank_account_id", "label": "account_name"
                }
            },
            {
                "name": "transaction_date", "label": "Tanggal Transaksi", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "direction", "label": "Arah Transaksi", "required": true, "nullable": false, "type": "text", "options": ["IN", "OUT"]
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "currency", "label": "Mata Uang", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": true
    }, financeApi.bank_transactions),
    receivables: defineResource({
        "key": "receivables", "domain": "finance", "title": "Piutang", "identifier": "receivable_id", "createFields": [
            {
                "name": "customer_ref", "label": "Referensi Pelanggan Tercatat", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": false, "nullable": true, "type": "date"
            }
        ], "columns": [
            {
                "name": "customer_ref", "label": "Referensi Pelanggan Tercatat", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "outstanding_amount", "label": "Sisa Kewajiban Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.receivables),
    receivable_payments: defineResource({
        "key": "receivable_payments", "domain": "finance", "title": "Pembayaran Piutang", "identifier": "payment_id", "createFields": [
            {
                "name": "receivable_id", "label": "Piutang", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/receivables", "identifier": "receivable_id", "label": "reference"
                }
            },
            {
                "name": "payment_date", "label": "Tanggal Pembayaran", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": true, "type": "text"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "receivable_id", "label": "Piutang", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/receivables", "identifier": "receivable_id", "label": "reference"
                }
            },
            {
                "name": "payment_date", "label": "Tanggal Pembayaran", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": true
    }, financeApi.receivable_payments),
    payables: defineResource({
        "key": "payables", "domain": "finance", "title": "Utang / Kewajiban", "identifier": "payable_id", "createFields": [
            {
                "name": "vendor_ref", "label": "Referensi Vendor Tercatat", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "description", "label": "Deskripsi", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": false, "nullable": true, "type": "date"
            }
        ], "columns": [
            {
                "name": "vendor_ref", "label": "Referensi Vendor Tercatat", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "description", "label": "Deskripsi", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "outstanding_amount", "label": "Sisa Kewajiban Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.payables),
    payable_payments: defineResource({
        "key": "payable_payments", "domain": "finance", "title": "Pembayaran Utang", "identifier": "payment_id", "createFields": [
            {
                "name": "payable_id", "label": "Utang", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/payables", "identifier": "payable_id", "label": "reference"
                }
            },
            {
                "name": "payment_date", "label": "Tanggal Pembayaran", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": true, "type": "text"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "payable_id", "label": "Utang", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/payables", "identifier": "payable_id", "label": "reference"
                }
            },
            {
                "name": "payment_date", "label": "Tanggal Pembayaran", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "reference", "label": "Referensi", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": true
    }, financeApi.payable_payments),
    budgets: defineResource({
        "key": "budgets", "domain": "finance", "title": "Anggaran Internal", "identifier": "budget_id", "createFields": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "fiscal_year", "label": "Tahun Anggaran", "required": true, "nullable": false, "type": "integer"
            }
        ], "updateFields": [
            {
                "name": "name", "label": "Nama", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "fiscal_year", "label": "Tahun Anggaran", "required": false, "nullable": false, "type": "integer"
            }
        ], "columns": [
            {
                "name": "name", "label": "Nama", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "fiscal_year", "label": "Tahun Anggaran", "required": true, "nullable": false, "type": "integer"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.budgets),
    budget_lines: defineResource({
        "key": "budget_lines", "domain": "finance", "title": "Rincian Anggaran", "identifier": "budget_line_id", "createFields": [
            {
                "name": "budget_id", "label": "Anggaran", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/budgets", "identifier": "budget_id", "label": "name"
                }
            },
            {
                "name": "cost_center", "label": "Pusat Biaya", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "account_code", "label": "Kode Akun", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "period", "label": "Periode (YYYY-MM)", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "planned_amount", "label": "Nominal Rencana", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "revised_amount", "label": "Nominal Revisi", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "cost_center", "label": "Pusat Biaya", "required": false, "nullable": true, "type": "text"
            },
            {
                "name": "account_code", "label": "Kode Akun", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "planned_amount", "label": "Nominal Rencana", "required": false, "nullable": false, "type": "decimal"
            },
            {
                "name": "revised_amount", "label": "Nominal Revisi", "required": false, "nullable": true, "type": "decimal"
            }
        ], "columns": [
            {
                "name": "budget_id", "label": "Anggaran", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/budgets", "identifier": "budget_id", "label": "name"
                }
            },
            {
                "name": "cost_center", "label": "Pusat Biaya", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "account_code", "label": "Kode Akun", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "period", "label": "Periode (YYYY-MM)", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "planned_amount", "label": "Nominal Rencana", "required": true, "nullable": false, "type": "decimal"
            },
            {
                "name": "revised_amount", "label": "Nominal Revisi", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.budget_lines),
    reconciliations: defineResource({
        "key": "reconciliations", "domain": "finance", "title": "Rekonsiliasi", "identifier": "reconciliation_id", "createFields": [
            {
                "name": "bank_account_id", "label": "Rekening Bank", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/bank-accounts", "identifier": "bank_account_id", "label": "account_name"
                }
            },
            {
                "name": "period_start", "label": "Awal Periode", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "period_end", "label": "Akhir Periode", "required": true, "nullable": false, "type": "date"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "bank_account_id", "label": "Rekening Bank", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/bank-accounts", "identifier": "bank_account_id", "label": "account_name"
                }
            },
            {
                "name": "period_start", "label": "Awal Periode", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "period_end", "label": "Akhir Periode", "required": true, "nullable": false, "type": "date"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "reconciled_by", "label": "Direkonsiliasi Oleh", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "reconciled_at", "label": "Reconciled At", "required": true, "nullable": true, "type": "datetime-local"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.reconciliations),
    reconciliation_items: defineResource({
        "key": "reconciliation_items", "domain": "finance", "title": "Rincian Rekonsiliasi", "identifier": "reconciliation_item_id", "createFields": [
            {
                "name": "reconciliation_id", "label": "Rekonsiliasi", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/reconciliations", "identifier": "reconciliation_id", "label": "period_start"
                }
            },
            {
                "name": "transaction_id", "label": "Transaksi Bank", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/finance/bank-transactions", "identifier": "transaction_id", "label": "reference"
                }
            },
            {
                "name": "expected_amount", "label": "Nominal Ekspektasi", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "actual_amount", "label": "Nominal Aktual Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "expected_amount", "label": "Nominal Ekspektasi", "required": false, "nullable": true, "type": "decimal"
            },
            {
                "name": "actual_amount", "label": "Nominal Aktual Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "columns": [
            {
                "name": "reconciliation_id", "label": "Rekonsiliasi", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/reconciliations", "identifier": "reconciliation_id", "label": "period_start"
                }
            },
            {
                "name": "transaction_id", "label": "Transaksi Bank", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/finance/bank-transactions", "identifier": "transaction_id", "label": "reference"
                }
            },
            {
                "name": "expected_amount", "label": "Nominal Ekspektasi", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "actual_amount", "label": "Nominal Aktual Tercatat", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.reconciliation_items),
    tax_obligations: defineResource({
        "key": "tax_obligations", "domain": "finance", "title": "Kewajiban Pajak Internal", "identifier": "tax_obligation_id", "createFields": [
            {
                "name": "tax_type", "label": "Jenis Pajak", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "period", "label": "Periode (YYYY-MM)", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": false, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": false, "nullable": true, "type": "decimal"
            }
        ], "updateFields": [
            {
                "name": "tax_type", "label": "Jenis Pajak", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": false, "nullable": true, "type": "date"
            }
        ], "columns": [
            {
                "name": "tax_type", "label": "Jenis Pajak", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "period", "label": "Periode (YYYY-MM)", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "due_date", "label": "Tanggal Jatuh Tempo", "required": true, "nullable": true, "type": "date"
            },
            {
                "name": "amount", "label": "Nominal Tercatat", "required": true, "nullable": true, "type": "decimal"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.tax_obligations),
    tax_documents: defineResource({
        "key": "tax_documents", "domain": "finance", "title": "Dokumen Pajak Internal", "identifier": "tax_document_id", "createFields": [
            {
                "name": "tax_obligation_id", "label": "Kewajiban Pajak", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/tax-obligations", "identifier": "tax_obligation_id", "label": "tax_type"
                }
            },
            {
                "name": "document_id", "label": "Dokumen Pendukung", "required": false, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/documents", "identifier": "document_id", "label": "title", "array": true
                }
            },
            {
                "name": "document_type", "label": "Jenis Dokumen", "required": true, "nullable": false, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "document_type", "label": "Jenis Dokumen", "required": false, "nullable": false, "type": "text"
            }
        ], "columns": [
            {
                "name": "tax_obligation_id", "label": "Kewajiban Pajak", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/tax-obligations", "identifier": "tax_obligation_id", "label": "tax_type"
                }
            },
            {
                "name": "document_id", "label": "Dokumen Pendukung", "required": true, "nullable": true, "type": "text", "relation": {
                    "path": "/api/v1/documents", "identifier": "document_id", "label": "title", "array": true
                }
            },
            {
                "name": "document_type", "label": "Jenis Dokumen", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.tax_documents),
    month_closes: defineResource({
        "key": "month_closes", "domain": "finance", "title": "Penutupan Bulan Internal", "identifier": "month_close_id", "createFields": [
            {
                "name": "period", "label": "Periode (YYYY-MM)", "required": true, "nullable": false, "type": "text"
            }
        ], "updateFields": [], "columns": [
            {
                "name": "period", "label": "Periode (YYYY-MM)", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "opened_at", "label": "Opened At", "required": true, "nullable": false, "type": "datetime-local"
            },
            {
                "name": "closed_at", "label": "Closed At", "required": true, "nullable": true, "type": "datetime-local"
            },
            {
                "name": "closed_by", "label": "Ditutup Oleh", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.month_closes),
    month_close_items: defineResource({
        "key": "month_close_items", "domain": "finance", "title": "Checklist Penutupan Bulan", "identifier": "month_close_item_id", "createFields": [
            {
                "name": "month_close_id", "label": "Penutupan Bulan", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/month-closes", "identifier": "month_close_id", "label": "period"
                }
            },
            {
                "name": "item_type", "label": "Jenis Checklist", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "updateFields": [
            {
                "name": "item_type", "label": "Jenis Checklist", "required": false, "nullable": false, "type": "text"
            },
            {
                "name": "notes", "label": "Catatan", "required": false, "nullable": true, "type": "text"
            }
        ], "columns": [
            {
                "name": "month_close_id", "label": "Penutupan Bulan", "required": true, "nullable": false, "type": "text", "relation": {
                    "path": "/api/v1/finance/month-closes", "identifier": "month_close_id", "label": "period"
                }
            },
            {
                "name": "item_type", "label": "Jenis Checklist", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "status", "label": "Status", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "notes", "label": "Catatan", "required": true, "nullable": true, "type": "text"
            },
            {
                "name": "created_at", "label": "Dicatat", "required": true, "nullable": false, "type": "text"
            },
            {
                "name": "updated_at", "label": "Diperbarui", "required": true, "nullable": false, "type": "text"
            }
        ], "immutable": false
    }, financeApi.month_close_items),
};
