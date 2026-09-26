"use client";

import { Boxes, Server } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./environments.module.css";

export function EnvironmentsWorkspace() {
  const readiness = getModuleReadiness("environments");

  return (
    <div className={styles.envWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / ENVIRONMENTS"
        description="Operational evidence, deployment tiers, and configuration boundary for Development, Staging, and Production."
        title="Environments"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Boxes}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Environment Source Status */}
      <section aria-label="Environment source status">
        <ItStatusRow
          detail="NO_SOURCE"
          helper="Backend environment inventory source is not connected."
          icon={Server}
          label="Environment Inventory Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Environment Registry */}
      <section aria-labelledby="env-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Tiers & Deployments"
          id="env-registry-title"
          subtitle="Runtime deployment tiers and active configuration boundaries"
          title="Environment Registry"
        />

        <ItDataTable
          ariaLabel="Environment deployment tiers registry"
          columns={["Environment", "Version", "Deployment State", "Last Evidence", "Source"]}
          minWidth={760}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              No backend environment inventory source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Configuration & Secret Boundary Notice */}
      <section aria-labelledby="env-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Security & Isolation"
          id="env-boundary-title"
          subtitle="Strict isolation between development, staging, and production tiers"
          title="Configuration Boundary"
        />

        <ItNotice
          title="Configuration Boundary & Zero Secret Exposure"
          variant="neutral"
        >
          All runtime environment descriptors, release digests, and deployment proofs require authoritative Backend telemetry. Sensitive environment variables, DSN strings, and infrastructure credentials are strictly masked and never rendered in browser surfaces.
        </ItNotice>
      </section>
    </div>
  );
}
