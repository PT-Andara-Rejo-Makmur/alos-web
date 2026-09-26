"use client";

import { Fingerprint } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./evidence.module.css";

export function EvidenceWorkspace() {
  const readiness = getModuleReadiness("evidence");

  return (
    <div className={styles.evidenceWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / GOVERNANCE / EVIDENCE"
        description="Cryptographic audit evidence ledger, verification proofs, and safe citation references."
        title="Evidence"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix."
          icon={Fingerprint}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Evidence Source Status */}
      <section aria-label="Evidence source status">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Backend evidence ledger source is not connected."
          icon={Fingerprint}
          label="Evidence Ledger Source"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Evidence Registry */}
      <section aria-labelledby="evidence-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Immutable Audit"
          id="evidence-registry-title"
          subtitle="Cryptographically verified evidence records and data classification tags"
          title="Evidence Registry"
        />

        <ItDataTable
          ariaLabel="Audit evidence registry"
          columns={["Evidence ID", "Source Type", "Classification", "Freshness", "Validation", "Safe Citation"]}
          minWidth={860}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              No backend evidence ledger source connected.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Validation / Freshness & Safe Citation Boundary */}
      <section aria-labelledby="evidence-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Sanitization & Trust"
          id="evidence-boundary-title"
          subtitle="Sanitized citation references and strict exclusion of sensitive credentials"
          title="Validation & Safe Citation"
        />

        <ItNotice
          title="Evidence Sanitization Boundary"
          variant="neutral"
        >
          Evidence artifacts and citation locators are cryptographically anchored and sanitized. Sensitive locators, internal hostnames, and bearer credentials are automatically masked to preserve zero-trust confidentiality.
        </ItNotice>
      </section>
    </div>
  );
}
