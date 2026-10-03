import type { AraProgressProjection } from "@/lib/contracts";
import styles from "./ara.module.css";

const activities = [["UNDERSTANDING", "Memahami permintaan"], ["RETRIEVING", "Memeriksa informasi"], ["ANALYZING", "Menganalisis"], ["PREPARING", "Menyiapkan jawaban"]] as const;

export function AraProgress({ events, label }: Readonly<{ events: AraProgressProjection["events"]; label: string }>) {
  const current = events.at(-1)?.kind;
  return <div className={styles.progress} role="status" aria-live="polite"><p>{label}</p><ol>{activities.map(([kind, title]) => {
    const seen = events.some(event => event.kind === kind);
    const done = seen && current !== kind;
    return <li key={kind} data-current={current === kind}><span aria-hidden="true">{done ? "✓" : current === kind ? "●" : "○"}</span>{title}<span className={styles.srOnly}>{done ? "selesai" : current === kind ? "sedang diproses" : "belum dimulai"}</span></li>;
  })}</ol></div>;
}
