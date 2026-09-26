"use client";

import { Rocket } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./releases.module.css";

export function ReleasesWorkspace() {
  const readiness = getModuleReadiness("releases");

  return (
    <div className={styles.releaseWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / RELEASES"
        description="Software release registry, release gate verification, and deployment rollback evidence."
        title="Releases"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Rocket}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Release Source Status */}
      <section aria-label="Release source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend release lifecycle source is not connected."
          icon={Rocket}
          label="Release Lifecycle Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Release Registry */}
      <section aria-labelledby="release-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Lifecycle"
          id="release-registry-title"
          subtitle="Governed deployment packages and promotion history"
          title="Release Registry"
        />

        <ItDataTable
          ariaLabel="Release lifecycle registry"
          columns={["Release", "Version", "Environment", "Gate Status", "Approval", "Evidence"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No backend release lifecycle source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Gate Summary & Rollback Evidence */}
      <section aria-labelledby="rollback-evidence-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Governance & Rollback"
          id="rollback-evidence-title"
          subtitle="Promotion approvals and verified rollback mechanisms"
          title="Gate Summary & Rollback Evidence"
        />

        <ItNotice
          title="Release Gate Governance Boundary"
          variant="neutral"
        >
          Release governance records, canary metrics, and rollback evidence require authoritative Backend lifecycle management. Release versions, dates, and sign-offs are never fabricated in the client presentation layer.
        </ItNotice>
      </section>
    </div>
  );
}
