import { ChevronDown } from "lucide-react";

import type { SalesDashboardSnapshot } from "./types";
import { SalesDataReadiness } from "./sales-data-readiness";
import { SalesMetricGrid } from "./sales-metric-grid";
import { SalesFunnelPanel } from "./sales-funnel-panel";
import { SalesResponseFollowupPanel } from "./sales-response-followup-panel";
import { SalesChannelAttributionPanel } from "./sales-channel-attribution-panel";
import { SalesControlCadence } from "./sales-control-cadence";
import { SalesAgentSupport } from "./sales-agent-support";
import styles from "./sales-dashboard.module.css";

export function SalesDashboardHome({
  snapshot,
}: {
  readonly snapshot: SalesDashboardSnapshot;
}) {
  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Header & Context Bar */}
      <header className={styles.headerRow}>
        <div className={styles.contextBar}>
          <span className={styles.breadcrumbs}>
            PT Andara Rejo Makmur / Sales &amp; Marketing
          </span>
          <h1 className={styles.pageTitle}>Sales &amp; Marketing Command Center</h1>
          <p className={styles.subtitle}>
            Monitoring real-time konversi lead-to-cash, SLA respons komunikasi, dan efektivitas kampanye properti.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.projectSelector} role="status">
            <span>Project Context: Belum tersedia</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </header>

      {/* Sales Data Readiness Panel */}
      <SalesDataReadiness items={snapshot.readiness} />

      {/* Top 4 KPI Metrics Grid */}
      <SalesMetricGrid metrics={snapshot.metrics} />

      {/* Middle 3-Column Section: Funnel, Daily Control, Attribution */}
      <section aria-label="Operasional Pipeline dan Kontrol Harian" className={styles.middle3Grid}>
        <SalesFunnelPanel stages={snapshot.funnel} />
        <SalesResponseFollowupPanel items={snapshot.dailyControl} />
        <SalesChannelAttributionPanel channels={snapshot.channelAttribution} />
      </section>

      {/* Bottom 2-Column Section: Control Cadence & Sales Intelligence */}
      <section aria-label="Kontrol Kepatuhan dan Kecerdasan Buatan" className={styles.bottom2Grid}>
        <SalesControlCadence items={snapshot.cadence} />
        <SalesAgentSupport agents={snapshot.agents} />
      </section>
    </div>
  );
}
