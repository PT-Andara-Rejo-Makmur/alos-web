"use client";

import { useState } from "react";
import { Alert, Drawer, FormJourney } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { StrategyBusinessPeriod as BusinessPeriod, StrategyBusinessScope as BusinessScope, StrategyPlan } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { activeExecutiveWorkspaceId, ExecutiveWorkspacePicker, ExecutiveRolePicker, executiveWorkspaceOptions } from "./executive-form-fields";
import { generateCanonicalId, periodLabel } from "./executive-model";
import { roleLabel } from "@/lib/presentation";
import styles from "./executive.module.css";
import workStyles from "@/components/ui/work-surface.module.css";

export interface PlanFormProps {
  readonly planType: "STRATEGIC_PLAN" | "OPERATING_PLAN";
  readonly strategicPlans: readonly StrategyPlan[];
  readonly canSubmit: boolean;
  readonly onClose: () => void;
  readonly session: SessionProjection;
}

export function PlanFormDrawer({ planType, strategicPlans, canSubmit, onClose, session }: PlanFormProps) {
  const isRenstra = planType === "STRATEGIC_PLAN";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [granularity, setGranularity] = useState(isRenstra ? "ANNUAL" : "MONTHLY");
  const [label, setLabel] = useState("");
  const [parentPlanId, setParentPlanId] = useState(strategicPlans[0]?.plan_id ?? "");
  const [scopeType, setScopeType] = useState<BusinessScope["type"]>("COMPANY");
  const [ownerWorkspace, setOwnerWorkspace] = useState(() => activeExecutiveWorkspaceId(session));
  const [ownerRole, setOwnerRole] = useState("");
  const [materiality, setMateriality] = useState<"MATERIAL" | "NON_MATERIAL">("MATERIAL");
  const [source, setSource] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback("Nama rencana wajib diisi.");
      return;
    }
    if (!isRenstra && !parentPlanId) {
      setFeedback("Renstra induk wajib dipilih untuk RKAP.");
      return;
    }
    if (!ownerWorkspace.trim() || !ownerRole.trim()) {
      setFeedback("Ruang kerja dan peran penanggung jawab wajib ditentukan.");
      return;
    }

    if (!canSubmit) {
      setFeedback("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const selectedParent = strategicPlans.find((p) => p.plan_id === parentPlanId);
      const generatedId = generateCanonicalId("plan");
      await strategyApi.createPlan({
        plan_id: generatedId,
        version: 1,
        plan_type: planType,
        strategic_plan_id: !isRenstra && selectedParent ? selectedParent.plan_id : null,
        strategic_plan_version: !isRenstra && selectedParent ? selectedParent.version : null,
        name,
        description: description || null,
        owner_workspace_id: ownerWorkspace,
        owner_role_ref: ownerRole,
        period: {
          granularity: granularity as BusinessPeriod["granularity"],
          starts_at: startsAt,
          ends_at: endsAt,
          label: label || null,
        },
        scope: {
          type: scopeType as BusinessScope["type"],
          ref: null,
          label: scopeType === "COMPANY" ? "Korporasi" : null,
        },
        materiality,
        source_refs: source ? [source] : [],
        evidence_refs: evidence ? [evidence] : [],
      });
      onClose();
    } catch {
      setFeedback("Gagal menyimpan rencana. Silakan periksa kembali kelengkapan data.");
    } finally {
      setSubmitting(false);
    }
  }

  return <Drawer open onClose={onClose} title={isRenstra ? "Tambah Renstra" : "Tambah RKAP"} description="Susun rencana, tetapkan tanggung jawab, dan periksa sebelum menyimpan."><FormJourney busy={submitting} disabled={!canSubmit} onCancel={onClose} onSubmit={handleSubmit} submitLabel="Simpan Draf" feedback={<>{!canSubmit ? <Alert variant="warning" message="Anda belum memiliki kewenangan untuk menyimpan pengajuan ini." /> : null}{feedback ? <Alert variant="danger" message={feedback} /> : null}</>} steps={[
{ title: "Rencana", content: <div className={styles.formGrid}><div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="plan-name">Nama {isRenstra ? "Renstra" : "RKAP"} *</label>
            <input className={styles.formInput} id="plan-name" onChange={(e) => setName(e.target.value)} required value={name} />
          </div>
{!isRenstra ? (
            <div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="parent-plan">Renstra Induk *</label>
              <select className={styles.formSelect} id="parent-plan" onChange={(e) => setParentPlanId(e.target.value)} required value={parentPlanId}>
                <option value="">Pilih Renstra Induk</option>
                {strategicPlans.map((p) => (
                  <option key={p.plan_id} value={p.plan_id}>{p.name} ({periodLabel(p.period)})</option>
                ))}
              </select>
            </div>
          ) : null}
<div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="plan-desc">Deskripsi</label>
            <textarea className={styles.formTextarea} id="plan-desc" onChange={(e) => setDescription(e.target.value)} rows={2} value={description} />
          </div>
<div className={styles.formField}>
            <label htmlFor="plan-start">Tanggal Mulai *</label>
            <input className={styles.formInput} id="plan-start" onChange={(e) => setStartsAt(e.target.value)} required type="date" value={startsAt} />
          </div>
<div className={styles.formField}>
            <label htmlFor="plan-end">Tanggal Selesai *</label>
            <input className={styles.formInput} id="plan-end" onChange={(e) => setEndsAt(e.target.value)} required type="date" value={endsAt} />
          </div>
<div className={styles.formField}>
            <label htmlFor="plan-granularity">Frekuensi Pengukuran *</label>
            <select className={styles.formSelect} id="plan-granularity" onChange={(e) => setGranularity(e.target.value)} value={granularity}>
              <option value="ANNUAL">Tahunan</option>
              <option value="QUARTERLY">Triwulan</option>
              <option value="MONTHLY">Bulanan</option>
              <option value="CUSTOM">Khusus</option>
            </select>
          </div>
<div className={styles.formField}>
            <label htmlFor="plan-label">Label Periode</label>
            <input className={styles.formInput} id="plan-label" onChange={(e) => setLabel(e.target.value)} placeholder="Contoh: 2026–2030" value={label} />
          </div></div> },
{ title: "Penanggung Jawab", content: <div className={styles.formGrid}><div className={styles.formField}>
            <label htmlFor="plan-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="plan-scope" onChange={(e) => setScopeType(e.target.value as BusinessScope["type"])} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>
<div className={styles.formField}>
            <label htmlFor="plan-materiality">Dampak Keputusan *</label>
            <select className={styles.formSelect} id="plan-materiality" onChange={(e) => setMateriality(e.target.value as "MATERIAL")} value={materiality}>
              <option value="MATERIAL">Keputusan Strategis</option>
              <option value="NON_MATERIAL">Operasi Divisi</option>
            </select>
          </div>
<div className={styles.formField}>
            <ExecutiveWorkspacePicker id="plan-owner-workspace" onChange={value => { setOwnerWorkspace(value); setOwnerRole(""); }} session={session} value={ownerWorkspace} />
          </div>
<div className={styles.formField}>
            <ExecutiveRolePicker id="plan-owner-role" session={session} workspaceId={ownerWorkspace} value={ownerRole} onChange={setOwnerRole} />
          </div></div> },
{ title: "Dasar Perencanaan", content: <div className={styles.formGrid}><div className={styles.formField}>
            <label htmlFor="plan-source">Sumber Referensi</label>
            <input className={styles.formInput} id="plan-source" onChange={(e) => setSource(e.target.value)} placeholder="Referensi dokumen / SK" value={source} />
          </div>
<div className={styles.formField}>
            <label htmlFor="plan-evidence">Bukti Pendukung</label>
            <input className={styles.formInput} id="plan-evidence" onChange={(e) => setEvidence(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" value={evidence} />
          </div></div> },
{ title: "Tinjau", content: <dl className={workStyles.facts}><div><dt>Rencana</dt><dd>{name || "Belum diisi"}</dd></div><div><dt>Periode</dt><dd>{startsAt} – {endsAt}</dd></div><div><dt>Ruang Kerja</dt><dd>{executiveWorkspaceOptions(session).find(item => item.workspaceId === ownerWorkspace)?.workspaceName ?? "Belum dipilih"}</dd></div><div><dt>Penanggung Jawab</dt><dd>{ownerRole ? roleLabel(ownerRole) : "Belum dipilih"}</dd></div><div><dt>Dasar Perencanaan</dt><dd>{source || evidence || "Belum ditambahkan"}</dd></div></dl> }
]} /></Drawer>;
}
