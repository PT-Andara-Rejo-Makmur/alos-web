"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button, PageHeader, Section, Status } from "@/components/ui";
import { hasExecutiveContext } from "@/features/executive";
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
    const canOpenExecutive = hasExecutiveContext(session);
    const workspaceKey =
      session.principal && "actor" in session.principal && session.principal.active_workspace
        ? session.principal.active_workspace.workspace.workspace_key
        : null;
    return (
      <AppShell navigationSections={navigationForSession(canOpenExecutive, workspaceKey)} session={session}>
        <section aria-labelledby="workspace-title" className={styles.landing}>
          <PageHeader
            description="Ruang kerja Anda siap digunakan."
            eyebrow="RUANG KERJA"
            title="ALOS"
          />
          <Section
            bordered
            description="Login, sesi, dan koneksi aplikasi tetap tersedia selama modul kerja dibangun secara bertahap."
            title="Fondasi sistem aktif"
          >
            <div className={styles.landingStatus} role="status">
              <Status icon={<CheckCircle2 size={14} strokeWidth={1.9} />} label="Siap digunakan" variant="success" />
              {canOpenExecutive ? (
                <Button onClick={() => router.push("/workspace/executive")} variant="secondary">
                  Buka Pusat Kendali
                </Button>
              ) : null}
            </div>
          </Section>
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
            <div aria-hidden="true" className={styles.loadingSpinner} />
            <p className={styles.stateText}>Memeriksa status akun…</p>
          </div>
        )}

        {state === "no_access" && (
          <div>
            <h1 className={styles.stateTitle}>Anda tidak memiliki akses ke halaman ini.</h1>
            <p className={styles.stateText}>Silakan masuk dengan akun yang memiliki hak akses.</p>
            <div className={styles.stateActions}>
              <button className={styles.primaryButton} onClick={() => router.replace("/login")} type="button">
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
              <button className={styles.primaryButton} onClick={() => router.replace("/login")} type="button">
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
