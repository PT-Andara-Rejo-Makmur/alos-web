"use client";

import { useEffect, useRef, useState } from "react";
import type { AraAuthorityProjection, AraMessageProjection, AraResponseProjection, AraThreadProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";
import { araApi } from "./api";
import styles from "./ara.module.css";

const labels = { ANSWER: "Jawaban", NEEDS_INFO: "Perlu informasi", DENIED: "Kewenangan ditolak", NEEDS_REVIEW: "Perlu tinjauan manusia", FAILED: "Gagal" } as const;

function Answer({ response }: { readonly response: AraResponseProjection }) {
  return <>
    <strong>{labels[response.response_type]}</strong>
    <p className={styles.answerText}>{response.answer}</p>
    {response.action_proposal && <aside className={styles.proposal}>
      <strong>Usulan tindakan · Belum dijalankan</strong><p>{response.action_proposal.summary}</p>
    </aside>}
    {response.review_package && <details className={styles.sources}><summary>Paket tinjauan · Rekomendasi AI bersifat advisory</summary>
      <p>Referensi: {response.review_package.identity.review_id}</p>
      <p>{response.review_package.ai_recommendation.summary}</p>
      <p>Keputusan IT dan Director tetap mengikuti approval ALOS.</p>
    </details>}
    {response.factory_draft && <details><summary>Draft kapabilitas</summary><p>{response.factory_draft.capability_draft?.purpose}</p><p>Tetap DRAFT. Registrasi dan aktivasi memerlukan alur governance.</p></details>}
    {response.research_result && <details><summary>Analisis internal berbasis bukti</summary><ul>{response.research_result.findings.map(finding => <li key={finding.finding_id}>{finding.statement}</li>)}</ul></details>}
    {response.delegation_result && <details><summary>Pembacaan terdelegasi</summary><p>{response.delegation_result.agent_id} · {response.delegation_result.status}</p><p>Run: {response.delegation_result.run_id} · Parent: {response.delegation_result.parent_run_id}</p><p>Child hanya membaca satu sumber dalam kewenangan parent.</p></details>}
    {response.sources.length > 0 && <details className={styles.sources} open>
      <summary>Sumber dan bukti ({response.sources.length})</summary>
      <ul>{response.sources.map(source => <li key={source.evidence_ref.evidence_id}>
        <strong>{source.domain.replace("_", " ")} · {source.tool_id}</strong>
        <span>{source.freshness === "CURRENT" ? "Sumber canonical saat run" : "Kesegaran belum diketahui"}</span>
        <span>Bukti: {source.evidence_ref.evidence_id}</span>
        <span>Direkam: {source.evidence_ref.captured_at}</span><code>{source.evidence_ref.content_hash}</code>
      </li>)}</ul>
    </details>}
    {response.failed_sources.length > 0 && <p role="alert">Sumber gagal dibaca: {response.failed_sources.join(", ")}</p>}
    {response.limitations.length > 0 && <details><summary>Batas kemampuan</summary><ul>{response.limitations.map(item => <li key={item}>{item}</li>)}</ul></details>}
  </>;
}

export function AraConversation({ authority, workspaceName }: { readonly authority: AraAuthorityProjection; readonly workspaceName: string }) {
  const [threads, setThreads] = useState<readonly AraThreadProjection[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<readonly AraMessageProjection[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<{ threadId: string; runId: string } | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const epoch = useRef(0);
  useEffect(() => {
    const lifecycle = epoch;
    let live = true;
    araApi.threads().then(rows => { if (live) { setThreads(rows); setSelected(rows[0]?.thread_id ?? null); } })
      .catch(() => { if (live) setError("Riwayat belum dapat dimuat. Coba buka kembali ARA."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; lifecycle.current++; };
  }, []);
  useEffect(() => {
    const current = ++epoch.current;
    if (!selected) return;
    araApi.messages(selected).then(rows => { if (epoch.current === current) setMessages(rows); })
      .catch(() => { if (epoch.current === current) setError("Percakapan belum dapat dimuat."); })
      .finally(() => { if (epoch.current === current) setLoading(false); });
  }, [selected]);

  function selectThread(threadId: string) {
    if (threadId === selected) return;
    setMessages([]); setLoading(true); setSelected(threadId);
  }

  function trackRun(threadId: string, current: number) {
    pendingTimer.current = setTimeout(async () => {
      if (epoch.current !== current) return;
      const rows = await araApi.messages(threadId).catch(() => null);
      if (epoch.current !== current || pendingTimer.current === null) return;
      const latest = rows?.at(-1);
      if (latest?.role === "USER" && latest.run_id) {
        setActiveRun({ threadId, runId: latest.run_id });
        setMessages(rows!);
      }
      trackRun(threadId, current);
    }, 500);
  }

  async function cancelRun() {
    if (!activeRun) return;
    try {
      await araApi.cancel(activeRun.threadId, activeRun.runId);
      setError("Pembatalan diminta. Menunggu konfirmasi runtime.");
    } catch { setError("Pembatalan belum dapat dikonfirmasi. Silakan coba kembali."); }
  }

  async function create() {
    setError(null); setLoading(true);
    const current = epoch.current;
    try {
      const thread = await araApi.create();
      if (epoch.current !== current) return;
      setThreads(rows => [thread, ...rows]); selectThread(thread.thread_id); setDraft("");
    } catch { setError("Percakapan belum dapat dibuat. Silakan coba kembali."); }
    finally { setLoading(false); }
  }
  async function send() {
    if (!draft.trim() || sending || draft.length > 4000) return;
    const current = epoch.current;
    setSending(true); setError(null);
    let threadId = selected;
    try {
      if (!threadId) {
        const thread = await araApi.create();
        if (epoch.current !== current) return;
        threadId = thread.thread_id; setThreads(rows => [thread, ...rows]);
      }
      trackRun(threadId, current);
      await araApi.send(threadId, { message: draft.trim() });
      if (epoch.current !== current) return;
      const rows = await araApi.messages(threadId);
      if (epoch.current !== current) return;
      setDraft(""); setMessages(rows); setSelected(threadId);
    } catch (failure) {
      if (epoch.current !== current) return;
      setError(failure instanceof ApiError && failure.status === 403 ? "Kewenangan ditolak."
        : failure instanceof ApiError && failure.status === 401 ? "Sesi berakhir. Silakan masuk kembali."
        : failure instanceof ApiError && failure.status === 409 ? "Percakapan masih diproses. Coba kembali setelah selesai."
        : "Layanan ARA belum tersedia. Silakan coba kembali.");
      if (threadId) {
        const rows = await araApi.messages(threadId).catch(() => null);
        if (epoch.current === current && rows) { setMessages(rows); setSelected(threadId); }
      }
    } finally {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
      if (epoch.current === current) { setSending(false); setActiveRun(null); }
    }
  }

  return <main className={styles.conversation}>
    <header className={styles.conversationHeader}><div><p>{authority.service_available === false ? "Layanan ARA belum tersedia" : "ARA Core Connected · Mode deterministik"}</p><h1>Tanya ARA</h1>
      <p>Ruang kerja aktif: {workspaceName}</p>
      <p>Production Model Provider: Belum Terhubung · Klasifikasi maksimum: {authority.maximum_data_classification}</p></div>
      <button type="button" disabled={sending || loading} onClick={() => void create()}>Percakapan baru</button></header>
    <div className={styles.chatLayout}>
      <nav aria-label="Riwayat percakapan" className={styles.threadList}>
        {threads.map(thread => <button key={thread.thread_id} aria-current={selected === thread.thread_id} type="button"
          disabled={sending} onClick={() => { setError(null); selectThread(thread.thread_id); }}>{thread.title}<small>{new Date(thread.updated_at).toLocaleDateString("id-ID")}</small></button>)}
        {!threads.length && !loading && <p>Belum ada percakapan.</p>}
      </nav>
      <section className={styles.chatBody} aria-label="Percakapan ARA">
        <div className={styles.messageList}>
          {!messages.length && !loading && <div className={styles.emptyChat}><h2>Baca data ruang kerja Anda</h2><p>Tanyakan lead Sales, proyek aktif, persetujuan, piutang, risiko Legal, atau incident IT. Ketersediaan mengikuti kewenangan Anda.</p></div>}
          {messages.map(message => <article key={message.message_id} className={message.role === "USER" ? styles.userMessage : styles.assistantMessage}>
            <small>{message.role === "USER" ? "Anda" : "ARA"}</small>
            {message.response ? <Answer response={message.response} /> : <p className={styles.answerText}>{message.content}</p>}
            <small>Run: {message.run_id} · Referensi: {message.correlation_id}</small>
          </article>)}
          {(loading || sending) && <p role="status">{sending ? "Membaca data dan memeriksa sumber…" : "Memuat percakapan…"}</p>}
        </div>
        {error && <p role="alert" className={styles.chatError}>{error}</p>}
        {sending && activeRun && <button type="button" onClick={() => void cancelRun()}>Batalkan run</button>}
        <form className={styles.composer} onSubmit={event => { event.preventDefault(); void send(); }}>
          <label htmlFor="ara-message">Pesan untuk ARA</label>
          <textarea id="ara-message" value={draft} maxLength={4000} disabled={sending || loading} onChange={event => setDraft(event.target.value)} placeholder="Tampilkan lead Sales" rows={3} />
          <button type="submit" disabled={sending || loading || !draft.trim()}>Kirim pesan</button>
        </form>
      </section>
    </div>
  </main>;
}
