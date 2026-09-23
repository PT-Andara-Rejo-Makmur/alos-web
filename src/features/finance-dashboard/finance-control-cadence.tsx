import type { FinanceCadenceItem } from "./types";
import styles from "./finance-dashboard.module.css";

interface FinanceControlCadenceProps {
  readonly cadence: readonly FinanceCadenceItem[];
}

export function FinanceControlCadence({ cadence }: FinanceControlCadenceProps) {
  // Desktop table columns shown in reference image:
  // Harian | Verifikasi transaksi | Ledger | Belum terhubung
  // Harian | Rekonsiliasi bank | Bank vs ledger | Belum terhubung
  // Mingguan | Arus kas 13 minggu | Cashflow 13 minggu | Belum terhubung
  // Mingguan | Aging piutang & utang | Aging report | Belum terhubung
  // Mingguan | Varians anggaran | Budget vs actual | Belum terhubung
  // Bulanan | Pajak & tutup buku | Bukti lapor / P&L | Belum terhubung

  // Present the first 6 canonical primary cadence items on the dashboard view
  const displayItems = cadence.slice(0, 6);

  return (
    <article className={styles.sectionCard} aria-label="Finance Control Cadence">
      <div className={styles.cardEyebrow}>FINANCE CONTROL CADENCE</div>
      <h3 className={styles.cardTitle}>Kontrol Harian &middot; Mingguan &middot; Bulanan</h3>

      <div className={styles.cadenceTable} role="table">
        {displayItems.map((item) => (
          <div
            className={styles.cadenceTableRow}
            key={item.code}
            role="row"
            data-testid={`cadence-item-${item.code}`}
          >
            <div className={styles.cadenceCellFreq} role="cell">
              {item.frequencyLabel}
            </div>
            <div className={styles.cadenceCellName} role="cell">
              {item.name}
            </div>
            <div className={styles.cadenceCellEvidence} role="cell">
              {item.evidence}
            </div>
            <div className={styles.cadenceCellStatus} role="cell" data-testid={`cadence-value-${item.code}`}>
              {item.stateLabel}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
