"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionApiRequest, ApiError } from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import { resolveWorkspaceDomain, type WorkspaceDomainResolution } from "@/features/session";
import { PropertyBudgetPage } from "@/features/property";
import { FinanceBudgetPage } from "@/features/finance";
import styles from "@/features/sales/sales.module.css";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  const router = useRouter();
  const [resolution, setResolution] = useState<WorkspaceDomainResolution | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/").then((session) => {
      if (cancelled) return;
      setResolution(resolveWorkspaceDomain(session, resolved.workspaceKey));
      setLoading(false);
    }).catch((error) => {
      if (cancelled) return;
      setResolution({ authenticated: !(error instanceof ApiError && error.status === 401), valid: false, domain: "UNKNOWN", activeWorkspaceKey: null, workspaceName: null, failureReason: error instanceof ApiError && error.status === 401 ? "unauthenticated" : "inactive" });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [resolved.workspaceKey]);
  if (loading) return <main className={styles.accessState}><div className={styles.accessCard}><p aria-live="polite" className={styles.accessText}>Memeriksa hak akses…</p></div></main>;
  if (resolution?.valid && resolution.domain === "PROPERTY") return <PropertyBudgetPage workspaceKey={resolved.workspaceKey} />;
  if (resolution?.valid && resolution.domain === "FINANCE") return <FinanceBudgetPage workspaceKey={resolved.workspaceKey} />;
  return <main className={styles.accessState}><div className={styles.accessCard}><h1 className={styles.accessTitle}>Anda tidak memiliki akses ke halaman ini.</h1><p className={styles.accessText}>Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.</p><button className={styles.accessButton} onClick={() => router.replace("/workspace")} type="button">Kembali ke ruang kerja</button></div></main>;
}
