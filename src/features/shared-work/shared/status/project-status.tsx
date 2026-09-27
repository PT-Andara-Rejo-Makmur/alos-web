import type { ReactNode } from "react";
import { CheckCircle2, Clock, AlertCircle, PlayCircle, PauseCircle, Archive } from "lucide-react";

import { Status, type StatusVariant } from "@/components/ui";

import type { CanonicalProjectStatus } from "../types";

interface ProjectStatusBadgeProps {
  readonly status: CanonicalProjectStatus | string | null | undefined;
}

interface StatusConfig {
  readonly icon: ReactNode;
  readonly label: string;
  readonly variant: StatusVariant;
}

const statusMap: Record<string, StatusConfig> = {
  PLANNED: {
    icon: <Clock aria-hidden="true" size={13} strokeWidth={2} />,
    label: "Direncanakan",
    variant: "info",
  },
  ACTIVE: {
    icon: <PlayCircle aria-hidden="true" size={13} strokeWidth={2} />,
    label: "Berjalan",
    variant: "success",
  },
  ON_HOLD: {
    icon: <PauseCircle aria-hidden="true" size={13} strokeWidth={2} />,
    label: "Ditahan",
    variant: "warning",
  },
  COMPLETED: {
    icon: <CheckCircle2 aria-hidden="true" size={13} strokeWidth={2} />,
    label: "Selesai",
    variant: "success",
  },
  CANCELLED: {
    icon: <AlertCircle aria-hidden="true" size={13} strokeWidth={2} />,
    label: "Dibatalkan",
    variant: "danger",
  },
  ARCHIVED: {
    icon: <Archive aria-hidden="true" size={13} strokeWidth={2} />,
    label: "Diarsipkan",
    variant: "neutral",
  },
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  if (!status) {
    return <Status label="Belum Dinilai" variant="neutral" />;
  }

  const normalized = String(status).toUpperCase();
  const config = statusMap[normalized];

  if (!config) {
    return <Status label={status} variant="neutral" />;
  }

  return <Status icon={config.icon} label={config.label} variant={config.variant} />;
}
