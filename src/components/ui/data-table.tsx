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
                {typeof emptyState === "string" ? (
                  <div className={styles.tableEmptyCard}>
                    <span aria-hidden="true" className={styles.tableEmptyIcon}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </span>
                    <span className={styles.tableEmptyText}>{emptyState}</span>
                    <span className={styles.tableEmptyHint}>Belum ada rekaman yang tersedia untuk ditampilkan pada tabel ini.</span>
                  </div>
                ) : (
                  emptyState
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getRowKey(row, index)}>
                {columns.map((column) => (
                  <td key={column.key} data-label={typeof column.header === "string" ? column.header : undefined}>{column.render(row, index)}</td>
                ))}
                {rowAction ? <td data-label="Tindakan">{rowAction(row, index)}</td> : null}
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
