import type { FinanceDashboardSnapshot } from "./types";
import { FinanceDataReadiness } from "./finance-data-readiness";
import { FinanceMetricGrid } from "./finance-metric-grid";
import { FinanceControlCadence } from "./finance-control-cadence";
import { FinanceCashflowPanel } from "./finance-cashflow-panel";
import { FinanceAgingPanel } from "./finance-aging-panel";
import { FinanceApprovalPanel } from "./finance-approval-panel";
import { FinanceAgentSupport } from "./finance-agent-support";
import { FinanceWalletsPanel } from "./finance-wallets-panel";
import styles from "./finance-dashboard.module.css";

interface FinanceDashboardHomeProps {
  readonly snapshot: FinanceDashboardSnapshot;
}

export function FinanceDashboardHome({ snapshot }: FinanceDashboardHomeProps) {
  return (
    <div className={styles.container}>
      <header>
        <div className={styles.breadcrumb}>ALOS / FINANCE / OVERVIEW</div>
        <h1 className={styles.pageTitle}>Finance Command Center</h1>
        <p className={styles.pageSubtitle}>
          Kontrol kas, rekonsiliasi, aging, anggaran, kepatuhan, dan approval dalam satu workspace.
        </p>
      </header>

      <div className={styles.homeContent}>
        {/* 1. Data Readiness */}
        <div className={styles.orderReadiness}>
          <FinanceDataReadiness items={snapshot.source_readiness} />
        </div>

        {/* 2. Metrics 4 Cards */}
        <div className={styles.orderMetrics}>
          <FinanceMetricGrid metrics={snapshot.metrics} />
        </div>

        {/* 3. Middle 3-Column Grid: Cashflow (Treasury) + Aging + Approval */}
        <div className={styles.middle3Grid}>
          <div className={styles.orderCashflow}>
            <FinanceCashflowPanel />
          </div>
          <div className={styles.orderAging}>
            <FinanceAgingPanel />
          </div>
          <div className={styles.orderApproval}>
            <FinanceApprovalPanel />
          </div>
        </div>

        {/* 4. Bottom 2-Column Grid: Control Cadence + Finance Intelligence */}
        <div className={styles.bottom2Grid}>
          <div className={styles.orderCadence}>
            <FinanceControlCadence cadence={snapshot.control_cadence} />
          </div>
          <div className={styles.orderAgentSupport}>
            <FinanceAgentSupport agents={snapshot.agent_support} />
          </div>
        </div>

        {/* 5. Fund Segregation / Wallets (Contract Pending) */}
        <div className={styles.orderWallets}>
          <FinanceWalletsPanel />
        </div>
      </div>
    </div>
  );
}
