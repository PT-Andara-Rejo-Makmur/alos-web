"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiRequest, sessionApiRequest } from "@/lib/api";
import type { SessionActor } from "@/features/mvp1/lib/governance";
import {
  WorkspaceShell,
  projectWorkspaceNavigation,
  type WorkspaceShellIdentity,
} from "@/features/workspace-shell";
import type { ItDashboardSnapshot } from "./types";
import { createDefaultItSnapshot } from "./it-dashboard-projection";
import { ItDashboardHome } from "./it-dashboard-home";

const DEFAULT_FALLBACK_IT_ACTOR: SessionActor = {
  user_id: "usr_it_fallback",
  organization_id: "org_andara_holding",
  roles: ["IT_LEAD"],
  division_codes: ["IT"],
  workspace_ids: ["ws_it_holding"],
  issued_at: "2026-09-23T00:00:00.000Z",
  expires_at: "2026-09-24T00:00:00.000Z",
};

interface ItDashboardPageProps {
  readonly initialSnapshot?: ItDashboardSnapshot | null;
}

export function ItDashboardPage({ initialSnapshot }: ItDashboardPageProps) {
  const router = useRouter();
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [snapshot, setSnapshot] = useState<ItDashboardSnapshot | null>(
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
            issued_at: "2026-09-23T00:00:00.000Z",
            expires_at: "2026-09-24T00:00:00.000Z",
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
            currentActor = DEFAULT_FALLBACK_IT_ACTOR;
          }
        }

        if (!isMounted) return;
        const finalActor = currentActor ?? DEFAULT_FALLBACK_IT_ACTOR;
        setActor(finalActor);

        // 2. Authorization Check:
        // Must have division scope IT/TECHNOLOGY, workspace it, or roles IT_LEAD / QA_SECURITY / TECHNICAL_REVIEWER / DIRECTOR / SUPERADMIN
        const hasItDivision = finalActor.division_codes.some((d) =>
          ["IT", "TECHNOLOGY"].includes(d.toUpperCase()),
        );
        const hasItWorkspace = finalActor.workspace_ids.some(
          (id) => id.toLowerCase().includes("it") || id.toLowerCase().includes("technology"),
        );
        const hasItRole = finalActor.roles.some((r) =>
          ["IT_LEAD", "QA_SECURITY", "TECHNICAL_REVIEWER", "DIRECTOR", "SUPERADMIN"].includes(r),
        );

        const isAuthorized = hasItDivision || hasItWorkspace || hasItRole;

        if (!isAuthorized) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // 3. Load IT Snapshot
        if (!initialSnapshot) {
          setSnapshot(createDefaultItSnapshot());
        }
      } catch {
        if (!isMounted) return;
        setAccessDenied(true);
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
  }, [initialSnapshot, router]);

  // Fail-closed 403 state
  if (accessDenied) {
    return (
      <main
        aria-label="Akses Ditolak"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f7f4",
          padding: "24px",
          fontFamily: "var(--font-manrope, sans-serif)",
        }}
      >
        <div
          style={{
            maxWidth: "460px",
            background: "#ffffff",
            padding: "32px",
            borderRadius: "14px",
            border: "1px solid #e7ebe7",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#ea2f29",
              textTransform: "uppercase",
            }}
          >
            403 — AKSES DITOLAK
          </span>
          <h1
            style={{
              fontFamily: "var(--font-cormorant-garamond, serif)",
              fontSize: "1.8rem",
              margin: "8px 0 12px",
              color: "#141619",
            }}
          >
            Bukan Otoritas IT &amp; Technology
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#5a625d", lineHeight: 1.5, margin: "0 0 20px" }}>
            Akun Anda tidak memiliki kewenangan atau scope divisi IT &amp; Technology pada PT
            Andara Rejo Makmur. Akses dibatasi untuk menjaga keamanan infrastruktur dan tata kelola sistem.
          </p>
          <Link
            href="/workspace"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#141619",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Kembali ke Pilihan Workspace
          </Link>
        </div>
      </main>
    );
  }

  // Loading state
  if (isLoading || !snapshot) {
    return (
      <div
        aria-live="polite"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f7f4",
          fontFamily: "var(--font-manrope, sans-serif)",
          color: "#5a625d",
          fontSize: "0.9rem",
        }}
      >
        Memuat IT &amp; Technology Command Center…
      </div>
    );
  }

  const identity: WorkspaceShellIdentity = {
    workspaceId: "ws_it_holding",
    workspaceKey: "it",
    workspaceLabel: "IT Workspace",
    roleLabel: actor?.roles.includes("DIRECTOR")
      ? "Direktur Utama"
      : actor?.roles.includes("QA_SECURITY") || actor?.roles.includes("TECHNICAL_REVIEWER")
        ? "Wakil IT / Security Reviewer"
        : "IT Lead",
    divisionCode: "IT",
  };

  const navigation = projectWorkspaceNavigation(identity, actor);

  return (
    <WorkspaceShell
      activeNavKey="overview"
      identity={identity}
      navigation={navigation}
    >
      <ItDashboardHome snapshot={snapshot} />
    </WorkspaceShell>
  );
}
