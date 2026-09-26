"use client";

import {
  AppWindow,
  ArrowRight,
  Bot,
  RadioTower,
  Server,
} from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItStatusRow,
} from "@/modules/it/ui";
import { useIntegrationDiagnostic } from "../shared";
import styles from "./systems.module.css";

export function SystemsWorkspace() {
  const readiness = getModuleReadiness("systems");
  const { state: diagnosticState, diagnostic, correlationId, isChecking, isConnected, errorMessage } =
    useIntegrationDiagnostic();

  const diagnosticBadgeStatus = isConnected
    ? "LIVE"
    : isChecking
      ? "PARTIAL"
      : "NOT_CONNECTED";

  const diagnosticBadgeLabel =
    diagnosticState === "checking"
      ? "CHECKING"
      : diagnosticState === "connected"
        ? "CONNECTED"
        : diagnosticState === "not-configured"
          ? "NOT CONFIGURED"
          : "DISCONNECTED";

  return (
    <div className={styles.systemsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / SYSTEMS"
        description="Platform components, runtime evidence, integration state, and operational source coverage."
        title="Systems"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix; integration diagnostic does not bypass module status."
          icon={Server}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Integration Diagnostic Status */}
      <section aria-labelledby="integration-diagnostic-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Runtime Evidence"
          id="integration-diagnostic-title"
          subtitle="Real-time backend diagnostic probe (GET /api/v1/system/integration)"
          title="Integration Diagnostic"
        />

        <div className={styles.diagnosticCard}>
          <div className={styles.diagnosticHeader}>
            <div className={styles.diagnosticIdentity}>
              <RadioTower aria-hidden={true} className={styles.diagnosticIcon} size={20} />
              <div>
                <p className={styles.diagnosticTitle}>ALOS Backend Integration Probe</p>
                <p className={styles.diagnosticSubtitle}>
                  {isConnected
                    ? "Active evidence received from Backend integration endpoint."
                    : errorMessage ?? "Checking connection to ALOS Backend..."}
                </p>
              </div>
            </div>
            <ItStatusBadge label={diagnosticBadgeLabel} status={diagnosticBadgeStatus} />
          </div>

          {isConnected && diagnostic ? (
            <div className={styles.diagnosticGrid}>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Backend Service</span>
                <span className={styles.metricValue}>{diagnostic.backend.service}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Backend Status</span>
                <span className={styles.metricValue}>{diagnostic.backend.status}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Backend Authority</span>
                <span className={styles.metricValue}>{diagnostic.backend.authority}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>GENESIS Service</span>
                <span className={styles.metricValue}>{diagnostic.genesis.service}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>GENESIS Status</span>
                <span className={styles.metricValue}>{diagnostic.genesis.status}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>GENESIS Role</span>
                <span className={styles.metricValue}>{diagnostic.genesis.role}</span>
              </div>
              {correlationId && (
                <div className={styles.diagnosticMetric}>
                  <span className={styles.metricLabel}>Correlation ID</span>
                  <span className={styles.monospaceValue}>{correlationId}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.diagnosticGrid}>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Probe State</span>
                <span className={styles.metricValue}>{diagnosticBadgeLabel}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Diagnostic Evidence</span>
                <span className={styles.metricValue}>
                  {isChecking
                    ? "Probing endpoint..."
                    : errorMessage ?? "No diagnostic response received"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* System Registry */}
      <section aria-labelledby="system-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Inventory"
          id="system-registry-title"
          subtitle="Platform systems, role boundaries, and runtime evidence status"
          title="System Registry"
        />

        <ItDataTable
          ariaLabel="Platform systems registry"
          columns={["System", "Role", "Runtime Evidence", "Integration Evidence", "Source"]}
          minWidth={760}
        >
          {/* Web App */}
          <tr>
            <td>
              <strong>Web App</strong>
            </td>
            <td>Presentation Shell</td>
            <td>Presentation surface available</td>
            <td>Browser session</td>
            <td className={styles.tableCode}>alos-web</td>
          </tr>

          {/* Backend API */}
          <tr>
            <td>
              <strong>ALOS Backend</strong>
            </td>
            <td>Business Authority</td>
            <td>
              {isConnected && diagnostic
                ? diagnostic.backend.status
                : isChecking
                  ? "Checking..."
                  : "Unknown"}
            </td>
            <td>
              {isConnected && diagnostic
                ? `Authority: ${diagnostic.backend.authority}`
                : isChecking
                  ? "Probing..."
                  : diagnosticState === "not-configured"
                    ? "Backend not configured"
                    : "Not connected"}
            </td>
            <td className={styles.tableCode}>
              {isConnected && diagnostic ? diagnostic.backend.service : "alos-backend"}
            </td>
          </tr>

          {/* GENESIS Control Plane */}
          <tr>
            <td>
              <strong>GENESIS</strong>
            </td>
            <td>AI Control Plane</td>
            <td>
              {isConnected && diagnostic
                ? diagnostic.genesis.status
                : isChecking
                  ? "Checking..."
                  : "Unknown"}
            </td>
            <td>
              {isConnected && diagnostic
                ? `Role: ${diagnostic.genesis.role}`
                : isChecking
                  ? "Probing..."
                  : diagnosticState === "not-configured"
                    ? "Backend not configured"
                    : "Not connected"}
            </td>
            <td className={styles.tableCode}>
              {isConnected && diagnostic
                ? `${diagnostic.genesis.service} (via Backend)`
                : "genesis-ai (via Backend)"}
            </td>
          </tr>

          {/* Database / Infrastructure */}
          <tr>
            <td>
              <strong>Database & Infra</strong>
            </td>
            <td>Persistence & Cloud</td>
            <td>Unknown (no source)</td>
            <td>Not connected</td>
            <td className={styles.tableCode}>Backend boundary</td>
          </tr>
        </ItDataTable>
      </section>

      {/* Architecture Boundary */}
      <section aria-labelledby="architecture-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Network & Topology"
          id="architecture-boundary-title"
          subtitle="Strict unidirectional execution and authority boundary"
          title="Architecture Boundary"
        />

        <div className={styles.flowContainer}>
          <div className={styles.flowNode}>
            <AppWindow aria-hidden={true} className={styles.flowNodeIcon} size={22} />
            <span className={styles.flowNodeName}>Web Client</span>
            <span className={styles.flowNodeRole}>Browser presentation shell</span>
          </div>

          <div aria-hidden={true} className={styles.flowArrow}>
            <ArrowRight size={20} />
          </div>

          <div className={styles.flowNode}>
            <Server aria-hidden={true} className={styles.flowNodeIcon} size={22} />
            <span className={styles.flowNodeName}>ALOS Backend</span>
            <span className={styles.flowNodeRole}>Sole authoritative API gateway</span>
          </div>

          <div aria-hidden={true} className={styles.flowArrow}>
            <ArrowRight size={20} />
          </div>

          <div className={styles.flowNode}>
            <Bot aria-hidden={true} className={styles.flowNodeIcon} size={22} />
            <span className={styles.flowNodeName}>GENESIS / Internal</span>
            <span className={styles.flowNodeRole}>AI control plane & internal systems</span>
          </div>
        </div>

        <ItNotice title="Strict boundary enforcement">
          The browser never issues direct requests to GENESIS, database engines, or cloud
          infrastructure. All operations and telemetry are mediated exclusively through the ALOS
          Backend boundary.
        </ItNotice>
      </section>
    </div>
  );
}
