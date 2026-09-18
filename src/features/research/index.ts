export const RESEARCH_FEATURE_BOUNDARY = "Research findings and recommendations, not execution" as const;

export { backendResearchAdapter } from "./backend-adapter";
export {
  researchDomains,
  type ResearchBackendAdapter,
  type ResearchDomainOption,
  type ResearchRequestCommand,
  type ResearchRequestReceipt,
  type ResearchSourceMode,
} from "./models";
export { SharedResearchWorkspace } from "./shared-research-workspace";
export * from "@/features/mvp1/lib/genesis-document-analysis";
export * from "@/features/mvp1/lib/genesis-follow-up";
