"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import styles from "../executive-dashboard.module.css";

interface ExecutiveGenesisAnalysisProps {
  readonly activeWorkflows?: number;
}

export function ExecutiveGenesisAnalysis({ activeWorkflows = 0 }: ExecutiveGenesisAnalysisProps) {
  return (
    <section className={styles.sectionContainer} aria-label="Analisis GENESIS">
      <div className={styles.sectionEyebrow}>SINTESIS & PENGAWASAN ADVISORY</div>
      <h2 className={styles.sectionTitle}>Analisis GENESIS</h2>
      <p className={styles.sectionSubtitle}>
        Sintesis berkala, deteksi anomali operasional, dan rekomendasi mitigasi risiko dari agen pengawas GENESIS.
      </p>

      <div className={styles.genesisPanel}>
        <div className={styles.genesisLeft}>
          <div className={styles.genesisBadgeRow}>
            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
              <span className={`${styles.statusDot} ${styles.dotNotConnected}`} aria-hidden="true" style={{ marginRight: "0.35rem" }} />
              Status: Belum Tersedia
            </span>
            {activeWorkflows > 0 && (
              <span className={styles.genesisWorkflowCount}>
                {activeWorkflows} Alur Analisis Aktif
              </span>
            )}
          </div>

          <p className={styles.genesisDescription}>
            Analisis GENESIS belum tersedia untuk ringkasan ini. Layanan analisis berkala sedang menunggu penyambungan telemetry bridge dari backend operasional.
          </p>

          <div className={styles.genesisNotice}>
            <ShieldAlert size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              GENESIS berfungsi sebagai penasihat analitis (advisory) yang memberikan temuan dan rekomendasi risiko; seluruh keputusan bisnis, persetujuan belanja, dan perubahan target tetap berada pada kewenangan pimpinan manusia.
            </span>
          </div>
        </div>

        <div className={styles.genesisRight}>
          <Link href="/workspace/executive/ara" className={styles.genesisActionButton}>
            <span>Buka ARA & Analisis Agen</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
