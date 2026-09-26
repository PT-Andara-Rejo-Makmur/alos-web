"use client";

import { Siren } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./incidents.module.css";

export function IncidentsWorkspace() {
  const readiness = getModuleReadiness("incidents");

  return (
    <div className={styles.incidentWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / INCIDENTS"
        description="Operational incident response, post-mortem tracking, and service impact telemetry."
        title="Incidents"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Siren}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Incident Source Status */}
      <section aria-label="Incident source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend incident management source is not connected."
          icon={Siren}
          label="Incident Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Incident Registry */}
      <section aria-labelledby="incident-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Triage & Operations"
          id="incident-registry-title"
          subtitle="Active operational degradations, severity assessments, and response tracking"
          title="Incident Registry"
        />

        <ItDataTable
          ariaLabel="Incident management registry"
          columns={["Incident", "Severity", "Impact", "State", "Owner", "Last Update"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No incident source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Response Timeline & Ownership Boundary */}
      <section aria-labelledby="response-timeline-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Follow-Up & Post-Mortem"
          id="response-timeline-title"
          subtitle="Audit-backed response timelines and mitigation action items"
          title="Response Timeline & Ownership"
        />

        <ItNotice
          title="Operational Telemetry Boundary"
          variant="neutral"
        >
          Incident response timeline, severity classifications, and post-incident reviews require authoritative operational telemetry. Zero incident counts or MTTR metrics are claimed without live backend connection. Absence of connected source telemetry does not indicate zero active incidents.
        </ItNotice>
      </section>
    </div>
  );
}
