import { Status } from "@/components/ui";

import type { EvidenceItem } from "../types";
import styles from "./evidence.module.css";

interface EvidenceListProps {
  readonly items?: readonly EvidenceItem[];
}

export function EvidenceList({ items = [] }: EvidenceListProps) {
  if (items.length === 0) {
    return <p className={styles.emptyEvidence}>Belum ada bukti.</p>;
  }

  return (
    <div aria-label="Daftar Bukti Pendukung" className={styles.container}>
      {items.map((item) => (
        <article className={styles.item} key={item.id}>
          <div className={styles.mainInfo}>
            <h4 className={styles.title}>{item.title}</h4>
            <span className={styles.source}>Sumber: {item.source}</span>
          </div>

          <div className={styles.metaInfo}>
            <Status
              label={
                item.verificationStatus === "VERIFIED"
                  ? "Terverifikasi"
                  : item.verificationStatus === "PENDING"
                    ? "Menunggu Verifikasi"
                    : "Belum Diverifikasi"
              }
              variant={
                item.verificationStatus === "VERIFIED"
                  ? "success"
                  : item.verificationStatus === "PENDING"
                    ? "warning"
                    : "neutral"
              }
            />
            <time className={styles.time} dateTime={item.occurredAt}>
              {new Date(item.occurredAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>

          {item.contentHash || item.version ? (
            <details className={styles.technicalDetail}>
              <summary>Detail teknis</summary>
              {item.version ? <div>Versi: {item.version}</div> : null}
              {item.contentHash ? <code>Hash: {item.contentHash}</code> : null}
            </details>
          ) : null}
        </article>
      ))}
    </div>
  );
}
