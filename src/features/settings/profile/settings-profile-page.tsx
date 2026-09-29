"use client";

import { useSettingsSession } from "../settings-layout";
import { DataTable, FormField, PageHeader, Section, Status, Button, type DataTableColumn } from "@/components/ui";
import type { WorkspaceAccessProjection } from "@/lib/contracts";

import { settingsRoleLabel, settingsSnapshot } from "../settings-model";
import { SettingsSourceStateView } from "../shared/settings-ui";
import styles from "../settings.module.css";

const workspaceColumns: readonly DataTableColumn<WorkspaceAccessProjection>[] = [
  { header: "Workspace", key: "workspace", render: (access) => access.workspace.workspace_name },
  { header: "Role", key: "role", render: (access) => access.role_refs.length ? access.role_refs.map(settingsRoleLabel).join(", ") : "Belum Dinilai" },
  { header: "Status Akses", key: "status", render: (access) => <Status label={access.active && access.workspace.active ? "Aktif" : "Nonaktif"} variant={access.active && access.workspace.active ? "success" : "neutral"} /> },
];

export function SettingsProfilePage() {
  const session = useSettingsSession();
  const snapshot = settingsSnapshot(session);

  return (
    <div className={styles.page}>
      <PageHeader description="Kelola informasi diri dan lihat akses ruang kerja Anda." eyebrow="PENGATURAN" title="Profil" />

      <Section description="Data berikut berasal dari sesi pengguna saat ini." title="Profil Saat Ini">
        <div className={styles.detailGrid}>
          <DetailItem label="Nama Tampilan" value={snapshot.displayName ?? "—"} />
          <DetailItem label="Email" value={snapshot.email ?? "—"} />
          <DetailItem label="Status Akun" value={snapshot.active === null ? "—" : snapshot.active ? "Aktif" : "Nonaktif"} />
          <DetailItem label="Workspace Aktif" value={snapshot.activeWorkspaceName ?? "—"} />
        </div>
      </Section>

      <Section description="Data organisasi dan kepegawaian dikelola oleh sumber HR / GA." title="Informasi Kepegawaian">
        <SettingsSourceStateView description="Data kepegawaian belum terhubung ke Pengaturan." state="unavailable" title="HR / GA">
          <div className={styles.detailGrid}>
            <DetailItem label="Employee ID" value="Belum Terhubung" />
            <DetailItem label="Jabatan" value="Belum Terhubung" />
            <DetailItem label="Divisi" value="Belum Terhubung" />
            <DetailItem label="Status Kepegawaian" value="Belum Terhubung" />
          </div>
          <p className={styles.formHint}>Perubahan data kepegawaian dikelola melalui HR / GA.</p>
        </SettingsSourceStateView>
      </Section>

      <Section description="Role dan ruang kerja hanya dapat dilihat dari sumber akses resmi." title="Workspace yang Dimiliki">
        {snapshot.workspaces.length ? <DataTable caption="Workspace yang dimiliki" columns={workspaceColumns} getRowKey={(access) => access.workspace.workspace_id} rows={snapshot.workspaces} /> : <SettingsSourceStateView description="Belum ada workspace dari sumber sesi." state="connected-empty" title="Workspace" />}
      </Section>

      <Section description="Perubahan belum dikirim ke layanan profil." title="Edit Profil">
        <form className={styles.formStack} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.formGrid}>
            <FormField description="Sumber foto profil belum tersedia." htmlFor="settings-avatar" label="Foto Profil"><input className={styles.formControl} disabled id="settings-avatar" readOnly value="Belum tersedia" /></FormField>
            <FormField description="Nilai saat ini berasal dari sesi pengguna." htmlFor="settings-display-name" label="Nama Tampilan" required><input className={styles.formControl} defaultValue={snapshot.displayName ?? ""} id="settings-display-name" /></FormField>
            <FormField description="Email login tidak dapat diubah dari Pengaturan saat ini." htmlFor="settings-email" label="Email"><input className={styles.formControl} id="settings-email" readOnly value={snapshot.email ?? "—"} /></FormField>
            <FormField description="Nomor telepon belum tersedia." htmlFor="settings-phone" label="Nomor Telepon"><input className={styles.formControl} disabled id="settings-phone" readOnly value="Belum Terhubung" /></FormField>
            <FormField description="Preferensi tersimpan belum tersedia." htmlFor="settings-timezone" label="Zona Waktu" required><select className={styles.formControl} disabled id="settings-timezone"><option>Belum tersedia</option></select></FormField>
            <FormField description="Preferensi tersimpan belum tersedia." htmlFor="settings-language" label="Bahasa" required><select className={styles.formControl} disabled id="settings-language"><option>Belum tersedia</option></select></FormField>
          </div>
          <div className={styles.actions}><Button disabled type="submit">Penyimpanan profil belum tersedia.</Button></div>
        </form>
      </Section>
    </div>
  );
}

function DetailItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return <div><span className={styles.detailLabel}>{label}</span><span className={styles.detailValue}>{value}</span></div>;
}
