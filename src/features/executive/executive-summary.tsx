"use client";

import Link from "next/link";

import { Alert, DataTable, EmptyState, LoadingState, Metric, PageHeader, Section, Status } from "@/components/ui";
import type { BusinessTarget } from "@/lib/contracts";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import {
  activePlan,
  corporateTargets,
  formatValue,
  observationFor,
  performanceLabel,
  performanceVariant,
  periodLabel,
  valueForObservation,
  verificationLabel,
} from "./executive-model";
import { ExecutiveSourceStatus } from "./executive-source-status";
import styles from "./executive.module.css";

const metricLabels = ["Pendapatan", "Penjualan / Closing", "Kas & Likuiditas", "Progres Proyek", "Keputusan Menunggu", "Risiko / Perhatian"];
const domains = [
  ["Penjualan & Komersial", "sales"], ["Keuangan", "finance"], ["Property & Proyek", "property"],
  ["Legal & Kepatuhan", "legal"], ["SDM & Organisasi", "hr"], ["IT & ALOS", "it"],
] as const;
const divisions = [
  ["Sales & Marketing", "sales"], ["Property & Teknik", "property"], ["Finance & Pajak", "finance"],
  ["Legal", "legal"], ["HR/GA", "hr"], ["IT", "it"],
] as const;

export function ExecutiveSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return (
    <ExecutiveLayout workspaceKey={workspaceKey}>
      {(_session, activeKey) => <ExecutiveSummaryContent workspaceKey={activeKey} />}
    </ExecutiveLayout>
  );
}

