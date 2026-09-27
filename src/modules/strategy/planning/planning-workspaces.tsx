import type { StrategyContext } from "../shared/types";
import { StrategyTabs } from "../shared/strategy-tabs";
import { StrategyPageHeader } from "../ui/strategy-page-header";
import { StrategyNotice } from "../ui/strategy-notice";
import styles from "../ui/strategy-ui.module.css";

function PlanningWorkspace({ context, kind }: { readonly context: StrategyContext; readonly kind: "renstra" | "annual-plan" | "targets" }) {
  const company = context.isCompanyWide === true;
  const config = kind === "renstra"
    ? { title: `Renstra ${company ? "Perusahaan" : context.workspaceLabel}`, description: "Horizon strategis, periode, sasaran, sumber, dan authority role disajikan tanpa mengklaim state authoritative.", active: "renstra" }
    : kind === "annual-plan"
      ? { title: "RKAP & Rencana Kerja", description: "Operating plan korporat yang menurunkan Renstra menjadi target, KPI, inisiatif, dan cadence tahunan.", active: "annual-plan" }
      : { title: company ? "Target Perusahaan" : `Target Divisi ${context.workspaceLabel}`, description: "Target, actual, forecast, assumption, periode, owner role, evidence, dan status verifikasi ditampilkan sebagai dimensi terpisah.", active: "targets" };

  return <div className={styles.strategyRoot}>
    <StrategyPageHeader title={config.title} description={config.description} workspaceLabel={context.workspaceLabel} />
    <StrategyTabs workspaceKey={context.workspaceKey} activeSubmodule={config.active} />
    <StrategyNotice title="Sumber belum terhubung">Data perencanaan authoritative dari Backend belum tersedia. Nilai operasional ditampilkan sebagai “—” dan status NOT_CONNECTED.</StrategyNotice>
    <section className={styles.card} aria-label={`${config.title} data requirements`}>
      <h2>{kind === "targets" ? "Semantik Target" : "Struktur Perencanaan"}</h2>
      <p>{kind === "targets" ? "TARGET · ACTUAL · FORECAST · ASSUMPTION · VARIANCE · ACHIEVEMENT · VERIFICATION" : "Strategic Horizon → Renstra → RKAP / Operating Plan → Objective → Target → KPI → Initiative"}</p>
    </section>
  </div>;
}

export const RenstraWorkspace = ({ context }: { readonly context: StrategyContext }) => <PlanningWorkspace context={context} kind="renstra" />;
export const AnnualPlanWorkspace = ({ context }: { readonly context: StrategyContext }) => <PlanningWorkspace context={context} kind="annual-plan" />;
export const TargetsWorkspace = ({ context }: { readonly context: StrategyContext }) => <PlanningWorkspace context={context} kind="targets" />;
