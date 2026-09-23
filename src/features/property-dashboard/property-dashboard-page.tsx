"use client";

import { useEffect, useState } from "react";

import type { ProjectPortfolioSnapshot } from "@/features/projects/portfolio";
import { ProtectedDomainWorkspace, type WorkspaceShellIdentity } from "@/features/workspace-shell";
import type { SessionActor } from "@/features/session";
import { authenticatedApiRequest, withQuery } from "@/lib/api";
import { PropertyDashboardHome } from "./property-dashboard-home";
import { buildPropertyDashboardSnapshot, EMPTY_PROPERTY_PORTFOLIO } from "./property-dashboard-projection";
import type { PropertyDashboardSnapshot } from "./types";

export function PropertyDashboardPage({ initialSnapshot }: { readonly initialSnapshot?: PropertyDashboardSnapshot | null }) {
  return (
    <ProtectedDomainWorkspace deniedTitle="Bukan Otoritas Property" divisionCodes={["PROPERTY"]} loadingLabel="Memuat Property & Project Command Center…" roleLabel="Property Manager" workspaceKeys={["property", "projects"]}>
      {({ actor, identity }) => <PropertyContent actor={actor} identity={identity} initialSnapshot={initialSnapshot} />}
    </ProtectedDomainWorkspace>
  );
}

function PropertyContent({ actor, identity, initialSnapshot }: { readonly actor: SessionActor; readonly identity: WorkspaceShellIdentity; readonly initialSnapshot?: PropertyDashboardSnapshot | null }) {
  const [snapshot, setSnapshot] = useState<PropertyDashboardSnapshot | null>(initialSnapshot ?? null);
  const [reloadIndex, setReloadIndex] = useState(0);
  useEffect(() => {
    if (initialSnapshot && reloadIndex === 0) return;
    const controller = new AbortController();
    authenticatedApiRequest<ProjectPortfolioSnapshot>(
      withQuery("/api/v1/projects/portfolio", { workspace_id: identity.workspaceId, division_code: identity.divisionCode }),
      { signal: controller.signal },
    )
      .then((portfolio) => setSnapshot(buildPropertyDashboardSnapshot(
        Array.isArray(portfolio.projects) ? portfolio : EMPTY_PROPERTY_PORTFOLIO,
      )))
      .catch(() => {
        if (!controller.signal.aborted) setSnapshot(buildPropertyDashboardSnapshot(EMPTY_PROPERTY_PORTFOLIO));
      });
    return () => controller.abort();
  }, [identity.divisionCode, identity.workspaceId, initialSnapshot, reloadIndex]);
  if (!snapshot) return <div className="alos-loading-shell">Memuat data Property…</div>;
  const selectedProject = snapshot.portfolio.projects[0];
  return (
    <PropertyDashboardHome
      activeWorkspaceId={identity.workspaceId}
      actor={actor}
      onDataReload={() => setReloadIndex((value) => value + 1)}
      selectedProjectName={selectedProject?.name}
      snapshot={snapshot}
    />
  );
}
