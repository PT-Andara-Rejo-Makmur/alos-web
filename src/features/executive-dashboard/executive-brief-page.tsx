"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, BadgeCheck, Clock, HelpCircle } from "lucide-react";

import { authenticatedApiRequest } from "@/lib/api";
import type { ExecutiveDashboardSnapshot } from "./types";
import {
  formatDateIndonesian,
  formatMetricDisplayValue,
  projectDecisionQueue,
  projectEarlyWarnings,
} from "./executive-dashboard-projection";
import styles from "./executive-dashboard.module.css";

export function ExecutiveBriefPage() {
  const [snapshot, setSnapshot] = useState<ExecutiveDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    authenticatedApiRequest<ExecutiveDashboardSnapshot>("/api/v1/executive-dashboard", {
      signal: controller.signal,
    })
      .then((data) => {
        setSnapshot(data);
        setError(null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Brief eksekutif belum dapat dimuat. Silakan coba lagi beberapa saat.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [reloadIndex]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadIndex((prev) => prev + 1);
  };

  if (loading) {
    return <div className="alos-loading-shell">Memuat brief eksekutif…</div>;
  }

  if (error) {
    return (
      <div className={styles.statePanel} role="alert">
        <div className={styles.stateIcon} aria-hidden="true">
          <AlertCircle size={24} />
        </div>
        <h2 className={styles.stateTitle}>Kendala Memuat Data</h2>
        <p className={styles.stateDesc}>{error}</p>
        <button type="button" onClick={handleRetry} className={styles.stateActionBtn}>
          Muat Ulang
        </button>
      </div>
    );
  }

  if (!snapshot) return null;

  const decisionItems = projectDecisionQueue(snapshot);
  const earlyWarnings = projectEarlyWarnings(snapshot);
  const activeProjectsMetric = snapshot.metrics.find((m) => m.key === "active_projects");
  const averageProgressMetric = snapshot.metrics.find((m) => m.key === "average_progress");
  const pendingApprovalsMetric = snapshot.metrics.find((m) => m.key === "pending_approvals");
  const overdueTasksMetric = snapshot.metrics.find((m) => m.key === "overdue_tasks");

  const totalWorkflows = snapshot.divisions.reduce(
    (sum, div) => sum + (div.active_genesis_workflows || 0),
    0,
  );

  return (
    <div className={styles.container}>
      <header className={styles.subpageHeader}>
        <div className={styles.breadcrumb}>PUSAT KENDALI / BRIEF EKSEKUTIF</div>
        <h1 className={styles.subpageTitle}>Brief Eksekutif</h1>
        <p className={styles.subpageSubtitle}>
          Ringkasan cepat kondisi operasional, antrean keputusan, peringatan dini, dan ketersediaan data perusahaan.
        </p>
      </header>

      {/* Waktu Pembaruan Data */}
      <div className={styles.timeBanner} role="status">
        <div className={styles.timeText}>
          <Clock size={16} aria-hidden="true" />
          <span>
            Waktu Pembaruan Data: <strong>{formatDateIndonesian(snapshot.generated_at)}</strong>
          </span>
        </div>
        <span>Data operasional terkini PT Andara Rejo Makmur</span>
      </div>

      {/* 1. Kondisi Operasional */}
      <section className={styles.tableCard} aria-label="Kondisi Operasional">
        <div className={styles.cardEyebrow}>OPERASIONAL</div>
        <h2 className={styles.cardTitle}>Kondisi Operasional</h2>
        <p className={styles.cardSubtitle}>
          Indikator utama pelaksanaan pekerjaan, keputusan menunggu, dan deviasi tugas lintas divisi.
        </p>

        <div className={styles.kpiGrid}>
          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>Proyek Aktif</p>
              <div className={styles.kpiValue}>
                {activeProjectsMetric ? formatMetricDisplayValue(activeProjectsMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span>{activeProjectsMetric?.context ?? "Seluruh divisi"}</span>
            </div>
          </article>

          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>Kemajuan Pekerjaan</p>
              <div className={styles.kpiValue}>
                {averageProgressMetric ? formatMetricDisplayValue(averageProgressMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span>{averageProgressMetric?.context ?? "Agregasi portofolio"}</span>
            </div>
          </article>

          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>Keputusan Menunggu</p>
              <div className={styles.kpiValue}>
                {pendingApprovalsMetric ? formatMetricDisplayValue(pendingApprovalsMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span>{pendingApprovalsMetric?.context ?? "Menunggu pimpinan"}</span>
            </div>
          </article>

          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>Tugas Terlambat</p>
              <div className={styles.kpiValue}>
                {overdueTasksMetric ? formatMetricDisplayValue(overdueTasksMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span>{overdueTasksMetric?.context ?? "Belum terhubung"}</span>
            </div>
          </article>
        </div>
      </section>

      {/* 2. Antrean Keputusan */}
      <section className={styles.tableCard} aria-label="Antrean Keputusan">
        <div className={styles.cardEyebrow}>KEPUTUSAN</div>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.cardTitle}>Antrean Keputusan</h2>
            <p className={styles.cardSubtitle}>
              Keputusan yang sedang menunggu arahan atau persetujuan pimpinan perusahaan.
            </p>
          </div>
          <Link href="/workspace/executive/approvals" className={styles.strategyLink}>
            Lihat Halaman Persetujuan &rarr;
          </Link>
        </div>

        {decisionItems.length === 0 ? (
          <div className={styles.emptyState}>
            Tidak ada keputusan yang sedang menunggu persetujuan pimpinan.
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.dataTable} aria-label="Tabel Antrean Keputusan Brief">
              <thead>
                <tr>
                  <th scope="col">Keputusan</th>
                  <th scope="col">Jenis</th>
                  <th scope="col">Pengusul</th>
                  <th scope="col">Divisi</th>
                  <th scope="col">Durasi Menunggu</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {decisionItems.map((item) => (
                  <tr key={item.approval_id}>
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
                    <td>
                      <span
                        className={`${styles.badge} ${
                          item.urgency === "OVERDUE"
                            ? styles.badgeDanger
                            : item.urgency === "DUE_SOON"
                              ? styles.badgeWarning
                              : styles.badgeNeutral
                        }`}
                      >
                        {item.urgencyLabel}
                      </span>
                    </td>
                    <td>
                      <Link href={item.href} className={styles.detailButton}>
                        Lihat Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Peringatan Dini */}
      <section className={styles.earlyWarningCard} aria-label="Peringatan Dini">
        <div className={styles.cardEyebrow}>PERINGATAN DINI</div>
        <h2 className={styles.cardTitle}>Peringatan Dini</h2>
        <p className={styles.cardSubtitle}>
          Proyek bermasalah, keputusan terlambat, atau divisi yang membutuhkan intervensi pimpinan.
        </p>

        {earlyWarnings.totalWarnings === 0 ? (
          <div className={styles.emptyState}>
            Tidak ada indikator peringatan dini operasional yang memerlukan eskalasi saat ini.
          </div>
        ) : (
          <div className={styles.warningList} role="list">
            {earlyWarnings.criticalProjects.map((p) => (
              <div key={p.project_id} className={`${styles.warningItem} ${styles.warningItemCritical}`} role="listitem">
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                    Proyek Kritis · Kemajuan saat ini: {p.progress_percent}%
                  </div>
                </div>
                <span className={`${styles.badge} ${styles.badgeDanger}`}>KRITIS</span>
              </div>
            ))}
            {earlyWarnings.atRiskProjects.map((p) => (
              <div key={p.project_id} className={`${styles.warningItem} ${styles.warningItemAtRisk}`} role="listitem">
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                    Proyek Berisiko · Kemajuan saat ini: {p.progress_percent}%
                  </div>
                </div>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>BERISIKO</span>
              </div>
            ))}
            {earlyWarnings.overdueDecisions.map((a) => (
              <div key={a.approval_id} className={`${styles.warningItem} ${styles.warningItemCritical}`} role="listitem">
                <div>
                  <strong>{a.title}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                    Keputusan Terlambat · {a.workspace_name} · Menunggu {a.age_days} hari
                  </div>
                </div>
                <span className={`${styles.badge} ${styles.badgeDanger}`}>TERLAMBAT</span>
              </div>
            ))}
            {earlyWarnings.attentionDivisions.map((d) => (
              <div key={d.division_code} className={`${styles.warningItem} ${styles.warningItemAtRisk}`} role="listitem">
                <div>
                  <strong>Divisi {d.division_name}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                    Memerlukan perhatian operasional ({d.pending_approvals} persetujuan menunggu)
                  </div>
                </div>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>PERLU PERHATIAN</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Posisi Kas & Likuiditas */}
      <section className={styles.tableCard} aria-label="Posisi Kas & Likuiditas">
        <div className={styles.cardEyebrow}>KEUANGAN</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <h2 className={styles.cardTitle}>Posisi Kas & Likuiditas</h2>
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>BELUM TERHUBUNG</span>
        </div>
        <p className={styles.cardSubtitle}>
          Sumber data arus kas, saldo rekening bank perusahaan, dan likuiditas perbendaharaan belum terintegrasi ke sistem ALOS.
        </p>
        <div className={styles.strategyNotice}>
          <HelpCircle size={15} aria-hidden="true" />
          <span>
            Integrasi perbankan dan buku kas operasional Finance belum terhubung ke antarmuka eksekutif. Tidak ada angka perkiraan yang dibuat.
          </span>
        </div>
      </section>

      {/* 5. Aktivitas GENESIS */}
      <section className={styles.tableCard} aria-label="Aktivitas GENESIS">
        <div className={styles.cardEyebrow}>AI & GENESIS</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <h2 className={styles.cardTitle}>Aktivitas GENESIS</h2>
          <span
            className={`${styles.badge} ${
              totalWorkflows > 0 ? styles.badgeSuccess : styles.badgeNeutral
            }`}
          >
            {totalWorkflows > 0 ? `${totalWorkflows} ALUR KERJA AKTIF` : "BELUM TERHUBUNG"}
          </span>
        </div>
        <p className={styles.cardSubtitle}>
          Pemantauan aktivitas alur kerja GENESIS yang aktif di seluruh divisi perusahaan.
        </p>
        <div className={styles.strategyNotice}>
          <BadgeCheck size={15} aria-hidden="true" />
          <span>
            Seluruh agen dan kapabilitas otomasi beroperasi di bawah batasan tata kelola persetujuan manusia. Audit log dan metrik biaya AI belum terhubung.
          </span>
        </div>
      </section>
    </div>
  );
}
