import type { CascadePreview, StrategyConstraintResult } from "@/lib/contracts";

import styles from "../ui/strategy-ui.module.css";

const constraintLabel = (result: StrategyConstraintResult) =>
  `${result.result}${result.critical ? " · KRITIS" : ""}`;

export function CascadePreviewView({
  preview,
  accepting = false,
  onBack,
  onAccept,
}: {
  readonly preview: CascadePreview;
  readonly accepting?: boolean;
  readonly onBack: () => void;
  readonly onAccept: () => void;
}) {
  const acceptable = preview.status === "VALID" && preview.blocking_conditions.length === 0;
  return (
    <section className={styles.card} aria-label="Preview cascade target">
      <header className={styles.sectionHeader}>
        <div>
          <span className={styles.sectionEyebrow}>Preview immutable</span>
          <h2 className={styles.sectionTitle}>Cascade Target</h2>
          <p className={styles.sectionSubtitle}>Run {preview.cascade_run_id} · {preview.status}</p>
        </div>
      </header>

      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Target Turunan</h3>
          <p className={styles.cardText}>{preview.derived_targets.length || "—"} target dari hasil Backend.</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Asumsi Digunakan</h3>
          <p className={styles.cardText}>{preview.assumptions_used.length || "—"} asumsi terversi.</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead><tr><th>Constraint</th><th>Hasil</th><th>Keterangan</th></tr></thead>
          <tbody>
            {preview.constraint_results.length === 0 ? (
              <tr><td className={styles.emptyCell} colSpan={3}>Belum ada hasil constraint.</td></tr>
            ) : preview.constraint_results.map((result) => (
              <tr key={result.constraint_id}>
                <td className={styles.codeCell}>{result.constraint_id}</td>
                <td>{constraintLabel(result)}</td>
                <td>{result.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preview.blocking_conditions.length > 0 && (
        <div className={styles.notice} role="alert">
          <strong>Kondisi pemblokir:</strong> {preview.blocking_conditions.join("; ")}
        </div>
      )}
      <div className={styles.actionRow}>
        <button className={styles.buttonSecondary} type="button" onClick={onBack}>Kembali</button>
        <button className={styles.buttonPrimary} type="button" disabled={!acceptable || accepting} onClick={onAccept}>
          {accepting ? "Menyimpan…" : "Terima sebagai Draft"}
        </button>
      </div>
    </section>
  );
}
