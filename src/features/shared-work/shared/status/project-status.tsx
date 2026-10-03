import type { ReactNode } from "react";
import { CheckCircle2, Clock, AlertCircle, PlayCircle, PauseCircle, Archive } from "lucide-react";

import { Status, type StatusVariant } from "@/components/ui";
import { statusLabel } from "@/lib/presentation";

import type { CanonicalProjectStatus } from "../types";

interface ProjectStatusBadgeProps {
  readonly status: CanonicalProjectStatus | string | null | undefined;
}

interface StatusConfig {
  readonly icon: ReactNode;
  readonly variant: StatusVariant;
}

const statusMap: Record<string, StatusConfig> = {
  PLANNED: {
    icon: <Clock aria-hidden="true" size={13} strokeWidth={2} />,
    variant: "info",
  },
  ACTIVE: {
    icon: <PlayCircle aria-hidden="true" size={13} strokeWidth={2} />,
    variant: "success",
  },
  ON_HOLD: {
    icon: <PauseCircle aria-hidden="true" size={13} strokeWidth={2} />,
    variant: "warning",
  },
  COMPLETED: {
    icon: <CheckCircle2 aria-hidden="true" size={13} strokeWidth={2} />,
    variant: "success",
  },
  CANCELLED: {
    icon: <AlertCircle aria-hidden="true" size={13} strokeWidth={2} />,
    variant: "danger",
  },
  ARCHIVED: {
    icon: <Archive aria-hidden="true" size={13} strokeWidth={2} />,
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
    return <Status label={statusLabel(normalized)} variant="neutral" />;
  }

  return <Status icon={config.icon} label={statusLabel(normalized)} variant={config.variant} />;
}
