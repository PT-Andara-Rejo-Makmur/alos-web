"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

import {
  loadAccessibleWorkspaces,
  loadSessionActor,
  type SessionActor,
  type Workspace,
} from "@/features/session";
import { WorkspaceShell } from "@/features/workspace-shell";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import { ApiError } from "@/lib/api";

import { createAraRouteAdapter } from "./ara-route-adapter";
import { verifyActiveWorkspace } from "./ara-workspace-projection";
import { AraWorkspace } from "./ara-workspace";

interface AraWorkspacePageProps {
  readonly basePath?: "/workspace/ara" | "/ara";
}

export function AraWorkspacePage({ basePath = "/workspace/ara" }: AraWorkspacePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedWorkspaceId = searchParams.get("workspace_id");
  const requestedConversationId = searchParams.get("conversation") || undefined;
  const initialPrompt = searchParams.get("prompt") || "";

  const [actor, setActor] = useState<SessionActor | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [needsInfoReason, setNeedsInfoReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const routeAdapter = useMemo(
    () => createAraRouteAdapter(basePath),
    [basePath],
  );

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      setIsLoading(true);
      try {
        const currentActor = await loadSessionActor();

        if (!isMounted) return;
        setActor(currentActor);

        // 2. Fetch accessible workspaces from backend
        const workspaces: Workspace[] = await loadAccessibleWorkspaces();

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
              "Pilih workspace aktif untuk membuka ARA Workspace.",
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
  }, [router, requestedWorkspaceId]);

  const shellIdentity: WorkspaceShellIdentity | null = actor && activeWorkspace ? {
    workspaceId: activeWorkspace.workspace_id,
    workspaceKey: activeWorkspace.workspace_key,
    workspaceLabel: activeWorkspace.name,
    divisionCode: activeWorkspace.division_code,
    roleLabel: actor.roles.join(" · ") || "Pengguna ALOS",
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
        <p>Memuat ARA Workspace dari ALOS Backend…</p>
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
          aria-label="ARA Workspace Needs Info"
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
      activeNavKey="ara"
    >
      <AraWorkspace
        actor={actor}
        activeWorkspace={shellIdentity}
        routeAdapter={routeAdapter}
        initialConversationId={requestedConversationId}
        initialQuery={initialPrompt}
      />
    </WorkspaceShell>
  );
}
