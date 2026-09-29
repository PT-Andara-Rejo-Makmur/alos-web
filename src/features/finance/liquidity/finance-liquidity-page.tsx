"use client";

import { FinanceDataPage } from "../shared/finance-data-page";
import type { DataTableColumn, TabItem } from "@/components/ui";

interface AccountRow { readonly id: string; readonly account: string; readonly institution: string; readonly type: string; readonly currency: string; readonly balance: string; readonly available: string; readonly pending: string; readonly reconciled: string; readonly sourceStatus: string; }
const tabs: readonly TabItem[] = ["Posisi Kas", "Rekening", "Arus Kas", "Perkiraan", "Riwayat"].map((label) => ({ id: label, label }));
const columns: readonly DataTableColumn<AccountRow>[] = [
  { header: "Rekening", key: "account", render: (row) => row.account }, { header: "Institusi", key: "institution", render: (row) => row.institution }, { header: "Tipe", key: "type", render: (row) => row.type }, { header: "Mata Uang", key: "currency", render: (row) => row.currency }, { header: "Saldo Buku", key: "balance", render: (row) => row.balance }, { header: "Saldo Tersedia", key: "available", render: (row) => row.available }, { header: "Pending", key: "pending", render: (row) => row.pending }, { header: "Terakhir Direkonsiliasi", key: "reconciled", render: (row) => row.reconciled }, { header: "Status Sumber", key: "sourceStatus", render: (row) => row.sourceStatus },
];
export function FinanceLiquidityPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <FinanceDataPage caption="Rekening dan posisi kas" columns={columns} description="Pantau posisi kas, rekening, dan arus dana tanpa membuat saldo baru dari tampilan." emptyDescription="Saldo rekening dan arus kas belum tersedia." rows={[]} tabs={tabs} title="Kas & Likuiditas" workspaceKey={workspaceKey} />; }
