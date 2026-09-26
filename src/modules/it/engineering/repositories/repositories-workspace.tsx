"use client";

import { GitBranch, GitFork } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./repositories.module.css";

export function RepositoriesWorkspace() {
  const readiness = getModuleReadiness("repositories");

  return (
    <div className={styles.repoWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / REPOSITORIES"
        description="Repository inventory, source code version control references, and branch policy governance."
        title="Repositories"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={GitBranch}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Repository Source Status */}
      <section aria-label="Repository source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend repository inventory source is not connected."
          icon={GitFork}
          label="Repository Inventory Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Repository Registry */}
      <section aria-labelledby="repo-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Version Control"
          id="repo-registry-title"
          subtitle="Monitored enterprise codebases and branch governance"
          title="Repository Registry"
        />

        <ItDataTable
          ariaLabel="Repository inventory registry"
          columns={["Repository", "Purpose", "Owner", "State", "Last Evidence", "Source"]}
          minWidth={820}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No backend repository inventory source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Authority & Security Boundary */}
      <section aria-labelledby="repo-security-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Security & Access"
          id="repo-security-title"
          subtitle="Direct browser connection to VCS providers is strictly prohibited"
          title="Authority Boundary"
        />

        <ItNotice
          title="VCS Telemetry Governed via Backend"
          variant="neutral"
        >
          ALOS Web does not directly query GitHub or external VCS providers from the client browser. Repository inventory, commit history, and compliance gates are served exclusively via authoritative Backend proxies. No tokens or personal access tokens are stored in the client.
        </ItNotice>
      </section>
    </div>
  );
}
