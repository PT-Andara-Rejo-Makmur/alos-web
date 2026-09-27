"use client";

import { useState } from "react";

import { Button, Drawer, Status } from "@/components/ui";

import styles from "./executive.module.css";

export interface SourceStatusItem {
  readonly domain: string;
  readonly owner: string;
  readonly status: "available" | "unavailable" | "error";
  readonly updatedAt: string;
  readonly verification: string;
}

const defaultSources: readonly SourceStatusItem[] = [
  { domain: "Strategi", owner: "—", status: "available", updatedAt: "Mengikuti data halaman", verification: "Mengikuti data target" },
  { domain: "Operasional", owner: "—", status: "unavailable", updatedAt: "—", verification: "—" },
  { domain: "Keuangan", owner: "—", status: "unavailable", updatedAt: "—", verification: "—" },
  { domain: "Penjualan", owner: "—", status: "unavailable", updatedAt: "—", verification: "—" },
  { domain: "Property", owner: "—", status: "unavailable", updatedAt: "—", verification: "—" },
  { domain: "Legal", owner: "—", status: "unavailable", updatedAt: "—", verification: "—" },
  { domain: "SDM", owner: "—", status: "unavailable", updatedAt: "—", verification: "—" },
  { domain: "IT", owner: "—", status: "unavailable", updatedAt: "—", verification: "—" },
];

function sourceStatus(status: SourceStatusItem["status"]) {
  if (status === "available") return { label: "Tersedia", variant: "success" as const };
  if (status === "error") return { label: "Gagal Memuat", variant: "danger" as const };
  return { label: "Belum Terhubung", variant: "neutral" as const };
}

export function ExecutiveSourceStatus({ strategyAvailable }: Readonly<{ strategyAvailable: boolean }>) {
  const [open, setOpen] = useState(false);
  const sources = defaultSources.map((source) => source.domain === "Strategi" && !strategyAvailable
    ? { ...source, status: "error" as const, updatedAt: "—", verification: "—" }
    : source);

  return (
    <>
      <div className={styles.sourceStrip}>
        {sources.map((source) => {
          const presentation = sourceStatus(source.status);
          return <span className={styles.sourceItem} key={source.domain}><span>{source.domain}</span><Status label={presentation.label} variant={presentation.variant} /></span>;
        })}
        <Button onClick={() => setOpen(true)} size="sm" variant="ghost">Lihat Status Data</Button>
      </div>
      <Drawer description="Ketersediaan ditampilkan hanya dari sumber yang saat ini terhubung." onClose={() => setOpen(false)} open={open} title="Status Data">
        <dl className={styles.sourceDetails}>
          {sources.map((source) => {
            const presentation = sourceStatus(source.status);
            return (
              <div className={styles.sourceDetail} key={source.domain}>
                <dt>{source.domain}</dt><dd><Status label={presentation.label} variant={presentation.variant} /></dd>
                <dt>Waktu data</dt><dd>{source.updatedAt}</dd>
                <dt>Owner source</dt><dd>{source.owner}</dd>
                <dt>Verifikasi</dt><dd>{source.verification}</dd>
                <dt>Keterangan</dt><dd>{source.status === "available" ? "Data strategi tersedia pada halaman ini." : "Sumber belum terhubung."}</dd>
              </div>
            );
          })}
        </dl>
      </Drawer>
    </>
  );
}
