"use client";

import { useEffect, useRef, useState } from "react";
import type { AraAuthorityProjection, AraMessageProjection, AraProgressProjection, AraThreadProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";
import { araApi } from "./api";
import { AraAnswer } from "./ara-answer";
import { AraProgress } from "./ara-progress";
import { Button, LoadingState } from "@/components/ui";
import { CapabilityRequests } from "./capability-requests";
import styles from "./ara.module.css";

export function AraConversation({ authority, workspaceName }: { readonly authority: AraAuthorityProjection; readonly workspaceName: string }) {
  const [threads, setThreads] = useState<readonly AraThreadProjection[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<readonly AraMessageProjection[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [progressEvents, setProgressEvents] = useState<AraProgressProjection["events"]>([]);
  const [progressLabel, setProgressLabel] = useState("Mengirim pertanyaan…");
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
    return () => { live = false; lifecycle.current++; if (pendingTimer.current) clearTimeout(pendingTimer.current); pendingTimer.current = null; };
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
        const progress = await araApi.progress(threadId, latest.run_id).catch(() => null);
        if (epoch.current === current && pendingTimer.current !== null) {
          const kind = progress?.events.at(-1)?.kind;
          const labels = { UNDERSTANDING: "Memahami pertanyaan…", RETRIEVING: "Membaca informasi yang dapat diakses…",
            ANALYZING: "Menganalisis informasi…", PREPARING: "Menyiapkan jawaban…",
            WAITING_FOR_REVIEW: "Usulan menunggu pemeriksaan Anda", COMPLETED: "Jawaban siap", FAILED: "Pemrosesan belum berhasil" };
          if (progress) setProgressEvents(progress.events);
          if (kind) setProgressLabel(labels[kind]);
          if (kind === "COMPLETED" || kind === "FAILED" || kind === "WAITING_FOR_REVIEW") { pendingTimer.current = null; return; }
        }
      }
      trackRun(threadId, current);
    }, 1000);
  }

  async function cancelRun() {
    if (!activeRun) return;
    try {
      await araApi.cancel(activeRun.threadId, activeRun.runId);
      setError("Pembatalan diminta. Menunggu konfirmasi ARA.");
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
    setProgressEvents([]);
    setProgressLabel("Mengirim pertanyaan…");
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

  return <section className={styles.conversation} aria-labelledby="ara-title">
    <header className={styles.conversationHeader}><div><p className={styles.eyebrow}>ASISTEN PERUSAHAAN</p><h1 id="ara-title">Tanya ARA</h1><p>{authority.service_available === false ? "ARA belum dapat membantu saat ini. Silakan coba kembali." : "ARA siap membantu berdasarkan data dan akses ruang kerja Anda."}</p></div><Button variant="secondary" disabled={sending || loading} onClick={() => void create()}>Percakapan baru</Button></header>
    <div className={styles.chatLayout}>
      <nav aria-label="Riwayat percakapan" className={styles.threadList}>
        <h2>Percakapan</h2>{threads.map(thread => <button key={thread.thread_id} aria-current={selected === thread.thread_id} type="button" disabled={sending} onClick={() => { setError(null); selectThread(thread.thread_id); }}>{thread.title}<small>{new Date(thread.updated_at).toLocaleDateString("id-ID")}</small></button>)}
        {!threads.length && !loading ? <p>Belum ada percakapan.</p> : null}
      </nav>
      <section className={styles.chatBody} aria-label="Percakapan ARA">
        <div className={styles.messageList} role="log" aria-label="Pesan percakapan">
          {!messages.length && !loading ? <div className={styles.emptyChat}><span className={styles.assistantMonogram}>ARA</span><h2>Apa yang perlu kita tangani hari ini?</h2><p>Tanyakan kondisi pekerjaan, pengajuan yang perlu diperiksa, atau informasi dari dokumen. ARA membantu Anda melihat konteks dan langkah berikutnya.</p><div className={styles.suggestions}>{["Apa pekerjaan yang perlu saya tindak lanjuti?", "Ringkas kondisi divisi saya.", "Bantu saya memeriksa dokumen pendukung."].map(text => <button type="button" key={text} onClick={() => setDraft(text)}>{text}</button>)}</div></div> : null}
          {messages.map(message => <article key={message.message_id} className={message.role === "USER" ? styles.userMessage : styles.assistantMessage}><small>{message.role === "USER" ? "Anda" : "ARA"}</small>{message.response ? <AraAnswer response={message.response} threadId={message.thread_id} runId={message.run_id} /> : <p className={styles.answerText}>{message.content}</p>}<time dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</time></article>)}
          {loading ? <LoadingState label="Memuat percakapan…" variant="section" /> : null}
          {sending ? <AraProgress events={progressEvents} label={progressLabel} /> : null}
        </div>
        {error ? <p role="alert" className={styles.chatError}>{error}</p> : null}
        {sending && activeRun ? <Button variant="ghost" onClick={() => void cancelRun()}>Batalkan permintaan</Button> : null}
        <form className={styles.composer} onSubmit={event => { event.preventDefault(); void send(); }}><label htmlFor="ara-message">Pesan untuk ARA</label><textarea id="ara-message" value={draft} maxLength={4000} disabled={sending || loading || authority.service_available === false} onChange={event => setDraft(event.target.value)} placeholder="Tanyakan pekerjaan, data, atau dokumen…" rows={3} /><div><small>Periksa sumber sebelum mengambil keputusan.</small><Button type="submit" disabled={sending || loading || !draft.trim() || authority.service_available === false}>Kirim pesan</Button></div></form>
      </section>
      <aside className={styles.contextPanel} aria-label="Konteks ARA"><h2>Ruang Kerja</h2><strong>{workspaceName}</strong><p>Percakapan mengikuti data dan akses ruang kerja ini.</p><details><summary>Asisten & Otomasi</summary><CapabilityRequests /></details><p>Saran tindakan selalu memerlukan pemeriksaan Anda.</p></aside>
    </div>
  </section>;
}
