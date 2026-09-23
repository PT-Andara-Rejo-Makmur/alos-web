"use client";

import { ItDataReadiness } from "./it-data-readiness";
import { ItMetricGrid } from "./it-metric-grid";
import { PlatformDeliveryPanel } from "./platform-delivery-panel";
import { ReleaseGovernancePanel } from "./release-governance-panel";
import { SecurityAccessPanel } from "./security-access-panel";
import { ItControlCadence } from "./it-control-cadence";
import { GenesisControlPlanePanel } from "./genesis-control-plane-panel";
import type { ItDashboardSnapshot } from "./types";
import styles from "./it-dashboard.module.css";

interface ItDashboardHomeProps {
  readonly snapshot: ItDashboardSnapshot;
}

export function ItDashboardHome({ snapshot }: ItDashboardHomeProps) {
  return (
    <div className={styles.dashboardWrapper}>
      {/* Header & Context Bar */}
      <header className={styles.headerRow}>
        <div className={styles.contextBar}>
          <span className={styles.breadcrumbs}>
            ALOS / IT & TECHNOLOGY / OVERVIEW
          </span>
          <h1 className={styles.pageTitle}>IT & Technology Command Center</h1>
          <p className={styles.subtitle}>
            Pantau kesiapan platform, release, keamanan, backup, data quality, dan GENESIS dari satu workspace.
          </p>
        </div>
      </header>

      {/* IT Data Readiness */}
      <ItDataReadiness items={snapshot.readiness} />

      {/* Top 4 KPI Metrics */}
      <ItMetricGrid metrics={snapshot.metrics} />

      {/* Middle 3-Column Grid */}
      <section aria-label="Kesiapan Platform, Rilis & Keamanan" className={styles.middle3Grid}>
        <PlatformDeliveryPanel items={snapshot.platformDelivery} />
        <ReleaseGovernancePanel items={snapshot.releaseChange} />
        <SecurityAccessPanel items={snapshot.securityAccess} />
      </section>

      {/* Bottom 2-Column Grid */}
      <section aria-label="Operasi Kontrol & GENESIS Control Plane" className={styles.bottom2Grid}>
        <ItControlCadence cadence={snapshot.cadence} />
        <GenesisControlPlanePanel items={snapshot.genesisOperations} />
      </section>
    </div>
  );
}
