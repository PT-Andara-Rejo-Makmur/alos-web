"use client";

import { LegalDataReadiness } from "./legal-data-readiness";
import { LegalMetricGrid } from "./legal-metric-grid";
import { PermitExpiryPanel } from "./permit-expiry-panel";
import { ContractReviewPanel } from "./contract-review-panel";
import { ComplianceControlPanel } from "./compliance-control-panel";
import { LegalControlCadence } from "./legal-control-cadence";
import { LegalAgentSupport } from "./legal-agent-support";
import type { LegalDashboardSnapshot } from "./types";
import styles from "./legal-dashboard.module.css";

interface LegalDashboardHomeProps {
  readonly snapshot: LegalDashboardSnapshot;
}

export function LegalDashboardHome({ snapshot }: LegalDashboardHomeProps) {
  return (
    <div className={styles.dashboardWrapper}>
      {/* Header & Context Bar */}
      <header className={styles.headerRow}>
        <div className={styles.contextBar}>
          <span className={styles.breadcrumbs}>
            ALOS / LEGAL & COMPLIANCE / OVERVIEW
          </span>
          <h1 className={styles.pageTitle}>Legal & Compliance Command Center</h1>
          <p className={styles.subtitle}>
            Pantau perizinan, kontrak, expiry, risiko hukum, klaim publik, dan kontrol privasi dari satu workspace.
          </p>
        </div>
      </header>

      {/* Legal Data Readiness */}
      <LegalDataReadiness items={snapshot.readiness} />

      {/* Top 4 KPI Metrics */}
      <LegalMetricGrid metrics={snapshot.metrics} />

      {/* Middle 3-Column Grid */}
      <section aria-label="Operasional Hukum & Kepatuhan" className={styles.middle3Grid}>
        <PermitExpiryPanel items={snapshot.permitsLand} />
        <ContractReviewPanel items={snapshot.contracts} />
        <ComplianceControlPanel items={snapshot.compliance} />
      </section>

      {/* Bottom 2-Column Grid */}
      <section aria-label="Tata Kelola Kontrol & Dukungan AI" className={styles.bottom2Grid}>
        <LegalControlCadence cadence={snapshot.cadence} />
        <LegalAgentSupport agents={snapshot.agents} />
      </section>
    </div>
  );
}
