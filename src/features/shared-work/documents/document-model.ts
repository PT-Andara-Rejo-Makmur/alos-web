import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type { SharedWorkDocumentCreateRequest, SharedWorkDocumentProjection, SharedWorkDocumentSourceOptionProjection, SharedWorkDocumentVersionCreateRequest, SharedWorkDocumentVersionProjection } from "@/lib/contracts";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type { SourceHonestResponse, WorkDocument, WorkDocumentVersion } from "./document-types";

export interface FetchDocumentsOptions {
  readonly category?: string;
  readonly classification?: string;
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
}

export function documentFromProjection(document: SharedWorkDocumentProjection): WorkDocument {
  return {
    id: document.document_id,
    title: document.title,
    category: document.category,
    dataClassification: document.data_classification,
    status: document.status,
    ownerActorId: document.owner_actor_id,
    ownerName: document.owner_name ?? null,
    workspaceIds: [document.workspace_id],
    workspaceName: document.workspace_name ?? null,
    createdAt: document.created_at,
    updatedAt: document.updated_at ?? null,
    currentVersion: document.current_version ?? null,
    versions: null,
    projectId: document.project_id ?? null,
    projectName: document.project_name ?? null,
    projectCode: document.project_code ?? null,
    description: document.description ?? null,
    effectiveDate: document.effective_date ?? null,
    expiryDate: document.expiry_date ?? null,
    tasksCount: document.tasks_count ?? null,
    approvalsCount: document.approvals_count ?? null,
    evidenceCount: document.evidence_count ?? null,
  };
}

export function documentVersionFromProjection(version: SharedWorkDocumentVersionProjection): WorkDocumentVersion {
  return {
    documentId: version.document_id,
    version: version.version,
    sourceId: version.source_id,
    sourceTitle: version.source_title ?? null,
    sourceVersion: version.source_version,
    storageUri: version.storage_uri,
    contentHash: version.content_hash,
    createdBy: version.created_by,
    creatorName: version.creator_name ?? null,
    createdAt: version.created_at,
  };
}

export async function fetchDocuments(
  options: FetchDocumentsOptions = {},
): Promise<SourceHonestResponse<readonly WorkDocument[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.category && options.category !== "ALL") query.category = options.category;
  if (options.classification && options.classification !== "ALL") query.classification = options.classification;

  const path = withQuery("/api/v1/documents", query);

  try {
    const data = await authenticatedApiRequest<readonly SharedWorkDocumentProjection[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data.map(documentFromProjection) : [],
    };
  } catch (error) {
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: [],
      sourceState,
      message: sourceStateCopy(sourceState, "Dokumen").message,
    };
  }
}

export async function fetchDocumentDetail(
  documentId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkDocument | null>> {
  if (!documentId) {
    return { connected: false, data: null, sourceState: "validation", message: "ID Dokumen tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<SharedWorkDocumentProjection>(`/api/v1/documents/${encodeURIComponent(documentId)}`, {
      signal,
    });
    const versions = await authenticatedApiRequest<readonly SharedWorkDocumentVersionProjection[]>(
      `/api/v1/documents/${encodeURIComponent(documentId)}/versions`, { signal },
    );
    const history = versions.map(documentVersionFromProjection);
    return {
      connected: true,
      data: { ...documentFromProjection(data), versions: history, currentVersion: history[0]?.version ?? null },
    };
  } catch (error) {
    const sourceState = sourceStateFor(error, "detail");
    return {
      connected: false,
      data: null,
      sourceState,
      message: sourceStateCopy(sourceState, "Dokumen").message,
    };
  }
}

export async function createDocument(request: SharedWorkDocumentCreateRequest): Promise<WorkDocument> {
  const data = await authenticatedApiRequest<SharedWorkDocumentProjection>("/api/v1/documents", {
    method: "POST", body: request,
  });
  return documentFromProjection(data);
}

export async function fetchDocumentSourceOptions(documentId: string): Promise<readonly SharedWorkDocumentSourceOptionProjection[]> {
  return authenticatedApiRequest<readonly SharedWorkDocumentSourceOptionProjection[]>(
    `/api/v1/documents/${encodeURIComponent(documentId)}/source-options`,
  );
}

export async function createDocumentVersion(documentId: string, request: SharedWorkDocumentVersionCreateRequest): Promise<WorkDocumentVersion> {
  const data = await authenticatedApiRequest<SharedWorkDocumentVersionProjection>(
    `/api/v1/documents/${encodeURIComponent(documentId)}/versions`,
    { method: "POST", body: request },
  );
  return documentVersionFromProjection(data);
}

export async function reviewDocument(documentId: string): Promise<WorkDocument> {
  const data = await authenticatedApiRequest<SharedWorkDocumentProjection>(
    `/api/v1/documents/${encodeURIComponent(documentId)}/review`,
    { method: "POST" },
  );
  return documentFromProjection(data);
}

export async function approveDocument(documentId: string): Promise<WorkDocument> {
  const data = await authenticatedApiRequest<SharedWorkDocumentProjection>(
    `/api/v1/documents/${encodeURIComponent(documentId)}/approve`,
    { method: "POST" },
  );
  return documentFromProjection(data);
}

export async function retireDocument(documentId: string): Promise<WorkDocument> {
  const data = await authenticatedApiRequest<SharedWorkDocumentProjection>(
    `/api/v1/documents/${encodeURIComponent(documentId)}/retire`,
    { method: "POST" },
  );
  return documentFromProjection(data);
}

