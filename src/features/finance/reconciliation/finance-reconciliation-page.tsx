"use client";

import { useState } from "react";
import { Button, type DataTableColumn } from "@/components/ui";
import { FinanceDataPage, type FinanceTab } from "../shared/finance-data-page";
import { FinanceExtractionDrawer, FinanceSectionNote } from "../shared/finance-ui";

interface ReconciliationRow { readonly id: string; readonly date: string; readonly account: string; readonly description: string; readonly amount: string; readonly related: string; readonly status: string; readonly difference: string; readonly reviewer: string; }
const baseColumns: readonly DataTableColumn<ReconciliationRow>[] = [{ header: "Tanggal Transaksi", key: "date", render: (row) => row.date }, { header: "Rekening", key: "account", render: (row) => row.account }, { header: "Deskripsi", key: "description", render: (row) => row.description }, { header: "Jumlah", key: "amount", render: (row) => row.amount }, { header: "Objek Terkait", key: "related", render: (row) => row.related }, { header: "Status Pencocokan", key: "status", render: (row) => row.status }, { header: "Selisih", key: "difference", render: (row) => row.difference }, { header: "Peninjau", key: "reviewer", render: (row) => row.reviewer }];
const historyColumns: readonly DataTableColumn<ReconciliationRow>[] = [{ header: "Tanggal", key: "date", render: (row) => row.date }, { header: "Rekening", key: "account", render: (row) => row.account }, { header: "Peristiwa", key: "description", render: (row) => row.description }, { header: "Hasil", key: "status", render: (row) => row.status }, { header: "Peninjau", key: "reviewer", render: (row) => row.reviewer }];

export function FinanceReconciliationPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  const [extractionOpen, setExtractionOpen] = useState(false);
  const matchingAction = <div><Button disabled title="Pilih transaksi setelah data tersedia">Konfirmasi Pencocokan</Button><Button onClick={() => setExtractionOpen(true)} variant="secondary">Telaah Bank Statement</Button></div>;
  const tabs: readonly FinanceTab<ReconciliationRow>[] = [
    { id: "unmatched", label: "Belum Dicocokkan", title: "Belum Dicocokkan", description: "Transaksi yang belum memiliki pencocokan terkonfirmasi.", caption: "Transaksi belum dicocokkan", columns: baseColumns, emptyDescription: "Transaksi belum dicocokkan belum tersedia.", actions: matchingAction, rows: [], children: <><FinanceSectionNote>Kandidat pencocokan bukan konfirmasi. Konfirmasi tetap memerlukan transaksi terpilih dan peninjauan manusia.</FinanceSectionNote><FinanceExtractionDrawer onClose={() => setExtractionOpen(false)} open={extractionOpen} /></> },
    { id: "matched", label: "Cocok", title: "Pencocokan Cocok", description: "Pencocokan yang telah dikonfirmasi oleh proses resmi.", caption: "Pencocokan cocok", columns: baseColumns, emptyDescription: "Pencocokan cocok belum tersedia.", rows: [] },
    { id: "review", label: "Perlu Review", title: "Pencocokan Perlu Review", description: "Pencocokan yang menunggu telaah manusia.", caption: "Pencocokan perlu review", columns: baseColumns, emptyDescription: "Pencocokan yang perlu review belum tersedia.", actions: <Button disabled>Konfirmasi Pencocokan</Button>, rows: [] },
    { id: "difference", label: "Selisih", title: "Selisih Rekonsiliasi", description: "Transaksi dengan perbedaan yang harus ditelaah.", caption: "Selisih rekonsiliasi", columns: baseColumns, emptyDescription: "Selisih rekonsiliasi belum tersedia.", rows: [] },
    { id: "history", label: "Riwayat", title: "Riwayat Rekonsiliasi", description: "Riwayat tindakan pencocokan dan peninjauan.", caption: "Riwayat rekonsiliasi", columns: historyColumns, emptyDescription: "Riwayat rekonsiliasi belum tersedia.", rows: [] },
  ];
  return <FinanceDataPage description="Pantau pencocokan transaksi dan selisih yang menunggu telaah manusia." tabs={tabs} title="Rekonsiliasi" workspaceKey={workspaceKey} />;
}
