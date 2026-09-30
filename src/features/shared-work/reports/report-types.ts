import type { SourceHonestResponse } from "../shared/types";
import type { SharedWorkReportStatus } from "@/lib/contracts";

export type ReportResultStatus = SharedWorkReportStatus;

export type ReportFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "ON_DEMAND";

export interface WorkReportResult {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly reportType: string;
  readonly periodStart: string | null;
  readonly periodEnd: string | null;
  readonly scope: string | null;
  readonly ownerActorId: string | null;
  readonly ownerName: string | null;
  readonly status: ReportResultStatus | string;
  readonly createdAt: string;
  readonly publishedAt: string | null;
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
  readonly evidenceCount: number | null;
  readonly commentsCount: number | null;
}

export interface WorkReportDefinition {
  readonly dataSources?: readonly string[];
  readonly description?: string | null;
  readonly frequency: ReportFrequency | string;
  readonly id: string;
  readonly name: string;
  readonly ownerName: string | null;
  readonly recipients?: readonly string[];
  readonly reportType: string;
  readonly reviewRequired: boolean;
  readonly scope: string | null;
  readonly sections?: readonly string[];
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
}

export interface ReportFilterState {
  readonly activePrimaryTab: "results" | "definitions";
  readonly frequencyFilter: string;
  readonly search: string;
  readonly statusFilter: string;
  readonly workspaceKey?: string;
}

export type { SourceHonestResponse };
