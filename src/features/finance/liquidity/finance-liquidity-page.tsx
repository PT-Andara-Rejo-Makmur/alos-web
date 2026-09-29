"use client";

import { useState } from "react";
import { Button, type DataTableColumn } from "@/components/ui";
import { FinanceDataPage, type FinanceTab } from "../shared/finance-data-page";
import { FinanceExtractionDrawer } from "../shared/finance-ui";

interface LiquidityRow { readonly id: string; readonly account: string; readonly institution: string; readonly type: string; readonly currency: string; readonly balance: string; readonly available: string; readonly pending: string; readonly reconciled: string; readonly date: string; readonly category: string; readonly description: string; readonly inflow: string; readonly outflow: string; readonly forecast: string; readonly status: string; }
const positionColumns: readonly DataTableColumn<LiquidityRow>[] = [{ header: "Tanggal", key: "date", render: (row) => row.date }, { header: "Saldo Buku", key: "balance", render: (row) => row.balance }, { header: "Saldo Tersedia", key: "available", render: (row) => row.available }, { header: "Pending", key: "pending", render: (row) => row.pending }, { header: "Status Sumber", key: "status", render: (row) => row.status }];
const accountColumns: readonly DataTableColumn<LiquidityRow>[] = [{ header: "Rekening", key: "account", render: (row) => row.account }, { header: "Institusi", key: "institution", render: (row) => row.institution }, { header: "Tipe", key: "type", render: (row) => row.type }, { header: "Mata Uang", key: "currency", render: (row) => row.currency }, { header: "Saldo Buku", key: "balance", render: (row) => row.balance }, { header: "Saldo Tersedia", key: "available", render: (row) => row.available }, { header: "Pending", key: "pending", render: (row) => row.pending }, { header: "Terakhir Direkonsiliasi", key: "reconciled", render: (row) => row.reconciled }, { header: "Status Sumber", key: "status", render: (row) => row.status }];
const cashFlowColumns: readonly DataTableColumn<LiquidityRow>[] = [{ header: "Tanggal", key: "date", render: (row) => row.date }, { header: "Jenis", key: "category", render: (row) => row.category }, { header: "Deskripsi", key: "description", render: (row) => row.description }, { header: "Penerimaan", key: "inflow", render: (row) => row.inflow }, { header: "Pengeluaran", key: "outflow", render: (row) => row.outflow }, { header: "Status", key: "status", render: (row) => row.status }];
const forecastColumns: readonly DataTableColumn<LiquidityRow>[] = [{ header: "Periode", key: "date", render: (row) => row.date }, { header: "Perkiraan Masuk", key: "inflow", render: (row) => row.inflow }, { header: "Perkiraan Keluar", key: "outflow", render: (row) => row.outflow }, { header: "Saldo Perkiraan", key: "forecast", render: (row) => row.forecast }, { header: "Sumber", key: "status", render: (row) => row.status }];
const historyColumns: readonly DataTableColumn<LiquidityRow>[] = [{ header: "Tanggal", key: "date", render: (row) => row.date }, { header: "Peristiwa", key: "category", render: (row) => row.category }, { header: "Rekening", key: "account", render: (row) => row.account }, { header: "Jumlah", key: "balance", render: (row) => row.balance }, { header: "Status", key: "status", render: (row) => row.status }];

export function FinanceLiquidityPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  const [extractionOpen, setExtractionOpen] = useState(false);
  const action = <Button onClick={() => setExtractionOpen(true)} variant="secondary">Telaah Bank Statement</Button>;
  const tabs: readonly FinanceTab<LiquidityRow>[] = [
    { id: "position", label: "Posisi Kas", title: "Posisi Kas", description: "Ringkasan posisi kas berdasarkan sumber resmi.", caption: "Posisi kas", columns: positionColumns, emptyDescription: "Posisi kas belum tersedia.", rows: [] },
    { id: "accounts", label: "Rekening", title: "Rekening", description: "Daftar rekening dan status rekonsiliasinya.", caption: "Rekening keuangan", columns: accountColumns, emptyDescription: "Data rekening belum tersedia.", rows: [] },
    { id: "cash-flow", label: "Arus Kas", title: "Arus Kas", description: "Penerimaan dan pengeluaran kas berdasarkan transaksi resmi.", caption: "Arus kas", columns: cashFlowColumns, emptyDescription: "Arus kas belum tersedia.", actions: action, rows: [] },
    { id: "forecast", label: "Perkiraan", title: "Perkiraan Kas", description: "Perkiraan dipisahkan dari saldo dan arus kas aktual.", caption: "Perkiraan kas", columns: forecastColumns, emptyDescription: "Perkiraan kas belum tersedia.", rows: [] },
    { id: "history", label: "Riwayat", title: "Riwayat Kas", description: "Riwayat perubahan kas dan rekening yang telah tercatat.", caption: "Riwayat kas", columns: historyColumns, emptyDescription: "Riwayat kas belum tersedia.", actions: action, rows: [] },
  ];
  return <><FinanceDataPage description="Pantau posisi kas, rekening, dan arus dana tanpa membuat saldo baru dari tampilan." tabs={tabs} title="Kas & Likuiditas" workspaceKey={workspaceKey} /><FinanceExtractionDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} /></>;
}
