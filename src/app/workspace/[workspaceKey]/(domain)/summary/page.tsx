"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionApiRequest, ApiError } from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import { resolveWorkspaceDomain, type WorkspaceDomainResolution } from "@/features/session";
import { ExecutiveSummaryPage } from "@/features/executive";
import { SalesSummaryPage } from "@/features/sales";
import { PropertySummaryPage } from "@/features/property";
import { FinanceSummaryPage } from "@/features/finance";
import { LegalSummaryPage } from "@/features/legal";
import { HrSummaryPage } from "@/features/hr";
import { ItSummaryPage } from "@/features/it";
import styles from "@/features/sales/sales.module.css";

export default function WorkspaceSummaryPageRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  const { workspaceKey } = resolved;
  const router = useRouter();
  const [resolution, setResolution] = useState<WorkspaceDomainResolution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/")
      .then((session) => {
        if (cancelled) return;
        setResolution(resolveWorkspaceDomain(session, workspaceKey));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setResolution({
          authenticated: !(err instanceof ApiError && err.status === 401),
          valid: false,
          domain: "UNKNOWN",
          activeWorkspaceKey: null,
          workspaceName: null,
          failureReason: err instanceof ApiError && err.status === 401 ? "unauthenticated" : "inactive",
        });
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceKey]);

  if (loading) {
    return (
      <main className={styles.accessState}>
        <div className={styles.accessCard}>
          <p className={styles.accessBrand}>ALOS</p>
          <p aria-live="polite" className={styles.accessText}>Memeriksa hak akses…</p>
        </div>
      </main>
    );
  }

  if (resolution?.valid && resolution.domain === "EXECUTIVE") {
    return <ExecutiveSummaryPage workspaceKey={workspaceKey} />;
  }

  if (resolution?.valid && resolution.domain === "SALES") {
    return <SalesSummaryPage workspaceKey={workspaceKey} />;
  }

  if (resolution?.valid && resolution.domain === "PROPERTY") {
    return <PropertySummaryPage workspaceKey={workspaceKey} />;
  }

  if (resolution?.valid && resolution.domain === "FINANCE") {
    return <FinanceSummaryPage workspaceKey={workspaceKey} />;
  }

  if (resolution?.valid && resolution.domain === "LEGAL") {
    return <LegalSummaryPage workspaceKey={workspaceKey} />;
  }

  if (resolution?.valid && resolution.domain === "HR_GA") {
    return <HrSummaryPage workspaceKey={workspaceKey} />;
  }

  if (resolution?.valid && resolution.domain === "IT") {
    return <ItSummaryPage workspaceKey={workspaceKey} />;
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
