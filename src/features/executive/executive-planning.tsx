"use client";

import { useEffect, useMemo, useState } from "react";

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
import type {
  BusinessTarget,
  CascadePreview,
  PlanningAssumption,
  StrategicObjective,
  StrategyBusinessPeriod as BusinessPeriod,
  StrategyBusinessScope as BusinessScope,
  StrategyPlan,
} from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import { corporateTargets, generateCanonicalId, periodLabel } from "./executive-model";
import styles from "./executive.module.css";

export interface ExecutivePlanningPageProps {
  readonly initialCandidates?: readonly ExtractedCandidate[];
  readonly initialProcessed?: boolean;
}

export function ExecutivePlanningPage({
  initialCandidates,
  initialProcessed,
}: ExecutivePlanningPageProps = {}) {
  return (
    <ExecutiveLayout>
      {() => (
        <PlanningContent
          initialCandidates={initialCandidates}
          initialProcessed={initialProcessed}
        />
      )}
    </ExecutiveLayout>
  );
}

function PlanningContent({
  initialCandidates,
  initialProcessed,
}: ExecutivePlanningPageProps) {
  const { data, error, loading } = useExecutiveStrategyData();
  const [tab, setTab] = useState("strategic");
  const [planFormType, setPlanFormType] = useState<"STRATEGIC_PLAN" | "OPERATING_PLAN" | null>(null);
  const [objectiveFormOpen, setObjectiveFormOpen] = useState(false);
  const [targetFormOpen, setTargetFormOpen] = useState(false);
  const [assumptionFormOpen, setAssumptionFormOpen] = useState(false);

  const tabs: readonly TabItem[] = useMemo(() => [
    { id: "strategic", label: "Renstra" },
    { id: "operating", label: "RKAP" },
    { id: "objectives", label: "Sasaran" },
    { id: "targets", label: "Target" },
    { id: "assumptions", label: "Asumsi" },
    { id: "cascade", label: "Cascade" },
    { id: "extraction", label: "Ekstraksi Dokumen" },
  ], []);

  const plans = data?.plans ?? [];
  const strategicPlans = plans.filter((plan) => plan.plan_type === "STRATEGIC_PLAN");
  const operatingPlans = plans.filter((plan) => plan.plan_type === "OPERATING_PLAN");
  const targets = corporateTargets(data?.targets ?? []);
  const assumptions = data?.assumptions ?? [];
  const authorizedActions = data?.authority?.authorized_actions ?? [];
  const canCreateCompanyPlan = authorizedActions.includes("CREATE_COMPANY_PLAN");

  return (
    <div className={styles.page}>
      <PageHeader
        description="Kelola dan telaah rencana strategis, sasaran korporasi, target terukur, asumsi perencanaan, cascade, serta ekstraksi dokumen."
        eyebrow="STRATEGI & KINERJA"
        title="Rencana & Target"
      />
      {error ? <Alert message={error} title="Data belum dapat dimuat." variant="warning" /> : null}
      <Tabs ariaLabel="Rencana dan target" items={tabs} onValueChange={setTab} value={tab} />

      {loading ? <LoadingState label="Memuat rencana dan target" variant="table" /> : null}

      {!loading && tab === "strategic" ? (
        <PlanSection
          actionLabel="Buat Renstra"
          canCreate={canCreateCompanyPlan}
          onOpenForm={() => setPlanFormType("STRATEGIC_PLAN")}
          plans={strategicPlans}
          title="Rencana Strategis (Renstra)"
        />
      ) : null}

      {!loading && tab === "operating" ? (
        <PlanSection
          actionLabel="Buat RKAP"
          canCreate={canCreateCompanyPlan}
          onOpenForm={() => setPlanFormType("OPERATING_PLAN")}
          plans={operatingPlans}
          title="Rencana Kerja dan Anggaran (RKAP)"
        />
      ) : null}

      {!loading && tab === "objectives" ? (
        <ObjectivesSection
          canCreate={canCreateCompanyPlan}
          onOpenForm={() => setObjectiveFormOpen(true)}
          plans={plans}
        />
      ) : null}

      {!loading && tab === "targets" ? (
        <TargetsSection
          canCreate={canCreateCompanyPlan}
          onOpenForm={() => setTargetFormOpen(true)}
          plans={plans}
          targets={targets}
        />
      ) : null}

      {!loading && tab === "assumptions" ? (
        <AssumptionsSection
          assumptions={assumptions}
          canCreate={canCreateCompanyPlan}
          onOpenForm={() => setAssumptionFormOpen(true)}
        />
      ) : null}

      {!loading && tab === "cascade" ? (
        <CascadeSection
          assumptions={assumptions}
          canCascade={canCreateCompanyPlan}
          targets={targets}
        />
      ) : null}

      {!loading && tab === "extraction" ? (
        <ExtractionSection
          initialCandidates={initialCandidates}
          initialProcessed={initialProcessed}
        />
      ) : null}

      {/* Form Drawers / Modals */}
      {planFormType ? (
        <PlanFormDrawer
          canSubmit={canCreateCompanyPlan}
          onClose={() => setPlanFormType(null)}
          planType={planFormType}
          strategicPlans={strategicPlans}
        />
      ) : null}

      {objectiveFormOpen ? (
        <ObjectiveFormDrawer
          canSubmit={canCreateCompanyPlan}
          onClose={() => setObjectiveFormOpen(false)}
          plans={plans}
        />
      ) : null}

      {targetFormOpen ? (
        <TargetFormDrawer
          canSubmit={canCreateCompanyPlan}
          onClose={() => setTargetFormOpen(false)}
          plans={plans}
        />
      ) : null}

      {assumptionFormOpen ? (
        <AssumptionFormDrawer
          canSubmit={canCreateCompanyPlan}
          onClose={() => setAssumptionFormOpen(false)}
        />
      ) : null}
    </div>
  );
}

// ============================================================
// 1. Plan Section & Form (Renstra & RKAP)
// ============================================================

