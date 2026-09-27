"use client";

import React, { useState } from "react";
import { Plus, Layers, Link2Off } from "lucide-react";
import type { InitiativeViewModel, StrategyContext, StrategySourceState } from "../shared/types";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategySourceStrip } from "../ui/strategy-source-strip";
import { StrategyStatusBadge } from "../ui/strategy-status-badge";
import { StrategyFormDrawer } from "../ui/strategy-form-drawer";
import { StrategyNotice } from "../ui/strategy-notice";
import styles from "../ui/strategy-ui.module.css";

interface InitiativesWorkspaceProps {
  readonly context: StrategyContext;
  readonly initiatives?: readonly InitiativeViewModel[];
  readonly sourceState?: StrategySourceState;
}

export const InitiativesWorkspace: React.FC<InitiativesWorkspaceProps> = ({
  context,
  initiatives = [],
  sourceState = "NOT_CONNECTED",
}) => {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const isSourceConnected = sourceState === "LIVE";

  return (
    <div className={styles.strategyRoot}>
      <StrategyPageHeader
        title="Inisiatif Strategis"
        subtitle={
          context.isCompanyWide
            ? "Portofolio inisiatif strategis perusahaan untuk merealisasikan sasaran dan target KPI."
            : `Portofolio inisiatif strategis yang berada dalam lingkup ${context.workspaceLabel}.`
        }
        workspaceLabel={context.workspaceLabel}
        sourceState={sourceState}
        actions={
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => setIsAddDrawerOpen(true)}
          >
            <Plus size={15} aria-hidden="true" />
            <span>Tambah Inisiatif</span>
          </button>
        }
      />

      <StrategyTabs activeTab="initiatives" workspaceKey={context.workspaceKey} />

      <StrategySourceStrip
        sourceState={sourceState}
        helperText={
          isSourceConnected
            ? "Inisiatif terhubung dengan data authoritative Backend."
            : "Sumber inisiatif strategis dan pemetaan proyek dari Backend belum tersedia."
        }
      />

      {!isSourceConnected && (
        <StrategyNotice
          variant="info"
          title="Tautan Inisiatif ke Proyek Belum Terhubung"
          message="Tautan inisiatif ke proyek belum tersedia dari Backend. Pemetaan antara sasaran bisnis dan proyek operasional akan tampil otomatis ketika kontrak data terhubung."
        />
      )}

      {/* Main Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabel Inisiatif Strategis">
          <thead>
            <tr>
              <th scope="col">Inisiatif</th>
              <th scope="col">Sasaran</th>
              <th scope="col">KPI Terkait</th>
              <th scope="col">Pemilik</th>
              <th scope="col">Periode</th>
              <th scope="col">Status</th>
              <th scope="col">Proyek Terkait</th>
            </tr>
          </thead>
          <tbody>
            {initiatives.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.emptyContainer}>
                    <Layers size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>
                      {isSourceConnected
                        ? "Belum ada inisiatif strategis terdaftar"
                        : "Sumber inisiatif strategis belum terhubung"}
                    </p>
                    <p className={styles.emptyHelper}>
                      {isSourceConnected
                        ? "Inisiatif strategis yang ditetapkan akan tercantum di sini."
                        : "Hubungkan modul strategi dengan Backend authoritative untuk memuat inisiatif dan relasi proyek."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              initiatives.map((item) => (
                <tr key={item.id}>
                  <td className={styles.primaryCell}>
                    <div>{item.title}</div>
                    {item.description && (
                      <div className={styles.subtextCell}>{item.description}</div>
                    )}
                  </td>
                  <td>{item.objective_title ?? item.objective_id ?? "—"}</td>
                  <td>
                    {item.kpi_names && item.kpi_names.length > 0 ? (
                      <div className={styles.tagList}>
                        {item.kpi_names.map((name, i) => (
                          <span key={i} className={styles.tag}>
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{item.owner_role_ref ?? "—"}</td>
                  <td>{item.period ?? "—"}</td>
                  <td>
                    <StrategyStatusBadge status={item.status} />
                  </td>
                  <td>
                    {item.related_project_names && item.related_project_names.length > 0 ? (
                      <div className={styles.tagList}>
                        {item.related_project_names.map((proj, i) => (
                          <span key={i} className={styles.tagProject}>
                            {proj}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={styles.unlinkedText}>
                        <Link2Off size={12} aria-hidden="true" />
                        <span>Belum tertaut</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Drawer */}
      <StrategyFormDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Tambah Inisiatif Strategis"
        description="Daftarkan inisiatif strategis baru untuk mencapai sasaran bisnis. Data ini memerlukan otorisasi Backend sebelum disimpan."
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="init-title">
            Nama Inisiatif <span className={styles.required}>*</span>
          </label>
          <input
            id="init-title"
            type="text"
            className={styles.formInput}
            placeholder="Contoh: Digitalisasi Arsip Legalitas & Kontrak Perusahaan"
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="init-obj">
            Sasaran Strategis Terkait
          </label>
          <select id="init-obj" className={styles.formSelect} disabled>
            <option value="">Pilih Sasaran Strategis (Menunggu Data Backend)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="init-owner">
            Divisi / Penanggung Jawab
          </label>
          <input
            id="init-owner"
            type="text"
            className={styles.formInput}
            placeholder="Contoh: Divisi IT & Operasional"
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="init-period">
            Periode Pelaksanaan
          </label>
          <input
            id="init-period"
            type="text"
            className={styles.formInput}
            placeholder="Contoh: Q1 - Q3 2026"
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="init-desc">
            Deskripsi & Cakupan
          </label>
          <textarea
            id="init-desc"
            className={styles.formTextarea}
            rows={3}
            placeholder="Jelaskan rasional dan ruang lingkup inisiatif ini..."
            readOnly
          />
        </div>
      </StrategyFormDrawer>
    </div>
  );
};
