"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiRequest, sessionApiRequest } from "@/lib/api";
import type { SessionActor } from "@/features/mvp1/lib/governance";
import { WorkspaceShell, type WorkspaceShellIdentity } from "@/features/workspace-shell";
import type { FinanceDashboardSnapshot } from "./types";
import { DEFAULT_FINANCE_SNAPSHOT } from "./finance-dashboard-projection";
import { FinanceDashboardHome } from "./finance-dashboard-home";
import styles from "./finance-dashboard.module.css";

const DEFAULT_FALLBACK_FINANCE_ACTOR: SessionActor = {
  user_id: "usr_finance_fallback",
  organization_id: "org_andara_holding",
  roles: ["MEMBER"],
  division_codes: ["FINANCE"],
  workspace_ids: ["ws_finance_holding"],
  issued_at: "2026-09-22T00:00:00.000Z",
  expires_at: "2026-09-23T00:00:00.000Z",
};

interface FinanceDashboardPageProps {
  readonly initialSnapshot?: FinanceDashboardSnapshot | null;
}

export function FinanceDashboardPage({ initialSnapshot }: FinanceDashboardPageProps) {
  const router = useRouter();
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [snapshot, setSnapshot] = useState<FinanceDashboardSnapshot | null>(
    initialSnapshot ?? null,
  );
  const [accessDenied, setAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialSnapshot);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // 1. Session verification
        let currentActor: SessionActor | null = null;
        try {
          const session = await sessionApiRequest<{
            authenticated: boolean;
            principal?: {
              actor_id: string;
              email: string;
              display_name?: string;
              roles: string[];
              division_codes?: string[];
              workspace_ids?: string[];
            };
          }>("/api/session");

          if (!session.authenticated || !session.principal) {
            router.replace("/login");
            return;
          }

          currentActor = {
            user_id: session.principal.actor_id,
            organization_id: "org_andara_holding",
            roles: session.principal.roles,
            division_codes: session.principal.division_codes || [],
            workspace_ids: session.principal.workspace_ids || [],
            issued_at: "2026-09-22T00:00:00.000Z",
            expires_at: "2026-09-23T00:00:00.000Z",
          };
        } catch {
          // Fallback to /api/v1/whoami
          try {
            currentActor = await apiRequest<SessionActor>("/api/v1/whoami");
          } catch (whoamiErr) {
            if (whoamiErr instanceof ApiError && whoamiErr.status === 401) {
              router.replace("/login");
              return;
            }
            // Offline / preview fallback
            currentActor = DEFAULT_FALLBACK_FINANCE_ACTOR;
          }
        }

        if (!isMounted) return;
        const finalActor = currentActor ?? DEFAULT_FALLBACK_FINANCE_ACTOR;
        setActor(finalActor);

        // 2. Authorization Check:
        // Must have division scope FINANCE, workspace finance, or DIRECTOR / SUPERADMIN role
        const hasFinanceDivision = finalActor.division_codes.includes("FINANCE");
        const hasFinanceWorkspace = finalActor.workspace_ids.some(
          (id) => id.toLowerCase().includes("fin") || id.toLowerCase().includes("finance"),
        );
        const isExecutive =
          finalActor.roles.includes("DIRECTOR") || finalActor.roles.includes("SUPERADMIN");

        const isAuthorized = hasFinanceDivision || hasFinanceWorkspace || isExecutive;

        if (!isAuthorized) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // 3. Load Finance Data
        if (!initialSnapshot) {
          try {
            const data = await apiRequest<FinanceDashboardSnapshot>("/api/v1/finance-dashboard");
            if (isMounted) {
              setSnapshot(data);
            }
          } catch {
            // Source-honest default: all unverified sources are NOT_CONNECTED
            if (isMounted) {
              setSnapshot(DEFAULT_FINANCE_SNAPSHOT);
            }
          }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        if (isMounted) {
          setSnapshot(DEFAULT_FINANCE_SNAPSHOT);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [router, initialSnapshot]);

  async function handleLogout() {
    try {
      await apiRequest<void>("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // Best-effort logout
    }
    window.location.assign(new URL("/login", window.location.origin).href);
  }

  const effectiveActor = actor ?? DEFAULT_FALLBACK_FINANCE_ACTOR;

  const shellIdentity: WorkspaceShellIdentity = {
    workspaceId: effectiveActor.workspace_ids[0] || "ws_finance_holding",
    workspaceKey: "finance",
    workspaceLabel: "Finance Workspace",
    divisionCode: "FINANCE",
    roleLabel: "Finance Manager",
    accessLevel: "MEMBER",
  };

  // Controlled Access Denied (403) state
  if (accessDenied) {
    return (
      <WorkspaceShell
        identity={shellIdentity}
        actor={effectiveActor}
        activeNavKey="overview"
        onLogout={handleLogout}
      >
        <div className={styles.statePanel} role="alert" aria-live="assertive">
          <div className={styles.stateIcon}>&times;</div>
          <div className={styles.cardEyebrow} style={{ color: "var(--alos-danger, #d95c5c)" }}>
            AKSES TERBATAS
          </div>
          <h2 className={styles.stateTitle}>Akses Dibatasi</h2>
          <p className={styles.stateDesc}>
            Halaman ini merupakan operational control room divisi Keuangan. Akun Anda (
            <strong>{effectiveActor.roles.join(", ")}</strong>) tidak memiliki otorisasi untuk
            mengakses area Finance ini.
          </p>
          <Link href="/workspace" className={styles.stateActionBtn}>
            Kembali ke Ruang Kerja Saya
          </Link>
        </div>
      </WorkspaceShell>
    );
  }

  const activeProject = {
    projectId: "none",
    projectCode: "",
    projectName: "Belum tersedia",
  };

  // Loading Skeleton State
  if (isLoading || !snapshot) {
    return (
      <WorkspaceShell
        identity={shellIdentity}
        actor={effectiveActor}
        activeNavKey="overview"
        activeProject={activeProject}
        onLogout={handleLogout}
      >
        <div className={styles.loadingSkeleton} role="status">
          <p>Memuat Finance Command Center...</p>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      identity={shellIdentity}
      actor={effectiveActor}
      activeNavKey="overview"
      activeProject={activeProject}
      onLogout={handleLogout}
    >
      <FinanceDashboardHome snapshot={snapshot} />
    </WorkspaceShell>
  );
}
