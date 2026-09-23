"use client";

import type { AraActiveContext, ContextEntityType } from "./types";
import styles from "./ara-workspace.module.css";

interface AraContextInspectorProps {
  readonly context: AraActiveContext;
  readonly onOpenPicker?: (type?: ContextEntityType) => void;
  readonly isMobileDrawer?: boolean;
  readonly onCloseDrawer?: () => void;
}

const CONTEXT_TYPES: readonly ContextEntityType[] = [
  "DOCUMENT",
  "PROJECT",
  "TASK",
  "EVIDENCE",
  "FINDING",
  "REPORT",
];

export function AraContextInspector({
  context,
  onOpenPicker,
  isMobileDrawer = false,
  onCloseDrawer,
}: AraContextInspectorProps) {
  const state = context.state || "UNAVAILABLE";

  const statusClass =
    state === "ACTIVE"
      ? styles.statusActive
      : state === "DENIED"
      ? styles.statusDenied
      : state === "NEEDS_INFO"
      ? styles.statusNeedsInfo
      : styles.statusUnavailable;

  const displayState =
    state === "NEEDS_INFO"
      ? "NEEDS INFO"
      : state;

  return (
    <aside
      className={`${styles.railSurface} ${styles.contextInspectorRail}`}
      aria-label="ARA Active Context Inspector"
    >
      {/* Top Header */}
      <div className={styles.inspectorHeader}>
        <span className={styles.railSectionTitle}>ACTIVE CONTEXT</span>
        <span className={`${styles.statusPill} ${statusClass}`}>{displayState}</span>
      </div>

      {/* Denied Alert */}
      {state === "DENIED" && (
        <div className={styles.humanDecisionCard} role="alert">
          <p className={styles.cardTitle}>Akses Konteks Ditolak</p>
          <p style={{ margin: 0 }}>
            {context.denialReason ??
              "Backend menolak otorisasi konteks ini berdasarkan kebijakan akses aktif."}
          </p>
        </div>
      )}

      {/* Needs Info Alert */}
      {state === "NEEDS_INFO" && (
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#92400e",
          }}
          role="status"
        >
          <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Informasi Diperlukan</p>
          <p style={{ margin: 0 }}>
            {context.needsInfoReason ??
              "Lengkapi parameter proyek atau divisi sebelum konteks diaktifkan."}
          </p>
        </div>
      )}

      {/* Workspace & Classification */}
      <div className={styles.scopeSummaryCard}>
        <div>
          <span className={styles.scopeLabel}>Workspace</span>
          <p className={styles.scopeVal} style={{ margin: "2px 0 0" }}>
            {context.workspaceLabel || "Enterprise"}
          </p>
        </div>
        <div>
          <span className={styles.scopeLabel}>Classification</span>
          <div style={{ marginTop: "2px" }}>
            <span className={styles.classificationPill}>
              {context.dataClassification || "INTERNAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Attached Context Types */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span className={styles.railSectionTitle}>CONTEXT YANG DAPAT DILAMPIRKAN</span>
        <div className={styles.contextTypeGrid}>
          {CONTEXT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={styles.contextTypeBtn}
              onClick={() => onOpenPicker?.(type)}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Box */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span className={styles.railSectionTitle}>EVIDENCE</span>
        <div className={styles.evidenceBox}>
          {context.evidenceRefs && context.evidenceRefs.length > 0 ? (
            <p className={styles.evidenceBoxTitle}>
              {context.evidenceRefs.length} Evidence Terverifikasi
            </p>
          ) : (
            <>
              <p className={styles.evidenceBoxTitle}>Belum ada evidence terlampir</p>
              <p className={styles.evidenceBoxSub}>Tambahkan hanya dari picker Backend.</p>
            </>
          )}
        </div>
      </div>

      {/* Authority Boundary */}
      <div className={styles.authorityContainer}>
        <span className={styles.railSectionTitle}>AUTHORITY</span>
        <div className={styles.aiAssistCard}>
          <p className={styles.cardTitle}>AI membantu</p>
          <ul className={styles.authorityList}>
            <li>Ringkas & analisa</li>
            <li>Draft & rekomendasi</li>
            <li>Cari evidence sesuai scope</li>
          </ul>
        </div>
        <div className={styles.humanDecisionCard}>
          <p className={styles.cardTitle}>Manusia memutuskan</p>
          <ul className={styles.authorityList}>
            <li>Approval material</li>
            <li>Transfer / sign / release</li>
            <li>Perubahan authority</li>
          </ul>
        </div>
      </div>

      {/* Footnote */}
      <p className={styles.inspectorFootnote}>
        Diagnostic IDs disembunyikan kecuali dibutuhkan untuk support.
      </p>

      {isMobileDrawer && onCloseDrawer && (
        <button
          type="button"
          onClick={onCloseDrawer}
          className={styles.newChatBtn}
          style={{ marginTop: "12px" }}
        >
          Tutup Inspector
        </button>
      )}
    </aside>
  );
}
