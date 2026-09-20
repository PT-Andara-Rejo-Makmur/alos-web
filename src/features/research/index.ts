export const RESEARCH_FEATURE_BOUNDARY = "Research findings and recommendations, not execution" as const;

export { backendResearchAdapter } from "./backend-adapter";
export {
  projectBackendDomainAccess,
  researchDomains,
  type ResearchBackendAdapter,
  type ResearchDomainAccessStatus,
  type ResearchDomainAccessRecord,
  type ResearchDomainAccessResponse,
  type ResearchDomainId,
  type ResearchDomainOption,
  type ResearchDomainPermissionState,
  type ResearchRequestCommand,
  type ResearchRequestReceipt,
  type ResearchSourceMode,
} from "./models";
export { RdPermissionPanel } from "./rd-permission-panel";
export { SharedResearchWorkspace } from "./shared-research-workspace";
export * from "@/features/mvp1/lib/genesis-document-analysis";
export * from "@/features/mvp1/lib/genesis-follow-up";
