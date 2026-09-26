"use client";

import { BrainCircuit, Cpu } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./models-tools.module.css";

export function ModelsToolsWorkspace() {
  const readiness = getModuleReadiness("models-tools");

  return (
    <div className={styles.modelsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / GENESIS / MODELS & TOOLS"
        description="Foundation model gateway routing policies, token quotas, and technical tool runtime boundaries."
        title="Models & Tools"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={BrainCircuit}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Registry Source Status */}
      <section aria-label="Registry source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend foundation model gateway and tool runtime source is not connected."
          icon={Cpu}
          label="Gateway & Tool Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Models Registry */}
      <section aria-labelledby="models-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Foundation Models"
          id="models-registry-title"
          subtitle="Model gateway routing tiers, context windows, and controlled token budgets"
          title="Models Registry"
        />

        <ItDataTable
          ariaLabel="Foundation models gateway registry"
          columns={["Model Route", "Provider Gateway", "Quota Policy", "Data Boundary", "State", "Source"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No model registry source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Tools Registry */}
      <section aria-labelledby="tools-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Runtime Capabilities"
          id="tools-registry-title"
          subtitle="Registered runtime tools, execution sandboxes, and permission scopes"
          title="Tools Registry"
        />

        <ItDataTable
          ariaLabel="Runtime tools registry"
          columns={["Tool Key", "Runtime Sandbox", "Permission Scope", "Audit Policy", "State", "Source"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No tool registry source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Credential & Telemetry Boundary Notice */}
      <section aria-labelledby="credential-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Security & Isolation"
          id="credential-boundary-title"
          subtitle="Zero credential exposure and truthful provider telemetry"
          title="Usage Policy & Isolation"
        />

        <ItNotice
          title="Zero Credential Exposure & Source Truth"
          variant="neutral"
        >
          Foundation models and deterministic tools are mediated exclusively via internal gateway proxies. Provider credentials, secret tokens, and raw upstream endpoints are never exposed to browser presentation surfaces. No synthetic claims of model availability are made without active Backend health telemetry.
        </ItNotice>
      </section>
    </div>
  );
}
