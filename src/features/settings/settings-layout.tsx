"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { AppShell } from "@/components/app-shell/app-shell";
import { LoadingState } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { settingsErrorMessage } from "./settings-model";
import { settingsNavigation } from "./navigation";
import { SettingsAccessState } from "./shared/settings-ui";

const SettingsSessionContext = createContext<SessionProjection | null>(null);

type SettingsLayoutState = "loading" | "ready" | "session_expired" | "error";

export function useSettingsSession(): SessionProjection {
  const session = useContext(SettingsSessionContext);
  if (!session) throw new Error("SettingsSessionContext tidak tersedia.");
  return session;
}

export function SettingsLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<SettingsLayoutState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [retryCount, setRetryCount] = useState(0);
  const refreshSession = useCallback(() => {
    setState("loading");
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        if (!nextSession.authenticated || !nextSession.principal) {
          setSession(null);
          setState("session_expired");
          return;
        }
        setSession(nextSession);
        setState("ready");
      } catch (error) {
        if (cancelled) return;
        setLoadError(error);
        setState(error instanceof ApiError && error.status === 401 ? "session_expired" : "error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  if (state === "loading") return <LoadingState label="Memeriksa sesi…" variant="page" />;
  if (state === "session_expired") return <SettingsAccessState text="Silakan masuk kembali untuk membuka Pengaturan." title="Sesi Anda sudah berakhir." />;
  if (state === "error") return <SettingsAccessState retry={() => { setState("loading"); setRetryCount((count) => count + 1); }} text={settingsErrorMessage(loadError)} title="Pengaturan belum dapat dimuat." />;
  if (!session) return null;

  return (
    <SettingsSessionContext.Provider value={session}>
      <AppShell
        navigationSections={settingsNavigation()}
        onWorkspaceSwitchComplete={refreshSession}
        preservePathOnWorkspaceSwitch
        session={session}
      >
        {children}
      </AppShell>
    </SettingsSessionContext.Provider>
  );
}
