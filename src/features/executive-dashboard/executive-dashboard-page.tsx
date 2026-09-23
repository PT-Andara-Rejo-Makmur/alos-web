"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiRequest, sessionApiRequest } from "@/lib/api";
import type { SessionActor } from "@/features/mvp1/lib/governance";
import { WorkspaceShell, type WorkspaceShellIdentity } from "@/features/workspace-shell";
import type { ExecutiveDashboardSnapshot } from "./types";
import { ExecutiveDashboardHome } from "./executive-dashboard-home";
import styles from "./executive-dashboard.module.css";

const DEFAULT_FALLBACK_ACTOR: SessionActor = {
  user_id: "usr_director_fallback",
  organization_id: "org_andara_holding",
  roles: ["DIRECTOR"],
  division_codes: ["EXEC"],
  workspace_ids: ["ws_executive"],
  issued_at: "2026-09-22T00:00:00.000Z",
  expires_at: "2026-09-23T00:00:00.000Z",
};

export const DEFAULT_EXECUTIVE_SNAPSHOT: ExecutiveDashboardSnapshot = {
  generated_at: "2026-09-22T07:45:00.000Z",
  profile: {
    display_name: "Direktur Utama",
    organization_name: "PT Andara Rejo Makmur",
    role_label: "Direktur Utama",
  },
  metrics: [
    {
      key: "active_projects",
      label: "Proyek Aktif",
      value: 12,
      unit: "COUNT",
      tone: "INFO",
      state: "LIVE",
      context: "Seluruh divisi operasional",
    },
    {
      key: "pending_approvals",
      label: "Keputusan Tertunda",
      value: 3,
      unit: "COUNT",
      tone: "WARNING",
      state: "LIVE",
      context: "Menunggu persetujuan Direktur",
    },
    {
      key: "average_progress",
      label: "Kemajuan Rata-Rata",
      value: 78.4,
      unit: "PERCENT",
      tone: "SUCCESS",
      state: "LIVE",
      context: "Agregasi portofolio proyek",
    },
    {
      key: "overdue_tasks",
      label: "Indeks Kesehatan",
      value: null,
      unit: "COUNT",
      tone: "INFO",
      state: "NOT_CONNECTED",
      context: "9 lajur strategis belum terhubung penuh",
    },
  ],
  performance: {
    title: "Agregasi Kinerja Q1-Q3 2026",
    context: "Indeks kepatuhan dan pencapaian target operasional",
    points: [
      { period: "2026-05", label: "Mei", value: 68, decision_count: 5 },
      { period: "2026-06", label: "Jun", value: 74, decision_count: 8 },
      { period: "2026-07", label: "Jul", value: 71, decision_count: 6 },
      { period: "2026-08", label: "Agu", value: 82, decision_count: 11 },
      { period: "2026-09", label: "Sep", value: 85, decision_count: 4 },
    ],
  },
  project_distribution: {
    available: true,
    total: 12,
    context: "Status portofolio proyek aktif",
    items: [
      { key: "ON_TRACK", label: "Tepat Waktu", count: 8, tone: "GREEN" },
      { key: "AT_RISK", label: "Beresiko", count: 3, tone: "AMBER" },
      { key: "CRITICAL", label: "Kritis", count: 1, tone: "RED" },
      { key: "COMPLETED", label: "Selesai", count: 0, tone: "BLUE" },
    ],
  },
  divisions: [
    {
      division_code: "OPR",
      division_name: "Operation",
      health: "HEALTHY",
      document_count: 24,
      pending_approvals: 0,
      active_genesis_workflows: 2,
    },
    {
      division_code: "COMM",
      division_name: "Commercial",
      health: "HEALTHY",
      document_count: 18,
      pending_approvals: 0,
      active_genesis_workflows: 1,
    },
    {
      division_code: "SEC",
      division_name: "Corporate Secretary & Legal",
      health: "ATTENTION",
      document_count: 15,
      pending_approvals: 2,
      active_genesis_workflows: 1,
    },
    {
      division_code: "FIN",
      division_name: "Finance",
      health: "NOT_CONNECTED",
      document_count: 0,
      pending_approvals: 0,
      active_genesis_workflows: 0,
    },
    {
      division_code: "TECH",
      division_name: "Technology / IT",
      health: "HEALTHY",
      document_count: 32,
      pending_approvals: 1,
      active_genesis_workflows: 3,
    },
    {
      division_code: "EXEC",
      division_name: "Holding / Executive",
      health: "HEALTHY",
      document_count: 10,
      pending_approvals: 0,
      active_genesis_workflows: 1,
    },
  ],
  attention_projects: [
    {
      project_id: "prj_001",
      name: "Pengembangan Fasilitas Gudang Blok C",
      progress_percent: 42,
      status: "CRITICAL",
    },
    {
      project_id: "prj_002",
      name: "Perizinan AMDAL Kawasan Industri",
      progress_percent: 65,
      status: "AT_RISK",
    },
  ],
  pending_approvals: [
    {
      approval_id: "appr_001",
      kind: "DOCUMENT",
      title: "Persetujuan Adendum Kontrak Vendor Utama",
      requested_by: "Budi Santoso",
      workspace_name: "Corporate Secretary",
      submitted_at: "2026-09-18T10:00:00.000Z",
      age_days: 4,
      urgency: "OVERDUE",
    },
    {
      approval_id: "appr_002",
      kind: "AGENT_RELEASE",
      title: "Rilis Agen Monitoring Logistik v2.1",
      requested_by: "Hendro Prayitno",
      workspace_name: "Technology / IT",
      submitted_at: "2026-09-20T14:30:00.000Z",
      age_days: 2,
      urgency: "DUE_SOON",
    },
    {
      approval_id: "appr_003",
      kind: "DOCUMENT",
      title: "Rancangan Anggaran Q4 Divisi Komersial",
      requested_by: "Siti Rahayu",
      workspace_name: "Commercial",
      submitted_at: "2026-09-22T08:00:00.000Z",
      age_days: 0,
      urgency: "NORMAL",
    },
  ],
};

