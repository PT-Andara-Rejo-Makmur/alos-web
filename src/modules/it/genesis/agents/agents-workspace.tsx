"use client";

import { Bot } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./agents.module.css";

export function AgentsWorkspace() {
  const readiness = getModuleReadiness("agents");

  return (
    <div className={styles.agentWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / GENESIS / AGENTS"
        description="Technical agent registry, lifecycle stages, permission boundaries, and operational risk tiers."
        title="Agents"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Bot}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Agent Registry Source Status */}
      <section aria-label="Agent registry source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend agent contract registry source is not connected."
          icon={Bot}
          label="Agent Registry Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Agent Registry */}
      <section aria-labelledby="agent-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Technical Agents"
          id="agent-registry-title"
          subtitle="Cataloged technical AI agents, contract digests, and approval gates"
          title="Agent Registry"
        />

        <ItDataTable
          ariaLabel="Technical agent registry"
          columns={["Agent", "Purpose", "Lifecycle", "Risk", "Approval", "Evidence"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No backend agent registry source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Security & Boundary Notice */}
      <section aria-labelledby="agent-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Confidentiality Boundary"
          id="agent-boundary-title"
          subtitle="Strict protection of prompt templates, provider secrets, and internal tool policies"
          title="Security & Isolation Boundary"
        />

        <ItNotice
          title="Technical Agent Security Boundary"
          variant="neutral"
        >
          Technical agents operate exclusively under governed control-plane policies. Raw prompt templates, provider keys, and private system instructions are strictly excluded from client presentation layers. This registry manages technical automation only; business workforce agents are strictly segregated.
        </ItNotice>
      </section>
    </div>
  );
}
