export type {
  CanonicalProjectStatus,
  RelationshipCounts,
  SourceHonestResponse,
  WorkProject,
} from "../shared/types";

export interface ProjectFilterState {
  readonly activeTab: string;
  readonly search: string;
  readonly status: string;
  readonly workspaceKey?: string;
}
