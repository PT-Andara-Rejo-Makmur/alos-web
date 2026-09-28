"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import type { SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { activeSalesWorkspaceKey, hasSalesContext } from "./sales-model";
import { salesNavigation } from "./navigation";
import styles from "./sales.module.css";

type AccessState = "loading" | "ready" | "no_access" | "session_expired" | "error";

export function SalesLayout({
  children,
  workspaceKey: requestedWorkspaceKey,
}: Readonly<{
  children: (session: SessionProjection) => ReactNode;
  workspaceKey?: string;
}>) {
  const router = useRouter();
  const [state, setState] = useState<AccessState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void sessionApiRequest<SessionProjection>("/").then((nextSession) => {
      if (cancelled) return;
      const activeWorkspaceKey = activeSalesWorkspaceKey(nextSession);
      if (
        !nextSession.authenticated ||
        !hasSalesContext(nextSession) ||
        !activeWorkspaceKey ||
        (requestedWorkspaceKey !== undefined && requestedWorkspaceKey !== activeWorkspaceKey)
      ) {
        setState("no_access");
      } else {
        setSession(nextSession);
        setState("ready");
      }
    }).catch((caught: unknown) => {
      if (!cancelled) setState(caught instanceof ApiError && caught.status === 401 ? "session_expired" : "error");
    });
    return () => { cancelled = true; };
  }, [requestedWorkspaceKey, retryCount]);

  if (state === "ready" && session) {
    const workspaceKey = activeSalesWorkspaceKey(session);
    if (!workspaceKey) return null;
    return <AppShell navigationSections={salesNavigation(workspaceKey)} session={session}>{children(session)}</AppShell>;
  }

  return <main className={styles.accessState}><div className={styles.accessCard}>
    <p className={styles.accessBrand}>ALOS</p>
    {state === "loading" ? <p aria-live="polite" className={styles.accessText}>Memeriksa hak akses…</p> : state === "session_expired" ? <>
      <h1 className={styles.accessTitle}>Sesi Anda sudah berakhir.</h1><p className={styles.accessText}>Silakan masuk kembali untuk melanjutkan.</p>
      <button className={styles.accessButton} onClick={() => router.replace("/login")} type="button">Masuk kembali</button>
    </> : state === "error" ? <>
      <h1 className={styles.accessTitle}>Halaman belum dapat dimuat.</h1><p className={styles.accessText}>Koneksi sedang bermasalah. Silakan coba kembali.</p>
      <button className={styles.accessButton} onClick={() => { setState("loading"); setRetryCount((count) => count + 1); }} type="button">Coba lagi</button>
    </> : <><h1 className={styles.accessTitle}>Anda tidak memiliki akses ke halaman ini.</h1><p className={styles.accessText}>Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.</p>
      <button className={styles.accessButton} onClick={() => router.replace("/workspace")} type="button">Kembali ke ruang kerja</button></>}
  </div></main>;
}
