import type { ExecutiveDashboardSnapshot } from "./types";
import {
  projectDecisionQueue,
  projectDivisionHealth,
  projectExecutiveAIContext,
  projectExecutiveBrief,
} from "./executive-dashboard-projection";
import { ExecutiveBriefStrip } from "./executive-brief-strip";
import { ExecutiveMetricGrid } from "./executive-metric-grid";
import { DecisionQueuePanel } from "./decision-queue-panel";
import { DivisionHealthPanel } from "./division-health-panel";
import { CompanyPerformancePanel } from "./company-performance-panel";
import { ProjectDistributionPanel } from "./project-distribution-panel";
import { ExecutiveAIGovernancePanel } from "./executive-ai-governance-panel";
import { AttentionPanel } from "./attention-panel";
import styles from "./executive-dashboard.module.css";

interface ExecutiveDashboardHomeProps {
  readonly snapshot: ExecutiveDashboardSnapshot;
}

export function ExecutiveDashboardHome({ snapshot }: ExecutiveDashboardHomeProps) {
  const briefBlocks = projectExecutiveBrief(snapshot);
  const decisionItems = projectDecisionQueue(snapshot);
  const divisionItems = projectDivisionHealth(snapshot);
  const aiContext = projectExecutiveAIContext(snapshot);

  return (
    <div className={styles.container}>
      {/* 1. Page Header & Breadcrumb */}
      <header>
        <div className={styles.breadcrumb}>EXECUTIVE COMMAND CENTER</div>
        <h1 className={styles.pageTitle}>Executive Command Center</h1>
        <p className={styles.pageSubtitle}>
          Pusat kendali strategis Direktur Utama PT Andara Rejo Makmur.
        </p>
      </header>

      {/* 2. 07.45 Brief Strip */}
      <ExecutiveBriefStrip blocks={briefBlocks} />

      {/* 3. 4 Company Health Metric Cards */}
      <ExecutiveMetricGrid metrics={snapshot.metrics} />

      {/* 4. Middle Split: Decision Queue (Left) & Division Health (Right) */}
      <div className={styles.midGrid}>
        <DecisionQueuePanel items={decisionItems} />
        <DivisionHealthPanel divisions={divisionItems} />
      </div>

      {/* 5. Bottom Grid: Performance (SVG Line), Distribution (Donut), AI Governance */}
      <div className={styles.bottomGrid}>
        <CompanyPerformancePanel performance={snapshot.performance} />
        <ProjectDistributionPanel distribution={snapshot.project_distribution} />
        <ExecutiveAIGovernancePanel aiContext={aiContext} />
      </div>

      {/* 6. Attention Projects (Early Warning) */}
      <AttentionPanel projects={snapshot.attention_projects} />
    </div>
  );
}
