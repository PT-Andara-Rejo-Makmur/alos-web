import styles from "./agent-workforce.module.css";

export function AgentWorkforceSummary() {
  return (
    <section className={styles.summaryRow} aria-label="Status Ringkasan Agent Workforce">
      {/* 1. Scope */}
      <article className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Registry Scope</span>
        <h3 className={styles.summaryValue}>Workspace aktif</h3>
        <p className={styles.summaryDetail}>
          <span className={`${styles.dot} ${styles.dotBlue}`} aria-hidden="true" />
          <span>Bukan organisasi global</span>
        </p>
      </article>

      {/* 2. Availability */}
      <article className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Availability</span>
        <h3 className={styles.summaryValue}>Backend verified</h3>
        <p className={styles.summaryDetail}>
          <span className={`${styles.dot} ${styles.dotGreen}`} aria-hidden="true" />
          <span>Tidak dibuat dari blueprint</span>
        </p>
      </article>

      {/* 3. Recent Activity */}
      <article className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Recent Activity</span>
        <h3 className={styles.summaryValue}>Scoped runs</h3>
        <p className={styles.summaryDetail}>
          <span className={`${styles.dot} ${styles.dotAmber}`} aria-hidden="true" />
          <span>Bukan test runtime manual</span>
        </p>
      </article>

      {/* 4. Human Gate */}
      <article className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Human Gate</span>
        <h3 className={styles.summaryValue}>Tetap wajib</h3>
        <p className={styles.summaryDetail}>
          <span className={`${styles.dot} ${styles.dotCoral}`} aria-hidden="true" />
          <span>Untuk aksi material</span>
        </p>
      </article>
    </section>
  );
}
