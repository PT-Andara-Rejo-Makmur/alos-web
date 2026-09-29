"use client";

import { FinanceDataPage } from "../shared/finance-data-page";
import type { DataTableColumn, TabItem } from "@/components/ui";

interface ReconciliationRow { readonly id: string; readonly date: string; readonly account: string; readonly description: string; readonly amount: string; readonly related: string; readonly status: string; readonly difference: string; readonly reviewer: string; }
const tabs: readonly TabItem[] = ["Belum Dicocokkan", "Cocok", "Perlu Review", "Selisih", "Riwayat"].map((label) => ({ id: label, label }));
const columns: readonly DataTableColumn<ReconciliationRow>[] = ["Tanggal Transaksi", "Rekening", "Deskripsi", "Jumlah", "Objek Terkait", "Status Pencocokan", "Selisih", "Peninjau"].map((header, index) => ({ header, key: `column-${index}`, render: (row) => Object.values(row)[index + 1] ?? "—" }));
export function FinanceReconciliationPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <FinanceDataPage caption="Rekonsiliasi keuangan" columns={columns} description="Pantau pencocokan transaksi dan selisih yang menunggu telaah manusia." emptyDescription="Data rekonsiliasi belum tersedia." rows={[]} tabs={tabs} title="Rekonsiliasi" workspaceKey={workspaceKey} />; }
