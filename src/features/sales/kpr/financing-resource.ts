import { defineResource, type Field } from "@/features/business-records/resource";
import { recordApi } from "@/features/business-records/record-api";
import type { SalesFinancingCreateRequest, SalesFinancingUpdateRequest, SalesFinancingProjection, SalesFinancingListProjection, SalesFinancingTransitionRequest } from "@/lib/contracts";

const fields = [
  { name: "bank_reference", label: "Bank dan rujukan pengajuan", type: "text", required: false, nullable: true },
  { name: "required_document_notes", label: "Dokumen yang perlu dilengkapi", type: "text", required: false, nullable: true },
  { name: "document_ids", label: "Dokumen pendukung", type: "text", required: false, nullable: false, relation: { path: "/api/v1/documents", identifier: "document_id", label: "title", multiple: true } },
  { name: "sp3k_reference", label: "Nomor SP3K", type: "text", required: false, nullable: true },
  { name: "sp3k_on", label: "Tanggal SP3K", type: "date", required: false, nullable: true },
  { name: "akad_on", label: "Tanggal akad terlaksana", type: "date", required: false, nullable: true },
  { name: "next_action", label: "Tindakan berikutnya", type: "text", required: true, nullable: false },
] as const satisfies readonly Field[];

export const financingResource = defineResource({
  key: "financing_contexts", domain: "sales", title: "KPR & Akad", identifier: "financing_id", immutable: false,
  createFields: [
    { name: "booking_id", label: "Booking yang dikonfirmasi", type: "text", required: true, nullable: false, relation: { path: "/api/v1/sales/bookings", identifier: "booking_id", label: "booking_date" } },
    { name: "payment_method", label: "Cara pembayaran", type: "text", required: true, nullable: false, options: ["CASH", "CASH_INSTALLMENT", "KPR"], optionLabels: { CASH: "Tunai", CASH_INSTALLMENT: "Tunai bertahap", KPR: "KPR" } }, ...fields,
  ], updateFields: fields,
  columns: [
    { name: "payment_method", label: "Cara pembayaran", type: "text", required: true, nullable: false },
    fields[0], fields[3], fields[5], fields[6],
  ],
}, recordApi<SalesFinancingCreateRequest, SalesFinancingUpdateRequest, SalesFinancingProjection, SalesFinancingListProjection, SalesFinancingTransitionRequest>("/api/v1/sales/financing-contexts"));
