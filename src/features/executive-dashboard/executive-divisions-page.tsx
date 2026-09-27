"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Clock } from "lucide-react";

import { authenticatedApiRequest } from "@/lib/api";
import type { ExecutiveDashboardSnapshot } from "./types";
import {
  createEmptyExecutiveSnapshot,
  formatDateIndonesian,
  projectDivisionHealth,
} from "./executive-dashboard-projection";
import styles from "./executive-dashboard.module.css";

export function ExecutiveDivisionsPage() {
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
      .catch((err) => {
        if (!controller.signal.aborted) {
          const status = (err as { status?: number })?.status;
          if (status === 404) {
            setSnapshot(createEmptyExecutiveSnapshot());
            setError(null);
          } else {
            setError("Status divisi belum dapat dimuat. Silakan coba lagi beberapa saat.");
          }
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
    return <div className="alos-loading-shell">Memuat data divisi…</div>;
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

  const divisionItems = projectDivisionHealth(snapshot);
  const attentionDivisions = divisionItems.filter(
    (d) => d.health === "ATTENTION" || d.health === "CRITICAL" || d.pending_approvals > 0,
  );
  const totalPending = divisionItems.reduce((sum, d) => sum + d.pending_approvals, 0);
  const totalWorkflows = divisionItems.reduce((sum, d) => sum + d.active_genesis_workflows, 0);

  return (
    <div className={styles.container}>
      <header className={styles.subpageHeader}>
        <div className={styles.breadcrumb}>ORGANISASI / DIVISI</div>
        <h1 className={styles.subpageTitle}>Status Divisi</h1>
        <p className={styles.subpageSubtitle}>
          Kondisi operasional, dokumen, persetujuan tertunda, dan integrasi sistem lintas divisi PT Andara Rejo Makmur.
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

      {/* 1. Ringkasan Divisi */}
      <section className={styles.tableCard} aria-label="Ringkasan Divisi">
        <div className={styles.cardEyebrow}>ORGANISASI</div>
        <h2 className={styles.cardTitle}>Ringkasan Divisi</h2>
        <p className={styles.cardSubtitle}>
          Tinjauan komprehensif status kesehatan operasional seluruh unit kerja perusahaan.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable} aria-label="Tabel Ringkasan Divisi">
            <thead>
              <tr>
                <th scope="col">Nama Divisi</th>
                <th scope="col">Kode</th>
                <th scope="col">Status</th>
                <th scope="col">Jumlah Dokumen</th>
                <th scope="col">Persetujuan Menunggu</th>
                <th scope="col">Aktivitas GENESIS</th>
              </tr>
            </thead>
            <tbody>
              {divisionItems.map((div) => (
                <tr key={div.division_code}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span
                        className={`${styles.statusDot} ${
                          div.health === "HEALTHY"
                            ? styles.dotSuccess
                            : div.health === "ATTENTION"
                              ? styles.dotPartial
                              : styles.dotNotConnected
                        }`}
                        aria-hidden="true"
                      />
                      <strong>{div.division_name}</strong>
                    </div>
                  </td>
                  <td>
                    <code>{div.division_code}</code>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        div.health === "HEALTHY"
                          ? styles.badgeSuccess
                          : div.health === "ATTENTION"
                            ? styles.badgeWarning
                            : styles.badgeNeutral
                      }`}
                    >
                      {div.healthLabel}
                    </span>
                  </td>
                  <td>{div.document_count} Dokumen</td>
                  <td>{div.pending_approvals > 0 ? `${div.pending_approvals} Menunggu` : "0"}</td>
                  <td>
                    {div.active_genesis_workflows > 0
                      ? `${div.active_genesis_workflows} Alur Aktif`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Divisi yang Membutuhkan Perhatian */}
      <section className={styles.earlyWarningCard} aria-label="Divisi yang Membutuhkan Perhatian">
        <div className={styles.cardEyebrow}>PERHATIAN KHUSUS</div>
        <h2 className={styles.cardTitle}>Divisi yang Membutuhkan Perhatian</h2>
        <p className={styles.cardSubtitle}>
          Unit kerja dengan kendala operasional, persetujuan tertunda, atau status belum terhubung.
        </p>

        {attentionDivisions.length === 0 ? (
          <div className={styles.emptyState}>
            Seluruh divisi berada dalam kondisi operasional normal dan tidak memerlukan perhatian khusus.
          </div>
        ) : (
          <div className={styles.warningList} role="list">
            {attentionDivisions.map((div) => (
              <div
                key={div.division_code}
                className={`${styles.warningItem} ${
                  div.health === "ATTENTION" ? styles.warningItemAtRisk : ""
                }`}
                role="listitem"
              >
                <div>
                  <strong>{div.division_name} ({div.division_code})</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                    {div.health === "NOT_CONNECTED"
                      ? "Sumber data operasional belum terhubung ke sistem ALOS."
                      : `${div.pending_approvals} persetujuan menunggu · ${div.document_count} dokumen terdata.`}
                  </div>
                </div>
                <span
                  className={`${styles.badge} ${
                    div.health === "ATTENTION"
                      ? styles.badgeWarning
                      : div.health === "CRITICAL"
                        ? styles.badgeDanger
                        : styles.badgeNeutral
                  }`}
                >
                  {div.healthLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Persetujuan Menunggu */}
      <section className={styles.tableCard} aria-label="Persetujuan Menunggu Lintas Divisi">
        <div className={styles.cardEyebrow}>KEPUTUSAN</div>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.cardTitle}>Persetujuan Menunggu Lintas Divisi</h2>
            <p className={styles.cardSubtitle}>
              Total {totalPending} persetujuan tertunda di seluruh ruang kerja perusahaan.
            </p>
          </div>
          <Link href="/workspace/executive/approvals" className={styles.strategyLink}>
            Buka Halaman Persetujuan &rarr;
          </Link>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable} aria-label="Tabel Persetujuan Menunggu">
            <thead>
              <tr>
                <th scope="col">Divisi</th>
                <th scope="col">Persetujuan Tertunda</th>
                <th scope="col">Kondisi Antrean</th>
              </tr>
            </thead>
            <tbody>
              {divisionItems.map((div) => (
                <tr key={div.division_code}>
                  <td>
                    <strong>{div.division_name}</strong>
                  </td>
                  <td>
                    <strong>{div.pending_approvals}</strong> item
                  </td>
                  <td>
                    {div.pending_approvals > 0 ? (
                      <span className={`${styles.badge} ${styles.badgeWarning}`}>
                        Menunggu Keputusan
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}>Lancar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Aktivitas GENESIS jika tersedia */}
      <section className={styles.tableCard} aria-label="Aktivitas GENESIS Lintas Divisi">
        <div className={styles.cardEyebrow}>AI & GENESIS</div>
        <h2 className={styles.cardTitle}>Aktivitas GENESIS Lintas Divisi</h2>
        <p className={styles.cardSubtitle}>
          Total {totalWorkflows} alur kerja otomasi aktif yang beroperasi di bawah batasan tata kelola persetujuan manusia.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable} aria-label="Tabel Alur Kerja GENESIS">
            <thead>
              <tr>
                <th scope="col">Divisi</th>
                <th scope="col">Alur Kerja Aktif</th>
                <th scope="col">Tata Kelola</th>
              </tr>
            </thead>
            <tbody>
              {divisionItems.map((div) => (
                <tr key={div.division_code}>
                  <td>
                    <strong>{div.division_name}</strong>
                  </td>
                  <td>
                    {div.active_genesis_workflows > 0
                      ? `${div.active_genesis_workflows} Alur Kerja`
                      : "—"}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                      Persetujuan Manusia Wajib
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Status Ketersediaan Data */}
      <section className={styles.tableCard} aria-label="Status Ketersediaan Data">
        <div className={styles.cardEyebrow}>INTEGRASI</div>
        <h2 className={styles.cardTitle}>Status Ketersediaan Data</h2>
        <p className={styles.cardSubtitle}>
          Transparansi konektivitas sumber data riil antar divisi tanpa skor buatan.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable} aria-label="Tabel Status Ketersediaan Data">
            <thead>
              <tr>
                <th scope="col">Divisi</th>
                <th scope="col">Status Integrasi</th>
                <th scope="col">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {divisionItems.map((div) => {
                const isLive = div.health !== "NOT_CONNECTED";
                return (
                  <tr key={div.division_code}>
                    <td>
                      <strong>{div.division_name}</strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          isLive ? styles.badgeSuccess : styles.badgeNeutral
                        }`}
                      >
                        {isLive ? "TERHUBUNG (LIVE)" : "BELUM TERHUBUNG"}
                      </span>
                    </td>
                    <td>
                      {isLive
                        ? "Data operasional dan dokumen tersinkronisasi."
                        : "Sistem belum terintegrasi ke backend ALOS. Angka tidak dibuat-buat."}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
