"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Section, Status } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { BusinessTarget, BusinessTargetCreateRequest, CascadePreview, CascadePreviewRequest, CascadeRule, BusinessUnit, StrategyMeasurementType, PlanningAssumption, StrategicObjective, StrategyBusinessScope as BusinessScope } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { activeExecutiveWorkspaceId, ExecutiveWorkspacePicker } from "./executive-form-fields";
import { generateCanonicalId } from "./executive-model";
import styles from "./executive.module.css";

export interface CascadeSectionProps {
  readonly targets: readonly BusinessTarget[];
  readonly assumptions: readonly PlanningAssumption[];
  readonly canCascade?: boolean;
  readonly session: SessionProjection;
  readonly onChanged: () => void;
}

export function CascadeSection({ targets, assumptions, canCascade = false, session, onChanged }: CascadeSectionProps) {
  const [rootTargetId, setRootTargetId] = useState(targets[0]?.target_id ?? "");
  const [ruleType, setRuleType] = useState<"SPLIT_PERCENT" | "SPLIT_FIXED" | "DIRECT" | "RATIO_MULTIPLY" | "SUM_ROLLUP" | "RATIO_DIVIDE_CEIL" | "LIMIT_CHECK">("SPLIT_PERCENT");
  const [ratioInput, setRatioInput] = useState("");
  const [fixedAllocation, setFixedAllocation] = useState("");
  const [selectedAssumptionId, setSelectedAssumptionId] = useState("");
  const [previewData, setPreviewData] = useState<CascadePreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedTarget = targets.find((t) => t.target_id === rootTargetId);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [metricCode, setMetricCode] = useState("");
  const [scope, setScope] = useState<BusinessScope["type"] | "">("");
  const [ownerWorkspace, setOwnerWorkspace] = useState(() => activeExecutiveWorkspaceId(session));
  const [ownerRole, setOwnerRole] = useState("");
  const [unit, setUnit] = useState<BusinessUnit | "">("");
  const [measurement, setMeasurement] = useState<StrategyMeasurementType | "">("");
  const [materiality, setMateriality] = useState<BusinessTargetCreateRequest["materiality"] | "">("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [evidence, setEvidence] = useState("");
  const [source, setSource] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [objectives, setObjectives] = useState<readonly StrategicObjective[]>([]);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (selectedTarget) void strategyApi.listObjectives(selectedTarget.plan_ref.id).then((values) => { if (!cancelled) setObjectives(values); }).catch(() => { if (!cancelled) setObjectives([]); });
    return () => { cancelled = true; };
  }, [selectedTarget]);

  async function handlePreview() {
    if (!rootTargetId) {
      setErrorMsg("Pilih target utama terlebih dahulu.");
      return;
    }
    if (!canCascade) {
      setErrorMsg("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    const principal = session.principal;
    if (
      !session.authenticated ||
      !principal ||
      !("actor" in principal) ||
      !principal.actor.active ||
      !principal.actor.tenant_id ||
      !principal.actor.organization_id
    ) {
      setErrorMsg("Identitas organisasi belum tersedia. Pratinjau cascade belum dapat dijalankan.");
      return;
    }

    const { organization_id: organizationId, tenant_id: tenantId } = principal.actor;

    const derivedTargetId = generateCanonicalId("target");
    const ruleId = generateCanonicalId("rule");

    let parameters: CascadeRule["parameters"] = {};
    if (ruleType === "SPLIT_PERCENT" || ruleType === "RATIO_MULTIPLY" || ruleType === "RATIO_DIVIDE_CEIL") {
      const parsedRatio = Number(ratioInput);
      if (!ratioInput.trim() || !Number.isFinite(parsedRatio) || parsedRatio <= 0 || parsedRatio > 1) {
        setErrorMsg("Nilai rasio harus berupa angka valid antara 0.00 hingga 1.00.");
        return;
      }
      parameters = { allocations: [{ target_id: derivedTargetId, share: parsedRatio }] };
    } else if (ruleType === "SPLIT_FIXED") {
      const parsedVal = Number(fixedAllocation);
      if (Number.isNaN(parsedVal) || parsedVal <= 0) {
        setErrorMsg("Nilai alokasi tetap harus diisi dengan angka positif.");
        return;
      }
      parameters = { value: parsedVal };
    }

    if (!selectedTarget) { setErrorMsg("Target authoritative belum tersedia."); return; }
    const objective = objectives.find((item) => item.objective_id === objectiveId);
    const candidate: BusinessTargetCreateRequest | null = code.trim() && name.trim() && metricCode.trim() && scope && ownerWorkspace && ownerRole.trim() && unit && measurement && materiality && startsAt && endsAt ? {
      target_id: derivedTargetId, version: 1, code: code.trim(), name: name.trim(), metric_code: metricCode.trim(),
      plan_ref: selectedTarget.plan_ref, objective_ref: objective ? { id: objective.objective_id, version: objective.version } : null,
      scope: { type: scope, ref: scope === "DIVISION" ? ownerWorkspace : null },
      period: { granularity: selectedTarget.period.granularity, starts_at: startsAt, ends_at: endsAt },
      owner_workspace_id: ownerWorkspace, owner_role_ref: ownerRole.trim(), unit, measurement_type: measurement, materiality,
      evidence_refs: evidence.trim() ? [evidence.trim()] : [], source_refs: source.trim() ? [source.trim()] : [],
    } : null;
    setPreviewing(true);
    setAccepted(false);
    setErrorMsg(null);
    try {
      const payload: CascadePreviewRequest = {
        root_target_ref: {
          target_id: selectedTarget?.target_id ?? rootTargetId,
          version: selectedTarget?.version ?? 1,
        },
        rules: [
          {
            cascade_rule_id: ruleId,
            tenant_id: tenantId,
            organization_id: organizationId,
            rule_type: ruleType,
            input_target_refs: [{
              target_id: selectedTarget?.target_id ?? rootTargetId,
              version: selectedTarget?.version ?? 1,
            }],
            output_target_refs: [{ target_id: derivedTargetId, version: 1 }],
            parameters: { ...parameters, ...(selectedAssumptionId ? { ratio_assumption_id: selectedAssumptionId } : {}) },
            version: 1,
          },
        ],
        rule_inputs: { [ruleId]: {
          ...(!selectedAssumptionId && (ruleType === "SPLIT_PERCENT" || ruleType === "RATIO_MULTIPLY" || ruleType === "RATIO_DIVIDE_CEIL") ? { ratio: Number(ratioInput) } : {}),
          ...(ruleType === "SPLIT_FIXED" ? { [`child:${derivedTargetId}`]: Number(fixedAllocation) } : {}),
          ...(ruleType === "LIMIT_CHECK" ? { available: fixedAllocation.trim() ? Number(fixedAllocation) : null } : {}),
        } },
        ...(candidate ? { derived_targets: [candidate] } : {}),
        constraints: [],
        assumption_refs: selectedAssumptionId ? [selectedAssumptionId] : [],
      };
      const res = await strategyApi.previewCascade(payload);
      setPreviewData(res);
    } catch {
      setErrorMsg("Gagal menjalankan pratinjau cascade. Pastikan parameter input valid.");
    } finally {
      setPreviewing(false);
    }
  }

  const canAccept = Boolean(
    previewData &&
    previewData.status === "VALID" &&
    (!previewData.blocking_conditions || previewData.blocking_conditions.length === 0) &&
    canCascade && previewData.derived_targets.length > 0 && previewData.derived_targets.every((item) => item.request !== null && item.required_metadata.length === 0) && !accepted
  );

  async function handleAccept() {
    if (!canAccept || !previewData) return;
    const requests = previewData.derived_targets.map((item) => item.request);
    if (requests.some((item) => item === null)) return;
    setAccepting(true); setErrorMsg(null);
    try {
      await strategyApi.acceptCascade(previewData.cascade_run_id, { derived_targets: requests as BusinessTargetCreateRequest[], input_hash: previewData.input_hash, result_hash: previewData.result_hash });
      setAccepted(true); onChanged();
    } catch { setErrorMsg("Penerimaan cascade ditolak. Periksa metadata, sumber, atau pratinjau yang berubah."); }
    finally { setAccepting(false); }
  }

  return (
    <Section description="Penurunan target korporasi ke unit turunan melalui perhitungan terarah dan tata kelola resmi." title="Cascade Target">
      {errorMsg ? <Alert message={errorMsg} title="Perhatian" variant="warning" /> : null}
      {accepted ? <Alert message="Cascade diterima oleh Backend; target turunan dan observation tersimpan." title="Tersimpan" variant="success" /> : null}

      <div className={styles.cascadeFlow}>
        <div className={styles.cascadeStep}>
          <div className={styles.briefHeader} style={{ marginBottom: "var(--alos-space-3)" }}>
            <h3>Alur Penurunan: Target Utama → Aturan Cascade → Asumsi → Pembatas (Constraints) → Pratinjau</h3>
          </div>
          <div className={styles.formGrid} onChange={() => setPreviewData(null)}>
            <div className={styles.formField}>
              <label htmlFor="cas-root">Target Utama *</label>
              <select className={styles.formSelect} id="cas-root" onChange={(e) => setRootTargetId(e.target.value)} value={rootTargetId}>
                {targets.map((t) => (
                  <option key={t.target_id} value={t.target_id}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="cas-rule">Aturan Cascade *</label>
              <select
                className={styles.formSelect}
                id="cas-rule"
                onChange={(e) => setRuleType(e.target.value as "SPLIT_PERCENT")}
                value={ruleType}
              >
                <option value="SPLIT_PERCENT">Pembagian Persentase (Split Percent)</option>
                <option value="SPLIT_FIXED">Alokasi Tetap (Fixed Allocation)</option>
                <option value="RATIO_MULTIPLY">Pengali Rasio (Ratio Multiply)</option>
                <option value="DIRECT">Penurunan Langsung (Direct)</option>
                <option value="SUM_ROLLUP">Akumulasi Penjumlahan (Sum Rollup)</option>
                <option value="RATIO_DIVIDE_CEIL">Pembagian Rasio Dibulatkan (Ratio Divide Ceil)</option>
                <option value="LIMIT_CHECK">Batas Maksimum (Limit Check)</option>
              </select>
            </div>

            {ruleType === "SPLIT_PERCENT" || ruleType === "RATIO_MULTIPLY" || ruleType === "RATIO_DIVIDE_CEIL" ? (
              <div className={styles.formField}>
                <label htmlFor="cas-ratio">Nilai Rasio / Persentase (0.00 – 1.00) *</label>
                <input
                  className={styles.formInput}
                  id="cas-ratio"
                  max="1"
                  min="0"
                  onChange={(e) => setRatioInput(e.target.value)}
                  placeholder="Contoh: 0.50"
                  required
                  step="0.01"
                  type="number"
                  value={ratioInput}
                />
              </div>
            ) : null}

            {ruleType === "SPLIT_FIXED" || ruleType === "LIMIT_CHECK" ? (
              <div className={styles.formField}>
                <label htmlFor="cas-fixed">Nilai Alokasi Tetap *</label>
                <input
                  className={styles.formInput}
                  id="cas-fixed"
                  onChange={(e) => setFixedAllocation(e.target.value)}
                  placeholder="Masukkan nilai numerik"
                  required
                  type="number"
                  value={fixedAllocation}
                />
              </div>
            ) : null}

            <div className={styles.formField}>
              <label htmlFor="cas-asm">Asumsi yang Digunakan</label>
              <select className={styles.formSelect} id="cas-asm" onChange={(e) => setSelectedAssumptionId(e.target.value)} value={selectedAssumptionId}>
                <option value="">Tanpa Asumsi Tambahan</option>
                {assumptions.map((a) => (
                  <option key={a.assumption_id} value={a.assumption_id}>{a.name} ({a.value ?? "—"} {a.unit})</option>
                ))}
              </select>
            </div>

            <div className={styles.formField}><label htmlFor="cas-code">Kode Target Turunan *</label><input id="cas-code" className={styles.formInput} value={code} onChange={(e) => setCode(e.target.value)} /></div>
            <div className={styles.formField}><label htmlFor="cas-name">Nama Target Turunan *</label><input id="cas-name" className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className={styles.formField}><label htmlFor="cas-metric">Kode KPI Turunan *</label><input id="cas-metric" className={styles.formInput} value={metricCode} onChange={(e) => setMetricCode(e.target.value)} /></div>
            <div className={styles.formField}><label>Plan Turunan</label><span>{selectedTarget ? `${selectedTarget.plan_ref.id} v${selectedTarget.plan_ref.version}` : "Belum tersedia"}</span></div>
            <div className={styles.formField}><label htmlFor="cas-objective">Sasaran Turunan</label><select id="cas-objective" className={styles.formSelect} value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)}><option value="">Tanpa sasaran</option>{objectives.map((item) => <option key={item.objective_id} value={item.objective_id}>{item.name}</option>)}</select></div>
            <div className={styles.formField}><label htmlFor="cas-scope">Scope Turunan *</label><select id="cas-scope" className={styles.formSelect} value={scope} onChange={(e) => setScope(e.target.value as BusinessScope["type"])}><option value="">Pilih scope</option><option value="COMPANY">Korporasi</option><option value="DIVISION">Divisi</option></select></div>
            <div className={styles.formField}><ExecutiveWorkspacePicker id="cas-workspace" onChange={setOwnerWorkspace} session={session} value={ownerWorkspace} /></div>
            <div className={styles.formField}><label htmlFor="cas-role">Peran Owner Turunan *</label><input id="cas-role" className={styles.formInput} value={ownerRole} onChange={(e) => setOwnerRole(e.target.value)} /></div>
            <div className={styles.formField}><label htmlFor="cas-unit">Satuan Turunan *</label><select id="cas-unit" className={styles.formSelect} value={unit} onChange={(e) => setUnit(e.target.value as BusinessUnit)}><option value="">Pilih satuan</option>{(["IDR", "COUNT", "PERCENT", "RATIO", "MINUTE", "HOUR", "DAY", "SCORE", "UNIT", "BOOLEAN"] as const).map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
            <div className={styles.formField}><label htmlFor="cas-measurement">Pengukuran Turunan *</label><select id="cas-measurement" className={styles.formSelect} value={measurement} onChange={(e) => setMeasurement(e.target.value as StrategyMeasurementType)}><option value="">Pilih pengukuran</option>{(["HIGHER_IS_BETTER", "LOWER_IS_BETTER", "RANGE", "EXACT", "PERCENTAGE", "RATIO", "BINARY", "MILESTONE", "CUMULATIVE"] as const).map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
            <div className={styles.formField}><label htmlFor="cas-materiality">Dampak Keputusan Turunan *</label><select id="cas-materiality" className={styles.formSelect} value={materiality} onChange={(e) => setMateriality(e.target.value as BusinessTargetCreateRequest["materiality"])}><option value="">Pilih dampak keputusan</option><option value="MATERIAL">Keputusan Strategis</option><option value="NON_MATERIAL">Operasi Divisi</option></select></div>
            <div className={styles.formField}><label htmlFor="cas-start">Periode Turunan Mulai *</label><input id="cas-start" type="date" className={styles.formInput} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
            <div className={styles.formField}><label htmlFor="cas-end">Periode Turunan Selesai *</label><input id="cas-end" type="date" className={styles.formInput} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
            <div className={styles.formField}><label htmlFor="cas-evidence">Bukti Metadata Turunan</label><input id="cas-evidence" className={styles.formInput} value={evidence} onChange={(e) => setEvidence(e.target.value)} /></div>
            <div className={styles.formField}><label htmlFor="cas-source">Referensi Metadata Turunan</label><input id="cas-source" className={styles.formInput} value={source} onChange={(e) => setSource(e.target.value)} /></div>
            <div className={styles.formField} style={{ alignSelf: "flex-end" }}>
              {canCascade ? (
                <Button disabled={previewing} onClick={handlePreview} variant="primary">
                  {previewing ? "Menghitung Pratinjau…" : "Jalankan Pratinjau Cascade"}
                </Button>
              ) : (
                <div className={styles.briefNotice}>
                  Anda belum memiliki kewenangan untuk melakukan tindakan ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Results */}
        {previewData ? (
          <div className={styles.cascadeStep}>
            <div className={styles.briefHeader}>
              <h3>Hasil Pratinjau Cascade</h3>
              <Status
                label={previewData.status === "VALID" ? "Valid" : previewData.status === "PREVIEW" ? "Pratinjau" : "Perlu Perbaikan"}
                variant={previewData.status === "VALID" ? "success" : "neutral"}
              />
            </div>

            <div style={{ marginTop: "var(--alos-space-3)" }}>
              <p style={{ fontSize: "13px" }}>
                Target Asal: <strong>{selectedTarget?.name ?? "Target tidak tersedia"}</strong> (v{String(previewData.root_target_ref.version ?? "—")})
              </p>

              {previewData.blocking_conditions && previewData.blocking_conditions.length > 0 ? (
                <div style={{ margin: "var(--alos-space-2) 0" }}>
                  <Alert
                    message={previewData.blocking_conditions.join("; ")}
                    title="Kondisi Penghalang"
                    variant="warning"
                  />
                </div>
              ) : null}

              {previewData.constraint_results && previewData.constraint_results.length > 0 ? (
                <div style={{ margin: "var(--alos-space-3) 0" }}>
                  <h4 style={{ fontSize: "13px", marginBottom: "var(--alos-space-2)" }}>Evaluasi Pembatas (Constraints):</h4>
                  <ul className={styles.briefCompactList}>
                    {previewData.constraint_results.map((c) => (
                      <li className={styles.briefListItem} key={c.constraint_id}>
                        <span>{c.message}</span>
                        <Status
                          label={c.result === "PASS" ? "Memenuhi" : c.result === "FAIL" ? "Tidak Memenuhi" : "Belum Dinilai"}
                          variant={c.result === "PASS" ? "success" : "danger"}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className={styles.formActions}>
                {canAccept ? (
                  <Button
                    disabled={accepting}
                    onClick={() => void handleAccept()}
                    variant="primary"
                  >
                    {accepting ? "Menyimpan…" : "Terapkan Cascade"}
                  </Button>
                ) : (
                  <div className={styles.briefNotice}>
                    Penerimaan hasil cascade memerlukan pratinjau yang valid, tanpa kondisi penghalang, dan kewenangan resmi.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
