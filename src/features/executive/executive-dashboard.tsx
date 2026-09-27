import {
  Alert,
  DataTable,
  EmptyState,
  LoadingState,
  Metric,
  PageHeader,
  Section,
  Status,
} from "@/components/ui";
import type { BusinessTarget } from "@/lib/contracts";

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
import type { ExecutiveStrategyData } from "./executive-model";
import styles from "./executive-dashboard.module.css";

export interface ExecutiveDashboardProps {
  readonly data: ExecutiveStrategyData | null;
  readonly errorMessage?: string;
  readonly loading: boolean;
}

const summaryMetrics = [
  "Pendapatan",
  "Penjualan",
  "Kas & Likuiditas",
  "Progres Proyek",
  "Keputusan Menunggu",
  "Risiko / Perhatian",
];

const operationalDomains = [
  "Penjualan & Komersial",
  "Keuangan",
  "Property & Proyek",
  "Legal & Kepatuhan",
  "SDM & People",
  "IT & ALOS",
];

const divisions = [
  "Sales & Marketing",
  "Property",
  "Finance",
  "Legal & Compliance",
  "HR & People",
  "IT & Technology",
];

export function ExecutiveDashboard({ data, errorMessage, loading }: ExecutiveDashboardProps) {
  const plan = activePlan(data?.plans ?? []);
  const targets = corporateTargets(data?.targets ?? []);

  return (
    <div className={styles.dashboard}>
      <PageHeader
        description="Ringkasan strategis dan operasional perusahaan untuk mendukung pemantauan dan pengambilan keputusan."
        eyebrow="EKSEKUTIF"
        metadata={plan ? `Rencana aktif · ${periodLabel(plan.period)}` : "Belum ada rencana aktif."}
        title="Pusat Kendali Eksekutif"
      />

      {errorMessage ? (
        <Alert
          message={errorMessage}
          title="Target perusahaan belum dapat dimuat."
          variant="warning"
        />
      ) : null}

      <Section title="Status Ketersediaan Data" description="Status sumber yang diketahui saat ini.">
        <div className={styles.sourceGrid}>
          <div className={styles.sourceRow}>
            <span>Strategi</span>
            <Status label={data ? "Tersedia" : errorMessage ? "Belum Tersedia" : "Memuat"} variant={data ? "success" : "neutral"} />
          </div>
          <div className={styles.sourceRow}>
            <span>Operasional</span>
            <Status label="Belum Terhubung" variant="neutral" />
          </div>
        </div>
      </Section>

      <Section bordered title="Ringkasan Utama" description="Nilai yang belum memiliki sumber ditampilkan apa adanya.">
        <div className={styles.summaryGrid}>
          {summaryMetrics.map((label) => (
            <Metric key={label} label={label} supportingText="Belum tersedia" value="—" />
          ))}
        </div>
      </Section>

      <Section title="Target & Kinerja Perusahaan" description="Pemantauan target perusahaan berdasarkan rencana strategis yang tersedia.">
        {loading && !data ? <LoadingState label="Memuat target perusahaan" variant="table" /> : null}
        {!loading && !errorMessage && targets.length === 0 ? (
          <EmptyState
            description="Target akan ditampilkan setelah tersedia pada rencana perusahaan."
            title="Belum ada target perusahaan."
          />
        ) : null}
        {targets.length > 0 ? <TargetTable targets={targets} /> : null}
      </Section>

      <Section title="Ringkasan Operasional" description="Data operasional akan tampil setelah sumber authoritative tersedia.">
        <div className={styles.operationalGrid}>
          {operationalDomains.map((domain) => (
            <div className={styles.domainPanel} key={domain}>
              <div className={styles.domainHeader}>
                <h3>{domain}</h3>
                <Status label="Belum Terhubung" variant="neutral" />
              </div>
              <p>Data operasional belum tersedia.</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Hal yang Memerlukan Perhatian">
        <EmptyState
          description="Informasi perhatian akan muncul setelah sumber operasional tersedia."
          title="Belum ada informasi yang dapat ditampilkan."
        />
      </Section>

      <Section title="Keputusan Menunggu">
        <EmptyState
          description="Informasi keputusan belum tersedia."
          title="Belum ada informasi keputusan."
        />
      </Section>

      <Section title="Status Divisi" description="Status ditampilkan hanya jika sumber authoritative tersedia.">
        <DataTable
          caption="Status divisi"
          columns={[
            { header: "Divisi", key: "division", render: (division: string) => division },
            { header: "Status", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
            { header: "Keterangan", key: "detail", render: () => "Data operasional belum tersedia." },
          ]}
          rows={divisions}
        />
      </Section>
    </div>
  );
}

function TargetTable({ targets }: Readonly<{ targets: readonly BusinessTarget[] }>) {
  return (
    <div className={styles.tableViewport}>
      <DataTable
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
        ]}
        rows={targets}
        getRowKey={(target) => `${target.target_id}-${target.version}`}
      />
    </div>
  );
}
