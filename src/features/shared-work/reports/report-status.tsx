import { Status, type StatusVariant } from "@/components/ui";

import type { ReportFrequency, ReportResultStatus } from "./report-types";

export interface ReportStatusInfo {
  readonly label: string;
  readonly variant: StatusVariant;
}

const statusMap: Record<string, ReportStatusInfo> = {
  DRAFT: { label: "Draf", variant: "neutral" },
  IN_REVIEW: { label: "Dalam Review", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "info" },
  PUBLISHED: { label: "Diterbitkan", variant: "success" },
  ARCHIVED: { label: "Diarsipkan", variant: "neutral" },
};

export function getReportStatusInfo(status: string | null | undefined): ReportStatusInfo {
  if (!status) return { label: "Belum Dinilai", variant: "neutral" };
  const normalized = status.trim().toUpperCase();
  return statusMap[normalized] ?? { label: "Belum Dinilai", variant: "neutral" };
}

export function ReportStatusBadge({
  status,
}: {
  readonly status: ReportResultStatus | string | null | undefined;
}) {
  const info = getReportStatusInfo(status);
  return <Status label={info.label} variant={info.variant} />;
}

const frequencyMap: Record<string, string> = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  QUARTERLY: "Kuartalan",
  ON_DEMAND: "Sesuai Permintaan",
};

export function ReportFrequencyBadge({
  frequency,
}: {
  readonly frequency: ReportFrequency | string | null | undefined;
}) {
  if (!frequency) return <span>—</span>;
  const normalized = frequency.trim().toUpperCase();
  const label = frequencyMap[normalized] ?? frequency;
  return <Status label={label} variant="neutral" />;
}
