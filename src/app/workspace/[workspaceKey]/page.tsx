"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

import type { SessionProjection } from "@/features/session";
import { resolveWorkspaceDomain } from "@/features/session";
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
      const resolution = resolveWorkspaceDomain(session, workspaceKey);
      if (!resolution.valid) {
        router.replace("/workspace");
        return;
      }

      const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
      if (resolution.domain === "EXECUTIVE" || resolution.domain === "SALES" || resolution.domain === "PROPERTY" || resolution.domain === "FINANCE" || resolution.domain === "LEGAL") {
        router.replace(`${base}/summary`);
      } else {
        router.replace(`${base}/projects`);
      }
    }).catch(() => {
      if (!cancelled) {
        router.replace("/workspace");
      }
    });
    return () => { cancelled = true; };
  }, [router, workspaceKey]);

  return <main aria-live="polite">Menyiapkan ruang kerja…</main>;
}
