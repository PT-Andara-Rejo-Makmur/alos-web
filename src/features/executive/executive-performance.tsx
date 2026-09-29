"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Alert,
  Button,
  DataTable,
  Drawer,
  EmptyState,
  LoadingState,
  PageHeader,
  Section,
  Status,
  Tabs,
  type TabItem,
} from "@/components/ui";
import type { BusinessTarget, MetricObservation } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import {
  corporateTargets,
  formatValue,
  generateCanonicalId,
  observationFor,
  performanceLabel,
  performanceVariant,
  periodLabel,
  scopeLabel,
  valueForObservation,
  verificationLabel,
} from "./executive-model";
import styles from "./executive.module.css";

export function ExecutivePerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return (
    <ExecutiveLayout workspaceKey={workspaceKey}>
      {(_session, activeKey) => <PerformanceContent workspaceKey={activeKey} />}
    </ExecutiveLayout>
  );
}

function PerformanceContent({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetIdParam = searchParams.get("target");

  const { data, error, loading } = useExecutiveStrategyData();
  const [tab, setTab] = useState("company");

  const tabs: readonly TabItem[] = useMemo(() => [
    { id: "company", label: "Perusahaan" },
    { id: "kpi", label: "KPI" },
    { id: "division", label: "Divisi" },
    { id: "forecast", label: "Perkiraan" },
    { id: "history", label: "Riwayat" },
  ], []);

  const targets = corporateTargets(data?.targets ?? []);
  const authorizedActions = data?.authority?.authorized_actions ?? [];

  // Selected target for detail view (Corporate or Division scoped)
  const allTargets = data?.targets ?? [];
  const activeDetailTarget = targetIdParam
    ? allTargets.find((t) => t.target_id === targetIdParam) ?? null
    : null;

  // If URL has target query parameter, show Target Performance Detail
  if (targetIdParam && activeDetailTarget) {
    const canMutate = activeDetailTarget.scope.type === "COMPANY"
      ? authorizedActions.includes("CREATE_COMPANY_PLAN")
      : authorizedActions.includes("CREATE_DIVISION_PLAN");
    return (
      <TargetPerformanceDetail
        canMutate={canMutate}
        onBack={() => router.push(`${base}/performance`)}
        target={activeDetailTarget}
      />
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        description="Pantau pencapaian aktual, proyeksi perkiraan, status kinerja, serta verifikasi bukti secara akurat."
        eyebrow="STRATEGI & KINERJA"
        title="Kinerja"
      />
      {error ? <Alert message={error} title="Data belum dapat dimuat." variant="warning" /> : null}
      <Tabs ariaLabel="Kinerja" items={tabs} onValueChange={setTab} value={tab} />

      {loading ? <LoadingState label="Memuat kinerja perusahaan" variant="table" /> : null}

      {!loading && tab === "company" ? (
        <PerformanceTable base={base} targets={targets} />
      ) : null}

      {!loading && tab === "kpi" ? (
        <EmptyState
          description="Definisi KPI akan ditampilkan setelah sumber data resmi tersedia."
          title="Definisi KPI belum tersedia."
        />
      ) : null}

      {!loading && tab === "division" ? <DivisionPerformance base={base} /> : null}

      {!loading && tab === "forecast" ? (
        <PerformanceTable base={base} targets={targets} />
      ) : null}

      {!loading && tab === "history" ? (
        <EmptyState
          description="Riwayat observasi terperinci dapat diakses melalui tombol Lihat Detail pada masing-masing target."
          title="Riwayat belum dipilih."
        />
      ) : null}
    </div>
  );
}

// ============================================================
// Target Table (Overview)
// ============================================================

interface PerformanceTableProps {
  readonly targets: readonly BusinessTarget[];
  readonly base: string;
}

function PerformanceTable({ targets, base }: PerformanceTableProps) {
  return (
    <Section description="Status performa mencerminkan penilaian kinerja resmi korporasi." title="Kinerja Perusahaan">
      <DataTable
        caption="Kinerja target perusahaan"
        columns={[
          { header: "Target", key: "target", render: (t) => t.name },
          {
            header: "Target Nilai",
            key: "target_val",
            render: (t) => valueForObservation(observationFor(t, "TARGET"), formatValue),
          },
          {
            header: "Aktual",
            key: "actual",
            render: (t) => valueForObservation(observationFor(t, "ACTUAL"), formatValue),
          },
          {
            header: "Perkiraan",
            key: "forecast",
            render: (t) => valueForObservation(observationFor(t, "FORECAST"), formatValue),
          },
          { header: "Variansi", key: "variance", render: () => "—" },
          {
            header: "Status",
            key: "status",
            render: (t) => (
              <Status
                label={performanceLabel(t.performance_state)}
                variant={performanceVariant(t.performance_state)}
              />
            ),
          },
          {
            header: "Verifikasi",
            key: "verification",
            render: (t) => verificationLabel(observationFor(t, "ACTUAL")?.verification_state),
          },
          {
            header: "Sumber",
            key: "source",
            render: (t) => (t.source_refs.length > 0 ? "Rujukan Tersedia" : "—"),
          },
          {
            header: "Bukti",
            key: "evidence",
            render: (t) => (t.evidence_refs.length > 0 ? "Bukti Terlampir" : "—"),
          },
        ]}
        getRowKey={(t) => `${t.target_id}-${t.version}`}
        rowAction={(t) => (
          <Link
            className={styles.detailLink}
            href={`${base}/performance?target=${encodeURIComponent(t.target_id)}`}
          >
            Lihat Detail
          </Link>
        )}
        rows={targets}
      />
    </Section>
  );
}

// ============================================================
// Target Performance Detail (Blocker 13)
// ============================================================

interface TargetPerformanceDetailProps {
  readonly target: BusinessTarget;
  readonly canMutate: boolean;
  readonly onBack: () => void;
}

function TargetPerformanceDetail({
  target,
  canMutate,
  onBack,
}: TargetPerformanceDetailProps) {
  const [revisionDrawerOpen, setRevisionDrawerOpen] = useState(false);
  const [recordingMode, setRecordingMode] = useState<"ACTUAL" | "FORECAST" | null>(null);

  const targetObs = observationFor(target, "TARGET");
  const actualObs = observationFor(target, "ACTUAL");
  const forecastObs = observationFor(target, "FORECAST");
  const observations = target.observations ?? [];

  // Check mutation capability
  // Button only shows if authority permits AND capability exists
  const showActionButtons = canMutate;

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: "var(--alos-space-2)" }}>
        <Button onClick={onBack} size="sm" variant="ghost">← Kembali ke Daftar Kinerja</Button>
      </div>

      <PageHeader
        description={`Evaluasi kinerja komprehensif, observasi berkala, dan penyesuaian target untuk ${target.name}.`}
        eyebrow="DETAIL KINERJA TARGET"
        metadata={`Kode: ${target.code} · ${periodLabel(target.period)}`}
        title={target.name}
      />

      {/* Action Bar (Permission-aware) */}
      {showActionButtons ? (
        <div style={{ display: "flex", gap: "var(--alos-space-3)" }}>
          <Button onClick={() => setRecordingMode("ACTUAL")} size="sm" variant="primary">
            Catat Aktual
          </Button>
          <Button onClick={() => setRecordingMode("FORECAST")} size="sm" variant="secondary">
            Catat Perkiraan
          </Button>
          <Button onClick={() => setRevisionDrawerOpen(true)} size="sm" variant="ghost">
            Ajukan Revisi
          </Button>
        </div>
      ) : null}

      {/* Target Performance Overview Grid */}
      <div className={styles.targetDetailGrid}>
        <div className={styles.candidateCard}>
          <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Target Nilai</span>
          <strong style={{ fontSize: "20px" }}>{valueForObservation(targetObs, formatValue)}</strong>
          <span style={{ fontSize: "11px", color: "var(--alos-text-secondary)" }}>Satuan: {target.unit}</span>
        </div>

        <div className={styles.candidateCard}>
          <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Aktual Terakhir</span>
          <strong style={{ fontSize: "20px" }}>{valueForObservation(actualObs, formatValue)}</strong>
          <Status label={verificationLabel(actualObs?.verification_state)} variant="neutral" />
        </div>

        <div className={styles.candidateCard}>
          <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Perkiraan</span>
          <strong style={{ fontSize: "20px" }}>{valueForObservation(forecastObs, formatValue)}</strong>
          <span style={{ fontSize: "11px", color: "var(--alos-text-secondary)" }}>Variansi: —</span>
        </div>

        <div className={styles.candidateCard}>
          <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Status Kinerja</span>
          <div>
            <Status
              label={performanceLabel(target.performance_state)}
              variant={performanceVariant(target.performance_state)}
            />
          </div>
        </div>

        <div className={styles.candidateCard}>
          <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Ruang Lingkup & Penanggung Jawab</span>
          <p style={{ margin: "var(--alos-space-1) 0 0", fontSize: "13px" }}>
            Lingkup: {scopeLabel(target.scope)}
            <br />
            Penanggung Jawab: {target.owner_role_ref || "—"}
          </p>
        </div>

        <div className={styles.candidateCard}>
          <span style={{ fontSize: "12px", color: "var(--alos-text-muted)" }}>Metadata & Status</span>
          <p style={{ margin: "var(--alos-space-1) 0 0", fontSize: "13px" }}>
            Status: {lifecycleLabel(target.lifecycle_state)}
            <br />
            Pembaruan: {formatDate(target.updated_at)}
          </p>
        </div>
      </div>

      {/* Observations / History Table */}
      <Section
        description="Riwayat pengamatan nilai (Target, Aktual, Perkiraan) yang tercatat secara resmi."
        title="Riwayat Observasi"
      >
        <DataTable
          caption="Observasi target"
          columns={[
            {
              header: "Jenis Pengamatan",
              key: "kind",
              render: (obs) => observationKindLabel(obs.kind),
            },
            {
              header: "Nilai",
              key: "value",
              render: (obs) => (obs.value === null || obs.value === undefined ? "—" : formatValue(obs.value, obs.unit)),
            },
            { header: "Satuan", key: "unit", render: (obs) => obs.unit },
            {
              header: "Mode Sumber",
              key: "mode",
              render: (obs) => (obs.source_mode === "SOURCE_LINKED" ? "Tertaut Sumber" : "Manual Berbukti"),
            },
            {
              header: "Tanggal Pengamatan",
              key: "observed_at",
              render: (obs) => formatDate(obs.observed_at),
            },
            {
              header: "Status Verifikasi",
              key: "verification",
              render: (obs) => (
                <Status
                  label={verificationLabel(obs.verification_state)}
                  variant={obs.verification_state === "VERIFIED" ? "success" : "neutral"}
                />
              ),
            },
            {
              header: "Bukti / Sumber",
              key: "evidence",
              render: (obs) => (obs.evidence_refs.length > 0 ? "Bukti Terlampir" : obs.source_ref ? "Rujukan Sumber" : "—"),
            },
          ]}
          getRowKey={(obs) => obs.observation_id}
          rows={observations}
        />
      </Section>

      {/* Drawer Catat Aktual / Forecast from Detail */}
      {recordingMode ? (
        <ObservationDrawer
          canSubmit={canMutate}
          mode={recordingMode}
          onClose={() => setRecordingMode(null)}
          target={target}
        />
      ) : null}

      {/* Drawer Ajukan Revisi */}
      {revisionDrawerOpen ? (
        <TargetRevisionDrawer
          canSubmit={canMutate}
          onClose={() => setRevisionDrawerOpen(false)}
          target={target}
        />
      ) : null}
    </div>
  );
}

