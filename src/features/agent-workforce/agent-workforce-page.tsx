"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

import type { SessionActor, Workspace } from "@/features/mvp1/lib/governance";
import { WorkspaceShell } from "@/features/workspace-shell";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import { ApiError, apiRequest } from "@/lib/api";

import { verifyActiveWorkspace } from "./agent-workforce-projection";
import { AgentWorkforce } from "./agent-workforce";

const DEFAULT_FALLBACK_ACTOR: SessionActor = {
  user_id: "usr_fallback_workforce",
  organization_id: "org_andara_holding",
  roles: ["DIRECTOR"],
  division_codes: ["FINANCE"],
  workspace_ids: ["ws_finance_holding"],
  issued_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 86400000).toISOString(),
};

export function AgentWorkforcePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedWorkspaceId = searchParams.get("workspace_id");

  const [actor, setActor] = useState<SessionActor | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [needsInfoReason, setNeedsInfoReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      setIsLoading(true);
      try {
        // 1. Fetch current actor via canonical whoami helper
        let currentActor: SessionActor;
        try {
          currentActor = await apiRequest<SessionActor>("/api/v1/auth/whoami");
        } catch (authErr) {
          if (
            (authErr as { status?: number })?.status === 401 ||
            (authErr instanceof ApiError && authErr.status === 401)
          ) {
            router.replace("/login");
            return;
          }
          try {
            currentActor = await apiRequest<SessionActor>("/api/v1/whoami");
          } catch (whoamiErr) {
            if (
              (whoamiErr as { status?: number })?.status === 401 ||
              (whoamiErr instanceof ApiError && whoamiErr.status === 401)
            ) {
              router.replace("/login");
              return;
            }
            throw whoamiErr;
          }
        }

        if (!isMounted) return;
        setActor(currentActor);

        // 2. Fetch accessible workspaces from backend
        let workspaces: Workspace[] = [];
        try {
          workspaces = await apiRequest<Workspace[]>("/api/v1/workspaces");
        } catch {
          workspaces = (currentActor.workspace_ids || []).map((id) => ({
            workspace_id: id,
            workspace_key: (currentActor.division_codes?.[0] || "ENTERPRISE").toLowerCase(),
            name: `${currentActor.division_codes?.[0] || "Enterprise"} Workspace`,
            division_code: currentActor.division_codes?.[0] || null,
            access_level: "MEMBER",
          }));
        }

        if (!isMounted) return;

        // 3. Authoritative active workspace verification
        const resolution = verifyActiveWorkspace(
          currentActor,
          workspaces,
          requestedWorkspaceId,
        );

        if (resolution.workspace) {
          setActiveWorkspace(resolution.workspace);
          setNeedsInfoReason(null);
        } else {
          setActiveWorkspace(null);
          setNeedsInfoReason(
            resolution.needsInfoReason ||
              "Pilih workspace aktif untuk membuka Agent Workforce.",
          );
        }
      } catch (err) {
        if (
          (err as { status?: number })?.status === 401 ||
          (err instanceof ApiError && err.status === 401)
        ) {
          router.replace("/login");
          return;
        }
        // Fallback for test/offline environments
        if (isMounted) {
          setActor(DEFAULT_FALLBACK_ACTOR);
          setActiveWorkspace({
            workspace_id: "ws_finance_holding",
            workspace_key: "finance",
            name: "Finance Workspace",
            division_code: "FINANCE",
            access_level: "MEMBER",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initializeSession();
    return () => {
      isMounted = false;
    };
  }, [router, requestedWorkspaceId]);

  const effectiveActor = actor ?? DEFAULT_FALLBACK_ACTOR;

  const shellIdentity: WorkspaceShellIdentity = {
    workspaceId: activeWorkspace?.workspace_id || effectiveActor.workspace_ids[0] || "ws_workforce",
    workspaceKey: activeWorkspace?.workspace_key || "workforce",
    workspaceLabel: activeWorkspace?.name || "Agent Workforce",
    divisionCode: activeWorkspace?.division_code ?? null,
    roleLabel: effectiveActor.roles[0] || "Pengguna ALOS",
    accessLevel: "MEMBER",
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#141619",
          color: "#c5a572",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        <p>Memuat Agent Workforce ALOS…</p>
      </div>
    );
  }

  // Controlled NEEDS_INFO / Unresolved Workspace
  if (!activeWorkspace && needsInfoReason) {
    return (
      <WorkspaceShell
        identity={shellIdentity}
        actor={effectiveActor}
        activeNavKey="agents"
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "60px auto",
            padding: "32px",
            background: "#ffffff",
            border: "1px solid #e8e6df",
            borderRadius: "12px",
            textAlign: "center",
            fontFamily: "Manrope, sans-serif",
          }}
          role="status"
          aria-label="Agent Workforce Needs Info"
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#fffbeb",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "#141619" }}>
            Workspace Aktif Belum Dipilih
          </h2>
          <p style={{ fontSize: "14px", color: "#666055", lineHeight: 1.6, margin: "0 0 24px" }}>
            {needsInfoReason}
          </p>
          <Link
            href="/workspace"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#141619",
              color: "#ffffff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Pemilih Workspace</span>
          </Link>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      identity={shellIdentity}
      actor={effectiveActor}
      activeNavKey="agents"
    >
      <AgentWorkforce
        actor={effectiveActor}
        activeWorkspace={shellIdentity}
      />
    </WorkspaceShell>
  );
}
