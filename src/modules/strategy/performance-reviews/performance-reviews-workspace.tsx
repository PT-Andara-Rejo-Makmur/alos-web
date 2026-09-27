"use client";

import React, { useState } from "react";
import { Plus, CheckSquare, FileText, ChevronDown, ChevronRight } from "lucide-react";
import type { PerformanceReviewViewModel, StrategyContext, StrategySourceState } from "../shared/types";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategySourceStrip } from "../ui/strategy-source-strip";
import { StrategyStatusBadge } from "../ui/strategy-status-badge";
import { StrategyFormDrawer } from "../ui/strategy-form-drawer";
import { CorrectiveActionsPanel } from "../corrective-actions/corrective-actions-panel";
import styles from "../ui/strategy-ui.module.css";

interface PerformanceReviewsWorkspaceProps {
  readonly context: StrategyContext;
  readonly reviews?: readonly PerformanceReviewViewModel[];
  readonly sourceState?: StrategySourceState;
}

export const PerformanceReviewsWorkspace: React.FC<PerformanceReviewsWorkspaceProps> = ({
  context,
  reviews = [],
  sourceState = "NOT_CONNECTED",
}) => {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const isSourceConnected = sourceState === "LIVE";

  return (
    <div className={styles.strategyRoot}>
      <StrategyPageHeader
        title="Review Kinerja"
        subtitle={
          context.isCompanyWide
            ? "Evaluasi periodik pencapaian target strategis dan perumusan tindakan perbaikan tingkat korporasi."
            : `Evaluasi berkala sasaran dan KPI dalam lingkup ${context.workspaceLabel}.`
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
            <span>Buat Review</span>
          </button>
        }
      />

      <StrategyTabs activeTab="reviews" workspaceKey={context.workspaceKey} />

      <StrategySourceStrip
        sourceState={sourceState}
        helperText={
          isSourceConnected
            ? "Review kinerja terhubung dengan riwayat evaluasi authoritative Backend."
            : "Sumber review kinerja belum terhubung."
        }
      />

      {/* Main Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabel Review Kinerja">
          <thead>
            <tr>
              <th scope="col" style={{ width: "36px" }}></th>
              <th scope="col">Periode</th>
              <th scope="col">Sasaran / KPI</th>
              <th scope="col">Target</th>
              <th scope="col">Aktual</th>
              <th scope="col">Selisih</th>
              <th scope="col">Status</th>
              <th scope="col">Pemilik</th>
              <th scope="col">Review Berikutnya</th>
              <th scope="col">Bukti</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.emptyCell}>
                  <div className={styles.emptyContainer}>
                    <CheckSquare size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>
                      {isSourceConnected
                        ? "Belum ada evaluasi kinerja yang tercatat"
                        : "Sumber review kinerja belum terhubung"}
                    </p>
                    <p className={styles.emptyHelper}>
                      {isSourceConnected
                        ? "Evaluasi berkala terhadap KPI dan sasaran akan ditampilkan di sini."
                        : "Hubungkan modul strategi dengan Backend authoritative untuk memuat riwayat review kinerja."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reviews.map((rev) => {
                const isExpanded = selectedReviewId === rev.id;
                return (
                  <React.Fragment key={rev.id}>
                    <tr
                      className={isExpanded ? styles.activeRow : undefined}
                      onClick={() => setSelectedReviewId(isExpanded ? null : rev.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {isExpanded ? (
                          <ChevronDown size={14} className={styles.chevronIcon} aria-hidden="true" />
                        ) : (
                          <ChevronRight size={14} className={styles.chevronIcon} aria-hidden="true" />
                        )}
                      </td>
                      <td className={styles.codeCell}>{rev.period}</td>
                      <td className={styles.primaryCell}>{rev.target_item}</td>
                      <td>{rev.target_value ?? "—"}</td>
                      <td>{rev.actual_value ?? "—"}</td>
                      <td>
                        {rev.gap !== undefined && rev.gap !== null ? (
                          <span className={styles.codeCell}>{rev.gap}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <StrategyStatusBadge status={rev.status} />
                      </td>
                      <td>{rev.owner_role_ref ?? "—"}</td>
                      <td>{rev.next_review_date ?? "—"}</td>
                      <td>
                        {rev.evidence_refs && rev.evidence_refs.length > 0 ? (
                          <span className={styles.evidenceRef}>
                            <FileText size={12} aria-hidden="true" />
                            <span>{rev.evidence_refs.length} tautan</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className={styles.expandedDetailCell}>
                          <div className={styles.reviewDetailContainer}>
                            <div className={styles.analysisGrid}>
                              <div className={styles.analysisCard}>
                                <div className={styles.sectionEyebrow}>Penyebab & Analisis</div>
                                <h5 className={styles.analysisTitle}>Analisis Penyebab</h5>
                                <p className={styles.analysisContent}>
                                  {rev.root_cause_analysis ?? "Belum ada analisis penyebab tercatat."}
                                </p>
                              </div>
                              <div className={styles.analysisCard}>
                                <div className={styles.sectionEyebrow}>Tinjauan Dampak</div>
                                <h5 className={styles.analysisTitle}>Dampak Terhadap Sasaran</h5>
                                <p className={styles.analysisContent}>
                                  {rev.impact_analysis ?? "Belum ada analisis dampak tercatat."}
                                </p>
                              </div>
                            </div>

                            <CorrectiveActionsPanel
                              items={rev.corrective_actions}
                              reviewId={rev.id}
                              isBackendConnected={isSourceConnected}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Form Drawer */}
      <StrategyFormDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Buat Review Kinerja"
        description="Catat evaluasi berkala terhadap pencapaian target KPI atau sasaran strategis. Data ini memerlukan otorisasi Backend sebelum disimpan."
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-item">
            Sasaran / KPI yang Dievaluasi <span className={styles.required}>*</span>
          </label>
          <select id="rev-item" className={styles.formSelect} disabled>
            <option value="">Pilih Target atau KPI (Menunggu Data Backend)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-period">
            Periode Review <span className={styles.required}>*</span>
          </label>
          <input
            id="rev-period"
            type="text"
            className={styles.formInput}
            placeholder="Contoh: Q1 2026 atau Maret 2026"
            readOnly
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="rev-target">
              Target
            </label>
            <input
              id="rev-target"
              type="text"
              className={styles.formInput}
              placeholder="Nilai target terdaftar"
              readOnly
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="rev-actual">
              Realisasi Aktual
            </label>
            <input
              id="rev-actual"
              type="text"
              className={styles.formInput}
              placeholder="Nilai realisasi"
              readOnly
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-status">
            Kesimpulan Status Evaluasi
          </label>
          <select id="rev-status" className={styles.formSelect} disabled>
            <option value="">Pilih Status (SESUAI RENCANA / BERISIKO / dll)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-root-cause">
            Analisis Akar Masalah (Root Cause)
          </label>
          <textarea
            id="rev-root-cause"
            className={styles.formTextarea}
            rows={3}
            placeholder="Jelaskan faktor internal atau eksternal yang mempengaruhi capaian..."
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="rev-impact">
            Dampak Bisnis
          </label>
          <textarea
            id="rev-impact"
            className={styles.formTextarea}
            rows={2}
            placeholder="Dampak terhadap sasaran divisi atau korporasi..."
            readOnly
          />
        </div>
      </StrategyFormDrawer>
    </div>
  );
};
