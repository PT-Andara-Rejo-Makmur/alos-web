"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, apiMessage } from "@/lib/api";
import type { BusinessTarget, MetricValueKind, PlanningAssumption, StrategicObjective, StrategyPlan, StrategyPlanCreateRequest } from "@/lib/contracts";

import { strategyApi } from "../backend/strategy-api";
import { StrategyTabs } from "../shared/strategy-tabs";
import type { StrategyContext } from "../shared/types";
import { StrategyNotice } from "../ui/strategy-notice";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import styles from "../ui/strategy-ui.module.css";

type WorkspaceKind = "renstra" | "annual-plan" | "targets";
type LoadState = "loading" | "ready" | "denied" | "conflict" | "error";
const valueKinds: readonly MetricValueKind[] = ["TARGET", "ACTUAL", "FORECAST", "ASSUMPTION"];

function periodLabel(plan: StrategyPlan | BusinessTarget) {
  return plan.period.label ?? `${plan.period.starts_at} – ${plan.period.ends_at}`;
}

function evidenceLabel(refs: readonly string[]) {
  return refs.length === 0 ? "—" : `${refs.length} bukti`;
}

function failureState(error: unknown): LoadState {
  if (error instanceof ApiError && error.status === 403) return "denied";
  if (error instanceof ApiError && error.status === 409) return "conflict";
  return "error";
}

function PlanTable({ plans, onEdit, onTransition }: { readonly plans: readonly StrategyPlan[]; readonly onEdit: (plan: StrategyPlan) => void; readonly onTransition: (plan: StrategyPlan, action: "submit" | "approve" | "activate") => void }) {
  return <div className={styles.tableContainer}><table className={styles.table}>
    <thead><tr><th>Plan</th><th>Periode / Horizon</th><th>Owner</th><th>Lifecycle</th><th>Versi</th><th>Sumber / Evidence</th><th>Aksi Backend</th></tr></thead>
    <tbody>{plans.length === 0 ? <tr><td className={styles.emptyCell} colSpan={7}>Belum ada plan authoritative pada scope ini.</td></tr> : plans.map((plan) => <tr key={`${plan.plan_id}:${plan.version}`}>
      <td><strong>{plan.name}</strong><br /><span className={styles.codeCell}>{plan.plan_id}</span></td>
      <td>{periodLabel(plan)}</td><td>{plan.owner_role_ref}<br /><span className={styles.codeCell}>{plan.owner_workspace_id}</span></td>
      <td>{plan.lifecycle_state}</td><td>v{plan.version}</td><td>{plan.source_refs.length === 0 ? "—" : `${plan.source_refs.length} sumber`}<br /><span className={styles.codeCell}>{evidenceLabel(plan.evidence_refs)}</span></td>
      <td><div className={styles.inlineActions}>
        {plan.authorized_actions?.includes("EDIT") && <button className={styles.buttonSecondary} type="button" onClick={() => onEdit(plan)}>Edit DRAFT</button>}
        {plan.authorized_actions?.includes("SUBMIT") && <button className={styles.buttonSecondary} type="button" onClick={() => onTransition(plan, "submit")}>Ajukan</button>}
        {plan.authorized_actions?.includes("APPROVE") && <button className={styles.buttonSecondary} type="button" onClick={() => onTransition(plan, "approve")}>Setujui</button>}
        {plan.authorized_actions?.includes("ACTIVATE") && <button className={styles.buttonPrimary} type="button" onClick={() => onTransition(plan, "activate")}>Aktifkan</button>}
        {!plan.authorized_actions?.some((action) => ["SUBMIT", "APPROVE", "ACTIVATE"].includes(action)) && "—"}
      </div></td>
    </tr>)}</tbody>
  </table></div>;
}

