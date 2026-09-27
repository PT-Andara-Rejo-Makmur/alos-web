"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { authenticatedApiRequest } from "@/lib/api";
import { ExecutiveDashboardHome } from "./executive-dashboard-home";
import type { ExecutiveDashboardSnapshot } from "./types";
import styles from "./executive-dashboard.module.css";

export function ExecutiveDashboardPage({
  initialSnapshot,
}: {
  readonly initialSnapshot?: ExecutiveDashboardSnapshot | null;
}) {
  return (
    <ProtectedDomainWorkspace
      deniedDescription="Halaman ini merupakan Executive Command Center / Pusat Kendali Eksekutif dan memerlukan role serta workspace yang diberikan Backend."
      deniedTitle="Akses Dibatasi"
      divisionCodes={["EXEC", "EXECUTIVE"]}
      loadingLabel="Memuat Pusat Kendali Eksekutif…"
      workspaceKeys={["executive", "director"]}
    >
      {({ actor }) =>
        actor.roles.includes("EXECUTIVE") ? (
          <ExecutiveContent initialSnapshot={initialSnapshot} />
        ) : (
          <section className={styles.statePanel} role="alert">
            <div className={styles.stateIcon} aria-hidden="true">
              <AlertCircle size={24} />
            </div>
            <h2 className={styles.stateTitle}>Akses Eksekutif Dibatasi</h2>
            <p className={styles.stateDesc}>
              Anda tidak memiliki akses untuk melakukan tindakan ini. Backend tidak memberikan hak Direktur untuk sesi ini.
            </p>
            <Link href="/workspace" className={styles.stateActionBtn}>
              Kembali ke Ruang Kerja Saya
            </Link>
          </section>
        )
      }
    </ProtectedDomainWorkspace>
  );
}

function ExecutiveContent({
  initialSnapshot,
}: {
  readonly initialSnapshot?: ExecutiveDashboardSnapshot | null;
}) {
  const [snapshot, setSnapshot] = useState<ExecutiveDashboardSnapshot | null>(initialSnapshot ?? null);
  const [loading, setLoading] = useState(!initialSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    if (initialSnapshot && reloadIndex === 0) return;
    const controller = new AbortController();
    authenticatedApiRequest<ExecutiveDashboardSnapshot>("/api/v1/executive-dashboard", {
      signal: controller.signal,
    })
      .then((data) => {
        setSnapshot(data);
        setError(null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          // Never mask failure as empty data
          setError("Ringkasan eksekutif belum dapat dimuat. Silakan coba lagi beberapa saat.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [initialSnapshot, reloadIndex]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadIndex((prev) => prev + 1);
  };

  if (loading) {
    return <div className="alos-loading-shell">Memuat data eksekutif…</div>;
  }

  if (error) {
    return (
      <div className={styles.statePanel} role="alert">
        <div className={styles.stateIcon} aria-hidden="true">
          <AlertCircle size={24} />
        </div>
        <h2 className={styles.stateTitle}>Kendala Memuat Data</h2>
        <p className={styles.stateDesc}>{error}</p>
        <button type="button" onClick={handleRetry} className={styles.stateActionBtn}>
          Muat Ulang
        </button>
      </div>
    );
  }

  if (!snapshot) return null;
  return <ExecutiveDashboardHome snapshot={snapshot} />;
}
