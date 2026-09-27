"use client";

import { use, useEffect, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import {
  TaskDetailView,
  WorkErrorState,
  WorkLoading,
  fetchTaskDetail,
  type WorkTask,
} from "@/features/shared-work";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function WorkspaceTaskDetailPageRoute({
  params,
}: {
  readonly params: Promise<{ taskId: string; workspaceKey: string }>;
}) {
  const { taskId, workspaceKey } = use(params);

  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [task, setTask] = useState<WorkTask | null>(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        setSession(nextSession);
        setSessionLoading(false);

        const taskResp = await fetchTaskDetail(taskId);
        if (cancelled) return;
        setConnected(taskResp.connected);
        setTask(taskResp.data);
        setTaskLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setSessionLoading(false);
          setTaskLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  if (sessionLoading || taskLoading) {
    return <WorkLoading label="Memuat rincian tugas…" />;
  }

  if (error || !session) {
    return <WorkErrorState error={error} title="Gagal Memuat Tugas" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, workspaceKey)}
      session={session}
    >
      {task ? (
        <TaskDetailView
          isConnected={connected}
          task={task}
          workspaceKey={workspaceKey}
        />
      ) : (
        <WorkErrorState
          error={new Error("Data tugas yang Anda cari tidak ditemukan.")}
          title="Tugas Tidak Ditemukan"
        />
      )}
    </AppShell>
  );
}
