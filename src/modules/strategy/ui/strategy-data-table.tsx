import type { ReactNode } from "react";
import styles from "./strategy-ui.module.css";

interface StrategyDataTableProps {
  readonly ariaLabel: string;
  readonly columns: readonly string[];
  readonly children: ReactNode;
  readonly minWidth?: number;
  readonly emptyText?: string;
  readonly isEmpty?: boolean;
}

export function StrategyDataTable({
  ariaLabel,
  columns,
  children,
  minWidth = 720,
  emptyText,
  isEmpty,
}: StrategyDataTableProps) {
  return (
    <div className={styles.tableContainer}>
      <table aria-label={ariaLabel} className={styles.table} style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty && emptyText ? (
            <tr>
              <td className={styles.emptyCell} colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
