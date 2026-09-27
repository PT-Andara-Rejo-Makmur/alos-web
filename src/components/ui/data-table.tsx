import type { ReactNode } from "react";

import styles from "./ui.module.css";

export interface DataTableColumn<Row> {
  readonly header: ReactNode;
  readonly key: string;
  readonly render: (row: Row, index: number) => ReactNode;
}

export interface DataTableProps<Row> {
  readonly caption?: string;
  readonly columns: readonly DataTableColumn<Row>[];
  readonly emptyState?: ReactNode;
  readonly getRowKey?: (row: Row, index: number) => string;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly rowAction?: (row: Row, index: number) => ReactNode;
  readonly rows: readonly Row[];
}

export function DataTable<Row>({
  caption,
  columns,
  emptyState = "Belum ada data",
  getRowKey = (_row, index) => String(index),
  loading = false,
  loadingLabel = "Memuat data",
  rowAction,
  rows,
}: DataTableProps<Row>) {
  const columnCount = columns.length + (rowAction ? 1 : 0);

  return (
    <div className={styles.tableViewport}>
      <table aria-busy={loading || undefined} aria-label={caption ?? "Tabel data"} className={styles.dataTable}>
        {caption ? <caption className={styles.tableCaption}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
            {rowAction ? <th scope="col">Aksi</th> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingRows columnCount={columnCount} label={loadingLabel} />
          ) : rows.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={columnCount}>
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getRowKey(row, index)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row, index)}</td>
                ))}
                {rowAction ? <td>{rowAction(row, index)}</td> : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LoadingRows({ columnCount, label }: Readonly<{ columnCount: number; label: string }>) {
  return (
    <>
      {[0, 1, 2].map((row) => (
        <tr aria-label={row === 0 ? label : undefined} key={row}>
          {Array.from({ length: columnCount }, (_, cell) => (
            <td key={cell}>
              <span aria-hidden="true" className={styles.tableSkeleton} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
