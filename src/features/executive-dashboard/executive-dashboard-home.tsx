"use client";

import Link from "next/link";
import { Clock, Info } from "lucide-react";

import type { ExecutiveDashboardSnapshot } from "./types";
import {
  formatDateIndonesian,
  formatMetricDisplayValue,
  projectDecisionQueue,
  projectDivisionHealth,
  projectEarlyWarnings,
} from "./executive-dashboard-projection";
import styles from "./executive-dashboard.module.css";
import { BusinessDashboardFoundation } from "@/features/business-foundation";

interface ExecutiveDashboardHomeProps {
  readonly snapshot: ExecutiveDashboardSnapshot;
}

export function ExecutiveDashboardHome({ snapshot }: ExecutiveDashboardHomeProps) {
  const decisionItems = projectDecisionQueue(snapshot);
  const divisionItems = projectDivisionHealth(snapshot);
  const earlyWarnings = projectEarlyWarnings(snapshot);

  // Distinguish metrics clearly
  const activeProjectsMetric = snapshot.metrics.find((m) => m.key === "active_projects");
  const pendingApprovalsMetric = snapshot.metrics.find((m) => m.key === "pending_approvals");
  const averageProgressMetric = snapshot.metrics.find((m) => m.key === "average_progress");
  const overdueTasksMetric = snapshot.metrics.find((m) => m.key === "overdue_tasks");

  const distribution = snapshot.project_distribution;
  const isDistAvailable = distribution.available && distribution.total > 0;
  const totalProjects = distribution.total || 0;

  // Project distribution canonical order: Tepat Waktu, Berisiko, Kritis, Selesai
  const defaultDistItems = [
    { key: "ON_TRACK", label: "Tepat Waktu", count: 0, tone: "GREEN" },
    { key: "AT_RISK", label: "Berisiko", count: 0, tone: "AMBER" },
    { key: "CRITICAL", label: "Kritis", count: 0, tone: "RED" },
    { key: "COMPLETED", label: "Selesai", count: 0, tone: "BLUE" },
  ];

  const distributionItems = defaultDistItems.map((def) => {
    const found = distribution.items.find(
      (item) => item.key === def.key || (def.key === "AT_RISK" && item.key === "AT_RISK"),
    );
    return found ? { ...def, count: found.count, label: found.label || def.label } : def;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header>
        <div className={styles.breadcrumb}>PUSAT KENDALI EKSEKUTIF</div>
        <h1 className={styles.pageTitle}>Pusat Kendali Eksekutif</h1>
        <p className={styles.pageSubtitle}>
          Ringkasan strategis, kondisi operasional, keputusan, dan perhatian lintas divisi PT Andara Rejo Makmur.
        </p>
      </header>

      {/* 1. Waktu pembaruan data */}
      <div className={styles.timeBanner} role="status" aria-label="Waktu Pembaruan Data">
        <div className={styles.timeText}>
          <Clock size={16} aria-hidden="true" />
          <span>
            Waktu Pembaruan Data: <strong>{formatDateIndonesian(snapshot.generated_at)}</strong>
          </span>
        </div>
        <span>Data operasional terkini PT Andara Rejo Makmur</span>
      </div>

      <BusinessDashboardFoundation dashboard="executive" />

      {/* 2. Strategi & Kinerja Perusahaan */}
      <section className={styles.strategyCard} aria-label="Strategi & Kinerja Perusahaan">
        <div className={styles.strategyHeader}>
          <div>
            <div className={styles.cardEyebrow}>STRATEGI & KINERJA</div>
            <h2 className={styles.cardTitle}>Strategi & Kinerja Perusahaan</h2>
            <p className={styles.cardSubtitle}>
              Kondisi strategi perusahaan, capaian sasaran, dan kemajuan agregat seluruh inisiatif.
            </p>
          </div>
          <Link href="/workspace/executive/strategy" className={styles.strategyLink}>
            Buka Ringkasan Strategi &rarr;
          </Link>
        </div>

        <div className={styles.strategyGrid}>
          <div className={styles.strategyItem}>
            <span className={styles.strategyItemLabel}>Kemajuan Pekerjaan</span>
            <div className={styles.strategyItemValue}>
              {averageProgressMetric ? formatMetricDisplayValue(averageProgressMetric) : "—"}
            </div>
            <span className={styles.strategyItemDesc}>Rata-rata progres proyek berjalan</span>
          </div>

          <div className={styles.strategyItem}>
            <span className={styles.strategyItemLabel}>Capaian KPI</span>
            <div className={styles.strategyItemValue}>—</div>
            <span className={styles.strategyItemDesc}>Sumber belum terhubung</span>
          </div>

          <div className={styles.strategyItem}>
            <span className={styles.strategyItemLabel}>Capaian Sasaran</span>
            <div className={styles.strategyItemValue}>—</div>
            <span className={styles.strategyItemDesc}>Sumber belum terhubung</span>
          </div>
        </div>

        <div className={styles.strategyNotice}>
          <Info size={15} aria-hidden="true" />
          <span>Sumber KPI dan sasaran perusahaan belum tersedia.</span>
        </div>
      </section>

      {/* 3. Ringkasan Operasional */}
      <section className={styles.operationalSection} aria-label="Ringkasan Operasional">
        <div className={styles.cardEyebrow}>OPERASIONAL</div>
        <h2 className={styles.cardTitle}>Ringkasan Operasional</h2>
        <p className={styles.cardSubtitle}>
          Status proyek aktif, antrean keputusan menunggu, kemajuan pekerjaan, dan tugas yang memerlukan tindak lanjut.
        </p>

        <div className={styles.kpiGrid}>
          {/* Card 1: Proyek Aktif */}
          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>{activeProjectsMetric?.label || "Proyek Aktif"}</p>
              <div className={styles.kpiValue} data-testid="metric-value-active_projects">
                {activeProjectsMetric ? formatMetricDisplayValue(activeProjectsMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span className={`${styles.statusDot} ${styles.dotLive}`} aria-hidden="true" />
              <span>{activeProjectsMetric?.context ?? "Seluruh divisi"}</span>
            </div>
          </article>

          {/* Card 2: Keputusan Menunggu */}
          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>{pendingApprovalsMetric?.label || "Keputusan Menunggu"}</p>
              <div className={styles.kpiValue} data-testid="metric-value-pending_approvals">
                {pendingApprovalsMetric ? formatMetricDisplayValue(pendingApprovalsMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span className={`${styles.statusDot} ${styles.dotPartial}`} aria-hidden="true" />
              <span>{pendingApprovalsMetric?.context ?? "Menunggu persetujuan pimpinan"}</span>
            </div>
          </article>

          {/* Card 3: Kemajuan Pekerjaan */}
          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>{averageProgressMetric?.label || "Kemajuan Pekerjaan"}</p>
              <div className={styles.kpiValue} data-testid="metric-value-average_progress">
                {averageProgressMetric ? formatMetricDisplayValue(averageProgressMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span className={`${styles.statusDot} ${styles.dotSuccess}`} aria-hidden="true" />
              <span>{averageProgressMetric?.context ?? "Agregasi portofolio proyek"}</span>
            </div>
          </article>

          {/* Card 4: Tugas Terlambat */}
          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>{overdueTasksMetric?.label || "Tugas Terlambat"}</p>
              <div className={styles.kpiValue} data-testid="metric-value-overdue_tasks">
                {overdueTasksMetric ? formatMetricDisplayValue(overdueTasksMetric) : "—"}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span
                className={`${styles.statusDot} ${
                  overdueTasksMetric?.state === "LIVE" ? styles.dotDanger : styles.dotNotConnected
                }`}
                aria-hidden="true"
              />
              <span>{overdueTasksMetric?.context ?? "Belum terhubung"}</span>
            </div>
          </article>
        </div>
      </section>

      {/* 4. Keputusan yang Membutuhkan Perhatian */}
      <section className={styles.tableCard} aria-label="Keputusan yang Membutuhkan Perhatian">
        <div className={styles.cardEyebrow}>KEPUTUSAN</div>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.cardTitle}>Keputusan yang Membutuhkan Perhatian</h2>
            <p className={styles.cardSubtitle}>
              Item pending yang memerlukan persetujuan Direktur Utama sebelum eksekusi resmi.
            </p>
          </div>
          <Link href="/workspace/executive/approvals" className={styles.strategyLink}>
            Lihat Halaman Persetujuan &rarr;
          </Link>
        </div>

        {decisionItems.length === 0 ? (
          <div className={styles.emptyState}>
            Tidak ada antrean keputusan yang menunggu persetujuan Direktur saat ini.
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.dataTable} aria-label="Tabel Keputusan yang Membutuhkan Perhatian">
              <thead>
                <tr>
                  <th scope="col">Keputusan</th>
                  <th scope="col">Jenis</th>
                  <th scope="col">Pengusul</th>
                  <th scope="col">Divisi / Ruang Kerja</th>
                  <th scope="col">Sudah Menunggu</th>
                  <th scope="col">Status</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {decisionItems.map((item) => (
                  <tr key={item.approval_id} data-testid={`decision-item-${item.approval_id}`}>
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

        <div className={styles.queueFootnote}>
          Seluruh persetujuan material membutuhkan tinjauan manusia; ALOS tidak melakukan auto-approve sepihak.
        </div>
      </section>

      {/* 5. Status Operasional Divisi */}
      <section className={styles.tableCard} aria-label="Status Operasional Divisi">
        <div className={styles.cardEyebrow}>ORGANISASI</div>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.cardTitle}>Status Operasional Divisi</h2>
            <p className={styles.cardSubtitle}>
              Status operasional, dokumen, persetujuan tertunda, dan integrasi sistem lintas 6 divisi.
            </p>
          </div>
          <Link href="/workspace/executive/divisions" className={styles.strategyLink}>
            Lihat Halaman Divisi &rarr;
          </Link>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable} aria-label="Tabel Status Operasional Divisi">
            <thead>
              <tr>
                <th scope="col">Nama Divisi</th>
                <th scope="col">Status</th>
                <th scope="col">Jumlah Dokumen</th>
                <th scope="col">Persetujuan Menunggu</th>
                <th scope="col">Aktivitas GENESIS</th>
              </tr>
            </thead>
            <tbody>
              {divisionItems.map((div) => (
                <tr key={div.division_code} data-testid={`division-health-${div.division_code}`}>
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

      {/* 6. Peringatan Dini */}
      <section className={styles.earlyWarningCard} aria-label="Peringatan Dini">
        <div className={styles.cardEyebrow}>PERINGATAN DINI</div>
        <h2 className={styles.cardTitle}>Peringatan Dini</h2>
        <p className={styles.cardSubtitle}>
          Daftar kendala material, keterlambatan keputusan, dan divisi yang memerlukan perhatian khusus pimpinan.
        </p>

        {earlyWarnings.totalWarnings === 0 ? (
          <div className={styles.emptyState}>
            Tidak ada proyek atau keputusan kritis yang memerlukan eskalasi saat ini.
          </div>
        ) : (
          <div className={styles.warningList} role="list">
            {earlyWarnings.criticalProjects.map((p) => (
              <div
                key={p.project_id}
                className={`${styles.warningItem} ${styles.warningItemCritical}`}
                role="listitem"
                data-testid={`attention-project-${p.project_id}`}
              >
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                    Kemajuan saat ini: {p.progress_percent}%
                  </div>
                </div>
                <span className={`${styles.badge} ${styles.badgeDanger}`}>CRITICAL</span>
              </div>
            ))}

            {earlyWarnings.atRiskProjects.map((p) => (
              <div
                key={p.project_id}
                className={`${styles.warningItem} ${styles.warningItemAtRisk}`}
                role="listitem"
                data-testid={`attention-project-${p.project_id}`}
              >
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                    Kemajuan saat ini: {p.progress_percent}%
                  </div>
                </div>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>AT_RISK</span>
              </div>
            ))}

            {earlyWarnings.overdueDecisions.map((a) => (
              <div
                key={a.approval_id}
                className={`${styles.warningItem} ${styles.warningItemCritical}`}
                role="listitem"
              >
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
              <div
                key={d.division_code}
                className={`${styles.warningItem} ${styles.warningItemAtRisk}`}
                role="listitem"
              >
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

      {/* 7. Portofolio Pekerjaan */}
      <section className={styles.tableCard} aria-label="Portofolio Pekerjaan">
        <div className={styles.cardEyebrow}>PEKERJAAN</div>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.cardTitle}>Portofolio Pekerjaan</h2>
            <p className={styles.cardSubtitle}>
              Status pelaksanaan proyek perusahaan secara ringkas dan terukur tanpa dekorasi berlebihan.
            </p>
          </div>
          <Link href="/workspace/executive/projects" className={styles.strategyLink}>
            Buka Portofolio Proyek &rarr;
          </Link>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable} aria-label="Tabel Distribusi Status Proyek">
            <thead>
              <tr>
                <th scope="col">Status Proyek</th>
                <th scope="col">Jumlah Proyek</th>
                <th scope="col">Persentase</th>
                <th scope="col">Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {distributionItems.map((item) => {
                const pct = totalProjects > 0 ? ((item.count / totalProjects) * 100).toFixed(0) : "0";
                return (
                  <tr key={item.key}>
                    <td>
                      <strong>{item.label}</strong>
                    </td>
                    <td>
                      <strong>{item.count}</strong> Proyek
                    </td>
                    <td>{isDistAvailable ? `${pct}%` : "—"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          item.key === "ON_TRACK"
                            ? styles.badgeSuccess
                            : item.key === "AT_RISK"
                              ? styles.badgeWarning
                              : item.key === "CRITICAL"
                                ? styles.badgeDanger
                                : styles.badgeNeutral
                        }`}
                      >
                        {item.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Bantuan ARA */}
      <section className={styles.araCard} aria-label="Bantuan ARA">
        <div className={styles.araText}>
          <div className={styles.araEyebrow}>AI & ASISTEN</div>
          <h2 className={styles.araTitle}>Bantuan ARA</h2>
          <p className={styles.araDesc}>
            ARA menyediakan analisis kontekstual, ringkasan operasional lintas divisi, dan sintesis data untuk membantu pimpinan.
            ARA hanya membantu memberikan konteks dan analisis. ARA tidak boleh mengambil keputusan untuk pimpinan.
          </p>
        </div>
        <Link href="/workspace/executive/ara" className={styles.araBtn}>
          Buka ARA &rarr;
        </Link>
      </section>
    </div>
  );
}

export function ExecutiveHomeDashboard({
  dashboard,
  snapshot,
}: {
  readonly dashboard?: ExecutiveDashboardSnapshot;
  readonly snapshot?: ExecutiveDashboardSnapshot;
}) {
  return <ExecutiveDashboardHome snapshot={(dashboard ?? snapshot)!} />;
}
