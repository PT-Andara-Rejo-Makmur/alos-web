"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ExecutiveDomainSummaryCard } from "../types";
import styles from "../executive-dashboard.module.css";

interface ExecutiveDomainSummaryProps {
  readonly summaries: readonly ExecutiveDomainSummaryCard[];
  readonly onSelectDomain?: (domain: ExecutiveDomainSummaryCard) => void;
}

export function ExecutiveDomainSummary({
  summaries,
  onSelectDomain,
}: ExecutiveDomainSummaryProps) {
  function getBadgeClass(readiness: ExecutiveDomainSummaryCard["readiness"]): string {
    switch (readiness) {
      case "LIVE":
        return styles.badgeSuccess;
      case "PARTIAL":
        return styles.badgeWarning;
      case "NOT_CONNECTED":
      default:
        return styles.badgeNeutral;
    }
  }

  return (
    <section className={styles.sectionContainer} aria-label="Ringkasan Domain Operasional">
      <div className={styles.sectionEyebrow}>KONDISI LINTAS FUNGSI</div>
      <h2 className={styles.sectionTitle}>Ringkasan Domain Operasional</h2>
      <p className={styles.sectionSubtitle}>
        Status ringkas 6 area fungsi bisnis utama: komersial, keuangan, konstruksi fisik, legalitas, personalia, dan platform teknologi.
      </p>

      <div className={styles.domainGrid}>
        {summaries.map((card) => (
          <article
            key={card.domainKey}
            className={styles.domainCard}
            data-testid={`domain-card-${card.domainKey}`}
          >
            <div className={styles.domainCardHeader}>
              <div>
                <h3 className={styles.domainCardTitle}>{card.title}</h3>
                <p className={styles.domainCardPurpose}>{card.businessPurpose}</p>
              </div>

              <span className={`${styles.badge} ${getBadgeClass(card.readiness)}`}>
                <span
                  className={`${styles.statusDot} ${
                    card.readiness === "LIVE"
                      ? styles.dotSuccess
                      : card.readiness === "PARTIAL"
                        ? styles.dotPartial
                        : styles.dotNotConnected
                  }`}
                  aria-hidden="true"
                  style={{ marginRight: "0.35rem" }}
                />
                {card.readinessLabel}
              </span>
            </div>

            <div className={styles.domainFactsList}>
              {card.facts.map((fact, idx) => (
                <div key={idx} className={styles.domainFactRow}>
                  <span className={styles.domainFactLabel}>{fact.label}</span>
                  <strong className={styles.domainFactValue}>{fact.value}</strong>
                </div>
              ))}
            </div>

            {card.primaryAttention && (
              <div className={styles.domainAttentionBox}>
                <span className={styles.domainAttentionLabel}>Perhatian:</span>
                <span className={styles.domainAttentionText}>{card.primaryAttention}</span>
              </div>
            )}

            <div className={styles.domainCardFooter}>
              <div className={styles.domainFooterMeta}>
                <span>Sumber: {card.sourceName}</span>
                {card.lastUpdated !== "—" && (
                  <span> · Diperbarui {card.lastUpdated}</span>
                )}
              </div>

              <div className={styles.domainActions}>
                {onSelectDomain && (
                  <button
                    type="button"
                    onClick={() => onSelectDomain(card)}
                    className={styles.domainDrawerButton}
                  >
                    Status
                  </button>
                )}
                <Link
                  href={card.drilldownHref}
                  className={styles.domainLink}
                  aria-label={`Buka workspace ${card.title}`}
                >
                  <span>Buka</span>
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
