"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ProtectedDomainWorkspace } from "./protected-domain-workspace";
import { DocumentCenter } from "@/features/documents/document-center";
import { OperationalModuleDashboard } from "@/features/operations/operational-module-dashboard";
import { ProjectPortfolioDashboard } from "@/features/projects/portfolio-dashboards";
import { AraWorkspace, createAraRouteAdapter } from "@/features/ara-workspace";
import { AgentWorkforce } from "@/features/agent-workforce";
import { ExecutiveDashboard } from "@/features/executive-dashboard/workspace-dashboard";
import { ItMonitoringWorkspace } from "@/features/it-monitoring";
import {
  type CanonicalWorkspaceKey,
  getModuleReadiness,
  getWorkspaceAraRoute,
  isKnownWorkspaceModule,
  normalizeCanonicalModuleSegment,
} from "@/features/workspace-routing";

interface ContextualWorkspaceModulePageProps {
  readonly workspaceKey: CanonicalWorkspaceKey;
  readonly module: string;
}

const WORKSPACE_AUTHORITY_CONFIG: Record<
  CanonicalWorkspaceKey,
  {
    divisionCodes: readonly string[];
    workspaceKeys: readonly string[];
    loadingLabel: string;
    deniedTitle: string;
  }
> = {
  executive: {
    divisionCodes: ["EXEC", "EXECUTIVE"],
    workspaceKeys: ["executive", "director"],
    loadingLabel: "Memuat Executive Workspace…",
    deniedTitle: "Akses Eksekutif Dibatasi",
  },
  finance: {
    divisionCodes: ["FINANCE"],
    workspaceKeys: ["finance"],
    loadingLabel: "Memuat Finance Workspace…",
    deniedTitle: "Bukan Otoritas Finance",
  },
  hr: {
    divisionCodes: ["HR", "PEOPLE"],
    workspaceKeys: ["hr"],
    loadingLabel: "Memuat HR Workspace…",
    deniedTitle: "Bukan Otoritas HR",
  },
  legal: {
    divisionCodes: ["LEGAL", "COMPLIANCE", "LEGAL_COMPLIANCE"],
    workspaceKeys: ["legal"],
    loadingLabel: "Memuat Legal Workspace…",
    deniedTitle: "Bukan Otoritas Legal",
  },
  sales: {
    divisionCodes: ["SALES", "SALES_MARKETING"],
    workspaceKeys: ["sales"],
    loadingLabel: "Memuat Sales Workspace…",
    deniedTitle: "Bukan Otoritas Sales",
  },
  property: {
    divisionCodes: ["PROPERTY"],
    workspaceKeys: ["property", "projects"],
    loadingLabel: "Memuat Property Workspace…",
    deniedTitle: "Bukan Otoritas Property",
  },
  it: {
    divisionCodes: ["IT", "TECHNOLOGY"],
    workspaceKeys: ["it", "technology"],
    loadingLabel: "Memuat IT Workspace…",
    deniedTitle: "Bukan Otoritas IT",
  },
};

/**
 * Shared contextual workspace module page renderer.
 * Wraps every module in ProtectedDomainWorkspace to ensure URL never acts as authority.
 * If user's active workspace differs from the URL's workspaceKey, fails closed with 403 Forbidden.
 */
export function ContextualWorkspaceModulePage({
  workspaceKey,
  module: rawModule,
}: ContextualWorkspaceModulePageProps) {
  const canonicalModule = normalizeCanonicalModuleSegment(rawModule);
  if (!isKnownWorkspaceModule(workspaceKey, canonicalModule)) {
    notFound();
  }

  const config = WORKSPACE_AUTHORITY_CONFIG[workspaceKey];

  return (
    <ProtectedDomainWorkspace
      activeNavKey={canonicalModule}
      deniedTitle={config.deniedTitle}
      divisionCodes={config.divisionCodes}
      loadingLabel={config.loadingLabel}
      workspaceKeys={config.workspaceKeys}
    >
      {({ actor, identity }) => {
        // 1. ARA Contextual
        if (canonicalModule === "ara") {
          return (
            <AraWorkspace
              activeWorkspace={identity}
              actor={actor}
              routeAdapter={createAraRouteAdapter(getWorkspaceAraRoute(workspaceKey))}
            />
          );
        }

        // 2. Business Agent Workforce Contextual
        if (canonicalModule === "agents") {
          return (
            <AgentWorkforce
              activeWorkspace={identity}
              actor={actor}
            />
          );
        }

        // 3. Shared Work Contextual: Projects
        if (canonicalModule === "projects") {
          return <ProjectPortfolioDashboard activeWorkspace={identity} />;
        }

        // 4. Shared Work Contextual: Documents
        if (canonicalModule === "documents") {
          return (
            <DocumentCenter
              activeWorkspace={identity}
              actor={actor}
              mode="documents"
            />
          );
        }

        // 5. Shared Work Contextual: Tasks, Approvals, Reports, Findings
        if (
          canonicalModule === "tasks" ||
          canonicalModule === "approvals" ||
          canonicalModule === "reports" ||
          canonicalModule === "findings"
        ) {
          return (
            <OperationalModuleDashboard
              activeWorkspace={identity}
              actor={actor}
              module={canonicalModule}
            />
          );
        }

        // 6. Executive specific: divisions
        if (workspaceKey === "executive" && canonicalModule === "divisions") {
          return <ExecutiveDashboard module="divisions" />;
        }

        // 7. Executive specific: brief
        if (workspaceKey === "executive" && canonicalModule === "brief") {
          return <ExecutiveDashboard />;
        }

        // 8. IT specific: monitoring (dedicated presentation surface while remaining BLOCKED)
        if (workspaceKey === "it" && canonicalModule === "monitoring") {
          return <ItMonitoringWorkspace />;
        }

        // 9. Domain-specific or BLOCKED modules
        const readiness = getModuleReadiness(canonicalModule);
        return (
          <section
            className="panel workspace-panel"
            role="status"
            aria-label={`Modul ${canonicalModule} Belum Tersedia`}
            style={{
              padding: "2.5rem",
              maxWidth: "680px",
              margin: "2rem auto",
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e8e6df",
              textAlign: "center",
            }}
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
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "4px",
                background: "#fef3c7",
                color: "#92400e",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Belum Tersedia
            </span>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 8px 0", color: "#141619" }}>
              Modul {canonicalModule.replace(/-/g, " ").toUpperCase()}
            </h2>
            <p style={{ color: "#666055", fontSize: "14px", lineHeight: 1.6, margin: "0 0 20px 0" }}>
              Modul ini belum tersedia pada sistem backend ({readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}).
              Kesiapan operasional disajikan secara transparan tanpa data tiruan.
            </p>
            <Link
              href={`/workspace/${workspaceKey}`}
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#141619",
                color: "#ffffff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              ← Kembali ke Overview {workspaceKey.toUpperCase()}
            </Link>
          </section>
        );
      }}
    </ProtectedDomainWorkspace>
  );
}
