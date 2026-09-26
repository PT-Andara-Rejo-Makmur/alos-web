import React from "react";
import styles from "./it-ui.module.css";

export interface ItDataTableProps {
  readonly ariaLabel: string;
  readonly columns: readonly string[];
  readonly children: React.ReactNode;
  readonly minWidth?: number;
}

export function ItDataTable({
  ariaLabel,
  columns,
  children,
  minWidth = 720,
}: ItDataTableProps) {
  return (
    <div className={styles.techTableWrapper}>
      <table
        aria-label={ariaLabel}
        className={styles.techTable}
        style={{ minWidth }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
