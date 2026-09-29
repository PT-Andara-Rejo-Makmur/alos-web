"use client";

import { Button, type DataTableColumn, type TabItem } from "@/components/ui";
import { FinanceDataPage } from "../shared/finance-data-page";
import { FinanceSectionNote } from "../shared/finance-ui";

interface ReconciliationRow { readonly id: string; readonly date: string; readonly account: string; readonly description: string; readonly amount: string; readonly related: string; readonly status: string; readonly difference: string; readonly reviewer: string; }
const tabs: readonly TabItem[] = ["Belum Dicocokkan", "Cocok", "Perlu Review", "Selisih", "Riwayat"].map((label) => ({ id: label, label }));
const columns: readonly DataTableColumn<ReconciliationRow>[] = ["Tanggal Transaksi", "Rekening", "Deskripsi", "Jumlah", "Objek Terkait", "Status Pencocokan", "Selisih", "Peninjau"].map((header, index) => ({ header, key: `column-${index}`, render: (row) => Object.values(row)[index + 1] ?? "—" }));
export function FinanceReconciliationPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <FinanceDataPage actions={<Button disabled title="Pilih transaksi setelah data tersedia">Konfirmasi Pencocokan</Button>} caption="Rekonsiliasi keuangan" columns={columns} description="Pantau pencocokan transaksi dan selisih yang menunggu telaah manusia." emptyDescription="Data rekonsiliasi belum tersedia." rows={[]} tabs={tabs} title="Rekonsiliasi" workspaceKey={workspaceKey}><FinanceSectionNote>Kandidat pencocokan tidak dibuat oleh halaman ini. Konfirmasi hanya dapat dilakukan setelah transaksi dan pilihan peninjau tersedia.</FinanceSectionNote></FinanceDataPage>; }
