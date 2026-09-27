import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

import { EmptyState } from "@/components/ui";

export type WorkModuleType =
  | "projects"
  | "tasks"
  | "approvals"
  | "documents"
  | "reports"
  | "findings";

const defaultMessages: Record<WorkModuleType, { description: string; title: string }> = {
  projects: {
    title: "Belum ada proyek yang dapat Anda akses.",
    description: "Proyek atau program kerja baru akan muncul di sini setelah didaftarkan dan Anda diberikan hak akses.",
  },
  tasks: {
    title: "Tidak ada tugas yang ditugaskan kepada Anda.",
    description: "Tugas kerja yang memerlukan kontribusi Anda akan ditampilkan pada daftar ini.",
  },
  approvals: {
    title: "Tidak ada persetujuan yang membutuhkan tindakan Anda.",
    description: "Permintaan persetujuan yang relevan dengan kewenangan Anda akan muncul secara otomatis.",
  },
  documents: {
    title: "Belum ada dokumen yang dapat Anda akses.",
    description: "Dokumen kerja dengan konteks bisnis yang relevan akan tampil di sini sesuai tingkat klasifikasi Anda.",
  },
  reports: {
    title: "Belum ada laporan yang tersedia.",
    description: "Laporan divisi, operasional, atau eksekutif yang telah diterbitkan dapat ditinjau di sini.",
  },
  findings: {
    title: "Belum ada temuan yang dapat Anda akses.",
    description: "Masalah, deviasi operasional, dan rencana tindak lanjut perbaikan akan dicatat pada bagian ini.",
  },
};

interface WorkEmptyStateProps {
  readonly action?: ReactNode;
  readonly description?: string;
  readonly icon?: ReactNode;
  readonly module?: WorkModuleType;
  readonly title?: string;
}

export function WorkEmptyState({
  action,
  description,
  icon,
  module = "projects",
  title,
}: WorkEmptyStateProps) {
  const defaults = defaultMessages[module];
  return (
    <EmptyState
      action={action}
      description={description ?? defaults.description}
      icon={icon ?? <FolderOpen size={36} strokeWidth={1.5} />}
      title={title ?? defaults.title}
    />
  );
}
