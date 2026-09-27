"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import type { SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";

import styles from "./workspace.module.css";

type PageState = "loading" | "ready" | "no_access" | "session_expired" | "error";

export default function WorkspacePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        if (!nextSession.authenticated || !nextSession.principal) {
          setSession(null);
          setState("no_access");
        } else {
          setSession(nextSession);
          setState("ready");
        }
      } catch (caught) {
        if (!cancelled) {
          setSession(null);
          setState(caught instanceof ApiError && caught.status === 401 ? "session_expired" : "error");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setState("loading");
    setSession(null);
    setRetryCount((count) => count + 1);
  };

  if (state === "ready" && session) {
    return (
      <AppShell session={session}>
        <section aria-labelledby="workspace-title" className={styles.page}>
          <div className={styles.pageHeader}>
            <p className={styles.eyebrow}>RUANG KERJA</p>
            <h1 className={styles.pageTitle} id="workspace-title">
              ALOS
            </h1>
            <p className={styles.pageDescription}>Antarmuka kerja ALOS sedang disiapkan.</p>
          </div>

          <div className={styles.statusPanel} role="status">
            <span aria-hidden="true" className={styles.statusIcon}>
              <CheckCircle2 size={20} strokeWidth={1.9} />
            </span>
            <div>
              <h2 className={styles.statusTitle}>Fondasi sistem aktif</h2>
              <p className={styles.statusDescription}>
                Login, sesi, dan koneksi aplikasi tetap tersedia selama tampilan utama dibangun
                ulang.
              </p>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <main className={styles.stateContainer}>
      <div className={styles.stateCard}>
        <p className={styles.stateBrand}>ALOS</p>

        {state === "loading" && (
          <div aria-live="polite">
            <div className={styles.loadingSpinner} aria-hidden="true" />
            <p className={styles.stateText}>Memeriksa status akun…</p>
          </div>
        )}

        {state === "no_access" && (
          <div>
            <h1 className={styles.stateTitle}>Anda tidak memiliki akses ke halaman ini.</h1>
            <p className={styles.stateText}>Silakan masuk dengan akun yang memiliki hak akses.</p>
            <div className={styles.stateActions}>
              <button
                className={styles.primaryButton}
                onClick={() => router.replace("/login")}
                type="button"
              >
                Masuk kembali
              </button>
            </div>
          </div>
        )}

        {state === "session_expired" && (
          <div>
            <h1 className={styles.stateTitle}>Sesi Anda sudah berakhir.</h1>
            <p className={styles.stateText}>Silakan masuk kembali untuk melanjutkan.</p>
            <div className={styles.stateActions}>
              <button
                className={styles.primaryButton}
                onClick={() => router.replace("/login")}
                type="button"
              >
                Masuk kembali
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div>
            <h1 className={styles.stateTitle}>Kami belum dapat memuat halaman ini.</h1>
            <p className={styles.stateText}>Koneksi sedang bermasalah. Silakan coba kembali.</p>
            <div className={styles.stateActions}>
              <button className={styles.primaryButton} onClick={handleRetry} type="button">
                Coba lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
