"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type SourceVersionRecord,
  type SourceVaultPolicyRecord,
  type EvidenceCitation,
  type SourceType,
  type SourceClassification,
  listWorkspaceSources,
  registerSource,
  verifySource,
  getSourceVault,
  configureSourceVault,
  searchSourceEvidence,
  canRegisterSource,
  canVerifySource,
  canConfigureSourceVault,
  extractGoogleDriveFolderId,
} from "@/features/mvp1/lib/sources";
import { normalizeGovernanceError, type GovernanceUiError } from "@/features/mvp1/lib/governance-errors";

type SourcesViewProps = {
  workspaceId: string;
  actorRoles: string[];
  onError: (err: GovernanceUiError | null) => void;
  onNotice: (msg: string) => void;
};

export function SourcesView({ workspaceId, actorRoles, onError, onNotice }: SourcesViewProps) {
  const [sources, setSources] = useState<SourceVersionRecord[]>([]);
  const [vaultPolicy, setVaultPolicy] = useState<SourceVaultPolicyRecord | null>(null);
  const [citations, setCitations] = useState<EvidenceCitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [evidenceQuery, setEvidenceQuery] = useState("");
  const [searchingEvidence, setSearchingEvidence] = useState(false);

  // Register Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [submittingRegister, setSubmittingRegister] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<SourceType>("TEXT");
  const [newClassification, setNewClassification] = useState<SourceClassification>("INTERNAL");
  const [newVersion, setNewVersion] = useState("v1.0");
  const [newLocator, setNewLocator] = useState("");
  const [newContent, setNewContent] = useState("");

  // Verify Modal
  const [verifyTarget, setVerifyTarget] = useState<SourceVersionRecord | null>(null);
  const [verifyReason, setVerifyReason] = useState("");
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // Configure Vault Modal
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultAllowedUrl, setVaultAllowedUrl] = useState("");
  const [vaultExcludedUrl, setVaultExcludedUrl] = useState("");
  const [vaultReason, setVaultReason] = useState("");
  const [submittingVault, setSubmittingVault] = useState(false);

  const loadData = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    try {
      const [srcList, vault] = await Promise.all([
        listWorkspaceSources(workspaceId),
        getSourceVault(workspaceId),
      ]);
      setSources(srcList);
      setVaultPolicy(vault);
    } catch (err) {
      onError(normalizeGovernanceError(err));
    } finally {
      setLoading(false);
    }
  }, [workspaceId, onError]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  async function handleSearchEvidence() {
    if (!workspaceId) return;
    setSearchingEvidence(true);
    onError(null);
    try {
      const res = await searchSourceEvidence(workspaceId, evidenceQuery, 12);
      setCitations(res);
      if (res.length === 0) {
        onNotice("Pencarian selesai: Tidak ada sitasi evidence yang cocok.");
      }
    } catch (err) {
      onError(normalizeGovernanceError(err));
    } finally {
      setSearchingEvidence(false);
    }
  }

  async function handleRegisterSource() {
    if (!canRegisterSource(actorRoles)) return;
    setSubmittingRegister(true);
    onError(null);
    try {
      const created = await registerSource({
        workspace_id: workspaceId,
        source_key: newKey,
        name: newName,
        source_type: newType,
        classification: newClassification,
        version_label: newVersion,
        locator: newLocator.trim() ? newLocator.trim() : null,
        content: newContent,
      });
      onNotice(`Sumber pengetahuan '${created.source_key}' berhasil didaftarkan.`);
      setShowRegisterModal(false);
      setNewKey("");
      setNewName("");
      setNewLocator("");
      setNewContent("");
      await loadData();
    } catch (err) {
      onError(normalizeGovernanceError(err));
    } finally {
      setSubmittingRegister(false);
    }
  }

  async function handleConfirmVerify() {
    if (!verifyTarget || !canVerifySource(actorRoles)) return;
    setSubmittingVerify(true);
    onError(null);
    try {
      await verifySource(verifyTarget.source_key, {
        workspace_id: workspaceId,
        reason: verifyReason,
      });
      onNotice(`Sumber '${verifyTarget.source_key}' berhasil diverifikasi.`);
      setVerifyTarget(null);
      setVerifyReason("");
      await loadData();
    } catch (err) {
      onError(normalizeGovernanceError(err));
    } finally {
      setSubmittingVerify(false);
    }
  }

  function handleOpenVaultModal() {
    if (vaultPolicy) {
      setVaultAllowedUrl(vaultPolicy.allowed_root_url);
      setVaultExcludedUrl(vaultPolicy.excluded_folder_url);
    } else {
      setVaultAllowedUrl("");
      setVaultExcludedUrl("");
    }
    setVaultReason("");
    setShowVaultModal(true);
  }

  async function handleSaveVaultPolicy() {
    if (!canConfigureSourceVault(actorRoles)) return;
    setSubmittingVault(true);
    onError(null);
    try {
      const updated = await configureSourceVault(workspaceId, {
        allowed_root_url: vaultAllowedUrl,
        excluded_folder_url: vaultExcludedUrl,
        reason: vaultReason,
      });
      setVaultPolicy(updated);
      onNotice("Boundary Source Vault berhasil diperbarui.");
      setShowVaultModal(false);
      await loadData();
    } catch (err) {
      onError(normalizeGovernanceError(err));
    } finally {
      setSubmittingVault(false);
    }
  }

  const isVaultValid =
    Boolean(extractGoogleDriveFolderId(vaultAllowedUrl)) &&
    Boolean(extractGoogleDriveFolderId(vaultExcludedUrl)) &&
    extractGoogleDriveFolderId(vaultAllowedUrl) !== extractGoogleDriveFolderId(vaultExcludedUrl) &&
    vaultReason.trim().length >= 10;

  return (
    <div className="gov-agent-header">
      {/* Page Header */}
      <div className="gov-page-header">
        <div className="gov-page-title">
          <div className="gov-breadcrumb">
            Controls / <span>Sources &amp; Evidence Vault</span>
          </div>
          <h2>Sumber Pengetahuan &amp; Evidence Vault</h2>
          <p>Daftar sumber dokumen otoritatif, kebijakan isolasi vault, dan verifikasi manusia independen.</p>
        </div>

        <div className="gov-page-controls">
          <button
            className="gov-ag-request-btn"
            disabled={!canRegisterSource(actorRoles)}
            onClick={() => setShowRegisterModal(true)}
            title={!canRegisterSource(actorRoles) ? "Hanya peran DIRECTOR, DIVISION_OWNER, atau IT_LEAD yang dapat mendaftarkan sumber." : undefined}
            type="button"
          >
            <span>+ Registrasi Sumber</span>
          </button>
        </div>
      </div>

      {/* Source Vault Policy Boundary Card */}
      <div style={{ background: "#ffffff", border: "1px solid #d8e2dc", borderRadius: "10px", padding: "18px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <strong style={{ fontSize: "0.92rem", color: "#111827" }}>
                Source Vault Boundary Policy
              </strong>
              <span className={`gov-perm-status-badge ${vaultPolicy ? "approved" : "draft"}`}>
                {vaultPolicy ? "CONFIGURED" : "NOT_CONFIGURED"}
              </span>
            </div>
            {vaultPolicy ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.78rem", color: "#374151" }}>
                <div>
                  <span style={{ color: "#6b7280" }}>Allowed Root URL: </span>
                  <a href={vaultPolicy.allowed_root_url} rel="noreferrer" style={{ color: "#0d9488", textDecoration: "underline", wordBreak: "break-all" }} target="_blank">
                    {vaultPolicy.allowed_root_url}
                  </a>
                </div>
                <div>
                  <span style={{ color: "#6b7280" }}>Excluded Folder URL: </span>
                  <a href={vaultPolicy.excluded_folder_url} rel="noreferrer" style={{ color: "#dc2626", textDecoration: "underline", wordBreak: "break-all" }} target="_blank">
                    {vaultPolicy.excluded_folder_url}
                  </a>
                </div>
                <div style={{ marginTop: "2px", color: "#546e63" }}>
                  Access Mode: <code>{vaultPolicy.access_mode}</code> · Terakhir diperbarui: {new Date(vaultPolicy.updated_at).toLocaleString("id-ID")}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#6e847a" }}>
                Boundary Source Vault belum dikonfigurasi untuk workspace ini. Konfigurasikan URL folder Google Drive yang diizinkan dan dikecualikan.
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="gov-ag-request-btn"
              disabled={!canConfigureSourceVault(actorRoles)}
              onClick={handleOpenVaultModal}
              style={{ fontSize: "0.76rem", padding: "6px 12px" }}
              title={!canConfigureSourceVault(actorRoles) ? "Hanya peran IT_LEAD yang berwenang mengonfigurasi Source Vault." : undefined}
              type="button"
            >
              ⚙ Konfigurasi Vault Boundary
            </button>
            <button
              className="gov-agent-btn-outline"
              onClick={() => void loadData()}
              style={{ fontSize: "0.76rem" }}
              type="button"
            >
              ↻ Refresh State
            </button>
          </div>
        </div>
      </div>

      {/* Source Registry Table */}
      <div className="gov-table-card" style={{ marginBottom: "24px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #eef2f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: "0.88rem", color: "#111827" }}>Source Registry ({sources.length})</strong>
          <span style={{ fontSize: "0.76rem", color: "#6b7280" }}>
            Hanya sumber berstatus <strong>VERIFIED</strong> yang dapat diretrieve oleh Agent Runtime.
          </span>
        </div>
        <div className="gov-table-wrap">
          <table className="gov-ag-table">
            <thead>
              <tr>
                <th>Source Key</th>
                <th>Nama Sumber</th>
                <th>Tipe</th>
                <th>Klasifikasi</th>
                <th>Versi</th>
                <th>Status Verifikasi</th>
                <th>Sitasi</th>
                <th style={{ textAlign: "right", paddingRight: "20px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => (
                <tr key={src.source_version_id}>
                  <td><code>{src.source_key}</code></td>
                  <td><strong>{src.name}</strong></td>
                  <td><span className="gov-ag-scope">{src.source_type}</span></td>
                  <td><span className={`gov-ag-risk-pill ${src.classification.toLowerCase()}`}>{src.classification}</span></td>
                  <td><span className="gov-ag-version">{src.version_label}</span></td>
                  <td>
                    <span className={`gov-perm-status-badge ${src.status.toLowerCase()}`}>
                      {src.status}
                    </span>
                  </td>
                  <td>{src.citation_count}</td>
                  <td style={{ textAlign: "right", paddingRight: "20px" }}>
                    {src.status === "VERIFIED" ? (
                      <span style={{ color: "#15803d", fontWeight: 600, fontSize: "0.76rem" }}>✓ Verified</span>
                    ) : (
                      <button
                        className="gov-perm-action-btn"
                        disabled={!canVerifySource(actorRoles)}
                        onClick={() => {
                          setVerifyTarget(src);
                          setVerifyReason("");
                        }}
                        title={!canVerifySource(actorRoles) ? "Hanya DIRECTOR, DIVISION_OWNER, atau IT_LEAD yang berwenang memverifikasi sumber." : undefined}
                        type="button"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sources.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "36px", color: "#6e847a" }}>
                    Belum ada sumber pengetahuan terdaftar pada workspace ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Citations Search & Retrieval */}
      <div className="gov-table-card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef2f0" }}>
          <strong style={{ fontSize: "0.88rem", color: "#111827", display: "block" }}>
            Pencarian Sitasi &amp; Evidence Retrieval
          </strong>
          <p style={{ fontSize: "0.76rem", color: "#6b7280", margin: "4px 0 12px 0" }}>
            Uji query untuk melihat bukti sitasi faktual yang dapat diakses oleh tools runtime.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              className="gov-ag-search-input"
              onChange={(e) => setEvidenceQuery(e.target.value)}
              placeholder="Masukkan kata kunci pencarian sitasi (mis: regulasi, SOP, kualifikasi)..."
              style={{ flex: 1, padding: "8px 14px", border: "1px solid #cfdad3", borderRadius: "6px" }}
              value={evidenceQuery}
            />
            <button
              className="gov-modal-btn-confirm success"
              disabled={searchingEvidence}
              onClick={() => void handleSearchEvidence()}
              type="button"
            >
              {searchingEvidence ? "Mencari..." : "Cari Evidence"}
            </button>
          </div>
        </div>

        {citations.length > 0 && (
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {citations.map((c) => (
              <div key={c.citation_key} style={{ background: "#f8faf9", border: "1px solid #d8e2dc", borderRadius: "8px", padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                  <span>
                    <strong>{c.source_key}</strong> · <code>{c.version_label}</code> · <span style={{ color: "#0d9488", fontSize: "0.76rem" }}>{c.anchor}</span>
                  </span>
                  {c.locator && (
                    <span style={{ fontSize: "0.74rem", color: "#6b7280" }}>
                      Locator: <code>{c.locator}</code>
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#374151", fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                  &ldquo;{c.excerpt}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Register Source */}
      {showRegisterModal && (
        <div className="gov-modal-backdrop" role="presentation">
          <section aria-labelledby="modal-reg-source" aria-modal="true" className="gov-modal" role="dialog">
            <h3 id="modal-reg-source" style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>Registrasi Sumber Pengetahuan Baru</h3>
            <div className="gov-modal-field">
              <label htmlFor="src-key-input">Source Key (Unique, CAPITAL):</label>
              <input
                id="src-key-input"
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                placeholder="CONTOH: SOP_AUDIT_FINANSIAL"
                value={newKey}
              />
            </div>
            <div className="gov-modal-field">
              <label htmlFor="src-name-input">Nama Sumber:</label>
              <input
                id="src-name-input"
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Pedoman SOP Audit Finansial 2026"
                value={newName}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div className="gov-modal-field">
                <label htmlFor="src-type-select">Tipe Sumber:</label>
                <select id="src-type-select" onChange={(e) => setNewType(e.target.value as SourceType)} value={newType}>
                  <option value="DOCX">DOCX</option>
                  <option value="PDF">PDF</option>
                  <option value="TEXT">TEXT</option>
                  <option value="URL">URL</option>
                </select>
              </div>
              <div className="gov-modal-field">
                <label htmlFor="src-class-select">Klasifikasi:</label>
                <select id="src-class-select" onChange={(e) => setNewClassification(e.target.value as SourceClassification)} value={newClassification}>
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="INTERNAL">INTERNAL</option>
                </select>
              </div>
              <div className="gov-modal-field">
                <label htmlFor="src-ver-input">Label Versi:</label>
                <input id="src-ver-input" onChange={(e) => setNewVersion(e.target.value)} value={newVersion} />
              </div>
            </div>
            <div className="gov-modal-field">
              <label htmlFor="src-locator-input">Locator / URL Dokumen (Opsional):</label>
              <input
                id="src-locator-input"
                onChange={(e) => setNewLocator(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                value={newLocator}
              />
            </div>
            <div className="gov-modal-field">
              <label htmlFor="src-content-input">Konten Teks Sumber:</label>
              <textarea
                id="src-content-input"
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Masukkan teks lengkap materi pedoman / kebijakan..."
                rows={5}
                value={newContent}
              />
            </div>
            <div className="gov-modal-actions">
              <button className="gov-modal-btn-cancel" disabled={submittingRegister} onClick={() => setShowRegisterModal(false)} type="button">
                Batal
              </button>
              <button className="gov-modal-btn-confirm success" disabled={submittingRegister} onClick={() => void handleRegisterSource()} type="button">
                {submittingRegister ? "Mendaftarkan..." : "Simpan & Daftarkan"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Modal: Verify Source */}
      {verifyTarget && (
        <div className="gov-modal-backdrop" role="presentation">
          <section aria-labelledby="modal-verify-source" aria-modal="true" className="gov-modal" role="dialog">
            <h3 id="modal-verify-source" style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>
              Verifikasi Manusia: {verifyTarget.name}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#546e63", marginBottom: "16px" }}>
              Sebagai pejabat berwenang (DIRECTOR, DIVISION_OWNER, atau IT_LEAD), berikan alasan verifikasi kelayakan konten sumber ini untuk dijadikan rujukan operasional AI.
            </p>
            <div className="gov-modal-field">
              <label htmlFor="verify-reason-input">Alasan / Catatan Verifikasi:</label>
              <textarea
                id="verify-reason-input"
                onChange={(e) => setVerifyReason(e.target.value)}
                placeholder="Contoh: Dokumen telah direview dan sesuai dengan regulasi kepatuhan operasional internal..."
                rows={3}
                value={verifyReason}
              />
            </div>
            <div className="gov-modal-actions">
              <button className="gov-modal-btn-cancel" disabled={submittingVerify} onClick={() => setVerifyTarget(null)} type="button">
                Batal
              </button>
              <button className="gov-modal-btn-confirm success" disabled={submittingVerify || !verifyReason.trim()} onClick={() => void handleConfirmVerify()} type="button">
                {submittingVerify ? "Memverifikasi..." : "Konfirmasi Verifikasi"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Modal: Configure Source Vault */}
      {showVaultModal && (
        <div className="gov-modal-backdrop" role="presentation">
          <section aria-labelledby="modal-cfg-vault" aria-modal="true" className="gov-modal" role="dialog">
            <h3 id="modal-cfg-vault" style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>
              Konfigurasi Source Vault Boundary
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#546e63", marginBottom: "16px" }}>
              Khusus IT_LEAD: Tentukan boundary folder Google Drive yang diizinkan (Allowed Root) dan folder terlarang (Excluded Folder) untuk isolasi data.
            </p>
            <div className="gov-modal-field">
              <label htmlFor="vault-allowed-input">Allowed Root Drive URL:</label>
              <input
                id="vault-allowed-input"
                onChange={(e) => setVaultAllowedUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j"
                value={vaultAllowedUrl}
              />
            </div>
            <div className="gov-modal-field">
              <label htmlFor="vault-excluded-input">Excluded Folder Drive URL:</label>
              <input
                id="vault-excluded-input"
                onChange={(e) => setVaultExcludedUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/9Z8y7X6w5V4u3T2s1R0q"
                value={vaultExcludedUrl}
              />
            </div>
            <div className="gov-modal-field">
              <label htmlFor="vault-reason-input">Alasan Konfigurasi (Wajib, min 10 karakter):</label>
              <textarea
                id="vault-reason-input"
                onChange={(e) => setVaultReason(e.target.value)}
                placeholder="Alasan perubahan kebijakan boundary Source Vault..."
                rows={3}
                value={vaultReason}
              />
            </div>
            <div className="gov-modal-actions">
              <button className="gov-modal-btn-cancel" disabled={submittingVault} onClick={() => setShowVaultModal(false)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm success"
                disabled={submittingVault || !isVaultValid}
                onClick={() => void handleSaveVaultPolicy()}
                title={!isVaultValid ? "Pastikan kedua URL valid Google Drive folders, folder berbeda, dan alasan minimal 10 karakter." : undefined}
                type="button"
              >
                {submittingVault ? "Menyimpan..." : "Simpan Boundary Policy"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}


