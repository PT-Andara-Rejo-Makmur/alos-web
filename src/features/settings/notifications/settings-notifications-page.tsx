"use client";

import { DataTable, PageHeader, Section, Status, type DataTableColumn } from "@/components/ui";

import { SettingsSourceStateView } from "../shared/settings-ui";
import styles from "../settings.module.css";

type NotificationCategory = { readonly id: string; readonly label: string };

const notificationCategories: readonly NotificationCategory[] = [
  { id: "tasks", label: "Tugas" },
  { id: "approvals", label: "Persetujuan" },
  { id: "findings", label: "Temuan" },
  { id: "deadlines", label: "Deadline" },
  { id: "reports", label: "Laporan" },
  { id: "incidents", label: "Insiden" },
  { id: "system", label: "Sistem" },
  { id: "ara", label: "ARA / AI" },
];

const notificationColumns: readonly DataTableColumn<NotificationCategory>[] = [
  { header: "Kategori", key: "category", render: (row) => row.label },
  { header: "Dalam Aplikasi", key: "in-app", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
  { header: "Email", key: "email", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
  { header: "WhatsApp", key: "whatsapp", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
  { header: "Telegram", key: "telegram", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
];

export function SettingsNotificationsPage() {
  return (
    <div className={styles.page}>
      <PageHeader description="Atur pemberitahuan pekerjaan dan aktivitas penting." eyebrow="PENGATURAN" title="Notifikasi" />
      <Section description="Kontrol notifikasi belum memiliki sumber preferensi tersimpan." title="Preferensi Notifikasi">
        <SettingsSourceStateView description="Sumber preferensi notifikasi belum tersedia." state="unavailable" title="Notifikasi" />
        <DataTable caption="Preferensi notifikasi" columns={notificationColumns} getRowKey={(row) => row.id} rows={notificationCategories} />
      </Section>
      <Section description="Kewajiban notifikasi keamanan, governance, dan kepatuhan menunggu kebijakan resmi." title="Notifikasi Wajib">
        <SettingsSourceStateView description="Kebijakan notifikasi wajib belum ditentukan." state="unavailable" title="Kebijakan" />
      </Section>
    </div>
  );
}
