"use client";

import { use } from "react";

import {
  ApprovalDetailView,
  SharedWorkDetailRoute,
  fetchApprovalDetail,
  type WorkApproval,
} from "@/features/shared-work";

export default function WorkspaceApprovalDetailPageRoute({
  params,
}: Readonly<{ params: Promise<{ approvalId: string; workspaceKey: string }> }>) {
  const { approvalId, workspaceKey } = use(params);
  return (
    <SharedWorkDetailRoute<WorkApproval>
      fetchDetail={fetchApprovalDetail}
      id={approvalId}
      loadingLabel="Memuat rincian persetujuan…"
      notFoundTitle="Persetujuan Tidak Ditemukan"
      renderDetail={(approval, connected, key) => <ApprovalDetailView approval={approval} isConnected={connected} workspaceKey={key} />}
      title="Persetujuan"
      workspaceKey={workspaceKey}
    />
  );
}
