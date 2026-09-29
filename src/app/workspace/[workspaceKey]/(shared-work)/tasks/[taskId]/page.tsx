"use client";

import { use } from "react";

import {
  SharedWorkDetailRoute,
  TaskDetailView,
  fetchTaskDetail,
  type WorkTask,
} from "@/features/shared-work";

export default function WorkspaceTaskDetailPageRoute({
  params,
}: Readonly<{ params: Promise<{ taskId: string; workspaceKey: string }> }>) {
  const { taskId, workspaceKey } = use(params);
  return (
    <SharedWorkDetailRoute<WorkTask>
      fetchDetail={fetchTaskDetail}
      id={taskId}
      loadingLabel="Memuat rincian tugas…"
      notFoundTitle="Tugas Tidak Ditemukan"
      renderDetail={(task, connected, key) => <TaskDetailView isConnected={connected} task={task} workspaceKey={key} />}
      title="Tugas"
      workspaceKey={workspaceKey}
    />
  );
}
