"use client";

import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, TriangleAlert, Search, Trash2, CheckCircle2, RefreshCw, Wrench } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { WorkWorkspaceContext } from "../shared/types";
import { WorkStatusBadge } from "../ui/work-status-badge";
import { WorkNotice } from "../ui/work-notice";
import {
  humanStatus,
  type Finding,
  type OperationalDashboard,
} from "@/features/operations/types";
import styles from "../ui/work-ui.module.css";

interface FindingsWorkspaceProps {
  readonly activeWorkspace: WorkWorkspaceContext;
  readonly actor?: unknown;
}

export const FindingsWorkspace: React.FC<FindingsWorkspaceProps> = ({
  activeWorkspace,
}) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");

  const workspaceId = activeWorkspace.workspaceId;
  const divisionCode = activeWorkspace.divisionCode ?? "";

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational");
      setFindings(result.findings ?? []);
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
        const result = await authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational");
        if (!ignore) {
          setFindings(result.findings ?? []);
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!workspaceId || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest("/api/v1/findings", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          division_code: divisionCode || null,
          source_kind: "GENESIS",
          title,
          description,
          severity,
          recommendation: "",
        }),
      });
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      setShowCreate(false);
      setNotice("Temuan operasional berhasil dicatat.");
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusTransition(finding: Finding, nextStatus: "ACKNOWLEDGED" | "RESOLVED") {
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/findings/${finding.finding_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
          ...(nextStatus === "RESOLVED"
            ? { resolution: "Diselesaikan melalui Work Findings Workspace." }
            : {}),
        }),
      });
      setNotice(
        nextStatus === "ACKNOWLEDGED"
          ? "Temuan telah diakui dan siap ditindaklanjuti."
          : "Temuan ditandai selesai.",
      );
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  async function handleDelete(finding: Finding) {
    if (!window.confirm(`Hapus temuan “${finding.title}”?`)) return;
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/findings/${finding.finding_id}`, {
        method: "DELETE",
      });
      setNotice(`Temuan “${finding.title}” telah dihapus.`);
      if (selectedFinding?.finding_id === finding.finding_id) {
        setSelectedFinding(null);
      }
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  const visibleFindings = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return findings;
    return findings.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        f.severity.toLowerCase().includes(q) ||
        f.status.toLowerCase().includes(q),
    );
  }, [findings, filter]);

  return (
    <div className={styles.workRoot}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div className={styles.breadcrumb}>
            <span>ALOS</span>
            <span> / </span>
            <span>{activeWorkspace.workspaceLabel.toUpperCase()}</span>
            <span> / </span>
            <span>TEMUAN & RISIKO</span>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => setShowCreate((v) => !v)}
              disabled={!workspaceId}
            >
              <Plus size={14} aria-hidden="true" />
              <span>{showCreate ? "Tutup Form" : "Catat Temuan"}</span>
            </button>
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
        </div>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle} style={{ fontSize: "22px" }}>
            Temuan & Risiko
          </h2>
        </div>
        <p className={styles.pageSubtitle}>
          Pencatatan dan pemantauan anomali, temuan audit lapangan, dan risiko operasional beserta tindak lanjut perbaikannya.
        </p>
      </header>

      {error && <WorkNotice variant="error" message={error} />}
      {notice && <WorkNotice variant="success" message={notice} />}

      {/* Metrics */}
      <div className={styles.metricStrip}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Temuan</span>
          <span className={styles.metricValue}>{findings.length}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Terbuka</span>
          <span className={styles.metricValue} style={{ color: "#b45309" }}>
            {findings.filter((f) => f.status === "OPEN").length}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Kritis</span>
          <span className={styles.metricValue} style={{ color: "#b91c1c" }}>
            {findings.filter((f) => f.severity === "CRITICAL" && f.status !== "RESOLVED").length}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Selesai</span>
          <span className={styles.metricValue} style={{ color: "#15803d" }}>
            {findings.filter((f) => f.status === "RESOLVED").length}
          </span>
        </div>
      </div>

      {/* Create Finding Form */}
      {showCreate && (
        <form className={styles.formShell} onSubmit={(e) => void handleCreate(e)}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Catat Temuan Baru</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="fnd-title">
                Judul Temuan <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="fnd-title"
                type="text"
                className={styles.formInput}
                required
                minLength={2}
                placeholder="Rincian anomali atau ketidaksesuaian yang ditemukan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="fnd-sev">
                Severitas
              </label>
              <select
                id="fnd-sev"
                className={styles.formSelect}
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="fnd-desc">
                Deskripsi & Catatan Lapangan <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                id="fnd-desc"
                className={styles.formTextarea}
                rows={3}
                required
                minLength={2}
                placeholder="Jelaskan fakta lapangan, lokasi, bukti, dan dampak potensial..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => setShowCreate(false)}
            >
              Batal
            </button>
            <button type="submit" className={styles.buttonPrimary} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan Temuan"}
            </button>
          </div>
        </form>
      )}

      {/* Selected Finding Detail & Corrective Action Context */}
      {selectedFinding && (
        <div className={styles.formShell} style={{ borderLeft: "4px solid #0f172a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className={styles.metricLabel}>DETAIL TEMUAN</span>
              <h3 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 700 }}>
                {selectedFinding.title}
              </h3>
            </div>
            <button
              type="button"
              className={styles.buttonSmall}
              onClick={() => setSelectedFinding(null)}
            >
              Tutup
            </button>
          </div>
          {selectedFinding.description && (
            <p style={{ margin: 0, fontSize: "13px", color: "#44403c", lineHeight: 1.5 }}>
              {selectedFinding.description}
            </p>
          )}

          {/* Corrective Action Section */}
          <div style={{ marginTop: "8px", padding: "10px", background: "#fbfbfa", border: "1px solid #e7e5e4", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#57534e", textTransform: "uppercase" }}>
              <Wrench size={12} aria-hidden="true" />
              <span>Tindakan Perbaikan</span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#78716c" }}>
              Tautan pembuatan tugas atau proyek perbaikan langsung dari temuan ini menunggu integrasi relasi authoritative Backend.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} style={{ color: "#78716c" }} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari temuan berdasarkan judul atau keterangan…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabel Temuan dan Risiko">
          <thead>
            <tr>
              <th scope="col">Temuan</th>
              <th scope="col">Sumber</th>
              <th scope="col">Severitas</th>
              <th scope="col">Status</th>
              <th scope="col">Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody>
            {visibleFindings.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <TriangleAlert size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>Tidak ada temuan dalam scope atau filter ini</p>
                    <p className={styles.emptyHelper}>
                      Temuan dari pengawasan operasional atau analisis risiko akan tercatat di sini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleFindings.map((fnd) => (
                <tr
                  key={fnd.finding_id}
                  onClick={() => setSelectedFinding(fnd)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedFinding?.finding_id === fnd.finding_id ? "#f5f5f4" : undefined,
                  }}
                >
                  <td className={styles.primaryCell}>
                    <div>{fnd.title}</div>
                    <div className={styles.subtextCell}>{fnd.description}</div>
                  </td>
                  <td>{humanStatus(fnd.source_kind)}</td>
                  <td>
                    <WorkStatusBadge status={fnd.severity} />
                  </td>
                  <td>
                    <WorkStatusBadge status={fnd.status} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {fnd.status === "OPEN" ? (
                        <button
                          type="button"
                          className={styles.buttonSmall}
                          onClick={() => void handleStatusTransition(fnd, "ACKNOWLEDGED")}
                        >
                          <span>Akui</span>
                        </button>
                      ) : fnd.status !== "RESOLVED" && fnd.status !== "DISMISSED" ? (
                        <button
                          type="button"
                          className={styles.buttonSmall}
                          onClick={() => void handleStatusTransition(fnd, "RESOLVED")}
                        >
                          <CheckCircle2 size={11} aria-hidden="true" />
                          <span>Selesaikan</span>
                        </button>
                      ) : (
                        <span className={styles.subtextCell}>{fnd.resolution ?? "Ditutup"}</span>
                      )}
                      <button
                        type="button"
                        className={styles.buttonDanger}
                        style={{ padding: "4px 7px" }}
                        onClick={() => void handleDelete(fnd)}
                        title="Hapus temuan"
                      >
                        <Trash2 size={11} aria-hidden="true" />
                      </button>
                    </div>
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
