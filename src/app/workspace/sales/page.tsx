"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sessionApiRequest } from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import { hasSalesContext, activeSalesWorkspaceKey } from "@/features/sales/sales-model";

export default function SalesRoute() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/").then((session) => {
      if (cancelled) return;
      if (session.authenticated && hasSalesContext(session)) {
        const key = activeSalesWorkspaceKey(session);
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

  return <main aria-live="polite">Menyiapkan ruang kerja Sales…</main>;
}
