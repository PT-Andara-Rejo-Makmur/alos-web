"use client";

import { FlaskConical } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./uat.module.css";

export function UatWorkspace() {
  const readiness = getModuleReadiness("uat");

  return (
    <div className={styles.uatWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / GOVERNANCE / UAT & GATES"
        description="User acceptance testing verification gates, sign-off criteria, and outstanding release blockers."
        title="UAT & Gates"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={FlaskConical}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* UAT Source Status */}
      <section aria-label="UAT source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend UAT and gate evidence source is not connected."
          icon={FlaskConical}
          label="UAT Evidence Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Gate Registry */}
      <section aria-labelledby="gate-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Verification Gates"
          id="gate-registry-title"
          subtitle="Governed UAT test criteria and release promotion gate requirements"
          title="Gate Registry"
        />

        <ItDataTable
          ariaLabel="UAT and release gates registry"
          columns={["Gate", "Target Release", "Verification Level", "Status", "Sign-Off Authority", "Evidence"]}
          minWidth={860}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No UAT/gate evidence source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Outstanding Gates & Approval Boundary */}
      <section aria-labelledby="outstanding-gates-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Gate Enforcement"
          id="outstanding-gates-title"
          subtitle="Outstanding criteria required prior to promotion approvals"
          title="Outstanding Gates"
        />

        <ItNotice
          title="Authoritative UAT Verification Boundary"
          variant="neutral"
        >
          UAT sign-offs and gate validations require authoritative human sign-off evidence stored in the backend governance ledger. Gate approvals or PASS statuses are never synthesized in the client presentation layer.
        </ItNotice>
      </section>
    </div>
  );
}
