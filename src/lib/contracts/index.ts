/** Public facade for generated alos-contracts TypeScript exports. */
export const CONTRACT_SOURCE = "alos-contracts/generated/typescript" as const;
export type { AraAuthorityProjection, AraMessageProjection, AraMessageRequest, AraRunProjection,
  AraThreadProjection, AraResponseProjection, AraProgressProjection, AraActionProposalProjection, AraTaskExecutionReceipt } from "../../../../alos-contracts/generated/typescript/ara";

export type {
  SharedWorkMaterialAction,
  SharedWorkMaterialActionProjection,
  SharedWorkApprovalDecision,
  SharedWorkApprovalDecisionRequest,
  SharedWorkApprovalProjection,
  SharedWorkApprovalRequest,
  SharedWorkApprovalStatus,
  SharedWorkApprovalSubjectType,
  SharedWorkDataClassification,
  SharedWorkDocumentCreateRequest,
  SharedWorkDocumentProjection,
  SharedWorkDocumentStatus,
  SharedWorkDocumentVersionCreateRequest,
  SharedWorkDocumentSourceOptionProjection,
  SharedWorkDocumentVersionProjection,
  SharedWorkFindingCreateRequest,
  SharedWorkFindingUpdateRequest,
  SharedWorkFindingAssignmentRequest,
  SharedWorkFindingProjection,
  SharedWorkFindingSeverity,
  SharedWorkFindingStatus,
  SharedWorkPermission,
  SharedWorkWorkspaceMemberProjection,
  SharedWorkEntityType,
  SharedWorkRelationProjection,
  SharedWorkDocumentLinkRequest,
  SharedWorkChecklistEntityType,
  SharedWorkChecklistCreateRequest,
  SharedWorkChecklistItemProjection,
  SharedWorkEvidenceCandidateProjection,
  SharedWorkEvidenceProjection,
  SharedWorkActivityProjection,
  SharedWorkCommentProjection,
  SharedWorkProjectCreateRequest,
  SharedWorkProjectUpdateRequest,
  SharedWorkProjectProjection,
  SharedWorkProjectStatus,
  SharedWorkReportCreateRequest,
  SharedWorkReportDefinitionCreateRequest,
  SharedWorkReportDefinitionProjection,
  SharedWorkReportDefinitionUpdateRequest,
  SharedWorkReportFrequency,
  SharedWorkReportProjection,
  SharedWorkReportStatus,
  SharedWorkTaskCreateRequest,
  SharedWorkTaskDependencyProjection,
  SharedWorkTaskDependencyRequest,
  SharedWorkTaskUpdateRequest,
  SharedWorkTaskAssignRequest,
  SharedWorkTaskPriority,
  SharedWorkTaskProjection,
  SharedWorkTaskStatus,
} from "../../../../alos-contracts/generated/typescript/shared-work";

export type {
  AgentDraft,
  CapabilityCatalogItem,
  CapabilityDetail,
  CapabilityDraft,
  CapabilityType,
  FactoryAnalyzeRequest,
  FactoryAnalyzeResponse,
  FactoryDecision,
  RegistryDraftReference,
  RegistryDraftResult,
  RiskLevel,
} from "../../../../alos-contracts/generated/typescript/factory";

export type {
  ContentTrust,
  ContextLifecycleState,
  ContextBundle,
  ContextItem,
  ContextProjection,
  DataClassification,
  EvidenceBundle,
  EvidenceRef,
  EvidenceValidationStatus,
  FreshnessStatus,
  ResearchDecision,
  ResearchDecisionKind,
  ResearchDomain,
  ResearchDomainAccessRecord,
  ResearchDomainAccessResponse,
  ResearchDomainAccessStatus,
  ResearchRequest,
  ResearchRequestReceipt,
  ResearchRequestState,
  ResearchSourceMode,
  SourceReliability,
  SourceType,
  SourceType as ContractSourceType,
} from "../../../../alos-contracts/generated/typescript/context-research";

export type {
  AccountAccessProjection,
  AccountStateProjection,
  ActivateAccountRequest,
  ActivateAccountResponse,
  ActiveWorkspaceProjection,
  AdminSessionProjection,
  ActorProjection,
  AuthenticatedPrincipalProjection,
  AuthorizationRole,
  IdentityDataScope,
  IdentityAccountProjection,
  IdentityAuditProjection,
  MembershipMutationRequest,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  ProvisionAccountRequest,
  ProvisioningCandidateProjection,
  ResendActivationRequest,
  ResendActivationResponse,
  WorkspaceAccessProjection,
  WorkspaceProjection,
  WorkspaceType,
} from "../../../../alos-contracts/generated/typescript/identity-access";

