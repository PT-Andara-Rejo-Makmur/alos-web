"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sessionApiRequest } from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import { hasExecutiveContext, activeExecutiveWorkspaceKey } from "@/features/executive/executive-model";

export default function ExecutiveRoute() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/").then((session) => {
      if (cancelled) return;
      if (session.authenticated && hasExecutiveContext(session)) {
        const key = activeExecutiveWorkspaceKey(session);
        if (key) {
          router.replace(`/workspace/${encodeURIComponent(key)}/summary`);
          return;
        }
      }
      router.replace("/workspace");
    }).catch(() => {
      if (!cancelled) router.replace("/workspace");
    });
    return () => { cancelled = true; };
  }, [router]);

  return <main aria-live="polite">Menyiapkan ruang kerja Eksekutif…</main>;
}
