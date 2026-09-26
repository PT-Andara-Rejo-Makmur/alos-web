"use client";

import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Files, Search, CheckCircle2, XCircle, ArrowRight, RefreshCw, Eye } from "lucide-react";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { WorkWorkspaceContext } from "../shared/types";
import { WorkStatusBadge } from "../ui/work-status-badge";
import { WorkNotice } from "../ui/work-notice";
import {
  formatDocumentDate,
  isChecklistComplete,
  type DocumentDetail,
  type DocumentRecord,
} from "@/features/documents/policy";
import type { SessionActor } from "@/features/session";
import styles from "../ui/work-ui.module.css";

interface DocumentsWorkspaceProps {
  readonly activeWorkspace: WorkWorkspaceContext;
  readonly actor?: SessionActor;
}

export const DocumentsWorkspace: React.FC<DocumentsWorkspaceProps> = ({
  activeWorkspace,
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const workspaceId = activeWorkspace.workspaceId;

  async function loadDocuments() {
    setLoading(true);
    setError(null);
    try {
      const docs = await authenticatedApiRequest<DocumentRecord[]>("/api/v1/documents");
      setDocuments(docs ?? []);
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
        const docs = await authenticatedApiRequest<DocumentRecord[]>("/api/v1/documents");
        if (!ignore) {
          setDocuments(docs ?? []);
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

  async function loadDocDetail(docId: string) {
    try {
      const detail = await authenticatedApiRequest<DocumentDetail>(`/api/v1/documents/${docId}`);
      setSelectedDoc(detail);
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  async function handleCreateDoc(e: FormEvent) {
    e.preventDefault();
    if (!workspaceId || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const created = await authenticatedApiRequest<DocumentDetail>("/api/v1/documents", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          title,
          content,
          metadata: { created_via: "ALOS_WORK_MODULE" },
        }),
      });
      setTitle("");
      setContent("");
      setShowCreate(false);
      setNotice(`Dokumen “${created.document.title}” berhasil dibuat sebagai draft.`);
      await loadDocuments();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitDoc(docId: string) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/documents/${docId}/submit-review`, { method: "POST" });
      setNotice("Dokumen telah diajukan untuk proses review.");
      await loadDocDetail(docId);
      await loadDocuments();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleApproveDoc(docId: string) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/documents/${docId}/approve`, { method: "POST" });
      setNotice("Dokumen resmi disetujui.");
      await loadDocDetail(docId);
      await loadDocuments();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRejectDoc(docId: string) {
    const reason = window.prompt("Masukkan alasan penolakan dokumen:");
    if (!reason) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await authenticatedApiRequest(`/api/v1/documents/${docId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setNotice("Dokumen telah ditolak dengan catatan audit.");
      await loadDocDetail(docId);
      await loadDocuments();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const visibleDocs = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q) ||
        (d.created_by_user_id && d.created_by_user_id.toLowerCase().includes(q)),
    );
  }, [documents, filter]);

  return (
    <div className={styles.workRoot}>
      {/* Header with h2 'Documents' for test contract compatibility */}
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div className={styles.breadcrumb}>
            <span>ALOS</span>
            <span> / </span>
            <span>{activeWorkspace.workspaceLabel.toUpperCase()}</span>
            <span> / </span>
            <span>PUSAT DOKUMEN</span>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => setShowCreate((v) => !v)}
            >
              <Plus size={14} aria-hidden="true" />
              <span>{showCreate ? "Tutup Form" : "Buat Dokumen"}</span>
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => void loadDocuments()}
              disabled={loading}
            >
              <RefreshCw size={12} aria-hidden="true" />
              <span>{loading ? "Memuat…" : "Muat Ulang"}</span>
            </button>
          </div>
        </div>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle} style={{ fontSize: "22px" }}>
            Dokumen
          </h2>
        </div>
        <p className={styles.pageSubtitle}>
          Repositori dokumen resmi ALOS dengan alur kendali kualitas berjenjang: Draf, Checklist, Review, dan Persetujuan Otoritatif.
        </p>
      </header>

      {error && <WorkNotice variant="error" message={error} />}
      {notice && <WorkNotice variant="success" message={notice} />}

      {/* Compact Operational Summary Strip */}
      <div className={styles.summaryStrip}>
        <span className={styles.summaryStripTitle}>Ringkasan Dokumen</span>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Total:</span>
          <span className={styles.summaryItemValue}>{documents.length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Draf:</span>
          <span className={`${styles.summaryItemValue} ${styles.statusTextNeutral}`}>
            {documents.filter((d) => d.status === "DRAFT").length}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Dalam Telaah:</span>
          <span className={`${styles.summaryItemValue} ${styles.statusTextPending}`}>
            {documents.filter((d) => ["SUBMITTED", "CHECKED", "REVIEWED"].includes(d.status)).length}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Disetujui:</span>
          <span className={`${styles.summaryItemValue} ${styles.statusTextOnTrack}`}>
            {documents.filter((d) => d.status === "APPROVED").length}
          </span>
        </div>
      </div>

      {/* Create Document Form */}
      {showCreate && (
        <form className={styles.formShell} onSubmit={(e) => void handleCreateDoc(e)}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Buat Dokumen Baru</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="doc-title">
                Judul Dokumen <span className={styles.statusTextCritical}>*</span>
              </label>
              <input
                id="doc-title"
                type="text"
                className={styles.formInput}
                required
                minLength={3}
                placeholder="Contoh: Rencana Strategis Tahunan 2026 atau SOP Operasional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel} htmlFor="doc-content">
                Isi Dokumen
              </label>
              <textarea
                id="doc-content"
                className={styles.formTextarea}
                rows={4}
                placeholder="Ketik konten dokumen atau rincian kebijakan..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
              {saving ? "Menyimpan…" : "Simpan Dokumen"}
            </button>
          </div>
        </form>
      )}

      {/* Selected Document Lifecycle Panel */}
      {selectedDoc && (
        <div className={styles.formShell} style={{ borderLeft: "4px solid #0f172a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className={styles.metricLabel}>DOKUMEN TERPILIH</span>
              <h3 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 700 }}>
                {selectedDoc.document.title}
              </h3>
            </div>
            <button
              type="button"
              className={styles.buttonSmall}
              onClick={() => setSelectedDoc(null)}
            >
              Tutup
            </button>
          </div>

          <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "#57534e", flexWrap: "wrap" }}>
            <span><strong>Status:</strong> {selectedDoc.document.status}</span>
            <span><strong>Dibuat:</strong> {formatDocumentDate(selectedDoc.document.created_at)}</span>
            <span><strong>Pembuat:</strong> {selectedDoc.document.created_by_user_id ?? "Sistem"}</span>
            <span><strong>Checklist:</strong> {isChecklistComplete(selectedDoc) ? "Lengkap" : "Belum lengkap"}</span>
          </div>

          {selectedDoc.content && (
            <div style={{ background: "#f5f5f4", padding: "10px", borderRadius: "6px", fontSize: "13px", color: "#292524", lineHeight: 1.5 }}>
              {selectedDoc.content}
            </div>
          )}

          {/* Lifecycle Action Buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
            {selectedDoc.document.status === "DRAFT" && (
              <button
                type="button"
                className={styles.buttonPrimary}
                disabled={saving}
                onClick={() => void handleSubmitDoc(selectedDoc.document.document_id)}
              >
                <span>Ajukan untuk Review</span>
                <ArrowRight size={11} aria-hidden="true" />
              </button>
            )}

            {selectedDoc.document.status === "IN_REVIEW" && (
              <>
                <button
                  type="button"
                  className={styles.buttonPrimary}
                  disabled={saving}
                  onClick={() => void handleApproveDoc(selectedDoc.document.document_id)}
                >
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Setujui Dokumen</span>
                </button>
                <button
                  type="button"
                  className={styles.buttonDanger}
                  disabled={saving}
                  onClick={() => void handleRejectDoc(selectedDoc.document.document_id)}
                >
                  <XCircle size={13} aria-hidden="true" />
                  <span>Tolak Dokumen</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} style={{ color: "#78716c" }} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari dokumen berdasarkan judul…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabel Dokumen ALOS">
          <thead>
            <tr>
              <th scope="col">Dokumen</th>
              <th scope="col">Status Lifecycle</th>
              <th scope="col">Klasifikasi</th>
              <th scope="col">Tanggal Dibuat</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visibleDocs.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <Files size={24} className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyTitle}>Belum ada dokumen dalam repositori</p>
                    <p className={styles.emptyHelper}>
                      Buat dokumen baru atau ajukan draft untuk memulai proses telaah mutu.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleDocs.map((doc) => (
                <tr
                  key={doc.document_id}
                  onClick={() => void loadDocDetail(doc.document_id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedDoc?.document.document_id === doc.document_id ? "#f5f5f4" : undefined,
                  }}
                >
                  <td className={styles.primaryCell}>
                    <div>{doc.title}</div>
                    <div className={styles.subtextCell}>{doc.origin ?? "INTERNAL"}</div>
                  </td>
                  <td>
                    <WorkStatusBadge status={doc.status} />
                  </td>
                  <td>
                    <span className={styles.badge}>
                      {doc.classification ?? "INTERNAL"}
                    </span>
                  </td>
                  <td>{formatDocumentDate(doc.created_at)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.buttonSmall}
                      onClick={() => void loadDocDetail(doc.document_id)}
                    >
                      <Eye size={12} aria-hidden="true" />
                      <span>Buka</span>
                    </button>
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
