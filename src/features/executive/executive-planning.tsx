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
import type { SessionProjection } from "@/features/session";
import type {
  BusinessTarget,
  BusinessTargetCreateRequest,
  CascadePreview,
  CascadePreviewRequest,
  CascadeRule,
  BusinessUnit,
  PlanningAssumptionCreateRequest,
  StrategyMeasurementType,
  PlanningAssumption,
  StrategicObjective,
  StrategyBusinessPeriod as BusinessPeriod,
  StrategyBusinessScope as BusinessScope,
  StrategyPlan,
} from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";

import { ExecutiveVerificationDrawer } from "./executive-verification";
import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import { activeExecutiveWorkspaceId, ExecutiveWorkspacePicker } from "./executive-form-fields";
import { corporateTargets, generateCanonicalId, periodLabel, scopeLabel } from "./executive-model";
import styles from "./executive.module.css";

export interface ExecutivePlanningPageProps {
  readonly initialCandidates?: readonly ExtractedCandidate[];
  readonly initialProcessed?: boolean;
  readonly session?: SessionProjection;
  readonly workspaceKey?: string;
}

export function ExecutivePlanningPage({
  initialCandidates,
  initialProcessed,
  workspaceKey,
}: ExecutivePlanningPageProps = {}) {
  return (
    <ExecutiveLayout workspaceKey={workspaceKey}>
      {(session) => (
        <PlanningContent
          initialCandidates={initialCandidates}
          initialProcessed={initialProcessed}
          session={session}
        />
      )}
    </ExecutiveLayout>
  );
}

