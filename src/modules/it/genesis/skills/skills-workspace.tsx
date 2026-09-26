"use client";

import { Blocks } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./skills.module.css";

export function SkillsWorkspace() {
  const readiness = getModuleReadiness("skills");

  return (
    <div className={styles.skillWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / GENESIS / SKILLS"
        description="Technical capability modules, reusable agent tools, and capability lifecycle states."
        title="Skills"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Blocks}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Skill Registry Source Status */}
      <section aria-label="Skill registry source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend skill registry source is not connected."
          icon={Blocks}
          label="Skill Registry Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Skills Registry */}
      <section aria-labelledby="skills-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Capability Units"
          id="skills-registry-title"
          subtitle="Reusable deterministic skill definitions and registered agent bindings"
          title="Skills Registry"
        />

        <ItDataTable
          ariaLabel="Technical skills registry"
          columns={["Skill", "Purpose", "Lifecycle", "Agents", "Source"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              No backend skill registry source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Sandbox & Tool Boundary Notice */}
      <section aria-labelledby="skills-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Execution Boundary"
          id="skills-boundary-title"
          subtitle="Sandboxed capability execution and boundary enforcement"
          title="Capability Boundary"
        />

        <ItNotice
          title="Governed Skill Invocation"
          variant="neutral"
        >
          Skills represent atomic executable units bound to verified agents. In the absence of an authoritative Backend registry connection, skills are neither assumed available nor synthesized locally.
        </ItNotice>
      </section>
    </div>
  );
}
