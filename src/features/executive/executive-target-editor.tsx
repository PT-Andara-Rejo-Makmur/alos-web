"use client";

import { useEffect, useState } from "react";
import { Alert, Drawer, FormJourney } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { BusinessUnit, StrategyMeasurementType, StrategicObjective, StrategyBusinessPeriod as BusinessPeriod, StrategyBusinessScope as BusinessScope, StrategyPlan } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { activeExecutiveWorkspaceId, ExecutiveWorkspacePicker, ExecutiveRolePicker } from "./executive-form-fields";
import { generateCanonicalId, periodLabel } from "./executive-model";
import styles from "./executive.module.css";
import workStyles from "@/components/ui/work-surface.module.css";
import { roleLabel, statusLabel } from "@/lib/presentation";

export function TargetFormDrawer({ plans, canSubmitCompany, canSubmitDivision, onClose, session }: Readonly<{ plans: readonly StrategyPlan[]; canSubmitCompany: boolean; canSubmitDivision: boolean; onClose: () => void; session: SessionProjection }>) {
  const [savedTargetId, setSavedTargetId] = useState<string | null>(null);

  // Step 1: Metadata
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.plan_id ?? "");
  const [metricCode, setMetricCode] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [objectives, setObjectives] = useState<readonly StrategicObjective[]>([]);
  const [scopeType, setScopeType] = useState<BusinessScope["type"]>("COMPANY");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [measurementType, setMeasurementType] = useState<StrategyMeasurementType>("HIGHER_IS_BETTER");
  const [unit, setUnit] = useState<BusinessUnit>("IDR");
  const [ownerWorkspace, setOwnerWorkspace] = useState(() => activeExecutiveWorkspaceId(session));
  const [ownerRole, setOwnerRole] = useState("");
  const [materiality, setMateriality] = useState<"MATERIAL" | "NON_MATERIAL">("MATERIAL");
  const [sourceRef, setSourceRef] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("");

  // Step 2: Observation TARGET
  const [targetValue, setTargetValue] = useState("");
  const [sourceMode, setSourceMode] = useState<"MANUAL_EVIDENCED" | "SOURCE_LINKED">("MANUAL_EVIDENCED");
  const [obsSourceRef, setObsSourceRef] = useState("");
  const [obsEvidenceRef, setObsEvidenceRef] = useState("");

  const canSubmit = scopeType === "DIVISION" ? canSubmitDivision : canSubmitCompany;

  // Fetch objectives when plan changes
  useEffect(() => {
    let active = true;
    if (planId) {
      strategyApi.listObjectives(planId)
        .then((data) => { if (active) setObjectives(data); })
        .catch(() => { if (active) setObjectives([]); });
    } else {
      Promise.resolve().then(() => { if (active) setObjectives([]); });
    }
    return () => { active = false; };
  }, [planId]);

  // Auto-fill period from selected plan when plan changes
  useEffect(() => {
    const plan = plans.find((p) => p.plan_id === planId);
    if (!plan) return;
    const start = plan.period.starts_at.split("T")[0];
    const end = plan.period.ends_at.split("T")[0];
    Promise.resolve().then(() => {
      setStartsAt(start);
      setEndsAt(end);
    });
  }, [planId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);



  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetValue.trim() || !Number.isFinite(Number(targetValue))) {
      setFeedback("Nilai target wajib diisi.");
      return;
    }
    if (sourceMode === "SOURCE_LINKED" && !obsSourceRef.trim()) {
      setFeedback("Pilih sumber resmi untuk angka target.");
      return;
    }
    if (sourceMode === "MANUAL_EVIDENCED" && !obsEvidenceRef.trim()) {
      setFeedback("Tambahkan bukti pendukung untuk angka yang diisi manual.");
      return;
    }

    if (!canSubmit) {
      setFeedback("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    if (!code.trim() || !name.trim() || !planId || !metricCode.trim() || !ownerWorkspace.trim() || !ownerRole.trim() || !startsAt || !endsAt) { setFeedback("Lengkapi target, periode, dan penanggung jawab."); return; }
    setSubmitting(true);
    setFeedback(null);
    try {
      const selectedPlan = plans.find((p) => p.plan_id === planId);
      const generatedTargetId = savedTargetId ?? generateCanonicalId("target");
      const generatedObservationId = generateCanonicalId("obs");
      const period: BusinessPeriod = {
        granularity: selectedPlan?.period.granularity ?? "ANNUAL",
        starts_at: startsAt,
        ends_at: endsAt,
      };
      const selectedObjective = objectives.find((o) => o.objective_id === objectiveId);

      // 1. Create Target Metadata
      if (!savedTargetId) await strategyApi.createTarget({
        target_id: generatedTargetId,
        version: 1,
        code,
        name,
        description: description || null,
        plan_ref: { id: selectedPlan?.plan_id ?? planId, version: selectedPlan?.version ?? 1 },
        objective_ref: selectedObjective
          ? { id: selectedObjective.objective_id, version: selectedObjective.version }
          : null,
        metric_code: metricCode,
        measurement_type: measurementType,
        unit,
        period,
        scope: { type: scopeType, ref: null, label: scopeType === "COMPANY" ? "Korporasi" : null },
        owner_workspace_id: ownerWorkspace,
        owner_role_ref: ownerRole,
        materiality,
        source_refs: sourceRef.trim() ? [sourceRef.trim()] : [],
        evidence_refs: evidenceRef.trim() ? [evidenceRef.trim()] : [],
      });

      setSavedTargetId(generatedTargetId);
      // 2. Create TARGET Observation
      await strategyApi.createObservation(generatedTargetId, {
        observation_id: generatedObservationId,
        target_id: generatedTargetId,
        target_version: 1,
        kind: "TARGET",
        value: Number(targetValue),
        unit,
        period,
        source_mode: sourceMode,
        source_ref: sourceMode === "SOURCE_LINKED" ? obsSourceRef.trim() : null,
        observed_at: new Date().toISOString(),
        verification_state: "PENDING_VERIFICATION",
        evidence_refs: sourceMode === "MANUAL_EVIDENCED" && obsEvidenceRef.trim() ? [obsEvidenceRef.trim()] : [],
      });

      onClose();
    } catch {
      setFeedback("Gagal menyimpan target kinerja. Silakan periksa kembali kelengkapan data.");
    } finally {
      setSubmitting(false);
    }
  }

  return <Drawer open onClose={onClose} title={"Tambah Target Kinerja"} description="Tetapkan ukuran keberhasilan beserta penanggung jawab dan bukti pendukung."><FormJourney busy={submitting} disabled={!canSubmit} onCancel={onClose} onSubmit={handleFinalSubmit} submitLabel="Simpan Target" feedback={<>{!canSubmit ? <Alert variant="warning" message="Anda belum memiliki kewenangan untuk menyimpan pengajuan ini." /> : null}{feedback ? <Alert variant="danger" message={feedback} /> : null}{savedTargetId ? <Alert variant="warning" message="Target sudah tersimpan. Lengkapi kembali pencatatan nilainya; target yang sama akan digunakan." /> : null}</>} steps={[
{ title: "Target", content: <fieldset className={workStyles.formGrid} disabled={Boolean(savedTargetId)}><div className={styles.formField}>
              <label htmlFor="tgt-code">Kode Target *</label>
              <input className={styles.formInput} id="tgt-code" onChange={(e) => setCode(e.target.value)} placeholder="Contoh: TGT-REV-01" required value={code} />
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-name">Nama Target *</label>
              <input className={styles.formInput} id="tgt-name" onChange={(e) => setName(e.target.value)} required value={name} />
            </div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="tgt-plan">Rencana *</label>
              <select className={styles.formSelect} id="tgt-plan" onChange={(e) => setPlanId(e.target.value)} required value={planId}>
                <option value="">Pilih Rencana</option>
                {plans.map((p) => (
                  <option key={p.plan_id} value={p.plan_id}>{p.name} ({periodLabel(p.period)})</option>
                ))}
              </select>
            </div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="tgt-objective">Sasaran Terkait</label>
              <select className={styles.formSelect} id="tgt-objective" onChange={(e) => setObjectiveId(e.target.value)} value={objectiveId}>
                <option value="">Tidak dikaitkan ke sasaran</option>
                {objectives.map((o) => (
                  <option key={o.objective_id} value={o.objective_id}>{o.code} — {o.name}</option>
                ))}
              </select>
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-metric">Indikator yang Diukur *</label>
              <input className={styles.formInput} id="tgt-metric" onChange={(e) => setMetricCode(e.target.value)} required value={metricCode} />
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-measure">Cara Pengukuran *</label>
              <select className={styles.formSelect} id="tgt-measure" onChange={(e) => setMeasurementType(e.target.value as StrategyMeasurementType)} value={measurementType}>
                <option value="HIGHER_IS_BETTER">Makin Tinggi Makin Baik</option>
                <option value="LOWER_IS_BETTER">Makin Rendah Makin Baik</option>
                <option value="EXACT">Tepat Sesuai Angka</option>
                <option value="PERCENTAGE">Persentase</option>
                <option value="RATIO">Rasio</option>
              </select>
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-unit">Satuan *</label>
              <select className={styles.formSelect} id="tgt-unit" onChange={(e) => setUnit(e.target.value as BusinessUnit)} value={unit}>
                <option value="IDR">Rupiah</option>
                <option value="COUNT">Jumlah</option>
                <option value="PERCENT">Persentase (%)</option>
                <option value="RATIO">Rasio</option>
                <option value="SCORE">Skor</option>
                <option value="UNIT">Unit</option>
              </select>
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-start">Periode Mulai *</label>
              <input className={styles.formInput} id="tgt-start" onChange={(e) => setStartsAt(e.target.value)} required type="date" value={startsAt} />
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-end">Periode Selesai *</label>
              <input className={styles.formInput} id="tgt-end" onChange={(e) => setEndsAt(e.target.value)} required type="date" value={endsAt} />
            </div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="tgt-desc">Deskripsi</label>
              <textarea className={styles.formTextarea} id="tgt-desc" onChange={(e) => setDescription(e.target.value)} rows={2} value={description} />
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-val">Nilai Target *</label>
              <input className={styles.formInput} id="tgt-val" onChange={(e) => setTargetValue(e.target.value)} placeholder="0.00" required step="any" type="number" value={targetValue} />
            </div></fieldset> },
{ title: "Penanggung Jawab", content: <fieldset className={workStyles.formGrid} disabled={Boolean(savedTargetId)}><div className={styles.formField}>
              <label htmlFor="tgt-scope">Ruang Lingkup *</label>
              <select className={styles.formSelect} id="tgt-scope" onChange={(e) => setScopeType(e.target.value as BusinessScope["type"])} value={scopeType}>
                <option value="COMPANY">Korporasi</option>
                <option value="DIVISION">Divisi</option>
              </select>
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-materiality">Dampak Keputusan *</label>
              <select className={styles.formSelect} id="tgt-materiality" onChange={(e) => setMateriality(e.target.value as "MATERIAL")} value={materiality}>
                <option value="MATERIAL">Keputusan Strategis</option>
                <option value="NON_MATERIAL">Operasi Divisi</option>
              </select>
            </div>
<div className={styles.formField}>
              <ExecutiveWorkspacePicker id="tgt-owner-ws" onChange={value => { setOwnerWorkspace(value); setOwnerRole(""); }} session={session} value={ownerWorkspace} />
            </div>
<div className={styles.formField}>
              <ExecutiveRolePicker id="tgt-owner-role" session={session} workspaceId={ownerWorkspace} value={ownerRole} onChange={setOwnerRole} />
            </div></fieldset> },
{ title: "Sumber", content: <div className={styles.formGrid}><div className={styles.formField}>
              <label htmlFor="tgt-source-ref">Referensi Sumber Dokumen</label>
              <input className={styles.formInput} id="tgt-source-ref" onChange={(e) => setSourceRef(e.target.value)} placeholder="Nomor / tautan dokumen referensi" value={sourceRef} />
            </div>
<div className={styles.formField}>
              <label htmlFor="tgt-evidence-ref">Bukti Pendukung</label>
              <input className={styles.formInput} id="tgt-evidence-ref" onChange={(e) => setEvidenceRef(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" value={evidenceRef} />
            </div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="tgt-source-mode">Dasar Angka *</label>
              <select className={styles.formSelect} id="tgt-source-mode" onChange={(e) => setSourceMode(e.target.value as "SOURCE_LINKED")} value={sourceMode}>
                <option disabled value="SOURCE_LINKED">Sumber resmi eksternal belum tersedia</option>
                <option value="MANUAL_EVIDENCED">Diisi Manual dengan Bukti</option>
              </select>
            </div>
{sourceMode === "SOURCE_LINKED" ? (
              <div className={`${styles.formField} ${styles.formFullWidth}`}>
                <label htmlFor="tgt-obs-source">Referensi Sumber * <span style={{ fontSize: "11px", color: "var(--alos-text-muted)" }}>(wajib untuk angka ini)</span></label>
                <input className={styles.formInput} id="tgt-obs-source" onChange={(e) => setObsSourceRef(e.target.value)} placeholder="Nomor SK / tautan sumber resmi" required value={obsSourceRef} />
              </div>
            ) : (
              <div className={`${styles.formField} ${styles.formFullWidth}`}>
                <label htmlFor="tgt-obs-evidence">Bukti Dokumen Pendukung * <span style={{ fontSize: "11px", color: "var(--alos-text-muted)" }}>(wajib untuk angka ini)</span></label>
                <input className={styles.formInput} id="tgt-obs-evidence" onChange={(e) => setObsEvidenceRef(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" required value={obsEvidenceRef} />
              </div>
            )}</div> },
{ title: "Tinjau", content: <dl className={workStyles.facts}><div><dt>Target</dt><dd>{name || "Belum diisi"}</dd></div><div><dt>Nilai</dt><dd>{targetValue} {statusLabel(unit)}</dd></div><div><dt>Periode</dt><dd>{startsAt} – {endsAt}</dd></div><div><dt>Penanggung Jawab</dt><dd>{ownerRole ? roleLabel(ownerRole) : "Belum dipilih"}</dd></div><div><dt>Bukti Pendukung</dt><dd>{obsEvidenceRef || obsSourceRef || "Belum ditambahkan"}</dd></div></dl> }
]} /></Drawer>;
}
