"use client";

import { Scale } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./decisions.module.css";

export function DecisionsWorkspace() {
  const readiness = getModuleReadiness("decisions");

  return (
    <div className={styles.decisionsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / GOVERNANCE / DECISIONS"
        description="Architectural decision records, technology selection approvals, and exception registry."
        title="Decisions"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Scale}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Decision Source Status */}
      <section aria-label="Decision source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend technology decision register source is not connected."
          icon={Scale}
          label="Technology Decision Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Technology Decision Register */}
      <section aria-labelledby="decisions-register-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Architectural Governance"
          id="decisions-register-title"
          subtitle="Formal architectural and technology governance records (ADR) and compliance determinations"
          title="Technology Decision Register"
        />

        <ItDataTable
          ariaLabel="Technology decision register"
          columns={["Decision", "Authority", "Reason", "State", "Evidence", "Recorded At"]}
          minWidth={860}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No technology decision register source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Evidence Links & Decision Boundary */}
      <section aria-labelledby="evidence-links-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Audit Evidence"
          id="evidence-links-title"
          subtitle="Direct linkage between architectural determinations and cryptographic audit evidence"
          title="Evidence Links"
        />

        <ItNotice
          title="Authoritative Decision Boundary"
          variant="neutral"
        >
          Technology decisions and architectural exception waivers are authoritative corporate records. Determinations require authenticated governance committee sign-off recorded in the backend ledger.
        </ItNotice>
      </section>
    </div>
  );
}
