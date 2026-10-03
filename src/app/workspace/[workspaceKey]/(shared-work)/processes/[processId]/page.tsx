"use client";

import { use } from "react";
import type { BusinessProcessProjection } from "@/lib/contracts";
import { authenticatedApiRequest } from "@/lib/api";
import { SharedWorkDetailRoute } from "@/features/shared-work/shared/detail-route";
import { ProcessItem } from "@/features/shared-work/processes/process-queue";

const fetchProcess = async (id: string) => ({ connected: true, data: await authenticatedApiRequest<BusinessProcessProjection>(`/api/v1/processes/${encodeURIComponent(id)}`) });

export default function ProcessDetail({ params }: Readonly<{ params: Promise<{ workspaceKey: string; processId: string }> }>) {
  const { workspaceKey, processId } = use(params);
  return <SharedWorkDetailRoute workspaceKey={workspaceKey} id={processId} fetchDetail={fetchProcess}
    title="Alur Pengajuan" notFoundTitle="Pengajuan tidak ditemukan" loadingLabel="Memuat alur pengajuan…"
    renderDetail={process => <ProcessItem key={process.process_id} initial={process} workspaceKey={workspaceKey} />} />;
}
