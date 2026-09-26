import type { ReactNode } from "react";
import { getModuleReadiness } from "@/features/workspace-routing";
import { ItMonitoringWorkspace } from "./monitoring";
import {
  DatabaseWorkspace,
  EnvironmentsWorkspace,
  IntegrationsWorkspace,
  SystemsWorkspace,
} from "./platform";
import {
  CicdWorkspace,
  ReleasesWorkspace,
  RepositoriesWorkspace,
  TechnicalDebtWorkspace,
} from "./engineering";
import {
  BackupDrWorkspace,
  IncidentsWorkspace,
  SecurityWorkspace,
} from "./operations";
import { ItUnavailableSurface } from "./ui";

export const IT_MODULE_TITLES: Record<string, string> = {
  systems: "Systems",
  integrations: "Integrations",
  database: "Database",
  environments: "Environments",
  repositories: "Repositories",
  cicd: "CI/CD",
  releases: "Releases",
  "tech-debt": "Technical Debt",
  incidents: "Incidents",
  security: "Security",
  backup: "Backup & DR",
  backups: "Backup & DR",
  infrastructure: "Infrastructure",
  "audit-trail": "Audit Trail",
  "disaster-recovery": "Disaster Recovery",
  credentials: "Credentials",
};

/**
 * Resolves IT workspace canonical module presentations.
 * Keeps WorkspaceShell decoupled from workspace-internal UI details.
 */
export function renderItWorkspaceModule(canonicalModule: string): ReactNode | null {
  if (canonicalModule === "monitoring") {
    return <ItMonitoringWorkspace />;
  }

  if (canonicalModule === "systems") {
    return <SystemsWorkspace />;
  }

  if (canonicalModule === "integrations") {
    return <IntegrationsWorkspace />;
  }

  if (canonicalModule === "database") {
    return <DatabaseWorkspace />;
  }

  if (canonicalModule === "environments") {
    return <EnvironmentsWorkspace />;
  }

  if (canonicalModule === "repositories") {
    return <RepositoriesWorkspace />;
  }

  if (canonicalModule === "cicd") {
    return <CicdWorkspace />;
  }

  if (canonicalModule === "releases") {
    return <ReleasesWorkspace />;
  }

  if (canonicalModule === "tech-debt") {
    return <TechnicalDebtWorkspace />;
  }

  if (canonicalModule === "incidents") {
    return <IncidentsWorkspace />;
  }

  if (canonicalModule === "security") {
    return <SecurityWorkspace />;
  }

  if (canonicalModule === "backup" || canonicalModule === "backups") {
    return <BackupDrWorkspace />;
  }

  if (canonicalModule in IT_MODULE_TITLES) {
    const readiness = getModuleReadiness(canonicalModule);
    return (
      <ItUnavailableSurface
        backHref="/workspace/it"
        backLabel="← Kembali ke IT Overview"
        description={`Modul ini belum tersedia pada sistem backend (${readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}). Kesiapan operasional disajikan secara transparan tanpa data tiruan.`}
        eyebrow={`ALOS / IT / ${canonicalModule.toUpperCase()}`}
        readiness={readiness}
        title={IT_MODULE_TITLES[canonicalModule]}
      />
    );
  }

  return null;
}