function PlanningContent({
  initialCandidates,
  initialProcessed,
  session,
}: ExecutivePlanningPageProps & { readonly session: SessionProjection }) {
  const { data, error, loading, reload } = useExecutiveStrategyData();
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
  const canCreateDivisionPlan = authorizedActions.includes("CREATE_DIVISION_PLAN");
  const canCreate = canCreateCompanyPlan || canCreateDivisionPlan;

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
          onChanged={reload}
          title="Rencana Strategis (Renstra)"
        />
      ) : null}

      {!loading && tab === "operating" ? (
        <PlanSection
          actionLabel="Buat RKAP"
          canCreate={canCreateCompanyPlan}
          onOpenForm={() => setPlanFormType("OPERATING_PLAN")}
          plans={operatingPlans}
          onChanged={reload}
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
          canCreate={canCreate}
          onOpenForm={() => setTargetFormOpen(true)}
          plans={plans}
          targets={targets}
        />
      ) : null}

      {!loading && tab === "assumptions" ? (
        <AssumptionsSection
          assumptions={assumptions}
          canReview={data?.authority?.verification_actions?.includes("VERIFY_PLANNING") ?? false}
          onChanged={reload}
          canCreate={canCreate}
          onOpenForm={() => setAssumptionFormOpen(true)}
        />
      ) : null}

      {!loading && tab === "cascade" ? (
        <CascadeSection
          assumptions={assumptions}
          canCascade={canCreate}
          session={session}
          targets={targets}
          onChanged={reload}
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
          onClose={() => { setPlanFormType(null); reload(); }}
          planType={planFormType}
          session={session}
          strategicPlans={strategicPlans}
        />
      ) : null}

      {objectiveFormOpen ? (
        <ObjectiveFormDrawer
          canSubmit={canCreateCompanyPlan}
          onClose={() => { setObjectiveFormOpen(false); reload(); }}
          plans={plans.filter((plan) => plan.lifecycle_state === "DRAFT")}
          session={session}
        />
      ) : null}

      {targetFormOpen ? (
        <TargetFormDrawer
          canSubmitCompany={canCreateCompanyPlan}
          canSubmitDivision={canCreateDivisionPlan}
          onClose={() => { setTargetFormOpen(false); reload(); }}
          plans={plans.filter((plan) => plan.lifecycle_state === "DRAFT")}
          session={session}
        />
      ) : null}

      {assumptionFormOpen ? (
        <AssumptionFormDrawer
          canSubmit={canCreateCompanyPlan}
          onClose={() => { setAssumptionFormOpen(false); reload(); }}
          session={session}
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
  readonly onChanged: () => void;
}

function PlanSection({ title, plans, actionLabel, canCreate, onOpenForm, onChanged }: PlanSectionProps) {
  const [error, setError] = useState<string | null>(null);
  async function transition(plan: StrategyPlan, action: "submit" | "approve" | "activate" | "archive") {
    try { await strategyApi.transitionPlan(plan.plan_id, action, plan.version); onChanged(); }
    catch { setError("Transisi rencana ditolak. Periksa status, nilai target terverifikasi, dan bukti."); }
  }
  return (
    <Section
      actions={canCreate ? <Button onClick={onOpenForm} size="sm" variant="primary">{actionLabel}</Button> : undefined}
      description="Data mengikuti kewenangan dan siklus hidup resmi Strategy."
      title={title}
    >
      {error ? <Alert message={error} title="Perhatian" variant="warning" /> : null}
      <DataTable
        caption={title}
        columns={[
          { header: "Nama", key: "name", render: (plan) => plan.name },
          { header: "Periode", key: "period", render: (plan) => periodLabel(plan.period) },
          { header: "Penanggung Jawab", key: "owner", render: (plan) => plan.owner_role_ref || "—" },
          { header: "Status", key: "status", render: (plan) => <Status label={lifecycleLabel(plan.lifecycle_state)} variant="neutral" /> },
          { header: "Dampak Keputusan", key: "materiality", render: (plan) => materialityLabel(plan.materiality) },
          { header: "Versi", key: "version", render: (plan) => `v${plan.version}` },
          { header: "Pembaruan", key: "updated", render: (plan) => formatDate(plan.updated_at) },
        ]}
        rowAction={(plan) => <div>{(["SUBMIT", "APPROVE", "ACTIVATE", "ARCHIVE"] as const).filter((action) => plan.authorized_actions?.includes(action)).map((action) => <Button key={action} size="sm" onClick={() => void transition(plan, action.toLowerCase() as "submit" | "approve" | "activate" | "archive")}>{action === "SUBMIT" ? "Ajukan Review" : action === "APPROVE" ? "Setujui" : action === "ARCHIVE" ? "Arsipkan" : "Aktifkan"}</Button>)}</div>}
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
  readonly session: SessionProjection;
}

function PlanFormDrawer({ planType, strategicPlans, canSubmit, onClose, session }: PlanFormProps) {
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
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="plan-scope" onChange={(e) => setScopeType(e.target.value as BusinessScope["type"])} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-materiality">Dampak Keputusan *</label>
            <select className={styles.formSelect} id="plan-materiality" onChange={(e) => setMateriality(e.target.value as "MATERIAL")} value={materiality}>
              <option value="MATERIAL">Material (Strategis)</option>
              <option value="NON_MATERIAL">Non-Material (Operasional)</option>
            </select>
          </div>

          <div className={styles.formField}>
            <ExecutiveWorkspacePicker id="plan-owner-workspace" onChange={setOwnerWorkspace} session={session} value={ownerWorkspace} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-owner-role">Peran / Jabatan Penanggung Jawab *</label>
            <input className={styles.formInput} id="plan-owner-role" onChange={(e) => setOwnerRole(e.target.value)} placeholder="Peran / Jabatan" required value={ownerRole} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-source">Sumber Referensi</label>
            <input className={styles.formInput} id="plan-source" onChange={(e) => setSource(e.target.value)} placeholder="Referensi dokumen / SK" value={source} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="plan-evidence">Bukti Pendukung</label>
            <input className={styles.formInput} id="plan-evidence" onChange={(e) => setEvidence(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" value={evidence} />
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
          { header: "Ruang Lingkup", key: "scope", render: (item) => scopeLabel(item.scope) },
          { header: "Penanggung Jawab", key: "owner", render: (item) => item.owner_role_ref || "—" },
          { header: "Status", key: "status", render: (item) => <Status label={lifecycleLabel(item.lifecycle_state)} variant="neutral" /> },
        ]}
        getRowKey={(item) => `${item.objective_id}-${item.version}`}
        rows={objectives}
      />
    </Section>
  );
}

function ObjectiveFormDrawer({ plans, canSubmit, onClose, session }: Readonly<{ plans: readonly StrategyPlan[]; canSubmit: boolean; onClose: () => void; session: SessionProjection }>) {
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
            <select className={styles.formSelect} id="obj-scope" onChange={(e) => setScopeType(e.target.value as BusinessScope["type"])} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="obj-owner-role">Peran / Jabatan Penanggung Jawab *</label>
            <input className={styles.formInput} id="obj-owner-role" onChange={(e) => setOwnerRole(e.target.value)} placeholder="Peran / Jabatan" required value={ownerRole} />
          </div>

          <div className={`${styles.formField} ${styles.formFullWidth}`}>
            <ExecutiveWorkspacePicker id="obj-workspace" onChange={setWorkspace} session={session} value={workspace} />
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
          { header: "Ruang Lingkup", key: "scope", render: (target) => scopeLabel(target.scope) },
          { header: "Penanggung Jawab", key: "owner", render: (target) => target.owner_role_ref || "—" },
          { header: "Status", key: "status", render: (target) => <Status label={lifecycleLabel(target.lifecycle_state)} variant="neutral" /> },
        ]}
        getRowKey={(target) => target.target_id}
        rows={targets}
      />
    </Section>
  );
}

