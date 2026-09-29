"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, PageHeader, Section } from "@/components/ui";
import { endCurrentSession } from "@/features/session";

import { useSettingsSession } from "../settings-layout";
import { formatSettingsDate, settingsSnapshot } from "../settings-model";
import { SettingsSourceStateView } from "../shared/settings-ui";
import styles from "../settings.module.css";

export function SettingsSessionsPage() {
  const router = useRouter();
  const snapshot = settingsSnapshot(useSettingsSession());
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logoutCurrentSession() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError(null);
    try {
      await endCurrentSession();
    } catch {
      setError("Sesi belum dapat ditutup. Silakan coba kembali.");
    } finally {
      router.replace("/login");
      router.refresh?.();
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader description="Tinjau sesi saat ini dan perangkat yang terhubung." eyebrow="PENGATURAN" title="Sesi & Perangkat" />
      <Section description="Metadata yang tersedia hanya berasal dari sesi saat ini." title="Sesi Saat Ini">
        <div className={styles.detailGrid}>
          <DetailItem label="Sesi" value="Sesi Saat Ini" />
          <DetailItem label="Dibuat" value={formatSettingsDate(snapshot.issuedAt)} />
          <DetailItem label="Berakhir" value={formatSettingsDate(snapshot.expiresAt)} />
          <DetailItem label="Status" value="Aktif" />
          <DetailItem label="Perangkat" value="—" />
          <DetailItem label="Browser" value="—" />
          <DetailItem label="Aktivitas Terakhir" value="—" />
        </div>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.actions}><Button disabled={loggingOut} onClick={() => void logoutCurrentSession()} variant="secondary">{loggingOut ? "Keluar…" : "Keluar dari sesi ini"}</Button></div>
      </Section>
      <Section description="Daftar perangkat lain dan pencabutan sesi jarak jauh belum tersedia." title="Perangkat Lain">
        <SettingsSourceStateView description="Registry sesi jarak jauh belum terhubung." state="unavailable" title="Sesi Jarak Jauh" />
        <div className={styles.actions}><Button disabled variant="secondary">Keluar dari perangkat lain belum tersedia</Button></div>
      </Section>
    </div>
  );
}

function DetailItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return <div><span className={styles.detailLabel}>{label}</span><span className={styles.detailValue}>{value}</span></div>;
}
