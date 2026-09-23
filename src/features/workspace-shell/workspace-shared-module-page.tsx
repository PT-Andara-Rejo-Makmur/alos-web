"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  loadAccessibleWorkspaces,
  loadSessionActor,
  type SessionActor,
  type Workspace,
} from "@/features/session";
import type { SharedModuleKey } from "@/features/workspace-routing";
import { verifyActiveWorkspace } from "@/features/ara-workspace/ara-workspace-projection";
import { DocumentCenter } from "@/features/documents/document-center";
import { OperationalModuleDashboard } from "@/features/operations/operational-module-dashboard";
import { ProjectPortfolioDashboard } from "@/features/projects/portfolio-dashboards";
import { WorkspaceShell } from "./workspace-shell";
import { projectWorkspaceNavigation } from "./workspace-navigation";
import type { WorkspaceShellIdentity } from "./types";

interface WorkspaceSharedModulePageProps {
  readonly module: SharedModuleKey;
}

function SharedModuleContent({ module }: WorkspaceSharedModulePageProps) {
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
        const currentActor = await loadSessionActor();

        if (!isMounted) return;
        setActor(currentActor);

        const workspaces: Workspace[] = await loadAccessibleWorkspaces();

        if (!isMounted) return;

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
              "Pilih workspace aktif untuk membuka modul ini.",
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
          setNeedsInfoReason("Sesi atau daftar workspace sedang tidak tersedia. Coba lagi dari Workspace Resolver.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void initializeSession();

    return () => {
      isMounted = false;
    };
  }, [requestedWorkspaceId, router]);

  const shellIdentity: WorkspaceShellIdentity | null = useMemo(() => {
    if (!activeWorkspace || !actor) return null;
    const roles = actor?.roles || [];
    const isDirector = roles.includes("DIRECTOR");
    return {
      workspaceId: activeWorkspace.workspace_id,
      workspaceKey: activeWorkspace.workspace_key,
      workspaceLabel: activeWorkspace.name,
      roleLabel: isDirector
        ? "Direktur"
        : roles.length > 0
          ? roles.join(" · ")
          : "Anggota Tim",
      divisionCode: activeWorkspace.division_code,
      accessLevel: activeWorkspace.access_level,
    };
  }, [activeWorkspace, actor]);

  const navigation = useMemo(
    () => shellIdentity ? projectWorkspaceNavigation(shellIdentity, actor) : [],
    [shellIdentity, actor],
  );

  if (isLoading) {
    return (
      <div
        className="alos-loading-shell"
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-muted, #6b7280)",
        }}
      >
        Memuat modul {module}…
      </div>
    );
  }

  if (!activeWorkspace || !actor || !shellIdentity) {
    return (
      <section
        className="alos-content"
        style={{
          maxWidth: "600px",
          margin: "4rem auto",
          padding: "2.5rem",
          textAlign: "center",
          background: "var(--color-surface, #ffffff)",
          borderRadius: "12px",
          border: "1px solid var(--color-border, #e5e8e3)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "16px",
            borderRadius: "50%",
            background: "rgba(209, 163, 87, 0.12)",
            color: "#b47a16",
            marginBottom: "1.25rem",
          }}
        >
          <Building2 size={36} />
        </div>
        <h2
          style={{
            fontSize: "1.375rem",
            fontWeight: 600,
            color: "var(--color-text, #111827)",
            marginBottom: "0.5rem",
          }}
        >
          Pilih Workspace Aktif
        </h2>
        <p
          style={{
            color: "var(--color-muted, #6b7280)",
            fontSize: "0.875rem",
            marginBottom: "1.75rem",
            lineHeight: 1.6,
          }}
        >
          {needsInfoReason ||
            "Modul ini memerlukan konteks workspace kerja aktif untuk menyaring data, otoritas, dan audit trail secara aman."}
        </p>
        <Link
          href="/workspace"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            background: "#07523d",
            color: "#ffffff",
            borderRadius: "8px",
            fontWeight: 500,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          Buka Workspace Resolver →
        </Link>
      </section>
    );
  }

  return (
    <WorkspaceShell
      activeNavKey={module}
      actor={actor}
      identity={shellIdentity}
      navigation={navigation}
    >
      {module === "projects" && (
        <ProjectPortfolioDashboard
          activeWorkspace={shellIdentity}
        />
      )}
      {module === "tasks" && (
        <OperationalModuleDashboard
          activeWorkspace={shellIdentity}
          actor={actor}
          module="tasks"
        />
      )}
      {module === "approvals" && (
        <OperationalModuleDashboard
          activeWorkspace={shellIdentity}
          actor={actor}
          module="approvals"
        />
      )}
      {module === "documents" && (
        <DocumentCenter
          activeWorkspace={shellIdentity}
          actor={actor}
          mode="documents"
        />
      )}
      {module === "reports" && (
        <OperationalModuleDashboard
          activeWorkspace={shellIdentity}
          actor={actor}
          module="reports"
        />
      )}
      {module === "findings" && (
        <OperationalModuleDashboard
          activeWorkspace={shellIdentity}
          actor={actor}
          module="findings"
        />
      )}
    </WorkspaceShell>
  );
}

export function WorkspaceSharedModulePage(props: WorkspaceSharedModulePageProps) {
  return (
    <Suspense
      fallback={
        <div
          className="alos-loading-shell"
          style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-muted, #6b7280)",
          }}
        >
          Memuat modul…
        </div>
      }
    >
      <SharedModuleContent {...props} />
    </Suspense>
  );
}
