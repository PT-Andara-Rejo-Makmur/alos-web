"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ExecutiveReviewsPage } from "@/features/executive";
import { LegalReviewsPage } from "@/features/legal";
import { resolveWorkspaceDomain, type SessionProjection, type WorkspaceDomainResolution } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";
import styles from "@/features/sales/sales.module.css";

export default function WorkspaceExecutiveReviewsRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  const { workspaceKey } = resolved;
  const router = useRouter();
  const [resolution, setResolution] = useState<WorkspaceDomainResolution | null>(null);

  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/")
      .then((session) => {
        if (!cancelled) setResolution(resolveWorkspaceDomain(session, workspaceKey));
      })
      .catch((error) => {
        if (cancelled) return;
        setResolution({
          authenticated: !(error instanceof ApiError && error.status === 401),
          valid: false,
          domain: "UNKNOWN",
          activeWorkspaceKey: null,
          workspaceName: null,
          failureReason: error instanceof ApiError && error.status === 401 ? "unauthenticated" : "inactive",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceKey]);

  if (resolution?.valid && resolution.domain === "EXECUTIVE") {
    return <ExecutiveReviewsPage workspaceKey={workspaceKey} />;
  }

  if (resolution?.valid && resolution.domain === "LEGAL") {
    return <LegalReviewsPage workspaceKey={workspaceKey} />;
  }

  if (!resolution) {
    return (
      <main className={styles.accessState}>
        <div className={styles.accessCard}>
          <p aria-live="polite" className={styles.accessText}>Memeriksa hak akses…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.accessState}>
      <div className={styles.accessCard}>
        <p className={styles.accessBrand}>ALOS</p>
        <h1 className={styles.accessTitle}>Anda tidak memiliki akses ke halaman ini.</h1>
        <p className={styles.accessText}>Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.</p>
        <button className={styles.accessButton} onClick={() => router.replace("/workspace")} type="button">
          Kembali ke ruang kerja
        </button>
      </div>
    </main>
  );
}