function refs(value: FormDataEntryValue | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function PlanEditor({ context, kind, plan, onCancel, onSave }: { readonly context: StrategyContext; readonly kind: Exclude<WorkspaceKind, "targets">; readonly plan: StrategyPlan | null; readonly onCancel: () => void; readonly onSave: (payload: StrategyPlanCreateRequest | Record<string, unknown>) => Promise<void> }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (plan) {
      void onSave({ name: String(data.get("name")), description: String(data.get("description") || "") || null, source_refs: refs(data.get("source_refs")), evidence_refs: refs(data.get("evidence_refs")) });
      return;
    }
    void onSave({
      plan_id: String(data.get("plan_id")), version: 1,
      plan_type: kind === "renstra" ? "STRATEGIC_PLAN" : "OPERATING_PLAN",
      name: String(data.get("name")), description: String(data.get("description") || "") || null,
      owner_workspace_id: context.workspaceKey,
      owner_role_ref: context.isCompanyWide ? "EXECUTIVE" : "WORKSPACE_LEAD",
      period: { granularity: "ANNUAL", starts_at: String(data.get("starts_at")), ends_at: String(data.get("ends_at")) },
      scope: { type: context.isCompanyWide ? "COMPANY" : "DIVISION", ref: context.isCompanyWide ? null : context.workspaceKey },
      materiality: "MATERIAL", source_refs: refs(data.get("source_refs")), evidence_refs: refs(data.get("evidence_refs")),
    });
  };
  return <section className={styles.card}><h2 className={styles.cardTitle}>{plan ? "Edit plan DRAFT" : "Buat plan DRAFT"}</h2><form className={styles.editorForm} onSubmit={submit}>
    {!plan && <label>ID Plan<input name="plan_id" required /></label>}
    <label>Nama<input name="name" defaultValue={plan?.name} required /></label>
    <label>Deskripsi<input name="description" defaultValue={plan?.description ?? ""} /></label>
    {!plan && <><label>Mulai<input name="starts_at" type="date" required /></label><label>Selesai<input name="ends_at" type="date" required /></label></>}
    <label>Source refs<input name="source_refs" defaultValue={plan?.source_refs.join(", ")} placeholder="Pisahkan dengan koma" /></label>
    <label>Evidence refs<input name="evidence_refs" defaultValue={plan?.evidence_refs.join(", ")} placeholder="Pisahkan dengan koma" /></label>
    <div className={styles.inlineActions}><button className={styles.buttonPrimary} type="submit">Simpan DRAFT</button><button className={styles.buttonSecondary} type="button" onClick={onCancel}>Batal</button></div>
  </form></section>;
}

