/**
 * Frontend-only View Models for Strategy & Performance.
 * 
 * NOTE: These are strictly presentation-layer view models.
 * They are NOT canonical Backend API contracts and NOT authoritative data models.
 * All fields are null-safe and optional.
 */

export type StrategySourceState = "CONNECTED" | "NOT_CONNECTED" | "LOADING" | "ERROR";

export type StrategicHorizon = "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";

export type KpiMeasurementType =
  | "HIGHER_IS_BETTER"
  | "LOWER_IS_BETTER"
  | "BINARY"
  | "MILESTONE"
  | "CUMULATIVE"
  | "PERCENTAGE";

export type StrategyStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "BEHIND"
  | "ACHIEVED"
  | "UNDER_REVIEW"
  | "REVISED";

export interface StrategicObjectiveViewModel {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly horizon?: StrategicHorizon | string | null;
  readonly period?: string | null;
  readonly owner?: string | null;
  readonly status?: StrategyStatus | string | null;
  readonly source?: string | null;
  readonly performance?: number | null;
}

export interface KpiViewModel {
  readonly id: string;
  readonly code?: string | null;
  readonly name: string;
  readonly objective_id?: string | null;
  readonly objective_title?: string | null;
  readonly owner?: string | null;
  readonly measurement_type?: KpiMeasurementType | string | null;
  readonly target?: number | string | null;
  readonly actual?: number | string | null;
  readonly unit?: string | null;
  readonly achievement_percent?: number | null;
  readonly status?: StrategyStatus | string | null;
  readonly data_source?: string | null;
  readonly period?: string | null;
}

export interface InitiativeViewModel {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly objective_id?: string | null;
  readonly objective_title?: string | null;
  readonly kpi_ids?: readonly string[];
  readonly kpi_names?: readonly string[];
  readonly owner?: string | null;
  readonly period?: string | null;
  readonly status?: StrategyStatus | string | null;
  readonly related_project_ids?: readonly string[];
  readonly related_project_names?: readonly string[];
}

export interface CorrectiveActionItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly owner?: string | null;
  readonly due_date?: string | null;
  readonly status?: string | null;
  readonly linked_project_id?: string | null;
  readonly linked_task_id?: string | null;
}

export interface PerformanceReviewViewModel {
  readonly id: string;
  readonly period: string;
  readonly target_item: string;
  readonly target_value?: string | number | null;
  readonly actual_value?: string | number | null;
  readonly gap?: string | number | null;
  readonly status: StrategyStatus | string;
  readonly root_cause_analysis?: string | null;
  readonly impact_analysis?: string | null;
  readonly corrective_actions?: readonly CorrectiveActionItem[];
  readonly owner?: string | null;
  readonly next_review_date?: string | null;
  readonly evidence_refs?: readonly string[];
}

export interface TargetRevisionViewModel {
  readonly id: string;
  readonly target_name: string;
  readonly version: string;
  readonly previous_value?: string | number | null;
  readonly proposed_value?: string | number | null;
  readonly reason: string;
  readonly proposer?: string | null;
  readonly approver?: string | null;
  readonly effective_date?: string | null;
  readonly status: "PROPOSED" | "APPROVED" | "REJECTED" | "SUPERSEDED" | string;
  readonly evidence_refs?: readonly string[];
}

export interface StrategicSourceDocumentViewModel {
  readonly id: string;
  readonly document_name: string;
  readonly document_type?: string | null;
  readonly version?: string | null;
  readonly owner?: string | null;
  readonly date?: string | null;
  readonly status?: string | null;
  readonly reference_code?: string | null;
  readonly document_id?: string | null;
}

export interface StrategyOverviewViewModel {
  readonly source_state: StrategySourceState;
  readonly objectives: readonly StrategicObjectiveViewModel[];
  readonly kpis: readonly KpiViewModel[];
  readonly initiatives: readonly InitiativeViewModel[];
  readonly reviews_requiring_attention: readonly PerformanceReviewViewModel[];
  readonly pending_revisions: readonly TargetRevisionViewModel[];
  readonly sources: readonly StrategicSourceDocumentViewModel[];
  readonly generated_at?: string | null;
}

export interface StrategyContext {
  readonly workspaceKey: string;
  readonly workspaceLabel: string;
  readonly divisionCode?: string | null;
  readonly isCompanyWide?: boolean;
}
