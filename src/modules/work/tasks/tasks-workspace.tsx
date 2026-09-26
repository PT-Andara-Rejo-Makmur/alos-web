"use client";

import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, ListChecks, Search, Trash2, ArrowRight, RefreshCw, LayoutGrid, Table } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { WorkWorkspaceContext } from "../shared/types";
import { StrategyLinkPanel } from "../shared/strategy-link-panel";
import { WorkStatusBadge } from "../ui/work-status-badge";
import { WorkNotice } from "../ui/work-notice";
import {
  formatOperationalDate,
  type OperationalDashboard,
  type OperationalTask,
  type TaskStatus,
} from "@/features/operations/types";
import styles from "../ui/work-ui.module.css";

function toIndonesianTaskStatus(status: TaskStatus): string {
  switch (status) {
    case "TODO":
      return "Akan Dikerjakan";
    case "IN_PROGRESS":
      return "Sedang Dikerjakan";
    case "IN_REVIEW":
      return "Dalam Review";
    case "DONE":
      return "Selesai";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status;
  }
}

interface TasksWorkspaceProps {
  readonly activeWorkspace: WorkWorkspaceContext;
  readonly actor?: unknown;
}

export const TasksWorkspace: React.FC<TasksWorkspaceProps> = ({
  activeWorkspace,
}) => {
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const workspaceId = activeWorkspace.workspaceId;
  const divisionCode = activeWorkspace.divisionCode ?? "";

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational");
      setTasks(result.tasks ?? []);
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
          setTasks(result.tasks ?? []);
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
    if (!workspaceId || !divisionCode || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          division_code: divisionCode,
          title,
          description,
          priority,
          due_date: dueDate || null,
          evidence_required: false,
          idempotency_key: crypto.randomUUID(),
        }),
      });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setShowCreate(false);
      setNotice("Tugas berhasil dibuat dan dicatat pada audit trail.");
      await loadTasks();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusTransition(task: OperationalTask, nextStatus: TaskStatus) {
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/tasks/${task.task_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setNotice(`Status tugas diubah menjadi ${toIndonesianTaskStatus(nextStatus)}.`);
      await loadTasks();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  async function handleDelete(task: OperationalTask) {
    if (!window.confirm(`Hapus tugas “${task.title}” secara permanen?`)) return;
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/tasks/${task.task_id}`, {
        method: "DELETE",
      });
      setNotice(`Tugas “${task.title}” berhasil dihapus.`);
      if (selectedTask?.task_id === task.task_id) {
        setSelectedTask(null);
      }
      await loadTasks();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  const visibleTasks = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.project_name && t.project_name.toLowerCase().includes(q)) ||
        t.status.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q),
    );
  }, [tasks, filter]);

  const kanbanColumns: Array<{ label: string; statuses: TaskStatus[] }> = [
    { label: "Akan Dikerjakan", statuses: ["DRAFT", "TODO"] },
    { label: "Sedang Dikerjakan", statuses: ["IN_PROGRESS"] },
    { label: "Dalam Review", statuses: ["IN_REVIEW"] },
    { label: "Selesai", statuses: ["DONE", "CANCELLED"] },
  ];

  const nextStatusMap: Partial<Record<TaskStatus, TaskStatus>> = {
    DRAFT: "TODO",
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "IN_REVIEW",
    IN_REVIEW: "DONE",
  };

  return (
    <div className={styles.workRoot}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div className={styles.breadcrumb}>
            <span>ALOS</span>
            <span> / </span>
            <span>{activeWorkspace.workspaceLabel.toUpperCase()}</span>
            <span> / </span>
            <span>TUGAS OPERASIONAL</span>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.buttonPrimary}
              disabled={!workspaceId || !divisionCode}
              onClick={() => setShowCreate((v) => !v)}
            >
              <Plus size={14} aria-hidden="true" />
              <span>{showCreate ? "Tutup Form" : "Buat Tugas"}</span>
            </button>
          </div>
        </div>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle} style={{ fontSize: "22px" }}>
            Tugas
          </h2>
        </div>
        <p className={styles.pageSubtitle}>
          Papan tugas operasional dan daftar aktivitas harian yang dapat dipetakan ke proyek dan sasaran strategis.
        </p>
      </header>

      {error && <WorkNotice variant="error" message={error} />}
      {notice && <WorkNotice variant="success" message={notice} />}

      {/* Compact Operational Summary Strip */}
      <div className={styles.summaryStrip}>
        <span className={styles.summaryStripTitle}>Ringkasan Tugas</span>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Total:</span>
          <span className={styles.summaryItemValue}>{tasks.length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Sedang Dikerjakan:</span>
          <span className={`${styles.summaryItemValue} ${styles.statusTextPending}`}>
            {tasks.filter((t) => t.status === "IN_PROGRESS").length}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Menunggu Review:</span>
          <span className={`${styles.summaryItemValue} ${styles.statusTextCompleted}`}>
            {tasks.filter((t) => t.status === "IN_REVIEW").length}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Selesai:</span>
          <span className={`${styles.summaryItemValue} ${styles.statusTextOnTrack}`}>
            {tasks.filter((t) => t.status === "DONE").length}
          </span>
        </div>
      </div>

      {/* Create Task Form */}
      {showCreate && (
        <form className={styles.formShell} onSubmit={(e) => void handleCreate(e)}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Catat Tugas Baru</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="task-title">
                Judul Tugas <span className={styles.statusTextCritical}>*</span>
              </label>
              <input
                id="task-title"
                type="text"
                className={styles.formInput}
                required
                minLength={2}
                placeholder="Rincian aktivitas yang harus diselesaikan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="task-priority">
                Prioritas
              </label>
              <select
                id="task-priority"
                className={styles.formSelect}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="task-due">
                Tenggat Waktu
              </label>
              <input
                id="task-due"
                type="date"
                className={styles.formInput}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="task-desc">
                Deskripsi & Catatan Pelaksanaan
              </label>
              <textarea
                id="task-desc"
                className={styles.formTextarea}
                rows={2}
                maxLength={10000}
                placeholder="Keterangan tambahan untuk pelaksana tugas..."
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
              {saving ? "Menyimpan…" : "Simpan Tugas"}
            </button>
          </div>
        </form>
      )}

      {/* Selected Task Detail Area with StrategyLinkPanel */}
      {selectedTask && (
        <div className={styles.formShell} style={{ borderLeft: "4px solid #0f172a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className={styles.metricLabel}>DETAIL TUGAS TERPILIH</span>
              <h3 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 700 }}>
                {selectedTask.title}
              </h3>
            </div>
            <button
              type="button"
              className={styles.buttonSmall}
              onClick={() => setSelectedTask(null)}
            >
              Tutup
            </button>
          </div>
          {selectedTask.description && (
            <p style={{ margin: 0, fontSize: "13px", color: "#44403c", lineHeight: 1.5 }}>
              {selectedTask.description}
            </p>
          )}
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#57534e", flexWrap: "wrap" }}>
            <span><strong>Proyek:</strong> {selectedTask.project_name ?? "Umum"}</span>
            <span><strong>Prioritas:</strong> {selectedTask.priority}</span>
            <span><strong>Status:</strong> {toIndonesianTaskStatus(selectedTask.status)}</span>
            <span><strong>Tenggat:</strong> {formatOperationalDate(selectedTask.due_date)}</span>
          </div>

          <StrategyLinkPanel
            linkage={{ state: "SOURCE_UNAVAILABLE" }}
            contextTitle={`Keterkaitan Strategi: ${selectedTask.title}`}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} style={{ color: "#78716c" }} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari tugas berdasarkan judul atau keterangan…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className={styles.filterControls}>
          <div style={{ display: "flex", border: "1px solid #d6d3d1", borderRadius: "6px", overflow: "hidden" }}>
            <button
              type="button"
              className={styles.buttonSmall}
              style={{
                border: "none",
                borderRadius: 0,
                background: viewMode === "kanban" ? "#0f172a" : "#ffffff",
                color: viewMode === "kanban" ? "#ffffff" : "#292524",
              }}
              onClick={() => setViewMode("kanban")}
              title="Tampilan Kanban"
            >
              <LayoutGrid size={13} aria-hidden="true" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              className={styles.buttonSmall}
              style={{
                border: "none",
                borderRadius: 0,
                background: viewMode === "table" ? "#0f172a" : "#ffffff",
                color: viewMode === "table" ? "#ffffff" : "#292524",
              }}
              onClick={() => setViewMode("table")}
              title="Tampilan Tabel"
            >
              <Table size={13} aria-hidden="true" />
              <span>Tabel</span>
            </button>
          </div>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => void loadTasks()}
            disabled={loading}
          >
            <RefreshCw size={12} aria-hidden="true" />
            <span>{loading ? "Memuat…" : "Muat Ulang"}</span>
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" ? (
        <div className={styles.kanbanGrid}>
          {kanbanColumns.map((col) => {
            const colTasks = visibleTasks.filter((t) => col.statuses.includes(t.status));
            return (
              <section key={col.label} className={styles.kanbanColumn}>
                <header className={styles.kanbanColumnHeader}>
                  <strong className={styles.kanbanColumnTitle}>{col.label}</strong>
                  <span className={styles.kanbanColumnCount}>{colTasks.length}</span>
                </header>
                <div className={styles.kanbanColumnBody}>
                  {colTasks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 10px", color: "#a8a29e", fontSize: "12px" }}>
                      Belum ada tugas pada tahap ini.
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const next = nextStatusMap[task.status];
                      return (
                        <article
                          key={task.task_id}
                          className={styles.kanbanCard}
                          onClick={() => setSelectedTask(task)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.kanbanCardTop}>
                            <WorkStatusBadge status={task.priority} />
                            <small style={{ fontSize: "11px", color: "#78716c" }}>
                              {formatOperationalDate(task.due_date)}
                            </small>
                          </div>
                          <strong className={styles.kanbanCardTitle}>{task.title}</strong>
                          {task.description && (
                            <p className={styles.kanbanCardDesc}>{task.description}</p>
                          )}
                          <div className={styles.kanbanCardFooter} onClick={(e) => e.stopPropagation()}>
                            {next ? (
                              <button
                                type="button"
                                className={styles.buttonSmall}
                                onClick={() => void handleStatusTransition(task, next)}
                              >
                                <span>Lanjut ke {toIndonesianTaskStatus(next)}</span>
                                <ArrowRight size={10} aria-hidden="true" />
                              </button>
                            ) : (
                              <span className={styles.statusTextOnTrack} style={{ fontSize: "11px", fontWeight: 600 }}>
                                {toIndonesianTaskStatus(task.status)}
                              </span>
                            )}
                            <button
                              type="button"
                              className={styles.buttonDanger}
                              style={{ padding: "3px 6px", fontSize: "10px" }}
                              onClick={() => void handleDelete(task)}
                              title={`Hapus tugas ${task.title}`}
                            >
                              <Trash2 size={11} aria-hidden="true" />
                            </button>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className={styles.tableContainer}>
          <table className={styles.table} aria-label="Tabel Tugas Operasional">
            <thead>
              <tr>
                <th scope="col">Tugas</th>
                <th scope="col">Proyek</th>
                <th scope="col">Prioritas</th>
                <th scope="col">Status</th>
                <th scope="col">Tenggat</th>
                <th scope="col">Keterkaitan Strategi</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <ListChecks size={24} className={styles.emptyIcon} aria-hidden="true" />
                      <p className={styles.emptyTitle}>Belum ada tugas terdaftar</p>
                      <p className={styles.emptyHelper}>
                        Aktivitas dan tugas yang dicatat dalam scope ini akan tampil di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleTasks.map((task) => {
                  const next = nextStatusMap[task.status];
                  return (
                    <tr
                      key={task.task_id}
                      onClick={() => setSelectedTask(task)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className={styles.primaryCell}>
                        <div>{task.title}</div>
                        {task.description && (
                          <div className={styles.subtextCell}>{task.description}</div>
                        )}
                      </td>
                      <td>{task.project_name ?? "—"}</td>
                      <td>
                        <WorkStatusBadge status={task.priority} />
                      </td>
                      <td>
                        <WorkStatusBadge status={task.status} />
                      </td>
                      <td>{formatOperationalDate(task.due_date)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                          Belum tertaut
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {next && (
                            <button
                              type="button"
                              className={styles.buttonSmall}
                              onClick={() => void handleStatusTransition(task, next)}
                            >
                              <span>{toIndonesianTaskStatus(next)}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.buttonDanger}
                            style={{ padding: "4px 7px" }}
                            onClick={() => void handleDelete(task)}
                            title="Hapus tugas"
                          >
                            <Trash2 size={12} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
