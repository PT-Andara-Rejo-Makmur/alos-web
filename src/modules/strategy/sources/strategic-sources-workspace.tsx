"use client";

import React from "react";
import Link from "next/link";
import { FileText, ExternalLink, Sparkles, FolderOpen } from "lucide-react";
import type { StrategicSourceDocumentViewModel, StrategyContext, StrategySourceState } from "../shared/types";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategySourceStrip } from "../ui/strategy-source-strip";
import { StrategyStatusBadge } from "../ui/strategy-status-badge";
import { StrategyNotice } from "../ui/strategy-notice";
import styles from "../ui/strategy-ui.module.css";

interface StrategicSourcesWorkspaceProps {
  readonly context: StrategyContext;
  readonly sources?: readonly StrategicSourceDocumentViewModel[];
  readonly sourceState?: StrategySourceState;
}

export const StrategicSourcesWorkspace: React.FC<StrategicSourcesWorkspaceProps> = ({
  context,
  sources = [],
  sourceState = "NOT_CONNECTED",
}) => {
  const isSourceConnected = sourceState === "LIVE";
  const documentCenterUrl = `/workspace/${context.workspaceKey}/documents`;

  return (
    <div className={styles.strategyRoot}>
      <StrategyPageHeader
        title="Sumber Dokumen Strategis"
        subtitle="Dokumen acuan formal yang menjadi landasan penetapan sasaran perusahaan, target KPI, dan inisiatif operasional."
        workspaceLabel={context.workspaceLabel}
        sourceState={sourceState}
        actions={
          <div className={styles.headerActionGroup}>
            <div className={styles.actionWithHelper}>
              <button
                type="button"
                className={styles.buttonDisabled}
                disabled
                title="Ekstraksi sasaran dan KPI dari dokumen belum tersedia"
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>Ekstrak Sasaran & KPI</span>
              </button>
              <span className={styles.inlineHelper}>
                Ekstraksi sasaran dan KPI dari dokumen belum tersedia.
              </span>
            </div>
            <Link href={documentCenterUrl} className={styles.buttonSecondary}>
              <FolderOpen size={14} aria-hidden="true" />
              <span>Buka Pusat Dokumen</span>
            </Link>
          </div>
        }
      />

      <StrategyTabs activeTab="sources" workspaceKey={context.workspaceKey} />

      <StrategySourceStrip
        sourceState={sourceState}
        helperText={
          isSourceConnected
            ? "Dokumen terhubung dengan repositori Pusat Dokumen resmi."
            : "Sumber dokumen strategis belum terhubung."
        }
      />

      <StrategyNotice
        variant="info"
        title="Integritas Dokumen Acuan"
        message="Sasaran dan KPI berlandaskan pada dokumen legalitas, rencana strategis tahunan (RST), atau surat keputusan direksi. Sistem ini memanfaatkan repositori dokumen canonical tanpa membuat penyimpanan terpisah."
      />

      {/* Main Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabel Sumber Dokumen Strategis">
          <thead>
            <tr>
              <th scope="col">Dokumen</th>
              <th scope="col">Jenis</th>
              <th scope="col">Versi</th>
              <th scope="col">Pemilik</th>
              <th scope="col">Tanggal</th>
              <th scope="col">Status</th>
              <th scope="col">Referensi</th>
              <th scope="col">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyContainer}>
                    <FileText size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>
                      {isSourceConnected
                        ? "Belum ada dokumen strategis yang dikaitkan"
                        : "Sumber dokumen strategis belum terhubung"}
                    </p>
                    <p className={styles.emptyHelper}>
                      {isSourceConnected
                        ? "Dokumen perencanaan, SK Direksi, dan kebijakan strategis akan ditampilkan di sini."
                        : "Hubungkan modul strategi dengan repositori dokumen authoritative untuk memuat rujukan resmi."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sources.map((doc) => (
                <tr key={doc.id}>
                  <td className={styles.primaryCell}>{doc.document_name}</td>
                  <td>{doc.document_type ?? "Rencana Strategis"}</td>
                  <td className={styles.codeCell}>{doc.version ?? "1.0"}</td>
                  <td>{doc.owner_role_ref ?? "—"}</td>
                  <td>{doc.date ?? "—"}</td>
                  <td>
                    <StrategyStatusBadge status={doc.status ?? "TERCATAT"} />
                  </td>
                  <td className={styles.codeCell}>{doc.reference_code ?? "—"}</td>
                  <td>
                    <Link
                      href={documentCenterUrl}
                      className={styles.tableActionLink}
                      title="Buka dokumen di Pusat Dokumen"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      <span>Buka Dokumen</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
