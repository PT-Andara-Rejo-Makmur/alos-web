"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { DecisionQueueItem } from "../types";
import styles from "../executive-dashboard.module.css";

interface ExecutiveDecisionQueueProps {
  readonly items: readonly DecisionQueueItem[];
}

export function ExecutiveDecisionQueue({ items }: ExecutiveDecisionQueueProps) {
  function getUrgencyBadge(urgency: DecisionQueueItem["urgency"], label: string) {
    let badgeClass = styles.badgeNeutral;
    if (urgency === "OVERDUE") badgeClass = styles.badgeDanger;
    else if (urgency === "DUE_SOON") badgeClass = styles.badgeWarning;

    return <span className={`${styles.badge} ${badgeClass}`}>{label}</span>;
  }

  return (
    <section className={styles.sectionContainer} aria-label="Keputusan yang Membutuhkan Perhatian">
      <div className={styles.sectionHeaderRow}>
        <div>
          <div className={styles.sectionEyebrow}>KEPUTUSAN MATERIAL DIREKSI</div>
          <h2 className={styles.sectionTitle}>Keputusan yang Membutuhkan Perhatian</h2>
          <p className={styles.sectionSubtitle}>
            Antrean dokumen formal dan rilis kapabilitas agen yang memerlukan persetujuan Direktur Utama sebelum eksekusi resmi.
          </p>
        </div>

        <Link
          href="/workspace/executive/approvals"
          className={styles.sectionActionLink}
        >
          <span>Halaman Persetujuan Lengkap</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyContainer} role="status">
          <p className={styles.emptyDesc}>
            Tidak ada antrean keputusan yang menunggu persetujuan Direktur saat ini.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table
            className={styles.dataTable}
            aria-label="Tabel Keputusan yang Membutuhkan Perhatian"
          >
            <thead>
              <tr>
                <th scope="col">Keputusan</th>
                <th scope="col">Jenis</th>
                <th scope="col">Pengusul</th>
                <th scope="col">Divisi / Ruang Kerja</th>
                <th scope="col">Waktu Menunggu</th>
                <th scope="col">Urgensi</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.approval_id}
                  data-testid={`decision-item-${item.approval_id}`}
                >
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeKind}`}>
                      {item.kindLabel}
                    </span>
                  </td>
                  <td>{item.requested_by}</td>
                  <td>{item.workspace_name}</td>
                  <td>{item.ageLabel}</td>
                  <td>{getUrgencyBadge(item.urgency, item.urgencyLabel)}</td>
                  <td>
                    <Link href={item.href} className={styles.rowDetailButton}>
                      Lihat Detail &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.queueFootnote}>
        <ShieldCheck size={14} aria-hidden="true" style={{ marginRight: "0.45rem", flexShrink: 0 }} />
        <span>
          Seluruh persetujuan material membutuhkan tinjauan manusia; ALOS tidak melakukan auto-approve sepihak.
        </span>
      </div>
    </section>
  );
}
