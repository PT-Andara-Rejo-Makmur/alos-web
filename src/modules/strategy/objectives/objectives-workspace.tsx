"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { StrategyContext, StrategicObjectiveViewModel } from "../shared/types";
import { horizonLabel, strategyStatusLabel } from "../shared/strategy-constants";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategySourceStrip } from "../ui/strategy-source-strip";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategySectionHeader } from "../ui/strategy-section-header";
import { StrategyDataTable } from "../ui/strategy-data-table";
import { StrategyStatusBadge } from "../ui/strategy-status-badge";
import { StrategyFormDrawer } from "../ui/strategy-form-drawer";
import styles from "../ui/strategy-ui.module.css";

interface ObjectivesWorkspaceProps {
  readonly context: StrategyContext;
  readonly objectives?: readonly StrategicObjectiveViewModel[];
}

export function ObjectivesWorkspace({
  context,
  objectives = [],
}: ObjectivesWorkspaceProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isExecutive = context.workspaceKey === "executive";

  const breadcrumb = isExecutive
    ? "ALOS / STRATEGI & KINERJA / SASARAN STRATEGIS"
    : `ALOS / ${context.workspaceLabel.toUpperCase()} / STRATEGI & KINERJA / SASARAN`;

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
            Tambah Sasaran
          </button>
        }
        breadcrumb={breadcrumb}
        description="Daftar sasaran strategis terencana beserta horizon waktu, kepemilikan, dan indikator capaian."
        title="Sasaran Strategis"
      />

      <StrategyTabs activeSubmodule="objectives" workspaceKey={context.workspaceKey} />

      <StrategySourceStrip
        helperText="Sumber sasaran strategis belum terhubung dari Backend."
        state={objectives.length > 0 ? "LIVE" : "NOT_CONNECTED"}
      />

      <section aria-labelledby="objectives-table-title">
        <StrategySectionHeader
          eyebrow="Registri Sasaran"
          id="objectives-table-title"
          subtitle="Sasaran bisnis terstruktur dengan kepemilikan terverifikasi"
          title="Daftar Sasaran"
        />

        <StrategyDataTable
          ariaLabel="Tabel Sasaran Strategis"
          columns={["Sasaran", "Horizon", "Periode", "Pemilik", "Status", "Sumber", "Kinerja"]}
          emptyText="Sumber sasaran strategis belum terhubung."
          isEmpty={objectives.length === 0}
          minWidth={840}
        >
          {objectives.map((obj) => (
            <tr key={obj.id}>
              <td className={styles.primaryCell}>
                <div>{obj.title}</div>
                {obj.description ? (
                  <small style={{ color: "#78716c", fontSize: "11px" }}>{obj.description}</small>
                ) : null}
              </td>
              <td>{horizonLabel(obj.horizon)}</td>
              <td>{obj.period ?? "—"}</td>
              <td>{obj.owner_role_ref ?? "—"}</td>
              <td>
                <StrategyStatusBadge
                  label={strategyStatusLabel(obj.status)}
                  status={obj.status ?? "NOT_CONNECTED"}
                />
              </td>
              <td>{obj.source ?? "—"}</td>
              <td>
                {obj.performance !== null && obj.performance !== undefined
                  ? `${obj.performance}%`
                  : "—"}
              </td>
            </tr>
          ))}
        </StrategyDataTable>
      </section>

      {/* Form Drawer */}
      <StrategyFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        submitLabel="Simpan Sasaran"
        title="Tambah Sasaran Strategis"
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="obj-title">Judul Sasaran</label>
          <input
            className={styles.formInput}
            id="obj-title"
            placeholder="Misal: Peningkatan Efisiensi Operasional Divisi"
            type="text"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="obj-horizon">Horizon Strategis</label>
          <select className={styles.formSelect} id="obj-horizon">
            <option value="SHORT_TERM">Jangka Pendek (&le; 1 tahun)</option>
            <option value="MEDIUM_TERM">Jangka Menengah (2-3 tahun)</option>
            <option value="LONG_TERM">Jangka Panjang (&gt; 3 tahun)</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="obj-period">Periode</label>
          <input className={styles.formInput} id="obj-period" placeholder="Misal: 2026-Q4" type="text" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="obj-owner">Pemilik Akuntabel</label>
          <input className={styles.formInput} id="obj-owner" placeholder="Nama penanggung jawab" type="text" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="obj-desc">Deskripsi</label>
          <textarea
            className={styles.formTextarea}
            id="obj-desc"
            placeholder="Penjelasan sasaran dan rasional bisnis..."
          />
        </div>
      </StrategyFormDrawer>
    </div>
  );
}
