"use client";

import { ShieldCheck } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./security.module.css";

export function SecurityWorkspace() {
  const readiness = getModuleReadiness("security");

  return (
    <div className={styles.securityWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / SECURITY"
        description="Security findings register, vulnerability remediation tracking, and defensive compliance evidence."
        title="Security"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={ShieldCheck}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Security Source Status */}
      <section aria-label="Security source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend security finding telemetry source is not connected."
          icon={ShieldCheck}
          label="Security Findings Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Security Findings Register */}
      <section aria-labelledby="security-findings-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Vulnerabilities & Posture"
          id="security-findings-title"
          subtitle="Triaged vulnerability disclosures, dependency audits, and defensive postures"
          title="Security Findings"
        />

        <ItDataTable
          ariaLabel="Security findings registry"
          columns={["Finding", "Severity", "Owner", "State", "Evidence", "Last Update"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No security finding source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Review / Remediation & Evidence Coverage */}
      <section aria-labelledby="remediation-coverage-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Remediation & Compliance"
          id="remediation-coverage-title"
          subtitle="Remediation service level agreements and compliance coverage metrics"
          title="Review & Evidence Coverage"
        />

        <ItNotice
          title="Security Evidence Honesty Boundary"
          variant="neutral"
        >
          Defensive security posture, vulnerability findings, and remediation SLAs require authoritative telemetry from security assessment pipelines. In the absence of connected source telemetry, claims of zero vulnerabilities, full compliance, or complete safety are strictly avoided.
        </ItNotice>
      </section>
    </div>
  );
}
