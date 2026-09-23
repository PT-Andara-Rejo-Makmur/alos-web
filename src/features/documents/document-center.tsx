"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiError, apiMessage, authenticatedApiRequest } from "@/lib/api";

import {
  canApproveDocument,
  canCheckDocument,
  formatDocumentDate,
  isChecklistComplete,
  type DocumentDetail,
  type DocumentRecord,
  type DocumentWorkspace,
} from "@/features/documents/policy";
import {
  canGenesisReadDocument,
  type GenesisDocumentAnalysisResult,
} from "@/features/genesis-workspace/document-analysis";
import {
  followUpMessages,
  genesisFollowUpFailureTitle,
  genesisFollowUpLoadingText,
  isGenesisFollowUpFailure,
  optimisticDirectorMessage,
  rollbackOptimisticMessage,
  settleFollowUpMessages,
  type GenesisFollowUpFailure,
  type GenesisFollowUpResponse,
  type GenesisHistoryMessage,
} from "@/features/genesis-workspace/follow-up";
import {
  supportsGenesisUpload,
  type GenesisUploadRecord,
} from "@/features/genesis-workspace/uploads";
import type { SessionActor } from "@/features/session";
import type { ActiveWorkspaceContext } from "@/features/workspace-routing";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell";

type DocumentCenterProps = {
  actor: SessionActor;
  mode: "documents" | "genesis";
  activeWorkspace?: ActiveWorkspaceContext | WorkspaceShellIdentity;
};

type GenesisHistoryConversation = GenesisDocumentAnalysisResult["conversation"];

type GenesisHistoryArtifact = {
  artifact_id: string;
  artifact_type: string;
  digest: string;
  content: Record<string, unknown>;
};

const emptyWorkspace: DocumentWorkspace[] = [];

