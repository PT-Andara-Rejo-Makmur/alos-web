"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, ShieldCheck } from "lucide-react";
import type {
  ExecutiveCorporateTargetRow,
  ExecutiveDomainSummaryCard,
  ExecutiveSourceInspection,
} from "../types";
import styles from "../executive-dashboard.module.css";

export type DrawerType =
  | { kind: "TARGET"; target: ExecutiveCorporateTargetRow }
  | { kind: "SOURCES"; sources: readonly ExecutiveSourceInspection[] }
  | { kind: "DOMAIN"; domain: ExecutiveDomainSummaryCard }
  | null;

interface ExecutiveDetailDrawerProps {
  readonly drawerState: DrawerType;
  readonly onClose: () => void;
}

export function ExecutiveDetailDrawer({ drawerState, onClose }: ExecutiveDetailDrawerProps) {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!drawerState) return;

    // Save previous active element for focus restoration
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Auto-focus first focusable element inside drawer
    const timer = setTimeout(() => {
      if (drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length > 0) {
          focusable[0]?.focus();
        } else {
          drawerRef.current.focus();
        }
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === drawerRef.current) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
        previousActiveElementRef.current.focus();
      }
    };
  }, [drawerState, onClose]);

  if (!drawerState) return null;

  return (
    <div
      className={styles.drawerBackdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={drawerRef}
        className={styles.drawerPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.drawerHeader}>
          <h2 id="drawer-title" className={styles.drawerTitle}>
            {drawerState.kind === "TARGET" && `Rincian Target: ${drawerState.target.name}`}
            {drawerState.kind === "SOURCES" && "Status Sumber Data Perusahaan"}
            {drawerState.kind === "DOMAIN" && `Rincian Fungsi: ${drawerState.domain.title}`}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className={styles.drawerCloseButton}
            aria-label="Tutup panel rincian"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {/* Target Detail */}
          {drawerState.kind === "TARGET" && (
            <div className={styles.drawerTargetContent}>
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Kode & Periode</span>
                <div className={styles.drawerSectionValue}>
                  {drawerState.target.code} · {drawerState.target.periodLabel}
                </div>
              </div>

              <div className={styles.drawerGrid2}>
                <div className={styles.drawerMetricBox}>
                  <span className={styles.drawerMetricLabel}>Nilai Target</span>
                  <strong className={styles.drawerMetricValue}>
                    {drawerState.target.targetDisplay}
                  </strong>
                </div>

                <div className={styles.drawerMetricBox}>
                  <span className={styles.drawerMetricLabel}>Nilai Aktual</span>
                  <strong className={styles.drawerMetricValue}>
                    {drawerState.target.actualDisplay}
                  </strong>
                </div>

                <div className={styles.drawerMetricBox}>
                  <span className={styles.drawerMetricLabel}>Perkiraan</span>
                  <strong className={styles.drawerMetricValue}>
                    {drawerState.target.forecastDisplay}
                  </strong>
                </div>

                <div className={styles.drawerMetricBox}>
                  <span className={styles.drawerMetricLabel}>Selisih</span>
                  <strong className={styles.drawerMetricValue}>
                    {drawerState.target.varianceDisplay}
                  </strong>
                </div>
              </div>

              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Status & Verifikasi</span>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                    {drawerState.target.statusLabel}
                  </span>
                  <span className={styles.verificationBadge}>
                    <ShieldCheck size={12} aria-hidden="true" style={{ marginRight: "0.25rem" }} />
                    {drawerState.target.verificationLabel}
                  </span>
                </div>
              </div>

              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Pemilik & Sumber Data</span>
                <p className={styles.drawerSectionValue}>
                  {drawerState.target.sourceLabel} · Disinkronisasi dari Stage 2 Strategy API
                </p>
              </div>

              <div className={styles.drawerFooterAction}>
                <Link
                  href="/workspace/executive/strategy"
                  className={styles.drawerPrimaryLink}
                  onClick={onClose}
                >
                  <span>Buka di Ruang Kerja Strategi</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}

          {/* Sources Detail */}
          {drawerState.kind === "SOURCES" && (() => {
            const checkedSources = drawerState.sources.filter((s) => s.checked);
            const catalogSources = drawerState.sources.filter((s) => !s.checked);

            return (
              <div className={styles.drawerSourcesContent}>
                <p className={styles.drawerSubtitleText}>
                  Transparansi kesiapan data: membedakan sumber yang benar-benar diperiksa via pemanggilan API jaringan dengan sumber domain yang terdaftar pada katalog kebutuhan data bisnis.
                </p>

                <div className={styles.drawerSection} style={{ marginTop: "1rem" }}>
                  <span className={styles.drawerSectionLabel}>
                    Sumber Diperiksa via Request Jaringan ({checkedSources.length} Sumber)
                  </span>
                  <div className={styles.sourcesList} role="list" style={{ marginTop: "0.5rem" }}>
                    {checkedSources.map((src) => (
                      <div key={src.id} className={styles.sourceCard} role="listitem">
                        <div className={styles.sourceCardTop}>
                          <div>
                            <strong className={styles.sourceName}>{src.name}</strong>
                            <span className={styles.sourceDomain}>{src.domain}</span>
                          </div>
                          <span
                            className={`${styles.badge} ${
                              src.state === "LIVE"
                                ? styles.badgeSuccess
                                : src.state === "PARTIAL"
                                  ? styles.badgeWarning
                                  : styles.badgeNeutral
                            }`}
                          >
                            {src.stateLabel}
                          </span>
                        </div>
                        <p className={styles.sourceDetail}>{src.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.drawerSection} style={{ marginTop: "1.5rem" }}>
                  <span className={styles.drawerSectionLabel}>
                    Sumber Domain Terdaftar di Katalog ({catalogSources.length} Sumber)
                  </span>
                  <div className={styles.sourcesList} role="list" style={{ marginTop: "0.5rem" }}>
                    {catalogSources.map((src) => (
                      <div key={src.id} className={styles.sourceCard} role="listitem">
                        <div className={styles.sourceCardTop}>
                          <div>
                            <strong className={styles.sourceName}>{src.name}</strong>
                            <span className={styles.sourceDomain}>{src.domain}</span>
                          </div>
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                            {src.stateLabel}
                          </span>
                        </div>
                        <p className={styles.sourceDetail}>{src.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Domain Detail */}
          {drawerState.kind === "DOMAIN" && (
            <div className={styles.drawerDomainContent}>
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Fungsi Bisnis</span>
                <p className={styles.drawerSectionValue}>
                  {drawerState.domain.businessPurpose}
                </p>
              </div>

              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Kesiapan Koneksi Data</span>
                <div style={{ marginTop: "0.25rem" }}>
                  <span className={`${styles.badge} ${
                    drawerState.domain.readiness === "LIVE"
                      ? styles.badgeSuccess
                      : drawerState.domain.readiness === "PARTIAL"
                        ? styles.badgeWarning
                        : styles.badgeNeutral
                  }`}>
                    {drawerState.domain.readinessLabel}
                  </span>
                </div>
              </div>

              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Fakta Kunci</span>
                <div className={styles.drawerFactsList}>
                  {drawerState.domain.facts.map((f, i) => (
                    <div key={i} className={styles.drawerFactRow}>
                      <span>{f.label}</span>
                      <strong>{f.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.drawerFooterAction}>
                <Link
                  href={drawerState.domain.drilldownHref}
                  className={styles.drawerPrimaryLink}
                  onClick={onClose}
                >
                  <span>Buka Workspace {drawerState.domain.title}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
