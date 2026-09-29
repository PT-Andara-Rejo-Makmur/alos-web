"use client";

import { use, useEffect, useState } from "react";
import { LegalAssetsPage } from "@/features/legal";
import { ItModulePage } from "@/features/it";
import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function WorkspaceAssetsRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  const [domain, setDomain] = useState<"IT" | "LEGAL" | "UNKNOWN" | null>(null);
  useEffect(() => { let cancelled = false; void sessionApiRequest<SessionProjection>("/").then((session) => { if (!cancelled) { const resolvedDomain = resolveWorkspaceDomain(session, resolved.workspaceKey).domain; setDomain(resolvedDomain === "IT" || resolvedDomain === "LEGAL" ? resolvedDomain : "UNKNOWN"); } }).catch(() => { if (!cancelled) setDomain("UNKNOWN"); }); return () => { cancelled = true; }; }, [resolved.workspaceKey]);
  if (domain === "IT") return <ItModulePage module="assets" workspaceKey={resolved.workspaceKey} />;
  if (domain === "LEGAL") return <LegalAssetsPage workspaceKey={resolved.workspaceKey} />;
  if (domain === null) return <main aria-live="polite">Memeriksa hak akses…</main>;
  return <main><h1>Anda tidak memiliki akses ke halaman ini.</h1><p>Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.</p></main>;
}
