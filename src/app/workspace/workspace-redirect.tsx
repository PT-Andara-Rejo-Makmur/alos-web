"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sessionApiRequest } from "@/lib/api";
import type { SessionProjection } from "@/features/session";

export function WorkspaceModuleRedirect({ module }: { readonly module: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/")
      .then((session) => {
        if (cancelled) return;
        const workspaceKey =
          session?.principal && "actor" in session.principal && session.principal.active_workspace
            ? session.principal.active_workspace.workspace.workspace_key
            : null;
        if (workspaceKey) {
          router.replace(`/workspace/${encodeURIComponent(workspaceKey)}/${module}`);
        } else {
          router.replace("/workspace");
        }
      })
      .catch(() => {
        if (!cancelled) {
          router.replace("/workspace");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [module, router]);

  return <main aria-live="polite">Mengarahkan ke ruang kerja…</main>;
}