interface PlanSectionProps {
  readonly title: string;
  readonly plans: readonly StrategyPlan[];
  readonly actionLabel: string;
  readonly canCreate: boolean;
  readonly onOpenForm: () => void;
}

function PlanSection({ title, plans, actionLabel, canCreate, onOpenForm }: PlanSectionProps) {
  return (
    <Section
      actions={canCreate ? <Button onClick={onOpenForm} size="sm" variant="primary">{actionLabel}</Button> : undefined}
      description="Data mengikuti kewenangan dan siklus hidup resmi Strategy."
      title={title}
    >
      <DataTable
        caption={title}
        columns={[
          { header: "Nama", key: "name", render: (plan) => plan.name },
          { header: "Periode", key: "period", render: (plan) => periodLabel(plan.period) },
          { header: "Penanggung Jawab", key: "owner", render: (plan) => plan.owner_role_ref || "—" },
          { header: "Status", key: "status", render: (plan) => <Status label={lifecycleLabel(plan.lifecycle_state)} variant="neutral" /> },
          { header: "Tingkat Kepentingan", key: "materiality", render: (plan) => materialityLabel(plan.materiality) },
          { header: "Versi", key: "version", render: (plan) => `v${plan.version}` },
          { header: "Pembaruan", key: "updated", render: (plan) => formatDate(plan.updated_at) },
        ]}
        getRowKey={(plan) => `${plan.plan_id}-${plan.version}`}
        rows={plans}
      />
    </Section>
  );
}

interface PlanFormProps {
  readonly planType: "STRATEGIC_PLAN" | "OPERATING_PLAN";
  readonly strategicPlans: readonly StrategyPlan[];
  readonly canSubmit: boolean;
  readonly onClose: () => void;
}

function PlanFormDrawer({ planType, strategicPlans, canSubmit, onClose }: PlanFormProps) {
  const isRenstra = planType === "STRATEGIC_PLAN";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("2026-01-01");
  const [endsAt, setEndsAt] = useState(isRenstra ? "2030-12-31" : "2026-12-31");
  const [granularity, setGranularity] = useState(isRenstra ? "ANNUAL" : "MONTHLY");
  const [label, setLabel] = useState("");
  const [parentPlanId, setParentPlanId] = useState(strategicPlans[0]?.plan_id ?? "");
  const [scopeType, setScopeType] = useState("COMPANY");
  const [ownerWorkspace, setOwnerWorkspace] = useState("");
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
          starts_at: `${startsAt}T00:00:00Z`,
          ends_at: `${endsAt}T23:59:59Z`,
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

  return (
    <Drawer
      description={isRenstra ? "Formulir penyusunan Rencana Strategis jangka panjang." : "Formulir penyusunan RKAP tahunan mengacu pada Renstra induk."}
      onClose={onClose}
      open
      title={isRenstra ? "Formulir Renstra" : "Formulir RKAP"}
    >
      <form onSubmit={handleSubmit}>
        {!canSubmit ? (
          <div className={styles.briefNotice}>
            Anda belum memiliki kewenangan untuk membuat rencana perusahaan. Formulir ditampilkan dalam mode peninjauan kebutuhan tanpa penyimpanan langsung.
          </div>
        ) : null}
        {feedback ? <Alert message={feedback} title="Perhatian" variant="warning" /> : null}

        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.formFullWidth}`}>
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
            <label htmlFor="plan-granularity">Granularitas *</label>
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
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="plan-scope" onChange={(e) => setScopeType(e.target.value)} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-materiality">Tingkat Kepentingan *</label>
            <select className={styles.formSelect} id="plan-materiality" onChange={(e) => setMateriality(e.target.value as "MATERIAL")} value={materiality}>
              <option value="MATERIAL">Material (Strategis)</option>
              <option value="NON_MATERIAL">Non-Material (Operasional)</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-owner-workspace">Ruang Kerja Penanggung Jawab *</label>
            <input className={styles.formInput} id="plan-owner-workspace" onChange={(e) => setOwnerWorkspace(e.target.value)} placeholder="ID Ruang Kerja" required value={ownerWorkspace} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-owner-role">Peran Penanggung Jawab *</label>
            <input className={styles.formInput} id="plan-owner-role" onChange={(e) => setOwnerRole(e.target.value)} placeholder="Peran / Jabatan" required value={ownerRole} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-source">Sumber Referensi</label>
            <input className={styles.formInput} id="plan-source" onChange={(e) => setSource(e.target.value)} placeholder="Referensi dokumen / SK" value={source} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-evidence">Bukti Pendukung</label>
            <input className={styles.formInput} id="plan-evidence" onChange={(e) => setEvidence(e.target.value)} placeholder="ID dokumen bukti" value={evidence} />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
          {canSubmit ? (
            <Button disabled={submitting} type="submit" variant="primary">
              {submitting ? "Menyimpan…" : "Simpan Draf"}
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
// 2. Objectives Section & Form (Sasaran)
// ============================================================

interface ObjectivesSectionProps {
  readonly plans: readonly StrategyPlan[];
  readonly canCreate: boolean;
  readonly onOpenForm: () => void;
}

function ObjectivesSection({ plans, canCreate, onOpenForm }: ObjectivesSectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.plan_id ?? "");
  const [objectives, setObjectives] = useState<readonly StrategicObjective[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPlanId) return;
    let active = true;
    strategyApi.listObjectives(selectedPlanId)
      .then((data) => {
        if (active) setObjectives(data);
      })
      .catch(() => {
        if (active) setObjectives([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedPlanId]);

  const selectedPlan = plans.find((p) => p.plan_id === selectedPlanId);

  return (
    <Section
      actions={canCreate ? <Button onClick={onOpenForm} size="sm" variant="primary">Tambah Sasaran</Button> : undefined}
      description="Sasaran strategis diturunkan langsung dari rencana induk."
      title="Sasaran Strategis"
    >
      <div style={{ marginBottom: "var(--alos-space-4)", maxWidth: "320px" }}>
        <label htmlFor="filter-plan-obj" style={{ display: "block", fontSize: "12px", marginBottom: "var(--alos-space-1)" }}>
          Pilih Rencana:
        </label>
        <select
          className={styles.formSelect}
          id="filter-plan-obj"
          onChange={(e) => {
            setSelectedPlanId(e.target.value);
            setLoading(true);
          }}
          value={selectedPlanId}
        >
          {plans.map((p) => (
            <option key={p.plan_id} value={p.plan_id}>{p.name} ({periodLabel(p.period)})</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingState label="Memuat sasaran strategis" variant="table" /> : null}

      <DataTable
        caption="Daftar sasaran strategis"
        columns={[
          { header: "Kode", key: "code", render: (item) => item.code },
          { header: "Nama Sasaran", key: "name", render: (item) => item.name },
          { header: "Rencana", key: "plan", render: () => selectedPlan?.name ?? "—" },
          { header: "Ruang Lingkup", key: "scope", render: (item) => item.scope.label ?? item.scope.type },
          { header: "Penanggung Jawab", key: "owner", render: (item) => item.owner_role_ref || "—" },
          { header: "Status", key: "status", render: (item) => <Status label={lifecycleLabel(item.lifecycle_state)} variant="neutral" /> },
        ]}
        getRowKey={(item) => `${item.objective_id}-${item.version}`}
        rows={objectives}
      />
    </Section>
  );
}

function ObjectiveFormDrawer({ plans, canSubmit, onClose }: Readonly<{ plans: readonly StrategyPlan[]; canSubmit: boolean; onClose: () => void }>) {
  const [planId, setPlanId] = useState(plans[0]?.plan_id ?? "");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [scopeType, setScopeType] = useState("COMPANY");
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

        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.formFullWidth}`}>
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
          </div>

          <div className={styles.formField}>
            <label htmlFor="obj-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="obj-scope" onChange={(e) => setScopeType(e.target.value)} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="obj-owner-role">Peran Penanggung Jawab *</label>
            <input className={styles.formInput} id="obj-owner-role" onChange={(e) => setOwnerRole(e.target.value)} placeholder="Peran / Jabatan" required value={ownerRole} />
          </div>

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="obj-workspace">Ruang Kerja Penanggung Jawab *</label>
            <input className={styles.formInput} id="obj-workspace" onChange={(e) => setWorkspace(e.target.value)} placeholder="ID Ruang Kerja" required value={workspace} />
          </div>
        </div>

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

