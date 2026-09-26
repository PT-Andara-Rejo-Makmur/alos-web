"use client";

import React from "react";
import { Target, Layers, Link2 } from "lucide-react";
import type { StrategyLinkState, StrategyLinkageInfo } from "./types";
import styles from "../ui/work-ui.module.css";

interface StrategyLinkPanelProps {
  readonly linkage?: StrategyLinkageInfo | null;
  readonly contextTitle?: string;
}

export const StrategyLinkPanel: React.FC<StrategyLinkPanelProps> = ({
  linkage,
  contextTitle = "Keterkaitan Strategi",
}) => {
  const state: StrategyLinkState = linkage?.state ?? "SOURCE_UNAVAILABLE";

  return (
    <div className={styles.strategyLinkPanel} aria-label="Panel Keterkaitan Strategi">
      <div className={styles.strategyLinkHeader}>
        <span className={styles.strategyLinkTitle}>
          <Target size={13} aria-hidden="true" />
          <span>{contextTitle}</span>
        </span>
        <span
          className={`${styles.strategyLinkStatusBadge} ${
            state === "CONNECTED"
              ? styles.strategyLinkConnected
              : state === "NO_LINK"
                ? styles.strategyLinkNoLink
                : styles.strategyLinkUnavailable
          }`}
        >
          {state === "CONNECTED"
            ? "TERTAUT"
            : state === "NO_LINK"
              ? "BELUM TERTAUT"
              : "BELUM TERSEDIA"}
        </span>
      </div>

      {state === "CONNECTED" && linkage ? (
        <div className={styles.strategyLinkContent}>
          {linkage.objective_title && (
            <div className={styles.strategyLinkItem}>
              <Layers size={12} aria-hidden="true" />
              <span>
                <strong>Sasaran:</strong> {linkage.objective_title}
              </span>
            </div>
          )}
          {linkage.kpi_name && (
            <div className={styles.strategyLinkItem}>
              <Target size={12} aria-hidden="true" />
              <span>
                <strong>KPI:</strong> {linkage.kpi_name}
              </span>
            </div>
          )}
          {linkage.initiative_title && (
            <div className={styles.strategyLinkItem}>
              <Link2 size={12} aria-hidden="true" />
              <span>
                <strong>Inisiatif:</strong> {linkage.initiative_title}
              </span>
            </div>
          )}
        </div>
      ) : state === "NO_LINK" ? (
        <div className={styles.strategyLinkContent}>
          <p style={{ margin: 0 }}>
            Entitas ini belum memiliki tautan ke sasaran, KPI, atau inisiatif strategis.
          </p>
        </div>
      ) : (
        <div className={styles.strategyLinkContent}>
          <p style={{ margin: 0 }}>
            Tautan strategi belum tersedia dari Backend. Pemetaan relasi ke Sasaran, KPI, atau Inisiatif akan tampil saat didukung oleh sumber data authoritative.
          </p>
        </div>
      )}
    </div>
  );
};
