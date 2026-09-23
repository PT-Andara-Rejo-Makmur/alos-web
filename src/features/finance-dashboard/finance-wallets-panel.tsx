import styles from "./finance-dashboard.module.css";

export function FinanceWalletsPanel() {
  return (
    <section className={styles.walletsCard} aria-label="Segregasi Dompet Dana">
      <div className={styles.cardEyebrow}>SEGREGASI DANA</div>
      <div className={styles.pendingBadge}>Contract Pending</div>
      <h3 className={styles.cardTitle}>Struktur Rekening &amp; Dompet Dana</h3>
      <p className={styles.cardSubtitle}>
        Pemisahan dana operasional, cadangan, dan titipan pemilik PT Andara Rejo Makmur.
      </p>

      <p style={{ fontSize: "0.85rem", color: "var(--workspace-muted, #7e848c)", lineHeight: 1.6, margin: "0.75rem 0 0" }}>
        Model segregasi dana (apakah menggunakan model tiga dompet dana atau subdivisi akun rekening yang lebih granular) saat ini dalam tahap perumusan spesifikasi data Backend. ALOS tidak menyajikan saldo atau struktur dompet sementara sampai kontrak kanonikal resmi disepakati.
      </p>
    </section>
  );
}
