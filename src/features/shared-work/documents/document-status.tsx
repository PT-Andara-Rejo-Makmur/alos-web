import { Status, type StatusVariant } from "@/components/ui";

import type { DocumentStatusPresentationValue } from "./document-types";

export interface DocumentStatusInfo {
  readonly label: string;
  readonly variant: StatusVariant;
}

const statusMap: Record<string, DocumentStatusInfo> = {
  DRAFT: { label: "Draf", variant: "neutral" },
  IN_REVIEW: { label: "Dalam Review", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "success" },
  REJECTED: { label: "Ditolak", variant: "danger" },
  RETIRED: { label: "Tidak Berlaku", variant: "neutral" },
};

export function getDocumentStatusInfo(status: string | null | undefined): DocumentStatusInfo {
  if (!status) return { label: "Belum Dinilai", variant: "neutral" };
  const normalized = status.trim().toUpperCase();
  return statusMap[normalized] ?? { label: "Belum Dinilai", variant: "neutral" };
}

export function DocumentStatusBadge({
  status,
}: {
  readonly status: DocumentStatusPresentationValue | string | null | undefined;
}) {
  const info = getDocumentStatusInfo(status);
  return <Status label={info.label} variant={info.variant} />;
}

export function isDocumentExpired(expiryDate: string | null | undefined): boolean {
  if (!expiryDate) return false;
  try {
    const expiry = new Date(expiryDate);
    if (Number.isNaN(expiry.getTime())) return false;
    return expiry.getTime() < Date.now();
  } catch {
    return false;
  }
}
