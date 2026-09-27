"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionApiRequest } from "@/lib/api";
import type { SessionProjection } from "@/features/session";
import styles from "./workspace.module.css";

type PageState = "loading" | "ready" | "no_access" | "error";

export default function WorkspacePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");

  const checkSession = useCallback(async () => {
    setState("loading");
    try {
      const session = await sessionApiRequest<SessionProjection>("/");
      if (!session.authenticated || !session.principal) {
        setState("no_access");
      } else {
        setState("ready");
      }
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const handleLogout = async () => {
    try {
      await sessionApiRequest("/", { method: "DELETE" });
    } catch {
      // Clear client state on failure
    }
    router.replace("/login");
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandLogo} aria-hidden="true">
            A
          </div>
          <span className={styles.brandTitle}>ALOS</span>
        </div>

        {state === "loading" && (
          <div>
            <div className={styles.loadingSpinner} aria-hidden="true" />
            <p className={styles.subtext}>Memeriksa status akun…</p>
          </div>
        )}

        {state === "ready" && (
          <div>
            <h1 className={styles.title}>Antarmuka ALOS sedang dibangun ulang.</h1>
            <p className={styles.subtext}>Fondasi sistem dan data tetap tersedia.</p>
            <div className={styles.actions}>
              <button
                className={styles.button}
                onClick={() => void handleLogout()}
                type="button"
              >
                Keluar
              </button>
            </div>
          </div>
        )}

        {state === "no_access" && (
          <div>
            <h1 className={styles.title}>Anda tidak memiliki akses ke halaman ini.</h1>
            <p className={styles.subtext}>Silakan masuk dengan akun yang memiliki hak akses.</p>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
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
            <h1 className={styles.title}>Kami belum dapat memuat halaman ini. Silakan coba lagi.</h1>
            <p className={styles.subtext}>Terjadi kendala saat memuat status. Silakan ulangi beberapa saat lagi.</p>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={() => void checkSession()}
                type="button"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
