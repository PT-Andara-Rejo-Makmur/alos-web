"use client";

import {
  Activity,
  Database,
  FileClock,
  RadioTower,
  Server,
} from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./database.module.css";

const OPERATIONAL_EVIDENCE_CATEGORIES = [
  {
    id: "connectivity",
    name: "Database Connectivity",
    source: "Backend connection pool telemetry",
    icon: RadioTower,
  },
  {
    id: "schema",
    name: "Schema & Migrations",
    source: "Migration ledger and schema audit source",
    icon: FileClock,
  },
  {
    id: "health",
    name: "Engine Health Signals",
    source: "Replica, query performance, and resource telemetry",
    icon: Activity,
  },
] as const;

export function DatabaseWorkspace() {
  const readiness = getModuleReadiness("database");

  return (
    <div className={styles.databaseWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / DATABASE"
        description="Database inventory, connectivity evidence, schema operations, and controlled access boundary."
        title="Database"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Database}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Database Source Status */}
      <section aria-label="Database source status">
        <ItStatusRow
          detail="NO_SOURCE"
          helper="Backend database inventory source is not connected."
          icon={Server}
          label="Database Inventory Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Database Registry */}
      <section aria-labelledby="database-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Inventory"
          id="database-registry-title"
          subtitle="Enterprise database instances and connection topologies"
          title="Database Registry"
        />

        <ItDataTable
          ariaLabel="Database instances registry"
          columns={["Database", "Environment", "Engine", "Connectivity", "Last Evidence", "Source"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No backend database inventory source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Operational Evidence */}
      <section aria-labelledby="database-evidence-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Operations"
          id="database-evidence-title"
          subtitle="Status of database operational telemetry and migration ledgers"
          title="Operational Evidence"
        />

        <div className={styles.evidenceList}>
          {OPERATIONAL_EVIDENCE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div className={styles.evidenceRow} key={category.id}>
                <div className={styles.evidenceIdentity}>
                  <Icon aria-hidden={true} size={18} />
                  <span>{category.name}</span>
                </div>
                <span className={styles.evidenceSource}>{category.source}</span>
                <ItStatusBadge status="NOT_CONNECTED" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Boundary */}
      <section aria-labelledby="database-security-title" className={styles.section}>
        <ItNotice title="Controlled access & authority boundary">
          Browser does not connect directly to business databases. Database authority and
          credentials remain behind Backend / infrastructure boundaries. Connection strings,
          usernames, passwords, and hosts are never exposed to the client.
        </ItNotice>
      </section>
    </div>
  );
}
