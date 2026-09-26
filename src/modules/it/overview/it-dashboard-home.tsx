"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
} from "@/modules/it/ui";
import { ItDataReadiness } from "./it-data-readiness";
import type { ItDashboardSnapshot } from "./types";
import styles from "./it-dashboard.module.css";

interface ItDashboardHomeProps {
  readonly snapshot: ItDashboardSnapshot;
}

export function ItDashboardHome({ snapshot }: ItDashboardHomeProps) {
  return (
    <div className={styles.dashboardWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY"
        description="Platform health, delivery controls, operational readiness, security, backup, and GENESIS status."
        title="IT Operations"
      />

      <ItDataReadiness items={snapshot.readiness} />

      <section aria-labelledby="systems-delivery-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Platform inventory"
          id="systems-delivery-title"
          subtitle="Source presence and runtime evidence are reported separately."
          title="Systems & Delivery"
        />
        <ItDataTable
          ariaLabel="Systems and delivery status"
          columns={["System", "Source", "Runtime", "Telemetry", "Context"]}
          minWidth={880}
        >
          {snapshot.systems.map((item) => (
            <tr key={item.id}>
              <td className={styles.primaryCell}>{item.system}</td>
              <td>{item.source}</td>
              <td>{item.runtime}</td>
              <td>{item.telemetry}</td>
              <td className={styles.contextCell}>{item.context}</td>
            </tr>
          ))}
        </ItDataTable>
        <p className={styles.tableNote}>Repository exists != runtime healthy.</p>
      </section>

      <section aria-labelledby="operations-status-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Operational sources"
          id="operations-status-title"
          title="Operations Status"
        />
        <ItDataTable
          ariaLabel="Operations source status"
          columns={["Operation", "State", "Source", "Description"]}
        >
          {snapshot.operations.map((item) => (
            <tr key={item.id}>
              <td className={styles.primaryCell}>{item.operation}</td>
              <td><ItStatusBadge status={item.state} /></td>
              <td>{item.source}</td>
              <td className={styles.contextCell}>{item.description}</td>
            </tr>
          ))}
        </ItDataTable>
      </section>

      <section aria-labelledby="release-change-title" className={styles.section}>
        <ItSectionHeader eyebrow="Delivery controls" id="release-change-title" title="Release & Change" />
        <ItDataTable
          ariaLabel="Release and change controls"
          columns={["Control", "State", "Evidence", "Source"]}
        >
          {snapshot.releaseControls.map((item) => (
            <tr key={item.id}>
              <td className={styles.primaryCell}>{item.control}</td>
              <td><ItStatusBadge status={item.state} /></td>
              <td>{item.evidence}</td>
              <td className={styles.contextCell}>{item.source}</td>
            </tr>
          ))}
        </ItDataTable>
      </section>

      <section aria-labelledby="control-cadence-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Assurance schedule"
          id="control-cadence-title"
          subtitle="Backup verification and restore testing remain distinct controls."
          title="Control Cadence"
        />
        <ItDataTable
          ariaLabel="IT control cadence"
          columns={["Cadence", "Control ID", "Control", "Evidence", "State", "Target Capability"]}
          minWidth={980}
        >
          {snapshot.cadence.map((item) => (
            <tr key={item.controlId}>
              <td>{item.frequency}</td>
              <td><code className={styles.controlId}>{item.controlId}</code></td>
              <td className={styles.primaryCell}>{item.controlName}</td>
              <td>{item.workEvidence}</td>
              <td><ItStatusBadge status={item.readinessStatus} /></td>
              <td className={styles.contextCell}>{item.targetCapability}</td>
            </tr>
          ))}
        </ItDataTable>
      </section>

      <section aria-labelledby="genesis-summary-title" className={styles.section}>
        <ItSectionHeader
          action={
            <Link className={styles.utilityLink} href="/workspace/it/genesis">
              Open Control Plane
              <ArrowRight aria-hidden={true} size={16} />
            </Link>
          }
          eyebrow="Technical AI operations"
          id="genesis-summary-title"
          title="GENESIS Summary"
        />
        <ItDataTable
          ariaLabel="GENESIS operational summary"
          columns={["Area", "Purpose", "Readiness", "Route"]}
          minWidth={760}
        >
          {snapshot.genesisSummary.map((item) => {
            const readiness = getModuleReadiness(item.moduleKey);
            return (
              <tr key={item.id}>
                <td className={styles.primaryCell}>{item.title}</td>
                <td className={styles.contextCell}>{item.description}</td>
                <td>
                  <div className={styles.readinessCell}>
                    <ItStatusBadge status={readiness.availability} />
                    {readiness.blockReason && <code>{readiness.blockReason}</code>}
                  </div>
                </td>
                <td><Link href={item.href}>{item.href}</Link></td>
              </tr>
            );
          })}
        </ItDataTable>
      </section>
    </div>
  );
}
