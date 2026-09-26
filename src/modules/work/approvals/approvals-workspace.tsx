"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CheckCircle2, XCircle, Play, ShieldAlert, Search, RefreshCw } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { WorkWorkspaceContext } from "../shared/types";
import { WorkStatusBadge } from "../ui/work-status-badge";
import { WorkNotice } from "../ui/work-notice";
import {
  humanStatus,
  type Approval,
  type OperationalDashboard,
  type ProposedAction,
} from "@/features/operations/types";
import styles from "../ui/work-ui.module.css";

interface ApprovalsWorkspaceProps {
  readonly activeWorkspace: WorkWorkspaceContext;
  readonly actor?: unknown;
}

export const ApprovalsWorkspace: React.FC<ApprovalsWorkspaceProps> = ({
  activeWorkspace,
}) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [proposedActions, setProposedActions] = useState<ProposedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decidingId, setDecidingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [dash, actions] = await Promise.all([
        authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational"),
        authenticatedApiRequest<ProposedAction[]>("/api/v1/proposed-actions"),
      ]);
      setApprovals(dash.approvals ?? []);
      setProposedActions(actions ?? []);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [dash, actions] = await Promise.all([
          authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational"),
          authenticatedApiRequest<ProposedAction[]>("/api/v1/proposed-actions"),
        ]);
        if (!ignore) {
          setApprovals(dash.approvals ?? []);
          setProposedActions(actions ?? []);
        }
      } catch (err) {
        if (!ignore) {
          setError(apiMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleDecision(approval: Approval, decision: "APPROVED" | "REJECTED") {
    const decisionNotes = notes[approval.approval_request_id]?.trim();
    if (!decisionNotes) return;
    if (
      !window.confirm(
        `${decision === "APPROVED" ? "Setujui" : "Tolak"} permintaan “${approval.title}”? Keputusan ini dicatat dalam audit trail resmi.`,
      )
    ) {
      return;
    }

    setDecidingId(approval.approval_request_id);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/approvals/${approval.approval_request_id}/decision`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          payload_digest: approval.payload_digest,
          notes: decisionNotes,
        }),
      });
      setNotice(`Permintaan persetujuan telah ${decision === "APPROVED" ? "disetujui" : "ditolak"}.`);
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setDecidingId(null);
    }
  }

  async function handleExecuteAction(action: ProposedAction) {
    if (!window.confirm("Jalankan aksi yang telah disetujui tepat satu kali?")) return;
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/proposed-actions/${action.proposed_action_id}/execute`, {
        method: "POST",
        body: JSON.stringify({ payload_digest: action.payload_digest }),
      });
      setNotice("Aksi yang disetujui berhasil dijalankan tepat satu kali.");
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  const visibleApprovals = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return approvals;
    return approvals.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        a.approval_kind.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q),
    );
  }, [approvals, filter]);

  return (
    <div className={styles.workRoot}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div className={styles.breadcrumb}>
            <span>ALOS</span>
            <span> / </span>
            <span>{activeWorkspace.workspaceLabel.toUpperCase()}</span>
            <span> / </span>
            <span>TATA KELOLA KEPUTUSAN</span>
          </div>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCw size={12} aria-hidden="true" />
            <span>{loading ? "Memuat…" : "Muat Ulang"}</span>
          </button>
        </div>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle} style={{ fontSize: "22px" }}>
            Persetujuan & Keputusan
          </h2>
        </div>
        <p className={styles.pageSubtitle}>
          Alur tata kelola persetujuan material berjenjang: verifikasi usulan, catatan audit keputusan, dan eksekusi aksi berisiko tinggi.
        </p>
      </header>

      {error && <WorkNotice variant="error" message={error} />}
      {notice && <WorkNotice variant="success" message={notice} />}

      {/* Metrics */}
      <div className={styles.metricStrip}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Menunggu Persetujuan</span>
          <span className={styles.metricValue} style={{ color: "#b45309" }}>
            {approvals.filter((a) => a.status === "PENDING").length}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Tinggi / Kritis</span>
          <span className={styles.metricValue} style={{ color: "#b91c1c" }}>
            {approvals.filter((a) => a.urgency === "URGENT" && a.status === "PENDING").length}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Disetujui</span>
          <span className={styles.metricValue} style={{ color: "#15803d" }}>
            {approvals.filter((a) => a.status === "APPROVED").length}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Aksi Material Tertunda</span>
          <span className={styles.metricValue}>
            {proposedActions.filter((act) => act.status === "APPROVED").length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} style={{ color: "#78716c" }} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari permintaan persetujuan…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table 1: Approvals Queue */}
      <div className={styles.tableContainer}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #e7e5e4", background: "#fafaf9" }}>
          <strong style={{ fontSize: "13px", color: "#1c1917" }}>Daftar Permintaan Persetujuan</strong>
        </div>
        <table className={styles.table} aria-label="Tabel Permintaan Persetujuan">
          <thead>
            <tr>
              <th scope="col">Permintaan</th>
              <th scope="col">Jenis</th>
              <th scope="col">Urgensi</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ minWidth: "300px" }}>Keputusan & Catatan Wajib</th>
            </tr>
          </thead>
          <tbody>
            {visibleApprovals.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <BadgeCheck size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>Tidak ada persetujuan yang menunggu keputusan</p>
                    <p className={styles.emptyHelper}>
                      Permintaan persetujuan dokumen, anggaran, atau rilis sistem akan muncul di sini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleApprovals.map((item) => (
                <tr key={item.approval_request_id}>
                  <td className={styles.primaryCell}>
                    <div>{item.title}</div>
                    <div className={styles.subtextCell}>{item.description || item.subject_type}</div>
                  </td>
                  <td>{humanStatus(item.approval_kind)}</td>
                  <td>
                    <WorkStatusBadge status={item.urgency} />
                  </td>
                  <td>
                    <WorkStatusBadge status={item.status} />
                  </td>
                  <td>
                    {item.status === "PENDING" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <input
                          type="text"
                          className={styles.formInput}
                          style={{ padding: "5px 8px", fontSize: "12px" }}
                          aria-label={`Catatan keputusan ${item.title}`}
                          placeholder="Catatan wajib sebelum persetujuan..."
                          value={notes[item.approval_request_id] ?? ""}
                          onChange={(e) =>
                            setNotes({ ...notes, [item.approval_request_id]: e.target.value })
                          }
                        />
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            className={styles.buttonPrimary}
                            style={{ padding: "5px 10px", fontSize: "11px" }}
                            disabled={!notes[item.approval_request_id]?.trim() || decidingId === item.approval_request_id}
                            onClick={() => void handleDecision(item, "APPROVED")}
                          >
                            <CheckCircle2 size={12} aria-hidden="true" />
                            <span>Setujui</span>
                          </button>
                          <button
                            type="button"
                            className={styles.buttonDanger}
                            style={{ padding: "5px 10px", fontSize: "11px" }}
                            disabled={!notes[item.approval_request_id]?.trim() || decidingId === item.approval_request_id}
                            onClick={() => void handleDecision(item, "REJECTED")}
                          >
                            <XCircle size={12} aria-hidden="true" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className={styles.subtextCell}>
                        {item.decision_notes ?? "Keputusan telah tercatat dalam audit."}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table 2: Proposed Actions Execution */}
      <div className={styles.tableContainer}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #e7e5e4", background: "#fafaf9" }}>
          <strong style={{ fontSize: "13px", color: "#1c1917" }}>Eksekusi Aksi yang Disetujui</strong>
        </div>
        <table className={styles.table} aria-label="Tabel Eksekusi Aksi yang Disetujui">
          <thead>
            <tr>
              <th scope="col">Aksi</th>
              <th scope="col">Tingkat Risiko</th>
              <th scope="col">Status</th>
              <th scope="col">Payload Digest</th>
              <th scope="col">Eksekusi</th>
            </tr>
          </thead>
          <tbody>
            {proposedActions.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <ShieldAlert size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>Belum ada aksi material yang diajukan</p>
                    <p className={styles.emptyHelper}>
                      Aksi material yang disetujui dapat dieksekusi secara idempotent tepat satu kali.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              proposedActions.map((item) => (
                <tr key={item.proposed_action_id}>
                  <td className={styles.primaryCell}>
                    <div>{humanStatus(item.action_type)}</div>
                    <div className={styles.subtextCell}>
                      {String(item.payload.title ?? item.proposed_action_id)}
                    </div>
                  </td>
                  <td>
                    <WorkStatusBadge status={item.risk_level} />
                  </td>
                  <td>
                    <WorkStatusBadge status={item.status} />
                  </td>
                  <td>
                    <span className={styles.codeCell}>{item.payload_digest.slice(0, 16)}…</span>
                  </td>
                  <td>
                    {item.status === "APPROVED" ? (
                      <button
                        type="button"
                        className={styles.buttonPrimary}
                        style={{ padding: "5px 10px", fontSize: "11px" }}
                        onClick={() => void handleExecuteAction(item)}
                      >
                        <Play size={11} aria-hidden="true" />
                        <span>Eksekusi</span>
                      </button>
                    ) : item.executed_entity_id ? (
                      <span className={styles.subtextCell}>
                        {item.executed_entity_type}: {item.executed_entity_id}
                      </span>
                    ) : (
                      <span className={styles.subtextCell}>Menunggu persetujuan</span>
                    )}
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
