"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ExecutiveHeadlineItem } from "../types";
import { ExecutiveProgress } from "./executive-progress";
import styles from "../executive-dashboard.module.css";

interface ExecutiveHeadlineStripProps {
  readonly headlines: readonly ExecutiveHeadlineItem[];
}

export function ExecutiveHeadlineStrip({ headlines }: ExecutiveHeadlineStripProps) {
  function getStatusDotClass(tone: ExecutiveHeadlineItem["statusTone"]): string {
    switch (tone) {
      case "SUCCESS":
        return styles.dotSuccess;
      case "WARNING":
        return styles.dotPartial;
      case "DANGER":
        return styles.dotDanger;
      case "INFO":
        return styles.dotLive;
      case "NEUTRAL":
      default:
        return styles.dotNotConnected;
    }
  }

  function getBadgeClass(tone: ExecutiveHeadlineItem["statusTone"]): string {
    switch (tone) {
      case "SUCCESS":
        return styles.badgeSuccess;
      case "WARNING":
        return styles.badgeWarning;
      case "DANGER":
        return styles.badgeDanger;
      case "INFO":
      case "NEUTRAL":
      default:
        return styles.badgeNeutral;
    }
  }

  return (
    <section className={styles.sectionContainer} aria-label="Ringkasan Utama Perusahaan">
      <div className={styles.sectionEyebrow}>KONDISI BISNIS UTAMA</div>
      <h2 className={styles.sectionTitle}>Ringkasan Utama Perusahaan</h2>
      <p className={styles.sectionSubtitle}>
        Enam indikator utama penentu kesehatan keuangan, komersial, pelaksanaan proyek, dan tata kelola korporat.
      </p>

      <div className={styles.headlineGrid}>
        {headlines.map((item) => {
          return (
            <article
              key={item.id}
              className={styles.headlineCard}
              data-testid={`headline-card-${item.id}`}
            >
              <div className={styles.headlineCardTop}>
                <span className={styles.headlineLabel}>{item.label}</span>
                <span className={`${styles.badge} ${getBadgeClass(item.statusTone)}`}>
                  <span
                    className={`${styles.statusDot} ${getStatusDotClass(item.statusTone)}`}
                    aria-hidden="true"
                    style={{ marginRight: "0.35rem" }}
                  />
                  {item.statusLabel}
                </span>
              </div>

              <div className={styles.headlineMainValueRow}>
                <div
                  className={styles.headlinePrimaryValue}
                  data-testid={`headline-value-${item.id}`}
                >
                  {item.primaryValue}
                </div>
              </div>

              {/* Progress bar only if target and actual exist and progress is safe */}
              {item.progressPercent !== null && item.progressPercent !== undefined && (
                <div className={styles.headlineProgressWrap}>
                  <ExecutiveProgress
                    percentage={item.progressPercent}
                    tone={item.statusTone}
                    showDetails={false}
                    ariaLabel={`Pencapaian ${item.label}`}
                  />
                  <div className={styles.headlineProgressText}>
                    <span>Capaian:</span>
                    <strong>{item.progressPercent.toFixed(1)}%</strong>
                  </div>
                </div>
              )}

              {/* Target / Actual / Forecast Details if provided */}
              {(item.targetValue || item.actualValue || item.forecastValue) && (
                <div className={styles.headlineMetricsComparison}>
                  {item.targetValue && (
                    <div className={styles.comparisonItem}>
                      <span className={styles.comparisonLabel}>Target</span>
                      <span className={styles.comparisonValue}>{item.targetValue}</span>
                    </div>
                  )}
                  {item.actualValue && (
                    <div className={styles.comparisonItem}>
                      <span className={styles.comparisonLabel}>Aktual</span>
                      <span className={styles.comparisonValue}>{item.actualValue}</span>
                    </div>
                  )}
                  {item.forecastValue && (
                    <div className={styles.comparisonItem}>
                      <span className={styles.comparisonLabel}>Perkiraan</span>
                      <span className={styles.comparisonValue}>{item.forecastValue}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Helper text when not connected */}
              {item.helperText && (
                <p className={styles.headlineHelperText}>{item.helperText}</p>
              )}

              <div className={styles.headlineFooter}>
                <div className={styles.headlineMeta}>
                  <span className={styles.headlineSource}>
                    Sumber: {item.sourceLabel}
                  </span>
                  {item.verificationLabel && (
                    <span className={styles.headlineVerification}>
                      · {item.verificationLabel}
                    </span>
                  )}
                </div>

                {item.drilldownHref && (
                  <Link
                    href={item.drilldownHref}
                    className={styles.headlineDrilldownLink}
                    aria-label={`Lihat rincian ${item.label}`}
                  >
                    <span>Rincian</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
