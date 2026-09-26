"use client";

import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, ChartColumn, Search, Play, Calendar, Trash2, RefreshCw } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { WorkWorkspaceContext } from "../shared/types";
import { WorkStatusBadge } from "../ui/work-status-badge";
import { WorkNotice } from "../ui/work-notice";
import {
  formatOperationalDate,
  humanStatus,
  type OperationalDashboard,
  type Report,
  type ReportDefinition,
} from "@/features/operations/types";
import styles from "../ui/work-ui.module.css";

interface ReportsWorkspaceProps {
  readonly activeWorkspace: WorkWorkspaceContext;
  readonly actor?: unknown;
}

export const ReportsWorkspace: React.FC<ReportsWorkspaceProps> = ({
  activeWorkspace,
}) => {
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create definition form
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("MONTHLY");
  const [scope, setScope] = useState("WORKSPACE");

  const workspaceId = activeWorkspace.workspaceId;
  const divisionCode = activeWorkspace.divisionCode ?? "";

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [defs, dash] = await Promise.all([
        authenticatedApiRequest<ReportDefinition[]>("/api/v1/report-definitions"),
        authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational"),
      ]);
      setDefinitions(defs ?? []);
      setReports(dash.reports ?? []);
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
        const [defs, dash] = await Promise.all([
          authenticatedApiRequest<ReportDefinition[]>("/api/v1/report-definitions"),
          authenticatedApiRequest<OperationalDashboard>("/api/v1/dashboard/operational"),
        ]);
        if (!ignore) {
          setDefinitions(defs ?? []);
          setReports(dash.reports ?? []);
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

  async function handleCreateDefinition(e: FormEvent) {
    e.preventDefault();
    if (!workspaceId || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest("/api/v1/report-definitions", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          division_code: divisionCode || null,
          name,
          period,
          scope,
          metrics: ["projects_total", "budget_variance", "tasks_completed"],
          recipients: [],
        }),
      });
      setName("");
      setShowCreate(false);
      setNotice("Definisi laporan baru berhasil didaftarkan.");
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate(definitionId: string) {
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/report-definitions/${definitionId}/generate`, {
        method: "POST",
      });
      setNotice("Permintaan generasi laporan berhasil dikirim ke antrean Backend.");
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  async function handleSchedule(def: ReportDefinition) {
    const expr = window.prompt("Masukkan ekspresi jadwal cron (contoh: 0 9 * * 1 untuk Senin jam 09:00):", def.schedule_expression ?? "0 8 1 * *");
    if (expr === null) return;
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/report-definitions/${def.report_definition_id}/schedule`, {
        method: "PUT",
        body: JSON.stringify({ schedule_expression: expr || null }),
      });
      setNotice("Jadwal laporan berhasil diperbarui.");
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  async function handleDelete(def: ReportDefinition) {
    if (!window.confirm(`Hapus definisi laporan “${def.name}”?`)) return;
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/report-definitions/${def.report_definition_id}`, {
        method: "DELETE",
      });
      setNotice("Definisi laporan telah dihapus.");
      await loadData();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  const visibleDefinitions = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return definitions;
    return definitions.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.period.toLowerCase().includes(q) ||
        d.scope.toLowerCase().includes(q),
    );
  }, [definitions, filter]);

  return (
    <div className={styles.workRoot}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div className={styles.breadcrumb}>
            <span>ALOS</span>
            <span> / </span>
            <span>{activeWorkspace.workspaceLabel.toUpperCase()}</span>
            <span> / </span>
            <span>LAPORAN TERKENDALI</span>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => setShowCreate((v) => !v)}
              disabled={!workspaceId}
            >
              <Plus size={14} aria-hidden="true" />
              <span>{showCreate ? "Tutup Form" : "Definisi Laporan"}</span>
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
            Laporan Operasional
          </h2>
        </div>
        <p className={styles.pageSubtitle}>
          Definisi laporan formal, jadwal agregasi otomatis, dan riwayat arsip laporan berkala.
        </p>
      </header>

      {error && <WorkNotice variant="error" message={error} />}
      {notice && <WorkNotice variant="success" message={notice} />}

      {/* Metrics */}
      <div className={styles.metricStrip}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Definisi</span>
          <span className={styles.metricValue}>{definitions.length}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Terjadwal</span>
          <span className={styles.metricValue} style={{ color: "#15803d" }}>
            {definitions.filter((d) => Boolean(d.schedule_expression)).length}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Arsip Laporan</span>
          <span className={styles.metricValue}>{reports.length}</span>
        </div>
      </div>

      {/* Create Definition Form */}
      {showCreate && (
        <form className={styles.formShell} onSubmit={(e) => void handleCreateDefinition(e)}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Buat Definisi Laporan Baru</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="rep-name">
                Nama Laporan <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="rep-name"
                type="text"
                className={styles.formInput}
                required
                minLength={3}
                placeholder="Contoh: Laporan Bulanan Kemajuan Proyek & Biaya"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="rep-period">
                Periode Agregasi
              </label>
              <select
                id="rep-period"
                className={styles.formSelect}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="WEEKLY">MINGGUAN (WEEKLY)</option>
                <option value="MONTHLY">BULANAN (MONTHLY)</option>
                <option value="QUARTERLY">TRIWULAN (QUARTERLY)</option>
                <option value="ANNUAL">TAHUNAN (ANNUAL)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="rep-scope">
                Scope Pelaporan
              </label>
              <select
                id="rep-scope"
                className={styles.formSelect}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="WORKSPACE">Cakupan Workspace</option>
                <option value="DIVISION">Cakupan Divisi</option>
                <option value="ENTERPRISE">Korporasi Penuh</option>
              </select>
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
              {saving ? "Menyimpan…" : "Simpan Definisi"}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} style={{ color: "#78716c" }} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari definisi laporan…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table 1: Definitions */}
      <div className={styles.tableContainer}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #e7e5e4", background: "#fafaf9" }}>
          <strong style={{ fontSize: "13px", color: "#1c1917" }}>Definisi dan Jadwal Laporan</strong>
        </div>
        <table className={styles.table} aria-label="Tabel Definisi Laporan">
          <thead>
            <tr>
              <th scope="col">Nama Laporan</th>
              <th scope="col">Periode</th>
              <th scope="col">Scope</th>
              <th scope="col">Jadwal Cron</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visibleDefinitions.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <ChartColumn size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>Belum ada definisi laporan</p>
                    <p className={styles.emptyHelper}>
                      Daftarkan konfigurasi laporan berkala untuk menghasilkan ringkasan otomatis.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleDefinitions.map((def) => (
                <tr key={def.report_definition_id}>
                  <td className={styles.primaryCell}>{def.name}</td>
                  <td>{humanStatus(def.period)}</td>
                  <td>{humanStatus(def.scope)}</td>
                  <td>
                    {def.schedule_expression ? (
                      <span className={styles.codeCell}>{def.schedule_expression}</span>
                    ) : (
                      <span className={styles.subtextCell}>Manual</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={styles.buttonSmall}
                        onClick={() => void handleGenerate(def.report_definition_id)}
                        title="Generate laporan sekarang"
                      >
                        <Play size={10} aria-hidden="true" />
                        <span>Generate</span>
                      </button>
                      <button
                        type="button"
                        className={styles.buttonSmall}
                        onClick={() => void handleSchedule(def)}
                        title="Atur jadwal cron"
                      >
                        <Calendar size={10} aria-hidden="true" />
                        <span>Jadwal</span>
                      </button>
                      <button
                        type="button"
                        className={styles.buttonDanger}
                        style={{ padding: "4px 7px" }}
                        onClick={() => void handleDelete(def)}
                        title="Hapus definisi laporan"
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

      {/* Table 2: Generated Reports Archive */}
      <div className={styles.tableContainer}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #e7e5e4", background: "#fafaf9" }}>
          <strong style={{ fontSize: "13px", color: "#1c1917" }}>Arsip Laporan yang Dihasilkan</strong>
        </div>
        <table className={styles.table} aria-label="Tabel Arsip Laporan">
          <thead>
            <tr>
              <th scope="col">ID Laporan</th>
              <th scope="col">Status</th>
              <th scope="col">Tanggal Selesai</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>Belum ada arsip laporan tersimpan</p>
                    <p className={styles.emptyHelper}>
                      Laporan yang digenerate akan disimpan dan diarsipkan pada tabel ini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((rep) => (
                <tr key={rep.report_id}>
                  <td className={styles.codeCell}>{rep.report_id}</td>
                  <td>
                    <WorkStatusBadge status={rep.status} />
                  </td>
                  <td>{formatOperationalDate(rep.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
