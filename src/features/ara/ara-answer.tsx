import type { AraResponseProjection } from "@/lib/contracts";
import { domainLabels, statusLabel } from "@/lib/presentation";
import { ReviewedTask } from "./reviewed-task";
import styles from "./ara.module.css";

const responseLabels = { ANSWER: "Jawaban", NEEDS_INFO: "Perlu informasi tambahan", DENIED: "Informasi belum dapat diakses", NEEDS_REVIEW: "Perlu pemeriksaan Anda", FAILED: "Jawaban belum tersedia" };
const sourceDomains: Readonly<Record<string, string>> = { ...domainLabels, shared_work: "Pekerjaan & Dokumen", strategy: "Rencana & Kinerja", core: "Data Perusahaan", executive: "Kondisi Perusahaan", marketing: "Pemasaran" };

export function AraAnswer({ response, threadId, runId }: Readonly<{ response: AraResponseProjection; threadId: string; runId: string }>) {
  const groups = Object.entries(Object.groupBy(response.sources, source => source.domain.toLowerCase()));
  return <>
    <strong>{responseLabels[response.response_type]}</strong>
    <p className={styles.answerText}>{response.answer}</p>
    {response.research_result ? <section><h3>Temuan Utama</h3><ul>{response.research_result.findings.map(finding => <li key={finding.finding_id}>{finding.statement}</li>)}</ul></section> : null}
    {response.action_proposal?.kind === "TASK" ? <ReviewedTask proposal={response.action_proposal} threadId={threadId} runId={runId} /> : response.action_proposal ? <aside className={styles.proposal}><strong>ARA menyarankan tindakan</strong><p>{response.action_proposal.summary}</p><small>Saran belum dijalankan. Tinjau melalui proses perusahaan yang sesuai.</small></aside> : null}
    {response.review_package ? <details><summary>Hasil Pemeriksaan</summary><p>{response.review_package.ai_recommendation.summary}</p><p>Rekomendasi membantu pemeriksaan. Keputusan tetap mengikuti pihak yang berwenang.</p></details> : null}
    {response.factory_draft ? <details><summary>Rancangan Bantuan Baru</summary><p>{response.factory_draft.capability_draft?.purpose}</p><p>Rancangan perlu diperiksa dan diuji sebelum dapat digunakan.</p></details> : null}
    {response.delegation_result ? <details><summary>Hasil Pembacaan Informasi</summary><p>{statusLabel(response.delegation_result.status)}</p><p>Informasi dibaca sesuai akses ruang kerja Anda.</p></details> : null}
    {groups.length ? <details className={styles.sources} open><summary>Sumber yang digunakan</summary><ul>{groups.map(([domain, sources]) => <li key={domain}><strong>{sourceDomains[domain] ?? "Informasi Perusahaan"}</strong><span>{sources?.length ?? 0} sumber yang dapat diakses</span><small>{sources?.every(source => source.freshness === "CURRENT") ? "Dibaca dari catatan saat pertanyaan diproses" : "Periksa tanggal pembaruan sumber sebelum mengambil keputusan"}</small></li>)}</ul></details> : null}
    {response.failed_sources.length ? <p role="alert">Sebagian sumber belum dapat dibaca. Jawaban menggunakan informasi yang berhasil diakses.</p> : null}
    {response.limitations.length ? <details><summary>Hal yang Perlu Diperhatikan</summary><ul>{response.limitations.map(item => <li key={item}>{/tool_id|run_id|correlation|content_hash|provider|runtime|canonical|scope_refs/i.test(item) ? "Sebagian informasi atau kemampuan belum tersedia. Periksa sumber pendukung sebelum mengambil tindakan." : item}</li>)}</ul></details> : null}
  </>;
}
