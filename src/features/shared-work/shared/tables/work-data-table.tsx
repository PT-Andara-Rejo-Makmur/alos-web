"use client";

import type { ReactNode } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui";

import styles from "./work-table.module.css";

export interface WorkDataTableProps<Row> {
  readonly caption?: string;
  readonly columns: readonly DataTableColumn<Row>[];
  readonly emptyState?: ReactNode;
  readonly getRowKey?: (row: Row, index: number) => string;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly onRowClick?: (row: Row) => void;
  readonly rowAction?: (row: Row, index: number) => ReactNode;
  readonly rows: readonly Row[];
  /** A disconnected source is not an empty result and must not render an empty state. */
  readonly unavailable?: boolean;
}

export function WorkDataTable<Row>({
  caption,
  columns,
  emptyState,
  getRowKey,
  loading,
  loadingLabel = "Memuat data…",
  onRowClick,
  rowAction,
  rows,
  unavailable = false,
}: WorkDataTableProps<Row>) {
  if (unavailable) return null;

  return (
    <div className={[styles.tableWrapper, onRowClick ? styles.clickableTable : ""].filter(Boolean).join(" ")}>
      <DataTable
        caption={caption}
        columns={columns}
        emptyState={emptyState}
        getRowKey={getRowKey}
        loading={loading}
        loadingLabel={loadingLabel}
        rowAction={rowAction}
        rows={rows}
      />
    </div>
  );
}
