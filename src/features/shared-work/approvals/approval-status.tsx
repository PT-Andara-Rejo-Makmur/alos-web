import { Status, type StatusVariant } from "@/components/ui";

import type { ApprovalStatusPresentationValue, ApprovalSubjectType } from "./approval-types";

export interface ApprovalStatusInfo {
  readonly label: string;
  readonly variant: StatusVariant;
}

const statusMap: Record<string, ApprovalStatusInfo> = {
  PENDING: { label: "Menunggu Keputusan", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "success" },
  RETURNED: { label: "Dikembalikan", variant: "warning" },
  REJECTED: { label: "Ditolak", variant: "danger" },
  HELD: { label: "Ditahan", variant: "neutral" },
};

export function getApprovalStatusInfo(status: string | null | undefined): ApprovalStatusInfo {
  if (!status) return { label: "Belum Dinilai", variant: "neutral" };
  const normalized = status.trim().toUpperCase();
  return statusMap[normalized] ?? { label: "Belum Dinilai", variant: "neutral" };
}

export function ApprovalStatusBadge({
  status,
}: {
  readonly status: ApprovalStatusPresentationValue | string | null | undefined;
}) {
  const info = getApprovalStatusInfo(status);
  return <Status label={info.label} variant={info.variant} />;
}

const subjectTypeMap: Record<string, string> = {
  PROJECT: "Proyek",
  TASK: "Tugas",
  DOCUMENT: "Dokumen",
  REPORT: "Laporan",
  FINDING: "Temuan",
  BUDGET: "Anggaran",
  CONTRACT: "Kontrak",
  PAYMENT: "Pembayaran",
};

export function ApprovalSubjectBadge({
  subjectType,
}: {
  readonly subjectType: ApprovalSubjectType | string | null | undefined;
}) {
  if (!subjectType) return <span>—</span>;
  const normalized = subjectType.trim().toUpperCase();
  const label = subjectTypeMap[normalized] ?? subjectType;
  return <Status label={label} variant="neutral" />;
}

export function ApprovalStageBadge({
  stage,
}: {
  readonly stage: string | null | undefined;
}) {
  if (!stage) return <span>—</span>;
  const normalized = stage.trim().toUpperCase();
  switch (normalized) {
    case "REVIEW":
      return <Status label="Tinjauan" variant="info" />;
    case "APPROVAL":
      return <Status label="Keputusan" variant="warning" />;
    case "COMPLETED":
      return <Status label="Selesai" variant="success" />;
    default:
      return <Status label={stage} variant="neutral" />;
  }
}
