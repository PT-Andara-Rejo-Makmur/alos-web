import type {
  FactoryAnalyzeRequest,
  FactoryDecision as CanonicalFactoryDecision,
} from "@/lib/contracts";

export type FactoryDecision = CanonicalFactoryDecision;

/** Presentation projection only; canonical transport remains owned by alos-contracts. */
export interface ExistingCapabilityProjection {
  readonly capabilityId: string;
  readonly version: string;
  readonly name: string;
  readonly capabilityType: string;
  readonly purpose: string;
}

/** Presentation projection only; it cannot approve, register, or activate a draft. */
export interface CapabilityDraftProjection {
  readonly identifier: string;
  readonly version: string;
  readonly purpose: string;
  readonly capabilityType: string;
  readonly scope: readonly string[];
  readonly risk: string;
  readonly tools: readonly string[];
  readonly permissions: readonly string[];
  readonly lifecycleState: "DRAFT";
  readonly readiness: string;
}

export interface FactoryAnalysisProjection {
  readonly decision: FactoryDecision;
  readonly reason: string;
  readonly correlationId: string;
  readonly existingCapabilities: readonly ExistingCapabilityProjection[];
  readonly draft: CapabilityDraftProjection | null;
  readonly registryState: "DRAFT" | null;
}

export type FactoryRequirementCommand = Pick<
  FactoryAnalyzeRequest,
  "requirement" | "preferred_capability_type"
>;

export interface FactoryBackendAdapter {
  analyze(command: FactoryRequirementCommand): Promise<FactoryAnalysisProjection>;
}