function PlanningCoverage({ kind, objectives, targets, assumptions }: { readonly kind: Exclude<WorkspaceKind, "targets">; readonly objectives: readonly StrategicObjective[]; readonly targets: readonly BusinessTarget[]; readonly assumptions: readonly PlanningAssumption[] }) {
  const items = kind === "renstra"
    ? [["Sasaran strategis", objectives.length], ["Sumber strategis", "Dibaca pada plan"], ["Evidence", "Dibaca pada plan"]] as const
    : [["Corporate Objectives", objectives.length], ["Financial & Operational Targets", targets.length], ["Division Allocation", targets.filter((target) => target.scope.type === "DIVISION").length], ["Assumptions", assumptions.length], ["Constraints", "Sesuai hasil cascade"], ["KPI & Initiatives", "Menunggu projection Backend"]] as const;
  return <section className={styles.card} aria-label="Cakupan planning authoritative"><h2 className={styles.cardTitle}>Cakupan Planning</h2><dl className={styles.detailGrid}>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function TargetTable({ targets }: { readonly targets: readonly BusinessTarget[] }) {
  return <div className={styles.targetStack}>{targets.length === 0
    ? <StrategyNotice title="Belum ada target">Backend tidak mengembalikan target untuk scope workspace aktif.</StrategyNotice>
    : targets.map((target) => {
      const observations = new Map(target.observations?.map((item) => [item.kind, item]));
      return <article className={styles.card} key={`${target.target_id}:${target.version}`}>
        <header className={styles.targetHeader}><div><span className={styles.sectionEyebrow}>{target.scope.type} · {target.code}</span><h2 className={styles.cardTitle}>{target.name}</h2></div><span>{target.lifecycle_state} · v{target.version}</span></header>
        <div className={styles.valueGrid}>{valueKinds.map((kind) => {
          const observation = observations.get(kind);
          return <div className={styles.valueCell} key={kind}><span>{kind}</span><strong>{observation?.value ?? "—"}</strong><small>{observation ? `${observation.unit} · ${observation.verification_state}` : "Tidak tersedia"}</small></div>;
        })}</div>
        <dl className={styles.detailGrid}><div><dt>Periode</dt><dd>{periodLabel(target)}</dd></div><div><dt>Owner</dt><dd>{target.owner_role_ref} · {target.owner_workspace_id}</dd></div><div><dt>Derivasi</dt><dd>{target.cascade_run_id ?? "—"}</dd></div><div><dt>Evidence</dt><dd>{evidenceLabel(target.evidence_refs)}</dd></div></dl>
      </article>;
    })}</div>;
}

function PlanningWorkspace({ context, kind }: { readonly context: StrategyContext; readonly kind: WorkspaceKind }) {
  const [plans, setPlans] = useState<readonly StrategyPlan[]>([]);
  const [targets, setTargets] = useState<readonly BusinessTarget[]>([]);
  const [objectives, setObjectives] = useState<readonly StrategicObjective[]>([]);
  const [assumptions, setAssumptions] = useState<readonly PlanningAssumption[]>([]);
  const [authorityActions, setAuthorityActions] = useState<readonly string[]>([]);
  const [editorPlan, setEditorPlan] = useState<StrategyPlan | null | undefined>(undefined);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const company = context.isCompanyWide === true;
  const config = kind === "renstra"
    ? { title: `Renstra ${company ? "Perusahaan" : context.workspaceLabel}`, description: "Strategic plan Backend-owned, terversi, dan auditable.", active: "renstra" }
    : kind === "annual-plan"
      ? { title: "RKAP & Rencana Kerja", description: "Operating plan korporat, asumsi, constraint, KPI, inisiatif, evidence, dan approval state.", active: "annual-plan" }
      : { title: company ? "Target Perusahaan" : `Target Divisi ${context.workspaceLabel}`, description: "Target tree dan observasi diproyeksikan dari authority Backend tanpa kalkulasi browser.", active: "targets" };

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      if (kind === "targets") {
        setTargets(await strategyApi.listTargets(signal));
      } else {
        const [loadedPlans, authority] = await Promise.all([strategyApi.listPlans(signal), strategyApi.getAuthority(signal)]);
        setPlans(loadedPlans);
        setAuthorityActions(authority.authorized_actions);
        const relevant = loadedPlans.filter((plan) => plan.plan_type === (kind === "renstra" ? "STRATEGIC_PLAN" : "OPERATING_PLAN"));
        setObjectives((await Promise.all(relevant.map((plan) => strategyApi.listObjectives(plan.plan_id, signal)))).flat());
        if (kind === "annual-plan") {
          const [loadedTargets, loadedAssumptions] = await Promise.all([strategyApi.listTargets(signal), strategyApi.listAssumptions(signal)]);
          setTargets(loadedTargets);
          setAssumptions(loadedAssumptions);
        }
      }
      setState("ready");
    } catch (error) {
      if (signal?.aborted) return;
      setState(failureState(error)); setMessage(apiMessage(error));
    }
  }, [kind]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load]);

  const visiblePlans = useMemo(() => plans.filter((plan) => plan.plan_type === (kind === "renstra" ? "STRATEGIC_PLAN" : "OPERATING_PLAN")), [kind, plans]);
  const transition = async (plan: StrategyPlan, action: "submit" | "approve" | "activate") => {
    const authorizedAction = action === "submit" ? "SUBMIT" : action === "approve" ? "APPROVE" : "ACTIVATE";
    if (!plan.authorized_actions?.includes(authorizedAction)) return;
    setState("loading"); setMessage(null);
    try { await strategyApi.transitionPlan(plan.plan_id, action); await load(); }
    catch (error) { setState(failureState(error)); setMessage(apiMessage(error)); }
  };
  const createAction = company ? "CREATE_COMPANY_PLAN" : "CREATE_DIVISION_PLAN";
  const savePlan = async (payload: StrategyPlanCreateRequest | Record<string, unknown>) => {
    setState("loading"); setMessage(null);
    try {
      if (editorPlan) await strategyApi.updatePlan(editorPlan.plan_id, payload);
      else await strategyApi.createPlan(payload as StrategyPlanCreateRequest);
      setEditorPlan(undefined); await load();
    } catch (error) { setState(failureState(error)); setMessage(apiMessage(error)); }
  };

  return <div className={styles.strategyRoot}>
    <StrategyPageHeader title={config.title} description={config.description} workspaceLabel={context.workspaceLabel} />
    <StrategyTabs workspaceKey={context.workspaceKey} activeSubmodule={config.active} />
    {state === "loading" && <StrategyNotice title="Memuat data authoritative">Mengambil planning state dari ALOS Backend.</StrategyNotice>}
    {state !== "loading" && state !== "ready" && <StrategyNotice title={state === "denied" ? "Akses ditolak" : state === "conflict" ? "State berubah" : "Backend tidak tersedia"}>{message ?? "Request gagal secara fail-closed."} Tidak ada perubahan state yang diasumsikan berhasil.</StrategyNotice>}
    {state === "ready" && kind !== "targets" && authorityActions.includes(createAction) && editorPlan === undefined && <button className={styles.buttonPrimary} type="button" onClick={() => setEditorPlan(null)}>Buat DRAFT</button>}
    {state === "ready" && kind !== "targets" && editorPlan !== undefined && <PlanEditor context={context} kind={kind} plan={editorPlan} onCancel={() => setEditorPlan(undefined)} onSave={savePlan} />}
    {state === "ready" && (kind === "targets" ? <TargetTable targets={targets} /> : <><PlanTable plans={visiblePlans} onEdit={setEditorPlan} onTransition={transition} /><PlanningCoverage kind={kind} objectives={objectives} targets={targets} assumptions={assumptions} /></>)}
    <section className={styles.card} aria-label={`${config.title} boundary`}><h2 className={styles.cardTitle}>Boundary authority</h2><p className={styles.cardText}>Perhitungan cascade, constraint, verification, approval, activation, dan versioning hanya dilakukan ALOS Backend. Web hanya mengirim command canonical dan menampilkan hasil.</p></section>
  </div>;
}

export const RenstraWorkspace = ({ context }: { readonly context: StrategyContext }) => <PlanningWorkspace context={context} kind="renstra" />;
export const AnnualPlanWorkspace = ({ context }: { readonly context: StrategyContext }) => <PlanningWorkspace context={context} kind="annual-plan" />;
export const TargetsWorkspace = ({ context }: { readonly context: StrategyContext }) => <PlanningWorkspace context={context} kind="targets" />;
