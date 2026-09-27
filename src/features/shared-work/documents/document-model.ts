import { authenticatedApiRequest, withQuery } from "@/lib/api";

import type { SourceHonestResponse, WorkDocument } from "./document-types";

export interface FetchDocumentsOptions {
  readonly category?: string;
  readonly classification?: string;
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
  readonly workspaceKey?: string;
}

export async function fetchDocuments(
  options: FetchDocumentsOptions = {},
): Promise<SourceHonestResponse<readonly WorkDocument[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.category && options.category !== "ALL") query.category = options.category;
  if (options.classification && options.classification !== "ALL") query.classification = options.classification;
  if (options.workspaceKey && options.workspaceKey !== "ALL") query.workspace_key = options.workspaceKey;

  const path = withQuery("/api/v1/documents", query);

  try {
    const data = await authenticatedApiRequest<readonly WorkDocument[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch {
    return {
      connected: false,
      data: [],
      message: "Data dokumen belum terhubung. Daftar dokumen akan ditampilkan setelah sumber data tersedia.",
    };
  }
}

export async function fetchDocumentDetail(
  documentId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkDocument | null>> {
  if (!documentId) {
    return { connected: false, data: null, message: "ID Dokumen tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<WorkDocument>(`/api/v1/documents/${documentId}`, {
      signal,
    });
    return {
      connected: true,
      data,
    };
  } catch {
    return {
      connected: false,
      data: null,
      message: "Data dokumen belum terhubung. Detail dokumen akan ditampilkan setelah sumber data tersedia.",
    };
  }
}