export function DocumentCenter({ actor, mode, activeWorkspace }: DocumentCenterProps) {
  const [workspaces, setWorkspaces] = useState<DocumentWorkspace[]>(emptyWorkspace);
  const [workspaceId, setWorkspaceId] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selected, setSelected] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [analysisSourceId, setAnalysisSourceId] = useState("");
  const [analysisResult, setAnalysisResult] = useState<GenesisDocumentAnalysisResult | null>(null);
  const [conversationMessages, setConversationMessages] = useState<GenesisHistoryMessage[]>([]);
  const [directorReply, setDirectorReply] = useState("");
  const [sendingDirectorReply, setSendingDirectorReply] = useState(false);
  const [followUpFailure, setFollowUpFailure] = useState<GenesisFollowUpFailure | null>(null);
  const [checkNotes, setCheckNotes] = useState("Evidence dan scope telah diperiksa oleh checker independen.");
  const [reviewNotes, setReviewNotes] = useState("Review independen telah selesai.");
  const [submitting, setSubmitting] = useState(false);
  const [uploads, setUploads] = useState<GenesisUploadRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [restoringConversationId, setRestoringConversationId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [documentQuery, setDocumentQuery] = useState("");
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const directorReplyInFlightRef = useRef(false);

  const visibleDocuments = useMemo(
    () => mode === "genesis" ? documents.filter((document) => document.origin === "GENESIS") : documents,
    [documents, mode],
  );
  const filteredDocuments = useMemo(() => {
    const query = documentQuery.trim().toLocaleLowerCase("id-ID");
    if (!query) return visibleDocuments;
    return visibleDocuments.filter((document) => (
      document.title.toLocaleLowerCase("id-ID").includes(query)
      || document.category.toLocaleLowerCase("id-ID").includes(query)
      || document.origin.toLocaleLowerCase("id-ID").includes(query)
    ));
  }, [documentQuery, visibleDocuments]);
  const documentStats = useMemo(() => ({
    approved: documents.filter((document) => document.status === "APPROVED" || document.status === "ACTIVE").length,
    genesis: documents.filter((document) => document.origin === "GENESIS").length,
    review: documents.filter((document) => document.status === "IN_REVIEW").length,
    total: documents.length,
  }), [documents]);
  const pendingChecks = selected?.checklist.filter((item) => item.required && item.status !== "PASSED").length ?? 0;
  const canUploadToGenesis = actor.roles.includes("EXECUTIVE");
  const analysisSources = useMemo(
    () => documents.filter(canGenesisReadDocument),
    [documents],
  );
  const recentAnalyses = useMemo(
    () => documents
      .filter((document) => document.origin === "GENESIS" && document.category === "GENESIS_ANALYSIS" && document.genesis_conversation_id)
      .sort((left, right) => right.updated_at.localeCompare(left.updated_at)),
    [documents],
  );
  const displayedFollowUps = useMemo(
    () => analysisResult
      ? followUpMessages(conversationMessages, analysisResult.analysis.content.prompt)
      : [],
    [analysisResult, conversationMessages],
  );

  const refreshDocuments = useCallback(async (nextWorkspaceId: string) => {
    setError(null);
    try {
      const items = await authenticatedApiRequest<DocumentRecord[]>(`/api/v1/documents?workspace_id=${encodeURIComponent(nextWorkspaceId)}`);
      setDocuments(items);
      if (mode === "genesis") {
        setAnalysisSourceId((current) => (
          items.some((document) => document.document_id === current && canGenesisReadDocument(document))
            ? current
            : items.find(canGenesisReadDocument)?.document_id ?? ""
        ));
      }
      setSelected((current) => (
        current && !items.some((item) => item.document_id === current.document.document_id)
          ? null
          : current
      ));
    } catch (failure) {
      setError(messageFrom(failure));
    }
  }, [mode]);

  const refreshGenesisUploads = useCallback(async (nextWorkspaceId: string) => {
    if (!nextWorkspaceId) {
      setUploads([]);
      return;
    }
    try {
      setUploads(await authenticatedApiRequest<GenesisUploadRecord[]>(`/api/v1/genesis/uploads?workspace_id=${encodeURIComponent(nextWorkspaceId)}`));
    } catch (failure) {
      setError(messageFrom(failure));
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        const items = await authenticatedApiRequest<DocumentWorkspace[]>("/api/v1/workspaces");
        setWorkspaces(items);
        const initialWorkspaceId = activeWorkspace?.workspaceId
          ? items.find((w) => w.workspace_id === activeWorkspace.workspaceId)?.workspace_id ?? activeWorkspace.workspaceId
          : (items[0]?.workspace_id ?? "");
        setWorkspaceId(initialWorkspaceId);
        if (initialWorkspaceId) {
          const documentItems = await authenticatedApiRequest<DocumentRecord[]>(`/api/v1/documents?workspace_id=${encodeURIComponent(initialWorkspaceId)}`);
          setDocuments(documentItems);
          if (mode === "genesis") {
            setAnalysisSourceId(documentItems.find(canGenesisReadDocument)?.document_id ?? "");
          }
          if (mode === "genesis" && canUploadToGenesis) {
            setUploads(await authenticatedApiRequest<GenesisUploadRecord[]>(`/api/v1/genesis/uploads?workspace_id=${encodeURIComponent(initialWorkspaceId)}`));
          }
        }
      } catch (failure) {
        setError(messageFrom(failure));
      } finally {
        setLoading(false);
      }
    }
    void initialize();
  }, [activeWorkspace?.workspaceId, canUploadToGenesis, mode]);

  function selectWorkspace(nextWorkspaceId: string) {
    setWorkspaceId(nextWorkspaceId);
    void refreshDocuments(nextWorkspaceId);
    setAnalysisSourceId("");
    setAnalysisResult(null);
    setConversationMessages([]);
    setDirectorReply("");
    setFollowUpFailure(null);
    if (mode === "genesis" && canUploadToGenesis) {
      void refreshGenesisUploads(nextWorkspaceId);
      return;
    }
    setUploads([]);
  }

  async function selectDocument(documentId: string) {
    setError(null);
    try {
      setSelected(await authenticatedApiRequest<DocumentDetail>(`/api/v1/documents/${documentId}`));
    } catch (failure) {
      setError(messageFrom(failure));
    }
  }

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspaceId) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    const payload = { workspace_id: workspaceId, title, content, category: "GENERAL", classification: "INTERNAL" };
    try {
      const document = await authenticatedApiRequest<DocumentRecord>("/api/v1/documents/drafts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTitle("");
      setContent("");
      setComposerOpen(false);
      setNotice("Dokumen DRAFT dibuat di repositori resmi.");
      await refreshDocuments(workspaceId);
      await selectDocument(document.document_id);
    } catch (failure) {
      setError(messageFrom(failure));
    } finally {
      setSubmitting(false);
    }
  }

  async function createDocumentAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspaceId || !analysisSourceId) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const result = await authenticatedApiRequest<GenesisDocumentAnalysisResult>("/api/v1/genesis/document-analysis", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          source_document_id: analysisSourceId,
          prompt: analysisPrompt,
        }),
      });
      setAnalysisResult(result);
      setConversationMessages([]);
      setDirectorReply("");
      setFollowUpFailure(null);
      setSelected(null);
      setAnalysisPrompt("");
      setNotice("Genesis menyimpan analisis dan rekomendasi terikat ke versi sumber. Konfirmasi Direktur dicatat melalui percakapan.");
      await refreshDocuments(workspaceId);
    } catch (failure) {
      setError(messageFrom(failure));
    } finally {
      setSubmitting(false);
    }
  }

  async function restoreAnalysis(document: DocumentRecord) {
    if (!document.genesis_conversation_id) return;
    setRestoringConversationId(document.genesis_conversation_id);
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const base = `/api/v1/genesis/conversations/${encodeURIComponent(document.genesis_conversation_id)}`;
      const [conversation, messages, artifacts] = await Promise.all([
        authenticatedApiRequest<GenesisHistoryConversation>(base),
        authenticatedApiRequest<GenesisHistoryMessage[]>(`${base}/messages`),
        authenticatedApiRequest<GenesisHistoryArtifact[]>(`${base}/artifacts`),
      ]);
      const restored = restoreGenesisAnalysis(
        document,
        conversation,
        messages,
        artifacts,
      );
      if (!restored) throw new Error("Riwayat analisis ini belum memiliki artefak yang dapat ditampilkan.");
      setAnalysisResult(restored);
      setConversationMessages(messages);
      setDirectorReply("");
      setFollowUpFailure(null);
      setSelected(null);
      setNotice("Percakapan Genesis dipulihkan dari riwayat tersimpan.");
    } catch (failure) {
      setError(messageFrom(failure));
    } finally {
      setRestoringConversationId(null);
      setSubmitting(false);
    }
  }

  async function recordDirectorReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = directorReply.trim();
    if (!analysisResult || message.length < 3 || directorReplyInFlightRef.current) return;
    directorReplyInFlightRef.current = true;
    setSendingDirectorReply(true);
    setError(null);
    setNotice(null);
    setFollowUpFailure(null);
    const correlationId = crypto.randomUUID();
    const optimistic = optimisticDirectorMessage(
      analysisResult.conversation.conversation_id,
      correlationId,
      message,
    );
    setConversationMessages((current) => [...current, optimistic]);
    setDirectorReply("");
    try {
      const result = await authenticatedApiRequest<GenesisFollowUpResponse>(
        `/api/v1/genesis/conversations/${encodeURIComponent(analysisResult.conversation.conversation_id)}/follow-ups`,
        {
          method: "POST",
          body: JSON.stringify({ correlation_id: correlationId, content: message }),
        },
      );
      setConversationMessages((current) => (
        settleFollowUpMessages(current, correlationId, result)
      ));
      setNotice("Genesis telah menjawab tanpa mengubah dokumen sumber atau status workflow.");
    } catch (failure) {
      setConversationMessages((current) => rollbackOptimisticMessage(current, correlationId));
      setDirectorReply(message);
      if (failure instanceof ApiError && isGenesisFollowUpFailure(failure.payload)) {
        setFollowUpFailure(failure.payload);
        return;
      }
      setError(messageFrom(failure));
    } finally {
      directorReplyInFlightRef.current = false;
      setSendingDirectorReply(false);
    }
  }

  function submitComposerOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  function openUploadPicker() {
    uploadInputRef.current?.click();
  }

  async function uploadGenesisFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || !workspaceId) return;
    if (!supportsGenesisUpload(file.name)) {
      setError("Format belum didukung. Gunakan PDF, DOCX, XLS/XLSX, CSV, JSON, MD, atau TXT.");
      return;
    }
    setUploading(true);
    setError(null);
    setNotice(null);
    const payload = new FormData();
    payload.set("workspace_id", workspaceId);
    payload.set("file", file);
    try {
      const uploaded = await authenticatedApiRequest<GenesisUploadRecord>("/api/v1/genesis/uploads", {
        method: "POST",
        body: payload,
      });
      setUploads((current) => [uploaded, ...current.filter((item) => item.genesis_upload_id !== uploaded.genesis_upload_id)]);
      setNotice(
        uploaded.extraction_complete
          ? "Dokumen diterima oleh sumber pengetahuan Internal ALOS."
          : "Dokumen diterima, tetapi ekstraksi teksnya belum lengkap.",
      );
    } catch (failure) {
      setError(messageFrom(failure));
    } finally {
      setUploading(false);
    }
  }

  async function completeCheck(checkKey: string) {
    if (!selected) return;
    await perform(`/api/v1/documents/${selected.document.document_id}/checklist/${checkKey}/complete`, {
      notes: checkNotes,
    }, "Checklist diperbarui oleh checker independen.");
  }

  async function submitForReview() {
    if (!selected) return;
    await perform(`/api/v1/documents/${selected.document.document_id}/submit-review`, undefined, "Dokumen dikirim untuk review.");
  }

  async function decide(approved: boolean) {
    if (!selected) return;
    await perform(
      `/api/v1/documents/${selected.document.document_id}/${approved ? "approve" : "reject"}`,
      { notes: reviewNotes },
      approved ? "Dokumen disetujui. Aktivasi/publikasi tetap tahap terpisah." : "Dokumen dikembalikan sebagai REJECTED.",
    );
  }

  async function perform(endpoint: string, body: object | undefined, success: string) {
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const detail = await authenticatedApiRequest<DocumentDetail>(endpoint, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      setSelected(detail);
      setNotice(success);
      await refreshDocuments(workspaceId);
    } catch (failure) {
      setError(messageFrom(failure));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <section className="alos-content"><p>Memuat Document Center…</p></section>;

  if (mode === "documents") {
    return (
      <section className="alos-content alos-document-library" aria-label="Document Center">
        <header className="alos-workspace-heading">
          <div><p className="alos-kicker">ALOS / DOCUMENT CENTER</p><h2>Documents</h2><p>Kelola, temukan, dan tindak lanjuti dokumen perusahaan dari satu repositori resmi.</p></div>
          <div className="alos-workspace-actions"><select aria-label="Workspace dokumen" onChange={(event) => selectWorkspace(event.target.value)} value={workspaceId}>{workspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.name}</option>)}</select><button className="alos-workspace-primary" onClick={() => setComposerOpen((open) => !open)} type="button">{composerOpen ? "Tutup form" : "+ Buat dokumen"}</button></div>
        </header>

        {error ? <p className="alos-inline-error">{error}</p> : null}
        {notice ? <p className="alos-inline-success">{notice}</p> : null}

        {composerOpen ? <article className="alos-panel alos-document-compose-panel"><div className="alos-panel-heading-row"><div><p className="alos-kicker">DOKUMEN BARU</p><h3>Buat DRAFT resmi</h3></div><span>Belum dipublikasikan</span></div>{!workspaceId ? <p className="alos-empty-copy">Akun ini belum memiliki workspace aktif untuk membuat dokumen.</p> : <form className="alos-document-form" onSubmit={createDraft}><label>Judul dokumen<input maxLength={200} minLength={3} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: SOP Brief Operasional" required value={title} /></label><label className="alos-document-full">Isi draft<textarea maxLength={50000} minLength={1} onChange={(event) => setContent(event.target.value)} placeholder="Masukkan isi awal dokumen…" required value={content} /></label><p className="alos-document-full alos-document-note">DRAFT disimpan pada repositori resmi dan tetap memerlukan checklist serta review independen.</p><button disabled={submitting} type="submit">{submitting ? "Menyimpan…" : "Simpan DRAFT"}</button></form>}</article> : null}

        <div className="alos-document-metrics" aria-label="Ringkasan dokumen">
          <DocumentMetric label="Total dokumen" value={documentStats.total} tone="success" />
          <DocumentMetric label="Butuh review" value={documentStats.review} tone="warning" />
          <DocumentMetric label="Draft dari Genesis" value={documentStats.genesis} tone="info" />
          <DocumentMetric label="Disetujui" value={documentStats.approved} tone="danger" />
        </div>

        <div className="alos-document-overview">
          <article className="alos-panel alos-document-distribution"><div className="alos-panel-heading-row"><div><p className="alos-kicker">DISTRIBUSI</p><h3>Kategori dokumen</h3></div><button className="alos-text-button" onClick={() => void refreshDocuments(workspaceId)} type="button">Muat ulang</button></div><DocumentDistribution documents={documents} /></article>
          <article className="alos-panel alos-document-summary"><p className="alos-kicker">RINGKASAN DOKUMEN</p><h3>Repositori kanonis</h3><dl><div><dt>Workspace aktif</dt><dd>{workspaces.find((workspace) => workspace.workspace_id === workspaceId)?.name ?? "—"}</dd></div><div><dt>Dokumen manual</dt><dd>{documents.filter((document) => document.origin === "MANUAL").length || "—"}</dd></div><div><dt>Versi aktif</dt><dd>{documentStats.approved || "—"}</dd></div><div><dt>Status sumber</dt><dd>Governed</dd></div></dl></article>
          <article className="alos-panel alos-document-important"><div className="alos-panel-heading-row"><div><p className="alos-kicker">DOKUMEN PENTING</p><h3>Terakhir diperbarui</h3></div></div><DocumentHighlights documents={documents} onSelect={selectDocument} /></article>
        </div>

        <article className="alos-panel alos-document-table-panel"><div className="alos-panel-heading-row"><div><p className="alos-kicker">DAFTAR DOKUMEN</p><h3>Repositori dokumen</h3></div><label className="alos-document-search"><span>⌕</span><input aria-label="Cari dokumen" onChange={(event) => setDocumentQuery(event.target.value)} placeholder="Cari dokumen…" value={documentQuery} /></label></div><DocumentTable documents={filteredDocuments} onSelect={selectDocument} selectedId={selected?.document.document_id ?? null} /></article>

        {selected ? <section className="alos-document-detail-drawer" aria-label={`Rincian ${selected.document.title}`}><DocumentDetailPanel actor={actor} detail={selected} pendingChecks={pendingChecks} checkNotes={checkNotes} reviewNotes={reviewNotes} submitting={submitting} onCheckNotes={setCheckNotes} onReviewNotes={setReviewNotes} onCompleteCheck={completeCheck} onSubmit={submitForReview} onDecide={decide} /></section> : null}
      </section>
    );
  }

  return (
    <section className="alos-content alos-genesis-workspace" aria-label="GENESIS">
      <header className="alos-genesis-workspace-heading"><span className="alos-genesis-workspace-star"><GenesisIcon name="sparkles" /></span><div><h2>GENESIS</h2><p>Your AI Executive Assistant</p></div></header>
      <input accept=".pdf,.docx,.xlsx,.xls,.csv,.json,.md,.txt" className="sr-only" onChange={uploadGenesisFile} ref={uploadInputRef} tabIndex={-1} type="file" />
      {error ? <p className="alos-inline-error">{error}</p> : null}
      {notice ? <p className="alos-inline-success">{notice}</p> : null}
      {followUpFailure ? <GenesisFollowUpFeedback failure={followUpFailure} sending={false} /> : null}

      <div className="alos-genesis-workspace-grid">
        <article className="alos-panel alos-genesis-conversation">
          <div className="alos-genesis-chat-stream">
            {analysisResult ? <>
              <div className="alos-genesis-user-message">
                <span>{actor.roles.includes("EXECUTIVE") ? "D" : actor.roles[0]?.slice(0, 1) ?? "A"}</span>
                <div>
                  <div className="alos-genesis-message-meta"><strong>Direktur Utama</strong><small>Baru saja</small></div>
                  <p>{analysisResult.analysis.content.prompt}</p>
                  <span className="alos-genesis-source-chip"><i aria-hidden="true"><GenesisIcon name="document" /></i>{analysisResult.source.title}<small>v{analysisResult.source.version_number} · {analysisResult.source.status}</small></span>
                </div>
              </div>
              <div className="alos-genesis-assistant-message">
                <span aria-label="Genesis"><GenesisIcon name="sparkles" /></span>
                <div>
                  <div className="alos-genesis-message-meta alos-genesis-assistant-meta"><strong>GENESIS</strong><small>Analisis terikat ke sumber · DRAFT</small><em>Read-only</em></div>
                  {analysisResult.semantic ? <GenesisMarkdown content={analysisResult.semantic.answer} /> : <div className="alos-genesis-fallback-answer"><strong>Dokumen berhasil diikat</strong><p>Analisis semantik belum aktif pada environment ini. Genesis telah membuat DRAFT pemeriksaan yang dapat ditinjau manusia.</p></div>}
                  <details className="alos-genesis-analysis-context">
                    <summary>Detail sumber &amp; audit analisis</summary>
                    <dl><div><dt>Sumber</dt><dd>{analysisResult.source.title}</dd></div><div><dt>Versi</dt><dd>v{analysisResult.source.version_number} · {analysisResult.source.status}</dd></div><div><dt>Isi diperiksa</dt><dd>{analysisResult.analysis.content.reading.content_characters.toLocaleString("id-ID")} karakter</dd></div><div><dt>Model</dt><dd>{analysisResult.semantic ? `${analysisResult.semantic.provider} / ${analysisResult.semantic.model}` : "Belum dijalankan"}</dd></div></dl>
                  </details>
                  <div className="alos-genesis-attention"><div><strong>Rekomendasi untuk arahan Direktur</strong><span>Daftar perbaikan di atas bukan tugas yang dapat ditandai selesai. Konfirmasi, tolak, atau beri prioritas melalui percakapan di bawah.</span></div></div>
                </div>
              </div>
              {displayedFollowUps.map((message) => <GenesisFollowUpMessage actorInitial={actor.roles.includes("EXECUTIVE") ? "D" : actor.roles[0]?.slice(0, 1) ?? "A"} key={message.message_id} message={message} />)}
              {sendingDirectorReply ? <GenesisFollowUpFeedback failure={null} sending /> : null}
            </> : <GenesisEmptyWelcome onSelectPrompt={setAnalysisPrompt} />}
          </div>
          {!workspaceId ? <p className="alos-empty-copy">Akun ini belum memiliki workspace aktif untuk membuat analisis.</p> : analysisResult ? <form className="alos-genesis-draft-form alos-genesis-chat-composer" onSubmit={recordDirectorReply}>
            <label className="alos-genesis-prompt-field"><span className="sr-only">Pesan untuk Genesis</span><textarea aria-label="Pesan untuk Genesis" disabled={sendingDirectorReply} maxLength={10000} minLength={3} onChange={(event) => setDirectorReply(event.target.value)} onKeyDown={submitComposerOnEnter} placeholder="Kirim pesan ke GENESIS…" required value={directorReply} /></label>
            <div className="alos-genesis-composer-actions">
              <div className="alos-genesis-composer-left">
                <GenesisAttachButton disabled={!workspaceId || !canUploadToGenesis || uploading} onClick={openUploadPicker} uploading={uploading} />
                <GenesisKnowledgeSource />
              </div>
              <small>Enter untuk mengirim · Shift+Enter untuk baris baru</small>
              <button aria-label="Kirim pesan ke Genesis" className="alos-genesis-send-button" disabled={sendingDirectorReply || directorReply.trim().length < 3} type="submit">{sendingDirectorReply ? "…" : <SendIcon />}</button>
            </div>
          </form> : <form className="alos-genesis-draft-form alos-genesis-analysis-form alos-genesis-empty-composer" onSubmit={createDocumentAnalysis}>
            <label className="alos-genesis-prompt-field"><span className="sr-only">Pertanyaan untuk Genesis</span><textarea aria-label="Pertanyaan untuk Genesis" maxLength={10000} minLength={20} onChange={(event) => setAnalysisPrompt(event.target.value)} onKeyDown={submitComposerOnEnter} placeholder="Ketik pertanyaan atau kebutuhan Anda untuk GENESIS…" required value={analysisPrompt} /></label>
            <div className="alos-genesis-composer-actions">
              <div className="alos-genesis-composer-left">
                <GenesisAttachButton disabled={!workspaceId || !canUploadToGenesis || uploading} onClick={openUploadPicker} uploading={uploading} />
                <GenesisKnowledgeSource />
              </div>
              <small>{!canUploadToGenesis ? "Analisis hanya tersedia untuk Direktur." : analysisSources.length === 0 ? "Belum ada sumber internal yang siap dibaca." : "Enter untuk mengirim · Shift+Enter untuk baris baru"}</small>
              <button aria-label="Kirim pesan ke Genesis" className="alos-genesis-send-button" disabled={submitting || !analysisSourceId || !canUploadToGenesis} type="submit">{submitting ? "…" : <SendIcon />}</button>
            </div>
          </form>}
          <p className="alos-genesis-disclaimer">GENESIS dapat membuat kesalahan. Verifikasi informasi penting sebelum membuat keputusan.</p>
        </article>

        <aside className="alos-genesis-workspace-side">
          <article className="alos-panel alos-genesis-recent"><div className="alos-panel-heading-row"><div><h3><GenesisIcon name="message" />Percakapan Terbaru</h3></div><span>{recentAnalyses.length ? `${recentAnalyses.length} tersimpan` : "Lihat Semua →"}</span></div>{recentAnalyses.length ? <ol className="alos-genesis-recent-list">{recentAnalyses.slice(0, 5).map((document) => <li key={document.document_id}><button className={analysisResult?.draft.document_id === document.document_id ? "selected" : ""} disabled={restoringConversationId === document.genesis_conversation_id} onClick={() => void restoreAnalysis(document)} type="button"><span aria-hidden="true"><GenesisIcon name="sparkles" /></span><div><strong>{document.title.replace(/^Analisis Genesis —\s*/i, "")}</strong><small>Analisis DRAFT · {formatDocumentDate(document.updated_at)}</small></div><em>{restoringConversationId === document.genesis_conversation_id ? "…" : <GenesisIcon name="chevron" />}</em></button></li>)}</ol> : <div className="alos-genesis-sidebar-empty"><span aria-hidden="true"><GenesisIcon name="message" /></span><strong>Belum ada percakapan tersimpan</strong><p>Histori percakapan Anda akan muncul di sini setelah Anda mulai menggunakan GENESIS.</p></div>}</article>
          <article className="alos-panel alos-genesis-agents"><div className="alos-panel-heading-row"><div><h3><GenesisIcon name="bot" />Agen Aktif</h3></div><Link href="/genesis?view=agents">Kelola Agen →</Link></div><div className="alos-genesis-agent-empty"><span><GenesisIcon name="bot" /></span><div><strong>Belum ada agent ACTIVE</strong><small>Agent hanya muncul setelah melewati release dan approval.</small></div></div></article>
          <article className="alos-panel alos-genesis-executive-focus"><div className="alos-genesis-focus-heading"><span aria-hidden="true"><GenesisIcon name="bolt" /></span><div><h3>Fokus Eksekutif</h3><p>Prioritas hari ini</p></div></div><div className="alos-genesis-focus-list"><div><span className="document" aria-hidden="true"><GenesisIcon name="document" /></span><strong>{analysisSources.length}</strong><p>Dokumen siap dianalisis</p><b><GenesisIcon name="chevron" /></b></div><div><span className="approval" aria-hidden="true"><GenesisIcon name="check" /></span><strong>{documentStats.review}</strong><p>DRAFT menunggu review</p><b><GenesisIcon name="chevron" /></b></div><div><span className="risk" aria-hidden="true"><GenesisIcon name="alert" /></span><strong>{uploads.filter((upload) => upload.status === "SOURCE_RECEIVED").length}</strong><p>Sumber menunggu tinjauan</p><b><GenesisIcon name="chevron" /></b></div><button onClick={() => setAnalysisPrompt("Buatkan ringkasan eksekutif dari dokumen ini untuk tinjauan minggu ini.")} type="button"><span aria-hidden="true"><GenesisIcon name="chart" /></span><p>Lihat ringkasan minggu ini</p><b><GenesisIcon name="chevron" /></b></button></div></article>
        </aside>
      </div>

      {selected ? <section className="alos-document-detail-drawer" aria-label={`Rincian ${selected.document.title}`}><DocumentDetailPanel actor={actor} detail={selected} pendingChecks={pendingChecks} checkNotes={checkNotes} reviewNotes={reviewNotes} submitting={submitting} onCheckNotes={setCheckNotes} onReviewNotes={setReviewNotes} onCompleteCheck={completeCheck} onSubmit={submitForReview} onDecide={decide} /></section> : null}
    </section>
  );
}

type GenesisEmptyWelcomeProps = {
  onSelectPrompt: (prompt: string) => void;
};

const genesisCapabilities = [
  { icon: "document", title: "Analisis Dokumen", description: "Menganalisis isi dokumen dan mengekstraksi insight penting", prompt: "Analisa kelengkapan dokumen ini dan identifikasi gap utamanya." },
  { icon: "chart", title: "Ringkas Laporan", description: "Merangkum laporan panjang menjadi insight yang jelas", prompt: "Buat ringkasan eksekutif dari dokumen ini dengan poin keputusan utamanya." },
  { icon: "edit", title: "Susun Draft SOP", description: "Membantu menyusun draft dokumen dan SOP", prompt: "Susun rekomendasi struktur SOP berdasarkan dokumen ini untuk ditinjau manusia." },
  { icon: "lightbulb", title: "Riset Strategis", description: "Memberikan analisis dan rekomendasi berbasis data", prompt: "Analisa risiko strategis, KPI, owner, dan evidence yang belum tersedia pada dokumen ini." },
] satisfies Array<{ icon: GenesisIconName; title: string; description: string; prompt: string }>;

export function GenesisEmptyWelcome({ onSelectPrompt }: GenesisEmptyWelcomeProps) {
  return <section className="alos-genesis-empty-welcome" aria-label="Mulai percakapan dengan GENESIS">
    <div className="alos-genesis-welcome-hero">
      <div className="alos-genesis-welcome-copy"><p>AI UNTUK KEPUTUSAN YANG LEBIH BAIK</p><h3>Mulai percakapan dengan GENESIS</h3><span>Ajukan pertanyaan atau minta bantuan untuk menganalisis sumber internal. GENESIS siap membantu Anda dengan insight yang relevan dan terpercaya.</span></div>
      <div className="alos-genesis-welcome-art" aria-hidden="true"><i /><i /><i /><strong><GenesisIcon name="sparkles" /></strong><span>Dari data<br />menuju keputusan<br />yang lebih baik.</span></div>
    </div>
    <div className="alos-genesis-capabilities"><h4>GENESIS dapat membantu Anda:</h4><div>{genesisCapabilities.map((capability) => <button key={capability.title} onClick={() => onSelectPrompt(capability.prompt)} type="button"><span aria-hidden="true"><GenesisIcon name={capability.icon} /></span><div><strong>{capability.title}</strong><small>{capability.description}</small></div></button>)}</div></div>
  </section>;
}

export function GenesisAttachButton({ disabled, onClick, uploading }: { disabled: boolean; onClick: () => void; uploading: boolean }) {
  return <button aria-label={uploading ? "Sedang mengunggah dokumen" : "Unggah dokumen"} className="alos-genesis-attach-button" disabled={disabled} onClick={onClick} title="Unggah dokumen" type="button"><PaperclipIcon /></button>;
}

export function GenesisKnowledgeSource() {
  return <span aria-label="Sumber pengetahuan: Internal ALOS" className="alos-genesis-knowledge-source"><GenesisIcon name="database" /><span>Sumber: <strong>Internal ALOS</strong></span></span>;
}

function PaperclipIcon() {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m8.7 12.8 5.8-5.8a3.2 3.2 0 0 1 4.5 4.5l-7.4 7.4a5 5 0 0 1-7.1-7.1l7.1-7.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" /></svg>;
}

function SendIcon() {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m4 4 16 8-16 8 3-8-3-8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><path d="M7 12h13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>;
}

type GenesisIconName = "alert" | "bolt" | "bot" | "chart" | "check" | "chevron" | "database" | "document" | "edit" | "lightbulb" | "message" | "sparkles";

function GenesisIcon({ name }: { name: GenesisIconName }) {
  const paths: Record<GenesisIconName, ReactNode> = {
    alert: <><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4M12 16.5h.01" /></>,
    bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />,
    bot: <><rect height="10" rx="3" width="16" x="4" y="8" /><path d="M9 12h.01M15 12h.01M9 16h6M12 4v4M10.5 4h3M2 12h2M20 12h2" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20V7" /><path d="M2 20h22" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    document: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
    edit: <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m14 7 3 3" /></>,
    lightbulb: <><path d="M9 18h6M10 22h4" /><path d="M8.2 15.5A7 7 0 1 1 15.8 15.5c-.8.6-.8 1.5-.8 2.5H9c0-1 0-1.9-.8-2.5Z" /></>,
    message: <><path d="M4 4h16v13H9l-5 4V4Z" /><path d="M8 9h8M8 13h5" /></>,
    sparkles: <><path d="M12 2c.7 5.2 2.8 7.3 8 8-5.2.7-7.3 2.8-8 8-.7-5.2-2.8-7.3-8-8 5.2-.7 7.3-2.8 8-8Z" /><path d="M19 17c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" /></>,
  };
  return <svg aria-hidden="true" className="alos-genesis-icon" fill="none" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function GenesisFollowUpMessage({ actorInitial, message }: { actorInitial: string; message: GenesisHistoryMessage }) {
  if (message.actor_kind === "HUMAN") return <div className="alos-genesis-user-message alos-genesis-followup-message">
    <span>{actorInitial}</span>
    <div><div className="alos-genesis-message-meta"><strong>Direktur Utama</strong><small>{formatDocumentDate(message.created_at)}</small></div><p>{message.content}</p></div>
  </div>;
  return <div className="alos-genesis-assistant-message alos-genesis-followup-message">
    <span aria-label="Genesis"><GenesisIcon name="sparkles" /></span><div><div className="alos-genesis-message-meta alos-genesis-assistant-meta"><strong>GENESIS</strong><small>{formatDocumentDate(message.created_at)}</small><em>Read-only</em></div><GenesisMarkdown content={message.content} /></div>
  </div>;
}

export function GenesisFollowUpFeedback({ failure, sending }: { failure: GenesisFollowUpFailure | null; sending: boolean }) {
  if (failure) return <p className={`alos-genesis-follow-up-error ${failure.status.toLowerCase()}`}><strong>{genesisFollowUpFailureTitle(failure.status)}</strong><span>{failure.error.message}</span></p>;
  if (!sending) return null;
  return <div aria-live="polite" className="alos-genesis-assistant-message alos-genesis-followup-loading"><span aria-label="Genesis"><GenesisIcon name="sparkles" /></span><div><div className="alos-genesis-message-meta alos-genesis-assistant-meta"><strong>GENESIS</strong><small>Sedang bekerja</small></div><p><i aria-hidden="true" />{genesisFollowUpLoadingText}</p></div></div>;
}

function GenesisMarkdown({ content }: { content: string }) {
  const lines = normaliseGenesisMarkdown(content).split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = renderGenesisInline(heading[2]);
      blocks.push(level === 1 ? <h3 key={`heading-${index}`}>{text}</h3> : level === 2 ? <h4 key={`heading-${index}`}>{text}</h4> : <h5 key={`heading-${index}`}>{text}</h5>);
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(<aside key={`quote-${index}`}>{renderGenesisInline(quote.join(" "))}</aside>);
      continue;
    }

    const checklist = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (checklist) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim().match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
        if (!candidate) break;
        items.push(candidate[2]);
        index += 1;
      }
      blocks.push(<ul aria-label="Rekomendasi Genesis" className="alos-genesis-markdown-checklist" key={`checklist-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}><i aria-hidden="true">•</i><span>{renderGenesisInline(item)}</span></li>)}</ul>);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(<ul key={`list-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderGenesisInline(item)}</li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={`ordered-list-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderGenesisInline(item)}</li>)}</ol>);
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (!candidate || /^(#{1,3})\s+/.test(candidate) || candidate.startsWith(">") || /^[-*]\s+/.test(candidate) || /^\d+\.\s+/.test(candidate)) break;
      paragraph.push(candidate);
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{renderGenesisInline(paragraph.join(" "))}</p>);
  }

  return <article className="alos-genesis-semantic-answer"><strong>Jawaban DRAFT Genesis</strong><div className="alos-genesis-markdown">{blocks}</div><small>Hanya berdasarkan versi sumber di atas. Periksa sitasi sebelum mengambil keputusan.</small></article>;
}

function normaliseGenesisMarkdown(value: string): string {
  return value
    .replace(/\\([#*_\[\]])/g, "$1")
    .replace(/\r\n/g, "\n")
    .trim();
}

function renderGenesisInline(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[Sumber L\d+(?:-L?\d+)?\])/g);
  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    if (token.startsWith("*") && token.endsWith("*")) return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>;
    if (/^\[Sumber L\d+(?:-L?\d+)?\]$/.test(token)) return <mark className="alos-genesis-citation" key={`${token}-${index}`}>{token}</mark>;
    return <span key={`${token}-${index}`}>{token}</span>;
  });
}

function restoreGenesisAnalysis(
  document: DocumentRecord,
  conversation: GenesisHistoryConversation,
  messages: GenesisHistoryMessage[],
  artifacts: GenesisHistoryArtifact[],
): GenesisDocumentAnalysisResult | null {
  const analysis = [...artifacts].reverse().find((artifact) => artifact.artifact_type === "ANALYSIS");
  if (!analysis) return null;
  const source = objectValue(analysis.content.source);
  const reading = objectValue(analysis.content.reading);
  const prompt = messages.find((message) => message.actor_kind === "HUMAN")?.content
    ?? stringValue(analysis.content.prompt);
  if (!source || !reading || !prompt) return null;

  const sourceDocumentId = stringValue(source.document_id);
  const sourceTitle = stringValue(source.title);
  const sourceVersion = numberValue(source.version_number);
  const sourceHash = stringValue(source.content_sha256);
  const sourceStatus = stringValue(source.status);
  const sourceClassification = stringValue(source.classification);
  if (!sourceDocumentId || !sourceTitle || !sourceVersion || !sourceHash || !sourceStatus || !sourceClassification) return null;

  const modelExecution = objectValue(analysis.content.model_execution);
  const answer = stringValue(analysis.content.answer);
  const semantic = answer && modelExecution ? {
    analysis_run_id: stringValue(modelExecution.analysis_run_id) ?? analysis.artifact_id,
    provider: providerValue(modelExecution.provider),
    model: stringValue(modelExecution.model) ?? "Model Gateway",
    answer,
    input_tokens: numberValue(modelExecution.input_tokens) ?? 0,
    output_tokens: numberValue(modelExecution.output_tokens) ?? 0,
    latency_milliseconds: numberValue(modelExecution.latency_milliseconds) ?? 0,
    estimated_cost_usd: String(modelExecution.estimated_cost_usd ?? "0"),
    source_characters: numberValue(reading.content_characters) ?? 0,
  } : null;

  return {
    conversation,
    source: {
      document_id: sourceDocumentId,
      title: sourceTitle,
      version_number: sourceVersion,
      content_sha256: sourceHash,
      status: sourceStatus as GenesisDocumentAnalysisResult["source"]["status"],
      classification: sourceClassification as GenesisDocumentAnalysisResult["source"]["classification"],
    },
    analysis: {
      artifact_id: analysis.artifact_id,
      digest: analysis.digest,
      content: {
        prompt,
        reading: {
          content_characters: numberValue(reading.content_characters) ?? 0,
          source_bound: reading.source_bound === true,
          source_modified: reading.source_modified === true,
        },
      },
    },
    draft: document,
    workflow: { workflow_id: "restored-from-history", status: "ANALYSIS_DRAFT" },
    semantic,
  };
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function providerValue(value: unknown): NonNullable<GenesisDocumentAnalysisResult["semantic"]>["provider"] {
  return ["openai", "anthropic", "gemini", "local", "fake"].includes(String(value))
    ? String(value) as NonNullable<GenesisDocumentAnalysisResult["semantic"]>["provider"]
    : "openai";
}

function DocumentMetric({ label, tone, value }: { label: string; tone: "success" | "warning" | "info" | "danger"; value: number }) {
  return <article className={`alos-document-metric ${tone}`}><span aria-hidden="true">{tone === "success" ? "▣" : tone === "warning" ? "!" : tone === "info" ? "◫" : "✓"}</span><div><strong>{value || "—"}</strong><p>{label}</p><small>{value ? "Data dari repositori aktif" : "Belum ada data"}</small></div></article>;
}

function DocumentDistribution({ documents }: { documents: DocumentRecord[] }) {
  const categories = Array.from(new Set(documents.map((document) => document.category))).slice(0, 4);
  return <div className="alos-document-distribution-body"><div className="alos-document-donut"><strong>{documents.length || "—"}</strong><span>Dokumen</span></div><div>{categories.length === 0 ? <p>Belum ada kategori terdaftar.</p> : categories.map((category) => <p key={category}><i />{category}<strong>{documents.filter((document) => document.category === category).length}</strong></p>)}</div></div>;
}

function DocumentHighlights({ documents, onSelect }: { documents: DocumentRecord[]; onSelect: (documentId: string) => void }) {
  if (documents.length === 0) return <p className="alos-empty-copy">Belum ada dokumen yang dapat ditampilkan.</p>;
  return <ul className="alos-document-highlights">{documents.slice(0, 5).map((document) => <li key={document.document_id}><button onClick={() => void onSelect(document.document_id)} type="button"><span><strong>{document.title}</strong><small>{document.category} · v{document.version_number}</small></span><em className={`alos-document-status ${document.status.toLowerCase()}`}>{document.status.replace("_", " ")}</em></button></li>)}</ul>;
}

function DocumentTable({ documents, onSelect, selectedId }: { documents: DocumentRecord[]; onSelect: (documentId: string) => void; selectedId: string | null }) {
  if (documents.length === 0) return <div className="alos-empty-message compact"><span>○</span><p>Belum ada dokumen yang sesuai pada workspace ini.</p></div>;
  return <div className="alos-document-table-wrap"><table><thead><tr><th>Nama dokumen</th><th>Sumber</th><th>Versi</th><th>Terakhir diperbarui</th><th>Status</th></tr></thead><tbody>{documents.map((document) => <tr className={selectedId === document.document_id ? "selected" : ""} key={document.document_id}><td><button onClick={() => void onSelect(document.document_id)} type="button">{document.title}</button><small>{document.category} · {document.classification}</small></td><td>{document.origin === "GENESIS" ? "GENESIS" : "Manual"}</td><td>v{document.version_number}</td><td>{formatDocumentDate(document.updated_at)}</td><td><em className={`alos-document-status ${document.status.toLowerCase()}`}>{document.status.replace("_", " ")}</em></td></tr>)}</tbody></table></div>;
}

type DocumentDetailPanelProps = {
  actor: SessionActor;
  detail: DocumentDetail | null;
  pendingChecks: number;
  checkNotes: string;
  reviewNotes: string;
  submitting: boolean;
  onCheckNotes: (value: string) => void;
  onReviewNotes: (value: string) => void;
  onCompleteCheck: (key: string) => void;
  onSubmit: () => void;
  onDecide: (approved: boolean) => void;
};

function DocumentDetailPanel({ actor, detail, pendingChecks, checkNotes, reviewNotes, submitting, onCheckNotes, onReviewNotes, onCompleteCheck, onSubmit, onDecide }: DocumentDetailPanelProps) {
  if (!detail) return <article className="alos-panel alos-document-detail-panel"><p className="alos-empty-copy">Pilih dokumen untuk melihat versi, isi draft, checklist, dan status review.</p></article>;
  const isGenesisRecommendation = detail.document.origin === "GENESIS"
    && ["GENESIS_ANALYSIS", "GENESIS_RND", "GENESIS_CHECKLIST"].includes(detail.document.category);
  if (isGenesisRecommendation) return <article className="alos-panel alos-document-detail-panel">
    <div className="alos-panel-heading-row"><div><p className="alos-kicker">REKOMENDASI GENESIS · READ-ONLY</p><h3>{detail.document.title}</h3><p className="alos-document-meta">v{detail.document.version_number} · {detail.document.category} · dibuat {formatDocumentDate(detail.document.created_at)}</p></div><em className="alos-document-status draft">REKOMENDASI</em></div>
    <pre className="alos-document-content">{detail.content}</pre>
    <div className="alos-genesis-recommendation-note"><strong>Bukan checklist persetujuan dokumen</strong><p>Genesis hanya memberikan analisis, R&amp;D, atau daftar rekomendasi. Direktur mengonfirmasi, menolak, atau memberi prioritas melalui percakapan ARA; tidak ada item yang ditandai selesai di sini.</p><Link href="/ara">Lanjutkan percakapan di ARA →</Link></div>
  </article>;
  const isMaker = detail.document.created_by_user_id === actor.user_id;
  const canCheck = canCheckDocument(actor, detail);
  const canApprove = canApproveDocument(actor, detail);
  const directDirectorFlow = actor.roles.includes("EXECUTIVE")
    && (detail.document.classification === "PUBLIC" || detail.document.classification === "INTERNAL");
  const checklistComplete = isChecklistComplete(detail);
  const canSubmit = detail.document.status === "DRAFT" && isMaker && checklistComplete && !directDirectorFlow;
  const decisionBlocked = submitting || reviewNotes.trim().length < 3
    || (detail.document.status === "DRAFT" && !checklistComplete);
  return <article className="alos-panel alos-document-detail-panel">
    <div className="alos-panel-heading-row"><div><p className="alos-kicker">{detail.document.origin === "GENESIS" ? "DRAFT DARI GENESIS" : "DOKUMEN KANONIS"}</p><h3>{detail.document.title}</h3><p className="alos-document-meta">v{detail.document.version_number} · {detail.document.category} · {detail.document.classification} · dibuat {formatDocumentDate(detail.document.created_at)}</p></div><em className={`alos-document-status ${detail.document.status.toLowerCase()}`}>{detail.document.status.replace("_", " ")}</em></div>
    <pre className="alos-document-content">{detail.content}</pre>
    <div className="alos-document-checklist-heading"><div><p className="alos-kicker">CHECKLIST WAJIB</p><h4>{pendingChecks === 0 ? "Checklist lengkap" : `${pendingChecks} item masih memblokir persetujuan Direktur`}</h4></div><span>{detail.checklist.filter((item) => item.status === "PASSED").length}/{detail.checklist.length} selesai</span></div>
    {canCheck ? <label className="alos-document-note-input">{directDirectorFlow ? "Catatan pemeriksaan Direktur" : "Catatan checker"}<input minLength={3} onChange={(event) => onCheckNotes(event.target.value)} value={checkNotes} /></label> : null}
    <ul className="alos-document-checklist">{detail.checklist.map((item) => <li key={item.document_checklist_item_id}><span className={item.status === "PASSED" ? "passed" : "pending"}>{item.status === "PASSED" ? "✓" : "○"}</span><div><strong>{item.label}</strong><small>{item.check_type === "AUTOMATED" ? "Pemeriksaan otomatis" : item.notes ?? (directDirectorFlow ? "Ditinjau oleh Direktur sebelum persetujuan" : "Memerlukan checker independen")}</small></div>{canCheck && item.check_type === "HUMAN" && item.status !== "PASSED" ? <button disabled={submitting || checkNotes.trim().length < 3} onClick={() => onCompleteCheck(item.check_key)} type="button">Tandai selesai</button> : null}</li>)}</ul>
    {canSubmit ? <button className="alos-document-primary" disabled={submitting} onClick={onSubmit} type="button">Kirim untuk review</button> : null}
    {detail.document.status === "DRAFT" && isMaker && !canSubmit && !canApprove ? <p className="alos-document-note">Dokumen dapat dikirim oleh pembuatnya setelah seluruh checklist wajib diselesaikan checker independen.</p> : null}
    {canApprove ? <div className="alos-document-decision"><label>Catatan Direktur<input minLength={3} onChange={(event) => onReviewNotes(event.target.value)} value={reviewNotes} /></label>{detail.document.status === "DRAFT" && !checklistComplete ? <p className="alos-document-note">Selesaikan seluruh checklist wajib sebelum Direktur dapat membuat keputusan.</p> : null}<div><button className="alos-document-primary" disabled={decisionBlocked} onClick={() => onDecide(true)} type="button">Setujui dokumen</button><button className="alos-document-reject" disabled={decisionBlocked} onClick={() => onDecide(false)} type="button">Tolak dokumen</button></div></div> : null}
    {detail.reviews.length > 0 ? <div className="alos-document-review-history"><p className="alos-kicker">RIWAYAT REVIEW</p>{detail.reviews.map((review) => <p key={review.document_review_request_id}><strong>{review.status}</strong> · {formatDocumentDate(review.submitted_at)}{review.notes ? ` — ${review.notes}` : ""}</p>)}</div> : null}
  </article>;
}

function messageFrom(failure: unknown): string {
  return apiMessage(failure);
}
