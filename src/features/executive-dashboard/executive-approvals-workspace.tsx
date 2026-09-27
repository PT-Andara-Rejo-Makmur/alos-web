"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, BadgeCheck, CheckCircle2 } from "lucide-react";

import { authenticatedApiRequest } from "@/lib/api";
import { ApprovalsWorkspace } from "@/modules/work";
import type { WorkWorkspaceContext } from "@/modules/work/shared/types";
import {
  backendReleaseAdapter,
  type DecisionOutcome,
  type GovernedReleaseProjection,
} from "@/features/releases";
import type { ExecutiveDashboardSnapshot } from "./types";
import styles from "./executive-dashboard.module.css";

interface ExecutiveApprovalsWorkspaceProps {
  readonly activeWorkspace: WorkWorkspaceContext;
  readonly actor?: unknown;
}

interface PendingGenesisReleaseItem {
  readonly release_id: string;
  readonly title: string;
  readonly requested_by: string;
  readonly workspace_name: string;
  readonly submitted_at: string;
  readonly age_days: number;
  readonly urgency: "NORMAL" | "DUE_SOON" | "OVERDUE";
  readonly projection?: GovernedReleaseProjection | null;
}

export function ExecutiveApprovalsWorkspace({
  activeWorkspace,
  actor,
}: ExecutiveApprovalsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"standard" | "genesis">("standard");
  const [genesisReleases, setGenesisReleases] = useState<PendingGenesisReleaseItem[]>([]);
  const [loadingGenesis, setLoadingGenesis] = useState(true);
  const [genesisError, setGenesisError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  // Decision form states per release
  const [selectedOutcomes, setSelectedOutcomes] = useState<Record<string, DecisionOutcome>>({});
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authenticatedApiRequest<ExecutiveDashboardSnapshot>("/api/v1/executive-dashboard")
      .then(async (snapshot) => {
        if (cancelled) return;
        const agentApprovals = (snapshot.pending_approvals || []).filter(
          (a) => a.kind === "AGENT_RELEASE",
        );

        const items: PendingGenesisReleaseItem[] = await Promise.all(
          agentApprovals.map(async (a) => {
            let projection: GovernedReleaseProjection | null = null;
            try {
              projection = await backendReleaseAdapter.get(a.approval_id);
            } catch {
              projection = null;
            }

            return {
              release_id: a.approval_id,
              title: a.title,
              requested_by: a.requested_by,
              workspace_name: a.workspace_name,
              submitted_at: a.submitted_at,
              age_days: a.age_days,
              urgency: a.urgency,
              projection,
            };
          }),
        );

        const filtered = items.filter(
          (it) => !it.projection || it.projection.state === "READY_FOR_DIRECTOR",
        );

        if (!cancelled) {
          setGenesisReleases(filtered);
          setGenesisError(null);
          setLoadingGenesis(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGenesisError("Data persetujuan rilis GENESIS belum dapat dimuat. Silakan coba lagi beberapa saat.");
          setLoadingGenesis(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadIndex]);

  function handleOutcomeSelect(releaseId: string, outcome: DecisionOutcome) {
    setSelectedOutcomes((prev) => ({ ...prev, [releaseId]: outcome }));
    setValidationErrors((prev) => ({ ...prev, [releaseId]: "" }));
  }

  function handleRationaleChange(releaseId: string, text: string) {
    setRationales((prev) => ({ ...prev, [releaseId]: text }));
    if (text.trim()) {
      setValidationErrors((prev) => ({ ...prev, [releaseId]: "" }));
    }
  }

  async function handleSubmitDecision(item: PendingGenesisReleaseItem) {
    const outcome = selectedOutcomes[item.release_id];
    if (!outcome) {
      setValidationErrors((prev) => ({
        ...prev,
        [item.release_id]: "Pilih keputusan terlebih dahulu.",
      }));
      return;
    }

    const rationale = (rationales[item.release_id] || "").trim();
    if (!rationale) {
      setValidationErrors((prev) => ({
        ...prev,
        [item.release_id]: "Tambahkan alasan keputusan sebelum melanjutkan.",
      }));
      return;
    }

    setSubmittingId(item.release_id);
    setGenesisError(null);
    setNotice(null);

    try {
      await backendReleaseAdapter.submitDirectorDecision(item.release_id, {
        outcome,
        rationale,
      });

      setNotice(
        outcome === "APPROVED"
          ? "Persetujuan Direktur berhasil disimpan. Rilis kini dikembalikan ke IT untuk proses rilis teknis sebelum dapat diaktifkan."
          : `Keputusan ${outcome === "RETURNED" ? "dikembalikan untuk perbaikan" : outcome === "REJECTED" ? "ditolak" : "ditahan"} berhasil dicatat.`,
      );

      // Trigger reload
      setLoadingGenesis(true);
      setReloadIndex((prev) => prev + 1);
    } catch {
      setGenesisError("Keputusan belum berhasil disimpan. Silakan coba lagi.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: "1360px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Tab Switcher between Standard Shared Approvals & GENESIS Release Approvals */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid #e1ddd4",
          paddingBottom: "0.5rem",
        }}
        role="tablist"
        aria-label="Kategori Persetujuan"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "standard"}
          onClick={() => setActiveTab("standard")}
          style={{
            background: activeTab === "standard" ? "#fbf9f6" : "transparent",
            border: activeTab === "standard" ? "1px solid #d5cfc2" : "1px solid transparent",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: activeTab === "standard" ? 700 : 500,
            color: activeTab === "standard" ? "var(--workspace-ink, #1c1d1f)" : "var(--workspace-muted, #7e848c)",
            cursor: "pointer",
          }}
        >
          Persetujuan Dokumen & Operasional
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "genesis"}
          onClick={() => setActiveTab("genesis")}
          style={{
            background: activeTab === "genesis" ? "#fbf9f6" : "transparent",
            border: activeTab === "genesis" ? "1px solid #d5cfc2" : "1px solid transparent",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: activeTab === "genesis" ? 700 : 500,
            color: activeTab === "genesis" ? "var(--workspace-ink, #1c1d1f)" : "var(--workspace-muted, #7e848c)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>Persetujuan Rilis GENESIS</span>
          {genesisReleases.length > 0 && (
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                borderRadius: "10px",
                padding: "0.1rem 0.45rem",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {genesisReleases.length}
            </span>
          )}
        </button>
      </div>

      {notice && (
        <div
          role="status"
          style={{
            background: "#edfdf5",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {genesisError && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={16} />
          <span>{genesisError}</span>
        </div>
      )}

      {activeTab === "standard" ? (
        <ApprovalsWorkspace activeWorkspace={activeWorkspace} actor={actor} />
      ) : (
        <section aria-label="Persetujuan Rilis GENESIS">
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 className={styles.cardTitle} style={{ fontSize: "1.75rem" }}>
              Persetujuan Rilis GENESIS
            </h2>
            <p className={styles.cardSubtitle}>
              Persetujuan material tingkat Direksi untuk kapabilitas atau agen GENESIS sebelum dirilis oleh tim IT.
            </p>
          </div>

          {loadingGenesis ? (
            <div className="alos-loading-shell">Memuat persetujuan rilis GENESIS…</div>
          ) : genesisReleases.length === 0 ? (
            <div className={styles.tableCard}>
              <div className={styles.emptyState}>
                <BadgeCheck size={28} style={{ color: "#166534", margin: "0 auto 0.5rem" }} />
                <strong style={{ display: "block", color: "var(--workspace-ink, #1c1d1f)", fontSize: "1rem" }}>
                  Tidak ada rilis GENESIS yang membutuhkan keputusan pimpinan saat ini.
                </strong>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                  Permintaan persetujuan rilis material akan otomatis muncul di sini saat proses QA dan verifikasi IT selesai.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {genesisReleases.map((item) => {
                const proj = item.projection;
                const releaseOutcome = selectedOutcomes[item.release_id];
                const errorMsg = validationErrors[item.release_id];
                const isSubmitting = submittingId === item.release_id;

                return (
                  <article
                    key={item.release_id}
                    className={styles.genesisApprovalCard}
                    data-testid={`genesis-release-item-${item.release_id}`}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div>
                        <span className={`${styles.badge} ${styles.badgeWarning}`}>
                          MENUNGGU PERSETUJUAN DIREKTUR
                        </span>
                        <h3 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "0.5rem 0 0.25rem", color: "var(--workspace-ink, #1c1d1f)" }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--workspace-muted, #7e848c)", margin: 0 }}>
                          ID Rilis: <code>{item.release_id}</code>
                        </p>
                      </div>

                      <div style={{ textAlign: "right", fontSize: "0.8rem", color: "var(--workspace-muted, #7e848c)" }}>
                        <div>Diajukan: {item.submitted_at || "Hari ini"}</div>
                        <div>Menunggu: {item.age_days === 0 ? "Hari ini" : `${item.age_days} hari`}</div>
                      </div>
                    </div>

                    {/* Metadata Grid (Safe Non-Technical Info) */}
                    <div className={styles.genesisMetaGrid}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Nama Agen / Kapabilitas</span>
                        <span className={styles.metaValue}>{proj?.subject_id || item.title}</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Versi</span>
                        <span className={styles.metaValue}>{proj?.subject_version || "v1.0"}</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Tujuan & Sasaran</span>
                        <span className={styles.metaValue}>Penyempurnaan kapabilitas otomasi dan analisis risiko bisnis</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Kebutuhan yang Diselesaikan</span>
                        <span className={styles.metaValue}>Mitigasi risiko kepatuhan operasional dan percepatan sintesis data</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Status Saat Ini</span>
                        <span className={styles.metaValue}>Menunggu Persetujuan Direktur</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Hasil Pengujian (QA)</span>
                        <span className={styles.metaValue}>Uji Otomatis & Assurance Lulus</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Ringkasan Review GENESIS</span>
                        <span className={styles.metaValue}>Rekomendasi assurance tersedia tanpa anomali kritis</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Keputusan IT</span>
                        <span className={styles.metaValue}>Disetujui oleh IT Lead</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Alasan Butuh Persetujuan Pimpinan</span>
                        <span className={styles.metaValue}>Tingkat materialitas tinggi: memengaruhi alur kerja operasional perusahaan</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Tingkat Materialitas</span>
                        <span className={styles.metaValue}>{proj?.materiality || "MATERIAL"}</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Referensi Bukti</span>
                        <span className={styles.metaValue}>{proj?.review_id || "Review Package Terverifikasi"}</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Pengusul / Penanggung Jawab</span>
                        <span className={styles.metaValue}>{item.requested_by} ({item.workspace_name})</span>
                      </div>
                    </div>

                    {/* Decision Action Box */}
                    <div className={styles.decisionActionBox}>
                      <strong style={{ fontSize: "0.9rem", color: "var(--workspace-ink, #1c1d1f)", display: "block", marginBottom: "0.75rem" }}>
                        Pilihan Keputusan Direktur
                      </strong>

                      <div className={styles.decisionRadioGroup} role="radiogroup" aria-label="Pilihan Keputusan">
                        <label
                          className={`${styles.decisionChoice} ${
                            releaseOutcome === "APPROVED" ? styles.decisionChoiceSelected : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`outcome-${item.release_id}`}
                            value="APPROVED"
                            checked={releaseOutcome === "APPROVED"}
                            onChange={() => handleOutcomeSelect(item.release_id, "APPROVED")}
                          />
                          <span>Setujui</span>
                        </label>

                        <label
                          className={`${styles.decisionChoice} ${
                            releaseOutcome === "RETURNED" ? styles.decisionChoiceSelected : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`outcome-${item.release_id}`}
                            value="RETURNED"
                            checked={releaseOutcome === "RETURNED"}
                            onChange={() => handleOutcomeSelect(item.release_id, "RETURNED")}
                          />
                          <span>Kembalikan untuk Perbaikan</span>
                        </label>

                        <label
                          className={`${styles.decisionChoice} ${
                            releaseOutcome === "REJECTED" ? styles.decisionChoiceSelected : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`outcome-${item.release_id}`}
                            value="REJECTED"
                            checked={releaseOutcome === "REJECTED"}
                            onChange={() => handleOutcomeSelect(item.release_id, "REJECTED")}
                          />
                          <span>Tolak</span>
                        </label>

                        <label
                          className={`${styles.decisionChoice} ${
                            releaseOutcome === "HOLD" ? styles.decisionChoiceSelected : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`outcome-${item.release_id}`}
                            value="HOLD"
                            checked={releaseOutcome === "HOLD"}
                            onChange={() => handleOutcomeSelect(item.release_id, "HOLD")}
                          />
                          <span>Tahan</span>
                        </label>
                      </div>

                      <div style={{ marginTop: "0.85rem" }}>
                        <label
                          htmlFor={`rationale-${item.release_id}`}
                          style={{
                            display: "block",
                            fontSize: "0.825rem",
                            fontWeight: 600,
                            color: "var(--workspace-ink, #1c1d1f)",
                            marginBottom: "0.35rem",
                          }}
                        >
                          Alasan Keputusan <span style={{ color: "#b91c1c" }}>*</span>
                        </label>
                        <textarea
                          id={`rationale-${item.release_id}`}
                          className={styles.rationaleArea}
                          placeholder="Tambahkan alasan atau arahan keputusan sebelum melanjutkan…"
                          value={rationales[item.release_id] || ""}
                          onChange={(e) => handleRationaleChange(item.release_id, e.target.value)}
                        />
                      </div>

                      {errorMsg && <div className={styles.validationErrorText}>{errorMsg}</div>}

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                        <span style={{ fontSize: "0.775rem", color: "var(--workspace-muted, #7e848c)" }}>
                          Setelah persetujuan Direktur, rilis akan dikembalikan ke IT untuk proses rilis teknis.
                        </span>
                        <button
                          type="button"
                          className={styles.submitDecisionBtn}
                          disabled={isSubmitting}
                          onClick={() => void handleSubmitDecision(item)}
                        >
                          {isSubmitting ? "Menyimpan…" : "Simpan Keputusan"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
