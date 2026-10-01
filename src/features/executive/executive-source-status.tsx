"use client";

import { useState } from "react";

import { Button, Drawer, EmptyState, LoadingState, Status } from "@/components/ui";
import type { ExecutiveConnectionStatus, ExecutiveOverviewProjection } from "@/lib/contracts";

import styles from "./executive.module.css";

export function connectionLabel(status: ExecutiveConnectionStatus | "loading") {
  switch (status) {
    case "loading": return { label: "Memuat", variant: "neutral" as const };
    case "CONNECTED": return { label: "Terhubung", variant: "success" as const };
    case "CONNECTED_EMPTY": return { label: "Terhubung · Belum ada data", variant: "neutral" as const };
    case "ERROR": return { label: "Gagal Memuat", variant: "danger" as const };
    default: return { label: "Belum Terhubung", variant: "neutral" as const };
  }
}

export function sourceDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export function ExecutiveSourceState({ status, emptyTitle = "Belum ada data." }: Readonly<{
  status: ExecutiveConnectionStatus | "loading";
  emptyTitle?: string;
}>) {
  if (status === "loading") return <LoadingState label="Memuat sumber authoritative" variant="section" />;
  if (status === "CONNECTED_EMPTY") return <EmptyState title={emptyTitle} description="Sumber berhasil dibaca dan belum memiliki data dalam visibility ruang kerja aktif." />;
  if (status === "ERROR") return <EmptyState title="Gagal Memuat" description="Sumber belum dapat dibaca. Data dan jumlah belum dapat ditampilkan." />;
  if (status === "UNAVAILABLE") return <EmptyState title="Belum Terhubung" description="Kapabilitas sumber untuk proyeksi ini belum tersedia." />;
  return null;
}

const domainNames: Record<string, string> = { SALES: "Sales & Marketing", FINANCE: "Finance & Pajak", PROPERTY: "Property & Teknik", LEGAL: "Legal", HR: "HR/GA", IT: "IT" };

export function executiveDomainLabel(domain: string): string {
  return domainNames[domain] ?? domain;
}

export function ExecutiveSourceStatus({ overview, loading, error }: Readonly<{
  overview: ExecutiveOverviewProjection | null;
  loading: boolean;
  error: string | null;
}>) {
  const [open, setOpen] = useState(false);
  const fallback: ExecutiveConnectionStatus | "loading" = loading ? "loading" : error ? "ERROR" : "UNAVAILABLE";
  const sources = [
    { domain: "Strategi", status: overview?.strategy.status ?? fallback, updated: overview?.strategy.last_updated_at, authoritative: overview?.strategy.authoritative },
    { domain: "Shared Work", status: overview?.shared_work.status ?? fallback, updated: overview?.shared_work.last_updated_at, authoritative: overview?.shared_work.authoritative },
    ...(overview?.domains ?? []).map((domain) => ({ domain: executiveDomainLabel(domain.domain), status: domain.status, updated: domain.last_verified_at, authoritative: domain.sources.some((source) => source.authoritative) })),
  ];
  return <>
    <div className={styles.sourceStrip}>
      {sources.map((source) => <span className={styles.sourceItem} key={source.domain}><span>{source.domain}</span><Status {...connectionLabel(source.status)} /></span>)}
      <Button onClick={() => setOpen(true)} size="sm" variant="ghost">Lihat Status Data</Button>
    </div>
    <Drawer description="Status, authority, dan waktu berasal dari proyeksi Backend." onClose={() => setOpen(false)} open={open} title="Status Data">
      <dl className={styles.sourceDetails}>
        {sources.map((source) => <div className={styles.sourceDetail} key={source.domain}>
          <dt>{source.domain}</dt><dd><Status {...connectionLabel(source.status)} /></dd>
          <dt>Waktu data</dt><dd>{sourceDate(source.updated)}</dd>
          <dt>Sumber authoritative</dt><dd>{source.authoritative === undefined ? "—" : source.authoritative ? "Ya" : "Belum tersedia"}</dd>
        </div>)}
      </dl>
    </Drawer>
  </>;
}
