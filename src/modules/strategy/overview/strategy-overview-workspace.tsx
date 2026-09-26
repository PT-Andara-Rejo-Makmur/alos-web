"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Target, TrendingUp, Layers } from "lucide-react";
import type { StrategyContext, StrategyOverviewViewModel } from "../shared/types";
import { DEFAULT_UNCONNECTED_STRATEGY_OVERVIEW } from "../shared/strategy-constants";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategySourceStrip } from "../ui/strategy-source-strip";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategySectionHeader } from "../ui/strategy-section-header";
import { StrategyDataTable } from "../ui/strategy-data-table";
import { StrategyNotice } from "../ui/strategy-notice";
import styles from "../ui/strategy-ui.module.css";

interface StrategyOverviewWorkspaceProps {
  readonly context: StrategyContext;
  readonly initialData?: StrategyOverviewViewModel;
}

export function StrategyOverviewWorkspace({
  context,
  initialData = DEFAULT_UNCONNECTED_STRATEGY_OVERVIEW,
}: StrategyOverviewWorkspaceProps) {
  const [data] = useState<StrategyOverviewViewModel>(initialData);
  const isExecutive = context.workspaceKey === "executive";

  const breadcrumb = isExecutive
    ? "ALOS / STRATEGI & KINERJA EKSEKUTIF"
    : `ALOS / ${context.workspaceLabel.toUpperCase()} / STRATEGI & KINERJA`;

  const pageTitle = isExecutive
    ? "Strategi & Kinerja Perusahaan"
    : `Strategi & Kinerja ${context.workspaceLabel}`;

  const pageDesc = isExecutive
    ? "Sasaran strategis, KPI perusahaan, inisiatif terpadu, review berkala, dan revisi target terverifikasi."
    : `Sasaran, KPI, inisiatif, dan review kinerja dalam cakupan divisi ${context.workspaceLabel}.`;

  const basePath = `/workspace/${context.workspaceKey}/strategy`;

  return (
    <div className={styles.strategyRoot}>
      {/* 1. Header */}
      <StrategyPageHeader
        breadcrumb={breadcrumb}
        description={pageDesc}
        title={pageTitle}
      />

      {/* 2. Submodule Navigation Tabs */}
      <StrategyTabs activeSubmodule="overview" workspaceKey={context.workspaceKey} />

      {/* 3. Section 1: Sumber Strategi */}
      <StrategySourceStrip state={data.source_state} />

      {/* 4. Section 2: Horizon Strategis */}
      <section aria-labelledby="strategy-horizon-title">
        <StrategySectionHeader
          eyebrow="Kerangka Waktu"
          id="strategy-horizon-title"
          subtitle="Pemetaan sasaran bisnis berdasarkan horizon implementasi"
          title="Horizon Strategis"
        />
        <div className={styles.horizonGrid}>
          <article className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target aria-hidden={true} size={18} style={{ color: "#0b8b4b" }} />
              <h3 className={styles.cardTitle}>Jangka Pendek</h3>
            </div>
            <p className={styles.cardText}>
              Fokus pada eksekusi operasional tahun berjalan, efisiensi proses, dan pemenuhan target berkala divisi.
            </p>
            <div style={{ fontSize: "11px", color: "#78716c", marginTop: "auto" }}>
              Status sumber: Belum terhubung
            </div>
          </article>

          <article className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp aria-hidden={true} size={18} style={{ color: "#1686df" }} />
              <h3 className={styles.cardTitle}>Jangka Menengah</h3>
            </div>
            <p className={styles.cardText}>
              Ekspansi kapasitas bisnis 2-3 tahun, integrasi sistem informasi terpadu, dan penguatan rantai pasok.
            </p>
            <div style={{ fontSize: "11px", color: "#78716c", marginTop: "auto" }}>
              Status sumber: Belum terhubung
            </div>
          </article>

          <article className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers aria-hidden={true} size={18} style={{ color: "#7655d5" }} />
              <h3 className={styles.cardTitle}>Jangka Panjang</h3>
            </div>
            <p className={styles.cardText}>
              Transformasi bisnis berkelanjutan, keunggulan kompetitif jangka panjang, dan diversifikasi portofolio perusahaan.
            </p>
            <div style={{ fontSize: "11px", color: "#78716c", marginTop: "auto" }}>
              Status sumber: Belum terhubung
            </div>
          </article>
        </div>
      </section>

      {/* 5. Section 3: Sasaran Perusahaan / Divisi */}
      <section aria-labelledby="strategy-objectives-title">
        <StrategySectionHeader
          action={
            <Link className={styles.buttonSecondary} href={`${basePath}/objectives`}>
              Lihat Semua Sasaran <ArrowRight aria-hidden={true} size={14} />
            </Link>
          }
          eyebrow="Arah Bisnis"
          id="strategy-objectives-title"
          subtitle={isExecutive ? "Sasaran strategis tingkat perusahaan" : `Sasaran tingkat divisi ${context.workspaceLabel}`}
          title={isExecutive ? "Sasaran Perusahaan" : "Sasaran Divisi"}
        />
        <StrategyDataTable
          ariaLabel="Tabel Sasaran Strategis Ringkas"
          columns={["Sasaran", "Horizon", "Periode", "Pemilik", "Status"]}
          emptyText="Sumber sasaran strategis belum terhubung dari Backend."
          isEmpty={data.objectives.length === 0}
        >
          {data.objectives.slice(0, 5).map((obj) => (
            <tr key={obj.id}>
              <td className={styles.primaryCell}>{obj.title}</td>
              <td>{obj.horizon ?? "—"}</td>
              <td>{obj.period ?? "—"}</td>
              <td>{obj.owner ?? "—"}</td>
              <td>{obj.status ?? "—"}</td>
            </tr>
          ))}
        </StrategyDataTable>
      </section>

      {/* 6. Section 4: KPI Perusahaan / Divisi */}
      <section aria-labelledby="strategy-kpis-title">
        <StrategySectionHeader
          action={
            <Link className={styles.buttonSecondary} href={`${basePath}/kpis`}>
              Lihat Semua KPI <ArrowRight aria-hidden={true} size={14} />
            </Link>
          }
          eyebrow="Pengukuran Kinerja"
          id="strategy-kpis-title"
          subtitle="Indikator kinerja utama terukur"
          title={isExecutive ? "KPI Perusahaan" : "KPI Divisi"}
        />
        <StrategyDataTable
          ariaLabel="Tabel KPI Ringkas"
          columns={["KPI", "Sasaran", "Target", "Aktual", "Capaian", "Status"]}
          emptyText="Sumber indikator kinerja utama (KPI) belum terhubung dari Backend."
          isEmpty={data.kpis.length === 0}
        >
          {data.kpis.slice(0, 5).map((kpi) => (
            <tr key={kpi.id}>
              <td className={styles.primaryCell}>{kpi.name}</td>
              <td>{kpi.objective_title ?? "—"}</td>
              <td>{kpi.target ?? "—"}</td>
              <td>{kpi.actual ?? "—"}</td>
              <td>{kpi.achievement_percent !== null && kpi.achievement_percent !== undefined ? `${kpi.achievement_percent}%` : "—"}</td>
              <td>{kpi.status ?? "—"}</td>
            </tr>
          ))}
        </StrategyDataTable>
      </section>

      {/* 7. Section 5: Inisiatif Strategis */}
      <section aria-labelledby="strategy-initiatives-title">
        <StrategySectionHeader
          action={
            <Link className={styles.buttonSecondary} href={`${basePath}/initiatives`}>
              Lihat Semua Inisiatif <ArrowRight aria-hidden={true} size={14} />
            </Link>
          }
          eyebrow="Program Kerja"
          id="strategy-initiatives-title"
          subtitle="Inisiatif strategis penghubung sasaran dan proyek operasional"
          title="Inisiatif Strategis"
        />
        <StrategyDataTable
          ariaLabel="Tabel Inisiatif Ringkas"
          columns={["Inisiatif", "Sasaran Terkait", "Pemilik", "Periode", "Proyek Terkait"]}
          emptyText="Tautan inisiatif strategis ke proyek belum tersedia dari Backend."
          isEmpty={data.initiatives.length === 0}
        >
          {data.initiatives.slice(0, 5).map((init) => (
            <tr key={init.id}>
              <td className={styles.primaryCell}>{init.title}</td>
              <td>{init.objective_title ?? "—"}</td>
              <td>{init.owner ?? "—"}</td>
              <td>{init.period ?? "—"}</td>
              <td>{init.related_project_names?.join(", ") || "—"}</td>
            </tr>
          ))}
        </StrategyDataTable>
      </section>

      {/* 8. Section 6: Status Kinerja */}
      <section aria-labelledby="strategy-performance-status-title">
        <StrategySectionHeader
          eyebrow="Pemantauan Kinerja & Peringatan Dini"
          id="strategy-performance-status-title"
          subtitle="Distribusi status sasaran dan KPI berdasarkan indikator evaluasi resmi"
          title="Status Kinerja"
        />
        <div className={styles.cardGrid}>
          <article className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className={styles.cardTitle}>Sesuai Rencana</span>
              <span style={{ fontSize: "12px", color: "#0b8b4b", fontWeight: 600 }}>SESUAI RENCANA</span>
            </div>
            <p className={styles.cardText}>Target berjalan sesuai jadwal dan ambang batas indikator capaian resmi.</p>
            <div style={{ fontSize: "12px", color: "#78716c", marginTop: "auto" }}>
              Data resmi: Belum tersedia
            </div>
          </article>
          <article className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className={styles.cardTitle}>Berisiko</span>
              <span style={{ fontSize: "12px", color: "#b45309", fontWeight: 600 }}>BERISIKO</span>
            </div>
            <p className={styles.cardText}>Terdapat potensi deviasi atau keterlambatan pencapaian target berkala.</p>
            <div style={{ fontSize: "12px", color: "#78716c", marginTop: "auto" }}>
              Data resmi: Belum tersedia
            </div>
          </article>
          <article className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className={styles.cardTitle}>Tidak Sesuai Rencana</span>
              <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>TIDAK SESUAI RENCANA</span>
            </div>
            <p className={styles.cardText}>Deviasi signifikan membutuhkan tinjauan akar penyebab dan tindakan korektif.</p>
            <div style={{ fontSize: "12px", color: "#78716c", marginTop: "auto" }}>
              Data resmi: Belum tersedia
            </div>
          </article>
        </div>
      </section>

      {/* 9. Section 7 & 8: Review yang Membutuhkan Perhatian & Revisi Target yang Menunggu Keputusan */}
      <div className={styles.cardGrid}>
        <section aria-labelledby="strategy-reviews-title" className={styles.card}>
          <StrategySectionHeader
            action={
              <Link className={styles.buttonSecondary} href={`${basePath}/reviews`}>
                Buka Review <ArrowRight aria-hidden={true} size={14} />
              </Link>
            }
            eyebrow="Monitoring Kinerja"
            id="strategy-reviews-title"
            title="Review yang Membutuhkan Perhatian"
          />
          <p className={styles.cardText}>
            Evaluasi berkala terhadap pencapaian target dan analisis akar penyebab deviasi kinerja.
          </p>
          <div style={{ marginTop: "12px" }}>
            <StrategyNotice variant="neutral">
              Sumber review berkala belum terhubung dari Backend. Tindakan perbaikan tidak dapat dibuat secara lokal.
            </StrategyNotice>
          </div>
        </section>

        <section aria-labelledby="strategy-revisions-title" className={styles.card}>
          <StrategySectionHeader
            action={
              <Link className={styles.buttonSecondary} href={`${basePath}/revisions`}>
                Buka Revisi <ArrowRight aria-hidden={true} size={14} />
              </Link>
            }
            eyebrow="Tata Kelola Target"
            id="strategy-revisions-title"
            title="Revisi Target yang Menunggu Keputusan"
          />
          <p className={styles.cardText}>
            Pengusulan perubahan target resmi melalui audit trail terverifikasi tanpa menimpa data historis.
          </p>
          <div style={{ marginTop: "12px" }}>
            <StrategyNotice variant="neutral">
              Sumber riwayat revisi target belum terhubung. Perubahan target historis tetap terlindungi.
            </StrategyNotice>
          </div>
        </section>
      </div>

      {/* 9. Advisory Area: Bantuan ARA */}
      <section
        aria-label="Dukungan AI ARA"
        className={styles.card}
        style={{ backgroundColor: "#f8fafc", borderColor: "#cbd5e1" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bot aria-hidden={true} size={20} style={{ color: "#0284c7" }} />
            <div>
              <h3 className={styles.cardTitle}>Bantuan ARA untuk Analisis Kinerja</h3>
              <p className={styles.cardText}>
                ARA dapat membantu mensintesis capaian, menganalisis faktor deviasi, dan menyarankan rancangan tindak lanjut berbasis data operasional.
              </p>
            </div>
          </div>
          <Link
            className={styles.buttonSecondary}
            href={`/workspace/${context.workspaceKey}/ara`}
          >
            Buka ARA <ArrowRight aria-hidden={true} size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
