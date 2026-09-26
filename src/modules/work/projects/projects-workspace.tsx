"use client";

import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, FolderKanban, Search, Trash2, RefreshCw } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { WorkWorkspaceContext } from "../shared/types";
import { StrategyLinkPanel } from "../shared/strategy-link-panel";
import { WorkPageHeader } from "../ui/work-page-header";
import { WorkStatusBadge } from "../ui/work-status-badge";
import { WorkNotice } from "../ui/work-notice";
import {
  buildProjectPortfolioUrl,
  formatPortfolioDate,
  formatPortfolioMoney,
  formatPortfolioPercent,
  type ProjectPortfolioFilters,
  type ProjectPortfolioSnapshot,
} from "@/features/projects/portfolio";
import styles from "../ui/work-ui.module.css";

const EMPTY_FILTERS: ProjectPortfolioFilters = {
  division_code: "",
  status: "",
  category: "",
  date_from: "",
  date_to: "",
  search: "",
  page: 1,
};

interface ProjectsWorkspaceProps {
  readonly activeWorkspace: WorkWorkspaceContext;
}

export const ProjectsWorkspace: React.FC<ProjectsWorkspaceProps> = ({
  activeWorkspace,
}) => {
  const [filters, setFilters] = useState<ProjectPortfolioFilters>(EMPTY_FILTERS);
  const [data, setData] = useState<ProjectPortfolioSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Operations and creation state
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [mode, setMode] = useState<"update" | "milestone" | "issue">("update");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({ code: "", name: "", category: "PROPERTY", deadline: "" });
  const [updateForm, setUpdateForm] = useState({ status: "ON_TRACK", progress_percent: "0", deadline: "", budget_spent: "" });
  const [milestoneForm, setMilestoneForm] = useState({ title: "", due_date: "", status: "ON_TRACK" });
  const [issueForm, setIssueForm] = useState({ title: "", description: "", severity: "MEDIUM", due_date: "" });

  const url = useMemo(() => buildProjectPortfolioUrl(filters), [filters]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setFailed(false);
      try {
        const result = await authenticatedApiRequest<ProjectPortfolioSnapshot>(url, { signal: controller.signal });
        setData(result);
        if (!selectedProjectId && result.projects.length > 0) {
          setSelectedProjectId(result.projects[0].project_id);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [reloadKey, url, selectedProjectId]);

  const projects = data?.projects ?? [];
  const selectedProject = projects.find((p) => p.project_id === selectedProjectId) ?? projects[0];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!activeWorkspace.divisionCode || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: activeWorkspace.workspaceId,
          division_code: activeWorkspace.divisionCode,
          code: createForm.code,
          name: createForm.name,
          category: createForm.category,
          deadline: createForm.deadline || null,
        }),
      });
      setCreateForm({ code: "", name: "", category: "PROPERTY", deadline: "" });
      setShowCreate(false);
      setNotice("Proyek baru berhasil dibuat dan tercatat.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitOperation(e: FormEvent) {
    e.preventDefault();
    if (!selectedProject || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "update") {
        await authenticatedApiRequest(`/api/v1/projects/${selectedProject.project_id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: updateForm.status,
            progress_percent: Number(updateForm.progress_percent),
            deadline: updateForm.deadline || null,
            budget_spent: updateForm.budget_spent ? Number(updateForm.budget_spent) : null,
          }),
        });
        setNotice("Status dan kemajuan proyek diperbarui.");
      } else if (mode === "milestone") {
        await authenticatedApiRequest(`/api/v1/projects/${selectedProject.project_id}/milestones`, {
          method: "POST",
          body: JSON.stringify({ ...milestoneForm }),
        });
        setMilestoneForm({ title: "", due_date: "", status: "ON_TRACK" });
        setNotice("Milestone berhasil ditambahkan ke proyek.");
      } else {
        await authenticatedApiRequest("/api/v1/project-issues", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: selectedProject.workspace_id,
            division_code: selectedProject.division_code,
            project_id: selectedProject.project_id,
            title: issueForm.title,
            description: issueForm.description,
            severity: issueForm.severity,
            due_date: issueForm.due_date || null,
          }),
        });
        setIssueForm({ title: "", description: "", severity: "MEDIUM", due_date: "" });
        setNotice("Isu proyek berhasil dicatat.");
      }
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProject() {
    if (!selectedProject || saving) return;
    if (!window.confirm(`Hapus proyek “${selectedProject.name}” secara permanen? Tindakan ini akan diaudit.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/projects/${selectedProject.project_id}`, {
        method: "DELETE",
      });
      setSelectedProjectId("");
      setNotice("Proyek telah dihapus.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.workRoot}>
      <WorkPageHeader
        title="Portofolio Proyek"
        subtitle="Kelola proyek dalam cakupan workspace aktif, termasuk progres, jadwal, milestone, isu, dan bukti pelaksanaan."
        workspaceLabel={activeWorkspace.workspaceLabel}
        kicker="OPERASI PORTOFOLIO"
        actions={
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => setShowCreate((v) => !v)}
            disabled={!activeWorkspace.divisionCode}
          >
            <Plus size={14} aria-hidden="true" />
            <span>{showCreate ? "Tutup Form" : "Buat Proyek"}</span>
          </button>
        }
      />

      {failed && <WorkNotice variant="error" message="Gagal memuat data portofolio proyek dari Backend." />}
      {error && <WorkNotice variant="error" message={error} />}
      {notice && <WorkNotice variant="success" message={notice} />}

      {/* Compact Operational Summary Strip */}
      {data?.metrics && (
        <div className={styles.summaryStrip}>
          <span className={styles.summaryStripTitle}>Ringkasan Portofolio</span>
          <div className={styles.summaryItem}>
            <span className={styles.summaryItemLabel}>Total:</span>
            <span className={styles.summaryItemValue}>{data.metrics.total}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryItemLabel}>Tepat Waktu:</span>
            <span className={`${styles.summaryItemValue} ${styles.statusTextOnTrack}`}>
              {data.metrics.on_track}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryItemLabel}>Berisiko:</span>
            <span className={`${styles.summaryItemValue} ${styles.statusTextAtRisk}`}>
              {data.metrics.at_risk}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryItemLabel}>Kritis:</span>
            <span className={`${styles.summaryItemValue} ${styles.statusTextCritical}`}>
              {data.metrics.critical}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryItemLabel}>Selesai:</span>
            <span className={`${styles.summaryItemValue} ${styles.statusTextCompleted}`}>
              {data.metrics.completed}
            </span>
          </div>
        </div>
      )}

      {/* Create Project Panel */}
      {showCreate && (
        <form className={styles.formShell} onSubmit={(e) => void handleCreate(e)}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Buat Proyek Baru</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="proj-ws">
                Workspace
              </label>
              <input
                id="proj-ws"
                type="text"
                className={styles.formInput}
                value={activeWorkspace.workspaceLabel}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="proj-code">
                Kode Proyek <span className={styles.statusTextCritical}>*</span>
              </label>
              <input
                id="proj-code"
                type="text"
                className={styles.formInput}
                required
                maxLength={40}
                minLength={2}
                placeholder="Contoh: PRJ-2026-001"
                value={createForm.code}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                  })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="proj-cat">
                Kategori
              </label>
              <input
                id="proj-cat"
                type="text"
                className={styles.formInput}
                required
                maxLength={80}
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="proj-deadline">
                Tenggat Selesai
              </label>
              <input
                id="proj-deadline"
                type="date"
                className={styles.formInput}
                value={createForm.deadline}
                onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
              />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="proj-name">
                Nama Proyek <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="proj-name"
                type="text"
                className={styles.formInput}
                required
                maxLength={160}
                minLength={2}
                placeholder="Nama resmi proyek"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
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
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={saving || !activeWorkspace.divisionCode}
            >
              {saving ? "Menyimpan…" : "Simpan Proyek"}
            </button>
          </div>
        </form>
      )}

      {/* Project Controls Panel */}
      {projects.length > 0 && selectedProject && (
        <section className={styles.formShell} aria-label="Kendali Proyek">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span className={styles.metricLabel}>KENDALI PROYEK</span>
              <h3 style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: 700 }}>
                Perbarui Proyek, Milestone, dan Isu
              </h3>
            </div>
            <select
              className={styles.filterSelect}
              aria-label="Pilih proyek"
              value={selectedProject.project_id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              type="button"
              className={mode === "update" ? styles.buttonPrimary : styles.buttonSecondary}
              onClick={() => setMode("update")}
            >
              Perbarui Proyek
            </button>
            <button
              type="button"
              className={mode === "milestone" ? styles.buttonPrimary : styles.buttonSecondary}
              onClick={() => setMode("milestone")}
            >
              Tambah Milestone
            </button>
            <button
              type="button"
              className={mode === "issue" ? styles.buttonPrimary : styles.buttonSecondary}
              onClick={() => setMode("issue")}
            >
              Catat Isu
            </button>
            <button
              type="button"
              className={styles.buttonDanger}
              disabled={saving}
              onClick={() => void handleDeleteProject()}
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Hapus Proyek</span>
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmitOperation(e)}>
            {mode === "update" && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select
                    className={styles.formSelect}
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  >
                    <option value="ON_TRACK">ON TRACK</option>
                    <option value="AT_RISK">AT RISK</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kemajuan Proyek (%)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={updateForm.progress_percent}
                    onChange={(e) => setUpdateForm({ ...updateForm, progress_percent: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tenggat</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={updateForm.deadline}
                    onChange={(e) => setUpdateForm({ ...updateForm, deadline: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Biaya Aktual</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    min="0"
                    step="1"
                    placeholder="Nilai pengeluaran aktual"
                    value={updateForm.budget_spent}
                    onChange={(e) => setUpdateForm({ ...updateForm, budget_spent: e.target.value })}
                  />
                </div>
              </div>
            )}

            {mode === "milestone" && (
              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Judul Milestone</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    required
                    minLength={2}
                    placeholder="Contoh: Penyelesaian Fondasi Gedung"
                    value={milestoneForm.title}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tenggat Milestone</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    required
                    value={milestoneForm.due_date}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status Milestone</label>
                  <select
                    className={styles.formSelect}
                    value={milestoneForm.status}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                  >
                    <option value="ON_TRACK">ON TRACK</option>
                    <option value="AT_RISK">AT RISK</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>
            )}

            {mode === "issue" && (
              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Judul Isu</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    required
                    minLength={2}
                    placeholder="Contoh: Keterlambatan Pasokan Beton Readymix"
                    value={issueForm.title}
                    onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  />
                </div>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Deskripsi Isu</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={2}
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Severitas</label>
                  <select
                    className={styles.formSelect}
                    value={issueForm.severity}
                    onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tenggat Penanganan</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={issueForm.due_date}
                    onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className={styles.buttonPrimary} disabled={saving}>
                {saving ? "Menyimpan…" : "Simpan Perubahan"}
              </button>
            </div>
          </form>

          {/* Strategy Linkage Panel */}
          <StrategyLinkPanel
            linkage={{ state: "SOURCE_UNAVAILABLE" }}
            contextTitle={`Keterkaitan Strategi: ${selectedProject.name}`}
          />
        </section>
      )}

      {/* Toolbar / Search / Filter */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} style={{ color: "#78716c" }} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari proyek berdasarkan nama atau kode…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <div className={styles.filterControls}>
          <select
            className={styles.filterSelect}
            aria-label="Filter status proyek"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">Semua Status</option>
            <option value="ON_TRACK">Tepat Waktu (ON TRACK)</option>
            <option value="AT_RISK">Berisiko (AT RISK)</option>
            <option value="CRITICAL">Kritis (CRITICAL)</option>
            <option value="COMPLETED">Selesai (COMPLETED)</option>
          </select>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
          >
            <RefreshCw size={12} aria-hidden="true" />
            <span>{loading ? "Memuat…" : "Muat Ulang"}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabel Portofolio Proyek">
          <thead>
            <tr>
              <th scope="col">Kode</th>
              <th scope="col">Nama Proyek</th>
              <th scope="col">Divisi</th>
              <th scope="col">Kemajuan</th>
              <th scope="col">Status</th>
              <th scope="col">Tenggat</th>
              <th scope="col">Anggaran / Realisasi</th>
              <th scope="col">Keterkaitan Strategi</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <FolderKanban size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>
                      {loading ? "Memuat portofolio proyek…" : "Belum ada proyek dalam scope ini"}
                    </p>
                    <p className={styles.emptyHelper}>
                      Proyek yang dibuat dalam workspace ini akan terdaftar secara terpusat.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((proj) => (
                <tr
                  key={proj.project_id}
                  onClick={() => setSelectedProjectId(proj.project_id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: proj.project_id === selectedProjectId ? "#f5f5f4" : undefined,
                  }}
                >
                  <td className={styles.codeCell}>{proj.code}</td>
                  <td className={styles.primaryCell}>{proj.name}</td>
                  <td>{proj.division_name ?? proj.division_code}</td>
                  <td>
                    <strong>{formatPortfolioPercent(proj.progress_percent)}</strong>
                  </td>
                  <td>
                    <WorkStatusBadge status={proj.status} />
                  </td>
                  <td>{formatPortfolioDate(proj.deadline)}</td>
                  <td>
                    {formatPortfolioMoney(proj.budget_spent, proj.currency)} / {formatPortfolioMoney(proj.budget_planned, proj.currency)}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                      Belum tertaut
                    </span>
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
