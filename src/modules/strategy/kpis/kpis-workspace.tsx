"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { StrategyContext, KpiViewModel } from "../shared/types";
import {
  formatAchievementPercent,
  measurementTypeLabel,
  strategyStatusLabel,
} from "../shared/strategy-constants";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategySourceStrip } from "../ui/strategy-source-strip";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategySectionHeader } from "../ui/strategy-section-header";
import { StrategyDataTable } from "../ui/strategy-data-table";
import { StrategyStatusBadge } from "../ui/strategy-status-badge";
import { StrategyFormDrawer } from "../ui/strategy-form-drawer";
import styles from "../ui/strategy-ui.module.css";

interface KpisWorkspaceProps {
  readonly context: StrategyContext;
  readonly kpis?: readonly KpiViewModel[];
}

export function KpisWorkspace({
  context,
  kpis = [],
}: KpisWorkspaceProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isExecutive = context.workspaceKey === "executive";

  const breadcrumb = isExecutive
    ? "ALOS / STRATEGI & KINERJA / KPI PERUSAHAAN"
    : `ALOS / ${context.workspaceLabel.toUpperCase()} / STRATEGI & KINERJA / KPI`;

  return (
    <div className={styles.strategyRoot}>
      <StrategyPageHeader
        action={
          <button
            className={styles.buttonPrimary}
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            <Plus aria-hidden={true} size={16} />
            Tambah KPI
          </button>
        }
        breadcrumb={breadcrumb}
        description="Indikator kinerja utama terukur dengan tipe pengukuran, target periodik, nilai aktual, dan tingkat capaian."
        title="Indikator Kinerja Utama (KPI)"
      />

      <StrategyTabs activeSubmodule="kpis" workspaceKey={context.workspaceKey} />

      <StrategySourceStrip
        helperText="Sumber indikator kinerja utama belum terhubung dari Backend."
        state={kpis.length > 0 ? "LIVE" : "NOT_CONNECTED"}
      />

      <section aria-labelledby="kpis-table-title">
        <StrategySectionHeader
          eyebrow="Registri Pengukuran"
          id="kpis-table-title"
          subtitle="Daftar metrik operasional dan strategis"
          title="Daftar KPI"
        />

        <StrategyDataTable
          ariaLabel="Tabel Indikator Kinerja Utama (KPI)"
          columns={[
            "KPI",
            "Sasaran",
            "Pemilik",
            "Target",
            "Aktual",
            "Capaian",
            "Status",
            "Sumber Data",
            "Periode",
          ]}
          emptyText="Sumber indikator kinerja utama (KPI) belum terhubung dari Backend."
          isEmpty={kpis.length === 0}
          minWidth={960}
        >
          {kpis.map((kpi) => {
            // Capaian tidak boleh dihitung sembarangan jika target/aktual null
            const capaianDisplay =
              kpi.achievement_percent !== null && kpi.achievement_percent !== undefined
                ? formatAchievementPercent(kpi.achievement_percent)
                : "BELUM TERSEDIA";

            return (
              <tr key={kpi.id}>
                <td className={styles.primaryCell}>
                  <div>{kpi.name}</div>
                  {kpi.measurement_type ? (
                    <small style={{ color: "#78716c", fontSize: "11px" }}>
                      {measurementTypeLabel(kpi.measurement_type)}
                    </small>
                  ) : null}
                </td>
                <td>{kpi.objective_title ?? "—"}</td>
                <td>{kpi.owner_role_ref ?? "—"}</td>
                <td className={styles.codeCell}>
                  {kpi.target !== null && kpi.target !== undefined ? `${kpi.target} ${kpi.unit ?? ""}` : "—"}
                </td>
                <td className={styles.codeCell}>
                  {kpi.actual !== null && kpi.actual !== undefined ? `${kpi.actual} ${kpi.unit ?? ""}` : "—"}
                </td>
                <td>{capaianDisplay}</td>
                <td>
                  <StrategyStatusBadge
                    label={strategyStatusLabel(kpi.status)}
                    status={kpi.status ?? "NOT_CONNECTED"}
                  />
                </td>
                <td>{kpi.data_source ?? "—"}</td>
                <td>{kpi.period ?? "—"}</td>
              </tr>
            );
          })}
        </StrategyDataTable>
      </section>

      {/* Form Drawer */}
      <StrategyFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        submitLabel="Simpan KPI"
        title="Tambah Indikator Kinerja Utama (KPI)"
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="kpi-name">Nama KPI</label>
          <input className={styles.formInput} id="kpi-name" placeholder="Misal: Tingkat Kepuasan Penyewa Properti" type="text" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="kpi-measurement">Jenis Pengukuran</label>
          <select className={styles.formSelect} id="kpi-measurement">
            <option value="HIGHER_IS_BETTER">Semakin tinggi semakin baik (&gt;= Target)</option>
            <option value="LOWER_IS_BETTER">Semakin rendah semakin baik (&lt;= Target)</option>
            <option value="PERCENTAGE">Persentase (0 - 100%)</option>
            <option value="BINARY">Biner (Tercapai / Belum)</option>
            <option value="MILESTONE">Tahapan Milestone</option>
            <option value="CUMULATIVE">Akumulatif</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="kpi-target">Nilai Target</label>
          <input className={styles.formInput} id="kpi-target" placeholder="Misal: 95" type="text" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="kpi-unit">Satuan (Unit)</label>
          <input className={styles.formInput} id="kpi-unit" placeholder="Misal: %, hari, dokumen" type="text" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="kpi-period">Periode Evaluasi</label>
          <input className={styles.formInput} id="kpi-period" placeholder="Misal: 2026-Q3" type="text" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="kpi-owner">Pemilik Akuntabel</label>
          <input className={styles.formInput} id="kpi-owner" placeholder="Nama penanggung jawab" type="text" />
        </div>
      </StrategyFormDrawer>
    </div>
  );
}
