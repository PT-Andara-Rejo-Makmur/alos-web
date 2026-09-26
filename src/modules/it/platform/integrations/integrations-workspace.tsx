"use client";

import {
  Cable,
  Network,
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
import styles from "./integrations.module.css";

export function IntegrationsWorkspace() {
  const readiness = getModuleReadiness("integrations");
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
    <div className={styles.integrationsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / INTEGRATIONS"
        description="Backend integration diagnostics, authority boundaries, interface state, and troubleshooting evidence."
        title="Integrations"
      />

      {/* Module Readiness */}
      <section aria-label="Module readiness">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Module availability is governed by centralized readiness matrix; integration diagnostic does not bypass module status."
          icon={Cable}
          label="Module Readiness"
          status={readiness.availability}
        />
      </section>

      {/* Integration Diagnostic Region */}
      <section aria-labelledby="integration-status-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Health Probe"
          id="integration-status-title"
          subtitle="Contract-backed integration diagnostic via ALOS Backend"
          title="Integration Status"
        />

        <div className={styles.diagnosticPanel}>
          <div className={styles.diagnosticHeader}>
            <div className={styles.diagnosticIdentity}>
              <Network aria-hidden={true} className={styles.diagnosticIcon} size={20} />
              <div>
                <p className={styles.diagnosticTitle}>Backend System Integration Probe</p>
                <p className={styles.diagnosticSubtitle}>
                  {isConnected
                    ? "Diagnostic endpoint responded successfully with validated contract data."
                    : errorMessage ?? "Checking connection to ALOS Backend..."}
                </p>
              </div>
            </div>
            <ItStatusBadge label={diagnosticBadgeLabel} status={diagnosticBadgeStatus} />
          </div>

          {isConnected && diagnostic ? (
            <div className={styles.diagnosticGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Diagnostic</span>
                <span className={styles.metricValue}>CONNECTED</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Backend</span>
                <span className={styles.metricValue}>{diagnostic.backend.status}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>GENESIS</span>
                <span className={styles.metricValue}>{diagnostic.genesis.status}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Authority</span>
                <span className={styles.metricValue}>{diagnostic.backend.authority}</span>
              </div>
              {correlationId && (
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Correlation ID</span>
                  <span className={styles.monospaceText}>{correlationId}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.diagnosticGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Diagnostic</span>
                <span className={styles.metricValue}>{diagnosticBadgeLabel}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Diagnostic Evidence</span>
                <span className={styles.metricValue}>
                  {isChecking
                    ? "Probing integration endpoint..."
                    : errorMessage ?? "Integration diagnostic unavailable"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interface Registry */}
      <section aria-labelledby="interface-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Endpoints"
          id="interface-registry-title"
          subtitle="Officially recognized public and boundary interfaces"
          title="Interface Registry"
        />

        <ItDataTable
          ariaLabel="Interface boundary registry"
          columns={["Interface", "Direction", "Authority", "State", "Evidence"]}
          minWidth={760}
        >
          {/* Public diagnostic interface */}
          <tr>
            <td>
              <code className={styles.tableCode}>GET /api/v1/system/integration</code>
            </td>
            <td>Inbound (HTTPS)</td>
            <td>ALOS_BACKEND</td>
            <td>
              <ItStatusBadge
                label={diagnosticBadgeLabel}
                status={diagnosticBadgeStatus}
              />
            </td>
            <td>
              {isConnected
                ? "IntegrationDiagnostic contract"
                : isChecking
                  ? "Probing endpoint"
                  : "No response"}
            </td>
          </tr>
        </ItDataTable>

        <ItNotice title="Interface policy">
          Internal microservice endpoints and GENESIS direct URLs are excluded from public interface
          registries to prevent credential leakage and uphold architectural boundary integrity.
        </ItNotice>
      </section>

      {/* Troubleshooting Evidence */}
      <section aria-labelledby="troubleshooting-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Diagnostics"
          id="troubleshooting-title"
          subtitle="Non-credential troubleshooting identifiers and audit evidence"
          title="Troubleshooting"
        />

        <div className={styles.troubleshootingContainer}>
          <div className={styles.troubleshootingRow}>
            <span className={styles.troubleshootingKey}>Active Correlation ID</span>
            <span className={styles.troubleshootingValue}>
              {correlationId ?? "No active correlation trace available"}
            </span>
          </div>

          <div className={styles.troubleshootingRow}>
            <span className={styles.troubleshootingKey}>Authority Validation</span>
            <span className={styles.troubleshootingValue}>
              {isConnected && diagnostic
                ? `Authoritative state: ${diagnostic.genesis.authoritative_business_state ? "YES" : "NO"} | Provider required: ${diagnostic.genesis.provider_required ? "YES" : "NO"}`
                : "Awaiting valid diagnostic probe"}
            </span>
          </div>
        </div>

        <ItNotice title="Security & credential protection">
          Troubleshooting identifiers (Correlation IDs) are tracing tokens only and do not contain
          secrets. Authorization headers, API keys, Bearer tokens, Personal Access Tokens (PAT),
          and credentials remain strictly hidden.
        </ItNotice>
      </section>
    </div>
  );
}
