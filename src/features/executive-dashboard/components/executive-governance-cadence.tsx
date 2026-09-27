"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import styles from "../executive-dashboard.module.css";

interface CadenceItem {
  readonly title: string;
  readonly schedule: string;
  readonly participants: string;
  readonly focus: string;
  readonly status: string;
}

const CADENCE_ITEMS: readonly CadenceItem[] = [
  {
    title: "Brief Pagi Operasional",
    schedule: "Setiap Hari Kerja · 07.45 WIB",
    participants: "Direktur Utama & Lead Divisi",
    focus: "Kesiapan lapangan, izin material, dan kendala kritis hari berjalan.",
    status: "Belum Terhubung",
  },
  {
    title: "Rapat Koordinasi Mingguan",
    schedule: "Setiap Senin · 09.00 WIB",
    participants: "Seluruh Lead Divisi & Project Manager",
    focus: "Deviasi kurva S proyek, antrean keputusan tertunda, dan mitigasi risiko.",
    status: "Belum Terhubung",
  },
  {
    title: "Tutup Buku & Rekonsiliasi Bulanan",
    schedule: "Hari Kerja Terakhir Setiap Bulan",
    participants: "Finance Lead & Akuntan",
    focus: "Rekonsiliasi rekening koran, realisasi anggaran belanja, dan penagihan piutang.",
    status: "Belum Terhubung",
  },
  {
    title: "Evaluasi Sasaran & RKAP Kuartalan",
    schedule: "Akhir Kuartal Berjalan",
    participants: "Direksi & Dewan Komisaris",
    focus: "Pencapaian target korporat, penyesuaian asumsi makro, dan alokasi modal.",
    status: "Belum Terhubung",
  },
];

export function ExecutiveGovernanceCadence() {
  return (
    <section className={styles.sectionContainer} aria-label="Ritme Pelaporan & Tata Kelola">
      <div className={styles.sectionHeaderRow}>
        <div>
          <div className={styles.sectionEyebrow}>KEDISIPLINAN OPERASIONAL</div>
          <h2 className={styles.sectionTitle}>Ritme Pelaporan & Tata Kelola</h2>
          <p className={styles.sectionSubtitle}>
            Jadwal pengawasan berkala yang ditetapkan kebijakan tata kelola perusahaan. Status keterlaksanaan operasional belum terhubung ke sistem presensi/log rapat.
          </p>
        </div>

        <Link href="/workspace/executive/reports" className={styles.sectionActionLink}>
          <span>Laporan Korporat</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.cadenceGrid}>
        {CADENCE_ITEMS.map((item, idx) => (
          <article key={idx} className={styles.cadenceCard}>
            <div className={styles.cadenceCardTop}>
              <div className={styles.cadenceTitleWrap}>
                <CalendarDays size={16} className={styles.cadenceIcon} aria-hidden="true" />
                <h3 className={styles.cadenceTitle}>{item.title}</h3>
              </div>
              <span className={`${styles.badge} ${styles.badgeNeutral}`}>{item.status}</span>
            </div>

            <div className={styles.cadenceSchedule}>{item.schedule}</div>

            <div className={styles.cadenceDetail}>
              <span className={styles.cadenceDetailLabel}>Peserta:</span>
              <span className={styles.cadenceDetailValue}>{item.participants}</span>
            </div>

            <p className={styles.cadenceFocus}>{item.focus}</p>

            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--workspace-muted, #7e848c)" }}>
              Status Pelaksanaan: <strong>Belum Terhubung</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