export type {
  BusinessPeriod as StrategyBusinessPeriod,
  BusinessScope as StrategyBusinessScope,
  BusinessTarget as CanonicalBusinessTarget,
  BusinessTargetCreateRequest,
  BusinessTargetUpdateRequest,
  StrategyVerificationRequest,
  StrategyOverviewProjection,
  TargetRevisionResponse,
  CascadeRun,
  BusinessTargetDetail,
  CascadeAcceptRequest,
  CascadePreviewRequest,
  CascadeRule,
  MetricObservationCreateRequest,
  PlanningAssumptionCreateRequest,
  StrategicObjectiveCreateRequest,
  StrategyPlanUpdateRequest,
  TargetRevision,
  TargetRevisionCreateRequest,
  TargetRelationshipCreateRequest,
  BusinessUnit,
  CascadePreview,
  CascadeRunStatus,
  ConstraintResult as StrategyConstraintResult,
  ConstraintResultState,
  MeasurementType as StrategyMeasurementType,
  MetricObservation,
  MetricValueKind,
  PlanningAssumption,
  StrategicObjective,
  StrategyLifecycleState,
  StrategyAuthorityProjection,
  StrategyPlan,
  StrategyPlanCreateRequest,
  TargetRelationship,
  VerificationState as StrategyVerificationState,
  VersionRef,
} from "../../../../alos-contracts/generated/typescript/strategy";

/**
 * Narrow bootstrap projection of IntegrationDiagnostic. Replace this declaration
 * with the generated export when alos-contracts is published as a package.
 */
export interface IntegrationDiagnostic {
  readonly correlation_id: string;
  readonly status: "connected";
  readonly backend: {
    readonly service: "alos-backend";
    readonly status: "reachable";
    readonly authority: "ALOS_BACKEND";
  };
  readonly genesis: {
    readonly service: "genesis-ai";
    readonly status: "reachable";
    readonly role: "AI_CONTROL_PLANE";
    readonly authoritative_business_state: false;
    readonly provider_required: false;
    readonly correlation_id: string;
  };
}

export type {
  ExecutiveOverviewProjection,
  ExecutiveDomainStatus,
  ExecutiveSourceStatus,
  ExecutiveConnectionStatus,
  ExecutiveSharedWorkSummary,
} from "../../../../alos-contracts/generated/typescript/executive";

/** Existing Web view enrichment from the canonical target detail response. */
export type BusinessTarget = import("../../../../alos-contracts/generated/typescript/strategy").BusinessTarget
  & Partial<Pick<import("../../../../alos-contracts/generated/typescript/strategy").BusinessTargetDetail, "observations" | "selected_observations" | "authorized_actions" | "last_updated_at">>;

export type * from "../../../../alos-contracts/generated/typescript/sales";

export type * from "../../../../alos-contracts/generated/typescript/marketing";

export type * from "../../../../alos-contracts/generated/typescript/property";

export type * from "../../../../alos-contracts/generated/typescript/finance";
export type * from "../../../../alos-contracts/generated/typescript/it";
export type * from "../../../../alos-contracts/generated/typescript/hr";
export type * from "../../../../alos-contracts/generated/typescript/legal";
export type * from "../../../../alos-contracts/generated/typescript/process";
export type { AnalyticsGranularity, AnalyticsPeriod, AnalyticsPoint, AnalyticsSeries, AnalyticsBreakdownItem, AnalyticsBreakdown, AnalyticsComparisonItem, AnalyticsComparison, BusinessAnalyticsProjection, BusinessMetric, BusinessSummary, BusinessPerformance, BusinessPerformanceAttentionItem, BusinessWorkQueue, BusinessNotification, BusinessNotificationOverview, BusinessRelationship, BusinessRelationshipOverview, MetricBindingRequest, MetricBindingProjection, MetricCalculationRequest } from "../../../../alos-contracts/generated/typescript/business";
export type * from "../../../../alos-contracts/generated/typescript/document";
export type { BusinessProjectRecord, BusinessProjectRecordOverview } from "../../../../alos-contracts/generated/typescript/business";
