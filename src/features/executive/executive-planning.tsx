"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Button, DataTable, LoadingState, PageHeader, Section, Status, Tabs, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { BusinessTarget, PlanningAssumption, StrategicObjective, StrategyPlan } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { roleLabel, statusLabel } from "@/lib/presentation";
import { ExecutiveVerificationDrawer } from "./executive-verification";
import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import { corporateTargets, periodLabel, scopeLabel } from "./executive-model";
import styles from "./executive.module.css";
import { materialityLabel, assumptionCategoryLabel, formatDate } from "./planning-presentation";
import { lifecycleLabel, verificationLabel } from "./executive-model";
import { PlanFormDrawer } from "./executive-plan-editor";
import { ObjectiveFormDrawer } from "./executive-objective-editor";
import { TargetFormDrawer } from "./executive-target-editor";
import { AssumptionFormDrawer } from "./executive-assumption-editor";
import { CascadeSection } from "./executive-cascade";
import { type ExtractedCandidate, ExtractionSection } from "./executive-document-extraction";
export { ExtractionSection, type ExtractedCandidate } from "./executive-document-extraction";

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
          { header: "Penanggung Jawab", key: "owner", render: (plan) => roleLabel(plan.owner_role_ref) },
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
          { header: "Penanggung Jawab", key: "owner", render: (item) => roleLabel(item.owner_role_ref) },
          { header: "Status", key: "status", render: (item) => <Status label={lifecycleLabel(item.lifecycle_state)} variant="neutral" /> },
        ]}
        getRowKey={(item) => `${item.objective_id}-${item.version}`}
        rows={objectives}
      />
    </Section>
  );
}

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
          { header: "Penanggung Jawab", key: "owner", render: (target) => roleLabel(target.owner_role_ref) },
          { header: "Status", key: "status", render: (target) => <Status label={lifecycleLabel(target.lifecycle_state)} variant="neutral" /> },
        ]}
        getRowKey={(target) => target.target_id}
        rows={targets}
      />
    </Section>
  );
}

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
          { header: "Satuan", key: "unit", render: (item) => statusLabel(item.unit) },
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
