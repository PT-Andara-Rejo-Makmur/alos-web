"use client";

import { Button, FormField, PageHeader, Section } from "@/components/ui";

import { SettingsSourceStateView } from "../shared/settings-ui";
import styles from "../settings.module.css";

export function SettingsPreferencesPage() {
  return (
    <div className={styles.page}>
      <PageHeader description="Atur bahasa, waktu, format, dan tampilan aplikasi." eyebrow="PENGATURAN" title="Preferensi" />
      <Section description="Preferensi tersimpan belum tersedia dari sumber pengguna." title="Preferensi Tampilan">
        <SettingsSourceStateView description="Perubahan preferensi tidak disimpan di browser dan belum tersedia di layanan resmi." state="unavailable" title="Preferensi" />
        <form className={styles.formStack} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.formGrid}>
            <FormField htmlFor="settings-preference-language" label="Bahasa" required><select className={styles.formControl} disabled id="settings-preference-language"><option>Belum tersedia</option></select></FormField>
            <FormField htmlFor="settings-preference-timezone" label="Zona Waktu" required><select className={styles.formControl} disabled id="settings-preference-timezone"><option>Belum tersedia</option></select></FormField>
            <FormField htmlFor="settings-preference-date" label="Format Tanggal"><select className={styles.formControl} disabled id="settings-preference-date"><option>Belum tersedia</option></select></FormField>
            <FormField htmlFor="settings-preference-theme" label="Tampilan"><select className={styles.formControl} disabled id="settings-preference-theme"><option>Belum tersedia</option></select></FormField>
            <FormField htmlFor="settings-preference-density" label="Kepadatan Tabel"><select className={styles.formControl} disabled id="settings-preference-density"><option>Belum tersedia</option></select></FormField>
          </div>
          <div className={styles.actions}><Button disabled type="submit">Penyimpanan preferensi belum tersedia.</Button></div>
        </form>
      </Section>
    </div>
  );
}
