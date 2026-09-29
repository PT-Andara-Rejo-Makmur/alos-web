"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

import { hasSalesContext, activeSalesWorkspaceKey } from "@/features/sales/sales-model";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function WorkspaceKeyRoot({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolvedParams = "then" in params ? use(params) : params;
  const { workspaceKey } = resolvedParams;
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/").then((session) => {
      if (cancelled) return;
      if (session.authenticated && hasSalesContext(session) && activeSalesWorkspaceKey(session) === workspaceKey) {
        router.replace(`/workspace/${encodeURIComponent(workspaceKey)}/summary`);
      } else {
        router.replace(`/workspace/${encodeURIComponent(workspaceKey)}/projects`);
      }
    }).catch(() => {
      if (!cancelled) {
        router.replace(`/workspace/${encodeURIComponent(workspaceKey)}/projects`);
      }
    });
    return () => { cancelled = true; };
  }, [router, workspaceKey]);

  return <main aria-live="polite">Menyiapkan ruang kerja…</main>;
}
