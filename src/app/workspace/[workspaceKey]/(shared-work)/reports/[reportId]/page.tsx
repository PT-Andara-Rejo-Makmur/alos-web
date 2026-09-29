"use client";

import { use } from "react";

import {
  ReportDetailView,
  SharedWorkDetailRoute,
  fetchReportDetail,
  type WorkReportResult,
} from "@/features/shared-work";

export default function WorkspaceReportDetailPageRoute({
  params,
}: Readonly<{ params: Promise<{ reportId: string; workspaceKey: string }> }>) {
  const { reportId, workspaceKey } = use(params);
  return (
    <SharedWorkDetailRoute<WorkReportResult>
      fetchDetail={fetchReportDetail}
      id={reportId}
      loadingLabel="Memuat rincian laporan…"
      notFoundTitle="Laporan Tidak Ditemukan"
      renderDetail={(report, connected, key) => <ReportDetailView isConnected={connected} report={report} workspaceKey={key} />}
      title="Laporan"
      workspaceKey={workspaceKey}
    />
  );
}
