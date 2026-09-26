"use client";

import { Wrench } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./technical-debt.module.css";

export function TechnicalDebtWorkspace() {
  const readiness = getModuleReadiness("tech-debt");

  return (
    <div className={styles.debtWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / TECHNICAL DEBT"
        description="Engineering debt registry, architectural remediation items, and refactoring priority tracking."
        title="Technical Debt"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Wrench}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Tech Debt Source Status */}
      <section aria-label="Technical debt source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend technical debt register source is not connected."
          icon={Wrench}
          label="Technical Debt Register Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Technical Debt Registry */}
      <section aria-labelledby="debt-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Remediation Backlog"
          id="debt-registry-title"
          subtitle="Cataloged technical debt items, architectural compromises, and remediation owners"
          title="Technical Debt Register"
        />

        <ItDataTable
          ariaLabel="Technical debt registry"
          columns={["Item", "Area", "Impact", "Priority", "Owner", "State", "Evidence"]}
          minWidth={880}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={7}>
              No technical-debt registry source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Backlog Boundary Notice */}
      <section aria-labelledby="debt-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Integrity Boundary"
          id="debt-boundary-title"
          subtitle="Strict requirement for authoritative backlog synchronization"
          title="Remediation Boundary"
        />

        <ItNotice
          title="Authoritative Backlog Boundary"
          variant="neutral"
        >
          Technical debt tracking requires authoritative engineering backlog telemetry from the Backend. Sample, mock, or estimated debt items are strictly disallowed to maintain audit and operational honesty.
        </ItNotice>
      </section>
    </div>
  );
}
