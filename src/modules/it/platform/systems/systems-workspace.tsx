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
      ? "MEMERIKSA"
      : diagnosticState === "connected"
        ? "TERHUBUNG"
        : diagnosticState === "not-configured"
          ? "BELUM DIKONFIGURASI"
          : "TERPUTUS";

  return (
    <div className={styles.systemsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / SYSTEMS"
        description="Komponen platform, bukti runtime, status integrasi, dan cakupan sumber operasional."
        title="Systems"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat; diagnostik integrasi tidak menggantikan status modul."
          icon={Server}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Integration Diagnostic Status */}
      <section aria-labelledby="integration-diagnostic-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Bukti Runtime"
          id="integration-diagnostic-title"
          subtitle="Pemeriksaan diagnostik Backend melalui GET /api/v1/system/integration"
          title="Diagnostik Integrasi"
        />

        <div className={styles.diagnosticCard}>
          <div className={styles.diagnosticHeader}>
            <div className={styles.diagnosticIdentity}>
              <RadioTower aria-hidden={true} className={styles.diagnosticIcon} size={20} />
              <div>
                <p className={styles.diagnosticTitle}>Pemeriksaan Integrasi ALOS Backend</p>
                <p className={styles.diagnosticSubtitle}>
                  {isConnected
                    ? "Bukti aktif diterima dari endpoint integrasi Backend."
                    : errorMessage ?? "Memeriksa koneksi ke ALOS Backend..."}
                </p>
              </div>
            </div>
            <ItStatusBadge label={diagnosticBadgeLabel} status={diagnosticBadgeStatus} />
          </div>

          {isConnected && diagnostic ? (
            <div className={styles.diagnosticGrid}>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Layanan Backend</span>
                <span className={styles.metricValue}>{diagnostic.backend.service}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Status Backend</span>
                <span className={styles.metricValue}>{diagnostic.backend.status}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Otoritas Backend</span>
                <span className={styles.metricValue}>{diagnostic.backend.authority}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Layanan GENESIS</span>
                <span className={styles.metricValue}>{diagnostic.genesis.service}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>GENESIS Status</span>
                <span className={styles.metricValue}>{diagnostic.genesis.status}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Peran GENESIS</span>
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
                <span className={styles.metricLabel}>Status Pemeriksaan</span>
                <span className={styles.metricValue}>{diagnosticBadgeLabel}</span>
              </div>
              <div className={styles.diagnosticMetric}>
                <span className={styles.metricLabel}>Bukti Diagnostik</span>
                <span className={styles.metricValue}>
                  {isChecking
                    ? "Memeriksa endpoint..."
                    : errorMessage ?? "Respons diagnostik belum diterima"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* System Registry */}
      <section aria-labelledby="system-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Inventaris"
          id="system-registry-title"
          subtitle="Sistem platform, batas peran, dan status bukti runtime"
          title="Registri Sistem"
        />

        <ItDataTable
          ariaLabel="Registri sistem platform"
          columns={["Sistem", "Peran", "Bukti Runtime", "Bukti Integrasi", "Sumber"]}
          minWidth={760}
        >
          {/* Web App */}
          <tr>
            <td>
              <strong>Web App</strong>
            </td>
            <td>Shell Presentasi</td>
            <td>Permukaan presentasi tersedia</td>
            <td>Sesi browser</td>
            <td className={styles.tableCode}>alos-web</td>
          </tr>

          {/* Backend API */}
          <tr>
            <td>
              <strong>ALOS Backend</strong>
            </td>
            <td>Otoritas Bisnis</td>
            <td>
              {isConnected && diagnostic
                ? diagnostic.backend.status
                : isChecking
                  ? "Memeriksa..."
                  : "Tidak diketahui"}
            </td>
            <td>
              {isConnected && diagnostic
                  ? `Otoritas: ${diagnostic.backend.authority}`
                : isChecking
                  ? "Memeriksa..."
                  : diagnosticState === "not-configured"
                    ? "Backend belum dikonfigurasi"
                    : "Belum terhubung"}
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
            <td>Control Plane AI</td>
            <td>
              {isConnected && diagnostic
                ? diagnostic.genesis.status
                : isChecking
                  ? "Memeriksa..."
                  : "Tidak diketahui"}
            </td>
            <td>
              {isConnected && diagnostic
                  ? `Peran: ${diagnostic.genesis.role}`
                : isChecking
                  ? "Memeriksa..."
                  : diagnosticState === "not-configured"
                    ? "Backend belum dikonfigurasi"
                    : "Belum terhubung"}
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
              <strong>Database & Infrastruktur</strong>
            </td>
            <td>Persistensi & Cloud</td>
            <td>Tidak diketahui (tanpa sumber)</td>
            <td>Belum terhubung</td>
            <td className={styles.tableCode}>Batas Backend</td>
          </tr>
        </ItDataTable>
      </section>

      {/* Architecture Boundary */}
      <section aria-labelledby="architecture-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Jaringan & Topologi"
          id="architecture-boundary-title"
          subtitle="Batas eksekusi searah dan otoritas sistem"
          title="Batas Arsitektur"
        />

        <div className={styles.flowContainer}>
          <div className={styles.flowNode}>
            <AppWindow aria-hidden={true} className={styles.flowNodeIcon} size={22} />
            <span className={styles.flowNodeName}>Client Web</span>
            <span className={styles.flowNodeRole}>Shell presentasi browser</span>
          </div>

          <div aria-hidden={true} className={styles.flowArrow}>
            <ArrowRight size={20} />
          </div>

          <div className={styles.flowNode}>
            <Server aria-hidden={true} className={styles.flowNodeIcon} size={22} />
            <span className={styles.flowNodeName}>ALOS Backend</span>
            <span className={styles.flowNodeRole}>Gateway API tunggal yang berwenang</span>
          </div>

          <div aria-hidden={true} className={styles.flowArrow}>
            <ArrowRight size={20} />
          </div>

          <div className={styles.flowNode}>
            <Bot aria-hidden={true} className={styles.flowNodeIcon} size={22} />
            <span className={styles.flowNodeName}>GENESIS / Internal</span>
            <span className={styles.flowNodeRole}>Control plane AI & sistem internal</span>
          </div>
        </div>

        <ItNotice title="Penerapan batas otoritas">
          Browser tidak mengirim permintaan langsung ke GENESIS, engine database, atau infrastruktur
          cloud. Seluruh operasi dan telemetri melewati batas ALOS Backend.
        </ItNotice>
      </section>
    </div>
  );
}
