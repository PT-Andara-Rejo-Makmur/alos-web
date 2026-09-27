import { authenticatedApiRequest, withQuery } from "@/lib/api";

import type { SourceHonestResponse, WorkApproval } from "./approval-types";

export interface FetchApprovalsOptions {
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
  readonly subjectType?: string;
  readonly workspaceKey?: string;
}

export async function fetchApprovals(
  options: FetchApprovalsOptions = {},
): Promise<SourceHonestResponse<readonly WorkApproval[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.subjectType && options.subjectType !== "ALL") query.subject_type = options.subjectType;
  if (options.workspaceKey && options.workspaceKey !== "ALL") query.workspace_key = options.workspaceKey;

  const path = withQuery("/api/v1/approvals", query);

  try {
    const data = await authenticatedApiRequest<readonly WorkApproval[]>(path, {
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
      message: "Data persetujuan belum terhubung. Daftar persetujuan akan ditampilkan setelah sumber data tersedia.",
    };
  }
}

export async function fetchApprovalDetail(
  approvalId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkApproval | null>> {
  if (!approvalId) {
    return { connected: false, data: null, message: "ID Persetujuan tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<WorkApproval>(`/api/v1/approvals/${approvalId}`, {
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
      message: "Data persetujuan belum terhubung. Detail persetujuan akan ditampilkan setelah sumber data tersedia.",
    };
  }
}
