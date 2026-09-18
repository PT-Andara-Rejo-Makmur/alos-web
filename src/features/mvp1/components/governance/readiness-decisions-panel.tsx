"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type ReleaseDecisionRecord,
  type ReadinessDecisionType,
  type TechnicalReadinessLevel,
  listReleaseDecisions,
  recordReleaseDecision,
  canRecordReadinessDecision,
} from "@/features/mvp1/lib/readiness-decisions";
import { normalizeGovernanceError, type GovernanceUiError } from "@/features/mvp1/lib/governance-errors";
import { formatDateTime } from "@/features/mvp1/lib/governance";

type ReadinessDecisionsPanelProps = {
  actorRoles: string[];
  workspaceId: string;
  selectedReleaseId?: string;
  onError: (err: GovernanceUiError | null) => void;
  onNotice: (msg: string) => void;
};

export function ReadinessDecisionsPanel({
  actorRoles,
  workspaceId,
  selectedReleaseId,
  onError,
  onNotice,
}: ReadinessDecisionsPanelProps) {
  const [decisions, setDecisions] = useState<ReleaseDecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal form states
  const [decisionType, setDecisionType] = useState<ReadinessDecisionType>("GO");
  const [commitSha, setCommitSha] = useState("d64a3a2");
  const [releaseVersion, setReleaseVersion] = useState("v1.0.0");
  const [techReadiness, setTechReadiness] = useState<TechnicalReadinessLevel>("PASS");
  const [notes, setNotes] = useState(() => (selectedReleaseId ? `Evaluasi kesiapan rilis CR: ${selectedReleaseId}` : ""));

  const isDirector = canRecordReadinessDecision(actorRoles);

  const loadDecisions = useCallback(async () => {
    if (!isDirector) {
      setLoading(false);
      return;
    }
    try {
      const data = await listReleaseDecisions();
      setDecisions(data);
    } catch (err) {
      onError(normalizeGovernanceError(err));
    } finally {
      setLoading(false);
    }
  }, [isDirector, onError]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDecisions();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDecisions]);

  if (!isDirector) {
    return null; // Restricted purely to Director
  }

  async function handleRecordDecision() {
    setSubmitting(true);
    onError(null);
    try {
      const rec = await recordReleaseDecision({
        workspace_id: workspaceId || null,
        decision: decisionType,
        commit_sha: commitSha,
        release_version: releaseVersion,
        technical_readiness: techReadiness,
        notes,
      });
      onNotice(`Keputusan rilis ${rec.decision} (${rec.release_version}) berhasil dicatat secara permanen.`);
      setShowRecordModal(false);
      setNotes("");
      await loadDecisions();
    } catch (err) {
      onError(normalizeGovernanceError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "#ffffff", border: "1px solid #d8e2dc", borderRadius: "10px", padding: "20px", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <strong style={{ fontSize: "0.95rem", color: "#111827" }}>
            Keputusan Otoritatif Kesiapan Rilis (Direktur Utama)
          </strong>
          <p style={{ fontSize: "0.78rem", color: "#546e63", margin: "2px 0 0 0" }}>
            Catatan keputusan governance manusia independen (Go / No-Go / Hold) yang disimpan pada database kepatuhan.
          </p>
        </div>
        <button
          className="gov-modal-btn-confirm success"
          onClick={() => setShowRecordModal(true)}
          style={{ padding: "7px 16px", fontSize: "0.8rem" }}
          type="button"
        >
          + Catat Keputusan Rilis
        </button>
      </div>

      <div className="gov-table-wrap">
        <table className="gov-ag-table">
          <thead>
            <tr>
              <th>Decision ID</th>
              <th>Keputusan</th>
              <th>Versi Rilis</th>
              <th>Commit SHA</th>
              <th>Kesiapan Teknis</th>
              <th>Waktu Keputusan</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((d) => (
              <tr key={d.decision_id}>
                <td><code>{d.decision_id.slice(0, 8)}...</code></td>
                <td>
                  <span
                    className={`gov-perm-status-badge ${
                      d.decision === "GO" ? "active" : d.decision === "HOLD" ? "pending" : "rejected"
                    }`}
                  >
                    {d.decision}
                  </span>
                </td>
                <td><strong>{d.release_version}</strong></td>
                <td><code>{d.commit_sha.slice(0, 8)}</code></td>
                <td><span style={{ fontWeight: 600 }}>{d.technical_readiness}</span></td>
                <td>{d.decided_at ? formatDateTime(d.decided_at) : "Pending"}</td>
                <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.notes || "—"}
                </td>
              </tr>
            ))}
            {decisions.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "#6e847a" }}>
                  Belum ada keputusan formal yang dicatat oleh Direktur Utama.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRecordModal && (
        <div className="gov-modal-backdrop" role="presentation">
          <section aria-labelledby="modal-record-decision" aria-modal="true" className="gov-modal" role="dialog">
            <h3 id="modal-record-decision" style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>
              Catat Keputusan Final Release Readiness
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="gov-modal-field">
                <label htmlFor="dec-type-select">Keputusan Final:</label>
                <select id="dec-type-select" onChange={(e) => setDecisionType(e.target.value as ReadinessDecisionType)} value={decisionType}>
                  <option value="GO">GO (Disahkan untuk Aktivasi)</option>
                  <option value="HOLD">HOLD (Tunda Sementara)</option>
                  <option value="NO_GO">NO_GO (Ditolak / Dibatalkan)</option>
                  <option value="PENDING">PENDING (Menunggu Evaluasi)</option>
                </select>
              </div>
              <div className="gov-modal-field">
                <label htmlFor="dec-tech-select">Kesiapan Teknis:</label>
                <select id="dec-tech-select" onChange={(e) => setTechReadiness(e.target.value as TechnicalReadinessLevel)} value={techReadiness}>
                  <option value="PASS">PASS (Lulus Seluruh Pengujian)</option>
                  <option value="HOLD">HOLD (Pengujian Perlu Re-run)</option>
                  <option value="BLOCKED">BLOCKED (Terhalang Masalah Keamanan)</option>
                  <option value="FAIL">FAIL (Gagal Syarat Minimal)</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="gov-modal-field">
                <label htmlFor="dec-ver-input">Versi Rilis:</label>
                <input id="dec-ver-input" onChange={(e) => setReleaseVersion(e.target.value)} value={releaseVersion} />
              </div>
              <div className="gov-modal-field">
                <label htmlFor="dec-sha-input">Commit SHA (Min 7 char):</label>
                <input id="dec-sha-input" onChange={(e) => setCommitSha(e.target.value)} value={commitSha} />
              </div>
            </div>
            <div className="gov-modal-field">
              <label htmlFor="dec-notes-input">Catatan Evaluasi Eksekutif:</label>
              <textarea
                id="dec-notes-input"
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan catatan pertimbangan operasional dan keselarasan bisnis..."
                rows={3}
                value={notes}
              />
            </div>
            <div className="gov-modal-actions">
              <button className="gov-modal-btn-cancel" disabled={submitting} onClick={() => setShowRecordModal(false)} type="button">
                Batal
              </button>
              <button className="gov-modal-btn-confirm success" disabled={submitting || commitSha.length < 7} onClick={() => void handleRecordDecision()} type="button">
                {submitting ? "Menyimpan..." : "Simpan Keputusan"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}


