"use client";

import { useState } from "react";
import { Alert, Button, Drawer, FormSection } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { StrategyBusinessScope as BusinessScope, StrategyPlan } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { activeExecutiveWorkspaceId, ExecutiveWorkspacePicker, ExecutiveRolePicker } from "./executive-form-fields";
import { generateCanonicalId, periodLabel } from "./executive-model";
import styles from "./executive.module.css";

export function ObjectiveFormDrawer({ plans, canSubmit, onClose, session }: Readonly<{ plans: readonly StrategyPlan[]; canSubmit: boolean; onClose: () => void; session: SessionProjection }>) {
  const [planId, setPlanId] = useState(plans[0]?.plan_id ?? "");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspace, setWorkspace] = useState(() => activeExecutiveWorkspaceId(session));
  const [scopeType, setScopeType] = useState<BusinessScope["type"]>("COMPANY");
  const [ownerRole, setOwnerRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) { setFeedback("Rencana induk wajib dipilih."); return; }
    if (!code.trim()) { setFeedback("Kode sasaran wajib diisi."); return; }
    if (!name.trim()) { setFeedback("Nama sasaran wajib diisi."); return; }
    if (!workspace.trim() || !ownerRole.trim()) {
      setFeedback("Ruang kerja dan peran penanggung jawab wajib ditentukan.");
      return;
    }

    const selectedPlan = plans.find((p) => p.plan_id === planId);
    if (!selectedPlan) { setFeedback("Rencana yang dipilih tidak valid."); return; }

    if (!canSubmit) {
      setFeedback("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const generatedObjectiveId = generateCanonicalId("obj");
      await strategyApi.createObjective({
        objective_id: generatedObjectiveId,
        version: 1,
        plan_id: selectedPlan.plan_id,
        plan_version: selectedPlan.version,
        code,
        name,
        description: description || null,
        workspace_id: workspace,
        scope: { type: scopeType, ref: null, label: scopeType === "COMPANY" ? "Korporasi" : null },
        owner_role_ref: ownerRole,
      });
      onClose();
    } catch {
      setFeedback("Gagal menyimpan sasaran strategis. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer description="Tambah sasaran strategis baru di bawah rencana induk." onClose={onClose} open title="Formulir Sasaran">
      <form onSubmit={handleSubmit}>
        {!canSubmit ? (
          <div className={styles.briefNotice}>
            Anda belum memiliki kewenangan untuk membuat sasaran strategis. Formulir berjalan dalam mode pratinjau kebutuhan tanpa penyimpanan langsung.
          </div>
        ) : null}
        {feedback ? <Alert message={feedback} title="Perhatian" variant="warning" /> : null}

        <FormSection title="Sasaran Strategis"><div className={styles.formGrid}><div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="obj-plan">Rencana Induk *</label>
            <select className={styles.formSelect} id="obj-plan" onChange={(e) => setPlanId(e.target.value)} required value={planId}>
              {plans.map((p) => (
                <option key={p.plan_id} value={p.plan_id}>{p.name} ({periodLabel(p.period)})</option>
              ))}
            </select>
          </div>
<div className={styles.formField}>
            <label htmlFor="obj-code">Kode Sasaran *</label>
            <input className={styles.formInput} id="obj-code" onChange={(e) => setCode(e.target.value)} placeholder="Contoh: SAS-01" required value={code} />
          </div>
<div className={styles.formField}>
            <label htmlFor="obj-name">Nama Sasaran *</label>
            <input className={styles.formInput} id="obj-name" onChange={(e) => setName(e.target.value)} required value={name} />
          </div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="obj-desc">Deskripsi</label>
            <textarea className={styles.formTextarea} id="obj-desc" onChange={(e) => setDescription(e.target.value)} rows={2} value={description} />
          </div></div></FormSection>
<FormSection title="Penanggung Jawab"><div className={styles.formGrid}><div className={styles.formField}>
            <label htmlFor="obj-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="obj-scope" onChange={(e) => setScopeType(e.target.value as BusinessScope["type"])} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>
<div className={styles.formField}><ExecutiveRolePicker id="obj-owner-role" session={session} workspaceId={workspace} value={ownerRole} onChange={setOwnerRole} /></div>
<div className={`${styles.formField} ${styles.formFullWidth}`}>
            <ExecutiveWorkspacePicker id="obj-workspace" onChange={value => { setWorkspace(value); setOwnerRole(""); }} session={session} value={workspace} />
          </div></div></FormSection>


        <div className={styles.formActions}>
          <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
          {canSubmit ? (
            <Button disabled={submitting} type="submit" variant="primary">
              {submitting ? "Menyimpan…" : "Simpan Sasaran"}
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
