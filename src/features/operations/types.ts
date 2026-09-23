import type { Approval } from "@/features/approvals/types";
import type { Finding } from "@/features/findings/types";
import type { Report } from "@/features/reports/types";
import type { OperationalTask } from "@/features/tasks/types";

export type { Approval, ProposedAction } from "@/features/approvals/types";
export type { Finding } from "@/features/findings/types";
export type { Report, ReportDefinition } from "@/features/reports/types";
export type { OperationalTask, TaskList, TaskStatus } from "@/features/tasks/types";

export type OperationalDashboard = {
  generated_at: string;
  scope: string;
  metrics: Record<string, number>;
  tasks: OperationalTask[];
  findings: Finding[];
  approvals: Approval[];
  reports: Report[];
};

export function formatOperationalDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function humanStatus(value: string | null | undefined): string {
  if (!value) return "—";
  return value.toLowerCase().replaceAll("_", " ");
}
