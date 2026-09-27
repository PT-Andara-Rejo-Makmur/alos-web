import { Status, type StatusVariant } from "@/components/ui";

import type { FindingStatus } from "./finding-types";

export { FindingSeverityBadge } from "../shared/status/work-status";

export interface FindingStatusInfo {
  readonly label: string;
  readonly variant: StatusVariant;
}

const severityMap: Record<string, FindingStatusInfo> = {
  LOW: { label: "Rendah", variant: "neutral" },
  MEDIUM: { label: "Sedang", variant: "info" },
  HIGH: { label: "Tinggi", variant: "warning" },
  CRITICAL: { label: "Kritis", variant: "danger" },
};

export function getFindingSeverityInfo(severity: string | null | undefined): FindingStatusInfo {
  if (!severity) return { label: "Belum Dinilai", variant: "neutral" };
  const normalized = severity.trim().toUpperCase();
  return severityMap[normalized] ?? { label: "Belum Dinilai", variant: "neutral" };
}

const statusMap: Record<string, FindingStatusInfo> = {
  OPEN: { label: "Terbuka", variant: "warning" },
  IN_REVIEW: { label: "Dalam Peninjauan", variant: "info" },
  ASSIGNED: { label: "Ditugaskan", variant: "info" },
  IN_PROGRESS: { label: "Dalam Perbaikan", variant: "info" },
  PENDING_VERIFICATION: { label: "Menunggu Verifikasi", variant: "warning" },
  VERIFIED: { label: "Terverifikasi", variant: "success" },
  CLOSED: { label: "Ditutup", variant: "neutral" },
  CANCELLED: { label: "Dibatalkan", variant: "neutral" },
  DUPLICATE: { label: "Duplikat", variant: "neutral" },
};

export function getFindingStatusInfo(status: string | null | undefined): FindingStatusInfo {
  if (!status) return { label: "Belum Dinilai", variant: "neutral" };
  const normalized = status.trim().toUpperCase();
  return statusMap[normalized] ?? { label: "Belum Dinilai", variant: "neutral" };
}

export function FindingStatusBadge({
  status,
}: {
  readonly status: FindingStatus | string | null | undefined;
}) {
  const info = getFindingStatusInfo(status);
  return <Status label={info.label} variant={info.variant} />;
}
