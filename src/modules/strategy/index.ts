/**
 * Strategy & Performance Module Presentation Layer
 * 
 * Clean, enterprise OS surfaces for corporate & division strategy,
 * KPIs, initiatives, performance reviews, corrective actions, target revisions,
 * and strategic sources.
 */

export * from "./shared/types";
export * from "./shared/strategy-constants";
export * from "./shared/strategy-tabs";
export * from "./shared/strategy-performance-summary";
export * from "./shared/strategy-submodule-runner";

export * from "./ui/strategy-page-header";
export * from "./ui/strategy-status-badge";
export * from "./ui/strategy-data-table";
export * from "./ui/strategy-section-header";
export * from "./ui/strategy-notice";
export * from "./ui/strategy-source-strip";
export * from "./ui/strategy-form-drawer";

export * from "./overview/strategy-overview-workspace";
export * from "./objectives/objectives-workspace";
export * from "./kpis/kpis-workspace";
export * from "./initiatives/initiatives-workspace";
export * from "./performance-reviews/performance-reviews-workspace";
export * from "./corrective-actions/corrective-actions-panel";
export * from "./target-revisions/target-revisions-workspace";
export * from "./sources/strategic-sources-workspace";
