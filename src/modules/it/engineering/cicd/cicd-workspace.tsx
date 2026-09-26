"use client";

import { Play, Workflow } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./cicd.module.css";

export function CicdWorkspace() {
  const readiness = getModuleReadiness("cicd");

  return (
    <div className={styles.cicdWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / CI/CD"
        description="Build execution pipelines, quality gate verifications, and automated deployment telemetry."
        title="CI/CD"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Workflow}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* CI/CD Source Status */}
      <section aria-label="CI/CD source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend CI/CD pipeline source is not connected."
          icon={Play}
          label="CI/CD Pipeline Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Pipeline Runs */}
      <section aria-labelledby="pipeline-runs-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Continuous Integration"
          id="pipeline-runs-title"
          subtitle="Recent automated pipeline executions across build and test stages"
          title="Pipeline Runs"
        />

        <ItDataTable
          ariaLabel="CI/CD pipeline runs registry"
          columns={["Pipeline", "Branch", "Stage", "State", "Last Evidence", "Source"]}
          minWidth={820}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No backend CI/CD telemetry source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Quality Gates & Deployment Proof */}
      <section aria-labelledby="quality-gates-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Verification Gates"
          id="quality-gates-title"
          subtitle="Automated lint, unit test, security scan, and build verification gates"
          title="Quality Gates & Deployment Proof"
        />

        <ItNotice
          title="Authoritative Build Verification Boundary"
          variant="neutral"
        >
          Quality gate results and deployment evidence require live connection to the build orchestrator proxy. Build numbers and test results are never synthesized in the presentation layer.
        </ItNotice>
      </section>
    </div>
  );
}
