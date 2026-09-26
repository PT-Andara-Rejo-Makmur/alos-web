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
  { id: "agents", title: "Agents", description: "Registri agen dan batas eksekusi", route: "/workspace/it/genesis/agents", icon: Bot },
  { id: "skills", title: "Skills", description: "Definisi kapabilitas dan akses tools terkendali", route: "/workspace/it/genesis/skills", icon: Blocks },
  { id: "research", title: "Research", description: "Sumber riset, batas tinjauan, dan bukti", route: "/workspace/it/genesis/research", icon: SearchCheck },
  { id: "models-tools", title: "Models & Tools", description: "Route model dan antarmuka integrasi", route: "/workspace/it/genesis/models-tools", icon: BrainCircuit },
];

const GOVERNANCE_REFERENCES: readonly RegistryItem[] = [
  { id: "evidence", title: "Evidence", description: "Rangkaian bukti dan jejak audit", route: "/workspace/it/governance/evidence", icon: Fingerprint },
  { id: "uat", title: "UAT & Gates", description: "Gate verifikasi dan pemeriksaan rilis", route: "/workspace/it/governance/uat", icon: FlaskConical },
  { id: "decisions", title: "Decisions", description: "Persetujuan dan keputusan sistem", route: "/workspace/it/governance/decisions", icon: BadgeCheck },
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
        description="Operasi AI teknis, registri agen, kontrol kapabilitas, riset, model, tools, dan tata kelola."
        title="GENESIS Control Plane"
      />

      <section aria-label="Status Control Plane">
        <ItStatusRow
          detail={controlPlaneReadiness.blockReason}
          helper="Permukaan kontrol frontend tersedia. Integrasi operasional Backend belum terhubung."
          icon={ShieldCheck}
          label="Status Control Plane"
          status={controlPlaneReadiness.availability}
        />
      </section>

      <section aria-labelledby="technical-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Kapabilitas"
          id="technical-registry-title"
          subtitle="Kesiapan ditentukan dari sumber modul terpusat."
          title="Registri Teknis"
        />
        <ItDataTable
          ariaLabel="Registri teknis GENESIS"
          columns={["Kapabilitas", "Cakupan Teknis", "Kesiapan", "Route Kanonis"]}
          minWidth={900}
        >
          <RegistryRows items={TECHNICAL_REGISTRY} />
        </ItDataTable>
      </section>

      <section aria-labelledby="governance-references-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Kontrol"
          id="governance-references-title"
          title="Referensi Tata Kelola"
        />
        <ItDataTable
          ariaLabel="Referensi tata kelola GENESIS"
          columns={["Referensi", "Cakupan Teknis", "Kesiapan", "Route Kanonis"]}
          minWidth={900}
        >
          <RegistryRows items={GOVERNANCE_REFERENCES} />
        </ItDataTable>
      </section>
    </div>
  );
}
