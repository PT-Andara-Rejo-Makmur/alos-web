"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import type { ExecutiveEarlyWarningItem } from "../types";
import styles from "../executive-dashboard.module.css";

interface ExecutiveAttentionProps {
  readonly warnings: readonly ExecutiveEarlyWarningItem[];
}

export function ExecutiveAttention({ warnings }: ExecutiveAttentionProps) {
  function getSeverityBadge(severity: ExecutiveEarlyWarningItem["severity"], label: string) {
    let badgeClass = styles.badgeNeutral;
    let icon = <Clock size={12} aria-hidden="true" />;

    if (severity === "CRITICAL") {
      badgeClass = styles.badgeDanger;
      icon = <AlertCircle size={12} aria-hidden="true" />;
    } else if (severity === "AT_RISK") {
      badgeClass = styles.badgeWarning;
      icon = <AlertTriangle size={12} aria-hidden="true" />;
    } else if (severity === "DUE_SOON") {
      badgeClass = styles.badgeWarning;
      icon = <Clock size={12} aria-hidden="true" />;
    }

    return (
      <span className={`${styles.badge} ${badgeClass}`}>
        {icon}
        <span style={{ marginLeft: "0.3rem" }}>{label}</span>
      </span>
    );
  }

  return (
    <section className={styles.sectionContainer} aria-label="Peringatan Dini">
      <div className={styles.sectionEyebrow}>ESKALASI & PERHATIAN KHUSUS</div>
      <h2 className={styles.sectionTitle}>Peringatan Dini</h2>
      <p className={styles.sectionSubtitle}>
        Daftar kendala material, keterlambatan keputusan, dan indikator risiko yang terpantau secara otomatis dari data operasional nyata.
      </p>

      {warnings.length === 0 ? (
        <div className={styles.emptyContainer} role="status">
          <p className={styles.emptyDesc}>
            Tidak ada deviasi kritis atau keputusan terlambat yang memerlukan eskalasi saat ini. Seluruh item terpantau dalam batas toleransi.
          </p>
        </div>
      ) : (
        <div className={styles.warningList} role="list">
          {warnings.map((item) => (
            <article
              key={item.id}
              className={`${styles.warningCard} ${
                item.severity === "CRITICAL"
                  ? styles.warningCardCritical
                  : item.severity === "AT_RISK" || item.severity === "DUE_SOON"
                    ? styles.warningCardWarning
                    : ""
              }`}
              role="listitem"
              data-testid={`early-warning-${item.id}`}
            >
              <div className={styles.warningTopRow}>
                <div className={styles.warningTitleGroup}>
                  <span className={styles.warningCategory}>{item.category}</span>
                  <h3 className={styles.warningTitle}>{item.title}</h3>
                </div>
                {getSeverityBadge(item.severity, item.severityLabel)}
              </div>

              <p className={styles.warningCause}>{item.concreteCause}</p>

              <div className={styles.warningBottomRow}>
                <div className={styles.warningMeta}>
                  <span>Sumber: <strong>{item.source}</strong></span>
                  <span aria-hidden="true"> · </span>
                  <span>Waktu: {item.sinceWhen}</span>
                </div>

                {item.actionHref && (
                  <Link href={item.actionHref} className={styles.warningActionButton}>
                    <span>{item.actionLabel || "Lihat Rincian"}</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
