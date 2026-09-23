"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { apiMessage, apiRequest } from "@/lib/api";
import type { SessionActor, Workspace } from "@/features/mvp1/lib/governance";
import type { ProjectPortfolioSnapshot, ProjectStatus } from "@/features/mvp1/lib/portfolio";

interface PropertyOperationsDrawerProps {
  readonly actor?: SessionActor | null;
  readonly projects: ProjectPortfolioSnapshot["projects"];
  readonly onDataChanged: () => void;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly activeWorkspaceId?: string | null;
}

export function PropertyOperationsDrawer({
  actor,
  projects,
  onDataChanged,
  isOpen,
  onClose,
  activeWorkspaceId,
}: PropertyOperationsDrawerProps) {
  const initialProject = projects[0];
  const [selectedProjectId, setSelectedProjectId] = useState(initialProject?.project_id ?? "");
  const [mode, setMode] = useState<"update" | "milestone" | "issue" | "create">("update");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Update Form State
  const [updateStatus, setUpdateStatus] = useState<ProjectStatus>(initialProject?.status ?? "ON_TRACK");
  const [updateProgress, setUpdateProgress] = useState(String(initialProject?.progress_percent ?? "0"));
  const [updateDeadline, setUpdateDeadline] = useState(initialProject?.deadline ?? "");
  const [updateBudgetSpent, setUpdateBudgetSpent] = useState(
    initialProject?.budget_spent ? String(initialProject.budget_spent) : "",
  );

  // Milestone Form State
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [milestoneStatus, setMilestoneStatus] = useState<ProjectStatus>("ON_TRACK");

  // Issue Form State
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [issueSeverity, setIssueSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [issueDueDate, setIssueDueDate] = useState("");

  // Create Project State
  const [createForm, setCreateForm] = useState({
    code: "",
    name: "",
    category: "RESIDENTIAL",
    deadline: "",
  });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [createWorkspaceId, setCreateWorkspaceId] = useState(activeWorkspaceId || actor?.workspace_ids[0] || "");

  const selectedProject = projects.find((p) => p.project_id === selectedProjectId) ?? initialProject;

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    const p = projects.find((item) => item.project_id === id);
    if (p) {
      setUpdateStatus(p.status);
      setUpdateProgress(String(p.progress_percent));
      setUpdateDeadline(p.deadline ?? "");
      setUpdateBudgetSpent(p.budget_spent ? String(p.budget_spent) : "");
    }
  }

  useEffect(() => {
    if (mode === "create" && actor && !workspaces.length) {
      apiRequest<Workspace[]>("/api/v1/workspaces")
        .then((items) => {
          const visible = items.filter((item) => actor.workspace_ids.includes(item.workspace_id));
          setWorkspaces(visible);
          if (!createWorkspaceId && visible[0]) setCreateWorkspaceId(visible[0].workspace_id);
        })
        .catch(() => {});
    }
  }, [actor, createWorkspaceId, mode, workspaces.length]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (mode === "update" && selectedProject) {
        await apiRequest(`/api/v1/projects/${selectedProject.project_id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: updateStatus,
            progress_percent: Number(updateProgress),
            deadline: updateDeadline || null,
            budget_spent: updateBudgetSpent ? Number(updateBudgetSpent) : null,
          }),
        });
        setNotice("Progres dan status proyek berhasil diperbarui.");
      } else if (mode === "milestone" && selectedProject) {
        await apiRequest(`/api/v1/projects/${selectedProject.project_id}/milestones`, {
          method: "POST",
          body: JSON.stringify({
            title: milestoneTitle,
            due_date: milestoneDueDate,
            status: milestoneStatus,
          }),
        });
        setMilestoneTitle("");
        setMilestoneDueDate("");
        setNotice("Milestone proyek berhasil ditambahkan.");
      } else if (mode === "issue" && selectedProject) {
        await apiRequest("/api/v1/project-issues", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: selectedProject.workspace_id,
            division_code: selectedProject.division_code,
            project_id: selectedProject.project_id,
            title: issueTitle,
            description: issueDesc,
            severity: issueSeverity,
            due_date: issueDueDate || null,
          }),
        });
        setIssueTitle("");
        setIssueDesc("");
        setNotice("Isu proyek berhasil dicatat.");
      } else if (mode === "create" && actor) {
        const activeWs = workspaces.find((w) => w.workspace_id === createWorkspaceId);
        await apiRequest("/api/v1/projects", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: createWorkspaceId,
            division_code: activeWs?.division_code ?? "PROPERTY",
            code: createForm.code,
            name: createForm.name,
            category: createForm.category,
            deadline: createForm.deadline || null,
          }),
        });
        setCreateForm({ code: "", name: "", category: "RESIDENTIAL", deadline: "" });
        setNotice("Proyek baru berhasil dibuat.");
      }
      onDataChanged();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // Safe delete handler with explicit confirmation
  async function handleDeleteProject() {
    if (!selectedProject || saving) return;
    const confirmed = window.confirm(
      `PENTING: Hapus proyek "${selectedProject.name}" secara permanen? Tindakan ini dicatat dalam audit trail.`,
    );
    if (!confirmed) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/v1/projects/${selectedProject.project_id}`, { method: "DELETE" });
      setSelectedProjectId("");
      setNotice(`Proyek "${selectedProject.name}" telah dihapus.`);
      onDataChanged();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      aria-label="Modal Operasi Proyek"
      aria-modal="true"
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#99732f",
                textTransform: "uppercase",
              }}
            >
              PROJECT CONTROLS
            </span>
            <h3 style={{ margin: "2px 0 0", fontSize: "1.15rem", color: "#141619" }}>
              Operasi Proyek Lapangan
            </h3>
          </div>
          <button
            aria-label="Tutup modal operasi"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#6e7670",
            }}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selectors */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e7ebe7", paddingBottom: "10px" }}>
          <button
            onClick={() => setMode("update")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: mode === "update" ? 700 : 500,
              backgroundColor: mode === "update" ? "#07533e" : "#f0f3f0",
              color: mode === "update" ? "#ffffff" : "#2e3430",
              border: "none",
              cursor: "pointer",
            }}
            type="button"
          >
            Perbarui Proyek
          </button>
          <button
            onClick={() => setMode("milestone")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: mode === "milestone" ? 700 : 500,
              backgroundColor: mode === "milestone" ? "#07533e" : "#f0f3f0",
              color: mode === "milestone" ? "#ffffff" : "#2e3430",
              border: "none",
              cursor: "pointer",
            }}
            type="button"
          >
            + Milestone
          </button>
          <button
            onClick={() => setMode("issue")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: mode === "issue" ? 700 : 500,
              backgroundColor: mode === "issue" ? "#07533e" : "#f0f3f0",
              color: mode === "issue" ? "#ffffff" : "#2e3430",
              border: "none",
              cursor: "pointer",
            }}
            type="button"
          >
            Catat Isu
          </button>
          <button
            onClick={() => setMode("create")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: mode === "create" ? 700 : 500,
              backgroundColor: mode === "create" ? "#07533e" : "#f0f3f0",
              color: mode === "create" ? "#ffffff" : "#2e3430",
              border: "none",
              cursor: "pointer",
            }}
            type="button"
          >
            + Proyek Baru
          </button>
        </div>

        {error ? (
          <div
            style={{
              padding: "10px 14px",
              background: "#fdf2f2",
              border: "1px solid #f8d7da",
              color: "#ea2f29",
              borderRadius: "6px",
              fontSize: "0.78rem",
            }}
          >
            {error}
          </div>
        ) : null}

        {notice ? (
          <div
            style={{
              padding: "10px 14px",
              background: "#edf7ed",
              border: "1px solid #c8e6c9",
              color: "#0b9952",
              borderRadius: "6px",
              fontSize: "0.78rem",
            }}
          >
            {notice}
          </div>
        ) : null}

        {mode !== "create" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="select-project" style={{ fontSize: "0.76rem", fontWeight: 600, color: "#6e7670" }}>
              Pilih Proyek Sasaran:
            </label>
            <select
              id="select-project"
              onChange={(e) => handleSelectProject(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d0d7d2",
                fontSize: "0.82rem",
              }}
              value={selectedProject?.project_id ?? ""}
            >
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mode === "update" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Status
                  <select
                    onChange={(e) => setUpdateStatus(e.target.value as ProjectStatus)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    value={updateStatus}
                  >
                    <option value="ON_TRACK">ON_TRACK</option>
                    <option value="AT_RISK">AT_RISK</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Progress (%)
                  <input
                    max="100"
                    min="0"
                    onChange={(e) => setUpdateProgress(e.target.value)}
                    required
                    step="0.1"
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    type="number"
                    value={updateProgress}
                  />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Tenggat Waktu
                  <input
                    onChange={(e) => setUpdateDeadline(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    type="date"
                    value={updateDeadline}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Biaya Aktual Terpakai (IDR)
                  <input
                    min="0"
                    onChange={(e) => setUpdateBudgetSpent(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    type="number"
                    value={updateBudgetSpent}
                  />
                </label>
              </div>
            </>
          )}

          {mode === "milestone" && (
            <>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                Judul Milestone
                <input
                  minLength={2}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Misal: Pengecoran Lantai 2"
                  required
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                  value={milestoneTitle}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Tenggat Waktu
                  <input
                    onChange={(e) => setMilestoneDueDate(e.target.value)}
                    required
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    type="date"
                    value={milestoneDueDate}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Status Awal
                  <select
                    onChange={(e) => setMilestoneStatus(e.target.value as ProjectStatus)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    value={milestoneStatus}
                  >
                    <option value="ON_TRACK">ON_TRACK</option>
                    <option value="AT_RISK">AT_RISK</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </label>
              </div>
            </>
          )}

          {mode === "issue" && (
            <>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                Judul Isu Lapangan
                <input
                  minLength={2}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="Misal: Keterlambatan Pengiriman Besi Ulir"
                  required
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                  value={issueTitle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                Deskripsi Isu
                <textarea
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Rincian kendala atau deviasi lapangan..."
                  rows={3}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                  value={issueDesc}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Severitas
                  <select
                    onChange={(e) =>
                      setIssueSeverity(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
                    }
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    value={issueSeverity}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Target Selesai
                  <input
                    onChange={(e) => setIssueDueDate(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    type="date"
                    value={issueDueDate}
                  />
                </label>
              </div>
            </>
          )}

          {mode === "create" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Kode Proyek
                  <input
                    maxLength={40}
                    minLength={2}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                      })
                    }
                    placeholder="AND-PRP-04"
                    required
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    value={createForm.code}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                  Kategori
                  <input
                    maxLength={80}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    placeholder="RESIDENTIAL"
                    required
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                    value={createForm.category}
                  />
                </label>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                Nama Proyek
                <input
                  maxLength={160}
                  minLength={2}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Nama resmi proyek..."
                  required
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                  value={createForm.name}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.76rem" }}>
                Tenggat Target
                <input
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d0d7d2" }}
                  type="date"
                  value={createForm.deadline}
                />
              </label>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "8px",
            }}
          >
            {mode === "update" && selectedProject && (
              <button
                disabled={saving}
                onClick={handleDeleteProject}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ea2f29",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                type="button"
              >
                <AlertTriangle size={14} />
                <span>Hapus Proyek</span>
              </button>
            )}

            <button
              disabled={saving}
              style={{
                marginLeft: "auto",
                padding: "8px 18px",
                borderRadius: "6px",
                backgroundColor: "#07533e",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
              type="submit"
            >
              {saving ? "Menyimpan…" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
