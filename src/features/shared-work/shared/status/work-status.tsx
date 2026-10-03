import { severityLabel, statusLabel } from "@/lib/presentation";
import { Status, type StatusVariant } from "@/components/ui";

import type {
  CanonicalDataClassification,
  CanonicalFindingSeverity,
} from "../types";

export function DataClassificationBadge({
  classification,
}: {
  readonly classification: CanonicalDataClassification | string | null | undefined;
}) {
  if (!classification) return <Status label="—" variant="neutral" />;

  switch (classification.toUpperCase()) {
    case "PUBLIC":
      return <Status label="Publik" variant="neutral" />;
    case "INTERNAL":
      return <Status label="Internal" variant="info" />;
    case "CONFIDENTIAL":
      return <Status label="Rahasia" variant="warning" />;
    case "RESTRICTED":
      return <Status label="Sangat Terbatas" variant="danger" />;
    default:
      return <Status label={statusLabel(classification)} variant="neutral" />;
  }
}

export function FindingSeverityBadge({
  severity,
}: {
  readonly severity: CanonicalFindingSeverity | string | null | undefined;
}) {
  if (!severity) return <Status label="—" variant="neutral" />;

  const normalized = severity.toUpperCase();
  const variants: Record<string, StatusVariant> = { LOW: "neutral", MEDIUM: "info", HIGH: "warning", CRITICAL: "danger" };
  return <Status label={severityLabel(normalized)} variant={variants[normalized] ?? "neutral"} />;
}

export function RiskBadge({
  level,
}: {
  readonly level: "RENDAH" | "SEDANG" | "TINGGI" | "KRITIS" | null | undefined;
}) {
  if (!level) return <Status label="Belum Dinilai" variant="neutral" />;

  const variantMap: Record<string, StatusVariant> = {
    RENDAH: "success",
    SEDANG: "info",
    TINGGI: "warning",
    KRITIS: "danger",
  };

  return <Status label={statusLabel(level)} variant={variantMap[level] ?? "neutral"} />;
}
