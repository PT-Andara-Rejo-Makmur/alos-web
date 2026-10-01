"use client";

import Link from "next/link";

import { Alert, PageHeader, Status } from "@/components/ui";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveOverview } from "./executive-data";
import { periodLabel } from "./executive-model";
import { connectionLabel, executiveDomainLabel, ExecutiveSourceState, sourceDate } from "./executive-source-status";
import { ExecutiveTargetTable } from "./executive-summary";
import styles from "./executive.module.css";

export function ExecutiveBriefPage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return <ExecutiveLayout workspaceKey={workspaceKey}>{(_session, activeKey) => <ExecutiveBriefContent key={activeKey} workspaceKey={activeKey} />}</ExecutiveLayout>;
}

function ExecutiveBriefContent({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const { data, error, loading, sessionExpired } = useExecutiveOverview(workspaceKey);
  const strategyStatus = data?.strategy.status ?? (loading ? "loading" : "ERROR");
  const workStatus = data?.shared_work.status ?? (loading ? "loading" : "ERROR");
  const strategy = strategyStatus === "CONNECTED" || strategyStatus === "CONNECTED_EMPTY" ? data?.strategy_data : null;
  const work = workStatus === "CONNECTED" || workStatus === "CONNECTED_EMPTY" ? data?.shared_work_data : null;
  const plan = strategy?.active_operating_plans[0] ?? strategy?.active_strategic_plans[0];
  const targets = strategy?.targets ?? [];

  return <div className={styles.page}>
    <PageHeader title="Brief Eksekutif" eyebrow="EKSEKUTIF" description="Ringkasan faktual dari Strategy dan Shared Work dalam visibility ruang kerja aktif." metadata={`Waktu sumber · ${sourceDate(data?.last_updated_at)}`} />
    {sessionExpired ? <Alert title="Sesi berakhir" message="Sesi Anda sudah berakhir. Silakan masuk kembali." variant="warning" /> : null}
    {error ? <Alert title="Data belum dapat dimuat." message={error} variant="warning" /> : null}
    <div className={styles.briefLayout}>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>A. Kondisi Perusahaan Saat Ini</h2><Status {...connectionLabel(strategyStatus)} /></div>
        <ExecutiveSourceState status={strategyStatus} />
        {strategy ? <p className={styles.briefTimelineText}>{plan ? `Rencana aktif: ${plan.name} (${periodLabel(plan.period)}).` : "Rencana aktif belum ditentukan."} {targets.length} target perusahaan tersedia. Sumber Strategy: {sourceDate(data?.strategy.last_updated_at)}.</p> : null}
      </section>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>B. Sorotan Utama</h2><Link className={styles.detailLink} href={`${base}/performance`}>Lihat Kinerja</Link></div>
        <ExecutiveSourceState status={strategyStatus} />
        {targets.length > 0 ? <ExecutiveTargetTable base={base} targets={targets.slice(0, 3)} /> : null}
      </section>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>C. Keputusan Menunggu</h2><Link className={styles.detailLink} href={`${base}/approvals`}>Semua Persetujuan</Link></div>
        <ExecutiveSourceState status={workStatus} />
        {work ? <p>{work.counts.pending_approvals} persetujuan berstatus menunggu dalam visibility ruang kerja aktif.</p> : null}
      </section>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>D. Temuan & Perhatian</h2><Link className={styles.detailLink} href={`${base}/findings`}>Semua Temuan</Link></div>
        <ExecutiveSourceState status={workStatus} />
        {work ? <p>{work.counts.active_findings} temuan aktif: {work.counts.critical_findings} kritis, {work.counts.high_findings} tinggi, {work.counts.pending_verification_findings} menunggu verifikasi.</p> : null}
      </section>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>E. Status Proyek</h2><Link className={styles.detailLink} href={`${base}/projects`}>Semua Proyek</Link></div>
        <ExecutiveSourceState status={workStatus} />
        {work ? <p>{work.counts.active_projects} proyek aktif, {work.counts.on_hold_projects} ditahan, {work.counts.completed_projects} selesai. {work.counts.reports} laporan dan {work.counts.documents} dokumen tersedia.</p> : null}
      </section>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>F. Agenda & Tenggat</h2><Link className={styles.detailLink} href={`${base}/tasks`}>Semua Tugas</Link></div>
        <ExecutiveSourceState status={workStatus} />
        {work ? <p>{work.counts.overdue_tasks} tugas lewat tenggat, {work.counts.blocked_tasks} terhambat, {work.counts.critical_tasks} kritis, {work.counts.pending_review_tasks} menunggu peninjauan. Tenggat hanya dihitung jika tercatat pada sumber.</p> : null}
      </section>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>G. Koneksi Domain</h2></div>
        {loading ? <ExecutiveSourceState status="loading" /> : data ? <p>{data.domains.filter((domain) => domain.status === "UNAVAILABLE").map((domain) => executiveDomainLabel(domain.domain)).join(", ")} belum terhubung ke layanan canonical.</p> : <ExecutiveSourceState status="ERROR" />}
      </section>
      <section className={styles.briefSection}>
        <div className={styles.briefHeader}><h2>H. GENESIS Advisory</h2><Status label="Belum Terhubung" variant="neutral" /></div>
        <p className={styles.briefTimelineText}>Analisis advisory belum terhubung.</p>
      </section>
    </div>
  </div>;
}
