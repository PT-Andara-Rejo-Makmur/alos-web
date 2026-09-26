"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Blocks,
  Bot,
  BrainCircuit,
  Fingerprint,
  FlaskConical,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./genesis-control-plane.module.css";

interface RegistryItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly icon: LucideIcon;
}

const TECHNICAL_REGISTRY: readonly RegistryItem[] = [
  { id: "agents", title: "Agents", description: "Agent registry and execution boundaries", route: "/workspace/it/genesis/agents", icon: Bot },
  { id: "skills", title: "Skills", description: "Capability definitions and controlled tool access", route: "/workspace/it/genesis/skills", icon: Blocks },
  { id: "research", title: "Research", description: "Research sources, review boundaries, and evidence", route: "/workspace/it/genesis/research", icon: SearchCheck },
  { id: "models-tools", title: "Models & Tools", description: "Model routing and integration interfaces", route: "/workspace/it/genesis/models-tools", icon: BrainCircuit },
];

const GOVERNANCE_REFERENCES: readonly RegistryItem[] = [
  { id: "evidence", title: "Evidence", description: "Evidence chain and audit trace", route: "/workspace/it/governance/evidence", icon: Fingerprint },
  { id: "uat", title: "UAT & Gates", description: "Verification gates and release checks", route: "/workspace/it/governance/uat", icon: FlaskConical },
  { id: "decisions", title: "Decisions", description: "Governed approvals and system decisions", route: "/workspace/it/governance/decisions", icon: BadgeCheck },
];

function RegistryRows({ items }: { readonly items: readonly RegistryItem[] }) {
  return items.map((item) => {
    const Icon = item.icon;
    const readiness = getModuleReadiness(item.id);
    return (
      <tr key={item.id}>
        <td>
          <div className={styles.registryIdentity}>
            <Icon aria-hidden={true} size={18} />
            <span>{item.title}</span>
          </div>
        </td>
        <td className={styles.descriptionCell}>{item.description}</td>
        <td>
          <div className={styles.readinessCell}>
            <ItStatusBadge status={readiness.availability} />
            {readiness.blockReason && <code>{readiness.blockReason}</code>}
          </div>
        </td>
        <td><Link className={styles.routeLink} href={item.route}>{item.route}</Link></td>
      </tr>
    );
  });
}

export function GenesisControlPlaneWorkspace() {
  const controlPlaneReadiness = getModuleReadiness("control-plane");

  return (
    <div className={styles.genesisWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT / GENESIS"
        description="Technical AI operations, agent registry, capability controls, research, models, tools, and governance."
        title="GENESIS Control Plane"
      />

      <section aria-label="Control Plane status">
        <ItStatusRow
          detail={controlPlaneReadiness.blockReason}
          helper="Frontend control surface available. Backend operational integration not connected."
          icon={ShieldCheck}
          label="Control Plane Status"
          status={controlPlaneReadiness.availability}
        />
      </section>

      <section aria-labelledby="technical-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Capabilities"
          id="technical-registry-title"
          subtitle="Readiness is resolved from the centralized module source."
          title="Technical Registry"
        />
        <ItDataTable
          ariaLabel="GENESIS technical registry"
          columns={["Capability", "Technical Scope", "Readiness", "Canonical Route"]}
          minWidth={900}
        >
          <RegistryRows items={TECHNICAL_REGISTRY} />
        </ItDataTable>
      </section>

      <section aria-labelledby="governance-references-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Controls"
          id="governance-references-title"
          title="Governance References"
        />
        <ItDataTable
          ariaLabel="GENESIS governance references"
          columns={["Reference", "Technical Scope", "Readiness", "Canonical Route"]}
          minWidth={900}
        >
          <RegistryRows items={GOVERNANCE_REFERENCES} />
        </ItDataTable>
      </section>
    </div>
  );
}