// ============================================================
// 3. Targets Section & Multi-step Form (Target & Observasi TARGET)
// ============================================================

interface TargetsSectionProps {
  readonly plans: readonly StrategyPlan[];
  readonly targets: readonly BusinessTarget[];
  readonly canCreate: boolean;
  readonly onOpenForm: () => void;
}

function TargetsSection({ plans, targets, canCreate, onOpenForm }: TargetsSectionProps) {
  return (
    <Section
      actions={canCreate ? <Button onClick={onOpenForm} size="sm" variant="primary">Tambah Target</Button> : undefined}
      description="Nilai target dicatat sebagai observasi TARGET tersendiri, terpisah dari metadata target."
      title="Target Kinerja"
    >
      <DataTable
        caption="Target perusahaan"
        columns={[
          { header: "Kode", key: "code", render: (target) => target.code },
          { header: "Nama", key: "name", render: (target) => target.name },
          {
            header: "Rencana",
            key: "plan",
            render: (target) => plans.find((p) => p.plan_id === target.plan_ref.id)?.name ?? "Rencana Terkait",
          },
          { header: "Ruang Lingkup", key: "scope", render: (target) => target.scope.label ?? target.scope.type },
          { header: "Penanggung Jawab", key: "owner", render: (target) => target.owner_role_ref || "—" },
          { header: "Status", key: "status", render: (target) => <Status label={lifecycleLabel(target.lifecycle_state)} variant="neutral" /> },
        ]}
        getRowKey={(target) => target.target_id}
        rows={targets}
      />
    </Section>
  );
}

