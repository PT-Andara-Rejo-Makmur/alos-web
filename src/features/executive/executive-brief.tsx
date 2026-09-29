"use client";

import Link from "next/link";

import { Button, DataTable, LoadingState, PageHeader, Status } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { canCreateTask } from "@/features/shared-work/shared/permissions/authority";

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
} from "./executive-model";
import styles from "./executive.module.css";

interface BriefProps {
  readonly session: SessionProjection;
  readonly workspaceKey: string;
}

export function ExecutiveBriefPage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return (
    <ExecutiveLayout workspaceKey={workspaceKey}>
      {(session, activeKey) => <ExecutiveBriefContent session={session} workspaceKey={activeKey} />}
    </ExecutiveLayout>
  );
}

function ExecutiveBriefContent({ session, workspaceKey }: BriefProps) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const { data, error, loading, sessionExpired } = useExecutiveStrategyData();
  const currentPlan = activePlan(data?.plans ?? []);
  const targets = corporateTargets(data?.targets ?? []);
  const strategyUnavailable = !loading && (Boolean(error) || sessionExpired || !data);
  const strategyHasNoTargets = !loading && !strategyUnavailable && targets.length === 0;

  // Check task mutation capability and permission
  const hasTaskPermission = canCreateTask(session);
  // Task mutation endpoint is not yet supported in Backend contract
  const taskMutationAvailable = false;
  const canAddDirection = hasTaskPermission && taskMutationAvailable;

  const onTrackCount = targets.filter((t) => t.performance_state === "ON_TRACK" || t.performance_state === "ACHIEVED").length;
  const atRiskCount = targets.filter((t) => t.performance_state === "AT_RISK" || t.performance_state === "OFF_TRACK").length;
  const unassessedCount = targets.filter(
    (t) => !t.performance_state || !["ON_TRACK", "ACHIEVED", "AT_RISK", "OFF_TRACK"].includes(t.performance_state),
  ).length;

  return (
    <div className={styles.page}>
      <PageHeader
        description="Ringkasan eksekutif 1–3 menit untuk membaca kondisi, memantau tenggat, dan mengambil keputusan."
        eyebrow="EKSEKUTIF"
        metadata={currentPlan
          ? `Rencana Aktif: ${currentPlan.name} · ${periodLabel(currentPlan.period)}`
          : loading
            ? "Memuat rencana aktif"
            : strategyUnavailable
              ? "Data strategi belum terhubung"
              : "Rencana aktif belum ditentukan"}
        title="Brief Eksekutif"
      />

      <div className={styles.briefLayout}>
        {/* A. Kondisi Perusahaan Saat Ini */}
        <section aria-labelledby="brief-condition" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-condition">A. Kondisi Perusahaan Saat Ini</h2>
            {!loading ? <Status
              label={strategyUnavailable ? "Belum Terhubung" : currentPlan ? "Rencana Berjalan" : "Perlu Rencana"}
              variant={currentPlan ? "success" : "neutral"}
            /> : null}
          </div>
          {loading ? <LoadingState label="Memuat kondisi perusahaan" variant="section" /> : strategyUnavailable ? (
            <div className={styles.inlineReadiness}>
              <Status label="Belum Terhubung" variant="neutral" />
              <span>Kondisi perusahaan belum dapat disimpulkan karena data strategi belum tersedia.</span>
            </div>
          ) : currentPlan ? (
            <p className={styles.briefTimelineText}>
              Perusahaan beroperasi mengacu pada <strong>{currentPlan.name}</strong> ({periodLabel(currentPlan.period)}).
              {targets.length > 0
                ? ` Dari ${targets.length} sasaran perusahaan terpantau: ${onTrackCount} sesuai target, ${atRiskCount} perlu perhatian khusus${unassessedCount > 0 ? `, ${unassessedCount} belum dinilai` : ""}.`
                : " Sasaran perusahaan belum tersedia untuk diringkas."}
            </p>
          ) : (
            <div className={styles.inlineReadiness}>
              <Status label="Belum Tersedia" variant="neutral" />
              <span>Rencana strategis aktif belum ditetapkan dalam sistem perencanaan.</span>
            </div>
          )}
        </section>

        {/* B. Sorotan Utama */}
        <section aria-labelledby="brief-highlights" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-highlights">B. Sorotan Utama</h2>
            <Link className={styles.detailLink} href={`${base}/performance`}>Lihat Kinerja</Link>
          </div>
          {loading ? <LoadingState label="Memuat sorotan utama" variant="table" /> : strategyUnavailable ? (
            <div className={styles.inlineReadiness}>
              <Status label="Belum Terhubung" variant="neutral" />
              <span>Sorotan utama belum dapat disimpulkan karena data strategi belum tersedia.</span>
            </div>
          ) : targets.length > 0 ? (
            <DataTable
              caption="Sasaran perusahaan utama"
              columns={[
                { header: "Sasaran", key: "name", render: (t) => t.name },
                { header: "Target", key: "target", render: (t) => valueForObservation(observationFor(t, "TARGET"), formatValue) },
                { header: "Aktual", key: "actual", render: (t) => valueForObservation(observationFor(t, "ACTUAL"), formatValue) },
                { header: "Status", key: "status", render: (t) => <Status label={performanceLabel(t.performance_state)} variant={performanceVariant(t.performance_state)} /> },
              ]}
              getRowKey={(t) => t.target_id}
              rows={targets.slice(0, 3)}
            />
          ) : (
            <div className={styles.inlineReadiness}>
              <Status label="Belum ada data" variant="neutral" />
              <span>Sasaran korporasi belum didaftarkan pada rencana aktif.</span>
            </div>
          )}
        </section>

        {/* C. Keputusan Hari Ini */}
        <section aria-labelledby="brief-decisions" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-decisions">C. Keputusan Hari Ini</h2>
            <Link className={styles.detailLink} href={`${base}/approvals`}>Semua Persetujuan</Link>
          </div>
          <div className={styles.inlineReadiness}>
            <Status label="Belum Tersedia" variant="neutral" />
            <span>Persetujuan yang memerlukan tanda tangan atau pengesahan eksekutif akan dirangkum di sini.</span>
          </div>
        </section>

        {/* D. Risiko & Peringatan */}
        <section aria-labelledby="brief-risks" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-risks">D. Risiko & Peringatan</h2>
            <Link className={styles.detailLink} href={`${base}/findings`}>Semua Temuan</Link>
          </div>
          {loading ? <LoadingState label="Memuat risiko dan peringatan" variant="section" /> : strategyUnavailable ? (
            <div className={styles.inlineReadiness}>
              <Status label="Belum Terhubung" variant="neutral" />
              <span>Risiko dan peringatan belum dapat disimpulkan karena data strategi belum tersedia.</span>
            </div>
          ) : atRiskCount > 0 ? (
            <ul className={styles.briefCompactList}>
              {targets.filter((t) => t.performance_state === "AT_RISK" || t.performance_state === "OFF_TRACK").map((t) => (
                <li className={styles.briefListItem} key={t.target_id}>
                  <span>Target <strong>{t.name}</strong> menunjukkan deviasi dari rencana kinerja.</span>
                  <Status label={performanceLabel(t.performance_state)} variant={performanceVariant(t.performance_state)} />
                </li>
              ))}
            </ul>
          ) : strategyHasNoTargets ? (
            <div className={styles.inlineReadiness}>
              <Status label="Belum ada data" variant="neutral" />
              <span>Risiko belum dapat diringkas karena belum ada sasaran perusahaan pada data strategi.</span>
            </div>
          ) : (
            <div className={styles.inlineReadiness}>
              <Status label="Belum Tersedia" variant="neutral" />
              <span>Data temuan belum tersedia. Ringkasan risiko akan ditampilkan ketika sumber temuan tersedia.</span>
            </div>
          )}
        </section>

        {/* E. Progres Penting */}
        <section aria-labelledby="brief-progress" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-progress">E. Progres Penting</h2>
            <Link className={styles.detailLink} href={`${base}/projects`}>Semua Proyek</Link>
          </div>
          <div className={styles.inlineReadiness}>
            <Status label="Belum Tersedia" variant="neutral" />
            <span>Progres pencapaian proyek strategis lintas divisi akan tampil setelah data pelaksanaan terhubung.</span>
          </div>
        </section>

        {/* F. Agenda & Tenggat */}
        <section aria-labelledby="brief-deadlines" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-deadlines">F. Agenda & Tenggat</h2>
          </div>
          <div className={styles.inlineReadiness}>
            <Status label="Belum Tersedia" variant="neutral" />
            <span>Agenda dan tenggat belum terhubung.</span>
          </div>
        </section>

        {/* G. Arahan Pimpinan */}
        <section aria-labelledby="brief-directives" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-directives">G. Arahan Pimpinan</h2>
            {canAddDirection ? (
              <Button size="sm" variant="primary">Tambah Arahan</Button>
            ) : null}
          </div>
          <div className={styles.briefNotice}>
            Pembuatan arahan akan tersedia setelah tindakan tugas dapat digunakan.
          </div>
        </section>

        {/* H. GENESIS Advisory */}
        <section aria-labelledby="brief-advisory" className={styles.briefSection}>
          <div className={styles.briefHeader}>
            <h2 id="brief-advisory">H. GENESIS Advisory</h2>
            <Status label="Belum Terhubung" variant="neutral" />
          </div>
          <p className={styles.briefTimelineText}>
            Advisory cerdas GENESIS akan menganalisis anomali, tren belanja, dan risiko operasional secara otomatis setelah integrasi governed data selesai.
          </p>
        </section>
      </div>
    </div>
  );
}