// ============================================================
// Drawer: Catat Aktual & Catat Perkiraan (Blocker 5)
// ============================================================

interface ObservationDrawerProps {
  readonly mode: "ACTUAL" | "FORECAST";
  readonly target: BusinessTarget;
  readonly canSubmit: boolean;
  readonly onClose: () => void;
}

function ObservationDrawer({ mode, target, canSubmit, onClose }: ObservationDrawerProps) {
  const isActual = mode === "ACTUAL";
  const title = isActual ? "Catat Aktual" : "Catat Perkiraan";

  const [value, setValue] = useState("");
  const [observedAt, setObservedAt] = useState(new Date().toISOString().slice(0, 10));
  const [sourceMode, setSourceMode] = useState<"MANUAL_EVIDENCED" | "SOURCE_LINKED">("MANUAL_EVIDENCED");
  const [sourceRef, setSourceRef] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setFeedback("Nilai pengamatan wajib diisi.");
      return;
    }

    // Validation according to canonical rules:
    // MANUAL_EVIDENCED -> Evidence is mandatory
    if (sourceMode === "MANUAL_EVIDENCED" && !evidenceRef.trim()) {
      setFeedback("Bukti pendukung wajib diisi untuk mode pencatatan manual.");
      return;
    }

    // SOURCE_LINKED -> Source reference is mandatory
    if (sourceMode === "SOURCE_LINKED" && !sourceRef.trim()) {
      setFeedback("Referensi sumber resmi wajib diisi untuk mode tertaut sumber.");
      return;
    }

    if (!canSubmit) {
      setFeedback("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const generatedObservationId = generateCanonicalId("obs");
      // Initial verification state: Never immediately VERIFIED. Must default to UNVERIFIED or PENDING_VERIFICATION.
      const initialVerificationState = "PENDING_VERIFICATION";

      await strategyApi.createObservation(target.target_id, {
        observation_id: generatedObservationId,
        target_id: target.target_id,
        target_version: target.version,
        kind: mode,
        value: Number(value),
        unit: target.unit,
        period: target.period,
        source_mode: sourceMode,
        source_ref: sourceRef || null,
        observed_at: `${observedAt}T00:00:00Z`,
        verification_state: initialVerificationState,
        evidence_refs: evidenceRef ? [evidenceRef] : [],
      });
      onClose();
    } catch {
      setFeedback("Gagal mencatat observasi. Silakan periksa kembali kelengkapan formulir.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer
      description={`Formulir untuk mencatat data ${isActual ? "aktual pencapaian" : "proyeksi perkiraan"} kinerja target.`}
      onClose={onClose}
      open
      title={title}
    >
      <form onSubmit={handleSubmit}>
        {!canSubmit ? (
          <div className={styles.briefNotice}>
            Anda belum memiliki kewenangan untuk mencatat observasi target ini. Formulir berjalan dalam mode pratinjau kebutuhan.
          </div>
        ) : null}
        {feedback ? <Alert message={feedback} title="Perhatian" variant="warning" /> : null}

        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="obs-target-name">Target Kinerja *</label>
            <input className={styles.formInput} disabled id="obs-target-name" value={`${target.name} (${target.code})`} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="obs-val">Nilai {isActual ? "Aktual" : "Perkiraan"} *</label>
            <input className={styles.formInput} id="obs-val" onChange={(e) => setValue(e.target.value)} placeholder="0.00" required type="number" value={value} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="obs-unit">Satuan (Unit)</label>
            <input className={styles.formInput} disabled id="obs-unit" value={target.unit} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="obs-period">Periode</label>
            <input className={styles.formInput} disabled id="obs-period" value={periodLabel(target.period)} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="obs-date">Tanggal Pengamatan *</label>
            <input className={styles.formInput} id="obs-date" onChange={(e) => setObservedAt(e.target.value)} required type="date" value={observedAt} />
          </div>

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="obs-mode">Mode Sumber *</label>
            <select className={styles.formSelect} id="obs-mode" onChange={(e) => setSourceMode(e.target.value as "MANUAL_EVIDENCED")} value={sourceMode}>
              <option value="MANUAL_EVIDENCED">Manual dengan Bukti (Evidence Wajib)</option>
              <option value="SOURCE_LINKED">Tertaut Sumber Resmi (Referensi Sumber Wajib)</option>
            </select>
          </div>

          {sourceMode === "MANUAL_EVIDENCED" ? (
            <div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="obs-ev">Bukti Pendukung (Evidence) *</label>
              <input className={styles.formInput} id="obs-ev" onChange={(e) => setEvidenceRef(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" required value={evidenceRef} />
            </div>
          ) : (
            <div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="obs-src">Referensi Sumber Resmi *</label>
              <input className={styles.formInput} id="obs-src" onChange={(e) => setSourceRef(e.target.value)} placeholder="Sistem atau laporan rujukan resmi" required value={sourceRef} />
            </div>
          )}

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="obs-notes">Catatan Tambahan (Opsional)</label>
            <textarea className={styles.formTextarea} id="obs-notes" onChange={(e) => setNotes(e.target.value)} rows={2} value={notes} />
          </div>

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <div className={styles.briefNotice}>
              Status Verifikasi Awal: <strong>Menunggu Verifikasi</strong>. Data tidak dapat langsung diubah menjadi Terverifikasi tanpa proses telaah berwenang.
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
          {canSubmit ? (
            <Button disabled={submitting} type="submit" variant="primary">
              {submitting ? "Menyimpan…" : `Simpan ${isActual ? "Aktual" : "Perkiraan"}`}
            </Button>
          ) : (
            <div className={styles.briefNotice}>
              Anda belum memiliki kewenangan untuk melakukan tindakan ini.
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}

// ============================================================
// Drawer: Ajukan Revisi Target
// ============================================================

interface TargetRevisionDrawerProps {
  readonly target: BusinessTarget;
  readonly canSubmit: boolean;
  readonly onClose: () => void;
}

function TargetRevisionDrawer({ target, canSubmit, onClose }: TargetRevisionDrawerProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleRevisionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setFeedback("Alasan revisi wajib diisi secara jelas.");
      return;
    }

    if (!canSubmit) {
      setFeedback("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await strategyApi.createRevision(target.target_id, { reason });
      onClose();
    } catch {
      setFeedback("Gagal mengajukan revisi target.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer
      description="Pengajuan revisi target menciptakan draf versi baru tanpa menimpa versi target aktif."
      onClose={onClose}
      open
      title="Ajukan Revisi Target"
    >
      <form onSubmit={handleRevisionSubmit}>
        <div className={styles.briefNotice} style={{ marginBottom: "var(--alos-space-4)" }}>
          Siklus: Target Aktif → Ajukan Revisi → Alasan Revisi → Draf Versi Baru → Review → Persetujuan → Aktif. Versi aktif tetap terlindungi.
        </div>
        {feedback ? <Alert message={feedback} title="Perhatian" variant="warning" /> : null}

        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="rev-target-name">Target Aktif</label>
            <input className={styles.formInput} disabled id="rev-target-name" value={`${target.name} (v${target.version})`} />
          </div>

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="rev-reason">Alasan Revisi Target *</label>
            <textarea
              className={styles.formTextarea}
              id="rev-reason"
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan justifikasi perubahan target, deviasi asumsi makro, atau kendala kapasitas operasional"
              required
              rows={4}
              value={reason}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
          {canSubmit ? (
            <Button disabled={submitting} type="submit" variant="primary">
              {submitting ? "Mengajukan…" : "Kirim Pengajuan Revisi"}
            </Button>
          ) : (
            <div className={styles.briefNotice}>
              Anda belum memiliki kewenangan untuk melakukan tindakan ini.
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}

// Helpers
function DivisionPerformance({ base }: Readonly<{ base: string }>) {
  return (
    <Section title="Kinerja Divisi">
      <DataTable
        caption="Rollup kinerja divisi"
        columns={[
          { header: "Divisi", key: "division", render: (row: readonly string[]) => row[0] },
          { header: "Target", key: "target", render: () => "—" },
          { header: "Aktual", key: "actual", render: () => "—" },
          { header: "Status", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
          { header: "Temuan", key: "findings", render: () => "—" },
          { header: "Perkiraan", key: "forecast", render: () => "—" },
        ]}
        getRowKey={(row) => row[1]}
        rowAction={(row) => (
          <Link className={styles.detailLink} href={`${base}/divisions/${row[1]}`}>
            Lihat Detail
          </Link>
        )}
        rows={[
          ["Sales & Marketing", "sales"],
          ["Property & Teknik", "property"],
          ["Finance & Pajak", "finance"],
          ["Legal", "legal"],
          ["HR/GA", "hr"],
          ["IT", "it"],
        ]}
      />
    </Section>
  );
}

function lifecycleLabel(state: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draf",
    UNDER_REVIEW: "Dalam Peninjauan",
    APPROVED: "Disetujui",
    ACTIVE: "Aktif",
    SUPERSEDED: "Digantikan",
    ARCHIVED: "Diarsipkan",
  };
  return map[state] ?? "Belum Dinilai";
}

function observationKindLabel(kind: MetricObservation["kind"]): string {
  switch (kind) {
    case "TARGET": return "Target";
    case "ACTUAL": return "Aktual";
    case "FORECAST": return "Perkiraan";
    case "ASSUMPTION": return "Asumsi";
    default: return kind;
  }
}

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
