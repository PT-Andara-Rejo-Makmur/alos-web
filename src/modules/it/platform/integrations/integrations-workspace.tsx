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
      ? "MEMERIKSA"
      : diagnosticState === "connected"
        ? "TERHUBUNG"
        : diagnosticState === "not-configured"
          ? "BELUM DIKONFIGURASI"
          : "TERPUTUS";

  return (
    <div className={styles.integrationsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / INTEGRATIONS"
        description="Diagnostik integrasi Backend, batas otoritas, status antarmuka, dan bukti troubleshooting."
        title="Integrations"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat; diagnostik integrasi tidak menggantikan status modul."
          icon={Cable}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Integration Diagnostic Region */}
      <section aria-labelledby="integration-status-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Pemeriksaan Kesehatan"
          id="integration-status-title"
          subtitle="Diagnostik integrasi melalui ALOS Backend"
          title="Status Integrasi"
        />

        <div className={styles.diagnosticPanel}>
          <div className={styles.diagnosticHeader}>
            <div className={styles.diagnosticIdentity}>
              <Network aria-hidden={true} className={styles.diagnosticIcon} size={20} />
              <div>
                <p className={styles.diagnosticTitle}>Pemeriksaan Integrasi Sistem Backend</p>
                <p className={styles.diagnosticSubtitle}>
                  {isConnected
                    ? "Endpoint diagnostik merespons dengan data contract yang valid."
                    : errorMessage ?? "Memeriksa koneksi ke ALOS Backend..."}
                </p>
              </div>
            </div>
            <ItStatusBadge label={diagnosticBadgeLabel} status={diagnosticBadgeStatus} />
          </div>

          {isConnected && diagnostic ? (
            <div className={styles.diagnosticGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Diagnostic</span>
                <span className={styles.metricValue}>TERHUBUNG</span>
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
                <span className={styles.metricLabel}>Otoritas</span>
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
                <span className={styles.metricLabel}>Bukti Diagnostik</span>
                <span className={styles.metricValue}>
                  {isChecking
                    ? "Memeriksa endpoint integrasi..."
                    : errorMessage ?? "Diagnostik integrasi belum tersedia"}
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
          subtitle="Antarmuka publik dan batas sistem yang dikenali"
          title="Registri Antarmuka"
        />

        <ItDataTable
          ariaLabel="Registri batas antarmuka"
          columns={["Antarmuka", "Arah", "Otoritas", "Status", "Bukti"]}
          minWidth={760}
        >
          {/* Public diagnostic interface */}
          <tr>
            <td>
              <code className={styles.tableCode}>GET /api/v1/system/integration</code>
            </td>
            <td>Masuk (HTTPS)</td>
            <td>ALOS_BACKEND</td>
            <td>
              <ItStatusBadge
                label={diagnosticBadgeLabel}
                status={diagnosticBadgeStatus}
              />
            </td>
            <td>
              {isConnected
                ? "Contract IntegrationDiagnostic"
                : isChecking
                  ? "Memeriksa endpoint"
                  : "Tanpa respons"}
            </td>
          </tr>
        </ItDataTable>

        <ItNotice title="Kebijakan antarmuka">
          Endpoint microservice internal dan URL langsung GENESIS tidak ditampilkan dalam registri
          antarmuka publik untuk melindungi kredensial dan menjaga batas arsitektur.
        </ItNotice>
      </section>

      {/* Troubleshooting Evidence */}
      <section aria-labelledby="troubleshooting-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Diagnostik"
          id="troubleshooting-title"
          subtitle="Identifier troubleshooting tanpa kredensial dan bukti audit"
          title="Troubleshooting"
        />

        <div className={styles.troubleshootingContainer}>
          <div className={styles.troubleshootingRow}>
            <span className={styles.troubleshootingKey}>Correlation ID Aktif</span>
            <span className={styles.troubleshootingValue}>
              {correlationId ?? "Jejak correlation aktif belum tersedia"}
            </span>
          </div>

          <div className={styles.troubleshootingRow}>
            <span className={styles.troubleshootingKey}>Validasi Otoritas</span>
            <span className={styles.troubleshootingValue}>
              {isConnected && diagnostic
                ? `Status berwenang: ${diagnostic.genesis.authoritative_business_state ? "YA" : "TIDAK"} | Penyedia diperlukan: ${diagnostic.genesis.provider_required ? "YA" : "TIDAK"}`
                : "Menunggu hasil diagnostik yang valid"}
            </span>
          </div>
        </div>

        <ItNotice title="Keamanan & perlindungan kredensial">
          Identifier troubleshooting seperti Correlation ID hanya digunakan untuk tracing dan tidak memuat
          rahasia. Header otorisasi, API key, Bearer token, Personal Access Token (PAT),
          dan kredensial tidak ditampilkan.
        </ItNotice>
      </section>
    </div>
  );
}
