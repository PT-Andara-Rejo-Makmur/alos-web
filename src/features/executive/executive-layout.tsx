"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import type { SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { hasExecutiveContext } from "./executive-model";
import { executiveNavigation } from "./navigation";
import styles from "./executive.module.css";

type AccessState = "loading" | "ready" | "no_access" | "session_expired";

export function ExecutiveLayout({ children }: Readonly<{
  children: (session: SessionProjection) => ReactNode;
}>) {
  const router = useRouter();
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        if (!nextSession.authenticated || !hasExecutiveContext(nextSession)) {
          setAccessState("no_access");
          return;
        }
        setSession(nextSession);
        setAccessState("ready");
      } catch (caught) {
        if (!cancelled) {
          setAccessState(caught instanceof ApiError && caught.status === 401 ? "session_expired" : "no_access");
        }
      }
    }

    void loadSession();
    return () => { cancelled = true; };
  }, []);

  if (accessState === "ready" && session) {
    return <AppShell navigationSections={executiveNavigation} session={session}>{children(session)}</AppShell>;
  }

  return (
    <main className={styles.accessState}>
      <div className={styles.accessCard}>
        <p className={styles.accessBrand}>ALOS</p>
        {accessState === "loading" ? (
          <p aria-live="polite" className={styles.accessText}>Memeriksa hak akses…</p>
        ) : accessState === "session_expired" ? (
          <>
            <h1 className={styles.accessTitle}>Sesi Anda sudah berakhir.</h1>
            <p className={styles.accessText}>Silakan masuk kembali untuk melanjutkan.</p>
            <button className={styles.accessButton} onClick={() => router.replace("/login")} type="button">Masuk kembali</button>
          </>
        ) : (
          <>
            <h1 className={styles.accessTitle}>Anda tidak memiliki akses ke halaman ini.</h1>
            <p className={styles.accessText}>Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.</p>
            <button className={styles.accessButton} onClick={() => router.replace("/workspace")} type="button">Kembali ke ruang kerja</button>
          </>
        )}
      </div>
    </main>
  );
}