function ExecutiveSummaryContent({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const { data, error, loading, sessionExpired } = useExecutiveStrategyData();
  const plan = activePlan(data?.plans ?? []);
  const targets = corporateTargets(data?.targets ?? []);
  const strategyStatus = loading
    ? "loading"
    : data
      ? "available"
      : error
        ? "error"
        : "unavailable";
  const strategyUnavailable = !loading && !data;

  return (
    <div className={styles.page}>
      <PageHeader
        description="Ringkasan kondisi, kinerja, risiko, dan keputusan perusahaan."
        eyebrow="EKSEKUTIF"
        metadata={plan
          ? `Rencana aktif · ${periodLabel(plan.period)}`
          : loading
            ? "Memuat rencana aktif"
            : strategyUnavailable
              ? "Data strategi belum terhubung"
              : "Rencana aktif belum tersedia."}
        title="Pusat Kendali Eksekutif"
      />
      {sessionExpired ? <Alert message="Sesi Anda sudah berakhir. Silakan masuk kembali." title="Sesi berakhir" variant="warning" /> : null}
      {error ? <Alert message={error} title="Data belum dapat dimuat." variant="warning" /> : null}

      <ExecutiveSourceStatus
        strategyStatus={strategyStatus}
        strategyOwner="—"
        strategyUpdatedAt={plan ? formatDate(plan.updated_at) : "—"}
        strategyVerification="—"
      />

      <Section bordered title="Ringkasan Utama">
        <div className={styles.metricsStrip}>
          {metricLabels.map((label) => <Metric key={label} label={label} supportingText="Belum Terhubung" value="—" />)}
        </div>
      </Section>

      <Section actions={<Link className={styles.detailLink} href={`${base}/performance`}>Lihat Kinerja</Link>} description="Target perusahaan dari sumber strategi yang tersedia." title="Target & Kinerja Perusahaan">
        {loading ? <LoadingState label="Memuat target perusahaan" variant="table" /> : null}
        {strategyUnavailable ? <EmptyState description="Kinerja perusahaan belum dapat disimpulkan karena data strategi belum tersedia." title="Belum Terhubung" /> : null}
        {!loading && !strategyUnavailable && targets.length === 0 ? <EmptyState description="Target akan ditampilkan setelah tersedia pada rencana perusahaan." title="Belum ada target perusahaan." /> : null}
        {!strategyUnavailable && targets.length > 0 ? <CorporateTargetTable base={base} targets={targets} /> : null}
      </Section>

      <Section title="Ringkasan Domain" description="Kondisi domain operasional akan tampil setelah sumber authoritative tersedia.">
        <div className={styles.domainGrid}>
          {domains.map(([name, key]) => (
            <article className={styles.domainPanel} key={key}>
              <div><h3>{name}</h3><p>—</p></div>
              <Status label="Belum Terhubung" variant="neutral" />
              <Link className={styles.detailLink} href={`${base}/divisions/${key}`}>Lihat Detail</Link>
            </article>
          ))}
        </div>
      </Section>

      <div className={styles.twoColumn}>
        <Section actions={<Link className={styles.detailLink} href={`${base}/findings`}>Lihat Semua Temuan</Link>} title="Peringatan & Temuan">
          <EmptyState description="Temuan akan ditampilkan dari Shared Work saat sumber tersedia." title="Belum ada informasi yang dapat ditampilkan." />
        </Section>
        <Section actions={<Link className={styles.detailLink} href={`${base}/approvals`}>Lihat Semua Persetujuan</Link>} title="Keputusan Menunggu">
          <EmptyState description="Persetujuan relevan akan ditampilkan dari Shared Work saat sumber tersedia." title="Belum ada informasi keputusan." />
        </Section>
      </div>

      <Section title="Status Divisi" description="Nilai hanya ditampilkan ketika sumber perusahaan menyediakannya.">
        <DataTable
          caption="Status divisi"
          columns={[
            { header: "Divisi", key: "division", render: (row: readonly string[]) => row[0] },
            { header: "Target Utama", key: "target", render: () => "—" },
            { header: "Status", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
            { header: "Temuan", key: "findings", render: () => "—" },
            { header: "Keputusan", key: "decisions", render: () => "—" },
            { header: "Update", key: "updated", render: () => "—" },
          ]}
          getRowKey={(row) => row[1]}
          rowAction={(row) => <Link className={styles.detailLink} href={`${base}/divisions/${row[1]}`}>Lihat Detail</Link>}
          rows={divisions}
        />
      </Section>

      <Section title="Analisis GENESIS">
        <div className={styles.readinessRow}><Status label="Belum Terhubung" variant="neutral" /><p>Analisis advisory akan tersedia setelah integrasi governed data selesai.</p></div>
      </Section>
    </div>
  );
}

function CorporateTargetTable({ targets, base }: Readonly<{ targets: readonly BusinessTarget[]; base: string }>) {
  return <DataTable
    caption="Target dan kinerja perusahaan"
    columns={[
      { header: "Sasaran", key: "name", render: (target: BusinessTarget) => target.name },
      { header: "Periode", key: "period", render: (target: BusinessTarget) => periodLabel(target.period) },
      { header: "Target", key: "target", render: (target: BusinessTarget) => valueForObservation(observationFor(target, "TARGET"), formatValue) },
      { header: "Aktual", key: "actual", render: (target: BusinessTarget) => valueForObservation(observationFor(target, "ACTUAL"), formatValue) },
      { header: "Perkiraan", key: "forecast", render: (target: BusinessTarget) => valueForObservation(observationFor(target, "FORECAST"), formatValue) },
      { header: "Capaian", key: "achievement", render: () => "—" },
      { header: "Status", key: "performance", render: (target: BusinessTarget) => <Status label={performanceLabel(target.performance_state)} variant={performanceVariant(target.performance_state)} /> },
      { header: "Verifikasi", key: "verification", render: (target: BusinessTarget) => verificationLabel(observationFor(target, "ACTUAL")?.verification_state) },
      { header: "Penanggung Jawab", key: "owner", render: (target: BusinessTarget) => target.owner_role_ref || "—" },
    ]}
    getRowKey={(target) => `${target.target_id}-${target.version}`}
    rowAction={(target) => <Link className={styles.detailLink} href={`${base}/performance?target=${encodeURIComponent(target.target_id)}`}>Lihat Detail</Link>}
    rows={targets}
  />;
}

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

