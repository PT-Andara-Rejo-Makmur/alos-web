"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import type { ExecutiveCorporateTargetRow } from "../types";
import { ExecutiveProgress } from "./executive-progress";
import styles from "../executive-dashboard.module.css";

interface ExecutiveTargetPerformanceProps {
  readonly targets: readonly ExecutiveCorporateTargetRow[];
  readonly onSelectTarget: (target: ExecutiveCorporateTargetRow) => void;
}

export function ExecutiveTargetPerformance({
  targets,
  onSelectTarget,
}: ExecutiveTargetPerformanceProps) {
  function getBadgeClass(tone: ExecutiveCorporateTargetRow["statusTone"]): string {
    switch (tone) {
      case "SUCCESS":
        return styles.badgeSuccess;
      case "WARNING":
        return styles.badgeWarning;
      case "DANGER":
        return styles.badgeDanger;
      case "NEUTRAL":
      default:
        return styles.badgeNeutral;
    }
  }

  return (
    <section className={styles.sectionContainer} aria-label="Pencapaian Target Perusahaan">
      <div className={styles.sectionHeaderRow}>
        <div>
          <div className={styles.sectionEyebrow}>STRATEGI & TARGET KORPORAT</div>
          <h2 className={styles.sectionTitle}>Pencapaian Target Perusahaan</h2>
          <p className={styles.sectionSubtitle}>
            Sasaran strategis korporat bersumber dari Renstra & RKAP resmi Stage 2, diproyeksikan langsung tanpa asumsi browser sepihak.
          </p>
        </div>

        <Link
          href="/workspace/executive/strategy"
          className={styles.sectionActionLink}
        >
          <span>Buka Perencanaan Strategi</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {targets.length === 0 ? (
        <div className={styles.emptyContainer} role="status">
          <Info size={20} className={styles.emptyIcon} aria-hidden="true" />
          <h3 className={styles.emptyTitle}>Belum Ada Target Korporat Aktif</h3>
          <p className={styles.emptyDesc}>
            Target perusahaan akan ditampilkan secara otomatis setelah dokumen Renstra atau RKAP disetujui dan diaktifkan melalui alur perencanaan strategi.
          </p>
          <Link href="/workspace/executive/strategy" className={styles.emptyActionButton}>
            Kelola Perencanaan Strategi
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table
            className={styles.dataTable}
            aria-label="Tabel Pencapaian Target Perusahaan"
          >
            <thead>
              <tr>
                <th scope="col">Target</th>
                <th scope="col">Periode</th>
                <th scope="col" style={{ textAlign: "right" }}>Target</th>
                <th scope="col" style={{ textAlign: "right" }}>Aktual</th>
                <th scope="col" style={{ textAlign: "right" }}>Perkiraan</th>
                <th scope="col" style={{ textAlign: "right" }}>Selisih</th>
                <th scope="col" style={{ minWidth: "140px" }}>Capaian</th>
                <th scope="col">Status</th>
                <th scope="col">Verifikasi</th>
                <th scope="col">Sumber</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((row) => (
                <tr key={row.targetId} data-testid={`corporate-target-row-${row.targetId}`}>
                  <td>
                    <div className={styles.targetNameCell}>
                      <strong>{row.name}</strong>
                      <span className={styles.targetCodeLabel}>{row.code}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.periodText}>{row.periodLabel}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={styles.metricNumeric}>{row.targetDisplay}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={styles.metricNumeric}>{row.actualDisplay}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={styles.metricNumeric}>{row.forecastDisplay}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`${styles.metricNumeric} ${
                        row.varianceDisplay.startsWith("+")
                          ? styles.textSuccess
                          : row.varianceDisplay.startsWith("-")
                            ? styles.textDanger
                            : ""
                      }`}
                    >
                      {row.varianceDisplay}
                    </span>
                  </td>
                  <td>
                    {row.achievementPercent !== null ? (
                      <div className={styles.targetProgressCell}>
                        <ExecutiveProgress
                          percentage={row.achievementPercent}
                          tone={row.statusTone}
                          showDetails={false}
                          ariaLabel={`Capaian ${row.name}`}
                        />
                        <span className={styles.achievementText}>
                          {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(row.achievementPercent)}%
                        </span>
                      </div>
                    ) : (
                      <span className={styles.metricNull}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getBadgeClass(row.statusTone)}`}>
                      {row.statusLabel}
                    </span>
                  </td>
                  <td>
                    <span className={styles.verificationBadge}>
                      {row.verificationLabel}
                    </span>
                  </td>
                  <td>
                    <span className={styles.sourceText}>{row.sourceLabel}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onSelectTarget(row)}
                      className={styles.rowDetailButton}
                      aria-label={`Lihat rincian target ${row.name}`}
                    >
                      Lihat Rincian
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
