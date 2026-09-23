import Link from "next/link";
import styles from "./finance-dashboard.module.css";

export function FinanceApprovalPanel() {
  return (
    <article className={styles.sectionCard} aria-label="Antrean Persetujuan Keuangan">
      <div className={styles.cardEyebrow}>HUMAN CONTROL</div>
      <h3 className={styles.cardTitle}>Approval Queue</h3>

      <div className={styles.approvalDash} data-testid="approval-queue-dash">
        —
      </div>

      <p className={styles.approvalDesc}>
        Belum ada finance-specific approval projection.
      </p>

      <div style={{ marginTop: "auto", textAlign: "center" }}>
        <Link href="/business/approvals" className={styles.approvalCTA}>
          Buka Approval Center &rarr;
        </Link>
      </div>
    </article>
  );
}
