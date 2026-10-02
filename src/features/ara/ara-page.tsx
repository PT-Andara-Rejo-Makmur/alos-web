"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import type { SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { extractAraContext, type AraContext } from "./ara-model";
import { AraConversation } from "./ara-conversation";
import { araApi } from "./api";
import type { AraAuthorityProjection } from "@/lib/contracts";
import styles from "./ara.module.css";

type AccessState = "loading" | "ready" | "no_access" | "session_expired" | "error";

interface AraPageProps {
  readonly workspaceKey?: string | null;
  readonly embed?: boolean;
}

function AraAccess({ workspaceKey, embed }: AraPageProps) {
  const router = useRouter();
  const [state, setState] = useState<AccessState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [context, setContext] = useState<AraContext | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [authority, setAuthority] = useState<AraAuthorityProjection | null>(null);

  useEffect(() => {
    let cancelled = false;
    sessionApiRequest<SessionProjection>("/")
      .then(async (nextSession) => {
        if (cancelled) return;
        if (!extractAraContext(nextSession, workspaceKey)) { setState("no_access"); return; }
        const backendAuthority = await araApi.authority();
        if (cancelled) return;
        const araContext = extractAraContext(nextSession, workspaceKey, backendAuthority.maximum_data_classification);
        if (!araContext) {
          setState("no_access");
        } else if (araContext.tenantId === backendAuthority.tenant_id &&
          araContext.organizationId === backendAuthority.organization_id &&
          araContext.actor.actorId === backendAuthority.actor_id &&
          araContext.activeWorkspace.workspaceId === backendAuthority.workspace_id && backendAuthority.status === "ACTIVE") {
          setSession(nextSession);
          setContext(araContext);
          setAuthority(backendAuthority);
          setState("ready");
        } else { setState("no_access"); }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState(error instanceof ApiError && error.status === 401 ? "session_expired" : "error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceKey, retryCount]);

  if (state === "ready" && context && session && authority) {
    const inner = <AraConversation key={`${authority.tenant_id}:${authority.organization_id}:${authority.workspace_id}:${authority.actor_id}`} authority={authority} workspaceName={context.activeWorkspace.workspaceName} />;
    if (embed) return inner;

    const canExecutive = hasExecutiveContext(session);
    return (
      <AppShell
        navigationSections={navigationForSession(
          canExecutive,
          context.activeWorkspace.workspaceKey,
          false,
          session,
        )}
        session={session}
      >
        {inner}
      </AppShell>
    );
  }

  return (
    <main className={styles.accessState}>
      <div className={styles.accessCard}>
        <p className={styles.accessBrand}>ALOS</p>
        {state === "loading" ? (
          <p aria-live="polite" className={styles.accessText}>
            Memeriksa hak akses ARA…
          </p>
        ) : state === "session_expired" ? (
          <>
            <h1 className={styles.accessTitle}>Sesi Anda sudah berakhir.</h1>
            <p className={styles.accessText}>Silakan masuk kembali untuk melanjutkan.</p>
            <button
              className={styles.accessButton}
              onClick={() => router.replace("/login")}
              type="button"
            >
              Masuk kembali
            </button>
          </>
        ) : state === "error" ? (
          <>
            <h1 className={styles.accessTitle}>Halaman belum dapat dimuat.</h1>
            <p className={styles.accessText}>Koneksi sedang bermasalah. Silakan coba kembali.</p>
            <button
              className={styles.accessButton}
              onClick={() => {
                setState("loading");
                setRetryCount((count) => count + 1);
              }}
              type="button"
            >
              Coba lagi
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.accessTitle}>Anda tidak memiliki akses ke halaman ini.</h1>
            <p className={styles.accessText}>Halaman ini tersedia sesuai ruang kerja dan kewenangan Anda.</p>
            <button
              className={styles.accessButton}
              onClick={() => router.replace("/workspace")}
              type="button"
            >
              Kembali ke ruang kerja
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export function AraPage(props: AraPageProps) {
  return <AraAccess key={props.workspaceKey ?? "active-workspace"} {...props} />;
}
