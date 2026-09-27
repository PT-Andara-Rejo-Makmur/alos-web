"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DivisionHealthItem } from "../types";
import styles from "../executive-dashboard.module.css";

interface ExecutiveDivisionHealthProps {
  readonly divisions: readonly DivisionHealthItem[];
}

export function ExecutiveDivisionHealth({ divisions }: ExecutiveDivisionHealthProps) {
  function getHealthDotClass(health: DivisionHealthItem["health"]): string {
    switch (health) {
      case "HEALTHY":
        return styles.dotSuccess;
      case "ATTENTION":
        return styles.dotPartial;
      case "CRITICAL":
        return styles.dotDanger;
      case "NOT_CONNECTED":
      default:
        return styles.dotNotConnected;
    }
  }

  function getHealthBadgeClass(health: DivisionHealthItem["health"]): string {
    switch (health) {
      case "HEALTHY":
        return styles.badgeSuccess;
      case "ATTENTION":
        return styles.badgeWarning;
      case "CRITICAL":
        return styles.badgeDanger;
      case "NOT_CONNECTED":
      default:
        return styles.badgeNeutral;
    }
  }

  return (
    <section className={styles.sectionContainer} aria-label="Status Operasional Divisi">
      <div className={styles.sectionHeaderRow}>
        <div>
          <div className={styles.sectionEyebrow}>ORGANISASI & LINTAS DIVISI</div>
          <h2 className={styles.sectionTitle}>Status Operasional Divisi</h2>
          <p className={styles.sectionSubtitle}>
            Status operasional, dokumen aktif, persetujuan tertunda, dan integrasi agen pengawas lintas 6 divisi perusahaan.
          </p>
        </div>

        <Link
          href="/workspace/executive/divisions"
          className={styles.sectionActionLink}
        >
          <span>Lihat Halaman Divisi</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.tableWrap}>
        <table
          className={styles.dataTable}
          aria-label="Tabel Status Operasional Divisi"
        >
          <thead>
            <tr>
              <th scope="col">Nama Divisi</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ textAlign: "right" }}>Jumlah Dokumen</th>
              <th scope="col" style={{ textAlign: "right" }}>Persetujuan Menunggu</th>
              <th scope="col" style={{ textAlign: "right" }}>Aktivitas GENESIS</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((div) => (
              <tr
                key={div.division_code}
                data-testid={`division-health-${div.division_code}`}
              >
                <td>
                  <div className={styles.divisionNameCell}>
                    <span
                      className={`${styles.statusDot} ${getHealthDotClass(div.health)}`}
                      aria-hidden="true"
                    />
                    <strong>{div.division_name}</strong>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${getHealthBadgeClass(div.health)}`}>
                    {div.healthLabel}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span className={styles.metricNumeric}>
                    {div.document_count > 0 ? `${div.document_count} Dokumen` : "0"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span className={styles.metricNumeric}>
                    {div.pending_approvals > 0 ? `${div.pending_approvals} Menunggu` : "0"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span className={styles.metricNumeric}>
                    {div.active_genesis_workflows > 0
                      ? `${div.active_genesis_workflows} Alur Aktif`
                      : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
