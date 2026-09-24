"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

import {
  loadSessionContext,
  type SessionActor,
  type Workspace,
} from "@/features/session";
import { WorkspaceShell } from "@/features/workspace-shell";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import { ApiError } from "@/lib/api";
import { formatRoleLabel } from "@/features/access-control/dashboard-access";

import { AgentWorkforce } from "./agent-workforce";

export function AgentWorkforcePage() {
  const router = useRouter();
  const replaceRoute = router.replace;
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
        const context = await loadSessionContext();

        if (!isMounted) return;
        setActor(context.actor);

        if (
          context.activeWorkspace &&
          (!requestedWorkspaceId || requestedWorkspaceId === context.activeWorkspace.workspace_id)
        ) {
          setActiveWorkspace(context.activeWorkspace);
          setNeedsInfoReason(null);
        } else {
          setActiveWorkspace(null);
          setNeedsInfoReason(
            requestedWorkspaceId && context.activeWorkspace
              ? "Workspace pada URL tidak sama dengan workspace aktif yang diverifikasi Backend."
              : "Pilih workspace aktif untuk membuka Agent Workforce.",
          );
        }
      } catch (err) {
        if (
          (err as { status?: number })?.status === 401 ||
          (err instanceof ApiError && err.status === 401)
        ) {
          replaceRoute("/login");
          return;
        }
        if (isMounted) {
          setActor(null);
          setActiveWorkspace(null);
          setNeedsInfoReason("Sesi atau workspace terverifikasi tidak tersedia.");
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
  }, [replaceRoute, requestedWorkspaceId]);

  const shellIdentity: WorkspaceShellIdentity | null = actor && activeWorkspace ? {
    workspaceId: activeWorkspace.workspace_id,
    workspaceKey: activeWorkspace.workspace_key,
    workspaceLabel: activeWorkspace.name,
    divisionCode: activeWorkspace.division_code,
    roleLabel: formatRoleLabel(actor.roles),
    accessLevel: activeWorkspace.access_level,
  } : null;

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
  if (!activeWorkspace || !actor || !shellIdentity) {
    return (
      <main>
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
            {needsInfoReason ?? "Workspace aktif belum terverifikasi."}
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
      </main>
    );
  }

  return (
    <WorkspaceShell
      identity={shellIdentity}
      actor={actor}
      activeNavKey="agents"
    >
      <AgentWorkforce
        actor={actor}
        activeWorkspace={shellIdentity}
      />
    </WorkspaceShell>
  );
}