function TargetFormDrawer({ plans, canSubmit, onClose }: Readonly<{ plans: readonly StrategyPlan[]; canSubmit: boolean; onClose: () => void }>) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Metadata
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.plan_id ?? "");
  const [metricCode, setMetricCode] = useState("METRIC_PRIMARY");
  const [kpiDef, setKpiDef] = useState("");
  const [scopeType, setScopeType] = useState("COMPANY");
  const [startsAt, setStartsAt] = useState("2026-01-01");
  const [endsAt, setEndsAt] = useState("2026-12-31");
  const [measurementType, setMeasurementType] = useState("HIGHER_IS_BETTER");
  const [unit, setUnit] = useState("IDR");
  const [ownerWorkspace, setOwnerWorkspace] = useState("");
  const [ownerRole, setOwnerRole] = useState("");
  const [materiality, setMateriality] = useState<"MATERIAL" | "NON_MATERIAL">("MATERIAL");
  const [source, setSource] = useState("");
  const [evidence, setEvidence] = useState("");

  // Step 2: Observation TARGET
  const [targetValue, setTargetValue] = useState("");
  const [sourceMode, setSourceMode] = useState<"MANUAL_EVIDENCED" | "SOURCE_LINKED">("SOURCE_LINKED");
  const [targetEvidence, setTargetEvidence] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !planId || !metricCode.trim() || !ownerWorkspace.trim() || !ownerRole.trim()) {
      setFeedback("Mohon lengkapi seluruh field wajib metadata target, termasuk penanggung jawab.");
      return;
    }
    setFeedback(null);
    setStep(2);
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetValue.trim()) {
      setFeedback("Nilai target wajib diisi.");
      return;
    }

    if (!canSubmit) {
      setFeedback("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const selectedPlan = plans.find((p) => p.plan_id === planId);
      const generatedTargetId = generateCanonicalId("target");
      const generatedObservationId = generateCanonicalId("obs");
      const period: BusinessPeriod = {
        granularity: "ANNUAL",
        starts_at: `${startsAt}T00:00:00Z`,
        ends_at: `${endsAt}T23:59:59Z`,
      };

      // 1. Create Target Metadata
      await strategyApi.createTarget({
        target_id: generatedTargetId,
        version: 1,
        code,
        name,
        description: description || null,
        plan_ref: { id: selectedPlan?.plan_id ?? planId, version: selectedPlan?.version ?? 1 },
        objective_ref: null,
        metric_code: metricCode,
        measurement_type: measurementType,
        unit,
        period,
        scope: { type: scopeType, ref: null, label: scopeType === "COMPANY" ? "Korporasi" : null },
        owner_workspace_id: ownerWorkspace,
        owner_role_ref: ownerRole,
        materiality,
        source_refs: source ? [source] : [],
        evidence_refs: evidence ? [evidence] : [],
      });

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
        source_ref: source || null,
        observed_at: new Date().toISOString(),
        verification_state: "UNVERIFIED",
        evidence_refs: targetEvidence ? [targetEvidence] : [],
      });

      onClose();
    } catch {
      setFeedback("Gagal menyimpan target kinerja. Silakan periksa kembali kelengkapan data.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer description="Pendaftaran target mencakup metadata target dan pencatatan nilai target terukur." onClose={onClose} open title="Formulir Target Kinerja">
      <div className={styles.stepBar}>
        <span className={`${styles.stepItem} ${step === 1 ? styles.stepActive : styles.stepMuted}`}>
          <strong>Langkah 1:</strong> Metadata Target
        </span>
        <span>→</span>
        <span className={`${styles.stepItem} ${step === 2 ? styles.stepActive : styles.stepMuted}`}>
          <strong>Langkah 2:</strong> Nilai Target (Observasi)
        </span>
      </div>

      {!canSubmit ? (
        <div className={styles.briefNotice}>
          Anda belum memiliki kewenangan untuk membuat target kinerja. Formulir berjalan dalam mode pratinjau kebutuhan tanpa penyimpanan langsung.
        </div>
      ) : null}
      {feedback ? <Alert message={feedback} title="Perhatian" variant="warning" /> : null}

      {step === 1 ? (
        <form onSubmit={handleNextStep}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
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
                {plans.map((p) => (
                  <option key={p.plan_id} value={p.plan_id}>{p.name} ({periodLabel(p.period)})</option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-metric">Kode Metrik *</label>
              <input className={styles.formInput} id="tgt-metric" onChange={(e) => setMetricCode(e.target.value)} required value={metricCode} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-kpi">Definisi KPI</label>
              <input className={styles.formInput} id="tgt-kpi" onChange={(e) => setKpiDef(e.target.value)} placeholder="Opsional" value={kpiDef} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-measure">Cara Pengukuran *</label>
              <select className={styles.formSelect} id="tgt-measure" onChange={(e) => setMeasurementType(e.target.value)} value={measurementType}>
                <option value="HIGHER_IS_BETTER">Makin Tinggi Makin Baik</option>
                <option value="LOWER_IS_BETTER">Makin Rendah Makin Baik</option>
                <option value="EXACT">Tepat Sesuai Angka</option>
                <option value="PERCENTAGE">Persentase</option>
                <option value="RATIO">Rasio</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-unit">Satuan (Unit) *</label>
              <select className={styles.formSelect} id="tgt-unit" onChange={(e) => setUnit(e.target.value)} value={unit}>
                <option value="IDR">IDR (Rupiah)</option>
                <option value="COUNT">Jumlah (Count)</option>
                <option value="PERCENT">Persentase (%)</option>
                <option value="RATIO">Rasio</option>
                <option value="SCORE">Skor</option>
                <option value="UNIT">Unit</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-scope">Ruang Lingkup *</label>
              <select className={styles.formSelect} id="tgt-scope" onChange={(e) => setScopeType(e.target.value)} value={scopeType}>
                <option value="COMPANY">Korporasi</option>
                <option value="DIVISION">Divisi</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-materiality">Tingkat Kepentingan *</label>
              <select className={styles.formSelect} id="tgt-materiality" onChange={(e) => setMateriality(e.target.value as "MATERIAL")} value={materiality}>
                <option value="MATERIAL">Material</option>
                <option value="NON_MATERIAL">Non-Material</option>
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

            <div className={styles.formField}>
              <label htmlFor="tgt-owner-ws">Ruang Kerja Penanggung Jawab *</label>
              <input className={styles.formInput} id="tgt-owner-ws" onChange={(e) => setOwnerWorkspace(e.target.value)} placeholder="ID Ruang Kerja" required value={ownerWorkspace} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-owner-role">Peran Penanggung Jawab *</label>
              <input className={styles.formInput} id="tgt-owner-role" onChange={(e) => setOwnerRole(e.target.value)} placeholder="Peran / Jabatan" required value={ownerRole} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-source">Sumber Referensi</label>
              <input className={styles.formInput} id="tgt-source" onChange={(e) => setSource(e.target.value)} placeholder="Contoh: Dokumen Renstra" value={source} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-evidence">Bukti Dokumen</label>
              <input className={styles.formInput} id="tgt-evidence" onChange={(e) => setEvidence(e.target.value)} placeholder="Contoh: Bukti Pengesahan" value={evidence} />
            </div>

            <div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="tgt-desc">Deskripsi</label>
              <textarea className={styles.formTextarea} id="tgt-desc" onChange={(e) => setDescription(e.target.value)} rows={2} value={description} />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
            <Button type="submit" variant="primary">Lanjut: Nilai Target →</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit}>
          <div className={styles.briefNotice} style={{ marginBottom: "var(--alos-space-4)" }}>
            Nilai target dicatat sebagai observasi nilai target tersendiri dan tidak disimpan langsung ke metadata target.
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="tgt-val">Nilai Target *</label>
              <input className={styles.formInput} id="tgt-val" onChange={(e) => setTargetValue(e.target.value)} placeholder="0.00" required type="number" value={targetValue} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-val-unit">Satuan (Unit)</label>
              <input className={styles.formInput} disabled id="tgt-val-unit" value={unit} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-source-mode">Mode Sumber *</label>
              <select className={styles.formSelect} id="tgt-source-mode" onChange={(e) => setSourceMode(e.target.value as "SOURCE_LINKED")} value={sourceMode}>
                <option value="SOURCE_LINKED">Terhubung ke Sumber Resmi</option>
                <option value="MANUAL_EVIDENCED">Diisi Manual dengan Bukti</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-val-evidence">Bukti / Referensi Sumber</label>
              <input className={styles.formInput} id="tgt-val-evidence" onChange={(e) => setTargetEvidence(e.target.value)} placeholder="ID Rujukan atau tautan bukti" value={targetEvidence} />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button onClick={() => setStep(1)} type="button" variant="ghost">← Kembali</Button>
            {canSubmit ? (
              <Button disabled={submitting} type="submit" variant="primary">
                {submitting ? "Menyimpan…" : "Simpan Target & Nilai"}
              </Button>
            ) : (
              <div className={styles.briefNotice}>
                Anda belum memiliki kewenangan untuk melakukan tindakan ini.
              </div>
            )}
          </div>
        </form>
      )}
    </Drawer>
  );
}

// ============================================================
// 4. Assumptions Section & Form
// ============================================================

interface AssumptionsSectionProps {
  readonly assumptions: readonly PlanningAssumption[];
  readonly canCreate: boolean;
  readonly onOpenForm: () => void;
}

function AssumptionsSection({ assumptions, canCreate, onOpenForm }: AssumptionsSectionProps) {
  return (
    <Section
      actions={canCreate ? <Button onClick={onOpenForm} size="sm" variant="primary">Tambah Asumsi</Button> : undefined}
      description="Asumsi perencanaan digunakan sebagai parameter input kalkulasi cascade strategi."
      title="Asumsi Perencanaan"
    >
      <DataTable
        caption="Asumsi perencanaan"
        columns={[
          { header: "Nama", key: "name", render: (item) => item.name },
          { header: "Kategori", key: "category", render: (item) => assumptionCategoryLabel(item.category) },
          { header: "Nilai", key: "value", render: (item) => item.value ?? "—" },
          { header: "Satuan", key: "unit", render: (item) => item.unit },
          { header: "Ruang Lingkup", key: "scope", render: (item) => item.scope.label ?? item.scope.type },
          { header: "Status", key: "status", render: (item) => <Status label={lifecycleLabel(item.lifecycle_state)} variant="neutral" /> },
          { header: "Verifikasi", key: "verification", render: (item) => verificationLabel(item.verification_state) },
        ]}
        getRowKey={(item) => `${item.assumption_id}-${item.version}`}
        rows={assumptions}
      />
    </Section>
  );
}

function AssumptionFormDrawer({ canSubmit, onClose }: Readonly<{ canSubmit: boolean; onClose: () => void }>) {
  const [category, setCategory] = useState("AVERAGE_SELLING_PRICE");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("IDR");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [granularity, setGranularity] = useState("ANNUAL");
  const [scopeType, setScopeType] = useState("COMPANY");
  const [ownerWorkspace, setOwnerWorkspace] = useState("");
  const [ownerRole, setOwnerRole] = useState("");
  const [sourceMode, setSourceMode] = useState<"MANUAL_EVIDENCED" | "SOURCE_LINKED">("MANUAL_EVIDENCED");
  const [sourceRef, setSourceRef] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("");
  const [verificationState, setVerificationState] = useState("UNVERIFIED");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setFeedback("Nama asumsi wajib diisi."); return; }
    if (!value.trim()) { setFeedback("Nilai asumsi wajib diisi."); return; }

    const numValue = Number(value);
    if (unit === "RATIO" && (numValue < 0 || numValue > 1)) {
      setFeedback("Nilai rasio harus berada dalam rentang 0 hingga 1.");
      return;
    }

    if (!startsAt || !endsAt) { setFeedback("Periode mulai dan selesai wajib ditentukan."); return; }
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
      const generatedAssumptionId = generateCanonicalId("asm");
      await strategyApi.createAssumption({
        assumption_id: generatedAssumptionId,
        version: 1,
        name,
        category,
        value: numValue,
        unit,
        period: {
          granularity: granularity as BusinessPeriod["granularity"],
          starts_at: `${startsAt}T00:00:00Z`,
          ends_at: `${endsAt}T23:59:59Z`,
        },
        scope: { type: scopeType, ref: null, label: scopeType === "COMPANY" ? "Korporasi" : null },
        source_mode: sourceMode,
        source_ref: sourceRef || null,
        evidence_refs: evidenceRef ? [evidenceRef] : [],
        verification_state: verificationState,
        owner_role_ref: ownerRole,
        owner_workspace_id: ownerWorkspace,
        description: description || null,
      });
      onClose();
    } catch {
      setFeedback("Gagal menyimpan asumsi perencanaan. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer description="Tambah asumsi baru untuk perhitungan cascade strategi." onClose={onClose} open title="Formulir Asumsi">
      <form onSubmit={handleSubmit}>
        {!canSubmit ? (
          <div className={styles.briefNotice}>
            Anda belum memiliki kewenangan untuk membuat asumsi perencanaan. Formulir berjalan dalam mode pratinjau kebutuhan tanpa penyimpanan langsung.
          </div>
        ) : null}
        {feedback ? <Alert message={feedback} title="Perhatian" variant="warning" /> : null}

        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="asm-cat">Kategori *</label>
            <select className={styles.formSelect} id="asm-cat" onChange={(e) => setCategory(e.target.value)} value={category}>
              <option value="AVERAGE_SELLING_PRICE">Harga Jual Rata-rata (Average Selling Price)</option>
              <option value="CONVERSION_RATIO">Rasio Konversi (Conversion Ratio)</option>
              <option value="EXPECTED_CPL">Perkiraan Biaya per Prospek (Expected CPL)</option>
              <option value="AVAILABLE_INVENTORY">Inventaris Tersedia (Available Inventory)</option>
              <option value="MARKETING_BUDGET">Anggaran Pemasaran (Marketing Budget)</option>
              <option value="TEAM_CAPACITY">Kapasitas Tim (Team Capacity)</option>
              <option value="CUSTOM">Khusus (Custom)</option>
            </select>
          </div>

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="asm-name">Nama Asumsi *</label>
            <input className={styles.formInput} id="asm-name" onChange={(e) => setName(e.target.value)} required value={name} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-unit">Satuan (Unit) *</label>
            <select className={styles.formSelect} id="asm-unit" onChange={(e) => setUnit(e.target.value)} value={unit}>
              <option value="IDR">IDR (Rupiah)</option>
              <option value="COUNT">Jumlah (Count)</option>
              <option value="PERCENT">Persentase (%)</option>
              <option value="RATIO">Rasio (0.00 – 1.00)</option>
              <option value="SCORE">Skor</option>
              <option value="UNIT">Unit</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-val">Nilai * {unit === "RATIO" ? "(Rentang 0.00 – 1.00)" : ""}</label>
            <input className={styles.formInput} id="asm-val" onChange={(e) => setValue(e.target.value)} required step={unit === "RATIO" ? "0.01" : "1"} type="number" value={value} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-start">Periode Mulai *</label>
            <input className={styles.formInput} id="asm-start" onChange={(e) => setStartsAt(e.target.value)} required type="date" value={startsAt} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-end">Periode Selesai *</label>
            <input className={styles.formInput} id="asm-end" onChange={(e) => setEndsAt(e.target.value)} required type="date" value={endsAt} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-granularity">Granularitas *</label>
            <select className={styles.formSelect} id="asm-granularity" onChange={(e) => setGranularity(e.target.value)} value={granularity}>
              <option value="ANNUAL">Tahunan</option>
              <option value="QUARTERLY">Triwulan</option>
              <option value="MONTHLY">Bulanan</option>
              <option value="CUSTOM">Khusus</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-source-mode">Mode Sumber *</label>
            <select className={styles.formSelect} id="asm-source-mode" onChange={(e) => setSourceMode(e.target.value as "MANUAL_EVIDENCED")} value={sourceMode}>
              <option value="MANUAL_EVIDENCED">Diisi Manual dengan Bukti</option>
              <option value="SOURCE_LINKED">Terhubung ke Sumber Resmi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-verify">Status Verifikasi *</label>
            <select className={styles.formSelect} id="asm-verify" onChange={(e) => setVerificationState(e.target.value)} value={verificationState}>
              <option value="UNVERIFIED">Belum Diverifikasi</option>
              <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-source">Referensi Sumber</label>
            <input className={styles.formInput} id="asm-source" onChange={(e) => setSourceRef(e.target.value)} placeholder="Tautan / nomor rujukan" value={sourceRef} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-evidence">Referensi Bukti</label>
            <input className={styles.formInput} id="asm-evidence" onChange={(e) => setEvidenceRef(e.target.value)} placeholder="ID dokumen bukti" value={evidenceRef} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="asm-scope" onChange={(e) => setScopeType(e.target.value)} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-owner-ws">Ruang Kerja Penanggung Jawab *</label>
            <input className={styles.formInput} id="asm-owner-ws" onChange={(e) => setOwnerWorkspace(e.target.value)} placeholder="ID Ruang Kerja" required value={ownerWorkspace} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-owner-role">Peran Penanggung Jawab *</label>
            <input className={styles.formInput} id="asm-owner-role" onChange={(e) => setOwnerRole(e.target.value)} placeholder="Peran / Jabatan" required value={ownerRole} />
          </div>

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <label htmlFor="asm-desc">Deskripsi</label>
            <textarea className={styles.formTextarea} id="asm-desc" onChange={(e) => setDescription(e.target.value)} rows={2} value={description} />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
          {canSubmit ? (
            <Button disabled={submitting} type="submit" variant="primary">
              {submitting ? "Menyimpan…" : "Simpan Asumsi"}
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
// 5. Cascade UI (Target Utama → Aturan → Asumsi → Constraints → Preview → Accept)
// ============================================================

interface CascadeSectionProps {
  readonly targets: readonly BusinessTarget[];
  readonly assumptions: readonly PlanningAssumption[];
  readonly canCascade?: boolean;
}

function CascadeSection({ targets, assumptions, canCascade = false }: CascadeSectionProps) {
  const [rootTargetId, setRootTargetId] = useState(targets[0]?.target_id ?? "");
  const [ruleType, setRuleType] = useState<"SPLIT_PERCENT" | "SPLIT_FIXED" | "DIRECT" | "RATIO_MULTIPLY">("SPLIT_PERCENT");
  const [ratioInput, setRatioInput] = useState("0.5");
  const [fixedAllocation, setFixedAllocation] = useState("");
  const [outputTargetId, setOutputTargetId] = useState("");
  const [selectedAssumptionId, setSelectedAssumptionId] = useState(assumptions[0]?.assumption_id ?? "");
  const [previewData, setPreviewData] = useState<CascadePreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedTarget = targets.find((t) => t.target_id === rootTargetId);

  async function handlePreview() {
    if (!rootTargetId) {
      setErrorMsg("Pilih target utama terlebih dahulu.");
      return;
    }
    if (!canCascade) {
      setErrorMsg("Anda belum memiliki kewenangan untuk melakukan tindakan ini.");
      return;
    }

    const derivedTargetId = outputTargetId.trim() || generateCanonicalId("target");
    const ruleId = generateCanonicalId("rule");

    const parameters: Record<string, unknown> = {};
    if (ruleType === "SPLIT_PERCENT" || ruleType === "RATIO_MULTIPLY") {
      const parsedRatio = Number(ratioInput);
      if (Number.isNaN(parsedRatio) || parsedRatio < 0 || parsedRatio > 1) {
        setErrorMsg("Nilai rasio harus berupa angka valid antara 0.00 hingga 1.00.");
        return;
      }
      parameters.ratio = parsedRatio;
      parameters.allocations = [{ target_id: derivedTargetId, share: parsedRatio }];
    } else if (ruleType === "SPLIT_FIXED") {
      const parsedVal = Number(fixedAllocation);
      if (Number.isNaN(parsedVal) || parsedVal <= 0) {
        setErrorMsg("Nilai alokasi tetap harus diisi dengan angka positif.");
        return;
      }
      parameters.value = parsedVal;
    }

    setPreviewing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        root_target_ref: {
          target_id: selectedTarget?.target_id ?? rootTargetId,
          version: selectedTarget?.version ?? 1,
        },
        rules: [
          {
            cascade_rule_id: ruleId,
            rule_type: ruleType,
            output_target_refs: [{ target_id: derivedTargetId }],
            parameters,
          },
        ],
        rule_inputs: {},
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
    canCascade
  );

  async function handleAccept() {
    if (!previewData || !canAccept) return;
    setAccepting(true);
    setErrorMsg(null);
    try {
      await strategyApi.acceptCascade(previewData.cascade_run_id, previewData.derived_targets);
      setSuccessMsg("Hasil cascade berhasil diterima dan target turunan didaftarkan.");
    } catch {
      setErrorMsg("Tindakan penerimaan cascade belum dapat diselesaikan.");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <Section description="Penurunan target korporasi ke unit turunan melalui perhitungan terarah dan tata kelola resmi." title="Cascade Target">
      {errorMsg ? <Alert message={errorMsg} title="Perhatian" variant="warning" /> : null}
      {successMsg ? <Alert message={successMsg} title="Sukses" variant="success" /> : null}

      <div className={styles.cascadeFlow}>
        <div className={styles.cascadeStep}>
          <div className={styles.briefHeader} style={{ marginBottom: "var(--alos-space-3)" }}>
            <h3>Alur Penurunan: Target Utama → Aturan Cascade → Asumsi → Pembatas (Constraints) → Pratinjau</h3>
          </div>
          <div className={styles.formGrid}>
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
              </select>
            </div>

            {ruleType === "SPLIT_PERCENT" || ruleType === "RATIO_MULTIPLY" ? (
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

            {ruleType === "SPLIT_FIXED" ? (
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
              <label htmlFor="cas-target-derived">Target Turunan (Opsional)</label>
              <input
                className={styles.formInput}
                id="cas-target-derived"
                onChange={(e) => setOutputTargetId(e.target.value)}
                placeholder="ID Target Turunan (kosongkan untuk otomatis)"
                value={outputTargetId}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="cas-asm">Asumsi yang Digunakan</label>
              <select className={styles.formSelect} id="cas-asm" onChange={(e) => setSelectedAssumptionId(e.target.value)} value={selectedAssumptionId}>
                <option value="">Tanpa Asumsi Tambahan</option>
                {assumptions.map((a) => (
                  <option key={a.assumption_id} value={a.assumption_id}>{a.name} ({a.value ?? "—"} {a.unit})</option>
                ))}
              </select>
            </div>

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
                Target Asal: <strong>{selectedTarget?.name ?? previewData.root_target_ref.id}</strong> (v{previewData.root_target_ref.version})
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
                    onClick={handleAccept}
                    variant="primary"
                  >
                    {accepting ? "Menerapkan…" : "Terapkan Cascade"}
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

// ============================================================
// 6. Document Extraction UX & Review Candidate Experience
// ============================================================

export interface ExtractedCandidate {
  readonly id: string;
  readonly fieldName: string;
  value: string;
  status: "TERIMA" | "EDIT" | "ABAIKAN" | "PERLU_DIPERIKSA";
  readonly sourceText: string;
  readonly anchor: string;
  readonly required: boolean;
}

export interface ExtractionSectionProps {
  readonly initialCandidates?: readonly ExtractedCandidate[];
  readonly initialProcessed?: boolean;
}

export function ExtractionSection({ initialCandidates = [], initialProcessed = false }: ExtractionSectionProps) {
  const [sourceType, setSourceType] = useState<"EXISTING" | "UPLOAD">("EXISTING");
  const [versionRef, setVersionRef] = useState("");
  const [extractionType, setExtractionType] = useState("STRATEGY_PLAN");
  const [processed, setProcessed] = useState(initialProcessed);
  const [candidates, setCandidates] = useState<ExtractedCandidate[]>([...initialCandidates]);
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleCandidateAction(id: string, action: "TERIMA" | "EDIT" | "ABAIKAN") {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: action } : c)),
    );
  }

  function handleCandidateValueChange(id: string, nextVal: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value: nextVal, status: "EDIT" } : c)),
    );
  }

  const missingRequired = candidates.filter(
    (c) => c.required && (c.status === "ABAIKAN" || c.status === "PERLU_DIPERIKSA" || !c.value.trim()),
  );

  return (
    <Section description="Alur ekstraksi terpandu: Dokumen & Versi yang Tetap → Jenis Ekstraksi → Proses → Telaah Kandidat → Simpan Draf." title="Ekstraksi Dokumen Strategi">
      {feedback ? <Alert message={feedback} title="Status Ekstraksi" variant={missingRequired.length > 0 ? "warning" : "success"} /> : null}

      {!processed ? (
        <div className={styles.cascadeStep}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="ext-src-type">Sumber Dokumen *</label>
              <select className={styles.formSelect} id="ext-src-type" onChange={(e) => setSourceType(e.target.value as "EXISTING")} value={sourceType}>
                <option value="EXISTING">Dokumen Resmi yang Tersedia</option>
                <option value="UPLOAD">Unggah Dokumen Baru</option>
              </select>
            </div>

            {sourceType === "EXISTING" ? (
              <div className={styles.formField}>
                <label htmlFor="ext-doc-id">Dokumen Terpilih *</label>
                <select className={styles.formSelect} disabled id="ext-doc-id" value="">
                  <option value="">Dokumen belum tersedia untuk dipilih.</option>
                </select>
                <p style={{ fontSize: "12px", color: "var(--alos-text-secondary)", margin: "var(--alos-space-1) 0 0" }}>
                  Dokumen belum tersedia untuk dipilih.
                </p>
              </div>
            ) : (
              <div className={`${styles.formField} ${styles.formFullWidth}`}>
                <div className={styles.briefNotice}>
                  Layanan pengunggahan dokumen belum terhubung.
                </div>
              </div>
            )}

            <div className={styles.formField}>
              <label htmlFor="ext-ver">Referensi Versi Dokumen *</label>
              <input
                className={styles.formInput}
                id="ext-ver"
                onChange={(e) => setVersionRef(e.target.value)}
                placeholder="Contoh: Versi 1.0 (Dokumen Tetap)"
                value={versionRef}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="ext-type">Jenis Ekstraksi *</label>
              <select className={styles.formSelect} id="ext-type" onChange={(e) => setExtractionType(e.target.value)} value={extractionType}>
                <option value="STRATEGY_PLAN">Rencana Strategis & RKAP</option>
                <option value="TARGET_KPI">Target Kinerja & KPI</option>
                <option value="ASSUMPTIONS">Asumsi Perencanaan</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions} style={{ marginTop: "var(--alos-space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--alos-space-3)" }}>
              <Button disabled variant="primary">Proses Ekstraksi</Button>
              <span style={{ fontSize: "12px", color: "var(--alos-text-secondary)" }}>
                Ekstraksi dokumen belum tersedia.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.briefHeader} style={{ marginBottom: "var(--alos-space-4)" }}>
            <h3>Telaah Kandidat Ekstraksi</h3>
            <Button onClick={() => setProcessed(false)} size="sm" variant="ghost">Ganti Dokumen</Button>
          </div>

          <div className={styles.extractionSplit}>
            {/* Desktop Left: Document Viewer */}
            <div className={styles.docViewer}>
              <div className={styles.briefHeader} style={{ marginBottom: "var(--alos-space-3)" }}>
                <h4>Dokumen Sumber</h4>
              </div>
              <EmptyState
                description="Pilih dokumen resmi yang terverifikasi untuk menampilkan isi dokumen."
                title="Pratinjau dokumen belum tersedia."
              />
            </div>

            {/* Desktop Right: Candidate Fields with Actions */}
            <div className={styles.candidateList}>
              <div className={styles.briefNotice}>
                Dilarang langsung menetapkan hasil ekstraksi sebagai aktif. Seluruh kandidat wajib ditelaah secara tertib.
              </div>

              {candidates.length === 0 ? (
                <EmptyState
                  description="Hasil pembacaan dokumen akan ditampilkan di sini setelah proses ekstraksi terhubung."
                  title="Belum ada kandidat ekstraksi."
                />
              ) : (
                candidates.map((c) => (
                  <div className={styles.candidateCard} key={c.id}>
                    <div className={styles.candidateRow}>
                      <strong>{c.fieldName} {c.required ? "*" : ""}</strong>
                      <Status
                        label={
                          c.status === "PERLU_DIPERIKSA"
                            ? "Perlu Diperiksa"
                            : c.status === "TERIMA"
                              ? "Diterima"
                              : c.status === "EDIT"
                                ? "Diedit"
                                : "Diabaikan"
                        }
                        variant={
                          c.status === "PERLU_DIPERIKSA"
                            ? "warning"
                            : c.status === "ABAIKAN"
                              ? "danger"
                              : "success"
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor={`cand-${c.id}`} style={{ display: "block", fontSize: "11px", color: "var(--alos-text-muted)" }}>
                        Nilai Kandidat:
                      </label>
                      <input
                        className={styles.formInput}
                        id={`cand-${c.id}`}
                        onChange={(e) => handleCandidateValueChange(c.id, e.target.value)}
                        value={c.value}
                      />
                    </div>

                    <p style={{ color: "var(--alos-text-muted)", fontSize: "11px", margin: 0 }}>
                      Sumber: &quot;{c.sourceText}&quot; ({c.anchor})
                    </p>

                    <div className={styles.formActions} style={{ marginTop: "var(--alos-space-2)" }}>
                      <Button onClick={() => handleCandidateAction(c.id, "TERIMA")} size="sm" variant={c.status === "TERIMA" ? "primary" : "ghost"}>
                        Terima
                      </Button>
                      <Button onClick={() => handleCandidateAction(c.id, "EDIT")} size="sm" variant={c.status === "EDIT" ? "primary" : "ghost"}>
                        Edit
                      </Button>
                      <Button onClick={() => handleCandidateAction(c.id, "ABAIKAN")} size="sm" variant={c.status === "ABAIKAN" ? "primary" : "ghost"}>
                        Abaikan
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {candidates.length > 0 ? (
                <div className={styles.formActions} style={{ marginTop: "var(--alos-space-4)", flexDirection: "column", alignItems: "flex-start", gap: "var(--alos-space-2)" }}>
                  <Button
                    disabled={missingRequired.length > 0}
                    onClick={() => {
                      if (missingRequired.length > 0) return;
                      setFeedback("Layanan penyimpanan draf ekstraksi resmi belum terhubung.");
                    }}
                    variant="primary"
                  >
                    Simpan Draf Ekstraksi
                  </Button>
                  <div className={styles.briefNotice}>
                    Penyimpanan draf ekstraksi memerlukan integrasi layanan ekstraksi resmi.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// Helpers
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

function verificationLabel(state: string | undefined): string {
  const map: Record<string, string> = {
    UNVERIFIED: "Belum Diverifikasi",
    PENDING_VERIFICATION: "Menunggu Verifikasi",
    VERIFIED: "Terverifikasi",
    CONFLICT: "Perlu Klarifikasi",
    REJECTED: "Ditolak",
  };
  return map[state ?? ""] ?? "Belum Diverifikasi";
}

function materialityLabel(val: string): string {
  return val === "MATERIAL" ? "Material" : "Non-Material";
}

function assumptionCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    AVERAGE_SELLING_PRICE: "Harga Jual Rata-rata",
    CONVERSION_RATIO: "Rasio Konversi",
    EXPECTED_CPL: "Perkiraan CPL",
    AVAILABLE_INVENTORY: "Inventaris Tersedia",
    MARKETING_BUDGET: "Anggaran Pemasaran",
    TEAM_CAPACITY: "Kapasitas Tim",
    CUSTOM: "Khusus",
  };
  return map[cat] ?? cat;
}

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
