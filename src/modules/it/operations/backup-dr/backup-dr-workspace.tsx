"use client";

import { DatabaseBackup } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./backup-dr.module.css";

export function BackupDrWorkspace() {
  const readiness = getModuleReadiness("backup");

  return (
    <div className={styles.backupWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / BACKUP & DR"
        description="Data protection schedules, immutable backup verification, and disaster recovery restore tests."
        title="Backup & DR"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={DatabaseBackup}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Backup Source Status */}
      <section aria-label="Backup source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend backup evidence source is not connected."
          icon={DatabaseBackup}
          label="Backup Evidence Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Backup Controls */}
      <section aria-labelledby="backup-controls-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Data Protection"
          id="backup-controls-title"
          subtitle="Scheduled snapshot policies, database dump cadences, and retention periods"
          title="Backup Controls & Policies"
        />

        <ItDataTable
          ariaLabel="Backup controls and policies registry"
          columns={["Control", "Schedule", "Last Evidence", "State", "Source"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              No backend backup evidence source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Restore Tests */}
      <section aria-labelledby="restore-tests-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Disaster Recovery"
          id="restore-tests-title"
          subtitle="Empirical restore drill executions, recovery time objectives (RTO), and recovery point objectives (RPO)"
          title="Disaster Recovery Restore Tests"
        />

        <ItDataTable
          ariaLabel="Disaster recovery restore drill records"
          columns={["Restore Test", "Environment", "Evidence", "Result", "Source"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              No restore test evidence source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* DR Readiness Boundary */}
      <section aria-labelledby="dr-readiness-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Verification Boundary"
          id="dr-readiness-title"
          subtitle="Proof of recoverability and immutable retention guarantees"
          title="Disaster Recovery Readiness"
        />

        <ItNotice
          title="Disaster Recovery Telemetry Boundary"
          variant="neutral"
        >
          Disaster recovery objectives (RTO/RPO) and snapshot integrity require cryptographic verification from backup storage vaults. Operational recoverability is never presumed without verified proof from the authoritative backend.
        </ItNotice>
      </section>
    </div>
  );
}
