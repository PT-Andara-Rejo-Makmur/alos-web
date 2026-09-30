/** Public facade for generated alos-contracts TypeScript exports. */
export const CONTRACT_SOURCE = "alos-contracts/generated/typescript" as const;

export type {
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
  SharedWorkDocumentVersionProjection,
  SharedWorkFindingCreateRequest,
  SharedWorkFindingProjection,
  SharedWorkFindingSeverity,
  SharedWorkFindingStatus,
  SharedWorkPermission,
  SharedWorkProjectCreateRequest,
  SharedWorkProjectUpdateRequest,
  SharedWorkProjectProjection,
  SharedWorkProjectStatus,
  SharedWorkReportCreateRequest,
  SharedWorkReportProjection,
  SharedWorkReportStatus,
  SharedWorkTaskCreateRequest,
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
  ProvisionAccountRequest,
  ProvisioningCandidateProjection,
  WorkspaceAccessProjection,
  WorkspaceProjection,
  WorkspaceType,
} from "../../../../alos-contracts/generated/typescript/identity-access";

export type {
  BusinessPeriod as StrategyBusinessPeriod,
  BusinessScope as StrategyBusinessScope,
  BusinessTarget,
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
