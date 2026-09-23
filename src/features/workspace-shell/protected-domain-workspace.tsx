"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  loadAccessibleWorkspaces,
  loadSessionActor,
  type SessionActor,
  type Workspace,
} from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { WorkspaceShell } from "./workspace-shell";
import type { WorkspaceRouteKey } from "@/features/workspace-routing";
import type { WorkspaceShellIdentity } from "./types";

type BoundaryState = "LOADING" | "READY" | "FORBIDDEN" | "UNAVAILABLE";

interface ProtectedDomainWorkspaceProps {
  readonly activeNavKey?: WorkspaceRouteKey | "overview";
  readonly children: (context: {
    actor: SessionActor;
    identity: WorkspaceShellIdentity;
    workspace: Workspace;
  }) => ReactNode;
  readonly divisionCodes: readonly string[];
  readonly deniedTitle?: string;
  readonly deniedDescription?: string;
  readonly loadingLabel: string;
  readonly roleLabel: string;
  readonly workspaceKeys: readonly string[];
}

/**
 * Canonical protected-page boundary. It trusts only the HttpOnly session and
 * the Backend-authorized workspace projection; route names and query values
 * never create authority.
 */
export function ProtectedDomainWorkspace({
  activeNavKey = "overview",
  children,
  deniedDescription = "Backend tidak memberikan workspace yang sesuai untuk akun ini.",
  deniedTitle = "Akses Dibatasi",
  divisionCodes,
  loadingLabel,
  roleLabel,
  workspaceKeys,
}: ProtectedDomainWorkspaceProps) {
  const router = useRouter();
  const [state, setState] = useState<BoundaryState>("LOADING");
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState("LOADING");
      try {
        const [nextActor, workspaces] = await Promise.all([
          loadSessionActor(controller.signal),
          loadAccessibleWorkspaces(controller.signal),
        ]);
        const allowedIds = new Set(nextActor.workspace_ids);
        const verified = workspaces.filter((item) => allowedIds.has(item.workspace_id));
        const match = verified.find((item) =>
          workspaceKeys.includes(item.workspace_key.toLowerCase()) ||
          (item.division_code !== null && divisionCodes.includes(item.division_code.toUpperCase())),
        );
        if (!match) {
          setActor(nextActor);
          setWorkspace(null);
          setState("FORBIDDEN");
          return;
        }
        setActor(nextActor);
        setWorkspace(match);
        setState("READY");
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }
        setActor(null);
        setWorkspace(null);
        setState("UNAVAILABLE");
      }
    }
    void load();
    return () => controller.abort();
  }, [divisionCodes, router, workspaceKeys]);

  if (state === "LOADING") {
    return <main className="alos-loading-shell">{loadingLabel}</main>;
  }
  if (state !== "READY" || !actor || !workspace) {
    return (
      <main className="alos-loading-shell" role="alert">
        <section className="panel workspace-panel">
          {state === "FORBIDDEN" ? <span>403 — AKSES DITOLAK</span> : null}
          <h1>{state === "FORBIDDEN" ? deniedTitle : "Workspace tidak tersedia"}</h1>
          <p>
            {state === "FORBIDDEN"
              ? deniedDescription
              : "Sesi atau proyeksi workspace dari Backend tidak dapat dimuat."}
          </p>
          <Link href="/workspace">Kembali ke Ruang Kerja Saya</Link>
        </section>
      </main>
    );
  }

  const identity: WorkspaceShellIdentity = {
    workspaceId: workspace.workspace_id,
    workspaceKey: workspace.workspace_key,
    workspaceLabel: workspace.name,
    divisionCode: workspace.division_code,
    accessLevel: workspace.access_level,
    roleLabel: actor.roles.includes("EXECUTIVE") ? "Direktur" : roleLabel,
  };

  async function logout() {
    try {
      await sessionApiRequest("", { method: "DELETE" });
    } finally {
      window.location.assign(new URL("/login", window.location.origin).href);
    }
  }

  return (
    <WorkspaceShell
      activeNavKey={activeNavKey}
      actor={actor}
      identity={identity}
      onLogout={logout}
    >
      {children({ actor, identity, workspace })}
    </WorkspaceShell>
  );
}
