"use client";

import { use } from "react";

import {
  ProjectDetailView,
  SharedWorkDetailRoute,
  fetchProjectDetail,
  type WorkProject,
} from "@/features/shared-work";

export default function WorkspaceProjectDetailPageRoute({
  params,
}: Readonly<{ params: Promise<{ projectId: string; workspaceKey: string }> }>) {
  const { projectId, workspaceKey } = use(params);
  return (
    <SharedWorkDetailRoute<WorkProject>
      fetchDetail={fetchProjectDetail}
      id={projectId}
      loadingLabel="Memuat rincian proyek…"
      notFoundTitle="Proyek Tidak Ditemukan"
      renderDetail={(project, connected, key, session) => (
        <ProjectDetailView isConnected={connected} key={project.id} project={project} session={session} workspaceKey={key} />
      )}
      title="Proyek"
      workspaceKey={workspaceKey}
    />
  );
}
