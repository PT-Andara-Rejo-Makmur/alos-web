"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Alert, Button, DataTable, LoadingState, PageHeader, Section, Status, Tabs, type TabItem } from "@/components/ui";
import type { BusinessTarget } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import {
  corporateTargets,
  formatValue,
  observationFor,
  performanceLabel,
  performanceVariant,
  periodLabel,
  valueForObservation,
} from "./executive-model";
import styles from "./executive.module.css";

interface PerformanceReviewItem {
  readonly id: string;
  readonly periodLabel: string;
  readonly targetName: string;
  readonly actualValue: string;
  readonly forecastValue: string;
  readonly performanceState: BusinessTarget["performance_state"];
  readonly findingsCount: number;
  readonly reviewComment: string;
  readonly owner: string;
  readonly evidenceRef: string | null;
}

export function ExecutiveReviewsPage() {
  return (
    <ExecutiveLayout>
      {() => <ReviewsContent />}
    </ExecutiveLayout>
  );
}

function ReviewsContent() {
  const { data, error, loading } = useExecutiveStrategyData();
  const [tab, setTab] = useState("performance");

  const tabs: readonly TabItem[] = useMemo(() => [
    { id: "performance", label: "Review Kinerja" },
    { id: "corrective", label: "Tindakan Korektif" },
    { id: "revision", label: "Revisi Target" },
    { id: "history", label: "Riwayat" },
  ], []);

  const targets = corporateTargets(data?.targets ?? []);
  const authorizedActions = data?.authority?.authorized_actions ?? [];
  const canMutate = authorizedActions.includes("CREATE_COMPANY_PLAN");

  // Form state for Revisi Target
  const [selectedTargetId, setSelectedTargetId] = useState(targets[0]?.target_id ?? "");
  const [revisionReason, setRevisionReason] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState<string | null>(null);

  const selectedTarget = targets.find((t) => t.target_id === selectedTargetId);

  // Synthesize review items from actual targets
  const reviewItems: readonly PerformanceReviewItem[] = targets.map((t) => {
    const act = observationFor(t, "ACTUAL");
    const fct = observationFor(t, "FORECAST");
    return {
      id: `rev_${t.target_id}`,
      periodLabel: periodLabel(t.period),
      targetName: t.name,
      actualValue: valueForObservation(act, formatValue),
      forecastValue: valueForObservation(fct, formatValue),
      performanceState: t.performance_state ?? "ON_TRACK",
      findingsCount: t.performance_state === "AT_RISK" ? 1 : 0,
      reviewComment:
        t.performance_state === "AT_RISK"
          ? "Deviasi dari rencana awal memerlukan mitigasi penyesuaian belanja dan strategi pemasaran."
          : "Kinerja berjalan selaras dengan proyeksi periode berjalan.",
      owner: t.owner_role_ref || "EXECUTIVE",
      evidenceRef: t.evidence_refs[0] ?? null,
    };
  });

  async function handleRevisionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTargetId) {
      setRevisionFeedback("Pilih target aktif yang akan direvisi.");
      return;
    }
    if (!revisionReason.trim()) {
      setRevisionFeedback("Alasan revisi wajib diisi secara jelas.");
      return;
    }

    if (!canMutate) {
      setRevisionFeedback("Pengajuan revisi memerlukan kewenangan yang berlaku.");
      return;
    }

    setSubmittingRevision(true);
    setRevisionFeedback(null);
    try {
      await strategyApi.createRevision(selectedTargetId, { reason: revisionReason });
      setRevisionFeedback("Pengajuan revisi berhasil dikirim. Draf versi target baru telah dibuat untuk peninjauan.");
      setRevisionReason("");
    } catch {
      setRevisionFeedback("Gagal mengirim pengajuan revisi target.");
    } finally {
      setSubmittingRevision(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        description="Telaah capaian berkala, rumuskan tindakan korektif, dan kelola revisi target melalui tata kelola yang tertib."
        eyebrow="STRATEGI & KINERJA"
        title="Review & Revisi"
      />
      {error ? <Alert message={error} title="Data belum dapat dimuat." variant="warning" /> : null}
      <Tabs ariaLabel="Review dan revisi" items={tabs} onValueChange={setTab} value={tab} />

      {loading ? <LoadingState label="Memuat data tinjauan" variant="table" /> : null}

      {/* Tab 1: Review Kinerja */}
      {!loading && tab === "performance" ? (
        <Section
          description="Evaluasi berkala terhadap target strategis, kesenjangan capaian, dan komentar telaah direksi."
          title="Review Kinerja Eksekutif"
        >
          <DataTable
            caption="Telaah kinerja strategi"
            columns={[
              { header: "Periode", key: "period", render: (r) => r.periodLabel },
              { header: "Target", key: "target", render: (r) => r.targetName },
              { header: "Aktual", key: "actual", render: (r) => r.actualValue },
              { header: "Perkiraan", key: "forecast", render: (r) => r.forecastValue },
              {
                header: "Status",
                key: "status",
                render: (r) => (
                  <Status
                    label={performanceLabel(r.performanceState)}
                    variant={performanceVariant(r.performanceState)}
                  />
                ),
              },
              {
                header: "Temuan",
                key: "findings",
                render: (r) => (r.findingsCount > 0 ? `${r.findingsCount} Perhatian` : "Nihil"),
              },
              { header: "Komentar Review", key: "comment", render: (r) => r.reviewComment },
              { header: "Penanggung Jawab", key: "owner", render: (r) => r.owner },
              {
                header: "Bukti",
                key: "evidence",
                render: (r) => (r.evidenceRef ? "Bukti Terlampir" : "—"),
              },
            ]}
            getRowKey={(r) => r.id}
            rows={reviewItems}
          />
        </Section>
      ) : null}

      {/* Tab 2: Tindakan Korektif (Shared Work Integration) */}
      {tab === "corrective" ? (
        <Section
          description="Tindak lanjut penyimpangan kinerja dialokasikan langsung melalui modul kerja universal."
          title="Tindakan Korektif"
        >
          <div className={styles.briefNotice} style={{ marginBottom: "var(--alos-space-4)" }}>
            Tindakan korektif menggunakan integrasi <strong>Tugas</strong> dan <strong>Proyek</strong> universal untuk memastikan eksekusi lapangan dapat dipantau langsung.
          </div>
          <div className={styles.detailLinks}>
            <Link className={styles.detailLink} href="/workspace/executive/tasks">
              → Buka Daftar Tugas Eksekutif
            </Link>
            <Link className={styles.detailLink} href="/workspace/executive/projects">
              → Buka Daftar Proyek Strategis
            </Link>
            <Link className={styles.detailLink} href="/workspace/executive/findings">
              → Buka Temuan & Kendala
            </Link>
          </div>
        </Section>
      ) : null}

      {/* Tab 3: Revisi Target (Blocker 11 Flow) */}
      {tab === "revision" ? (
        <Section
          description="Pengajuan revisi target menciptakan draf versi baru secara bertahap tanpa menimpa target aktif."
          title="Pengajuan Revisi Target"
        >
          <div className={styles.cascadeFlow}>
            <div className={styles.briefNotice}>
              <strong>Tata Kelola Revisi:</strong> Target Aktif → Ajukan Revisi → Alasan Revisi → Draf Versi Baru → Review → Persetujuan → Aktif.
              Versi target yang sedang aktif tidak akan ditimpa langsung.
            </div>

            {revisionFeedback ? (
              <Alert
                message={revisionFeedback}
                title="Status Pengajuan"
                variant={revisionFeedback.includes("berhasil") ? "success" : "warning"}
              />
            ) : null}

            <form onSubmit={handleRevisionSubmit} style={{ marginTop: "var(--alos-space-3)" }}>
              <div className={styles.formGrid}>
                <div className={`${styles.formField} ${styles.formFullWidth}`}>
                  <label htmlFor="rev-tgt-select">Pilih Target Aktif *</label>
                  <select
                    className={styles.formSelect}
                    id="rev-tgt-select"
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    required
                    value={selectedTargetId}
                  >
                    {targets.map((t) => (
                      <option key={t.target_id} value={t.target_id}>
                        {t.name} ({t.code}) · v{t.version} · {periodLabel(t.period)}
                      </option>
                    ))}
                  </select>
                  {selectedTarget ? (
                    <p style={{ margin: "var(--alos-space-1) 0 0", fontSize: "12px", color: "var(--alos-text-secondary)" }}>
                      Target Aktif: <strong>{selectedTarget.name}</strong> (v{selectedTarget.version}) · Status: {selectedTarget.lifecycle_state}
                    </p>
                  ) : null}
                </div>

                <div className={`${styles.formField} ${styles.formFullWidth}`}>
                  <label htmlFor="rev-reason-field">Alasan Revisi Target *</label>
                  <textarea
                    className={styles.formTextarea}
                    id="rev-reason-field"
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="Tuliskan justifikasi formal revisi (misal: perubahan asumsi ekonomi makro, restrukturisasi divisi, atau penyesuaian kapasitas produksi)"
                    required
                    rows={4}
                    value={revisionReason}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <Button
                  disabled={!selectedTargetId || !revisionReason.trim() || submittingRevision}
                  type="submit"
                  variant="primary"
                >
                  {submittingRevision ? "Mengirimkan Pengajuan…" : "Ajukan Revisi Target"}
                </Button>
              </div>
            </form>
          </div>
        </Section>
      ) : null}

      {/* Tab 4: Riwayat */}
      {tab === "history" ? (
        <Section
          description="Log audit historis pelaksanaan review kinerja dan perubahan versi target."
          title="Riwayat Telaah & Revisi"
        >
          <div className={styles.readinessRow}>
            <Status label="Tercatat" variant="neutral" />
            <p>
              Seluruh rekam jejak telaah berkala dan pengajuan revisi terdokumentasi dalam sistem audit Strategy.
            </p>
          </div>
        </Section>
      ) : null}

      <Section title="Kewenangan Siklus Hidup">
        <div className={styles.readinessRow}>
          <Status label="Mengikuti kewenangan yang berlaku." variant="neutral" />
          <p>
            Perubahan target material dan pengesahan revisi memerlukan persetujuan berwenang dan tidak dapat disetujui sendiri secara sepihak.
          </p>
        </div>
      </Section>
    </div>
  );
}