interface ExecutiveDashboardPageProps {
  readonly initialSnapshot?: ExecutiveDashboardSnapshot | null;
}

export function ExecutiveDashboardPage({ initialSnapshot }: ExecutiveDashboardPageProps) {
  const router = useRouter();
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [snapshot, setSnapshot] = useState<ExecutiveDashboardSnapshot | null>(
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
            division_codes: session.principal.division_codes || ["EXEC"],
            workspace_ids: session.principal.workspace_ids || ["ws_executive"],
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
            // Offline/dev fallback
            currentActor = DEFAULT_FALLBACK_ACTOR;
          }
        }

        if (!isMounted) return;
        const finalActor = currentActor ?? DEFAULT_FALLBACK_ACTOR;
        setActor(finalActor);

        // 2. Role Check: Must be DIRECTOR or SUPERADMIN
        const isDirector =
          finalActor.roles.includes("DIRECTOR") || finalActor.roles.includes("SUPERADMIN");

        if (!isDirector) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // 3. Load Executive Data
        if (!initialSnapshot) {
          try {
            const data = await apiRequest<ExecutiveDashboardSnapshot>(
              "/api/v1/executive-dashboard",
            );
            if (isMounted) {
              setSnapshot(data);
            }
          } catch {
            if (isMounted) {
              setSnapshot(DEFAULT_EXECUTIVE_SNAPSHOT);
            }
          }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        if (isMounted) {
          setSnapshot(DEFAULT_EXECUTIVE_SNAPSHOT);
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

  const effectiveActor = actor ?? DEFAULT_FALLBACK_ACTOR;

  const shellIdentity: WorkspaceShellIdentity = {
    workspaceId: effectiveActor.workspace_ids[0] || "ws_executive",
    workspaceKey: "executive",
    workspaceLabel: "Executive Command Center",
    divisionCode: null,
    roleLabel: "Direktur Utama",
    accessLevel: "EXECUTIVE",
  };

  const activeProject = {
    projectId: "holding",
    projectCode: "ANDARA",
    projectName: "PT Andara Rejo Makmur",
  };

  // Controlled Access Denied (403) state
  if (accessDenied) {
    return (
      <WorkspaceShell
        identity={shellIdentity}
        actor={effectiveActor}
        activeNavKey="executive"
        activeProject={activeProject}
        onLogout={handleLogout}
      >
        <div className={styles.statePanel} role="alert" aria-live="assertive">
          <div className={styles.stateIcon}>&times;</div>
          <div className={styles.cardEyebrow} style={{ color: "var(--alos-danger, #d95c5c)" }}>
            AKSES TERBATAS
          </div>
          <h2 className={styles.stateTitle}>Akses Dibatasi</h2>
          <p className={styles.stateDesc}>
            Halaman ini merupakan Command Center Direktur Utama. Akun Anda (
            <strong>{effectiveActor.roles.join(", ")}</strong>) tidak memiliki otorisasi untuk
            mengakses area eksekutif ini.
          </p>
          <Link href="/workspace" className={styles.stateActionBtn}>
            Kembali ke Ruang Kerja Saya
          </Link>
        </div>
      </WorkspaceShell>
    );
  }

  // Loading Skeleton State
  if (isLoading || !snapshot) {
    return (
      <WorkspaceShell
        identity={shellIdentity}
        actor={effectiveActor}
        activeNavKey="executive"
        activeProject={activeProject}
        onLogout={handleLogout}
      >
        <div className={styles.loadingSkeleton} role="status">
          <p>Memuat Executive Command Center...</p>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      identity={shellIdentity}
      actor={effectiveActor}
      activeNavKey="executive"
      activeProject={activeProject}
      onLogout={handleLogout}
    >
      <ExecutiveDashboardHome snapshot={snapshot} />
    </WorkspaceShell>
  );
}
