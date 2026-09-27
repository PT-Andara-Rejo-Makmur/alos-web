import type { RelationshipCounts } from "../types";
import styles from "./relationship.module.css";

interface RelationshipSummaryProps {
  readonly counts?: RelationshipCounts | null;
  readonly isConnected?: boolean;
}

export function RelationshipSummary({ counts, isConnected = true }: RelationshipSummaryProps) {
  const items = [
    { key: "tasks", label: "Tugas", count: counts?.tasksCount },
    { key: "documents", label: "Dokumen", count: counts?.documentsCount },
    { key: "approvals", label: "Persetujuan", count: counts?.approvalsCount },
    { key: "findings", label: "Temuan", count: counts?.findingsCount },
    { key: "reports", label: "Laporan", count: counts?.reportsCount },
    { key: "evidence", label: "Bukti", count: counts?.evidenceCount },
  ];

  function formatCount(value: number | null | undefined) {
    if (!isConnected) return <span className={styles.itemValueUnconnected}>Belum Terhubung</span>;
    if (value === null || value === undefined) return <span className={styles.itemValueUnconnected}>—</span>;
    return value;
  }

  return (
    <div aria-label="Ringkasan Objek Terkait" className={styles.summaryContainer}>
      <h3 className={styles.summaryTitle}>Terkait</h3>
      <div className={styles.summaryGrid}>
        {items.map((item) => (
          <div className={styles.summaryItem} key={item.key}>
            <span className={styles.itemLabel}>{item.label}</span>
            <span className={styles.itemValue}>{formatCount(item.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
