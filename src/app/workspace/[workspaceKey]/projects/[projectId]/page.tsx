"use client";

import { use, useEffect, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import {
  ProjectDetailView,
  WorkErrorState,
  WorkLoading,
  fetchProjectDetail,
  type WorkProject,
} from "@/features/shared-work";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function WorkspaceProjectDetailPageRoute({
  params,
}: {
  readonly params: Promise<{ projectId: string; workspaceKey: string }>;
}) {
  const { projectId, workspaceKey } = use(params);

  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [project, setProject] = useState<WorkProject | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
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

        const projectResp = await fetchProjectDetail(projectId);
        if (cancelled) return;
        setConnected(projectResp.connected);
        setProject(projectResp.data);
        setProjectLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setSessionLoading(false);
          setProjectLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (sessionLoading || projectLoading) {
    return <WorkLoading label="Memuat rincian proyek…" />;
  }

  if (error || !session) {
    return <WorkErrorState error={error} title="Gagal Memuat Proyek" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, workspaceKey)}
      session={session}
    >
      {project ? (
        <ProjectDetailView
          isConnected={connected}
          project={project}
          workspaceKey={workspaceKey}
        />
      ) : (
        <WorkErrorState
          error={new Error("Data yang Anda cari tidak ditemukan.")}
          title="Proyek Tidak Ditemukan"
        />
      )}
    </AppShell>
  );
}
