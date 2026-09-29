"use client";

import { use, useEffect, useState } from "react";

import { ItAssetDetailPage } from "@/features/it";
import { LegalDetailPage } from "@/features/legal";
import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

type AssetDomain = "IT" | "LEGAL" | "UNKNOWN";

export default function WorkspaceAssetDetailRoute({
  params,
}: Readonly<{
  params:
    | Promise<{ workspaceKey: string; assetId: string }>
    | { workspaceKey: string; assetId: string };
}>) {
  const resolved = "then" in params ? use(params) : params;
  const [domain, setDomain] = useState<AssetDomain | null>(null);

  useEffect(() => {
    let cancelled = false;
    void sessionApiRequest<SessionProjection>("/")
      .then((session) => {
        if (cancelled) return;
        const resolution = resolveWorkspaceDomain(session, resolved.workspaceKey);
        setDomain(
          resolution.valid && (resolution.domain === "IT" || resolution.domain === "LEGAL")
            ? resolution.domain
            : "UNKNOWN",
        );
      })
      .catch(() => {
        if (!cancelled) setDomain("UNKNOWN");
      });
    return () => {
      cancelled = true;
    };
  }, [resolved.workspaceKey]);

  if (domain === "LEGAL") {
    return (
      <LegalDetailPage
        kind="asset"
        recordId={resolved.assetId}
        workspaceKey={resolved.workspaceKey}
      />
    );
  }
  if (domain === "IT") {
    return <ItAssetDetailPage assetId={resolved.assetId} workspaceKey={resolved.workspaceKey} />;
  }
  if (domain === null) return <main aria-live="polite">Memeriksa hak akses…</main>;
  return (
    <main>
      <h1>Anda tidak memiliki akses ke halaman ini.</h1>
      <p>Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.</p>
    </main>
  );
}
