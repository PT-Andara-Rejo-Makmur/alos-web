"use client";

import { use } from "react";

import {
  FindingDetailView,
  SharedWorkDetailRoute,
  fetchFindingDetail,
  type WorkFinding,
} from "@/features/shared-work";

export default function WorkspaceFindingDetailPageRoute({
  params,
}: Readonly<{ params: Promise<{ findingId: string; workspaceKey: string }> }>) {
  const { findingId, workspaceKey } = use(params);
  return (
    <SharedWorkDetailRoute<WorkFinding>
      fetchDetail={fetchFindingDetail}
      id={findingId}
      loadingLabel="Memuat rincian temuan…"
      notFoundTitle="Temuan Tidak Ditemukan"
      renderDetail={(finding, connected, key, session) => <FindingDetailView finding={finding} isConnected={connected} session={session} workspaceKey={key} />}
      title="Temuan"
      workspaceKey={workspaceKey}
    />
  );
}
