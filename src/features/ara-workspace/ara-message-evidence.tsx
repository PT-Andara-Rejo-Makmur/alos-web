"use client";

import type { AraCitation } from "./types";
import styles from "./ara-workspace.module.css";

interface AraMessageEvidenceProps {
  readonly citations?: readonly AraCitation[];
}

export function AraMessageEvidence({ citations = [] }: AraMessageEvidenceProps) {
  if (!citations || citations.length === 0) {
    return (
      <div className={styles.responseSection}>
        <h4 className={styles.goldSectionHeading}>Evidence</h4>
        <p className={styles.sectionText}>Belum dilampirkan pada contoh reference ini.</p>
      </div>
    );
  }

  return (
    <div className={styles.responseSection}>
      <h4 className={styles.goldSectionHeading}>Evidence & Sitasi</h4>
      <div className={styles.evidenceList}>
        {citations.map((item, idx) => {
          const displayTitle = item.title || item.source || `Sumber Dokumen #${idx + 1}`;
          return (
            <div key={idx} className={styles.evidenceItem}>
              <div className={styles.evidenceHeader}>
                <span className={styles.evidenceTitle}>{displayTitle}</span>
                {item.validation_status && (
                  <span className={styles.evidenceBadge}>
                    {item.validation_status}
                  </span>
                )}
                {item.is_untrusted && (
                  <span
                    className={styles.evidenceBadge}
                    style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                  >
                    UNTRUSTED SOURCE
                  </span>
                )}
              </div>

              {item.excerpt && (
                <p className={styles.evidenceExcerpt}>&ldquo;{item.excerpt}&rdquo;</p>
              )}

              {item.evidence_id && (
                <details style={{ fontSize: "11px", color: "#8a8275", marginTop: "4px" }}>
                  <summary style={{ cursor: "pointer" }}>Detail Teknis</summary>
                  <p style={{ margin: "2px 0 0" }}>Evidence ID: {item.evidence_id}</p>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
