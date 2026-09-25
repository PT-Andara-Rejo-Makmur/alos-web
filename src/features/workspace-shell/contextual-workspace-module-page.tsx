"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ProtectedDomainWorkspace } from "./protected-domain-workspace";
import { DocumentCenter } from "@/features/documents/document-center";
import { OperationalModuleDashboard } from "@/features/operations/operational-module-dashboard";
import { ProjectPortfolioDashboard } from "@/features/projects/portfolio-dashboards";
import { AraWorkspace, createAraRouteAdapter } from "@/features/ara-workspace";
import { AgentWorkforce } from "@/features/agent-workforce";
import { ExecutiveDashboard } from "@/features/executive-dashboard/workspace-dashboard";
import {
  type CanonicalWorkspaceKey,
  getModuleReadiness,
  getWorkspaceAraRoute,
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
  module,
}: ContextualWorkspaceModulePageProps) {
  const router = useRouter();
  const config = WORKSPACE_AUTHORITY_CONFIG[workspaceKey];

  useEffect(() => {
    if (workspaceKey === "finance" && module === "close") {
      router.replace("/workspace/finance/month-close");
    }
  }, [module, router, workspaceKey]);

  return (
    <ProtectedDomainWorkspace
      activeNavKey={module}
      deniedTitle={config.deniedTitle}
      divisionCodes={config.divisionCodes}
      loadingLabel={config.loadingLabel}
      workspaceKeys={config.workspaceKeys}
    >
      {({ actor, identity }) => {
        // 1. ARA Contextual
        if (module === "ara") {
          return (
            <AraWorkspace
              activeWorkspace={identity}
              actor={actor}
              routeAdapter={createAraRouteAdapter(getWorkspaceAraRoute(workspaceKey))}
            />
          );
        }

        // 2. Business Agent Workforce Contextual
        if (module === "agents") {
          if (workspaceKey === "it") {
            return (
              <section
                className="panel workspace-panel"
                role="status"
                style={{ padding: "2rem", maxWidth: "680px", margin: "2rem auto", textAlign: "center" }}
              >
                <h2>GENESIS Technical Agents</h2>
                <p style={{ color: "#6b7280", margin: "1rem 0" }}>
                  Manajemen agen teknis dan control plane IT berada pada sub-area GENESIS.
                </p>
                <Link
                  href="/workspace/it/genesis/agents"
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "#141619",
                    color: "#ffffff",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Buka GENESIS Agents →
                </Link>
              </section>
            );
          }
          if (workspaceKey === "executive") {
            return (
              <section
                className="panel workspace-panel"
                role="status"
                style={{ padding: "2rem", maxWidth: "680px", margin: "2rem auto", textAlign: "center" }}
              >
                <h2>Executive Command Center</h2>
                <p style={{ color: "#6b7280" }}>
                  Tingkat Eksekutif berfokus pada supervisi dan keputusan material; Business Agent Workforce beroperasi di tingkat divisi masing-masing.
                </p>
                <Link
                  href="/workspace/executive"
                  style={{
                    display: "inline-block",
                    marginTop: "1rem",
                    padding: "8px 16px",
                    background: "#141619",
                    color: "#ffffff",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Kembali ke Executive Overview →
                </Link>
              </section>
            );
          }
          return (
            <AgentWorkforce
              activeWorkspace={identity}
              actor={actor}
            />
          );
        }

        // 3. Shared Work Contextual: Projects
        if (module === "projects") {
          return <ProjectPortfolioDashboard activeWorkspace={identity} />;
        }

        // 4. Shared Work Contextual: Documents
        if (module === "documents") {
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
          module === "tasks" ||
          module === "approvals" ||
          module === "reports" ||
          module === "findings"
        ) {
          return (
            <OperationalModuleDashboard
              activeWorkspace={identity}
              actor={actor}
              module={module}
            />
          );
        }

        // 6. Executive specific: divisions
        if (workspaceKey === "executive" && module === "divisions") {
          return <ExecutiveDashboard module="divisions" />;
        }

        // 7. Executive specific: brief
        if (workspaceKey === "executive" && module === "brief") {
          return <ExecutiveDashboard />;
        }

        // 8. Domain-specific or BLOCKED modules
        const readiness = getModuleReadiness(module);
        return (
          <section
            className="panel workspace-panel"
            role="status"
            aria-label={`Modul ${module} Belum Tersedia`}
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
              Modul {module.replace(/-/g, " ").toUpperCase()}
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
