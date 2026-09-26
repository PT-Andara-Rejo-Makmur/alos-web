"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
} from "@/modules/it/ui";
import { ItDataReadiness } from "./it-data-readiness";
import type { ItDashboardSnapshot } from "./types";
import styles from "./it-dashboard.module.css";

interface ItDashboardHomeProps {
  readonly snapshot: ItDashboardSnapshot;
}

export function ItDashboardHome({ snapshot }: ItDashboardHomeProps) {
  return (
    <div className={styles.dashboardWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI"
        description="Kesehatan platform, kontrol delivery, kesiapan operasional, keamanan, backup, dan status GENESIS."
        title="Operasi IT"
      />

      <ItDataReadiness items={snapshot.readiness} />

      <section aria-labelledby="systems-delivery-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Inventaris Platform"
          id="systems-delivery-title"
          subtitle="Keberadaan source dan bukti runtime dilaporkan secara terpisah."
          title="Sistem & Delivery"
        />
        <ItDataTable
          ariaLabel="Status sistem dan delivery"
          columns={["Sistem", "Sumber", "Runtime", "Telemetri", "Konteks"]}
          minWidth={880}
        >
          {snapshot.systems.map((item) => (
            <tr key={item.id}>
              <td className={styles.primaryCell}>{item.system}</td>
              <td>{item.source}</td>
              <td>{item.runtime}</td>
              <td>{item.telemetry}</td>
              <td className={styles.contextCell}>{item.context}</td>
            </tr>
          ))}
        </ItDataTable>
        <p className={styles.tableNote}>Repositori tersedia != runtime sehat.</p>
      </section>

      <section aria-labelledby="operations-status-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Sumber Operasional"
          id="operations-status-title"
          title="Status Operasi"
        />
        <ItDataTable
          ariaLabel="Status sumber operasi"
          columns={["Operasi", "Status", "Sumber", "Deskripsi"]}
        >
          {snapshot.operations.map((item) => (
            <tr key={item.id}>
              <td className={styles.primaryCell}>{item.operation}</td>
              <td><ItStatusBadge status={item.state} /></td>
              <td>{item.source}</td>
              <td className={styles.contextCell}>{item.description}</td>
            </tr>
          ))}
        </ItDataTable>
      </section>

      <section aria-labelledby="release-change-title" className={styles.section}>
        <ItSectionHeader eyebrow="Kontrol Delivery" id="release-change-title" title="Rilis & Perubahan" />
        <ItDataTable
          ariaLabel="Kontrol rilis dan perubahan"
          columns={["Kontrol", "Status", "Bukti", "Sumber"]}
        >
          {snapshot.releaseControls.map((item) => (
            <tr key={item.id}>
              <td className={styles.primaryCell}>{item.control}</td>
              <td><ItStatusBadge status={item.state} /></td>
              <td>{item.evidence}</td>
              <td className={styles.contextCell}>{item.source}</td>
            </tr>
          ))}
        </ItDataTable>
      </section>

      <section aria-labelledby="control-cadence-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Jadwal Assurance"
          id="control-cadence-title"
          subtitle="Verifikasi backup dan pengujian restore tetap menjadi kontrol terpisah."
          title="Cadence Kontrol"
        />
        <ItDataTable
          ariaLabel="Cadence kontrol IT"
          columns={["Cadence", "ID Kontrol", "Kontrol", "Bukti", "Status", "Target Kapabilitas"]}
          minWidth={980}
        >
          {snapshot.cadence.map((item) => (
            <tr key={item.controlId}>
              <td>{item.frequency}</td>
              <td><code className={styles.controlId}>{item.controlId}</code></td>
              <td className={styles.primaryCell}>{item.controlName}</td>
              <td>{item.workEvidence}</td>
              <td><ItStatusBadge status={item.readinessStatus} /></td>
              <td className={styles.contextCell}>{item.targetCapability}</td>
            </tr>
          ))}
        </ItDataTable>
      </section>

      <section aria-labelledby="genesis-summary-title" className={styles.section}>
        <ItSectionHeader
          action={
            <Link className={styles.utilityLink} href="/workspace/it/genesis">
              Buka Control Plane
              <ArrowRight aria-hidden={true} size={16} />
            </Link>
          }
          eyebrow="Operasi AI Teknis"
          id="genesis-summary-title"
          title="Ringkasan GENESIS"
        />
        <ItDataTable
          ariaLabel="Ringkasan operasional GENESIS"
          columns={["Area", "Tujuan", "Kesiapan", "Route"]}
          minWidth={760}
        >
          {snapshot.genesisSummary.map((item) => {
            const readiness = getModuleReadiness(item.moduleKey);
            return (
              <tr key={item.id}>
                <td className={styles.primaryCell}>{item.title}</td>
                <td className={styles.contextCell}>{item.description}</td>
                <td>
                  <div className={styles.readinessCell}>
                    <ItStatusBadge status={readiness.availability} />
                    {readiness.blockReason && <code>{readiness.blockReason}</code>}
                  </div>
                </td>
                <td><Link href={item.href}>{item.href}</Link></td>
              </tr>
            );
          })}
        </ItDataTable>
      </section>
    </div>
  );
}
