import { statusLabel } from "@/lib/presentation";
import styles from "@/components/ui/work-surface.module.css";

export function OpportunityBoard({ rows }: Readonly<{ rows: readonly object[] }>) {
  const records = rows as readonly Readonly<Record<string, unknown>>[];
  return <section aria-label="Alur peluang penjualan">
    <p className={styles.sourceNote}>Posisi peluang pada halaman ini. Booking, KPR, dan Closing mengikuti catatan dan pemeriksaan yang tersedia.</p>
    <div className={styles.pipeline}>
      {["Lead", "Qualified", "Survey", "Booking"].map(value => {
        const items = records.filter(item => item.stage === value);
        return <div key={value}><h3>{statusLabel(value)} <span>{items.length}</span></h3>
          {items.length ? <ul>{items.slice(0, 4).map((item, index) => <li key={String(item.opportunity_id ?? index)}>{String(item.name ?? "Peluang Penjualan")}</li>)}</ul> : <p>Belum ada peluang</p>}
          {items.length > 4 ? <small>{items.length - 4} peluang lainnya pada daftar</small> : null}
        </div>;
      })}
    </div>
  </section>;
}