function TargetFormDrawer({ plans, canSubmitCompany, canSubmitDivision, onClose, session }: Readonly<{ plans: readonly StrategyPlan[]; canSubmitCompany: boolean; canSubmitDivision: boolean; onClose: () => void; session: SessionProjection }>) {
  const [step, setStep] = useState<1 | 2>(1);
  const [savedTargetId, setSavedTargetId] = useState<string | null>(null);

  // Step 1: Metadata
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.plan_id ?? "");
  const [metricCode, setMetricCode] = useState("METRIC_PRIMARY");
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

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !planId || !metricCode.trim() || !ownerWorkspace.trim() || !ownerRole.trim()) {
      setFeedback("Mohon lengkapi seluruh field wajib metadata target, termasuk penanggung jawab.");
      return;
    }
    if (!startsAt || !endsAt) {
      setFeedback("Periode mulai dan selesai wajib diisi.");
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
    if (sourceMode === "SOURCE_LINKED" && !obsSourceRef.trim()) {
      setFeedback("Mode sumber terhubung memerlukan referensi sumber yang valid.");
      return;
    }
    if (sourceMode === "MANUAL_EVIDENCED" && !obsEvidenceRef.trim()) {
      setFeedback("Mode input manual memerlukan bukti dokumen pendukung.");
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
              <label htmlFor="tgt-metric">Kode Indikator *</label>
              <input className={styles.formInput} id="tgt-metric" onChange={(e) => setMetricCode(e.target.value)} required value={metricCode} />
            </div>

            <div className={styles.formField}>
              <span style={{ color: "var(--alos-text-secondary)", fontSize: "12px" }}>Referensi KPI</span>
              <p style={{ color: "var(--alos-text-secondary)", fontSize: "12px", margin: 0 }}>
                Referensi KPI akan tersedia setelah sumber definisi KPI terhubung.
              </p>
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
              <label htmlFor="tgt-unit">Satuan (Unit) *</label>
              <select className={styles.formSelect} id="tgt-unit" onChange={(e) => setUnit(e.target.value as BusinessUnit)} value={unit}>
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
              <label htmlFor="tgt-start">Periode Mulai *</label>
              <input className={styles.formInput} id="tgt-start" onChange={(e) => setStartsAt(e.target.value)} required type="date" value={startsAt} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-end">Periode Selesai *</label>
              <input className={styles.formInput} id="tgt-end" onChange={(e) => setEndsAt(e.target.value)} required type="date" value={endsAt} />
            </div>

            <div className={styles.formField}>
              <ExecutiveWorkspacePicker id="tgt-owner-ws" onChange={setOwnerWorkspace} session={session} value={ownerWorkspace} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-owner-role">Peran / Jabatan Penanggung Jawab *</label>
              <input className={styles.formInput} id="tgt-owner-role" onChange={(e) => setOwnerRole(e.target.value)} placeholder="Peran / Jabatan" required value={ownerRole} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-source-ref">Referensi Sumber Dokumen</label>
              <input className={styles.formInput} id="tgt-source-ref" onChange={(e) => setSourceRef(e.target.value)} placeholder="Nomor / tautan dokumen referensi" value={sourceRef} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tgt-evidence-ref">Bukti Pendukung</label>
              <input className={styles.formInput} id="tgt-evidence-ref" onChange={(e) => setEvidenceRef(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" value={evidenceRef} />
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
            Nilai target dicatat sebagai observasi terpisah dan memerlukan referensi sumber atau bukti sesuai mode yang dipilih.
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

            <div className={`${styles.formField} ${styles.formFullWidth}`}>
              <label htmlFor="tgt-source-mode">Dasar Angka *</label>
              <select className={styles.formSelect} id="tgt-source-mode" onChange={(e) => setSourceMode(e.target.value as "SOURCE_LINKED")} value={sourceMode}>
                <option disabled value="SOURCE_LINKED">Sumber resmi eksternal belum tersedia</option>
                <option value="MANUAL_EVIDENCED">Diisi Manual dengan Bukti</option>
              </select>
            </div>

            {sourceMode === "SOURCE_LINKED" ? (
              <div className={`${styles.formField} ${styles.formFullWidth}`}>
                <label htmlFor="tgt-obs-source">Referensi Sumber * <span style={{ fontSize: "11px", color: "var(--alos-text-muted)" }}>(wajib untuk mode ini)</span></label>
                <input className={styles.formInput} id="tgt-obs-source" onChange={(e) => setObsSourceRef(e.target.value)} placeholder="Nomor SK / tautan sumber resmi" required value={obsSourceRef} />
              </div>
            ) : (
              <div className={`${styles.formField} ${styles.formFullWidth}`}>
                <label htmlFor="tgt-obs-evidence">Bukti Dokumen Pendukung * <span style={{ fontSize: "11px", color: "var(--alos-text-muted)" }}>(wajib untuk mode ini)</span></label>
                <input className={styles.formInput} id="tgt-obs-evidence" onChange={(e) => setObsEvidenceRef(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" required value={obsEvidenceRef} />
              </div>
            )}
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
  readonly canReview: boolean;
  readonly onChanged: () => void;
  readonly assumptions: readonly PlanningAssumption[];
  readonly canCreate: boolean;
  readonly onOpenForm: () => void;
}

function AssumptionsSection({ assumptions, canCreate, onOpenForm, canReview, onChanged }: AssumptionsSectionProps) {
  const [verificationId, setVerificationId] = useState<string | null>(null);
  return (
    <Section
      actions={canCreate ? <Button onClick={onOpenForm} size="sm" variant="primary">Tambah Asumsi</Button> : undefined}
      description="Asumsi perencanaan digunakan sebagai parameter input kalkulasi cascade strategi."
      title="Asumsi Perencanaan"
    >
      <DataTable
        rowAction={(item) => canReview && ["UNVERIFIED", "PENDING_VERIFICATION"].includes(item.verification_state) ? <Button onClick={() => setVerificationId(item.assumption_id)}>Telaah Asumsi</Button> : undefined}
        caption="Asumsi perencanaan"
        columns={[
          { header: "Nama", key: "name", render: (item) => item.name },
          { header: "Kategori", key: "category", render: (item) => assumptionCategoryLabel(item.category) },
          { header: "Nilai", key: "value", render: (item) => item.value ?? "—" },
          { header: "Satuan", key: "unit", render: (item) => item.unit },
          { header: "Ruang Lingkup", key: "scope", render: (item) => scopeLabel(item.scope) },
          { header: "Status", key: "status", render: (item) => <Status label={lifecycleLabel(item.lifecycle_state)} variant="neutral" /> },
          { header: "Verifikasi", key: "verification", render: (item) => verificationLabel(item.verification_state) },
        ]}
        getRowKey={(item) => `${item.assumption_id}-${item.version}`}
        rows={assumptions}
      />
      {verificationId ? <ExecutiveVerificationDrawer onSave={(payload) => strategyApi.verifyAssumption(verificationId, payload)} onClose={() => { setVerificationId(null); onChanged(); }} /> : null}
    </Section>
  );
}

function AssumptionFormDrawer({ canSubmit, onClose, session }: Readonly<{ canSubmit: boolean; onClose: () => void; session: SessionProjection }>) {
  const [category, setCategory] = useState<PlanningAssumptionCreateRequest["category"]>("AVERAGE_SELLING_PRICE");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<BusinessUnit>("IDR");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [granularity, setGranularity] = useState("ANNUAL");
  const [scopeType, setScopeType] = useState<BusinessScope["type"]>("COMPANY");
  const [ownerWorkspace, setOwnerWorkspace] = useState(() => activeExecutiveWorkspaceId(session));
  const [ownerRole, setOwnerRole] = useState("");
  const [sourceMode, setSourceMode] = useState<"MANUAL_EVIDENCED" | "SOURCE_LINKED">("MANUAL_EVIDENCED");
  const [sourceRef, setSourceRef] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("");
  const verificationState = "PENDING_VERIFICATION" as const;
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
          starts_at: startsAt,
          ends_at: endsAt,
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
            <select className={styles.formSelect} id="asm-cat" onChange={(e) => setCategory(e.target.value as PlanningAssumptionCreateRequest["category"])} value={category}>
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
            <select className={styles.formSelect} id="asm-unit" onChange={(e) => setUnit(e.target.value as BusinessUnit)} value={unit}>
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
            <label htmlFor="asm-granularity">Frekuensi Pengukuran *</label>
            <select className={styles.formSelect} id="asm-granularity" onChange={(e) => setGranularity(e.target.value)} value={granularity}>
              <option value="ANNUAL">Tahunan</option>
              <option value="QUARTERLY">Triwulan</option>
              <option value="MONTHLY">Bulanan</option>
              <option value="CUSTOM">Khusus</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-source-mode">Dasar Angka *</label>
            <select className={styles.formSelect} id="asm-source-mode" onChange={(e) => setSourceMode(e.target.value as "MANUAL_EVIDENCED")} value={sourceMode}>
              <option value="MANUAL_EVIDENCED">Diisi Manual dengan Bukti</option>
              <option disabled value="SOURCE_LINKED">Sumber resmi eksternal belum tersedia</option>
            </select>
          </div>

          <div className={styles.formField}>
            <p>Asumsi akan menunggu pemeriksaan setelah disimpan.</p>
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-source">Referensi Sumber</label>
            <input className={styles.formInput} id="asm-source" onChange={(e) => setSourceRef(e.target.value)} placeholder="Tautan / nomor rujukan" value={sourceRef} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-evidence">Referensi Bukti</label>
            <input className={styles.formInput} id="asm-evidence" onChange={(e) => setEvidenceRef(e.target.value)} placeholder="Nomor arsip, nomor dokumen, atau tautan referensi" value={evidenceRef} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-scope">Ruang Lingkup *</label>
            <select className={styles.formSelect} id="asm-scope" onChange={(e) => setScopeType(e.target.value as BusinessScope["type"])} value={scopeType}>
              <option value="COMPANY">Korporasi</option>
              <option value="DIVISION">Divisi</option>
            </select>
          </div>

          <div className={styles.formField}>
            <ExecutiveWorkspacePicker id="asm-owner-ws" onChange={setOwnerWorkspace} session={session} value={ownerWorkspace} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="asm-owner-role">Peran / Jabatan Penanggung Jawab *</label>
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
  readonly session: SessionProjection;
  readonly onChanged: () => void;
}

function CascadeSection({ targets, assumptions, canCascade = false, session, onChanged }: CascadeSectionProps) {
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

  return (
    <Section description="Alur ekstraksi terpandu: Dokumen & Versi yang Tetap → Jenis Ekstraksi → Proses → Telaah Kandidat." title="Ekstraksi Dokumen Strategi">

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
                  <div className={styles.briefNotice}>
                    Penyimpanan hasil telaah kandidat memerlukan integrasi layanan ekstraksi resmi yang belum terhubung. Telaah kandidat saat ini bersifat pratinjau saja.
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
  return val === "MATERIAL" ? "Keputusan Strategis" : "Operasi Divisi";
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
