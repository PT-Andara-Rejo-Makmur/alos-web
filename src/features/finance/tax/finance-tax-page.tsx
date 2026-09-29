"use client";

import { FinanceDataPage } from "../shared/finance-data-page";
import type { DataTableColumn, TabItem } from "@/components/ui";

interface TaxRow { readonly id: string; readonly type: string; readonly period: string; readonly transaction: string; readonly base: string; readonly amount: string; readonly due: string; readonly document: string; readonly payment: string; readonly reporting: string; readonly owner: string; }
const tabs: readonly TabItem[] = ["Kewajiban", "Jatuh Tempo", "Dokumen", "Pembayaran", "Pelaporan", "Riwayat"].map((label) => ({ id: label, label }));
const columns: readonly DataTableColumn<TaxRow>[] = ["Jenis", "Periode", "Transaksi Terkait", "Dasar Pajak", "Jumlah Pajak", "Jatuh Tempo", "Status Dokumen", "Status Pembayaran", "Status Pelaporan", "Penanggung Jawab"].map((header, index) => ({ header, key: `column-${index}`, render: (row) => Object.values(row)[index + 1] ?? "—" }));
export function FinanceTaxPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <FinanceDataPage caption="Pajak dan kewajiban" columns={columns} description="Pantau kewajiban pajak, dokumen, pembayaran, dan pelaporan setelah sumber resmi tersedia." emptyDescription="Data kewajiban pajak belum tersedia." rows={[]} tabs={tabs} title="Pajak & Kewajiban" workspaceKey={workspaceKey} />; }
