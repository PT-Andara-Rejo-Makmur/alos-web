import { Status } from "@/components/ui";
import { statusLabel } from "@/lib/presentation";

import type { TaskPriorityPresentationValue, TaskStatusPresentationValue } from "./task-types";

export interface TaskStatusInfo {
  readonly label: string;
  readonly variant: "neutral" | "info" | "success" | "warning" | "danger";
}

const statusVariants: Record<string, TaskStatusInfo["variant"]> = {
  OPEN: "neutral", IN_PROGRESS: "info", BLOCKED: "danger",
  UNDER_REVIEW: "warning", COMPLETED: "success", CANCELLED: "neutral",
};

export function getTaskStatusInfo(status: string | null | undefined): TaskStatusInfo {
  if (!status) return { label: "Belum Dinilai", variant: "neutral" };
  const normalized = status.trim().toUpperCase();
  return { label: statusLabel(normalized), variant: statusVariants[normalized] ?? "neutral" };
}

export function TaskStatusBadge({
  status,
}: {
  readonly status: TaskStatusPresentationValue | string | null | undefined;
}) {
  const info = getTaskStatusInfo(status);
  return <Status label={info.label} variant={info.variant} />;
}

export interface TaskPriorityInfo {
  readonly label: string;
  readonly variant: "neutral" | "info" | "warning" | "danger";
}

const priorityVariants: Record<string, TaskPriorityInfo["variant"]> = {
  LOW: "neutral", NORMAL: "info", HIGH: "warning", CRITICAL: "danger",
};

export function getTaskPriorityInfo(priority: string | null | undefined): TaskPriorityInfo {
  if (!priority) return { label: "—", variant: "neutral" };
  const normalized = priority.trim().toUpperCase();
  return { label: statusLabel(normalized), variant: priorityVariants[normalized] ?? "neutral" };
}

export function TaskPriorityBadge({
  priority,
}: {
  readonly priority: TaskPriorityPresentationValue | string | null | undefined;
}) {
  const info = getTaskPriorityInfo(priority);
  if (info.label === "—") return <span>—</span>;
  return <Status label={info.label} variant={info.variant} />;
}

/**
 * Validates whether a task is truly overdue.
 * Rule: Only true if dueAt is a valid past timestamp AND status proves task is not COMPLETED or CANCELLED.
 */
export function isTaskOverdue(
  dueAt: string | null | undefined,
  status: string | null | undefined,
): boolean {
  if (!dueAt) return false;
  const normalizedStatus = (status ?? "").trim().toUpperCase();
  if (normalizedStatus === "COMPLETED" || normalizedStatus === "CANCELLED") {
    return false;
  }
  try {
    const dueDate = new Date(dueAt);
    if (Number.isNaN(dueDate.getTime())) return false;
    return dueDate.getTime() < Date.now();
  } catch {
    return false;
  }
}

export function formatTaskDueDate(
  dueAt: string | null | undefined,
  status: string | null | undefined,
): { readonly isOverdue: boolean; readonly text: string } {
  if (!dueAt) return { isOverdue: false, text: "—" };
  try {
    const d = new Date(dueAt);
    if (Number.isNaN(d.getTime())) return { isOverdue: false, text: dueAt };
    const text = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const overdue = isTaskOverdue(dueAt, status);
    return { isOverdue: overdue, text };
  } catch {
    return { isOverdue: false, text: dueAt };
  }
}
