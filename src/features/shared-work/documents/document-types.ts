import type {
  CanonicalDataClassification,
  CanonicalDocumentStatus,
  SourceHonestResponse,
} from "../shared/types";

export type DocumentStatusPresentationValue = CanonicalDocumentStatus;
export type DataClassification = CanonicalDataClassification;

export interface WorkDocumentVersion {
  readonly contentHash: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly creatorName: string | null;
  readonly documentId: string;
  readonly sourceId?: string | null;
  readonly sourceVersion?: string | null;
  readonly storageUri?: string | null;
  readonly version: string;
}

export interface WorkDocument {
  readonly approvalsCount: number | null;
  readonly category: string;
  readonly createdAt: string;
  readonly currentVersion: string | null;
  readonly dataClassification: DataClassification;
  readonly description?: string | null;
  readonly effectiveDate?: string | null;
  readonly evidenceCount: number | null;
  readonly expiryDate?: string | null;
  readonly id: string;
  readonly ownerActorId: string | null;
  readonly ownerName: string | null;
  readonly projectCode?: string | null;
  readonly projectId: string | null;
  readonly projectName: string | null;
  readonly status: DocumentStatusPresentationValue | string;
  readonly tasksCount: number | null;
  readonly title: string;
  readonly updatedAt: string;
  readonly versions?: readonly WorkDocumentVersion[];
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
}

export interface DocumentFilterState {
  readonly activeTab: string;
  readonly category: string;
  readonly classification: string;
  readonly search: string;
  readonly status: string;
  readonly workspaceKey?: string;
}

export type { SourceHonestResponse };
