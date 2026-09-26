"use client";

import React, { useState } from "react";
import { Plus, History, FileText } from "lucide-react";
import type { TargetRevisionViewModel, StrategyContext, StrategySourceState } from "../shared/types";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategySourceStrip } from "../ui/strategy-source-strip";
import { StrategyStatusBadge } from "../ui/strategy-status-badge";
import { StrategyFormDrawer } from "../ui/strategy-form-drawer";
import { StrategyNotice } from "../ui/strategy-notice";
import styles from "../ui/strategy-ui.module.css";

interface TargetRevisionsWorkspaceProps {
  readonly context: StrategyContext;
  readonly revisions?: readonly TargetRevisionViewModel[];
  readonly sourceState?: StrategySourceState;
}

export const TargetRevisionsWorkspace: React.FC<TargetRevisionsWorkspaceProps> = ({
  context,
  revisions = [],
  sourceState = "NOT_CONNECTED",
}) => {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const isSourceConnected = sourceState === "CONNECTED";

  return (
    <div className={styles.strategyRoot}>
      <StrategyPageHeader
        title="Revisi Target"
        subtitle="Tata kelola perubahan dan riwayat versi target strategis melalui alur usulan, telaah, bukti, dan persetujuan resmi."
        workspaceLabel={context.workspaceLabel}
        sourceState={sourceState}
        actions={
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => setIsAddDrawerOpen(true)}
          >
            <Plus size={15} aria-hidden="true" />
            <span>Usulkan Revisi Target</span>
          </button>
        }
      />

      <StrategyTabs activeTab="revisions" workspaceKey={context.workspaceKey} />

      <StrategySourceStrip
        sourceState={sourceState}
        helperText={
          isSourceConnected
            ? "Riwayat versi target terhubung dengan catatan authoritative Backend."
            : "Sumber riwayat revisi target belum terhubung."
        }
      />

      <StrategyNotice
        variant="info"
        title="Prinsip Tata Kelola Target Historis"
        message="Target aktif tidak boleh ditimpa secara diam-diam. Setiap perubahan target wajib melalui usulan revisi, pencantuman alasan dan bukti pendukung, proses telaah serta persetujuan formal sebelum menerbitkan versi target baru."
      />

      {/* Main Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabel Riwayat Revisi Target">
          <thead>
            <tr>
              <th scope="col">Target</th>
              <th scope="col">Versi</th>
              <th scope="col">Nilai Sebelumnya</th>
              <th scope="col">Nilai Usulan</th>
              <th scope="col">Alasan</th>
              <th scope="col">Pengusul</th>
              <th scope="col">Penyetuju</th>
              <th scope="col">Tanggal Efektif</th>
              <th scope="col">Status</th>
              <th scope="col">Bukti</th>
            </tr>
          </thead>
          <tbody>
            {revisions.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.emptyCell}>
                  <div className={styles.emptyContainer}>
                    <History size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>
                      {isSourceConnected
                        ? "Belum ada riwayat usulan revisi target"
                        : "Sumber riwayat revisi target belum terhubung"}
                    </p>
                    <p className={styles.emptyHelper}>
                      {isSourceConnected
                        ? "Usulan revisi target dan riwayat audit versi akan ditampilkan di sini."
                        : "Hubungkan modul strategi dengan Backend authoritative untuk memuat riwayat revisi dan audit trail target."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              revisions.map((rev) => (
                <tr key={rev.id}>
                  <td className={styles.primaryCell}>{rev.target_name}</td>
                  <td className={styles.codeCell}>{rev.version}</td>
                  <td>{rev.previous_value ?? "—"}</td>
                  <td className={styles.primaryCell}>{rev.proposed_value ?? "—"}</td>
                  <td className={styles.textWrapCell}>{rev.reason}</td>
                  <td>{rev.proposer ?? "—"}</td>
                  <td>{rev.approver ?? "—"}</td>
                  <td>{rev.effective_date ?? "—"}</td>
                  <td>
                    <StrategyStatusBadge status={rev.status} />
                  </td>
                  <td>
                    {rev.evidence_refs && rev.evidence_refs.length > 0 ? (
                      <span className={styles.evidenceRef}>
                        <FileText size={12} aria-hidden="true" />
                        <span>{rev.evidence_refs.length} dokumen</span>
                      </span>
                    ) : (
                      "—"
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
        title="Usulkan Revisi Target"
        description="Ajukan usulan penyesuaian nilai target. Usulan ini akan diverifikasi oleh pimpinan otoritatif dan tidak akan menimpa target historis secara langsung."
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-target-name">
            Target yang Diusulkan Berubah <span className={styles.required}>*</span>
          </label>
          <select id="rev-target-name" className={styles.formSelect} disabled>
            <option value="">Pilih Target Aktif (Menunggu Data Backend)</option>
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="rev-prev-val">
              Nilai Saat Ini
            </label>
            <input
              id="rev-prev-val"
              type="text"
              className={styles.formInput}
              placeholder="Otomatis dari target aktif"
              readOnly
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="rev-prop-val">
              Nilai Usulan Baru <span className={styles.required}>*</span>
            </label>
            <input
              id="rev-prop-val"
              type="text"
              className={styles.formInput}
              placeholder="Masukkan nilai target baru"
              readOnly
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-reason">
            Alasan Penyesuaian Target <span className={styles.required}>*</span>
          </label>
          <textarea
            id="rev-reason"
            className={styles.formTextarea}
            rows={3}
            placeholder="Jelaskan justifikasi bisnis, perubahan kondisi pasar, regulasi, atau kapasitas operasional..."
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-evidence">
            Dokumen Bukti / Dasar Pertimbangan
          </label>
          <input
            id="rev-evidence"
            type="text"
            className={styles.formInput}
            placeholder="Referensi memo atau telaah strategis"
            readOnly
          />
        </div>
      </StrategyFormDrawer>
    </div>
  );
};
