"use client";

import { Button, FormField, PageHeader, Section, Status } from "@/components/ui";

import { useSettingsSession } from "../settings-layout";
import { settingsSnapshot } from "../settings-model";
import { SettingsSourceStateView } from "../shared/settings-ui";
import styles from "../settings.module.css";

export function SettingsSecurityPage() {
  const snapshot = settingsSnapshot(useSettingsSession());

  return (
    <div className={styles.page}>
      <PageHeader description="Tinjau keamanan akun dan metode autentikasi yang tersedia." eyebrow="PENGATURAN" title="Keamanan" />

      <Section description="Perubahan kata sandi menunggu layanan resmi." title="Kata Sandi">
        <form className={styles.formStack} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.formGrid}>
            <FormField htmlFor="settings-current-password" label="Kata Sandi Saat Ini" required><input autoComplete="current-password" className={styles.formControl} id="settings-current-password" type="password" /></FormField>
            <FormField htmlFor="settings-new-password" label="Kata Sandi Baru" required><input autoComplete="new-password" className={styles.formControl} id="settings-new-password" type="password" /></FormField>
            <FormField htmlFor="settings-confirm-password" label="Konfirmasi Kata Sandi Baru" required><input autoComplete="new-password" className={styles.formControl} id="settings-confirm-password" type="password" /></FormField>
          </div>
          <div className={styles.actions}><Button disabled type="submit">Ubah Kata Sandi</Button></div>
        </form>
      </Section>

      <Section description="Status akun ditampilkan dari sesi pengguna." title="Keamanan Akun">
        <div className={styles.detailGrid}><div><span className={styles.detailLabel}>Status Akun</span><span className={styles.detailValue}>{snapshot.active === null ? "—" : <Status label={snapshot.active ? "Aktif" : "Nonaktif"} variant={snapshot.active ? "success" : "neutral"} />}</span></div><div><span className={styles.detailLabel}>Pengaturan Mandiri</span><span className={styles.detailValue}>Belum Dinilai</span></div></div>
      </Section>

      <Section title="Metode Autentikasi"><SettingsSourceStateView description="Metode autentikasi akun belum disediakan oleh sumber sesi." state="unavailable" title="Metode Autentikasi" /></Section>
      <Section title="Aktivitas Keamanan"><SettingsSourceStateView description="Aktivitas keamanan belum tersedia dari sumber resmi." state="unavailable" title="Aktivitas Keamanan" /></Section>
    </div>
  );
}
